import fs from "node:fs/promises";
import {assessIgdbDumpReadiness, REQUIRED_IGDB_DUMPS} from "../shared/igdb-dump-readiness.js";

const clientId=String(process.env.IGDB_CLIENT_ID||"").trim();
const clientSecret=String(process.env.IGDB_CLIENT_SECRET||"").trim();
if(!clientId||!clientSecret){
  console.error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are required as private Actions secrets.");
  process.exit(1);
}

async function getToken(){
  const url=new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id",clientId);
  url.searchParams.set("client_secret",clientSecret);
  url.searchParams.set("grant_type","client_credentials");
  const res=await fetch(url,{method:"POST",signal:AbortSignal.timeout(20_000)});
  if(!res.ok)throw new Error("Twitch token request failed: HTTP "+res.status);
  const token=(await res.json()).access_token;
  if(typeof token!=="string"||!token)throw new Error("Twitch token was not returned.");
  return token;
}

const token=await getToken();
const base="https://api.igdb.com/v4/dumps";
async function igdbDumpGet(endpoint=""){
  // endpoint comes exclusively from our hard-coded allowlist; do not log raw
  // provider responses or presigned S3 URLs.
  const url=endpoint?base+"/"+endpoint:base;
  const res=await fetch(url,{
    method:"GET",signal:AbortSignal.timeout(20_000),
    headers:{
      "Client-ID":clientId,
      "Authorization":`Bearer ${token}`,
      "Accept":"application/json"
    }
  });
  if(!res.ok)throw new Error("IGDB Data Dump "+(endpoint||"index")+" metadata check failed: HTTP "+res.status);
  return res.json();
}

const rows=await igdbDumpGet();
if(!Array.isArray(rows)||rows.length===0)throw new Error("IGDB /dumps returned no available endpoints.");

// Test each essential data-table schema without downloading its CSV. The
// response also contains a five-minute signed S3 URL: NEVER persist it.
const meta={};
for(const endpoint of Object.keys(REQUIRED_IGDB_DUMPS)){
  if(rows.some(row=>row?.endpoint===endpoint)){
    await new Promise(resolve=>setTimeout(resolve,300)); // stay within IGDB rate limits
    meta[endpoint]=await igdbDumpGet(endpoint);
  }
}
const readiness=assessIgdbDumpReadiness(rows,meta);

const report={
  ...readiness,
  requiredEndpoints:Object.keys(REQUIRED_IGDB_DUMPS),
  endpoints:rows.map(row=>({
    endpoint:row.endpoint,
    fileName:row.file_name||null,
    updatedAt:row.updated_at||null
  })).sort((a,b)=>String(a.endpoint).localeCompare(String(b.endpoint)))
};
await fs.mkdir("benchmarks",{recursive:true});
await fs.writeFile("benchmarks/igdb-data-dump-access.json",JSON.stringify(report,null,2)+"\n","utf8");
console.log(`IGDB Data Dumps listed: ${report.dumpCount} endpoints.`);
for(const row of report.inspected){
  console.log(`${row.endpoint}: ${row.status}${row.missingFields.length?" (missing: "+row.missingFields.join(", ")+")":""}`);
}
console.log("Only metadata checked; no CSV, game rows, images or signed download links saved.");
if(!report.metadataReady){
  console.error("IGDB dump schema needs review before building the CSV importer.");
  process.exitCode=1;
}else{
  console.log("Essential CSV table schemas appear ready for a separate, private CSV-import prototype.");
}
