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
const rawCandidate=JSON.parse(await fs.readFile(input,"utf8"));
const candidate=structuredClone(rawCandidate);
if(mode!=="baseline"){
  const rawVersion=String(candidate.catalogueVersion||"").trim();
  candidate.catalogueVersion=rawVersion.replace(/^dry-run-/,"")||source.toLowerCase()+"-promoted";
  for(const game of candidate.games||[]){
    game.provenance=(game.provenance||[]).map(entry=>{
      const next={...entry};
      if(next.source==="IGDB_DRY_RUN")next.source="IGDB_IMPORT";
      if(next.source==="IGDB_EXPLICIT_MAPPING_DRY_RUN")next.source="IGDB_EXPLICIT_MAPPING";
      return next;
    });
  }
}
const seed=JSON.parse(await fs.readFile(path.join(process.cwd(),"catalogue","base-catalogue.json"),"utf8"));
const searchAliases=JSON.parse(await fs.readFile(path.join(process.cwd(),"catalogue","search-aliases.json"),"utf8"));
const manifest=buildPromotionManifest(candidate,seed,{
  source,
  requireFull:mode!=="baseline",
  supplementalAliases:searchAliases.aliases||{},
  suppressedAliases:searchAliases.suppressAliases||{}
});

await fs.mkdir(outDir,{recursive:true});
await fs.writeFile(path.join(outDir,"canonical-candidate.json"),stableCatalogueJson(candidate),"utf8");
await fs.writeFile(path.join(outDir,"manifest.json"),JSON.stringify(manifest,null,2)+"\n","utf8");

console.log(JSON.stringify(manifest,null,2));
console.log("Prepared promotion candidate without modifying catalogue/base-catalogue.json.");
