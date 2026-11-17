import test from "node:test";
import assert from "node:assert/strict";
import {
 inspectPhysicalCopyReviewPacket,
 PHYSICAL_COPY_REVIEW_CHECKS
} from "../shared/physical-copy-review-core.js";

const NOW = new Date("2026-11-17T18:00:00.000Z");
const H = n => String(n).padStart(64,"0");
function packet(overrides={}){
 const base={
  schemaVersion:1,
  listing:{
   source:"synthetic",externalId:"offline-001",
   snapshotHash:H(100),snapshotAt:"2026-11-17T17:00:00Z"
  },
  target:{gameId:"fixture-game",platform:"PS1",market:"UK",
   completeness:"cib",expectedDiscCount:1},
  photos:[]
 };
 return {...base,...overrides};
}
function photo(kind,n=1,discNumber){
 return {kind,origin:"SELLER",sha256:H(n),
  ...(discNumber==null?{}:{discNumber})};
}
function allCibPhotos(){
 return [
  photo("front_cover",1),photo("back_cover",2),photo("spine",3),
  photo("open_case",4),photo("identifier_closeup",5),
  photo("manual",6),photo("disc_label",7,1),
  photo("disc_data_side",8,1)
 ];
}
const inspect=p=>inspectPhysicalCopyReviewPacket(p,{now:NOW});

test("photo requirements are explicit, stable and reviewed; no images is not verified",()=>{
 const r=inspect(packet());
 assert.equal(r.status,"EVIDENCE_REQUIRED");
 assert.ok(r.missingViews.includes("manual"));
 assert.ok(r.missingViews.includes("disc_label:1"));
 assert.equal(r.verificationState,"UNVERIFIED");
 assert.equal(r.canPromoteToMatch,false);
 assert.equal(r.canTriggerVerifiedAlert,false);
 assert.equal(r.requiresAuthenticatedHumanReview,true);
 assert.equal(r.photoAuthenticity,"NOT_ESTABLISHED");
 assert.equal(r.rightsReview,"NOT_PERFORMED");
 assert.ok(PHYSICAL_COPY_REVIEW_CHECKS.includes("UPSTREAM_RIGHTS_AND_PRIVACY"));
});

test("even a complete seller photo set is only assembled, NEVER a verified MATCH",()=>{
 const p=packet({photos:allCibPhotos()});
 const result=inspect(p);
 assert.equal(result.status,"EVIDENCE_PACK_ASSEMBLED");
 assert.deepEqual(result.missingViews,[]);
 assert.equal(result.canPromoteToMatch,false);
 assert.equal(result.canTriggerVerifiedAlert,false);
 assert.equal(result.verificationState,"UNVERIFIED");
 assert.equal(result.photosConsidered,8);
 assert.equal(result.presentViews.length,8);
 assert.equal(JSON.stringify(result).includes("offline-001"),false);
 assert.equal(JSON.stringify(result).includes(H(7)),false);
});

test("untrusted client approval fields cannot change verification status",()=>{
 const p=packet({
  photos:allCibPhotos(),verified:true,matchState:"MATCH",
  reviewer:{trusted:true,approved:true,role:"admin"},
  listing:{...packet().listing,verified:true,isOfficial:true},
  target:{...packet().target,verified:true}
 });
 const result=inspect(p);
 assert.equal(result.status,"EVIDENCE_PACK_ASSEMBLED");
 assert.equal(result.canPromoteToMatch,false);
 assert.equal(result.canTriggerVerifiedAlert,false);
});

test("a missing disc, manual or identifier view remains a missing-evidence packet",()=>{
 for(const omitted of ["disc_label","disc_data_side","manual","identifier_closeup"]){
  const r=inspect(packet({photos:allCibPhotos().filter(x=>x.kind!==omitted)}));
  assert.equal(r.status,"EVIDENCE_REQUIRED",omitted);
  assert.ok(r.missingViews.some(x=>x.startsWith(omitted)),omitted);
 }
});

test("manual-optional still requires the game, case and identifier, but not manual",()=>{
 const p=packet({
  target:{...packet().target,completeness:"manual-optional"},
  photos:allCibPhotos().filter(x=>x.kind!=="manual")
 });
 assert.equal(inspect(p).status,"EVIDENCE_PACK_ASSEMBLED");
 const missingCase=packet({...p,photos:p.photos.filter(x=>x.kind!=="open_case")});
 assert.equal(inspect(missingCase).status,"EVIDENCE_REQUIRED");
});

