import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const benchmarkScript=new URL("../scripts/pricecharting-benchmark.mjs",import.meta.url);
import {
  PAL_CONSOLES,
  createPriceChartingClient,
  priceChartingAttributionUrl,
  findPriceChartingProductsForTarget,
  normalizePriceChartingOffer,
  referencePriceFromProduct,
  searchPriceChartingMarketplace
} from "../backend/pricecharting-provider.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function fixtureFetch() {
  const calls = [];
  const fn = async urlString => {
    const url = new URL(urlString);
    calls.push(url);
    const path = url.pathname;
    if (path === "/api/products") {
      return jsonResponse({ status: "success", products: [
        { id: "us-1", "product-name": "Silent Hill 2", "console-name": "Playstation 2" },
        { id: "pal-1", "product-name": "Silent Hill 2", "console-name": "PAL Playstation 2" },
        { id: "pal-platinum", "product-name": "Silent Hill 2 [Platinum]", "console-name": "PAL Playstation 2" },
        { id: "pal-wrong", "product-name": "Silent Hill 3", "console-name": "PAL Playstation 2" }
      ] });
    }
    if (path === "/api/product" && url.searchParams.get("id") === "pal-1") {
      return jsonResponse({
        status: "success", id: "pal-1", "product-name": "Silent Hill 2",
        "console-name": "PAL Playstation 2", upc: "4012927021234", "cib-price": 12345
      });
    }
    if (path === "/api/product" && url.searchParams.get("id") === "pal-platinum") {
      return jsonResponse({
        status: "success", id: "pal-platinum", "product-name": "Silent Hill 2 [Platinum]",
        "console-name": "PAL Playstation 2", upc: "4012927029999", "cib-price": 7899
      });
    }
    if (path === "/api/offers" && url.searchParams.get("id") === "pal-1") {
      return jsonResponse({ status: "success", offers: [{
        "condition-string": "Normal wear",
        "console-name": "PAL Playstation 2",
        id: "pal-1",
        "include-string": "Game, Box, and Manual",
        "is-available": true,
        "offer-id": "offer-123",
        "offer-status": "available",
        "offer-url": "/offer/offer-123",
        price: 7999,
        "product-name": "Silent Hill 2",
        "start-time": "2026-09-27"
      }] });
    }
    if (path === "/api/offers" && url.searchParams.get("id") === "pal-platinum") {
      return jsonResponse({ status: "success", offers: [] });
    }
    throw new Error(`Unexpected fixture URL: ${url.toString()}`);
  };
  fn.calls = calls;
  return fn;
}

function clientOptions(fetchFn) {
  return {
    token: "fixture-token-never-real",
    fetchFn,
    minIntervalMs: 0,
    cache: new Map(),
    rateState: { lastCallAt: 0 }
  };
}

test("PAL console mappings match the launch platforms", () => {
  assert.deepEqual(PAL_CONSOLES.PS1, { id: "G72", name: "PAL Playstation" });
  assert.deepEqual(PAL_CONSOLES.PS2, { id: "G63", name: "PAL Playstation 2" });
  assert.deepEqual(PAL_CONSOLES.Dreamcast, { id: "G65", name: "PAL Sega Dreamcast" });
});

test("product discovery rejects NTSC and different-title catalogue rows", async () => {
  const fetchFn = fixtureFetch();
  const client = createPriceChartingClient(clientOptions(fetchFn));
  const out = await findPriceChartingProductsForTarget(
    { game: "Silent Hill 2", platform: "PS2" },
    { client, maxProducts: 8 }
  );
  assert.equal(out.consoleInfo.id, "G63");
  assert.deepEqual(out.products.map(p => p.id), ["pal-1", "pal-platinum"]);
  assert.equal(fetchFn.calls[0].searchParams.get("q"), "Silent Hill 2 PAL Playstation 2");
});

test("marketplace search preserves evidence without inventing postage or delivered GBP", async () => {
  const fetchFn = fixtureFetch();
  const listings = await searchPriceChartingMarketplace(
    { game: "Silent Hill 2", platform: "PS2", completeness: "cib" },
    clientOptions(fetchFn)
  );
  assert.equal(listings.length, 1);
  const row = listings[0];
  assert.equal(row.source, "pricecharting");
  assert.equal(row.externalId, "offer-123");
  assert.equal(row.canonicalUrl, "https://www.pricecharting.com/offer/offer-123");
  assert.equal(row.currency, "USD");
  assert.equal(row.itemPrice, 79.99);
  assert.equal(row.postage, null);
  assert.equal(row.total, null);
  assert.equal(row.deliveredGbp, null);
  assert.equal(row.sourceRegion, "PAL Europe");
  assert.match(row.conditionText, /Complete in box \(CIB\)/);
  assert.deepEqual(row.identifiers, ["4012927021234"]);
  assert.equal(row.itemSpecifics.priceChartingProductId, "pal-1");
  assert.equal(row.itemSpecifics.priceChartingAttributionText, "Price data and marketplace offer via PriceCharting");
  assert.equal(row.itemSpecifics.priceChartingAttributionUrl, "https://www.pricecharting.com/offers?product=pal-1");

  const offerCall = fetchFn.calls.find(u => u.pathname === "/api/offers");
  assert.equal(offerCall.searchParams.get("condition-id"), "3");
  assert.equal(offerCall.searchParams.get("console"), "G63");
});

