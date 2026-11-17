// GrailRaven reviewer-console OFFLINE READ-ONLY DEMO MODEL.
//
// Browser-accessible, synthetic fixture ONLY. No auth, real permission,
// photo uploads, genuine reviewer privilege, private records, or external IO.
// Never import this model into a production Worker or public app module.
import {assessOfflineReviewerEligibility} from "../../shared/reviewer-access-policy-study.js";
import {inspectReleaseStudyPacket,getReleaseStudyCase} from "../../shared/physical-release-reference-study.js";
import {simulatePhysicalReviewWorkflow} from "../../shared/physical-review-workflow-core.js";
import {PHYSICAL_COPY_REVIEW_CHECKS} from "../../shared/physical-copy-review-core.js";

export const DEMO_TIME="2026-11-17T20:30:00.000Z";
const NOW=new Date(DEMO_TIME);
const hash=n=>String(n).padStart(64,"0");
const FIELDS=["listingSnapshotHash","releaseReferenceId","referenceVersion","targetHash","evidenceManifestHash"];
const VIEWS=["front_cover","back_cover","spine","open_case","manual","identifier_closeup"];
const ITEM_IDS=[
 "vagrant-story-ps1-uk-original",
 "silent-hill-ps1-pal-shared-uk-market",
 "final-fantasy-vii-ps1-uk-original",
 "silent-hill-2-directors-cut-ps2-uk-platinum"
];

