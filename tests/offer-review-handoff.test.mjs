import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const handoff=readFileSync(new URL("../listing-handoff.js",import.meta.url),"utf8");
const search=readFileSync(new URL("../search.html",import.meta.url),"utf8");
const market=readFileSync(new URL("../marketplace-us-public.js",import.meta.url),"utf8");
const checker=readFileSync(new URL("../analyze.html",import.meta.url),"utf8");
function harness(query="?grOfferReview=1"){
  const data=new Map(),els=new Map();
  const keys=["listingUrl","title","platform","desc","complete","identifier","english",
    "price","postage","offerReviewContext","offerReviewIntro","offerReviewOriginal","offerReviewProgress"];
  for(const id of keys)els.set(id,{value:"",checked:false,hidden:true,textContent:"",href:"",addEventListener(){}});
  const checks=Array.from({length:4},()=>({checked:false,handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}}));
  const storage={
    getItem:k=>data.get(k)??null,
    setItem:(k,v)=>data.set(k,v),
    removeItem:k=>data.delete(k)
  };
  const window={location:{search:query},sessionStorage:storage};
  const document={getElementById:id=>els.get(id),querySelectorAll:selector=>selector==="[data-offer-review-check]"?checks:[]};
  vm.runInNewContext(handoff,{window,document,URL,URLSearchParams,Date,JSON,Number,String,Set,Array});
  return {api:window.GrailRavenListingHandoff,els,checks,data,storage};
}
const sample={title:"Suikoden II Playstation US CIB",description:"Seller says complete with manual",url:"https://www.pricecharting.com/offer/abc_123",itemPrice:189.99};
test("only deliberate valid PriceCharting US offer candidates can be handed off",()=>{
  const {api}=harness();
  assert.equal(api.storeCandidate(sample,{game:"Suikoden II",platform:"PS1"}),true);
  for(const url of ["http://www.pricecharting.com/offer/abc","https://evil.example/offer/abc",
    "https://www.pricecharting.com/offer/abc?redirect=1","https://www.pricecharting.com/price/abc"]){
    assert.equal(api.storeCandidate({...sample,url},{game:"Suikoden II",platform:"PS1"}),false);
  }
  assert.equal(api.storeCandidate(sample,{game:"Suikoden II",platform:"Wii"}),false);
});
test("US handoff pre-fills only seller claims and retains REVIEW without false GBP or UK proof",()=>{
  const {api,els,checks,data}=harness();
  assert.equal(api.storeCandidate(sample,{game:"Suikoden II",platform:"PS1"}),true);
  assert.equal(api.consumeAndPrefill(),true);
  assert.equal(els.get("title").value,sample.title);
  assert.equal(els.get("platform").value,"PS1");
  assert.equal(els.get("listingUrl").value,sample.url);
  assert.equal(els.get("desc").value,sample.description);
  assert.equal(els.get("price").value,"");
  assert.equal(els.get("postage").value,"");
  assert.equal(els.get("identifier").value,"");
  assert.equal(els.get("complete").value,"unknown");
  assert.equal(els.get("english").checked,false);
  assert.equal(els.get("offerReviewContext").hidden,false);
  assert.match(els.get("offerReviewProgress").textContent,/REVIEW/);
  checks[0].checked=true;checks[0].handlers.change();
  assert.match(els.get("offerReviewProgress").textContent,/1 of 4/);
  assert.match(els.get("offerReviewProgress").textContent,/REVIEW/);
  assert.equal(data.size,0,"one-time payload is consumed");
  assert.equal(api.consumeAndPrefill(),false);
});
test("handoff is confined to same tab, opt-in navigation and a recent payload",()=>{
  const h=harness("?from=elsewhere");
  assert.equal(h.api.storeCandidate(sample,{game:"Suikoden II",platform:"PS1"}),true);
  assert.equal(h.api.consumeAndPrefill(),false);
  assert.equal(h.data.size,1);
  const stale=harness();
  assert.equal(stale.api.storeCandidate(sample,{game:"Suikoden II",platform:"PS1"}),true);
  const [key]=stale.data.keys();
  const value=JSON.parse(stale.data.get(key));
  value.createdAt=Date.now()-11*60*1000;
  stale.data.set(key,JSON.stringify(value));
  assert.equal(stale.api.consumeAndPrefill(),false);
  assert.equal(stale.data.size,0);
});
test("both pages include handoff runtime and retain the original listing link",()=>{
  assert.match(search,/<script src="listing-handoff.js"><\/script>/);
  assert.match(checker,/<script src="listing-handoff.js"><\/script>/);
  assert.match(market,/Check this copy in Listing Checker/);
  assert.match(market,/View actual offer and seller photographs/);
  assert.match(market,/if\(!saved\)return/);
  assert.match(checker,/id="offerReviewContext" hidden/);
  assert.match(checker,/data-offer-review-check/);
  assert.match(checker,/US Marketplace offer · REVIEW only/);
});
