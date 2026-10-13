import test from "node:test";
import assert from "node:assert/strict";
import { probePalMarketplace } from "../scripts/pricecharting-marketplace-depth.mjs";

test("PAL Marketplace depth diagnostic uses only console-level queries and produces aggregate counts", async () => {
  const consoles=[];
  const fakeClient={
    async getOffers({ productId, consoleId, conditionId }) {
      assert.equal(productId, undefined, "Do not filter on a single product");
      assert.equal(conditionId, undefined, "Do not filter on a single condition");
      consoles.push(consoleId);
      if (consoleId === "G72") return [
        {id:"a", "console-name":"PAL Playstation", "offer-id":"secret-offer-1", price:4200,"offer-status":"available","is-available":true},
        {id:"a", "console-name":"PAL Playstation", "offer-id":"secret-offer-2", price:5200,"offer-status":"available","is-available":true},
        {id:"b", "console-name":"PAL Playstation", "offer-id":"secret-offer-3", "offer-status":"sold","is-available":false},
        {id:"z", "console-name":"PAL Playstation 2", "offer-id":"secret-offer-4", "offer-status":"available","is-available":true}
      ];
      return [];
    }
  };
  const report=await probePalMarketplace(fakeClient);
  assert.deepEqual(consoles, ["G72","G63","G65"]);
  assert.equal(report.apiQueries,3);
  assert.equal(report.platforms[0].apiRowsReturned,4);
  assert.equal(report.platforms[0].availableOffers,3);
  assert.equal(report.platforms[0].availableForExpectedConsole,2);
  assert.equal(report.platforms[0].distinctProductsWithAvailableOffers,1);
  assert.equal(report.totalAvailableForExpectedConsoles,2);
  assert.equal(report.platforms[1].availableForExpectedConsole,0);
  assert.equal(report.platforms[2].availableForExpectedConsole,0);
  const serialized=JSON.stringify(report);
  assert.doesNotMatch(serialized,/secret-offer|4200|5200|API_TOKEN|seller|\"price\"\\s*:/i);
});
