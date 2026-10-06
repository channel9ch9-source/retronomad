import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  buildPromotionManifest, normalizeAlias, sha256Hex, sqlString, stableCatalogueJson
} from "../scripts/catalogue-promotion-core.mjs";

const seed=JSON.parse(await fs.readFile(new URL("../catalogue/base-catalogue.json",import.meta.url),"utf8"));

test("baseline promotion manifest is deterministic for catalogue contents",()=>{
  const a=buildPromotionManifest(seed,seed,{source:"CANONICAL_BASELINE",requireFull:false});
  const b=buildPromotionManifest(seed,seed,{source:"CANONICAL_BASELINE",requireFull:false});
  assert.equal(a.checksumSha256,b.checksumSha256);
  assert.equal(a.datasetId,b.datasetId);
  assert.equal(a.counts.games,seed.games.length);
  assert.equal(a.counts.palScoutDeep,100);
  assert.equal(a.seedSafety.changedSeedIdentityCount,0);
});

test("promotion checksum covers the canonical pretty-printed file",()=>{
  const text=stableCatalogueJson(seed);
  assert.equal(sha256Hex(text).length,64);
  assert.ok(text.endsWith("\n"));
});

test("D1 SQL quoting and alias normalization are safe",()=>{
  assert.equal(sqlString("King's Field"),"'King''s Field'");
  assert.equal(sqlString(null),"NULL");
  assert.equal(normalizeAlias("MediEvil II"),"medievil ii");
});
