import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base=JSON.parse(await fs.readFile(new URL("../catalogue/base-catalogue.json",import.meta.url),"utf8"));
const mappings=JSON.parse(await fs.readFile(new URL("../catalogue/provider-mappings/igdb.json",import.meta.url),"utf8"));

test("IGDB explicit seed mappings reference unique existing PALScout seeds",()=>{
  assert.equal(mappings.schemaVersion,1);
  assert.equal(mappings.provider,"IGDB");
  assert.ok(Array.isArray(mappings.seedMappings));

  const seeds=new Map(base.games.map(game=>[game.id,game]));
  const seedIds=new Set();
  const igdbIds=new Set();

  for(const mapping of mappings.seedMappings){
    const seed=seeds.get(mapping.seedId);
    assert.ok(seed,`missing seed: ${mapping.seedId}`);
    assert.equal(seed.platform,mapping.platform,`platform mismatch: ${mapping.seedId}`);
    assert.equal(seed.releaseIntelligence?.coverage,"PALSCOUT_DEEP",`mapping should target a PALScout deep seed: ${mapping.seedId}`);
    assert.ok(String(mapping.igdbId||"").trim(),`missing IGDB id: ${mapping.seedId}`);
    assert.ok(String(mapping.providerTitle||"").trim(),`missing provider title: ${mapping.seedId}`);
    assert.ok(String(mapping.reason||"").trim(),`missing mapping rationale: ${mapping.seedId}`);
    assert.equal(seedIds.has(mapping.seedId),false,`duplicate seed mapping: ${mapping.seedId}`);
    assert.equal(igdbIds.has(String(mapping.igdbId)),false,`duplicate IGDB mapping: ${mapping.igdbId}`);
    seedIds.add(mapping.seedId);
    igdbIds.add(String(mapping.igdbId));
  }
});

test("current regional-title override set covers the nine dry-run gaps",()=>{
  assert.equal(mappings.seedMappings.length,9);
});
