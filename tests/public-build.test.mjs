import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,"..");
const out=join(root,"dist","public");

async function readBuilt(name){
  return fs.readFile(join(out,name),"utf8");
}

test("Cloudflare public build exposes only production HTML and emits discovery metadata",async()=>{
  execFileSync(process.execPath,["scripts/build-cloudflare.mjs"],{
    cwd:root,
    env:{...process.env,CATALOGUE_ARTWORK_ENABLED:"false"},
    stdio:"pipe"
  });

  for(const page of ["index.html","search.html","catalogue.html","wishlist.html","account.html","analyze.html","about.html","uk-pal-game-guide.html","privacy.html","terms.html"]){
    await fs.access(join(out,page));
  }
  for(const internal of ["design-preview.html","pricing-coverage.html"]){
    await assert.rejects(fs.access(join(out,internal)),{code:"ENOENT"});
  }

  const home=await readBuilt("index.html");
  assert.ok(home.includes("<title>GrailRaven — Find the right copy at the right price</title>"));
  assert.ok(home.includes('<link rel="canonical" href="https://grailraven.com/">'));
  assert.ok(home.includes('<meta name="robots" content="index,follow">'));
  assert.ok(home.includes('<meta property="og:site_name" content="GrailRaven">'));
  assert.ok(home.includes('<meta name="twitter:card" content="summary">'));
  assert.ok(home.includes('type="application/ld+json"'));
  const staticHome=home.replace(/<script\b[\s\S]*?<\/script>/gi,"").replace(/<style\b[\s\S]*?<\/style>/gi,"");
  assert.equal(staticHome.includes("RetroNomad"),false);

  const guide=await readBuilt("uk-pal-game-guide.html");
  assert.ok(guide.includes("<title>How to identify a UK/PAL retro game copy — GrailRaven</title>"));
  assert.ok(guide.includes('<link rel="canonical" href="https://grailraven.com/uk-pal-game-guide">'));
  assert.ok(guide.includes('<meta name="robots" content="index,follow">'));
  assert.ok(guide.includes("How to identify a UK/PAL retro game copy."));
  assert.ok(guide.includes('type="application/ld+json"'));

  const account=await readBuilt("account.html");
  const wishlist=await readBuilt("wishlist.html");
  assert.ok(account.includes('<meta name="robots" content="noindex,follow">'));
  assert.ok(wishlist.includes('<meta name="robots" content="noindex,follow">'));

  const headers=await readBuilt("_headers");
  for(const required of [
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "X-Robots-Tag: noindex, nofollow"
  ]) assert.ok(headers.includes(required),`_headers missing ${required}`);

  const robots=await readBuilt("robots.txt");
  assert.ok(robots.includes("User-agent: *"));
  assert.ok(robots.includes("Allow: /"));
  assert.ok(robots.includes("Sitemap: https://grailraven.com/sitemap.xml"));

  const sitemap=await readBuilt("sitemap.xml");
  for(const url of [
    "https://grailraven.com/",
    "https://grailraven.com/search",
    "https://grailraven.com/catalogue",
    "https://grailraven.com/analyze",
    "https://grailraven.com/about",
    "https://grailraven.com/uk-pal-game-guide"
  ]) assert.ok(sitemap.includes(`<loc>${url}</loc>`),`sitemap missing ${url}`);
  for(const excluded of ["account.html","wishlist.html","privacy.html","terms.html","design-preview.html","pricing-coverage.html"]){
    assert.equal(sitemap.includes(excluded),false,`sitemap should not include ${excluded}`);
  }
});
