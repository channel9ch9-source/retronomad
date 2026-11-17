// GrailRaven: OFFLINE, untrusted simulation of a human evidence-review workflow.
//
// NOT a reviewer authentication service, authoritative audit log, storage
// implementation, proof of image provenance, or permission to emit MATCH.
// Every result is UNVERIFIED and cannot trigger a verified Saved Hunt alert.
// The future server must enforce reviewer access and append-only persistence.
import {PHYSICAL_COPY_REVIEW_CHECKS} from "./physical-copy-review-core.js";

export const PHYSICAL_REVIEW_WORKFLOW_SCHEMA_VERSION=1;

const REQUIRED_CHECKS=Object.freeze([...PHYSICAL_COPY_REVIEW_CHECKS]);
const CHECK_NAMES=new Set(REQUIRED_CHECKS);
const PACKET_STATES=new Set(["EVIDENCE_PACK_ASSEMBLED","EVIDENCE_REQUIRED","REFERENCE_REQUIRED","INVALID_PACKET","CONFLICTING_EVIDENCE"]);
const REFERENCE_STATES=new Set(["RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED","SHARED_PAL_MARKET_REVIEW","REFERENCE_CONFLICT","REFERENCE_EVIDENCE_INCOMPLETE","INVALID_OBSERVATIONS","REFERENCE_NOT_FOUND"]);
const FINDINGS=new Set(["CONSISTENT","UNCERTAIN","CONTRADICTION"]);
const INVALIDATIONS=new Set(["LISTING_CHANGED","REFERENCE_CHANGED","EVIDENCE_CHANGED","SOURCE_RIGHTS_WITHDRAWN","REVIEW_REVOKED","ITEM_UNAVAILABLE"]);
const HASH=/^[a-f\d]{64}$/i;
const TOKEN=/^[a-z\d][a-z\d._:-]{1,79}$/i;
const EVENT_ID=/^[a-z\d][a-z\d_-]{1,79}$/i;
const FUTURE_SKEW_MS=300000;
const MAX_EVENTS=100;

function object(x){return x!==null&&typeof x==="object"&&!Array.isArray(x);}
function keysExactly(value,expected){
 return object(value)&&Object.keys(value).length===expected.length &&
 expected.every(key=>Object.hasOwn(value,key));
}
function isoMillis(value){
 if(typeof value!=="string")return NaN;
 const millis=Date.parse(value);
 return Number.isFinite(millis)&&new Date(millis).toISOString()===value?millis:NaN;
}
function sha(value){return typeof value==="string"&&HASH.test(value);}
function token(value){return typeof value==="string"&&TOKEN.test(value);}
function eventId(value){return typeof value==="string"&&EVENT_ID.test(value);}
const SCOPE_FIELDS=["listingSnapshotHash","releaseReferenceId","referenceVersion","targetHash","evidenceManifestHash"];
function sameScope(a,b){
 return keysExactly(a,SCOPE_FIELDS)&&SCOPE_FIELDS.every(k=>a[k]===b[k]);
}
function outcome(status,{reasonCodes=[],findings={},eventCount=0,referenceAmbiguous=false,invalidatedBecause=null}={}){
 const missingChecks=REQUIRED_CHECKS.filter(x=>!Object.hasOwn(findings,x));
 return{
  schemaVersion:PHYSICAL_REVIEW_WORKFLOW_SCHEMA_VERSION,
  status,workflowAuthority:"OFFLINE_UNTRUSTED_SIMULATION",
  verificationState:"UNVERIFIED",
  rightsReview:"NOT_PERFORMED",
  evidenceAuthenticity:"NOT_ESTABLISHED",
  canPromoteToMatch:false,
  canTriggerVerifiedAlert:false,
  reviewRecordIsAuthoritative:false,
  invalidatedBecause,
  referenceAmbiguous,
  eventCount,
  findingsRecorded:REQUIRED_CHECKS.length-missingChecks.length,
  totalRequiredChecks:REQUIRED_CHECKS.length,
  missingChecks,
  reasonCodes:[...new Set(reasonCodes)].sort()
 };
}
function invalid(code){return outcome("INVALID_EVENT_LOG",{reasonCodes:[code]});}

