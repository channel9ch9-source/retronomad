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


test("provider IDs may repeat across platforms but not within one platform",()=>{
  const cross=structuredClone(seed);
  const dreamcast=cross.games.find(g=>g.platform==="Dreamcast");
  const ps1=cross.games.find(g=>g.platform==="PS1");
  dreamcast.externalRefs={...(dreamcast.externalRefs||{}),igdb:"shared-test-id"};
  ps1.externalRefs={...(ps1.externalRefs||{}),igdb:"shared-test-id"};
  const ok=buildPromotionManifest(cross,seed,{source:"TEST",requireFull:false});
  assert.ok(ok.counts.crossPlatformProviderRefReuseGroups>=1);

  const same=structuredClone(seed);
  const [a,b]=same.games.filter(g=>g.platform==="PS1").slice(0,2);
  a.externalRefs={...(a.externalRefs||{}),igdb:"same-platform-test-id"};
  b.externalRefs={...(b.externalRefs||{}),igdb:"same-platform-test-id"};
  assert.throws(
    ()=>buildPromotionManifest(same,seed,{source:"TEST",requireFull:false}),
    /same platform/
  );
});
