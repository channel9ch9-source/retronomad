import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const search=await fs.readFile(new URL("../search.html",import.meta.url),"utf8");
const home=await fs.readFile(new URL("../index.html",import.meta.url),"utf8");

test("production search keeps all functional hooks after v2 skin",()=>{
  for(const id of ["game","games","platform","release","edition","complete","condition","maxPrice","english","excludeBundles","excludePromo","searchBtn","saveBtn","saved","target","targetTitle","targetText","chips","empty","liveResults","cardPreview","sourceBadge"]){
    assert.match(search,new RegExp(`id=["']${id}["']`),`missing #${id}`);
  }
  for(const src of ["catalogue-index.js","release-evidence.js","marketplace-source.js","palscout-classifier.js","search-matcher.js","search-pipeline.js","runtime-config.js","saved-hunts.js","account-sync.js"]){
    assert.ok(search.includes(`src="${src}"`),`missing script ${src}`);
  }
});

test("production homepage and search use GrailRaven v2 shell",()=>{
  for(const html of [home,search]){
    assert.ok(html.includes('href="ui-v2.css"'));
    assert.ok(html.includes('href="production-v2.css"'));
    assert.ok(html.includes("v2-raven"));
    assert.ok(html.includes("v2-wordmark"));
    assert.ok(html.includes("GrailRaven"));
    assert.ok(html.includes("mobileNavButton"));
  }
});

test("production search supports alternate-name lookup without changing the approved preview copy",()=>{
  assert.ok(search.includes('import("./shared/catalogue-search-core.js")'));
  assert.ok(search.includes("resolveCatalogueQuery"));
  assert.ok(search.includes("rankCatalogueMatches"));
  assert.ok(search.includes("Search Silent Hill, Final Fantasy VII, Shenmue..."));
});


test("production Search uses lightweight ranked autocomplete instead of thousands of datalist options",()=>{
  assert.ok(search.includes('id="catalogueSuggestions"'));
  assert.ok(search.includes('import("./shared/catalogue-search-core.js")'));
  assert.ok(search.includes("rankCatalogueMatches"));
  assert.ok(search.includes('aria-autocomplete="list"'));
  assert.equal(search.includes('id="game" list="games"'),false);
  assert.equal(search.includes('document.createElement("option")'),false);
});


test("production Search has a canonical catalogue selection state before marketplace discovery",()=>{
  for(const id of ["catalogueSelection","selectionTitle","selectionPlatform","selectionYear","selectionCoverage","selectionMarketplace","selectionSave"]){
    assert.match(search,new RegExp(`id=["']${id}["']`),`missing #${id}`);
  }
  assert.ok(search.includes("Game identified"));
  assert.ok(search.includes('resolution.status==="none"'));
  assert.ok(search.includes('resolution.status==="ambiguous"'));
  assert.ok(search.includes("No catalogue match found"));
  assert.ok(search.includes("Live listings not connected yet"));
  assert.equal(search.includes("Target ready. Live marketplace discovery is not connected yet."),false);
});


test("production Search contains the conditional PriceCharting attribution contract",()=>{
  assert.ok(search.includes("Price data / marketplace offer via PriceCharting"));
  assert.ok(search.includes('String(row.source||"").toLowerCase()==="pricecharting"'));
  assert.ok(search.includes("priceChartingAttributionUrl"));
  assert.ok(search.includes('link.rel="noopener noreferrer"'));
});
