// GrailRaven real-world evidence PILOT — manually inspected, source-linked
// photographs of physical objects. NOT photos of offered marketplace listings.
//
// Important: source-file copyright tags are manually recorded from the linked
// Wikimedia Commons pages; they are NOT independently verified image rights
// to all underlying game artwork. Photos were visually reviewed via external
// web preview, NOT downloaded into this codebase, hashed or ingested by a
// GrailRaven media service. Image hashes MUST NEVER be invented.
//
// This study tests conservative evidence reasoning, not image recognition,
// seller ownership, physical authenticity or completeness of a seller's copy.
import {getReleaseStudyCase} from "../../shared/physical-release-reference-study.js";

const freeze=x=>{
 if(x&&typeof x==="object"&&!Object.isFrozen(x)){
  for(const value of Object.values(x))freeze(value);
  Object.freeze(x);
 }
 return x;
};
const SOURCES=freeze([
 {
  id:"commons-ffvii-ix-case-spines",
  sourcePage:"https://commons.wikimedia.org/wiki/File:Final_Fantasy_VII-IX_game_cases_1.JPG",
  sourceRevision:"https://commons.wikimedia.org/w/index.php?title=File:Final_Fantasy_VII-IX_game_cases_1.JPG&oldid=1139807776",
  author:"BrokenSphere",
  reportedPhotoLicense:"CC-BY-SA-3.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
  physicalSubject:"ACTUAL_CASES_MULTIPLE_ITEMS",
  associatedResearchGame:"Final Fantasy VII",
  directlyVisible:[
   "FINAL_FANTASY_VII_SPINE_TITLE",
   "THREE_DISCS_SPINE_MARKING",
   "MULTIPLE_DIFFERENT_PHYSICAL_CASES"
  ],
  notEstablished:[
   "ONE_SELLER_COPY","UK_PAL_EDITION","ALL_THREE_PHYSICAL_DISCS_PRESENT",
   "GAME_DISC_SERIALS","CASE_REVERSE_BARCODE","MANUAL_PRESENT",
   "GENUINE_ITEM_AUTHENTICITY"
  ],
  observation:"Photograph shows several distinct PlayStation jewel-case spines. An FFVII case has a printed three-discs label; no game discs or exact UK barcode are shown. A printed count is not a contents audit.",
  gameSpecificVisualEvidence:true,
  illustrationOnly:false
 },
 {
  id:"commons-ffvii-claimed-disc-rear",
  sourcePage:"https://commons.wikimedia.org/wiki/File:CD-ROM_for_PlayStation.jpg",
  sourceRevision:"https://commons.wikimedia.org/w/index.php?title=File:CD-ROM_for_PlayStation.jpg&oldid=1105527312",
  author:"PiaCarrot",
  reportedPhotoLicense:"CC-BY-SA-3.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
  physicalSubject:"DISC_DATA_SIDE",
  associatedResearchGame:"Final Fantasy VII",
  directlyVisible:["BLACK_OPTICAL_DISC_REVERSE"],
  notEstablished:[
   "DISC_LABEL_TITLE","ANY_FFVII_DISC_SERIAL","DISC_NUMBER",
   "UK_PAL_EDITION","ALL_THREE_PHYSICAL_DISCS_PRESENT",
   "ONE_SELLER_COPY","GENUINE_ITEM_AUTHENTICITY"
  ],
  observation:"Commons caption names Final Fantasy VII as the sample disc, but photograph only shows the dark data side. The face label and specific disc serial cannot be checked visually.",
  gameSpecificVisualEvidence:false,
  illustrationOnly:false
 },
 {
  id:"commons-ps2-central-crack",
  sourcePage:"https://commons.wikimedia.org/wiki/File:Disc_Crack_From_Case.jpg",
  sourceRevision:"https://commons.wikimedia.org/w/index.php?title=File:Disc_Crack_From_Case.jpg&oldid=1206287988",
  author:"CRTGAMER",
  reportedPhotoLicense:"PUBLIC_DOMAIN_SELF_DEDICATION",
  licenseUrl:"https://commons.wikimedia.org/wiki/File:Disc_Crack_From_Case.jpg",
  physicalSubject:"DAMAGED_DISC_DATA_SIDE",
  associatedResearchGame:null,
  directlyVisible:["PHYSICAL_DISC","VISIBLE_CENTRAL_RADIAL_CRACK"],
  notEstablished:[
   "GAME_TITLE","EDITION","DISC_SERIAL","SAME_SELLER_COPY",
   "CURRENT_DISC_PLAYABILITY","GENUINE_ITEM_AUTHENTICITY"
  ],
  observation:"Visible crack runs from centre hub toward readable surface on an actual-looking PS2 disc. This is condition evidence about the photographed item, not any seller's current item.",
  gameSpecificVisualEvidence:false,
  illustrationOnly:false
 },
 {
  id:"commons-ps2-reflective-disc",
  sourcePage:"https://commons.wikimedia.org/wiki/File:PS2dvd.jpg",
  sourceRevision:"https://commons.wikimedia.org/w/index.php?title=File:PS2dvd.jpg&oldid=1200434552",
  author:"DiscoverYellow",
  reportedPhotoLicense:"CC-BY-SA-3.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
  physicalSubject:"PS2_DISC_DATA_SIDE",
  associatedResearchGame:null,
  directlyVisible:["REFLECTIVE_OPTICAL_DISC","PS2_BRANDING_ON_DATA_SIDE"],
  notEstablished:[
   "GAME_TITLE","UK_PAL_EDITION","GAME_DISC_SERIAL",
   "SELLER_ITEM_IDENTITY","GENUINE_ITEM_AUTHENTICITY","DISC_PLAYABILITY"
  ],
  observation:"Reflective side includes PlayStation 2-branded markers, but cannot establish any particular game release, buyer target, authenticity or condition guarantee.",
  gameSpecificVisualEvidence:false,
  illustrationOnly:false
 },
 {
  id:"commons-ps2-case-with-paper-props",
  sourcePage:"https://commons.wikimedia.org/wiki/File:PlayStation_2_Game_Case_-_Inside.jpg",
  sourceRevision:"https://commons.wikimedia.org/w/index.php?title=File:PlayStation_2_Game_Case_-_Inside.jpg&oldid=1239133046",
  author:"Aya19790",
  reportedPhotoLicense:"CC-BY-SA-4.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
  physicalSubject:"ILLUSTRATIVE_CASE_WITH_PAPER_PROPS",
  associatedResearchGame:null,
  directlyVisible:["CASE_LAYOUT","HANDWRITTEN_PAPER_GAME_MANUAL_PROP","HANDWRITTEN_PAPER_GAME_DISK_PROP"],
  notEstablished:[
   "ACTUAL_GAME_DISC_PRESENT","ACTUAL_GAME_MANUAL_PRESENT","GAME_TITLE",
   "GAME_DISC_SERIAL","GENUINE_ITEM_AUTHENTICITY"
  ],
  observation:"A real plastic case is photographed, but the so-called disc and manual are paper props. This image must NEVER count as actual game contents or CIB proof.",
  gameSpecificVisualEvidence:false,
  illustrationOnly:true
 }
]);

