import test from "node:test";
import assert from "node:assert/strict";

import {createSearchMatcher} from "../shared/search-matcher-core.js";
import {createPALScoutClassifier} from "../shared/palscout-core.js";
import {matchRecord,notificationPayload} from "../backend/monitor-core.js";

const matcher=createSearchMatcher();
function target(overrides={}){
 return {
  game:"Tombi!",platform:"PS1",releasePreference:"uk-only",editionPreference:"original",
  completeness:"cib",englishRequired:true,excludeBundles:true,excludePromo:true,
  condition:"no-major",maxDeliveredGbp:80,
  ...overrides
 };
}
function candidate(edition="Original / black label",overrides={}){
 return {
  source:"fixture",externalId:"synthetic-1",title:"Tombi! original UK PS1",
  currency:"GBP",deliveredGbp:40,
  classification:{
   game:"Tombi!",platform:"PS1",marketBucket:"UK_EXACT",
   compatibility:{state:"compatible"},edition,completeness:"complete",
   englishFriendly:true,isBundle:false,isPromo:false,majorDamage:false,confidence:"High"
  },
  ...overrides
 };
}

test("an explicit original edition is eligible, but an unflagged edition is REVIEW",()=>{
 const confirmed=matcher.evaluate(target(),candidate());
 assert.equal(confirmed.state,"MATCH");
 assert.equal(confirmed.deliveredGbp,40);

 const unflagged=matcher.evaluate(target(),candidate("Original / not flagged"));
 assert.equal(unflagged.state,"REVIEW");
 assert.ok(unflagged.reasons.some(r=>/Edition is not confirmed/.test(r)));
 assert.equal(matcher.evaluate(target({editionPreference:"budget-ok"}),candidate("Original / not flagged")).state,"REVIEW");
 assert.equal(matcher.evaluate(target({editionPreference:"any"}),candidate("Original / not flagged")).state,"MATCH");
});

test("PALScout's default unflagged edition must never be treated as verified original",()=>{
 const classifier=createPALScoutClassifier();
 const detection=classifier.detectEdition("Tombi! PAL PS1 complete with manual");
 assert.equal(detection,"Original / not flagged");
 assert.equal(matcher.evaluate(target(),candidate(detection)).state,"REVIEW");
 for(const edition of ["", "unknown", "Unverified", "Not original", "non-original"]){
  assert.equal(matcher.evaluate(target(),candidate(edition)).state,"REVIEW",edition);
 }
});

test("known reissues and unofficial copies remain excluded from an original search",()=>{
 for(const edition of ["Platinum","Budget / reissue","Demo / promo"]){
  assert.equal(matcher.evaluate(target(),candidate(edition)).state,"FILTERED",edition);
 }
 for(const edition of ["Reproduction","Replica copy","Counterfeit edition","Bootleg"]){
  assert.equal(matcher.evaluate(target(),candidate(edition)).state,"FILTERED",edition);
  assert.equal(matcher.evaluate(target({editionPreference:"any"}),candidate(edition)).state,"FILTERED",edition);
 }
 assert.equal(matcher.evaluate(target({editionPreference:"budget-ok"}),candidate("Platinum")).state,"MATCH");
});

test("missing or malformed delivered prices cannot satisfy a price ceiling",()=>{
 for(const missing of [null, undefined, "", "  ", NaN, Infinity, -1, "unknown", false]){
  const row=candidate("Original / black label",{currency:"USD",deliveredGbp:missing});
  const result=matcher.evaluate(target(),row);
  assert.equal(result.state,"REVIEW",String(missing));
  assert.equal(result.deliveredGbp,null,String(missing));
  assert.ok(result.reasons.some(r=>/Delivered GBP price is not available/.test(r)));
 }
 const realZero=matcher.evaluate(target(),candidate("Original / black label",{deliveredGbp:0}));
 assert.equal(realZero.state,"MATCH");
 assert.equal(realZero.deliveredGbp,0);
});

test("GBP total fallback requires a genuine supplied amount",()=>{
 for(const total of [null,undefined,"", "  ",Infinity,-1]){
  const result=matcher.evaluate(target(),candidate("Original / black label",{deliveredGbp:null,total}));
  assert.equal(result.state,"REVIEW",String(total));
  assert.equal(result.deliveredGbp,null,String(total));
 }
 const fromTotal=matcher.evaluate(target(),candidate("Original / black label",{deliveredGbp:null,total:"65.50"}));
 assert.equal(fromTotal.state,"MATCH");
 assert.equal(fromTotal.deliveredGbp,65.5);

 const above=matcher.evaluate(target(),candidate("Original / black label",{deliveredGbp:95}));
 assert.equal(above.state,"FILTERED");
 assert.equal(above.deliveredGbp,95);
});

test("saved-hunt records and notifications preserve missing prices as unknown",()=>{
 const hunt={id:"synthetic-hunt",label:"Tombi!",target:target(),status:"ACTIVE",alertRequested:true};
 const row={source:"synthetic",externalId:"item-001",title:"Tombi! copy",
  canonicalUrl:"https://stock.example.test/item-001",match:{state:"MATCH",deliveredGbp:null}};
 const record=matchRecord(hunt.id,row,"2026-11-17T00:00:00Z");
 const notice=notificationPayload(hunt,row,"2026-11-17T00:00:00Z");
 assert.equal(record.deliveredGbp,null);
 assert.equal(notice.listing.deliveredGbp,null);
 row.match.deliveredGbp="33.49";
 assert.equal(matchRecord(hunt.id,row).deliveredGbp,33.49);
 assert.equal(notificationPayload(hunt,row).listing.deliveredGbp,33.49);
});
