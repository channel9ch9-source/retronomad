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
  for(const page of ["index.html","search.html","wishlist.html","account.html","analyze.html","about.html","privacy.html","terms.html"]){
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
