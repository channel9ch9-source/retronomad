import test from "node:test";
import assert from "node:assert/strict";
import { runUsMarketplaceSortComparison } from "../scripts/pricecharting-us-sort-window.mjs";

test("US sort-window check demonstrates distinct result windows without retaining individual offers", async()=>{
  const seen=[];
  const client={
    async getOffers({consoleId,sort,productId}){
      seen.push({consoleId,sort,productId});
      assert.equal(productId,undefined);
      const numbers=sort==="lowest-price"?
        Array.from({length:30},(_,i)=>i+1):
        Array.from({length:30},(_,i)=>i+16);
      return numbers.map(i=>({
        "offer-id":"PRIVATE-OFFER-"+i,
        "console-name":consoleId==="G6"?"Playstation":consoleId==="G7"?"Playstation 2":"Sega Dreamcast",
        "offer-status":"available", "is-available":true,
        price:50000,"seller":"PRIVATE-SELLER"
      }));
    }
  };
  const report=await runUsMarketplaceSortComparison(client);
  assert.equal(seen.length,6);
  assert.deepEqual(seen.map(x=>x.consoleId),["G6","G6","G7","G7","G16","G16"]);
  assert.deepEqual(seen.map(x=>x.sort),["lowest-price","starts","lowest-price","starts","lowest-price","starts"]);
  assert.deepEqual(report.results.map(x=>x.uniqueAcrossBoth),[45,45,45]);
  assert.deepEqual(report.results.map(x=>x.moreOffersThanSingleResponseProven),[true,true,true]);
  assert.equal(report.consolesWithDemonstratedPartialWindow,3);
  assert.doesNotMatch(JSON.stringify(report),/PRIVATE-OFFER|PRIVATE-SELLER|50000/);
});

test("same 30 returned in both sort orders is inconclusive",async()=>{
  const client={
    async getOffers({consoleId}){
      const name={G6:"Playstation",G7:"Playstation 2",G16:"Sega Dreamcast"}[consoleId];
      return Array.from({length:30},(_,i)=>({
        "offer-id":"confidential-"+i,"console-name":name,
        "offer-status":"available","is-available":true
      }));
    }
  };
  const report=await runUsMarketplaceSortComparison(client);
  assert.equal(report.consolesWithDemonstratedPartialWindow,0);
  assert.deepEqual(report.results.map(x=>x.uniqueAcrossBoth),[30,30,30]);
});