const BY_ID=new Map(SOURCES.map(x=>[x.id,x]));
const ALL_EXPECTED_PHOTO_VIEWS=[
 "front_cover","back_cover","spine","open_case","manual",
 "identifier_closeup","disc_label","disc_data_side"
];
export const REAL_PHOTO_PILOT_VERSION=1;

export function listRealPhotoPilotSources(){
 return SOURCES.map(x=>({
  id:x.id,sourcePage:x.sourcePage,author:x.author,
  reportedPhotoLicense:x.reportedPhotoLicense,
  physicalSubject:x.physicalSubject,
  observedFeatureCount:x.directlyVisible.length,
  // This flag never gives permission to reproduce all depicted game artwork.
  photoRightsFinding:"UPLOADER_LICENSE_RECORDED_FURTHER_RIGHTS_REVIEW_REQUIRED",
  bytesIngested:false,sha256:null
 }));
}
export function getRealPhotoPilotSource(id){
 return typeof id==="string"?BY_ID.get(id)||null:null;
}
export function assessRealPhotoPilotSource(id,{releaseId=null}={}){
 const source=getRealPhotoPilotSource(id);
 if(!source)return {
  status:"SOURCE_NOT_REGISTERED",verificationState:"UNVERIFIED",
  canPromoteToMatch:false,canTriggerVerifiedAlert:false
 };
 const ref=releaseId===null?null:getReleaseStudyCase(releaseId);
 const knownRelease=releaseId===null||ref!==null;
 const subjectCompatible=!!ref&&source.associatedResearchGame===ref.game;
 const codes=[
  "NO_ITEM_SPECIFIC_SELLER_BINDING",
  "NO_SERVER_INGESTED_IMAGE_HASH",
  "NO_ITEM_SPECIMEN_AUTHENTICATION",
  "PHOTO_RIGHTS_REQUIRE_PER_USE_REVIEW",
  "INCOMPLETE_MULTIVIEW_EVIDENCE"
 ];
 if(!knownRelease)codes.push("RELEASE_REFERENCE_NOT_FOUND");
 if(ref&&!subjectCompatible)codes.push("NO_DIRECT_LINK_TO_REQUESTED_GAME");
 if(source.illustrationOnly)codes.push("PROP_PHOTO_NOT_ACTUAL_GAME_COMPONENTS");
 if(source.associatedResearchGame&&!source.gameSpecificVisualEvidence)
  codes.push("GAME_TITLE_ONLY_IN_SOURCE_CAPTION");
 return {
  status:source.illustrationOnly?"ILLUSTRATION_NOT_SPECIMEN":
   "PUBLIC_PHOTO_LIMITED_EVIDENCE",
  referenceId:ref?.id||null,
  photoSourceId:source.id,
  visuallyObserved:[...source.directlyVisible],
  unsupportedClaims:[...source.notEstablished],
  blockingCodes:codes.sort(),
  photoRightsFinding:"UPLOADER_LICENSE_RECORDED_FURTHER_RIGHTS_REVIEW_REQUIRED",
  bytesIngested:false,
  sha256:null,
  sourceIsSellerBound:false,
  verificationState:"UNVERIFIED",
  canPromoteToMatch:false,
  canTriggerVerifiedAlert:false
 };
}