function images(discCount,omit=[]){
 const out=[];
 let number=1;
 for(const kind of VIEWS){
  if(!omit.includes(kind))out.push({kind,origin:"USER",sha256:hash(number)});
  number++;
 }
 for(let disc=1;disc<=discCount;disc++){
  for(const kind of ["disc_label","disc_data_side"]){
   const slot=`${kind}:${disc}`;
   if(!omit.includes(slot))out.push({kind,discNumber:disc,origin:"USER",sha256:hash(10+disc*2+(kind==="disc_label"?0:1))});
  }
 }
 return out;
}
function expectedObservations(ref){
 return {
  platform:ref.platform,edition:ref.edition,
  packageBarcode:ref.packageBarcode,
  ...(ref.packagingCode?{packagingCode:ref.packagingCode}:{}),
  discSerials:ref.gameDiscSerials.map((serial,i)=>({index:i+1,serial}))
 };
}
const CASES=ITEM_IDS.map((releaseId,index)=>{
 const ref=getReleaseStudyCase(releaseId);
 const id=`demo-case-${index+1}`;
 const obs=expectedObservations(ref);
 const missingPhotos=index===0?["identifier_closeup","spine"]:
  index===2?["disc_label:3"]:[];
 if(index===0)delete obs.packageBarcode;
 if(index===2)obs.discSerials=obs.discSerials.slice(0,2);
 const listingSnapshotHash=hash(100+index),
  targetHash=hash(200+index),evidenceManifestHash=hash(300+index);
 const assignment=index===3?"reviewer-beta":"reviewer-alpha";
 const binding={
  schemaVersion:1,caseId:id,listingSnapshotHash,
  releaseReferenceId:releaseId,referenceVersion:"research-v1",
  targetHash,evidenceManifestHash,openedAt:"2026-11-17T19:00:00.000Z"
 };
 const eventSpecs=[];
 function add(type,payload={}){
  const n=eventSpecs.length+1;
  const scope=Object.fromEntries(FIELDS.map(f=>[f,binding[f]]));
  eventSpecs.push({
   sequence:n,eventId:`synthetic-${index}-${n}`,
   previousEventId:n===1?null:eventSpecs[n-2].eventId,
   at:new Date(Date.parse(binding.openedAt)+n*60000).toISOString(),
   type,scope,payload
  });
 }
 const packet=inspectReleaseStudyPacket({
  releaseId,
  listing:{source:"synthetic-local-demo",externalId:`fictional-${index+1}`,
   snapshotHash:listingSnapshotHash,snapshotAt:"2026-11-17T19:00:00.000Z"},
  target:{completeness:"cib"},
  observations:obs,photos:images(ref.expectedGameDiscCount,missingPhotos)
 },{now:NOW});
 add("EVIDENCE_ASSESSED",{
  packetStatus:packet.photoReview.status,
  referenceStatus:packet.releaseReview.status
 });
 if(packet.photoReview.status==="EVIDENCE_PACK_ASSEMBLED"&&
  ["SHARED_PAL_MARKET_REVIEW","RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED"].includes(packet.releaseReview.status)){
  if(index===3){
   add("REVIEW_STARTED");
   for(const check of PHYSICAL_COPY_REVIEW_CHECKS.slice(0,4))
    add("CHECK_RECORDED",{check,finding:"CONSISTENT"});
  }
 }
 const workflow=simulatePhysicalReviewWorkflow(binding,eventSpecs,{now:NOW});
 return {
  caseId:id,releaseId,game:ref.game,platform:ref.platform,
  edition:ref.edition,market:ref.market,referenceVersion:binding.referenceVersion,
  assignedTo:assignment,
  rightsStatus:"APPROVED_PRIVATE_REVIEW", // SIMULATED ONLY, not a real licence.
  expiresAt:"2026-11-18T20:30:00.000Z",
  subjectUserId:"demo-seller-does-not-exist",
  binding,packet,workflow,eventSpecs,
  note:index===0?"Packaging barcode and two photo views not supplied":
   index===1?"Shared PAL region cannot be certified as uniquely UK":
   index===2?"Disc 3 serial and labelled image are missing":
   "Four of nine simulated reviewer checks recorded"
 };
});
const SCENARIOS=Object.freeze({
 "reviewer-alpha":{
  actor:{userId:"demo-user-alpha",sessionValid:true,internalReviewerEligible:true,stepUpAt:DEMO_TIME},
  grant:{id:"demo-grant-alpha",subjectUserId:"demo-user-alpha",role:"REVIEWER",grantedAt:"2026-11-17T19:00:00.000Z",expiresAt:"2026-11-18T20:30:00.000Z",revoked:false}
 },
 "reviewer-beta":{
  actor:{userId:"demo-user-beta",sessionValid:true,internalReviewerEligible:true,stepUpAt:DEMO_TIME},
  grant:{id:"demo-grant-beta",subjectUserId:"demo-user-beta",role:"SENIOR_REVIEWER",grantedAt:"2026-11-17T19:00:00.000Z",expiresAt:"2026-11-18T20:30:00.000Z",revoked:false}
 },
 "no-session":{
  actor:{userId:"demo-user-guest",sessionValid:false,internalReviewerEligible:false,stepUpAt:DEMO_TIME},
  grant:null
 }
});
export const DEMO_SCENARIOS=Object.freeze([
 {id:"reviewer-alpha",label:"Reviewer A (simulated)"},
 {id:"reviewer-beta",label:"Senior reviewer B (simulated)"},
 {id:"no-session",label:"No reviewer session (denied)"}
]);
function eligibility(scenario,c){
 const viewer=SCENARIOS[scenario];
 if(!viewer)return{decision:"DENY",reasonCode:"SCENARIO_UNKNOWN"};
 return assessOfflineReviewerEligibility({
  action:"READ_ASSIGNED_CASE",
  actor:viewer.actor,grant:viewer.grant,
  assignment:viewer.grant?.id&&c.assignedTo===scenario?
   {caseId:c.caseId,reviewerGrantId:viewer.grant.id,unassigned:false}:null,
  caseRecord:{
   id:c.caseId,subjectUserId:c.subjectUserId,
   rightsStatus:c.rightsStatus,invalidatedAt:null,expiresAt:c.expiresAt
  },
  now:NOW
 });
}
function statusFor(c){
 const state=c.workflow.status;
 if(state==="NEEDS_EVIDENCE")return "Needs evidence";
 if(state==="BLOCKED_EVIDENCE")return "Blocked";
 if(state==="AWAITING_REVIEW")return "Review queue";
 if(state==="IN_REVIEW")return "In review";
 if(state==="INVALIDATED")return "Invalidated";
 return "Review only";
}
function visible(c){
 return{
  id:c.caseId,game:c.game,platform:c.platform,
  edition:c.edition,market:c.market,
  status:statusFor(c),
  note:c.note,
  referenceStatus:c.packet.releaseReview.status,
  photoStatus:c.packet.photoReview.status,
  workflowStatus:c.workflow.status,
  missingViews:[...c.packet.photoReview.missingViews],
  missingReferenceEvidence:[...c.packet.releaseReview.missingEvidence],
  unresolvedCountry:c.packet.releaseReview.status==="SHARED_PAL_MARKET_REVIEW",
  checksRecorded:c.workflow.findingsRecorded,
  checksTotal:c.workflow.totalRequiredChecks,
  checklist:c.workflow.missingChecks.map(code=>code.replaceAll("_"," ").toLowerCase()),
  history:c.eventSpecs.map(e=>({
   sequence:e.sequence,type:e.type,time:e.at,
   description:e.type==="EVIDENCE_ASSESSED"?"Synthetic evidence checklist assessed":
    e.type==="REVIEW_STARTED"?"Simulated review started":
    e.type==="CHECK_RECORDED"?"Simulated finding: "+e.payload.check.replaceAll("_"," "):
    "Simulated change"
  })),
  verificationState:"UNVERIFIED",canPromoteToMatch:false,
  canTriggerVerifiedAlert:false,offlineOnly:true
 };
}
// Only these explicitly projected properties are returned; no raw provider
// URLs, reviewer actor IDs, seller names, hashes or photo content.
export function listDemoReviewerCases(scenario="no-session"){
 if(!Object.hasOwn(SCENARIOS,scenario))return[];
 return CASES.filter(c=>eligibility(scenario,c).decision==="POLICY_ELIGIBLE").map(visible);
}
export function getDemoReviewerCase(scenario,id){
 if(typeof id!=="string")return null;
 const c=CASES.find(c=>c.caseId===id);
 return c&&eligibility(scenario,c).decision==="POLICY_ELIGIBLE"?visible(c):null;
}
