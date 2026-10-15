// Partner-authorised one-time PRIVATE test against complete IGDB Data Dump CSVs.
// Must run on ephemeral CI runner with private IGDB Actions secrets; never persist
// licensed dump files in repository, Cloudflare, build assets or Actions artifacts.
import {createWriteStream,createReadStream} from "node:fs";
import {mkdtemp,rm,stat} from "node:fs/promises";
import {pipeline} from "node:stream/promises";
import {Readable,Transform} from "node:stream";
import os from "node:os";
import path from "node:path";
import {parseIgdbCsv} from "../shared/igdb-dump-csv.js";
import {inspectIgdbDumpRelations} from "../shared/igdb-dump-relations.js";
import {enrichIgdbDumpRelations} from "../shared/igdb-dump-enrichment.js";

if(process.env.IGDB_PRIVATE_FULL_DUMP_CONFIRM!=="YES_PRIVATE_NONPUBLISHING_TEST")
 throw new Error("Explicit private-only test gate missing");
const clientId=String(process.env.IGDB_CLIENT_ID||"");
const clientSecret=String(process.env.IGDB_CLIENT_SECRET||"");
if(!clientId||!clientSecret)throw new Error("Private IGDB credentials absent");
const names=["games","release_dates","covers","alternative_names","game_types","platforms","genres","involved_companies","companies"];
const required={
 games:["id","name","platforms","game_type","genres","involved_companies","cover"],
 release_dates:["id","game","platform","date"],
 covers:["id","game","image_id"],
 alternative_names:["id","game","name"],
 game_types:["id","type"],
 platforms:["id","name"],
 genres:["id","name"],
 involved_companies:["id","game","company","developer","publisher"],
 companies:["id","name"]
};
const MAX_EACH=400*1024*1024,MAX_TOTAL=950*1024*1024;
const login=new URL("https://id.twitch.tv/oauth2/token");
login.searchParams.set("client_id",clientId);
login.searchParams.set("client_secret",clientSecret);
login.searchParams.set("grant_type","client_credentials");
const auth=await fetch(login,{method:"POST",signal:AbortSignal.timeout(20000)});
if(!auth.ok)throw new Error("Twitch login HTTP "+auth.status);
const token=(await auth.json()).access_token;
if(!token)throw new Error("Empty partner token");

async function getMetadata(endpoint){
 const res=await fetch("https://api.igdb.com/v4/dumps/"+endpoint,{
  headers:{"Client-ID":clientId,Authorization:"Bearer "+token,Accept:"application/json"},
  signal:AbortSignal.timeout(25000)
 });
 if(!res.ok)throw new Error("IGDB metadata failed for "+endpoint+" (HTTP "+res.status+")");
 return res.json();
}
function safeSignedS3(value){
 const u=new URL(String(value||""));
 if(u.protocol!=="https:"||!(u.hostname==="amazonaws.com"||u.hostname.endsWith(".amazonaws.com")))
  throw new Error("Unrecognised IGDB presigned data host");
 return u.toString();
}
async function download(url,destination,remaining){
 const response=await fetch(url,{signal:AbortSignal.timeout(150000)});
 if(!response.ok)throw new Error("Partner CSV fetch failed HTTP "+response.status);
 if(!response.body)throw new Error("Partner CSV response had no stream");
 let count=0;
 const limiter=new Transform({
  transform(chunk,_,done){
   count+=chunk.length;
   if(count>MAX_EACH||count>remaining)done(new Error("Partner CSV exceeded private runner size ceiling"));
   else done(null,chunk);
  }
 });
 await pipeline(Readable.fromWeb(response.body),limiter,createWriteStream(destination,{mode:0o600,flags:"wx"}));
 return count;
}
const folder=await mkdtemp(path.join(os.tmpdir(),"igdb-private-csv-"));
const paths={};
const versions={};
let totalBytes=0;
try{
 for(const endpoint of names){
  const meta=await getMetadata(endpoint);
  const missing=required[endpoint].filter(name=>!Object.hasOwn(meta.schema||{},name));
  if(missing.length)throw new Error("CSV schema changed in "+endpoint+"; missing "+missing.join(","));
  if(!Number.isFinite(Number(meta.size_bytes))||Number(meta.size_bytes)>MAX_EACH||Number(meta.size_bytes)>MAX_TOTAL-totalBytes)
   throw new Error("Private CSV size budget exceeded by "+endpoint+"; stop without download");
  const file=path.join(folder,endpoint+".csv");
  const bytes=await download(safeSignedS3(meta.s3_url),file,MAX_TOTAL-totalBytes);
  totalBytes+=bytes;
  paths[endpoint]=file;
  versions[endpoint]=String(meta.schema_version??"");
  // No URLs, file paths, raw rows or game titles printed.
  console.log(endpoint+": private CSV downloaded ("+Math.ceil(bytes/1048576)+" MiB rounded)");
  await new Promise(resolve=>setTimeout(resolve,300));
 }
 const read=(name)=>parseIgdbCsv(createReadStream(paths[name],{encoding:"utf8",highWaterMark:64*1024}),{requiredColumns:required[name]});
 const selected={PS1:7,PS2:8,Dreamcast:23}; // checked against the actual platforms table below
 const base=await inspectIgdbDumpRelations({
  games:read("games"),releaseDates:read("release_dates"),
  covers:read("covers"),alternativeNames:read("alternative_names")
 },{platformIds:selected});
 const final=await enrichIgdbDumpRelations(base,{
  gameTypes:read("game_types"),platforms:read("platforms"),
  genres:read("genres"),involvedCompanies:read("involved_companies"),
  companies:read("companies")
 },{platformIds:selected});
 const summary={
  mode:"PRIVATE_IGDB_NINE_DUMP_FULL_JOIN_TEST",
  realCsvFiles:9,
  totalCsvMiBRounded:Math.ceil(totalBytes/1048576),
  schemaVersions:versions,
  counts:final.counts,
  platformStats:final.platformStats,
  typeCounts:final.typeCounts,
  linkedCompanyRelations:final.linkedCompanyRelations,
  missing:final.missing,
  rawRowsExported:0,rawCsvArtifactUploaded:false,
  productionDatasetModified:false,publicSiteModified:false,
  commercialApprovalUnchanged:true
 };
 console.log(JSON.stringify(summary,null,2));
 if(!final.counts.selectedGames)throw new Error("No selected console games in actual IGDB dump");
 if(!final.typeCounts.INCLUDE_CANDIDATE)throw new Error("No safe candidate game types resolved");
}finally{
 await rm(folder,{recursive:true,force:true,maxRetries:2});
 console.log("Temporary private CSV files removed.");
}