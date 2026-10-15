// One-off private IGDB partner dump validation; never uploads raw CSV or URLs.
import fs from "node:fs/promises";
import {createReadStream,createWriteStream} from "node:fs";
import os from "node:os";
import path from "node:path";
import {pipeline} from "node:stream/promises";
import {spawn} from "node:child_process";
import {Readable,Transform} from "node:stream";
import {parseIgdbCsv,igdbRef} from "../shared/igdb-dump-csv.js";
import {inspectIgdbDumpRelations} from "../shared/igdb-dump-relations.js";
import {enrichIgdbDumpRelations} from "../shared/igdb-dump-enrichment.js";
import {reconcileIgdbCatalogueParity,selectPalScoutParitySeeds} from "../shared/igdb-catalogue-parity.js";
import {preparePrivateParityRecheck,summarizePrivateParityRecheck} from "../shared/igdb-private-parity-recheck.js";
import {resolveIgdbParityOutcome} from "../shared/igdb-parity-verdict.js";

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
const parityFlag=String(process.env.IGDB_PRIVATE_PARITY_CONFIRM||"");
if(parityFlag && parityFlag!=="PRIVATE_CSV_API_PARITY_ONLY")throw Error("Unrecognised private parity gate");
const doParity=parityFlag==="PRIVATE_CSV_API_PARITY_ONLY";
if(process.env.IGDB_PRIVATE_REAL_DUMP_CONFIRM!=="PRIVATE_TEST_ONLY")throw Error("Explicit private-test confirmation required");
if(!id||!secret)throw Error("IGDB private Actions credentials required");
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),"igdb-private-"));
const reportPath="benchmarks/igdb-private-real-dump-check.json";
const parityReportPath="benchmarks/igdb-private-catalogue-parity.json";
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
 if(doParity){
  // The repository canonical source was expanded on 12 October; it is NOT
  // an appropriate 8k-entry seed for recreating the original API dry run.
  // Use only the 100 protected PALScout seeds and always restore the
  // canonical file on the ephemeral runner before emitting an audit result.
  const day=new Date().toISOString().slice(0,10);
  const candidatePath="benchmarks/igdb-dry-import-proposed-"+day+".json";
  const apiReviewPath="benchmarks/igdb-dry-import-review-"+day+".json";
  const canonicalPath="catalogue/base-catalogue.json";
  const existingText=await fs.readFile(canonicalPath,"utf8");
  const existing=JSON.parse(existingText);
  const seedCatalogue=selectPalScoutParitySeeds(existing);
  try{
   // Temporarily substitute just the historical seed set for the PRIVATE
   // child process; no git push, D1, upload or production deployment.
   await fs.writeFile(canonicalPath,JSON.stringify(seedCatalogue)+"\n",{mode:0o600});
   const exitCode=await new Promise((resolve,reject)=>{
    // The old dry importer can print licensed row titles in exception paths.
    const child=spawn(process.execPath,["scripts/igdb-dry-import.mjs"],{
     stdio:"ignore",env:process.env,signal:AbortSignal.timeout(25*60*1000)
    });
    child.once("error",reject);
    child.once("close",resolve);
   });
   if(exitCode!==0)throw Error("Private seed-only API candidate rebuild failed");
   const [apiCatalogue,mappings,apiDryReview]=await Promise.all([
    fs.readFile(candidatePath,"utf8").then(JSON.parse),
    fs.readFile("catalogue/provider-mappings/igdb.json","utf8").then(JSON.parse),
    fs.readFile(apiReviewPath,"utf8").then(JSON.parse)
   ]);
   const parity=reconcileIgdbCatalogueParity({
    csvRecords:full.records,apiCatalogue,seedCatalogue,mappings,apiDryReview
   });
   if(parity.checks.selectedCsvMissingFromApi||parity.checks.apiRefsAbsentFromCsv){
    // Only unmatched IDs are queried privately, in batches below IGDB's
    // documented maximum. No raw URLs, titles, source IDs or payloads logged.
    const targets=preparePrivateParityRecheck(full.records,apiCatalogue);
    try{
     const got=[];
     for(let i=0;i<targets.ids.length;i+=80){
      const batch=targets.ids.slice(i,i+80);
      const response=await fetch("https://api.igdb.com/v4/games",{
       method:"POST",
       headers:{"Client-ID":id,Authorization:"Bearer "+token,"Content-Type":"text/plain",Accept:"application/json"},
       body:"fields id,platforms; where id = ("+batch.join(",")+"); limit 500;",
       signal:AbortSignal.timeout(45_000)
      });
      if(!response.ok)throw Error("PRIVATE_BY_ID_FETCH_FAILURE");
      const page=await response.json();
      if(!Array.isArray(page))throw Error("PRIVATE_BY_ID_RESPONSE_NOT_ARRAY");
      got.push(...page);
      await new Promise(resolve=>setTimeout(resolve,300));
     }
     parity.diagnostics.liveApiByIdRecheck=summarizePrivateParityRecheck(targets,got,{platformIds});
    }catch{
     // A transient lookup failure is not permission to accept mismatches.
     parity.diagnostics.liveApiByIdRecheck={
      status:"TARGETED_PRIVATE_API_ID_RECHECK_UNAVAILABLE",
      noRawIdsExported:true,noCanonicalChanges:true
     };
    }
   }
   const verdict=resolveIgdbParityOutcome(parity);
   parity.verdict=verdict;
   // A reconciled result is evidence of deliberate holds, not exact parity:
   // keep CSV source/promotion gates independent of this diagnostic.
   parity.status=verdict.status;
   await fs.writeFile(parityReportPath,JSON.stringify({
    ...parity,checkedAt:new Date().toISOString(),
    apiCandidateRegeneratedPrivately:true,apiCandidateBuiltFrom100PalScoutSeeds:true,
    originalRepositoryCatalogueEntries:existing.games.length,
    csvAndApiComparedOnSameRunner:true,publishedCatalogueUnchanged:true
   },null,2)+"\n",{mode:0o600});
   console.log("PRIVATE CSV/API PARITY "+parity.status+" (aggregate only): "+
    JSON.stringify({apiEntries:parity.apiCandidateCount,
      csvGames:parity.csvAttachedUniqueGames,checks:parity.checks,
      diagnostics:parity.diagnostics,platforms:parity.platforms,
      failedChecks:parity.failedChecks}));
   if(!["PARITY_PASS","RECONCILED_WITH_REVIEW_HOLDS"].includes(parity.status))process.exitCode=1;
  }finally{
   await fs.writeFile(canonicalPath,existingText,{mode:0o600});
   await Promise.all([candidatePath,apiReviewPath].map(file=>fs.rm(file,{force:true})));
  }
 }

}
try{await run();}
catch(e){
 await fs.mkdir("benchmarks",{recursive:true});
 await fs.writeFile(reportPath,JSON.stringify({mode:"PRIVATE_IGDB_REAL_DUMP_CHECK",status:"FAILED_REVIEW_NEEDED",failureCategory:String(e.message||"").slice(0,220).replace(/https?:\/\/\S+/g,"[URL_REDACTED]"),noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,noRawCsvInArtifact:true},null,2)+"\n");
 if(doParity)await fs.writeFile(parityReportPath,JSON.stringify({
  mode:"PRIVATE_IGDB_CSV_API_CANONICAL_PARITY",status:"RUN_FAILED_REVIEW_NEEDED",
  // Never copy provider title, URL, token, or untrusted exception detail into parity artifact.
  failureCategory:"PRIVATE_RUNNER_OR_SOURCE_ERROR",aggregateOnly:true,noRawProviderRecords:true,
  noCanonicalChanges:true,noD1Changes:true,commercialApprovalUnchanged:true
 },null,2)+"\n");
 if(doParity)console.error("Private CSV/API parity runner stopped; source details are suppressed. See aggregate-only artifact.");
 else console.error("Private IGDB CSV verification stopped; see safe aggregate report. "+String(e.message||"").replace(/https?:\/\/\S+/g,"[URL_REDACTED]"));
 process.exitCode=1;
}finally{await fs.rm(tmp,{recursive:true,force:true});}
