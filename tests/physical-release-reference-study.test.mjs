import test from "node:test";
import assert from "node:assert/strict";
import {
 listReleaseStudyCases, getReleaseStudyCase,
 inspectReleaseStudyObservations, inspectReleaseStudyPacket
} from "../shared/physical-release-reference-study.js";
import {qualifyingMatches} from "../backend/monitor-core.js";

const NOW=new Date("2026-11-17T18:00:00Z");
const H=n=>String(n).padStart(64,"0");
function observations(ref){
 return {
  platform:ref.platform,edition:ref.edition,packageBarcode:ref.packageBarcode,
  ...(ref.packagingCode?{packagingCode:ref.packagingCode}:{}),
  discSerials:ref.gameDiscSerials.map((serial,i)=>({index:i+1,serial}))
 };
}
function image(kind,i,discNumber){
 return {kind,sha256:H(i),origin:"USER",...(discNumber?{discNumber}:{})};
}
function photoSet(discs){
 const res=[
  image("front_cover",1),image("back_cover",2),image("spine",3),
  image("open_case",4),image("manual",5),image("identifier_closeup",6)
 ];
 for(let i=1;i<=discs;i++){
  res.push(image("disc_label",10+i,i));
  res.push(image("disc_data_side",20+i,i));
 }
 return res;
}
function packet(ref,overrides={}){
 return {
  releaseId:ref.id,
  listing:{source:"synthetic",externalId:"SYNTHETIC-ITEM",snapshotHash:H(900),
   snapshotAt:"2026-11-17T17:30:00Z"},
  target:{completeness:"cib",expectedDiscCount:999,gameId:"FORGED-EXTERNAL"},
  observations:observations(ref),
  photos:photoSet(ref.expectedGameDiscCount),
  ...overrides
 };
}
const check=p=>inspectReleaseStudyPacket(p,{now:NOW});

test("exactly four distinct researched categories with explicit provenance and no approval",()=>{
 const rows=listReleaseStudyCases();
 assert.equal(rows.length,4);
 assert.deepEqual(new Set(rows.map(x=>x.category)),new Set([
  "UK_ORIGINAL_BARCODE_CASE","SHARED_PAL_AMBIGUITY_CASE",
  "THREE_GAME_DISCS_AND_ORIGINAL_CASE","PLATINUM_REISSUE_DISTINCTION"
 ]));
 for(const row of rows){
  const ref=getReleaseStudyCase(row.id);
  assert.equal(ref.curationStatus,"PUBLIC_RESEARCH_NOT_SPECIMEN_VERIFIED");
  assert.equal(ref.rightsStatus,"NO_THIRD_PARTY_MEDIA_OR_DATA_REUSE_GRANTED");
  assert.ok(ref.sources.length>=2);
  assert.equal(ref.expectedGameDiscCount,ref.gameDiscSerials.length);
  assert.ok(Object.isFrozen(ref));
  assert.ok(Object.isFrozen(ref.gameDiscSerials));
 }
 assert.equal(getReleaseStudyCase("__proto__"),null);
 assert.equal(getReleaseStudyCase({id:"vagrant-story-ps1-uk-original"}),null);
});

test("Vagrant Story UK original: game serial alone is insufficient; alternate barcode conflicts",()=>{
 const ref=getReleaseStudyCase("vagrant-story-ps1-uk-original");
 assert.equal(ref.expectedGameDiscCount,1);
 assert.equal(ref.gameDiscSerials[0],"SLES-02754");
 let obs=observations(ref);
 delete obs.packageBarcode;
 let r=inspectReleaseStudyObservations(ref.id,obs);
 assert.equal(r.status,"REFERENCE_EVIDENCE_INCOMPLETE");
 assert.ok(r.missingEvidence.includes("PACKAGE_BARCODE"));
 r=inspectReleaseStudyObservations(ref.id,{...observations(ref),packageBarcode:"4036636200480"});
 assert.equal(r.status,"REFERENCE_CONFLICT");
 assert.ok(r.conflictCodes.includes("KNOWN_ALTERNATE_PACKAGE_BARCODE"));
 assert.equal(inspectReleaseStudyObservations(ref.id,observations(ref)).status,
  "RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED");
});

test("Silent Hill shared PAL serial and barcode never establish exact UK territory",()=>{
 const ref=getReleaseStudyCase("silent-hill-ps1-pal-shared-uk-market");
 assert.equal(ref.gameDiscSerials[0],"SLES-01514");
 assert.equal(ref.packagingCode,"2555660/A");
 assert.equal(ref.territorialUniqueness,"UK_AND_OTHER_PAL_POSSIBLE");
 let o=observations(ref);delete o.packagingCode;
 assert.ok(inspectReleaseStudyObservations(ref.id,o).missingEvidence.includes("PACKAGING_VARIANT_CODE"));
 const full=inspectReleaseStudyObservations(ref.id,observations(ref));
 assert.equal(full.status,"SHARED_PAL_MARKET_REVIEW");
 assert.ok(full.missingEvidence.includes("COUNTRY_SPECIFIC_PACKAGING_CORROBORATION"));
 assert.equal(full.canPromoteToMatch,false);
 const alternate=inspectReleaseStudyObservations(ref.id,{...observations(ref),packagingCode:"2555660/B"});
 assert.equal(alternate.status,"REFERENCE_CONFLICT");
 assert.ok(alternate.conflictCodes.includes("PACKAGING_VARIANT_CONFLICT"));
});

