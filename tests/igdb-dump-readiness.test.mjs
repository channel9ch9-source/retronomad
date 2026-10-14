import test from "node:test";
import assert from "node:assert/strict";
import {assessIgdbDumpReadiness,REQUIRED_IGDB_DUMPS} from "../shared/igdb-dump-readiness.js";

const listing=Object.keys(REQUIRED_IGDB_DUMPS).map((endpoint,i)=>({
 endpoint,file_name:"12345_"+endpoint+".csv",updated_at:1720000000+i
}));
function metadata(){
 return Object.fromEntries(Object.entries(REQUIRED_IGDB_DUMPS).map(([endpoint,fields])=>[
  endpoint,{
   endpoint, schema:Object.fromEntries(fields.map(f=>[f,"LONG"])),schema_version:"2026-10",
   size_bytes:123456, updated_at:1720000000,
   // The IGDB endpoint includes a presigned URL; reports must NEVER include this.
   s3_url:"https://private-example.s3.amazonaws.com/secret.csv?X-Amz-Signature=NEVER_LEAK"
  }
 ]));
}

test("metadata-only readiness report passes complete listed schemas and does not leak signed URLs",()=>{
 const report=assessIgdbDumpReadiness(listing,metadata(),"2026-10-14T12:00:00.000Z");
 assert.equal(report.requiredAvailable,true);
 assert.equal(report.metadataReady,true);
 assert.equal(report.noCsvDownloaded,true);
 assert.equal(report.noSignedUrlsStored,true);
 assert.equal(report.noCanonicalChanges,true);
 assert.equal(report.inspected.length,4);
 assert.ok(report.inspected.every(row=>row.status==="SCHEMA_READY"&&row.missingFields.length===0));
 assert.doesNotMatch(JSON.stringify(report),/NEVER_LEAK|s3_url|X-Amz|private-example|secret\.csv/);
});

test("field removed from a required dump is flagged rather than publishing a broken catalogue",()=>{
 const obj=metadata();
 delete obj.release_dates.schema.platform;
 const report=assessIgdbDumpReadiness(listing,obj);
 assert.equal(report.metadataReady,false);
 assert.equal(report.inspected.find(x=>x.endpoint==="release_dates").status,"SCHEMA_REVIEW");
 assert.deepEqual(report.inspected.find(x=>x.endpoint==="release_dates").missingFields,["platform"]);
});

test("missing endpoint and missing schema are separately flagged",()=>{
 const list=listing.filter(x=>x.endpoint!=="covers");
 const obj=metadata(); delete obj.alternative_names;
 const report=assessIgdbDumpReadiness(list,obj);
 assert.equal(report.requiredAvailable,false);
 assert.equal(report.metadataReady,false);
 assert.equal(report.inspected.find(x=>x.endpoint==="covers").status,"MISSING_DUMP");
 assert.equal(report.inspected.find(x=>x.endpoint==="alternative_names").status,"METADATA_UNAVAILABLE");
});
