import test from "node:test";
import assert from "node:assert/strict";
import {US_PRICECHARTING_CONSOLES,searchUsPriceChartingReview,renderPrivateReviewHtml,usMarketplaceGameTitle}
  from "../backend/pricecharting-review-pilot.js";

test("US PriceCharting review pilot has correct console namespaces",()=>{
  assert.deepEqual(Object.values(US_PRICECHARTING_CONSOLES).map(x=>x.id),["G6","G7","G16"]);
});

function clientFixture() {
 const calls=[];
 const client={
  async searchProducts(query){
   calls.push("search:"+query);
   return [
    {id:"prod-main","console-name":"Playstation","product-name":"Tomba!"},
    {id:"prod-reissue","console-name":"Playstation","product-name":"Tomba! [Greatest Hits]"},
    {id:"wrong-region","console-name":"PAL Playstation","product-name":"Tomba!"},
    {id:"wrong-game","console-name":"Playstation","product-name":"Tomba! 2"}
   ];
  },
  async getProductById(id) {
   calls.push("detail:"+id);
   return {id,"console-name":"Playstation","product-name":
    id==="prod-main"?"Tomba!":"Tomba! [Greatest Hits]",upc:"SENSITIVE-BARCODE"};
  },
  async getOffers({productId,consoleId}) {
   calls.push("offers:"+productId+":"+consoleId);
   if(productId==="prod-main") return [
    {"offer-id":"offer-good-111","offer-url":"/offer/offer-good-111","offer-status":"available",
      "is-available":true,"console-name":"Playstation","product-name":"Tomba!",
      "image-url":"https://www.pricecharting.com/photo/example.jpg",
      "include-string":"Game, Box, and Manual", "condition-string":"Normal wear",
      "description":"CIB like new with manual",price:13400,
      "buyer":{"email":"SECRET-BUYER"},"seller-id":"SECRET-SELLER"},
    {"offer-id":"offer-wrong-333","offer-url":"/offer/offer-wrong-333","offer-status":"available",
      "console-name":"JP Playstation","product-name":"Tomba!",price:20000},
    {"offer-id":"offer-invalid-222","offer-url":"https://evil.example/offer/phish","offer-status":"available",
      "console-name":"Playstation","product-name":"Tomba!",price:500},
    {"offer-id":"offer-sold-333","offer-url":"/offer/offer-sold-333","offer-status":"sold",
      "console-name":"Playstation","product-name":"Tomba!",price:4500}
   ];
   return [
    {"offer-id":"offer-good-111","offer-url":"/offer/offer-good-111","offer-status":"available",
     "console-name":"Playstation","product-name":"Tomba!","include-string":"Game only",price:13400},
    {"offer-id":"offer-extra-777","offer-url":"/offer/offer-extra-777","offer-status":"available",
     "console-name":"Playstation","product-name":"Tomba! [Greatest Hits]",
     "image-url":"javascript:alert(1)","include-string":"Game only",
     "condition-string":"<img src=x onerror=alert(1)>",price:7400}
   ];
  }
 };
 return {client,calls};
}

test("US listing candidate adapter keeps one-sided proof as REVIEW, no PAL or GBP inventions",async()=>{
 const {client,calls}=clientFixture();
 const output=await searchUsPriceChartingReview({game:"Tomba!",platform:"PS1",completeness:"cib",editionPreference:"original",maxDeliveredGbp:150},{client});
 assert.equal(output.mode,"PRIVATE_REVIEW_ONLY");
 assert.equal(output.target.region,"US");
 assert.equal(output.rows.length,2);
 assert.deepEqual(calls,[
  "search:Tomba! Playstation","detail:prod-main","offers:prod-main:G6",
  "detail:prod-reissue","offers:prod-reissue:G6"
 ]);
 const [a,b]=output.rows;
 assert.equal(a.match.state,"REVIEW");
 assert.equal(b.match.state,"REVIEW");
 assert.equal(a.match.evidence.exactUsReleaseVerified,false);
 assert.equal(a.match.evidence.cibVerified,false);
 assert.equal(a.match.evidence.deliveryVerified,false);
 assert.equal(a.completenessClaim,"Game, Box, and Manual");
 assert.equal(a.currency,"USD");
 assert.equal(a.itemPrice,134);
 assert.equal(a.postage,null);
 assert.equal(a.total,null);
 assert.equal(a.deliveredGbp,null);
 assert.equal(a.canonicalUrl,"https://www.pricecharting.com/offer/offer-good-111");
 assert.equal(a.attribution.url,"https://www.pricecharting.com/offers?product=prod-main");
 assert.equal(b.imageUrl,"");
 assert.equal(b.conditionClaim,"<img src=x onerror=alert(1)>");
 assert.equal(Object.prototype.hasOwnProperty.call(a,"raw"),false);
 assert.equal(JSON.stringify(output).includes("SECRET-BUYER"),false);
 assert.equal(JSON.stringify(output).includes("SENSITIVE-BARCODE"),false);
 assert.equal(JSON.stringify(output).includes("SECRET-SELLER"),false);
});

