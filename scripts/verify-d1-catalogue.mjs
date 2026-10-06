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
const mode=process.argv.includes("--remote")?"--remote":"--local";
const persist=arg("persist-to",null);
const expectActive=process.argv.includes("--expect-active");
if(!manifestPath){console.error("Usage: node scripts/verify-d1-catalogue.mjs --manifest=<manifest.json> [--local|--remote]");process.exit(2);}
const manifest=JSON.parse(await fs.readFile(manifestPath,"utf8"));
const id=manifest.datasetId;
const command=`
SELECT d.id,d.checksum_sha256,d.game_count,d.alias_count,d.external_ref_count,d.artwork_count,
 (SELECT COUNT(*) FROM catalogue_v2_games g WHERE g.dataset_id=d.id) AS actual_games,
 (SELECT COUNT(*) FROM catalogue_v2_aliases a WHERE a.dataset_id=d.id) AS actual_aliases,
 (SELECT COUNT(*) FROM catalogue_v2_external_refs r WHERE r.dataset_id=d.id) AS actual_refs,
 (SELECT COUNT(*) FROM catalogue_v2_artwork w WHERE w.dataset_id=d.id) AS actual_artwork,
 (SELECT dataset_id FROM catalogue_active_dataset WHERE singleton_id=1) AS active_dataset
FROM catalogue_datasets d WHERE d.id=${sqlString(id)};
`.trim();

const bin=process.platform==="win32"?"npx.cmd":"npx";
const args=["wrangler","d1","execute","DB",mode,"--config",config,"--command",command,"--json"];
if(mode==="--local"&&persist)args.push("--persist-to",persist);
const raw=execFileSync(bin,args,{encoding:"utf8",stdio:["ignore","pipe","inherit"],env:process.env});
const parsed=JSON.parse(raw);
function rows(value){
  if(Array.isArray(value)){
    for(const item of value){const found=rows(item);if(found)return found;}
    return null;
  }
  if(value&&Array.isArray(value.results))return value.results;
  if(value?.result&&Array.isArray(value.result.results))return value.result.results;
  return null;
}
const resultRows=rows(parsed)||[];
if(resultRows.length!==1)throw new Error("Expected exactly one staged dataset row, got "+resultRows.length);
const row=resultRows[0];
const checks=[
  ["checksum",String(row.checksum_sha256),String(manifest.checksumSha256)],
  ["games",Number(row.actual_games),Number(manifest.counts.games)],
  ["aliases",Number(row.actual_aliases),Number(manifest.counts.aliases)],
  ["external refs",Number(row.actual_refs),Number(manifest.counts.externalRefs)],
  ["artwork",Number(row.actual_artwork),Number(manifest.counts.artwork)]
];
const failures=checks.filter(([,actual,expected])=>actual!==expected);
if(expectActive&&String(row.active_dataset||"")!==id)failures.push(["active dataset",String(row.active_dataset||""),id]);
if(failures.length)throw new Error("D1 catalogue verification failed: "+failures.map(x=>x[0]+" "+x[1]+" != "+x[2]).join("; "));
console.log(JSON.stringify({
  ok:true,datasetId:id,activeDataset:row.active_dataset||null,
  counts:{games:Number(row.actual_games),aliases:Number(row.actual_aliases),externalRefs:Number(row.actual_refs),artwork:Number(row.actual_artwork)}
},null,2));
