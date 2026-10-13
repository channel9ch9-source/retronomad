// A private evaluation harness. Only synthetic fixtures are rendered into HTML.
// Real licensed offers are transformed to aggregate counts, not uploaded as cards
// or records to artifacts in this PUBLIC GitHub repository.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {pathToFileURL} from "node:url";
import {createPriceChartingClient} from "../backend/pricecharting-provider.js";
import {searchUsPriceChartingReview,renderPrivateReviewHtml}
  from "../backend/pricecharting-review-pilot.js";

export function makeReviewFixtureClient(){
 const product={"id":"synthetic-us-tomba","product-name":"Tomba!","console-name":"Playstation"};
 return {
  async searchProducts(query){
   return query==="Tomba! Playstation"?[product]:[];
  },
  async getProductById(id){
   if(id!==product.id)throw Error("Unexpected synthetic product");
   return product;
  },
  async getOffers({productId,consoleId}){
   if(productId!==product.id||consoleId!=="G6")throw Error("Unexpected synthetic console");
   return [{
    "offer-id":"synthetic-offer-001",
    "offer-url":"/offer/synthetic-offer-001",
    "product-name":"Tomba!",
    "console-name":"Playstation",
    "offer-status":"available",
    "is-available":true,
    "image-url":"https://www.pricecharting.com/photo/example-fixture-image.jpg",
    "include-string":"Game, Box, and Manual",
    "condition-string":"Normal wear",
    description:"Seller says original disc and manual. Fixture data, not a real offer.",
    price:13400
   }];
  }
 };
}

export function reviewPilotSummary(result){
 const rows=result.rows||[];
 return {
  schemaVersion:1,
  scope:"Private US PriceCharting REVIEW-only integration smoke test",
  fixture: false,
  game:result.target?.game,
  platform:result.target?.platform,
  candidateProductVariants:result.candidateProductVariants,
  returnedOffers:rows.length,
  reviewCount:rows.filter(r=>r.match?.state==="REVIEW").length,
  matchCount:rows.filter(r=>r.match?.state==="MATCH").length,
  withSafeOriginalListingUrl:rows.filter(r=>r.canonicalUrl?.startsWith("https://www.pricecharting.com/offer/")).length,
  withMainThumbnail:rows.filter(r=>Boolean(r.imageUrl)).length,
  withSellerCompletenessWording:rows.filter(r=>Boolean(r.completenessClaim)).length,
  withSellerConditionWording:rows.filter(r=>Boolean(r.conditionClaim)).length,
  withBuyerSpecificShipping:rows.filter(r=>r.total!=null||r.deliveredGbp!=null).length,
  strictExactEditionVerified:rows.filter(r=>r.match?.evidence?.exactEditionVerified===true).length,
  note:"No individual PriceCharting prices, offer URLs, photos, IDs or buyer/seller data exported. All candidates REVIEW."
 };
}

async function main(){
 const args=process.argv.slice(2);
 const fixture=args.includes("--fixture");
 const real=args.includes("--live");
 const outArg=args.find(v=>v.startsWith("--out="));
 const out=outArg?outArg.slice(6):"benchmarks/pricecharting-private-review-pilot";
 if(fixture===real)throw Error("Choose exactly one of --fixture or --live.");
 const token=String(process.env.PRICECHARTING_TOKEN||"").trim();
 if(real&&!token)throw Error("PRICECHARTING_TOKEN required only for --live.");
 const client=fixture?makeReviewFixtureClient():createPriceChartingClient({token});
 const result=await searchUsPriceChartingReview({game:"Tomba!",platform:"PS1"},{client});
 const summary=reviewPilotSummary(result);
 summary.fixture=fixture;
 await fs.mkdir(path.dirname(out),{recursive:true});
 const json=JSON.stringify(summary,null,2)+"\n";
 if(token&&json.includes(token))throw Error("Token-leak check failed");
 await fs.writeFile(out+".json",json,"utf8");
 if(fixture){
  await fs.writeFile(out+".html",renderPrivateReviewHtml(result),"utf8");
  console.log("Wrote SYNTHETIC preview HTML and fixture summary.");
 }else{
  console.log("Wrote aggregate-only live API smoke-check summary. No licensed listing values saved.");
 }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 main().catch(err=>{
   // never log arbitrary provider errors that might contain URL authentication params
   console.error("Private pilot failed: "+String(err?.code||"review_pilot_failed"));
   process.exitCode=1;
 });
}