test("Final Fantasy VII UK original needs all THREE discs and original packaging",()=>{
 const ref=getReleaseStudyCase("final-fantasy-vii-ps1-uk-original");
 assert.equal(ref.expectedGameDiscCount,3);
 assert.deepEqual(ref.gameDiscSerials,["SCES-00867","SCES-10867","SCES-20867"]);
 const missing=inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),discSerials:observations(ref).discSerials.slice(0,2)
 });
 assert.equal(missing.status,"REFERENCE_EVIDENCE_INCOMPLETE");
 assert.ok(missing.missingEvidence.includes("GAME_DISC_SERIAL:3"));
 const changed=inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),discSerials:[
   {index:1,serial:"SCES-00867"},
   {index:2,serial:"SCES-10867"},
   {index:3,serial:"SCES-00868"}
  ]
 });
 assert.equal(changed.status,"REFERENCE_CONFLICT");
 assert.ok(changed.conflictCodes.includes("GAME_DISC_SERIAL_CONFLICT:3"));
 const platinum=inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),packageBarcode:"0711719736820"
 });
 assert.equal(platinum.status,"REFERENCE_CONFLICT");
 assert.ok(platinum.conflictCodes.includes("KNOWN_ALTERNATE_PACKAGE_BARCODE"));
});

test("Silent Hill 2 Director's Cut Platinum differs from original and other country packages",()=>{
 const ref=getReleaseStudyCase("silent-hill-2-directors-cut-ps2-uk-platinum");
 assert.equal(ref.gameDiscSerials[0],"SLES-51156");
 assert.equal(ref.packagingCode,"7022498");
 assert.equal(inspectReleaseStudyObservations(ref.id,observations(ref)).status,
  "RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED");
 const original=inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),discSerials:[{index:1,serial:"SLES-50382"}],edition:"original"
 });
 assert.equal(original.status,"REFERENCE_CONFLICT");
 assert.ok(original.conflictCodes.includes("EDITION_CONFLICT"));
 assert.ok(original.conflictCodes.includes("GAME_DISC_SERIAL_CONFLICT:1"));
 const foreign=inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),packagingCode:"7022504"
 });
 assert.equal(foreign.status,"REFERENCE_CONFLICT");
});

test("packet uses trusted authored game-disc count, ignoring client-forged count and title",()=>{
 const ref=getReleaseStudyCase("final-fantasy-vii-ps1-uk-original");
 const p=packet(ref);
 const full=check(p);
 assert.equal(full.releaseReview.status,"RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED");
 assert.equal(full.photoReview.status,"EVIDENCE_PACK_ASSEMBLED");
 assert.equal(full.photoReview.photosConsidered,12);
 assert.equal(full.canPromoteToMatch,false);
 assert.equal(full.canTriggerVerifiedAlert,false);
 assert.equal(full.photoReview.canPromoteToMatch,false);
 const partial=check({...p,photos:p.photos.filter(x=>!(x.kind==="disc_label"&&x.discNumber===3))});
 assert.equal(partial.photoReview.status,"EVIDENCE_REQUIRED");
 assert.ok(partial.photoReview.missingViews.includes("disc_label:3"));
});

test("every reference remains unverified regardless of supplied evidence and fake approvals",()=>{
 for(const row of listReleaseStudyCases()){
  const ref=getReleaseStudyCase(row.id),p=packet(ref,{
   verified:true,reviewerApproved:true,isAdmin:true,matchState:"MATCH",
   observations:{...observations(ref),verified:true,reviewerId:"trusted"},
   listing:{...packet(ref).listing,verified:true,reviewerApproved:true}
  });
  const res=check(p);
  assert.equal(res.verificationState,"UNVERIFIED");
  assert.equal(res.canPromoteToMatch,false);
  assert.equal(res.canTriggerVerifiedAlert,false);
  assert.equal(res.releaseReview.canPromoteToMatch,false);
  assert.equal(qualifyingMatches([{source:"synthetic",externalId:ref.id,match:{state:res.releaseReview.status}}]).length,0);
 }
});

test("bad input, duplicate discs and unregistered references fail closed",()=>{
 const ref=getReleaseStudyCase("vagrant-story-ps1-uk-original");
 assert.equal(inspectReleaseStudyObservations("does-not-exist",observations(ref)).status,"REFERENCE_NOT_FOUND");
 assert.equal(inspectReleaseStudyObservations(ref.id,null).status,"INVALID_OBSERVATIONS");
 assert.equal(inspectReleaseStudyObservations(ref.id,{discSerials:{1:"SLES-02754"}}).status,"INVALID_OBSERVATIONS");
 assert.equal(inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),discSerials:[{index:1,serial:"SLES-02754"},{index:1,serial:"SLES-02754"}]
 }).status,"INVALID_OBSERVATIONS");
 assert.equal(inspectReleaseStudyObservations(ref.id,{
  ...observations(ref),discSerials:[{index:9,serial:"SLES-02754"}]
 }).status,"INVALID_OBSERVATIONS");
 assert.equal(check({...packet(ref),releaseId:"forged-reference",target:{expectedDiscCount:1}}).photoReview,null);
});

test("packets never reflect private seller fields, hashes or arbitrary source strings",()=>{
 const ref=getReleaseStudyCase("vagrant-story-ps1-uk-original");
 const p=packet(ref,{
  listing:{...packet(ref).listing,externalId:"PRIVATE-SECRETS-SELLER",description:"SENSITIVE-TEXT"},
  extraSecret:"my-password-ABC",photos:photoSet(1)
 });
 const result=check(p);
 const serialized=JSON.stringify(result);
 for(const v of ["PRIVATE-SECRETS-SELLER","SENSITIVE-TEXT","my-password-ABC",H(900)]){
  assert.equal(serialized.includes(v),false,v);
 }
 assert.equal(result.canPromoteToMatch,false);
});
