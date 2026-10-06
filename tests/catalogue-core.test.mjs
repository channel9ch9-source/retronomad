import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { RELEASE_EVIDENCE } from "../shared/release-evidence-data.js";
import {
  buildCatalogueSearchIndex,
  findCatalogueMatches,
  makeCatalogueId,
  validateCatalogue
} from "../shared/catalogue-core.js";

const document=JSON.parse(await fs.readFile(new URL("../catalogue/base-catalogue.json", import.meta.url),"utf8"));

test("seed catalogue validates",()=>{
  const result=validateCatalogue(document);
  assert.equal(result.ok,true,result.errors.join("\n"));
});

test("canonical catalogue preserves the pinned 100-game PALScout benchmark population",()=>{
  const deep=document.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP");
  assert.equal(deep.length,100);
  const counts=deep.reduce((acc,g)=>{acc[g.platform]=(acc[g.platform]||0)+1;return acc;},{});
  assert.deepEqual(counts,{Dreamcast:20,PS1:40,PS2:40});
});

test("seed catalogue IDs are stable and unique",()=>{
  const ids=new Set(document.games.map(g=>g.id));
  assert.equal(ids.size,document.games.length);
  const silent=document.games.find(g=>g.title==="Silent Hill"&&g.platform==="PS1");
  assert.equal(silent.id,makeCatalogueId("PS1","Silent Hill"));
});

test("every PALSCOUT_DEEP benchmark game is backed by existing PALScout evidence",()=>{
  const evidenceKeys=new Set(RELEASE_EVIDENCE.map(r=>r[1]+"|"+r[0]));
  const deep=document.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP");
  for(const game of deep)assert.ok(evidenceKeys.has(game.platform+"|"+game.title),game.platform+" "+game.title);
});

test("browser search index stays lightweight and searchable",()=>{
  const index=buildCatalogueSearchIndex(document);
  assert.equal(index.length,document.games.length);
  assert.deepEqual(Object.keys(index[0]).sort(),["aliases","coverage","id","platform","releaseYear","title"].sort());
  assert.ok(Buffer.byteLength(JSON.stringify(index),"utf8")<=2*1024*1024,"compact index must stay under 2 MiB");
  const results=findCatalogueMatches(index,"silent hill","PS1");
  assert.equal(results[0].title,"Silent Hill");
  assert.equal(results[0].platform,"PS1");
});


test("committed browser index matches canonical catalogue",async()=>{
  const js=await fs.readFile(new URL("../catalogue-index.js", import.meta.url),"utf8");
  const prefix="// Generated from catalogue/base-catalogue.json. Do not edit by hand.\nwindow.BASE_CATALOGUE_INDEX=";
  assert.ok(js.startsWith(prefix));
  const payload=js.slice(prefix.length).replace(/;\s*$/,"");
  const committed=JSON.parse(payload);
  assert.deepEqual(committed,buildCatalogueSearchIndex(document));
});
