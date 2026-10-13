import test from "node:test";
import assert from "node:assert/strict";
import { US_HUNT_TARGETS, probeUsHunts } from "../scripts/pricecharting-us-game-hunts.mjs";

test("US game-hunt sample mixes common and collector titles on three platforms", () => {
  assert.equal(US_HUNT_TARGETS.length, 18);
  for (const p of ["PS1", "PS2", "Dreamcast"]) {
    assert.equal(US_HUNT_TARGETS.filter(x => x.platform === p).length, 6);
    assert.equal(US_HUNT_TARGETS.filter(x => x.platform === p && x.segment === "collector").length, 2);
  }
});

test("per-game US offer benchmark counts real available, linked and matching candidates without releasing raw data", async () => {
  const calls = [];
  const products = {
    a: {id:"a", "console-name":"Playstation", "product-name":"Silent Hill",upc:"PRIVATE-UPCX","cib-price":7999},
    b: {id:"b", "console-name":"Playstation", "product-name":"Silent Hill [Greatest Hits]",upc:"PRIVATE-UPCY"}
  };
  const client={
    async searchProducts(q){
      calls.push("search:"+q);
      return [
        {id:"a","console-name":"Playstation","product-name":"Silent Hill"},
        {id:"b","console-name":"Playstation","product-name":"Silent Hill [Greatest Hits]"},
        {id:"c","console-name":"JP Playstation","product-name":"Silent Hill"},
        {id:"d","console-name":"Playstation","product-name":"Silent Hill 2"}
      ];
    },
    async getProductById(id){calls.push("product:"+id);return products[id];},
    async getOffers({productId,consoleId}){
      calls.push("offers:"+productId+":"+consoleId);
      if(productId==="a") return [
        {"offer-id":"PRIVATE-1","offer-url":"/offer/PRIVATE-1","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Silent Hill","include-string":"Game, Box, and Manual",price:7100},
        {"offer-id":"PRIVATE-2","offer-url":"https://www.pricecharting.com/offer/PRIVATE-2","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Silent Hill","include-string":"Game only",price:7100},
        {"offer-id":"PRIVATE-3","offer-url":"/offer/PRIVATE-3","offer-status":"sold","is-available":false,"console-name":"Playstation","product-name":"Silent Hill"},
        {"offer-id":"PRIVATE-4","offer-url":"/offer/PRIVATE-4","offer-status":"available","is-available":true,"console-name":"JP Playstation","product-name":"Silent Hill"},
        {"offer-id":"PRIVATE-5","offer-url":"/offer/PRIVATE-5","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Silent Hill 2"},
        {"offer-id":"PRIVATE-6","offer-url":"","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Silent Hill"}
      ];
      return [
        {"offer-id":"PRIVATE-1","offer-url":"/offer/PRIVATE-1","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Silent Hill [Greatest Hits]","include-string":"Game only"},
        {"offer-id":"PRIVATE-7","offer-url":"/offer/PRIVATE-7","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Silent Hill [Greatest Hits]","include-string":"Game only"}
      ];
    }
  };
  const report=await probeUsHunts(client,[{game:"Silent Hill",platform:"PS1",segment:"familiar"}]);
  assert.deepEqual(calls, [
    "search:Silent Hill Playstation","product:a","product:b","offers:a:G6","offers:b:G6"
  ]);
  assert.equal(report.summary.testedGames,1);
  assert.equal(report.summary.gamesWithAvailableOffers,1);
  assert.equal(report.summary.totalAvailableOffersWithUrls,3);
  assert.equal(report.summary.gamesWithCibWordingOffers,1);
  assert.equal(report.games[0].availableOffersWithUrls,3);
  assert.equal(report.games[0].cibWordingOffers,1);
  assert.equal(report.games[0].looseWordingOffers,2);
  assert.equal(report.games[0].excludedTitleOrConsoleRows,2);
  assert.equal(report.games[0].excludedMissingUrlRows,1);
  assert.equal(report.games[0].checkedProductVariants,2);
  assert.equal(report.games[0].variantsWithOffers,2);
  assert.equal(report.games[0].exactPhysicalEditionVerified,false);
  assert.equal(report.games[0].shippingEligibilityVerified,false);
  const s=JSON.stringify(report);
  assert.doesNotMatch(s,/PRIVATE-\d|PRIVATE-UPCX|PRIVATE-UPCY|7100|offer\/|cib-price/);
});

test("provider API failures stay explicit and do not masquerade as no listings",async () => {
  const report=await probeUsHunts({
    async searchProducts(){throw Object.assign(new Error("SECRET-internal-message"),{code:"provider_test_error"});}
  },[{game:"Rule of Rose",platform:"PS2",segment:"collector"}]);
  assert.equal(report.summary.gamesWithProviderErrors,1);
  assert.equal(report.summary.gamesWithAvailableOffers,0);
  assert.equal(report.games[0].status,"PROVIDER_ERROR");
  assert.equal(report.games[0].error,"provider_test_error");
  assert.doesNotMatch(JSON.stringify(report),/SECRET-internal-message/);
});
