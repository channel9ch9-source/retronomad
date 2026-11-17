import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 REAL_PHOTO_PILOT_VERSION,listRealPhotoPilotSources,
 getRealPhotoPilotSource,assessRealPhotoPilotSource,assessRealPhotoPilotBundle
} from "../prototypes/real-evidence-pilot/public-photo-evidence.js";

const FFVII="final-fantasy-vii-ps1-uk-original";

test("five individually sourced real photographed objects, one explicitly illustrative",()=>{
 assert.equal(REAL_PHOTO_PILOT_VERSION,1);
 const rows=listRealPhotoPilotSources();
 assert.equal(rows.length,5);
 assert.equal(new Set(rows.map(x=>x.id)).size,5);
 assert.equal(rows.filter(x=>x.physicalSubject==="ILLUSTRATIVE_CASE_WITH_PAPER_PROPS").length,1);
 assert.equal(rows.every(x=>x.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:")),true);
 assert.equal(rows.every(x=>x.author&&x.reportedPhotoLicense),true);
 assert.equal(rows.every(x=>x.bytesIngested===false&&x.sha256===null),true);
 assert.equal(rows.every(x=>x.photoRightsFinding.includes("FURTHER_RIGHTS_REVIEW_REQUIRED")),true);
});

test("source provenance is versionable, licence-specific, frozen and cannot be rewritten",()=>{
 const rows=listRealPhotoPilotSources();
 for(const summary of rows){
  const x=getRealPhotoPilotSource(summary.id);
  assert.ok(x.sourceRevision.includes("&oldid="));
  assert.equal(x.reportedPhotoLicense,summary.reportedPhotoLicense);
  assert.ok(x.licenseUrl.startsWith("https://"));
  assert.ok(x.notEstablished.length>=4);
  assert.ok(x.directlyVisible.length>0);
  assert.equal(Object.isFrozen(x),true);
  assert.equal(Object.isFrozen(x.directlyVisible),true);
 }
 assert.equal(getRealPhotoPilotSource("__proto__"),null);
 assert.equal(getRealPhotoPilotSource({id:rows[0].id}),null);
});

test("a photo of FFVII spines can support a printed three-disc label, not three physical discs",()=>{
 const r=assessRealPhotoPilotSource("commons-ffvii-ix-case-spines",{releaseId:FFVII});
 assert.equal(r.status,"PUBLIC_PHOTO_LIMITED_EVIDENCE");
 assert.ok(r.visuallyObserved.includes("THREE_DISCS_SPINE_MARKING"));
 assert.ok(r.unsupportedClaims.includes("ALL_THREE_PHYSICAL_DISCS_PRESENT"));
 assert.ok(r.unsupportedClaims.includes("UK_PAL_EDITION"));
 assert.ok(r.unsupportedClaims.includes("GAME_DISC_SERIALS"));
 assert.ok(r.blockingCodes.includes("NO_ITEM_SPECIFIC_SELLER_BINDING"));
 assert.equal(r.canPromoteToMatch,false);
});

test("uploader's FFVII caption cannot be treated as visual evidence of the disc label",()=>{
 const r=assessRealPhotoPilotSource("commons-ffvii-claimed-disc-rear",{releaseId:FFVII});
 assert.ok(r.visuallyObserved.includes("BLACK_OPTICAL_DISC_REVERSE"));
 assert.equal(r.visuallyObserved.includes("GAME_TITLE"),false);
 assert.ok(r.unsupportedClaims.includes("ANY_FFVII_DISC_SERIAL"));
 assert.ok(r.blockingCodes.includes("GAME_TITLE_ONLY_IN_SOURCE_CAPTION"));
 assert.equal(r.sha256,null);
});

test("visible damaged PS2 disc is condition-reference evidence, not an assertion about an active seller's stock",()=>{
 const r=assessRealPhotoPilotSource("commons-ps2-central-crack",{releaseId:FFVII});
 assert.ok(r.visuallyObserved.includes("VISIBLE_CENTRAL_RADIAL_CRACK"));
 assert.ok(r.unsupportedClaims.includes("SAME_SELLER_COPY"));
 assert.ok(r.unsupportedClaims.includes("GAME_TITLE"));
 assert.ok(r.blockingCodes.includes("NO_DIRECT_LINK_TO_REQUESTED_GAME"));
 assert.equal(r.canPromoteToMatch,false);
});

test("reflective PlayStation 2 disc branding cannot identify game, PAL territory or ownership",()=>{
 const r=assessRealPhotoPilotSource("commons-ps2-reflective-disc");
 assert.ok(r.visuallyObserved.includes("PS2_BRANDING_ON_DATA_SIDE"));
 assert.ok(r.unsupportedClaims.includes("GAME_TITLE"));
 assert.ok(r.unsupportedClaims.includes("SELLER_ITEM_IDENTITY"));
 assert.equal(r.sourceIsSellerBound,false);
});

test("paper props inside an actual case must be rejected as game/manual specimen evidence",()=>{
 const r=assessRealPhotoPilotSource("commons-ps2-case-with-paper-props");
 assert.equal(r.status,"ILLUSTRATION_NOT_SPECIMEN");
 assert.ok(r.visuallyObserved.includes("HANDWRITTEN_PAPER_GAME_DISK_PROP"));
 assert.ok(r.unsupportedClaims.includes("ACTUAL_GAME_DISC_PRESENT"));
 assert.ok(r.unsupportedClaims.includes("ACTUAL_GAME_MANUAL_PRESENT"));
 assert.ok(r.blockingCodes.includes("PROP_PHOTO_NOT_ACTUAL_GAME_COMPONENTS"));
 assert.equal(r.canPromoteToMatch,false);
});

test("cross-photographer photos cannot be combined into a fictional complete FFVII seller copy",()=>{
 const b=assessRealPhotoPilotBundle([
  "commons-ffvii-ix-case-spines","commons-ffvii-claimed-disc-rear"
 ],{releaseId:FFVII});
 assert.equal(b.status,"UNBOUND_PUBLIC_PHOTO_SET");
 assert.equal(b.sourceCount,2);
 assert.equal(b.independentAuthors,2);
 assert.equal(b.cannotInferSingleSellerCopy,true);
 assert.equal(b.cannotInferCompleteness,true);
 assert.equal(b.imageBytesIngested,0);
 assert.ok(b.photoChecklistSlotsNotCertified.includes("disc_label"));
 assert.equal(b.canPromoteToMatch,false);
 assert.equal(b.canTriggerVerifiedAlert,false);
});

test("any bundle of valid sources remains unverified and ineligible for exact-copy monitoring",()=>{
 const ids=listRealPhotoPilotSources().map(x=>x.id);
 const b=assessRealPhotoPilotBundle(ids,{releaseId:FFVII});
 assert.equal(b.sourceCount,5);
 assert.equal(b.independentAuthors,5);
 assert.equal(b.verificationState,"UNVERIFIED");
 assert.equal(b.canPromoteToMatch,false);
 assert.equal(b.canTriggerVerifiedAlert,false);
 assert.equal(b.photoRightsFinding,"UPLOADER_LICENSE_RECORDED_FURTHER_RIGHTS_REVIEW_REQUIRED");
});

test("unknown refs, duplicate/invalid source bundles and unsupported references fail closed",()=>{
 assert.equal(assessRealPhotoPilotSource("bad").status,"SOURCE_NOT_REGISTERED");
 const invalid=assessRealPhotoPilotSource("commons-ffvii-ix-case-spines",{releaseId:"nonexistent"});
 assert.ok(invalid.blockingCodes.includes("RELEASE_REFERENCE_NOT_FOUND"));
 const ids=[
  [],["fake"],["commons-ffvii-ix-case-spines","commons-ffvii-ix-case-spines"],null,
  [null]
 ];
 for(const v of ids){
  const r=assessRealPhotoPilotBundle(v,{releaseId:FFVII});
  assert.ok(["INVALID_SOURCE_SET","UNKNOWN_SOURCE_IN_BUNDLE"].includes(r.status));
  assert.equal(r.canPromoteToMatch,false);
 }
});

test("pilot contains no photo bytes, remote-fetch integrations or secret production state",()=>{
 const text=readFileSync(new URL("../prototypes/real-evidence-pilot/public-photo-evidence.js",import.meta.url),"utf8");
 assert.doesNotMatch(text,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b/);
 assert.doesNotMatch(text,/https?:\/\/upload\.wikimedia\.org/);
 assert.doesNotMatch(text,/\bAPI_KEY\b|\bADMIN_TOKEN\b|\bD1_DATABASE\b/);
 assert.doesNotMatch(text,/\bprocess\.env\b|\bcrypto\.subtle\.digest\b/);
 const build=readFileSync(new URL("../scripts/build-cloudflare.mjs",import.meta.url),"utf8");
 assert.doesNotMatch(build,/cp\(join\(root,"prototypes"/);
});