test("loose-ok and any allow disc evidence without assuming a case/manual",()=>{
 for(const completeness of ["loose-ok","any"]){
  const p=packet({
   target:{...packet().target,completeness},
   photos:[photo("disc_label",1,1),photo("disc_data_side",2,1)]
  });
  assert.equal(inspect(p).status,"EVIDENCE_PACK_ASSEMBLED",completeness);
  assert.equal(inspect(p).canPromoteToMatch,false);
 }
});

test("multi-disc titles need separately accounted-for photos of every disc",()=>{
 const p=packet({target:{...packet().target,expectedDiscCount:3},
  photos:[...allCibPhotos(),
   photo("disc_label",9,2),photo("disc_data_side",10,2)]});
 const needs=inspect(p);
 assert.equal(needs.status,"EVIDENCE_REQUIRED");
 assert.ok(needs.missingViews.includes("disc_label:3"));
 assert.ok(needs.missingViews.includes("disc_data_side:3"));
 const full=packet({...p,photos:[
  ...p.photos,photo("disc_label",11,3),photo("disc_data_side",12,3)
 ]});
 assert.equal(inspect(full).status,"EVIDENCE_PACK_ASSEMBLED");
});

test("unknown reference disc count prevents even photo-checklist readiness",()=>{
 const p=packet({target:{...packet().target,expectedDiscCount:null},
  photos:allCibPhotos()});
 const r=inspect(p);
 assert.equal(r.status,"REFERENCE_REQUIRED");
 assert.ok(r.flags.includes("EXPECTED_DISC_COUNT_NOT_CURATED"));
 assert.equal(r.canPromoteToMatch,false);
});

test("reused photo for distinct views and a wrong disc index must fail closed",()=>{
 const reused=allCibPhotos();
 reused[1]={...reused[1],sha256:reused[0].sha256};
 const r=inspect(packet({photos:reused}));
 assert.equal(r.status,"CONFLICTING_EVIDENCE");
 assert.ok(r.flags.includes("IMAGE_REUSED_ACROSS_DISTINCT_VIEWS"));
 const extra=inspect(packet({photos:[
  ...allCibPhotos(),photo("disc_label",9,2)
 ]}));
 assert.equal(extra.status,"CONFLICTING_EVIDENCE");
 assert.ok(extra.flags.includes("UNEXPECTED_DISC_INDEX"));
});

test("stale or future snapshot never qualifies for manual checklist readiness",()=>{
 for(const date of ["2026-10-15T00:00:00Z","2026-11-17T18:10:00Z"]){
  const p=packet({listing:{...packet().listing,snapshotAt:date},
   photos:allCibPhotos()});
  assert.equal(inspect(p).status,"CONFLICTING_EVIDENCE",date);
  assert.ok(inspect(p).flags.includes("LISTING_SNAPSHOT_STALE_OR_FUTURE"));
 }
});

test("invalid identities, hashes, media index, sources and packet size fail closed",()=>{
 const base=packet({photos:allCibPhotos()});
 const invalid=[
  {},null,packet({schemaVersion:2}),
  packet({listing:{...base.listing,snapshotHash:"bad"}}),
  packet({target:{...base.target,platform:"Switch"}}),
  packet({target:{...base.target,expectedDiscCount:0}}),
  packet({target:{...base.target,expectedDiscCount:9}}),
  packet({photos:[{...photo("manual"),origin:"ADMIN"}]}),
  packet({photos:[photo("disc_label",1,0)]}),
  packet({photos:[{...photo("manual"),discNumber:2}]}),
  packet({photos:[{...photo("manual"),sha256:"not-a-digest"}]}),
  packet({photos:new Array(61).fill(photo("manual",1))})
 ];
 for(const row of invalid){
  const r=inspect(row);
  assert.equal(r.status,"INVALID_PACKET");
  assert.equal(r.canPromoteToMatch,false);
 }
});

test("evidence results avoid returning sensitive raw input values",()=>{
 const p=packet({
  photos:allCibPhotos(),
  listing:{...packet().listing,externalId:"PRIVATE-ITEM-XYZ"},
  sellerEmail:"seller@example.test",
  buyerData:{privateNotes:"do not emit"},
  target:{...packet().target,gameId:"PRIVATE-TITLE"}
 });
 const result=inspect(p);
 const serialized=JSON.stringify(result);
 assert.equal(result.status,"EVIDENCE_PACK_ASSEMBLED");
 for(const value of ["PRIVATE-ITEM-XYZ","seller@example.test","PRIVATE-TITLE","do not emit",H(100)]){
  assert.equal(serialized.includes(value),false,value);
 }
});
