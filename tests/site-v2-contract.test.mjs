import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

async function read(name){return fs.readFile(new URL("../"+name,import.meta.url),"utf8");}

test("production Search preserves the approved design-preview structure",async()=>{
  const html=await read("search.html");
  for(const token of [
    'class="v2-hero"',
    'class="v2-searchrow"',
    'class="v2-platforms"',
    'class="v2-grid"',
    'class="v2-filterpanel"',
    'id="mobileFilterButton"',
    'class="v2-resultshead"',
    'class="v2-cards"'
  ]) assert.ok(html.includes(token),`Search missing approved v2 structure: ${token}`);
  assert.ok(html.includes("Find the exact copy."));
  assert.ok(html.includes("PS1")&&html.includes("PS2")&&html.includes("Dreamcast"));
});

test("all primary public app pages use the GrailRaven v2 shell",async()=>{
  for(const page of ["index.html","search.html","catalogue.html","wishlist.html","account.html","analyze.html","about.html","privacy.html","terms.html"]){
    const html=await read(page);
    assert.ok(html.includes('href="ui-v2.css"'),`${page} missing ui-v2.css`);
    assert.ok(html.includes("v2-topbar"),`${page} missing v2 topbar`);
    assert.ok(html.includes("v2-raven"),`${page} missing raven mark`);
    assert.ok(html.includes("v2-wordmark"),`${page} missing wordmark`);
    assert.ok(html.includes("GrailRaven"),`${page} missing GrailRaven source branding`);
    assert.ok(html.includes('id="mobileNavButton"'),`${page} missing mobile menu`);
  }
});

test("functional pages retain their critical hooks after v2 migration",async()=>{
  const wishlist=await read("wishlist.html");
  for(const id of ["countTitle","syncBtn","accountBtn","exportBtn","empty","syncStatus","grid"]) assert.ok(wishlist.includes(`id="${id}"`),`wishlist missing #${id}`);
  const account=await read("account.html");
  for(const id of ["state","disabled","signin","email","sendLink","signedin","userEmail","syncBtn","logoutBtn"]) assert.ok(account.includes(`id="${id}"`),`account missing #${id}`);
  const analyze=await read("analyze.html");
  for(const id of ["listingUrl","importListing","title","platform","complete","desc","photoInput","identifier","analyse","result","verdict"]) assert.ok(analyze.includes(`id="${id}"`),`analyze missing #${id}`);
});


test("public navigation points to the dedicated Catalogue page",async()=>{
  for(const page of ["index.html","search.html","catalogue.html","wishlist.html","account.html","analyze.html","about.html","privacy.html","terms.html"]){
    const html=await read(page);
    assert.ok(html.includes('href="catalogue.html"'),`${page} does not link to Catalogue`);
  }
});

test("Catalogue v1 uses bounded browse rendering and canonical detail routes",async()=>{
  const html=await read("catalogue.html");
  for(const id of ["catalogueQuery","platformFilters","catalogueSort","catalogueGrid","prevPage","nextPage","detailView","detailTitle","findGame","saveGame"]){
    assert.ok(html.includes(`id="${id}"`),`Catalogue missing #${id}`);
  }
  assert.ok(html.includes("const PAGE_SIZE=36"));
  assert.ok(html.includes('catalogue.html?game='));
  assert.ok(html.includes('search.html?game='));
  assert.ok(html.includes("&save=1"));
  assert.ok(html.includes("Artwork intentionally unavailable"));
  assert.ok(html.includes('import("./shared/catalogue-search-core.js")'));
});

test("Catalogue public index remains the guarded 100-game launch set",async()=>{
  const index=await read("catalogue-index.js");
  const count=(index.match(/"id":/g)||[]).length;
  assert.equal(count,100);
});

test("Search accepts exact canonical Catalogue IDs and preserves them in hunt targets",async()=>{
  const html=await read("search.html");
  assert.ok(html.includes('params.get("game")'));
  assert.ok(html.includes("catalogueIndex.find(game=>game.id===canonicalId)"));
  assert.ok(html.includes("canonicalGame:canonical"));
  assert.ok(html.includes("catalogueId:canonical?.id||null"));
  assert.ok(html.includes('params.get("save")==="1"'));
});


test("Saved Hunts preserve canonical catalogue identity locally and in cloud normalization",async()=>{
  const saved=await read("saved-hunts.js");
  const worker=await read("backend/alerts-worker.js");
  assert.ok(saved.includes('catalogueId:String(t.catalogueId||"").trim()'));
  assert.ok(worker.includes('catalogueId: String(t.catalogueId || "").trim().slice(0, 220)'));
});


test("Catalogue and Search artwork slots stay behind the deployment flag",async()=>{
  const catalogue=await read("catalogue.html");
  const search=await read("search.html");
  const runtime=await read("runtime-config.js");
  for(const token of ["catalogueArtworkEnabled","detailArtwork","approvedArtwork","rightsStatus===\"APPROVED\""]){
    assert.ok(catalogue.includes(token),`Catalogue missing artwork gate token: ${token}`);
  }
  for(const token of ["catalogueArtworkEnabled","heroArtImage","approvedCatalogueArtwork","rightsStatus===\"APPROVED\""]){
    assert.ok(search.includes(token),`Search missing artwork gate token: ${token}`);
  }
  assert.ok(runtime.includes("catalogueArtworkEnabled:false"));
});

test("committed public catalogue index contains no artwork payload while the flag is off",async()=>{
  const index=await read("catalogue-index.js");
  assert.equal(index.includes('"artwork":'),false);
});
