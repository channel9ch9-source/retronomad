import fs from "node:fs/promises";

const clientId=String(process.env.IGDB_CLIENT_ID||"").trim();
const clientSecret=String(process.env.IGDB_CLIENT_SECRET||"").trim();
if(!clientId||!clientSecret){
  console.error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are required.");
  process.exit(1);
}

async function getToken(){
  const url=new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id",clientId);
  url.searchParams.set("client_secret",clientSecret);
  url.searchParams.set("grant_type","client_credentials");
  const res=await fetch(url,{method:"POST"});
  if(!res.ok)throw new Error(`Twitch token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

const token=await getToken();
const res=await fetch("https://api.igdb.com/v4/dumps",{
  headers:{
    "Client-ID":clientId,
    "Authorization":`Bearer ${token}`,
    "Accept":"application/json"
  }
});
if(!res.ok)throw new Error(`IGDB /dumps failed: ${res.status} ${await res.text()}`);
const rows=await res.json();
if(!Array.isArray(rows)||!rows.length)throw new Error("IGDB /dumps returned no available dumps.");

const byEndpoint=new Map(rows.map(row=>[String(row.endpoint||""),row]));
const required=["games","release_dates","covers","alternative_names"];
const missing=required.filter(name=>!byEndpoint.has(name));
if(missing.length)throw new Error("Required IGDB data dumps missing: "+missing.join(", "));

const report={
  checkedAt:new Date().toISOString(),
  dumpCount:rows.length,
  requiredEndpoints:required,
  requiredAvailable:missing.length===0,
  endpoints:rows.map(row=>({
    endpoint:row.endpoint,
    fileName:row.file_name||null,
    updatedAt:row.updated_at||null
  })).sort((a,b)=>String(a.endpoint).localeCompare(String(b.endpoint)))
};

await fs.mkdir("benchmarks",{recursive:true});
await fs.writeFile("benchmarks/igdb-data-dump-access.json",JSON.stringify(report,null,2)+"\n","utf8");
console.log(`IGDB Data Dumps enabled: ${rows.length} endpoints available.`);
console.log("Required catalogue dumps present: "+required.join(", "));
