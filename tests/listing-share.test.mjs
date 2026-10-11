import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const source=await fs.readFile(new URL("../listing-share.js",import.meta.url),"utf8");

test("Listing Checker share summary contains only rendered verdict fields",()=>{
  for(const token of [
    '"GrailRaven listing check"',
    'read("game")',
    'read("plat")',
    'read("badge")',
    'read("verdictTitle")',
    'read("market")',
    'read("matchedId","None")',
    'read("comp")',
    'read("compatBadge")',
    'read("compatTitle")',
    'read("evidenceStrength")',
    '"Check a listing: https://grailraven.com/analyze"'
  ]) assert.ok(source.includes(token),`share summary missing: ${token}`);

  for(const unsafe of [
    'read("listingUrl")',
    'read("listingSource")',
    'read("listingItemId")',
    'read("title")',
    'read("desc")',
    'read("price")',
    'read("postage")'
  ]) assert.equal(source.includes(unsafe),false,`share summary must not include raw listing field: ${unsafe}`);
});

test("Listing Checker sharing has clipboard fallback and clear feedback",()=>{
  assert.ok(source.includes("navigator.clipboard"));
  assert.ok(source.includes('document.execCommand("copy")'));
  assert.ok(source.includes('button.textContent="Copied ✓"'));
  assert.ok(source.includes('status.textContent="Summary copied."'));
});
