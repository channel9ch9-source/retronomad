import test from "node:test";
import assert from "node:assert/strict";

import {createSearchMatcher} from "../shared/search-matcher-core.js";
import {createPALScoutClassifier} from "../shared/palscout-core.js";
import {classifyCandidate, evaluateNormalizedCandidates} from "../backend/search-engine.js";
import {qualifyingMatches, shouldQueueNotification} from "../backend/monitor-core.js";

// Entire test collection is synthetic. No outside marketplace, user, or
// licensed game-catalogue data is fetched or copied here.
const matcher=createSearchMatcher();
const target={
  game:"Tombi!",platform:"PS1",releasePreference:"uk-preferred",
  editionPreference:"any",completeness:"any",
  englishRequired:false,excludeBundles:false,excludePromo:false,
  condition:"any",maxDeliveredGbp:null
};
const listing=(description)=>({
  source:"fixture",externalId:"synthetic-copy-1",
  title:"Tombi! PS1 PAL UK original black label",
  description,deliveredGbp:24.5,currency:"GBP",
  canonicalUrl:"https://fixtures.example.test/offer"
});

test("PALScout explicitly marks seller-derived information as unverified evidence",()=>{
  const c=createPALScoutClassifier().classifyListing(listing("Original complete in box CIB, SCES-01330, verified by seller"),{platform:"PS1"});
  assert.equal(c.physicalCopyEvidence,"SELLER_CLAIMS_UNVERIFIED");
  assert.equal(typeof c.itemType,"string");
});

test("seller's CIB, barcode, UK and original claims cannot independently make MATCH",()=>{
  const scenarios=[
    "Original release complete in box, all inserts, SCES-01330",
    "CIB black label UK verified, serial SCES-01330, actual item photos",
    "Factory sealed, perfect condition, verified authentic seller",
    "Original edition first pressing, all manuals included"
  ];
  for(const description of scenarios){
    const row=classifyCandidate(target,listing(description));
    assert.equal(row.match.state,"REVIEW",description);
    assert.ok(row.match.reasons.some(reason=>reason.includes("not been independently verified")),description);
    assert.equal(qualifyingMatches([row]).length,0,"No Saved Hunt MATCH alert on seller claims");
    assert.equal(shouldQueueNotification({status:"ACTIVE",alertRequested:true},row),false);
  }
});

test("case, cover, empty-box and no-game listings are FILTERED even with ANY completeness",()=>{
  const scenarios=[
    "Case only - no game",
    "Manual and artwork only - no disc",
    "Replacement case with cover",
    "Empty box and cover art",
    "Original black label - game not included",
    "CIB - disc not included",
    "Original packaging without the game"
  ];
  for(const description of scenarios){
    const row=classifyCandidate(target,listing(description));
    assert.equal(row.match.state,"FILTERED",description);
    assert.ok(row.match.reasons.some(reason=>/non-game|usable game copy/i.test(reason)),description);
  }
});

test("manual-only offers must be excluded; playable disc-only offers are review candidates",()=>{
  for(const description of ["Manual only, mint", "Instruction booklet only", "Box only, mint"]){
    const row=classifyCandidate(target,listing(description));
    assert.equal(row.match.state,"FILTERED",description);
  }
  const discOnly=classifyCandidate(target,listing("Disc only, no case"));
  assert.equal(discOnly.match.state,"REVIEW");
  assert.equal(qualifyingMatches([discOnly]).length,0);
});

test("missing a game disc is FILTERED under any completeness preference",()=>{
  for(const completeness of ["any","cib","manual-optional","loose-ok"]){
    const row=classifyCandidate({...target,completeness},listing("Original complete box, missing disc 2"));
    assert.equal(row.match.state,"FILTERED",completeness);
    assert.ok(row.match.reasons.some(reason=>/disc|copy/i.test(reason)),completeness);
  }
});

test("conflicting fields are not upgraded merely because one field says CIB",()=>{
  const fakeClassification={
    game:"Tombi!",platform:"PS1",marketBucket:"UK_EXACT",
    itemType:"CASE_ONLY",compatibility:{state:"compatible"},
    edition:"Original / black label",completeness:"complete",
    englishFriendly:true,isBundle:false,isPromo:false,majorDamage:false
  };
  const result=matcher.evaluate(target,{classification:fakeClassification,deliveredGbp:29});
  assert.equal(result.state,"FILTERED");
  assert.ok(result.reasons.some(r=>/non-game item/i.test(r)));

  const noDisc=matcher.evaluate(target,{classification:{
    ...fakeClassification,itemType:"GAME",completeness:"CIB but no game"
  },deliveredGbp:29});
  assert.equal(noDisc.state,"FILTERED");
});

test("no blanket exclusion of playable loose discs when buyer accepts them",()=>{
 const row=classifyCandidate(target,listing("Loose PS1 game disc only, no case"));
 assert.equal(row.match.state,"REVIEW");
 const cib=classifyCandidate({...target,completeness:"cib"},listing("Loose PS1 game disc only, no case"));
 assert.equal(cib.match.state,"FILTERED");
});

test("provider-neutral pipeline does not queue seller-only MATCH alerts",()=>{
 const rows=evaluateNormalizedCandidates(target,[
  listing("Original complete in box UK version actual item photos"),
  {...listing("Case only - no game"),externalId:"synthetic-copy-2"}
 ]);
 assert.equal(rows.length,2);
 assert.equal(rows.some(r=>r.match.state==="MATCH"),false);
 assert.equal(qualifyingMatches(rows).length,0);
 assert.equal(rows.some(r=>r.match.state==="FILTERED"),true);
});
