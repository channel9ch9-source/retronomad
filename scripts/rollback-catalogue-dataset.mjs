import { execFileSync } from "node:child_process";
import process from "node:process";
import { sqlString } from "./catalogue-promotion-core.mjs";

function arg(name,fallback=null){
  const prefix="--"+name+"=";
  return process.argv.find(x=>x.startsWith(prefix))?.slice(prefix.length)??fallback;
}
const datasetId=arg("dataset-id");
const config=arg("config",".wrangler.deploy.jsonc");
const local=process.argv.includes("--local");
const persist=arg("persist-to",null);
if(!datasetId){console.error("Usage: node scripts/rollback-catalogue-dataset.mjs --dataset-id=<id> [--local]");process.exit(2);}
if(local){
  if(process.env.CATALOGUE_ROLLBACK_CONFIRM!=="LOCAL_ROLLBACK")throw new Error("Local rollback requires CATALOGUE_ROLLBACK_CONFIRM=LOCAL_ROLLBACK");
}else{
  if(process.env.CATALOGUE_ROLLBACK_CONFIRM!=="ROLLBACK_CATALOGUE")throw new Error("Remote rollback blocked: confirmation phrase missing");
}
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
const rows=findRows(run(`SELECT id,checksum_sha256,game_count FROM catalogue_datasets WHERE id=${sqlString(datasetId)}`))||[];
if(rows.length!==1)throw new Error("Rollback dataset does not exist: "+datasetId);
const old=findRows(run("SELECT dataset_id FROM catalogue_active_dataset WHERE singleton_id=1"))||[];
const previous=old[0]?.dataset_id||null;
run(`INSERT INTO catalogue_active_dataset(singleton_id,dataset_id,activated_at)
 VALUES(1,${sqlString(datasetId)},CURRENT_TIMESTAMP)
 ON CONFLICT(singleton_id) DO UPDATE SET dataset_id=excluded.dataset_id,activated_at=excluded.activated_at`);
const active=findRows(run("SELECT dataset_id,activated_at FROM catalogue_active_dataset WHERE singleton_id=1"))||[];
if(active[0]?.dataset_id!==datasetId)throw new Error("Rollback pointer verification failed");
console.log(JSON.stringify({ok:true,from:previous,to:datasetId,activatedAt:active[0]?.activated_at||null,local},null,2));
