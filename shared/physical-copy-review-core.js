// GrailRaven offline evidence-packet completeness checker.
//
// IMPORTANT: this module NEVER verifies a physical copy, authenticates a
// reviewer, inspects photographs, grants source rights, or returns MATCH.
// Its only job is to identify missing/contradictory photo evidence before a
// separate, authenticated human review workflow exists.
const PHOTO_KINDS = new Set([
 "front_cover", "back_cover", "spine", "open_case", "manual",
 "identifier_closeup", "disc_label", "disc_data_side", "insert"
]);
const ORIGINS = new Set(["SELLER", "RETAILER", "USER"]);
const PLATFORMS = new Set(["PS1", "PS2", "Dreamcast"]);
const MARKETS = new Set(["UK", "EU_PAL", "US", "JP"]);
const COMPLETENESS = new Set(["cib", "manual-optional", "loose-ok", "any"]);
const SHA256 = /^[a-f0-9]{64}$/i;
const WEEK = 7 * 24 * 60 * 60 * 1000;
const FIVE_MIN = 5 * 60 * 1000;

export const PHYSICAL_COPY_REVIEW_SCHEMA_VERSION = 1;
export const PHYSICAL_COPY_REVIEW_CHECKS = Object.freeze([
 "IDENTITY_AND_PLATFORM",
 "EDITION_AND_PRINT",
 "MARKET_AND_LANGUAGE",
 "DISC_IDENTIFIERS",
 "REQUIRED_CONTENTS",
 "CONDITION_AND_DAMAGE",
 "IMAGE_ORIGINALITY_AND_CONSISTENCY",
 "LISTING_SNAPSHOT_AND_AVAILABILITY",
 "UPSTREAM_RIGHTS_AND_PRIVACY"
]);

function record(x){return x!==null && typeof x==="object" && !Array.isArray(x);}
function token(x,max=160){return typeof x==="string" && x.length>0 && x.length<=max && x.trim()===x && !/[\u0000-\u001f]/.test(x);}
function sha(x){return typeof x==="string" && SHA256.test(x);}
function result(status,{missingViews=[],flags=[],presentViews=[],photosConsidered=0}={}){
 return {
  schemaVersion:PHYSICAL_COPY_REVIEW_SCHEMA_VERSION,
  status,
  verificationState:"UNVERIFIED",
  canPromoteToMatch:false,
  canTriggerVerifiedAlert:false,
  requiresAuthenticatedHumanReview:true,
  rightsReview:"NOT_PERFORMED",
  photoAuthenticity:"NOT_ESTABLISHED",
  // Do not return photo digests, listing IDs, seller text or private file paths.
  missingViews,
  flags,
  presentViews,
  photosConsidered,
  humanChecks:[...PHYSICAL_COPY_REVIEW_CHECKS]
 };
}

function requirements(target){
 const names=new Set();
 if(target.completeness==="cib"||target.completeness==="manual-optional"){
  for(const view of ["front_cover","back_cover","spine","open_case","identifier_closeup"])names.add(view);
 }
 if(target.completeness==="cib")names.add("manual");
 for(let number=1;number<=target.expectedDiscCount;number++){
  names.add("disc_label:"+number);
  names.add("disc_data_side:"+number);
 }
 return [...names].sort();
}

function mediaSlot(p){
 return p.kind==="disc_label"||p.kind==="disc_data_side"
  ?p.kind+":"+p.discNumber
  :p.kind;
}

// Caller supplies only metadata about images it claims to possess.
// A hash must ultimately be calculated by a trusted ingestion service; a
// client-provided digest is not evidence that the photograph exists.
export function inspectPhysicalCopyReviewPacket(packet,{now=new Date()}={}){
 if(!record(packet)||packet.schemaVersion!==PHYSICAL_COPY_REVIEW_SCHEMA_VERSION||
     !record(packet.listing)||!record(packet.target)||
     !Array.isArray(packet.photos)||packet.photos.length>60){
  return result("INVALID_PACKET",{flags:["PACKET_SHAPE_INVALID"]});
 }
 const list=packet.listing, t=packet.target;
 if(!token(list.source,80)||!token(list.externalId,160)||
     !sha(list.snapshotHash)||!token(t.gameId,160)||
     !PLATFORMS.has(t.platform)||!MARKETS.has(t.market)||
     !COMPLETENESS.has(t.completeness)){
  return result("INVALID_PACKET",{flags:["PACKET_IDENTITY_INVALID"]});
 }
 const at=new Date(now).getTime();
 const snapshotAt=typeof list.snapshotAt==="string"?Date.parse(list.snapshotAt):NaN;
 if(!Number.isFinite(at)||!Number.isFinite(snapshotAt)){
  return result("INVALID_PACKET",{flags:["SNAPSHOT_TIME_INVALID"]});
 }
 const stale=snapshotAt > at+FIVE_MIN || at-snapshotAt>WEEK;
 const discCount=t.expectedDiscCount;
 const hasReference=Number.isInteger(discCount)&&discCount>=1&&discCount<=8;
 if(discCount!=null&&!hasReference){
  return result("INVALID_PACKET",{flags:["EXPECTED_DISC_COUNT_INVALID"]});
 }

 const present=new Set(), digestSlots=new Map(), flags=new Set();
 for(const p of packet.photos){
  if(!record(p)||!PHOTO_KINDS.has(p.kind)||!ORIGINS.has(p.origin)||!sha(p.sha256)){
   return result("INVALID_PACKET",{flags:["PHOTO_METADATA_INVALID"]});
  }
  const disc=p.kind==="disc_label"||p.kind==="disc_data_side";
  if(disc&&(!Number.isInteger(p.discNumber)||p.discNumber<1||p.discNumber>8)||
     !disc&&p.discNumber!==undefined){
   return result("INVALID_PACKET",{flags:["PHOTO_DISC_INDEX_INVALID"]});
  }
  if(disc&&hasReference&&p.discNumber>discCount)flags.add("UNEXPECTED_DISC_INDEX");
  const slot=mediaSlot(p);
  if(digestSlots.has(p.sha256.toLowerCase())&&digestSlots.get(p.sha256.toLowerCase())!==slot){
   flags.add("IMAGE_REUSED_ACROSS_DISTINCT_VIEWS");
  }
  digestSlots.set(p.sha256.toLowerCase(),slot);
  present.add(slot);
 }
 const presentViews=[...present].sort();
 if(stale)flags.add("LISTING_SNAPSHOT_STALE_OR_FUTURE");
 if(flags.size){
  return result("CONFLICTING_EVIDENCE",{flags:[...flags].sort(),presentViews,photosConsidered:packet.photos.length});
 }
 if(!hasReference){
  return result("REFERENCE_REQUIRED",{
   flags:["EXPECTED_DISC_COUNT_NOT_CURATED"],
   presentViews,photosConsidered:packet.photos.length
  });
 }
 const missingViews=requirements(t).filter(x=>!present.has(x));
 return result(missingViews.length?"EVIDENCE_REQUIRED":"EVIDENCE_PACK_ASSEMBLED",{
  missingViews,presentViews,photosConsidered:packet.photos.length
 });
}
