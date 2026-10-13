import test from "node:test";
import assert from "node:assert/strict";
import { auditTombaApiFields, fieldPresence } from "../scripts/pricecharting-tomba-field-audit.mjs";
import { createPriceChartingClient } from "../backend/pricecharting-provider.js";

test("field-presence audit never stores URLs, pictures, price values, seller or buyer personal data", async () => {
  const queries=[];
  const client={
    async searchProducts(q){
      queries.push("search:"+q);
      return [{id:"private-product","console-name":"Playstation","product-name":"Tomba"},
        {id:"jp-product","console-name":"JP Playstation","product-name":"Tomba"}];
    },
    async getProductById(id){
      assert.equal(id,"private-product");
      return {id,"console-name":"Playstation","product-name":"Tomba!","upc":"PRIVATE-UP-CODE"};
    },
    async getOffers({productId,consoleId}){
      queries.push("offers:"+consoleId);
      assert.equal(productId,"private-product");
      return [
        {"offer-id":"PRIVATE-OFFER-123456","offer-status":"available","is-available":true,"console-name":"Playstation","product-name":"Tomba!",
         "offer-url":"/offer/PRIVATE-OFFER-123456","image-url":"/secret/listing-photo.jpg",
         "has-pictures":true,"include-string":"Game, Box, and Manual","condition-string":"Normal wear",price:12900,
         "seller-id":"PRIVATE-SELLER","description":"Private seller message","photo1":"PRIVATE-PHOTO-1"},
        {"offer-id":"OTHER-PRIVATE-OFFER","offer-status":"sold","is-available":false,"console-name":"Playstation","product-name":"Tomba!"}
      ];
    },
    async getAvailableOfferDetails(id) {
      queries.push("details");
      assert.equal(id,"PRIVATE-OFFER-123456");
      return {
        status:"success","offer-status":"available","offer-id":id,
        "has-pictures":true,"seller-id":"PRIVATE-SELLER",
        "buyer":{"buyer-email":"SECRET-PRIVATE-EMAIL", "shipping-line1":"PRIVATE-STREET"},
        "description":"Private detailed seller message",
        "includes":"Game, Box, and Manual",
        "condition":"Normal wear",
        "image-url":"/secret/listing-photo.jpg",
        "photo1":"PRIVATE-PHOTO-1","photo2":"PRIVATE-PHOTO-2","photo3":"PRIVATE-PHOTO-3",
        price:12900
      };
    }
  };
  const out=await auditTombaApiFields(client);
  assert.deepEqual(queries, ["search:Tomba! Playstation","offers:G6","details"]);
  assert.equal(out.searchedProductCandidates,1);
  assert.equal(out.checkedProductVariants,1);
  assert.equal(out.sampledOneAvailableOffer,true);
  assert.equal(out.detailEndpointStatus,"SUCCESS");
  assert.equal(out.offersApi.primaryImageUrl,true);
  assert.equal(out.offersApi.separatePhotoFieldCount,1);
  assert.equal(out.offerDetailsApi.separatePhotoFieldCount,3);
  assert.equal(out.offerDetailsApi.sellerPhotoGalleryAccessible,true);
  assert.equal(out.offerDetailsApi.sellerDescription,true);
  assert.equal(out.overall.exactUSReleaseFromApiVerified,false);
  assert.equal(out.overall.originalManualFromApiVerified,false);
  assert.equal(out.overall.allWebsitePhotosAccessibleFromApi,false);
  const s=JSON.stringify(out);
  assert.doesNotMatch(s,/PRIVATE-|SECRET-|12900|Tomba!.*Playstation.*PRIVATE|buyer-email|shipping-line1|listing-photo\.jpg|Private seller/i);
});

test("unavailable listings never result in details requests", async () => {
  let detailed=false;
  const client={
    async searchProducts(){return [{id:"x","console-name":"Playstation","product-name":"Tomba!"}];},
    async getProductById(){return {id:"x","console-name":"Playstation","product-name":"Tomba!"};},
    async getOffers(){return [{"offer-id":"secret-sold-offer","offer-status":"sold","is-available":false,
      "console-name":"Playstation","product-name":"Tomba!"}];},
    async getAvailableOfferDetails(){detailed=true;throw new Error("MUST_NOT_FETCH");}
  };
  const result=await auditTombaApiFields(client);
  assert.equal(detailed,false);
  assert.equal(result.sampledOneAvailableOffer,false);
  assert.equal(result.detailEndpointStatus,"NOT_ATTEMPTED");
});

test("documented shipping-premium is not assumed to be destination-specific future postage", () => {
  const row=fieldPresence({"shipping-premium":500,"has-pictures":true,"image-url":"/img/test.jpg"});
  assert.equal(row.shippingCharge,false);
  assert.equal(row.destinationEligibility,false);
  assert.equal(row.primaryImageUrl,true);
});

test("available-only offer-details method calls correct GET API endpoint and avoids exposing auth token", async () => {
  const urls=[];
  const client=createPriceChartingClient({
    token:"secret-token-private",
    cache:new Map(),rateState:{lastCallAt:0},minIntervalMs:0,
    fetchFn:async url=>{
      urls.push(new URL(url));
      return {ok:true,status:200,json:async()=>({status:"success","offer-status":"available","has-pictures":true})};
    }
  });
  const d=await client.getAvailableOfferDetails("safe-available-123");
  assert.equal(d["has-pictures"],true);
  assert.equal(urls[0].pathname,"/api/offer-details");
  assert.equal(urls[0].searchParams.get("offer-id"),"safe-available-123");
  assert.equal(urls[0].searchParams.get("t"),"secret-token-private");
  await assert.rejects(client.getAvailableOfferDetails("invalid"), {code:"pricecharting_offer_id_invalid"});
});
