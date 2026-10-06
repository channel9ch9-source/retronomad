import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { buildCatalogueSearchIndex } from "../shared/catalogue-core.js";
import { rankCatalogueMatches, resolveCatalogueQuery } from "../shared/catalogue-search-core.js";

const document=JSON.parse(await fs.readFile(new URL("../catalogue/base-catalogue.json",import.meta.url),"utf8"));
const aliases=JSON.parse(await fs.readFile(new URL("../catalogue/search-aliases.json",import.meta.url),"utf8"));
const index=buildCatalogueSearchIndex(document,aliases.aliases||{});

function top(query,platform=""){
  return rankCatalogueMatches(index,query,{platform,limit:5});
}

test("collector abbreviations resolve to the intended canonical game",()=>{
  assert.equal(top("FF7","PS1")[0]?.game.id,"ps1:final-fantasy-vii");
  assert.equal(top("SMT3","PS2")[0]?.game.id,"ps2:shin-megami-tensei-lucifer-s-call");
  assert.equal(top("MGS3","PS2")[0]?.game.id,"ps2:metal-gear-solid-3-subsistence");
});

test("regional names and numeral variants resolve",()=>{
  assert.equal(top("Jet Grind Radio","Dreamcast")[0]?.game.id,"dreamcast:jet-set-radio");
  assert.equal(top("Fatal Frame III","PS2")[0]?.game.id,"ps2:project-zero-3-the-tormented");
  assert.equal(top("MediEvil II","PS1")[0]?.game.id,"ps1:medievil-2");
  assert.equal(top("ObsCure: The Aftermath","PS2")[0]?.game.id,"ps2:obscure-ii");
});

test("duplicate title search respects platform selection",()=>{
  assert.equal(top("Resident Evil 2","PS1")[0]?.game.id,"ps1:resident-evil-2");
  assert.equal(top("Resident Evil 2","Dreamcast")[0]?.game.id,"dreamcast:resident-evil-2");
  const unfiltered=top("RE2","").slice(0,2).map(x=>x.game.id);
  assert.deepEqual(new Set(unfiltered),new Set(["ps1:resident-evil-2","dreamcast:resident-evil-2"]));
});

test("common typos can be corrected when the result is unambiguous",()=>{
  const silent=resolveCatalogueQuery(index,"Silnt Hill",{platform:"PS1"});
  assert.equal(silent.status,"corrected");
  assert.equal(silent.top?.game.id,"ps1:silent-hill");

  const resident=resolveCatalogueQuery(index,"Resdient Evil 2",{platform:"PS1"});
  assert.equal(resident.status,"corrected");
  assert.equal(resident.top?.game.id,"ps1:resident-evil-2");
});

test("partial token searches are ranked without requiring exact full title",()=>{
  assert.equal(top("final fant 7","PS1")[0]?.game.id,"ps1:final-fantasy-vii");
  assert.equal(top("project zero iii","PS2")[0]?.game.id,"ps2:project-zero-3-the-tormented");
});
