// GrailRaven release-reference research fixtures, offline only.
//
// These are compact first-party-authored summaries of publicly researched
// *historical facts*, with source URLs. They are NOT independently inspected
// physical specimens, production catalogue imports, source licences, trusted
// reviewer approvals, or rights to distribute others' images/records.
//
// Do not accept reference definitions from user/provider-controlled JSON.
import {inspectPhysicalCopyReviewPacket} from "./physical-copy-review-core.js";

const deepFreeze = x => {
 if(x && typeof x==="object" && !Object.isFrozen(x)){
  for(const val of Object.values(x))deepFreeze(val);
  Object.freeze(x);
 }
 return x;
};
const STUDIES=deepFreeze([
 {
  id:"vagrant-story-ps1-uk-original",
  game:"Vagrant Story",platform:"PS1",market:"UK",edition:"original",
  category:"UK_ORIGINAL_BARCODE_CASE",
  gameDiscSerials:["SLES-02754"],
  packageBarcode:"4036636200459",
  packagingCode:null,
  knownOtherBarcodes:["4036636200480"],
  territorialUniqueness:"UK_MARKET_RESEARCH_CANDIDATE",
  caution:"SLES-02754 also appears on Italy/Spain packaging; country must not be inferred from the game disc alone.",
  sources:[
   "https://www.psxpaldb.com/years/2000/",
   "https://psxdatacenter.com/games/P/V/SLES-02754.html"
  ]
 },
 {
  id:"silent-hill-ps1-pal-shared-uk-market",
  game:"Silent Hill",platform:"PS1",market:"UK",edition:"original",
  category:"SHARED_PAL_AMBIGUITY_CASE",
  gameDiscSerials:["SLES-01514"],
  packageBarcode:"4988602555660",
  packagingCode:"2555660/A",
  knownOtherBarcodes:["4988602068597"],
  territorialUniqueness:"UK_AND_OTHER_PAL_POSSIBLE",
  caution:"Serial and EAN are used in several PAL countries. The /A package code also appears in Scandinavia; even its presence is not unique UK proof.",
  sources:[
   "https://www.psxpaldb.com/games/silent-hill/",
   "https://www.silenthillmemories.net/sh1/versions_en.htm",
   "https://crimson-ceremony.net/lostreleases/item.php?id=shgame_sh1-ps1-eur1"
  ]
 },
 {
  id:"final-fantasy-vii-ps1-uk-original",
  game:"Final Fantasy VII",platform:"PS1",market:"UK",edition:"original",
  category:"THREE_GAME_DISCS_AND_ORIGINAL_CASE",
  gameDiscSerials:["SCES-00867","SCES-10867","SCES-20867"],
  packageBarcode:"0711719694328",
  packagingCode:null,
  knownOtherBarcodes:["0711719736820"],
  territorialUniqueness:"UK_MARKET_RESEARCH_CANDIDATE",
  caution:"The original and Platinum UK editions reuse the same disc serials. Packaging evidence is essential to distinguish them. Additional inserts need specimen-level CIB research.",
  sources:[
   "https://www.psxpaldb.com/games/final-fantasy-vii/",
   "https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/data",
   "https://serialstation.com/releases/18f46606-d38d-41a3-9538-b6562fcfb942"
  ]
 },
 {
  id:"silent-hill-2-directors-cut-ps2-uk-platinum",
  game:"Silent Hill 2: Director's Cut",platform:"PS2",market:"UK",edition:"platinum",
  category:"PLATINUM_REISSUE_DISTINCTION",
  gameDiscSerials:["SLES-51156"],
  packageBarcode:"4012927022498",
  packagingCode:"7022498",
  knownOtherBarcodes:["4012927021101"],
  territorialUniqueness:"UK_MARKET_RESEARCH_CANDIDATE",
  caution:"Do not confuse this Director's Cut Platinum copy with original Silent Hill 2 (SLES-50382), or infer the market from shared SLES-51156 alone.",
  sources:[
   "https://www.silenthillmemories.net/sh2/versions_en.htm",
   "https://vgcollect.com/item/33688",
   "https://psxdatacenter.com/psx2/games2/SLES-51156.html"
  ]
 }
].map(x=>({...x,curationStatus:"PUBLIC_RESEARCH_NOT_SPECIMEN_VERIFIED",rightsStatus:"NO_THIRD_PARTY_MEDIA_OR_DATA_REUSE_GRANTED",expectedGameDiscCount:x.gameDiscSerials.length})));

const INDEX=new Map(STUDIES.map(x=>[x.id,x]));
export const RELEASE_STUDY_SCHEMA_VERSION=1;
export function listReleaseStudyCases(){
 return STUDIES.map(x=>({id:x.id,game:x.game,category:x.category,
  expectedGameDiscCount:x.expectedGameDiscCount,curationStatus:x.curationStatus}));
}
export function getReleaseStudyCase(id){
 return typeof id==="string"?INDEX.get(id)||null:null;
}
function plain(x){return x!==null && typeof x==="object" && !Array.isArray(x);}
function normSerial(x){return typeof x==="string"?x.toUpperCase().trim().replace(/[\s-]+/g,""):null;}
function normBarcode(x){return typeof x==="string"?x.trim().replace(/[\s-]+/g,""):null;}
function normCode(x){return typeof x==="string"?x.toUpperCase().trim().replace(/[\s-]+/g,""):null;}
function result(status,{missing=[],conflicts=[],reference=null}={}){
 return {
  schemaVersion:RELEASE_STUDY_SCHEMA_VERSION,
  status,
  referenceId:reference?.id||null,
  curationStatus:reference?.curationStatus||"UNKNOWN",
  territorialUniqueness:reference?.territorialUniqueness||"UNKNOWN",
  missingEvidence:missing.sort(),
  conflictCodes:conflicts.sort(),
  verificationState:"UNVERIFIED",
  canPromoteToMatch:false,
  canTriggerVerifiedAlert:false,
  requiresHumanSpecimenReview:true
 };
}