// These photos belong to different authors, dates and physical specimens.
// Never combine them to fabricate a single complete, owned, in-stock copy.
export function assessRealPhotoPilotBundle(sourceIds,{releaseId=null}={}){
 if(!Array.isArray(sourceIds)||sourceIds.length===0||sourceIds.length>20||
  sourceIds.some(x=>typeof x!=="string")||
  new Set(sourceIds).size!==sourceIds.length){
  return {
   status:"INVALID_SOURCE_SET",verificationState:"UNVERIFIED",
   canPromoteToMatch:false,canTriggerVerifiedAlert:false
  };
 }
 const rows=sourceIds.map(id=>assessRealPhotoPilotSource(id,{releaseId}));
 if(rows.some(x=>x.status==="SOURCE_NOT_REGISTERED"))return {
  status:"UNKNOWN_SOURCE_IN_BUNDLE",verificationState:"UNVERIFIED",
  canPromoteToMatch:false,canTriggerVerifiedAlert:false
 };
 const sources=sourceIds.map(getRealPhotoPilotSource);
 return{
  status:"UNBOUND_PUBLIC_PHOTO_SET",
  sourceCount:sources.length,
  independentAuthors:new Set(sources.map(x=>x.author)).size,
  photoChecklistSlotsNotCertified:[...ALL_EXPECTED_PHOTO_VIEWS],
  cannotInferSingleSellerCopy:true,
  cannotInferCompleteness:true,
  photoRightsFinding:"UPLOADER_LICENSE_RECORDED_FURTHER_RIGHTS_REVIEW_REQUIRED",
  imageBytesIngested:0,
  verificationState:"UNVERIFIED",
  canPromoteToMatch:false,canTriggerVerifiedAlert:false
 };
}
