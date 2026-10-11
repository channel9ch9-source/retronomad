import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

async function read(path){
  return fs.readFile(new URL("../"+path,import.meta.url),"utf8");
}

test("Worker API responses include browser security headers",async()=>{
  const worker=await read("backend/alerts-worker.js");
  for(const token of [
    '"x-content-type-options": "nosniff"',
    '"x-frame-options": "DENY"',
    '"referrer-policy": "strict-origin-when-cross-origin"',
    '"permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"',
    '"strict-transport-security": "max-age=31536000; includeSubDomains"',
    '"content-security-policy": "default-src \'none\'; frame-ancestors \'none\'; base-uri \'none\'; form-action \'none\'"',
    "...browserSecurityHeaders()"
  ]) assert.ok(worker.includes(token),`Worker missing security-header contract: ${token}`);
});
