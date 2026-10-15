// One-off private IGDB partner dump validation; never uploads raw CSV or URLs.
import fs from "node:fs/promises";
import {createReadStream,createWriteStream} from "node:fs";
import os from "node:os";
import path from "node:path";
import {pipeline} from "node:stream/promises";
import {Readable,Transform} from "node:stream";
import {parseIgdbCsv,igdbRef} from "../shared/igdb-dump-csv.js";
import {inspectIgdbDumpRelations} from "../shared/igdb-dump-relations.js";
import {enrichIgdbDumpRelations} from "../shared/igdb-dump-enrichment.js";

const endpointNames=["games","release_dates","covers","alternative_names","game_types","platforms","genres","involved_companies","companies"];
const required={
 games:["id","name","platforms","game_type"],
 release_dates:["id","game","platform","date"],
 covers:["id","game","image_id"],
 alternative_names:["id","game","name"],
 game_types:["id","type"],
 platforms:["id","name"],
 genres:["id","name"],
 involved_companies:["id","game","company","developer","publisher"],
 companies:["id","name"]
};
const id=process.env.IGDB_CLIENT_ID,secret=process.env.IGDB_CLIENT_SECRET;
if(process.env.IGDB_PRIVATE_REAL_DUMP_CONFIRM!=="PRIVATE_TEST_ONLY")throw Error("Explicit private-test confirmation required");
if(!id||!secret)throw Error("IGDB private Actions credentials required");
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),"igdb-private-"));
const reportPath="benchmarks/igdb-private-real-dump-check.json";
async function fetchJson(url,init={}){
 const r=await fetch(url,{...init,signal:AbortSignal.timeout(45_000)});
 if(!r.ok)throw Error("Private IGDB metadata request failed HTTP "+r.status);
 return await r.json();
}
async function getToken(){
 const u=new URL("https://id.twitch.tv/oauth2/token");
 u.searchParams.set("client_id",id);u.searchParams.set("client_secret",secret);u.searchParams.set("grant_type","client_credentials");
 const j=await fetchJson(u,{method:"POST"});
 if(typeof j.access_token!=="string")throw Error("Missing token");
 return j.access_token;
}
async function run(){
 const token=await getToken();
 const headers={"Client-ID":id,Authorization:"Bearer "+token,Accept:"application/json"};
 const files={};
 const formats={};
 for(const endpoint of endpointNames){
  const metadata=await fetchJson("https://api.igdb.com/v4/dumps/"+endpoint,{headers});
  const missing=required[endpoint].filter(k=>!Object.hasOwn(metadata.schema||{},k));
  if(missing.length)throw Error("CSV schema needs review for "+endpoint+" fields: "+missing.join(","));
  // Provider supplies a short-lived S3 signed URL. Never echo/save it in reports.
  const url=new URL(metadata.s3_url);
  if(url.protocol!=="https:"||!(url.hostname==="s3.amazonaws.com"||url.hostname.endsWith(".amazonaws.com")))
   throw Error("IGDB private dump URL host failed allowlist for "+endpoint);
  const res=await fetch(url,{signal:AbortSignal.timeout(15*60*1000)});
  if(!res.ok||!res.body)throw Error("CSV download failed for "+endpoint+" HTTP "+res.status);
  const file=path.join(tmp,endpoint+".csv");
  let bytes=0;
  const ceiling=700*1024*1024;
  const limit=new Transform({transform(chunk,_enc,done){
   bytes+=chunk.length;
   done(bytes>ceiling?new Error("CSV exceeded private download size ceiling"):null,chunk);
  }});
  await pipeline(Readable.fromWeb(res.body),limit,createWriteStream(file,{mode:0o600}));
  if(bytes===0)throw Error("Private CSV empty: "+endpoint);
  files[endpoint]=file;
  formats[endpoint]={bytes,schemaVersion:String(metadata.schema_version||"").slice(0,60)};
  console.log(endpoint+": private CSV received ("+Math.round(bytes/1024)+" KiB), contents not logged");
  await new Promise(resolve=>setTimeout(resolve,300));
 }
 function rows(name){
  return parseIgdbCsv(createReadStream(files[name],{encoding:"utf8",highWaterMark:64*1024}),{requiredColumns:required[name]});
 }
 // Resolve console IDs from *actual private platform rows*, not guessed hardcodes.
 const platformIds={};
 const expected={PS1:["playstation","ps1"],PS2:["playstation 2","ps2"],Dreamcast:["dreamcast","dc"]};
 for await(const p of rows("platforms")){
  const value=String(p.name||"").trim().toLowerCase(),abbr=String(p.abbreviation||"").trim().toLowerCase();
  for(const [label,names] of Object.entries(expected)){
   if(names.includes(value)||names.includes(abbr)){
    const found=igdbRef(p.id);
    if(platformIds[label]&&platformIds[label]!==found)throw Error("Ambiguous IGDB "+label+" platform IDs");
    platformIds[label]=found;
   }
  }
 }
 if(Object.keys(platformIds).length!==3)throw Error("Could not resolve all three game console IDs from private platform dump");
 const base=await inspectIgdbDumpRelations({
  games:rows("games"),releaseDates:rows("release_dates"),covers:rows("covers"),alternativeNames:rows("alternative_names")
 },{platformIds});
 const full=await enrichIgdbDumpRelations(base,{
  gameTypes:rows("game_types"),platforms:rows("platforms"),genres:rows("genres"),
  involvedCompanies:rows("involved_companies"),companies:rows("companies")
 },{platformIds});
 const output={
  checkedAt:new Date().toISOString(),
  mode:full.mode,
  status:"PRIVATE_REAL_CSV_JOIN_COMPLETED",
  downloadedPrivately:true,noSignedUrlsStored:true,noRawCsvInArtifact:true,
  noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,
  recordsExported:false,
  schemas:formats,counts:full.counts,platformStats:full.platformStats,
  typeCounts:full.typeCounts,linkedCompanyRelations:full.linkedCompanyRelations,missing:full.missing
 };
 await fs.mkdir("benchmarks",{recursive:true});
 await fs.writeFile(reportPath,JSON.stringify(output,null,2)+"\n");
 console.log("PRIVATE IGDB REAL CSV TEST COMPLETE: "+JSON.stringify({counts:full.counts,platformStats:full.platformStats,typeCounts:full.typeCounts,missing:full.missing}));
}
try{await run();}
catch(e){
 await fs.mkdir("benchmarks",{recursive:true});
 await fs.writeFile(reportPath,JSON.stringify({mode:"PRIVATE_IGDB_REAL_DUMP_CHECK",status:"FAILED_REVIEW_NEEDED",failureCategory:String(e.message||"").slice(0,220).replace(/https?:\/\/\S+/g,"[URL_REDACTED]"),noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,noRawCsvInArtifact:true},null,2)+"\n");
 console.error("Private IGDB CSV verification stopped; see safe aggregate report. "+String(e.message||"").replace(/https?:\/\/\S+/g,"[URL_REDACTED]"));
 process.exitCode=1;
}finally{await fs.rm(tmp,{recursive:true,force:true});}
