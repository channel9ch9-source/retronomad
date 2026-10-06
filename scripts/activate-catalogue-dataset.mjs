import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import process from "node:process";
import { sqlString } from "./catalogue-promotion-core.mjs";

function arg(name,fallback=null){
  const prefix="--"+name+"=";
  return process.argv.find(x=>x.startsWith(prefix))?.slice(prefix.length)??fallback;
}
const manifestPath=arg("manifest");
const config=arg("config",".wrangler.deploy.jsonc");
const local=process.argv.includes("--local");
const persist=arg("persist-to",null);
if(!manifestPath){console.error("Usage: node scripts/activate-catalogue-dataset.mjs --manifest=<manifest.json> [--local]");process.exit(2);}
if(local){
  if(process.env.CATALOGUE_PROMOTION_CONFIRM!=="LOCAL_TEST")throw new Error("Local activation requires CATALOGUE_PROMOTION_CONFIRM=LOCAL_TEST");
}else{
  if(process.env.IGDB_COMMERCIAL_APPROVED!=="true")throw new Error("Remote activation blocked: IGDB_COMMERCIAL_APPROVED is not true");
  if(process.env.CATALOGUE_PROMOTION_CONFIRM!=="PROMOTE_IGDB_CATALOGUE")throw new Error("Remote activation blocked: confirmation phrase missing");
}
const manifest=JSON.parse(await fs.readFile(manifestPath,"utf8"));
const id=manifest.datasetId;
const bin=process.platform==="win32"?"npx.cmd":"npx";
function run(command){
  const args=["wrangler","d1","execute","DB",local?"--local":"--remote","--config",config,"--command",command,"--json"];
  if(local&&persist)args.push("--persist-to",persist);
  return JSON.parse(execFileSync(bin,args,{encoding:"utf8",stdio:["ignore","pipe","inherit"],env:process.env}));
}
function findRows(value){
  if(Array.isArray(value)){for(const x of value){const r=findRows(x);if(r)return r;}return null;}
  if(value&&Array.isArray(value.results))return value.results;
  if(value?.result&&Array.isArray(value.result.results))return value.result.results;
  return null;
}
const verifySql=`SELECT d.checksum_sha256,
 (SELECT COUNT(*) FROM catalogue_v2_games WHERE dataset_id=d.id) AS games,
 (SELECT COUNT(*) FROM catalogue_v2_aliases WHERE dataset_id=d.id) AS aliases,
 (SELECT COUNT(*) FROM catalogue_v2_external_refs WHERE dataset_id=d.id) AS refs,
 (SELECT COUNT(*) FROM catalogue_v2_artwork WHERE dataset_id=d.id) AS artwork
 FROM catalogue_datasets d WHERE d.id=${sqlString(id)}`;
const rows=findRows(run(verifySql))||[];
if(rows.length!==1)throw new Error("Dataset is not staged");
const row=rows[0];
if(String(row.checksum_sha256)!==manifest.checksumSha256||
 Number(row.games)!==manifest.counts.games||
 Number(row.aliases)!==manifest.counts.aliases||
 Number(row.refs)!==manifest.counts.externalRefs||
 Number(row.artwork)!==manifest.counts.artwork){
  throw new Error("Dataset verification failed; activation aborted");
}
const oldRows=findRows(run("SELECT dataset_id,activated_at FROM catalogue_active_dataset WHERE singleton_id=1"))||[];
const previous=oldRows[0]?.dataset_id||null;
const activate=`INSERT INTO catalogue_active_dataset(singleton_id,dataset_id,activated_at)
 VALUES(1,${sqlString(id)},CURRENT_TIMESTAMP)
 ON CONFLICT(singleton_id) DO UPDATE SET dataset_id=excluded.dataset_id,activated_at=excluded.activated_at`;
run(activate);
const activeRows=findRows(run("SELECT dataset_id,activated_at FROM catalogue_active_dataset WHERE singleton_id=1"))||[];
if(activeRows[0]?.dataset_id!==id)throw new Error("Activation pointer verification failed");
const result={ok:true,datasetId:id,previousDatasetId:previous,activatedAt:activeRows[0]?.activated_at||null,local};
await fs.writeFile(arg("result","promotion-output/activation-result.json"),JSON.stringify(result,null,2)+"\n","utf8");
console.log(JSON.stringify(result,null,2));
