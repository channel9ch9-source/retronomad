import fs from "node:fs/promises";
import process from "node:process";
import {
  validateCatalogue,
  buildCatalogueSearchIndex
} from "../shared/catalogue-core.js";
import { rankCatalogueMatches } from "../shared/catalogue-search-core.js";

const input=process.argv.find(x=>x.startsWith("--input="))?.slice(8);
if(!input){
  console.error("Usage: node scripts/validate-catalogue-promotion.mjs --input=<proposed-catalogue.json>");
  process.exit(2);
}

const catalogue=JSON.parse(await fs.readFile(input,"utf8"));
const searchAliases=JSON.parse(await fs.readFile(new URL("../catalogue/search-aliases.json",import.meta.url),"utf8"));
const validation=validateCatalogue(catalogue);
if(!validation.ok){
  console.error("Catalogue validation failed:",validation.errors);
  process.exit(1);
}

const games=catalogue.games||[];
const deep=games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP");
const baseOnly=games.filter(g=>g.releaseIntelligence?.coverage==="BASE_ONLY");
const missingIgdbDeep=deep.filter(g=>!String(g.externalRefs?.igdb||"").trim());
const ids=new Set(games.map(g=>g.id));
const index=buildCatalogueSearchIndex(catalogue,searchAliases.aliases||{},searchAliases.suppressAliases||{});
const indexBytes=Buffer.byteLength(JSON.stringify(index),"utf8");

const failures=[];
if(games.length<8000) failures.push(`unexpectedly small catalogue: ${games.length}`);
if(deep.length!==100) failures.push(`expected 100 PALSCOUT_DEEP games, got ${deep.length}`);
if(missingIgdbDeep.length) failures.push(`${missingIgdbDeep.length} PALSCOUT_DEEP games lack IGDB mapping`);
if(ids.size!==games.length) failures.push("duplicate catalogue IDs found");
if(indexBytes>2*1024*1024) failures.push(`browser search index exceeds 2 MiB: ${indexBytes} bytes`);

function assertSearch(query,predicate,description){
  const rows=rankCatalogueMatches(index,query,{limit:10}).map(row=>row.game);
  if(!rows.some(predicate)){
    failures.push(`search smoke test failed for "${query}": ${description}; got ${rows.map(x=>x.title+" ["+x.platform+"]").join(", ")}`);
  }
}

assertSearch("FF7",g=>g.title==="Final Fantasy VII"&&g.platform==="PS1","Final Fantasy VII PS1 should be returned");
assertSearch("FFVII",g=>g.title==="Final Fantasy VII"&&g.platform==="PS1","FFVII alias should resolve");
assertSearch("MGS3",g=>g.title==="Metal Gear Solid 3: Snake Eater"&&g.platform==="PS2","MGS3 alias should find Snake Eater");
assertSearch("RE2",g=>g.title==="Resident Evil 2","RE2 alias should find Resident Evil 2");
assertSearch("Forbidden Siren",g=>g.id==="ps2:forbidden-siren","PAL seed title should resolve");
assertSearch("Lucifer's Call",g=>g.id==="ps2:shin-megami-tensei-lucifer-s-call","PAL regional title should resolve");
assertSearch("Project Zero 3",g=>g.id==="ps2:project-zero-3-the-tormented","PAL regional series title should resolve");
assertSearch("MediEvil 2",g=>g.id==="ps1:medievil-2","Arabic numeral PAL title should resolve");
assertSearch("Obscure II",g=>g.id==="ps2:obscure-ii","PAL sequel title should resolve");

const summary={
  valid:true,
  totalGames:games.length,
  baseOnlyGames:baseOnly.length,
  palScoutDeepGames:deep.length,
  mappedPalScoutDeepGames:deep.length-missingIgdbDeep.length,
  searchIndexBytes:indexBytes,
  searchIndexMiB:Number((indexBytes/1024/1024).toFixed(3))
};

console.log(JSON.stringify(summary,null,2));
if(failures.length){
  console.error(JSON.stringify({failures},null,2));
  process.exit(1);
}