// Observe *claims* only. A release research fixture does not authenticate
// photographs, copied serials, barcodes, seller promises or physical items.
export function inspectReleaseStudyObservations(referenceId,observations={}){
 const ref=getReleaseStudyCase(referenceId);
 if(!ref)return result("REFERENCE_NOT_FOUND");
 if(!plain(observations)||observations.discSerials!==undefined&&!Array.isArray(observations.discSerials)){
  return result("INVALID_OBSERVATIONS",{reference:ref,conflicts:["OBSERVATION_SCHEMA_INVALID"]});
 }
 const discs=observations.discSerials||[];
 if(discs.length>8||Object.keys(observations).length>20){
  return result("INVALID_OBSERVATIONS",{reference:ref,conflicts:["OBSERVATION_SCHEMA_INVALID"]});
 }
 const missing=[],conflicts=[],indexes=new Set();
 for(const disc of discs){
  if(!plain(disc)||!Number.isInteger(disc.index)||disc.index<1||disc.index>8||
     typeof disc.serial!=="string"||!/^[A-Z0-9 -]{4,32}$/i.test(disc.serial)||
     indexes.has(disc.index)){
   return result("INVALID_OBSERVATIONS",{reference:ref,conflicts:["DISC_OBSERVATION_INVALID"]});
  }
  indexes.add(disc.index);
  if(disc.index>ref.expectedGameDiscCount)conflicts.push("UNEXPECTED_GAME_DISC_NUMBER");
  else if(normSerial(disc.serial)!==normSerial(ref.gameDiscSerials[disc.index-1]))
   conflicts.push("GAME_DISC_SERIAL_CONFLICT:"+disc.index);
 }
 for(let i=1;i<=ref.expectedGameDiscCount;i++)if(!indexes.has(i))missing.push("GAME_DISC_SERIAL:"+i);
 if(observations.platform!==undefined){
  if(typeof observations.platform!=="string")return result("INVALID_OBSERVATIONS",{reference:ref});
  if(observations.platform!==ref.platform)conflicts.push("PLATFORM_CONFLICT");
 }else missing.push("PLATFORM_CLAIM");
 if(observations.edition!==undefined){
  if(typeof observations.edition!=="string"||observations.edition.length>50)return result("INVALID_OBSERVATIONS",{reference:ref});
  if(observations.edition.toLowerCase().trim()!==ref.edition)conflicts.push("EDITION_CONFLICT");
 }else missing.push("EDITION_CLAIM");
 if(observations.packageBarcode!==undefined){
  if(typeof observations.packageBarcode!=="string"||!/^[0-9 -]{8,25}$/.test(observations.packageBarcode))
   return result("INVALID_OBSERVATIONS",{reference:ref});
  if(normBarcode(observations.packageBarcode)!==ref.packageBarcode)
   conflicts.push(ref.knownOtherBarcodes.includes(normBarcode(observations.packageBarcode))?"KNOWN_ALTERNATE_PACKAGE_BARCODE":"PACKAGE_BARCODE_CONFLICT");
 }else missing.push("PACKAGE_BARCODE");
 if(ref.packagingCode!==null){
  if(observations.packagingCode!==undefined){
   if(typeof observations.packagingCode!=="string"||!/^[A-Z0-9 /-]{3,40}$/i.test(observations.packagingCode))
    return result("INVALID_OBSERVATIONS",{reference:ref});
   if(normCode(observations.packagingCode)!==normCode(ref.packagingCode))conflicts.push("PACKAGING_VARIANT_CONFLICT");
  }else missing.push("PACKAGING_VARIANT_CODE");
 }
 if(conflicts.length)return result("REFERENCE_CONFLICT",{reference:ref,missing,conflicts});
 if(missing.length)return result("REFERENCE_EVIDENCE_INCOMPLETE",{reference:ref,missing});
 if(ref.territorialUniqueness==="UK_AND_OTHER_PAL_POSSIBLE")
  return result("SHARED_PAL_MARKET_REVIEW",{reference:ref,missing:["COUNTRY_SPECIFIC_PACKAGING_CORROBORATION"]});
 return result("RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED",{reference:ref});
}

// The releaseId points to a fixed, authored rule, NEVER a client-supplied
// reference body or disc-count value. The existing evidence checklist remains
// unprivileged and can *only* say that photo slots are labelled as present.
export function inspectReleaseStudyPacket(packet,{now=new Date()}={}){
 const id=packet?.releaseId,ref=getReleaseStudyCase(id);
 if(!ref){
  return {releaseReview:result("REFERENCE_NOT_FOUND"),
   photoReview:null,verificationState:"UNVERIFIED",canPromoteToMatch:false,canTriggerVerifiedAlert:false};
 }
 const releaseReview=inspectReleaseStudyObservations(id,packet?.observations||{});
 const t=plain(packet?.target)?packet.target:{};
 const photoReview=inspectPhysicalCopyReviewPacket({
  schemaVersion:RELEASE_STUDY_SCHEMA_VERSION,
  listing:packet?.listing,
  target:{
   gameId:ref.id,platform:ref.platform,market:ref.market,
   completeness:t.completeness,expectedDiscCount:ref.expectedGameDiscCount
  },
  photos:packet?.photos
 },{now});
 return {releaseReview,photoReview,
  verificationState:"UNVERIFIED",canPromoteToMatch:false,canTriggerVerifiedAlert:false};
}
