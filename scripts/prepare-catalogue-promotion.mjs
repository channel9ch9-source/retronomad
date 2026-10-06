import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildPromotionManifest, stableCatalogueJson } from "./catalogue-promotion-core.mjs";

function arg(name, fallback=null){
  const prefix="--"+name+"=";
  return process.argv.find(x=>x.startsWith(prefix))?.slice(prefix.length)??fallback;
}
const input=arg("input");
if(!input){
  console.error("Usage: node scripts/prepare-catalogue-promotion.mjs --input=<candidate.json> [--out-dir=promotion-output]");
  process.exit(2);
}
const outDir=arg("out-dir","promotion-output");
const source=arg("source","IGDB");
const mode=arg("mode","full");
const candidate=JSON.parse(await fs.readFile(input,"utf8"));
const seed=JSON.parse(await fs.readFile(path.join(process.cwd(),"catalogue","base-catalogue.json"),"utf8"));
const manifest=buildPromotionManifest(candidate,seed,{source,requireFull:mode!=="baseline"});

await fs.mkdir(outDir,{recursive:true});
await fs.writeFile(path.join(outDir,"canonical-candidate.json"),stableCatalogueJson(candidate),"utf8");
await fs.writeFile(path.join(outDir,"manifest.json"),JSON.stringify(manifest,null,2)+"\n","utf8");

console.log(JSON.stringify(manifest,null,2));
console.log("Prepared promotion candidate without modifying catalogue/base-catalogue.json.");