// This function MUST NOT be called a trusted review or a verification API.
// Binding and event signatures would be untrusted if submitted by a client.
// A future privileged server must generate and protect the actual source
// snapshot, evidence manifest, release-version, target, reviewer identity,
// permissions and tamper-evident append-only audit record.
export function simulatePhysicalReviewWorkflow(binding,events=[],{now=new Date()}={}){
 const expectedBinding=["schemaVersion","caseId","listingSnapshotHash","releaseReferenceId","referenceVersion","targetHash","evidenceManifestHash","openedAt"];
 if(!keysExactly(binding,expectedBinding)||
  binding.schemaVersion!==PHYSICAL_REVIEW_WORKFLOW_SCHEMA_VERSION||
  !token(binding.caseId)||!sha(binding.listingSnapshotHash)||
  !token(binding.releaseReferenceId)||!token(binding.referenceVersion)||
  !sha(binding.targetHash)||!sha(binding.evidenceManifestHash)){
  return invalid("CASE_BINDING_INVALID");
 }
 const start=isoMillis(binding.openedAt),atNow=new Date(now).getTime();
 if(!Number.isFinite(start)||!Number.isFinite(atNow)||start>atNow+FUTURE_SKEW_MS){
  return invalid("CASE_TIMESTAMP_INVALID");
 }
 if(!Array.isArray(events)||events.length>MAX_EVENTS)return invalid("EVENT_LIST_INVALID");

 let state="INTAKE_PENDING",lastTime=start,lastId=null,referenceAmbiguous=false;
 let invalidatedBecause=null,findings=Object.create(null);
 const seenIds=new Set();
 for(let i=0;i<events.length;i++){
  const e=events[i];
  if(!keysExactly(e,["sequence","eventId","previousEventId","at","type","scope","payload"])||
   !Number.isInteger(e.sequence)||e.sequence!==i+1||
   !eventId(e.eventId)||seenIds.has(e.eventId)||
   e.previousEventId!==lastId||
   !sameScope(e.scope,binding)||
   !object(e.payload))return invalid("EVENT_ENVELOPE_INVALID");
  const at=isoMillis(e.at);
  if(!Number.isFinite(at)||at<lastTime||at>atNow+FUTURE_SKEW_MS)return invalid("EVENT_TIMESTAMP_INVALID");
  // An event's actor, role, reviewer token or approval flag is never read as
  // proof of authority; additional fields are rejected by strict schemas.
  seenIds.add(e.eventId);lastId=e.eventId;lastTime=at;

  if(e.type==="CASE_INVALIDATED"){
   if(!keysExactly(e.payload,["reason"])||!INVALIDATIONS.has(e.payload.reason)||
     state==="INVALIDATED")return invalid("INVALIDATION_EVENT_INVALID");
   state="INVALIDATED";invalidatedBecause=e.payload.reason;
   continue;
  }
  if(state==="INVALIDATED")return invalid("TERMINAL_CASE_REPLAY");

  if(e.type==="EVIDENCE_ASSESSED"){
   if(state!=="INTAKE_PENDING"||
    !keysExactly(e.payload,["packetStatus","referenceStatus"])||
    !PACKET_STATES.has(e.payload.packetStatus)||
    !REFERENCE_STATES.has(e.payload.referenceStatus))return invalid("EVIDENCE_TRANSITION_INVALID");
   if(e.payload.packetStatus==="INVALID_PACKET"||
      e.payload.packetStatus==="CONFLICTING_EVIDENCE"||
      ["REFERENCE_CONFLICT","INVALID_OBSERVATIONS","REFERENCE_NOT_FOUND"].includes(e.payload.referenceStatus)){
    state="BLOCKED_EVIDENCE";
   }else if(e.payload.packetStatus!=="EVIDENCE_PACK_ASSEMBLED"||
     e.payload.referenceStatus==="REFERENCE_EVIDENCE_INCOMPLETE"){
    state="NEEDS_EVIDENCE";
   }else{
    state="AWAITING_REVIEW";
    referenceAmbiguous=e.payload.referenceStatus==="SHARED_PAL_MARKET_REVIEW";
   }
  }else if(e.type==="REVIEW_STARTED"){
   if(state!=="AWAITING_REVIEW"||!keysExactly(e.payload,[]))return invalid("REVIEW_START_INVALID");
   state="IN_REVIEW";
  }else if(e.type==="CHECK_RECORDED"){
   if(state!=="IN_REVIEW"||
    !keysExactly(e.payload,["check","finding"])||
    !CHECK_NAMES.has(e.payload.check)||
    !FINDINGS.has(e.payload.finding)||
    Object.hasOwn(findings,e.payload.check))return invalid("REVIEW_CHECK_INVALID");
   findings[e.payload.check]=e.payload.finding;
  }else if(e.type==="ASSESSMENT_SUBMITTED"){
   if(state!=="IN_REVIEW"||!keysExactly(e.payload,[])||
    Object.keys(findings).length!==REQUIRED_CHECKS.length)return invalid("ASSESSMENT_INCOMPLETE_OR_INVALID");
   const all=Object.values(findings);
   state=all.includes("CONTRADICTION")?"ASSESSMENT_CONFLICT_UNTRUSTED":
    (referenceAmbiguous||all.includes("UNCERTAIN"))?"ASSESSMENT_UNRESOLVED_UNTRUSTED":
    "ASSESSMENT_CONSISTENT_UNTRUSTED";
  }else return invalid("EVENT_TYPE_INVALID");
 }
 const codes=[];
 if(state==="NEEDS_EVIDENCE")codes.push("MISSING_REFERENCE_OR_PHOTO_EVIDENCE");
 if(state==="BLOCKED_EVIDENCE")codes.push("CONFLICTING_OR_INVALID_SOURCE_EVIDENCE");
 if(referenceAmbiguous)codes.push("SHARED_PAL_COUNTRY_UNRESOLVED");
 if(state==="ASSESSMENT_CONSISTENT_UNTRUSTED")codes.push("HUMAN_REVIEW_NOT_AUTHENTICATED");
 if(state==="INVALIDATED")codes.push("REVIEW_CASE_INVALIDATED");
 return outcome(state,{reasonCodes:codes,findings,
  referenceAmbiguous,eventCount:events.length,invalidatedBecause});
}
