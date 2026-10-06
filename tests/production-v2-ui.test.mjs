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
  assert.ok(search.includes("(x.aliases||[]).some"));
  assert.ok(search.includes("Search Silent Hill, Final Fantasy VII, Shenmue..."));
});