test("private static preview escapes seller content and never claims MATCH",async()=>{
 const {client}=clientFixture();
 const output=await searchUsPriceChartingReview({game:"Tomba!",platform:"PS1"},{client});
 const html=renderPrivateReviewHtml(output);
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
 assert.match(html,/PRIVATE REVIEW-first prototype/);
 assert.match(html,/USD 134.00/);
 assert.match(html,/REVIEW — edition and completeness unverified/);
 assert.match(html,/Inspect original offer and photos/);
 assert.match(html,/Via PriceCharting/);
 assert.doesNotMatch(html,/\<img src=x onerror=alert\(1\)\>/);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/javascript:/i);
 assert.doesNotMatch(html,/SECRET-BUYER|SECRET-SELLER|SENSITIVE-BARCODE/);
 assert.doesNotMatch(html,/MATCH —|£134|delivered: 134/);
});

test("missing region-compatible product and untrusted/ended offers are not returned",async()=>{
 const client={async searchProducts(){return [
  {id:"jp","console-name":"JP Playstation","product-name":"Tomba!"}
 ];}};
 const out=await searchUsPriceChartingReview({game:"Tomba!",platform:"PS1"},{client});
 assert.equal(out.rows.length,0);
 assert.equal(out.candidateProductVariants,0);
 assert.match(renderPrivateReviewHtml(out),/No available candidate listings/);
});

test("reject unsupported platforms, missing titles and cross-region assumptions",async()=>{
 for(const target of [{game:"Tomba!",platform:"PS5"},{game:"",platform:"PS1"},{game:"Tomba!"}]) {
  await assert.rejects(searchUsPriceChartingReview(target),{code:"invalid_target"});
 }
});

test("EU catalogue Tombi! is queried as US Tomba!, without mutating the European title",async()=>{
 assert.equal(usMarketplaceGameTitle("Tombi!","PS1"),"Tomba!");
 assert.equal(usMarketplaceGameTitle("Tombi","PS1"),"Tomba!");
 assert.equal(usMarketplaceGameTitle("Tombi!","PS2"),"Tombi!");
 assert.equal(usMarketplaceGameTitle("Tomba!","PS1"),"Tomba!");
 const queries=[];
 const client={
  async searchProducts(q){
   queries.push(q);
   return [{id:"real-us-product", "console-name":"Playstation","product-name":"Tomba!"}];
  },
  async getProductById(id){
   assert.equal(id,"real-us-product");
   return {id,"console-name":"Playstation","product-name":"Tomba!"};
  },
  async getOffers({productId,consoleId}){
   assert.equal(productId,"real-us-product");
   assert.equal(consoleId,"G6");
   return [{"offer-id":"available-us-offer","offer-status":"available",
    "console-name":"Playstation","product-name":"Tomba!",
    "offer-url":"/offer/available-us-offer","image-url":"https://www.pricecharting.com/img/item.jpg",
    price:13400,"include-string":"Item, Box, and Manual","condition-string":"Normal Wear"}];
  }
 };
 const found=await searchUsPriceChartingReview({game:"Tombi!",platform:"PS1"},{client});
 assert.deepEqual(queries,["Tomba! Playstation"]);
 assert.equal(found.target.game,"Tomba!");
 assert.equal(found.rows.length,1);
 assert.equal(found.rows[0].title,"Tomba!");
 assert.equal(found.rows[0].match.state,"REVIEW");
});
