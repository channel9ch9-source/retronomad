// Manual/private IGDB real-dump format probe. No raw rows or presigned URLs leave memory.
// Reads only a bounded CSV prefix from each freshly signed partner dump.
import {parseIgdbCsv} from "../shared/igdb-dump-csv.js";

const FIELDS=Object.freeze({
 games:["id","name","platforms","game_type","genres","involved_companies","cover"],
 game_types:["id","type"],
 platforms:["id","name"],
 release_dates:["id","game","platform","date"],
 covers:["id","game","image_id"],
 alternative_names:["id","game","name"],
 genres:["id","name"],
 involved_companies:["id","game","company","developer","publisher"],
 companies:["id","name"]
});
const MAX_BYTES=384*1024;
const clientId=process.env.IGDB_CLIENT_ID;
const clientSecret=process.env.IGDB_CLIENT_SECRET;
if(!clientId||!clientSecret)throw new Error("Private IGDB Actions credentials required");
const login=new URL("https://id.twitch.tv/oauth2/token");
login.searchParams.set("client_id",clientId);
login.searchParams.set("client_secret",clientSecret);
login.searchParams.set("grant_type","client_credentials");
const auth=await fetch(login,{method:"POST",signal:AbortSignal.timeout(20000)});
if(!auth.ok)throw new Error("IGDB login failed HTTP "+auth.status);
const token=(await auth.json()).access_token;
if(typeof token!=="string"||!token)throw new Error("IGDB login did not provide token");
function safeDownloadUrl(value){
 const u=new URL(value);
 if(u.protocol!=="https:" || !(u.hostname==="amazonaws.com"||u.hostname.endsWith(".amazonaws.com")))
   throw new Error("IGDB returned an unrecognised CSV download host; manual security review required");
 return u.toString();
}
async function metadata(name){
 const res=await fetch("https://api.igdb.com/v4/dumps/"+name,{
  headers:{"Client-ID":clientId,Authorization:"Bearer "+token,Accept:"application/json"},
  signal:AbortSignal.timeout(20000)
 });
 if(!res.ok)throw new Error(name+" metadata request failed HTTP "+res.status);
 return res.json();
}
async function sample(url){
 const response=await fetch(url,{
  headers:{Range:"bytes=0-"+(MAX_BYTES-1)},
  signal:AbortSignal.timeout(45000)
 });
 if(!response.ok)throw new Error("IGDB signed CSV sample request failed HTTP "+response.status);
 // A server ignoring Range might return 200/full body; stop reading after MAX_BYTES.
 const reader=response.body?.getReader();
 if(!reader)throw new Error("CSV response had no stream");
 const chunks=[];let size=0;
 try{
  while(size<MAX_BYTES){
   const {done,value}=await reader.read();
   if(done)break;
   const slice=value.slice(0,MAX_BYTES-size);
   chunks.push(slice);size+=slice.byteLength;
  }
 }finally{await reader.cancel().catch(()=>{});}
 const merged=Buffer.concat(chunks.map(x=>Buffer.from(x)));
 return new TextDecoder("utf-8",{fatal:true}).decode(merged);
}
function trimCompleteCsvRows(s){
 // A quoted cell may span newlines. Find last complete record boundary.
 let quoted=false,last=-1;
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(c==='"'){
   if(quoted && s[i+1]==='"'){i++;continue;}
   quoted=!quoted;
  }else if(!quoted && (c==="\r"||c==="\n")){
   last=i+1;
   if(c==="\r"&&s[i+1]==="\n"){last=i+2;i++;}
  }
 }
 if(last<0)throw new Error("CSV sample has no complete header/record boundary");
 return s.slice(0,last);
}
function shape(value){
 const s=String(value??"").trim();
 if(!s)return "EMPTY";
 if(s==="[]")return "EMPTY_ARRAY";
 if(s.startsWith("[")&&s.endsWith("]")){
  try{return Array.isArray(JSON.parse(s))?"JSON_ARRAY":"BRACKETED_OTHER"}catch{return "BRACKETED_OTHER";}
 }
 if(s.startsWith("{")&&s.endsWith("}"))return "BRACE_ARRAY";
 if(/^[0-9]+$/.test(s))return "NUMERIC";
 if(/^\d{4}-\d{2}-\d{2}/.test(s))return "ISO_DATE";
 return "OTHER";
}
const report={mode:"IGDB_PRIVATE_REAL_CSV_FORMAT_SAMPLE",checkedAt:new Date().toISOString(),noRawRowsRetained:true,noSignedUrlsRetained:true,noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,readOnly:true,perTable:[]};
for(const [name,expected] of Object.entries(FIELDS)){
 const meta=await metadata(name);
 const schema=meta.schema||{};
 const missing=expected.filter(k=>!Object.hasOwn(schema,k));
 const result={endpoint:name,schemaVersion:String(meta.schema_version??"").slice(0,60),
  requiredColumnsPresent:missing.length===0,missingColumns:missing,bytesSampleLimit:MAX_BYTES};
 if(missing.length){report.perTable.push({...result,status:"SCHEMA_REVIEW"});continue;}
 const text=await sample(safeDownloadUrl(meta.s3_url));
 const safe=trimCompleteCsvRows(text);
 const rows=[];
 for await(const row of parseIgdbCsv([safe],{requiredColumns:expected})){
  if(rows.length<16)rows.push(row);
 }
 const examples={};
 for(const key of expected){
  examples[key]=[...new Set(rows.map(row=>shape(row[key])))].sort();
 }
 result.status="SAMPLED";result.sampledRows=rows.length;result.valueShapes=examples;
 report.perTable.push(result);
 // Do not log provider values, raw CSV, HTTP response bodies or signed URLs.
 console.log(name+": "+result.status+" ("+result.sampledRows+" early CSV rows, schema checked)");
 await new Promise(resolve=>setTimeout(resolve,325));
}
const ok=report.perTable.every(x=>x.status==="SAMPLED"&&x.sampledRows>0);
console.log(JSON.stringify({mode:report.mode,allSamplesParsed:ok,perTable:report.perTable,noRawRowsRetained:true,noSignedUrlsRetained:true},null,2));
if(!ok)process.exitCode=1;