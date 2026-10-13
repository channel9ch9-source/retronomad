import test from "node:test";
import assert from "node:assert/strict";
import {
  INTERNATIONAL_CONSOLES,
  INTERNATIONAL_TARGETS,
  matchesInternationalTitle,
  sameConsole,
  runInternationalBenchmark
} from "../scripts/pricecharting-international-benchmark.mjs";

test("official US/JP PriceCharting console namespaces stay separated", () => {
  assert.deepEqual(Object.values(INTERNATIONAL_CONSOLES.US).map(x => x.id), ["G6","G7","G16"]);
  assert.deepEqual(Object.values(INTERNATIONAL_CONSOLES.JP).map(x => x.id), ["G107","G108","G64"]);
  assert.equal(INTERNATIONAL_TARGETS.length, 24);
  for (const region of ["US", "JP"]) {
    for (const platform of ["PS1","PS2","Dreamcast"]) {
      assert.equal(INTERNATIONAL_TARGETS.filter(x => x.region === region && x.platform === platform).length, 4);
    }
  }
});

test("exact title matching excludes wrong games, permits bracketed variants and rejects wrong region", () => {
  assert.equal(matchesInternationalTitle("Silent Hill", "Silent Hill"), true);
  assert.equal(matchesInternationalTitle("Silent Hill", "Silent Hill [Greatest Hits]"), true);
  assert.equal(matchesInternationalTitle("Silent Hill", "Silent Hill 2"), false);
  assert.equal(sameConsole(INTERNATIONAL_CONSOLES.US.PS1, {"console-name":"JP Playstation"}), false);
});

test("international sample fetches prices, six console offer counts, and never claims exact edition", async () => {
  const product = {
    id:"safe-product", "product-name":"Silent Hill [Greatest Hits]", "console-name":"Playstation",
    "cib-price":17700,"loose-price":9999,"new-price":30000,upc:"012345678912",
    "seller":"PRIVATE-SELLER"
  };
  const visited=[];
  const client={
    async searchProducts(query) {
      visited.push(query);
      if (query === "Silent Hill Playstation") return [
        {id:product.id,"product-name":product["product-name"],"console-name":product["console-name"]},
        {id:"jp-product","product-name":"Silent Hill","console-name":"JP Playstation"},
        {id:"wrong-product","product-name":"Silent Hill 2","console-name":"Playstation"}
      ];
      return [];
    },
    async getProductById(id) {
      assert.equal(id, "safe-product");
      return product;
    },
    async getOffers({consoleId,productId}) {
      assert.equal(productId,undefined);
      visited.push("offers:"+consoleId);
      if(consoleId==="G6") return [
        {"offer-id":"SECRET-US-OFFER","console-name":"Playstation",id:"safe-product","offer-status":"available","is-available":true,price:15000},
        {"offer-id":"JP-ONLY","console-name":"JP Playstation",id:"jp-product","offer-status":"available","is-available":true},
        {"offer-id":"SOLD","console-name":"Playstation",id:"another","offer-status":"sold","is-available":false}
      ];
      return [];
    }
  };
  const report=await runInternationalBenchmark(client, [
    {region:"US",platform:"PS1",game:"Silent Hill"},
    {region:"JP",platform:"PS1",game:"Silent Hill"}
  ]);
  assert.equal(report.sampleSize,2);
  assert.equal(report.errors,0);
  assert.equal(report.pricing[0].status,"TITLE_AND_CONSOLE_CANDIDATE");
  assert.equal(report.pricing[0].candidatesWithCibValue,1);
  assert.equal(report.pricing[0].candidatesWithProductBarcode,1);
  assert.equal(report.pricing[0].exactReleaseVerified,false);
  assert.equal(report.pricing[1].status,"NO_REGION_CANDIDATE");
  assert.equal(report.regions.US.availableMarketplaceOffersReturned,1);
  assert.equal(report.regions.JP.availableMarketplaceOffersReturned,0);
  assert.equal(report.marketplace.length,6);
  assert.equal(visited.filter(x=>x.startsWith("offers:")).length,6);
  const s=JSON.stringify(report);
  assert.doesNotMatch(s,/PRIVATE-SELLER|SECRET-US-OFFER|JP-ONLY|15000|17700|9999|30000|012345678912/);
});

test("provider failures are clearly marked instead of misreported as missing inventory", async () => {
  const client={
    async searchProducts(){ throw Object.assign(new Error("secret-sensitive-error"),{code:"api_error"}); },
    async getOffers(){ throw Object.assign(new Error("secret-sensitive-error"),{code:"api_error"}); }
  };
  const report=await runInternationalBenchmark(client,[{region:"JP",platform:"PS2",game:"Okami"}]);
  assert.equal(report.errors,7);
  assert.equal(report.pricing[0].status,"PROVIDER_ERROR");
  assert.equal(report.regions.JP.providerErrors,4);
  assert.doesNotMatch(JSON.stringify(report),/secret-sensitive-error/);
});
