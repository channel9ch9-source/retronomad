import test from "node:test";
import assert from "node:assert/strict";
import {handlePublicPriceChartingSearch,publicReviewPayload,PUBLIC_PC_PATH} from "../backend/pricecharting-public.js";

function fakeGate(){
 const rows=new Map();
 return {rows,prepare(sql){
  return {bind(...params){
   return {async run(){
    if(sql.includes("'global'")){
     const [until,now]=params;
     const old=rows.get("global");
     if(old&&old.valid_until>now)return {meta:{changes:0}};
     rows.set("global",{count:1,valid_until:until});
     return {meta:{changes:1}};
    }
    const [key,until,max]=params,old=rows.get(key);
    if(old&&old.count>=max)return {meta:{changes:0}};
    rows.set(key,{count:(old?.count||0)+1,valid_until:until});
    return {meta:{changes:1}};
   }};
  }};
 }};
}
function fakeCache(){
 const map=new Map();
 return {
  async match(req){return map.get(req.url)?.clone()||null;},
  async put(req,value){map.set(req.url,value.clone());},
  count(){return map.size;}
 };
}
function env(){
 return {PRICECHARTING_PUBLIC_ENABLED:"true",PRICECHARTING_TOKEN:"SECRET-PRIVATE-API-TOKEN",DB:fakeGate()};
}
function request(game="Tomba!",platform="PS1",method="GET"){
 const url="https://grailraven.com"+PUBLIC_PC_PATH+"?platform="+encodeURIComponent(platform)+"&game="+encodeURIComponent(game);
 return new Request(url,{method,headers:{"cf-connecting-ip":"203.0.113.42"}});
}
function fixtureRow(){
 return {source:"pricecharting",title:"Tomba!",platform:"PS1",
  canonicalUrl:"https://www.pricecharting.com/offer/offer-123",
  imageUrl:"https://www.pricecharting.com/img/demo.jpg",
  itemPrice:134,completenessClaim:"Game, Box, and Manual",
  conditionClaim:"Normal wear",description:"Seller wrote CIB",currency:"USD",
  match:{state:"REVIEW",reasons:["US physical cover is not verified"]},
  attribution:{url:"https://www.pricecharting.com/offers?product=123"},
  externalId:"SECRET-RAW-ID",seller:"SECRET-SELLER",buyer:{email:"SECRET-EMAIL"},raw:{token:"SECRET"}};
}
test("public US Marketplace returns only whitelisted REVIEW fields with visible attribution and unknown shipping",async()=>{
 const e=env(),cache=fakeCache();
 const out=await handlePublicPriceChartingSearch(request(),e,{
  cache,hashFn:async()=>"HASHED-IP",now:1_000_000,
  search:async target=>{assert.deepEqual(target,{game:"Tomba!",platform:"PS1"});return {rows:[fixtureRow()]};}
 });
 assert.equal(out.status,200);
 const j=await out.json();
 assert.equal(j.classification,"REVIEW_ONLY");
 assert.equal(j.candidates.length,1);
 assert.equal(j.candidates[0].status,"REVIEW");
 assert.equal(j.candidates[0].itemPrice,134);
 assert.equal(j.candidates[0].postage,null);
 assert.equal(j.candidates[0].deliveredTotal,null);

 assert.match(j.notice,/not a verified delivered total/);
 assert.match(j.notice,/shipping already included in the listing price are unconfirmed/);
 assert.doesNotMatch(j.notice,/prices exclude postage|item only/i);
 assert.equal(j.candidates[0].currency,"USD");
 assert.equal(j.candidates[0].attribution.url,"https://www.pricecharting.com/offers?product=123");
 assert.equal(j.candidates[0].url,"https://www.pricecharting.com/offer/offer-123");
 const text=JSON.stringify(j);
 assert.doesNotMatch(text,/SECRET-|buyer|raw|externalId|token|seller@/i);
 assert.equal(out.headers.get("cache-control"),"no-store");
 assert.equal(cache.count(),1);
 assert.equal(e.DB.rows.has("global"),true);
});

test("repeated same search uses 5-minute edge cache without additional provider requests",async()=>{
 const e=env(),cache=fakeCache();let calls=0;
 const opts={cache,hashFn:async()=>"HASHED-IP",now:2_000_000,search:async()=>{calls++;return {rows:[fixtureRow()]};}};
 const first=await handlePublicPriceChartingSearch(request(),e,opts);
 const second=await handlePublicPriceChartingSearch(request(),e,opts);
 assert.equal(first.status,200);assert.equal(second.status,200);
 assert.equal(calls,1);
});
test("global DB gate blocks concurrent uncached searches and remains fail-closed",async()=>{
 const e=env(),cache=fakeCache();let calls=0;
 const opts={cache,hashFn:async()=>"HASHED-IP",now:3_000_000,search:async()=>{calls++;return {rows:[fixtureRow()]};}};
 const a=await handlePublicPriceChartingSearch(request("Tomba!"),e,opts);
 const b=await handlePublicPriceChartingSearch(request("Silent Hill"),e,opts);
 assert.equal(a.status,200);assert.equal(b.status,429);
 assert.equal((await b.json()).error,"search_cooling_down");
 assert.equal(calls,1);
 const later=await handlePublicPriceChartingSearch(request("Silent Hill"),e,{...opts,now:3_030_001});
 assert.equal(later.status,200);assert.equal(calls,2);
 const noDb=await handlePublicPriceChartingSearch(request(),{...env(),DB:null},{search:opts.search,cache:null,hashFn:async()=>""});
 assert.equal(noDb.status,503);
});
test("rejects invalid and unsupported requests before API calls",async()=>{
 const e=env();let count=0;
 const opts={cache:null,hashFn:async()=>"",search:async()=>{count++;return {rows:[]};}};
 for(const req of [request("A"),request("Tomba!","PS5"),request("Tomba!","PS1","POST"),
   new Request("https://grailraven.com"+PUBLIC_PC_PATH+"?game=Tomba!&platform=PS1&token=xx")]){
   const o=await handlePublicPriceChartingSearch(req,e,opts);
   assert.ok([400,405].includes(o.status));
 }
 assert.equal(count,0);
 const disabled=await handlePublicPriceChartingSearch(request(),{...e,PRICECHARTING_PUBLIC_ENABLED:"false"},opts);
 assert.equal(disabled.status,503);
});
test("never publishes unsafe or misclassified listings",()=>{
 const base=fixtureRow();
 const out=publicReviewPayload({rows:[
  {...base,match:{state:"MATCH"}},
  {...base,canonicalUrl:"https://evil.invalid/offer/wrong"},
  {...base,itemPrice:NaN},
  base
 ]});
 assert.equal(out.candidates.length,1);
 assert.equal(out.candidates[0].status,"REVIEW");
 assert.deepEqual(out.candidates[0].reviewReasons,["US physical cover is not verified"]);
});