test("reference price uses the correct completeness bucket and cents conversion", () => {
  const ref = referencePriceFromProduct({ id: "pal-1", "cib-price": 12345 }, "cib");
  assert.equal(ref.amount, 123.45);
  assert.equal(ref.currency, "USD");
  assert.equal(ref.field, "cib-price");
  assert.equal(ref.attributionText, "Price data via PriceCharting");
  assert.equal(ref.attributionUrl, "https://www.pricecharting.com/offers?product=pal-1");
  assert.equal(referencePriceFromProduct({ id: "pal-1", "cib-price": 12345 }, "incomplete"), null);
});

test("normalizer can use product UPC and provider include evidence", () => {
  const row = normalizePriceChartingOffer({
    "offer-id": "abc", "offer-url": "/offer/abc", "product-name": "Rez",
    "console-name": "PAL Sega Dreamcast", "include-string": "Game only", price: 5500
  }, {
    id: "58184", "product-name": "Rez", "console-name": "PAL Sega Dreamcast", upc: "5060004761289"
  }, PAL_CONSOLES.Dreamcast);
  assert.deepEqual(row.identifiers, ["5060004761289"]);
  assert.match(row.conditionText, /loose/i);
  assert.equal(row.itemPrice, 55);
});

test("missing token fails safely without exposing secrets", () => {
  assert.throws(() => createPriceChartingClient(), error => {
    assert.equal(error.code, "pricecharting_token_missing");
    assert.doesNotMatch(error.message, /token=.*[a-z0-9]{20}/i);
    return true;
  });
});


test("PriceCharting attribution linkback is deterministic and never contains an API token", () => {
  assert.equal(priceChartingAttributionUrl("6910"), "https://www.pricecharting.com/offers?product=6910");
  assert.equal(priceChartingAttributionUrl(""), "https://www.pricecharting.com");
  assert.doesNotMatch(priceChartingAttributionUrl("6910"), /[?&]t=/);
});


async function runBenchmarkFixture(mode){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),"grailraven-pricecharting-"));
  const out=path.join(dir,mode+".json");
  await execFileAsync(process.execPath,[
    benchmarkScript.pathname,
    "--mode="+mode,
    "--fixture=true",
    "--out="+out
  ],{
    cwd:new URL("..",import.meta.url).pathname,
    env:{...process.env,PRICECHARTING_TOKEN:""}
  });
  const raw=await fs.readFile(out,"utf8");
  const report=JSON.parse(raw);
  await fs.rm(dir,{recursive:true,force:true});
  return {report,raw};
}

test("offline PriceCharting pricing benchmark covers the pinned 100-game launch population",async()=>{
  const {report,raw}=await runBenchmarkFixture("pricing");
  assert.equal(report.fixture,true);
  assert.equal(report.networkAccess,false);
  assert.equal(report.launchPopulation,100);
  assert.equal(report.results.length,100);
  assert.deepEqual(report.platforms,{PS1:40,PS2:40,Dreamcast:20});
  assert.equal(report.summary.rowsWithAnyPalCandidate,100);
  assert.equal(report.summary.rowsWithCibPrice,100);
  assert.equal(report.summary.rowsWithLoosePrice,100);
  assert.equal(report.summary.rowsWithNewPrice,100);
  assert.equal(report.apiTokenIncluded,false);
  assert.doesNotMatch(raw,/PRICECHARTING_TOKEN/i);
});

test("offline PriceCharting offers benchmark covers 100 provider rows without network access",async()=>{
  const {report,raw}=await runBenchmarkFixture("offers");
  assert.equal(report.fixture,true);
  assert.equal(report.networkAccess,false);
  assert.equal(report.launchPopulation,100);
  assert.equal(report.results.length,100);
  assert.deepEqual(report.platforms,{PS1:40,PS2:40,Dreamcast:20});
  assert.equal(report.summary.titlesWithOffers,100);
  assert.equal(report.summary.totalOffers,100);
  assert.equal(report.apiTokenIncluded,false);
  assert.doesNotMatch(raw,/PRICECHARTING_TOKEN/i);
});
