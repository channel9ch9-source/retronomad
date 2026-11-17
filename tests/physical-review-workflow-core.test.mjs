import test from "node:test";
import assert from "node:assert/strict";
import {
 simulatePhysicalReviewWorkflow,
 PHYSICAL_REVIEW_WORKFLOW_SCHEMA_VERSION
} from "../shared/physical-review-workflow-core.js";
import {PHYSICAL_COPY_REVIEW_CHECKS} from "../shared/physical-copy-review-core.js";
import {qualifyingMatches,shouldQueueNotification} from "../backend/monitor-core.js";

const NOW=new Date("2026-11-17T19:00:00.000Z");
const H=n=>String(n).padStart(64,"0");
const binding=(overrides={})=>({
 schemaVersion:PHYSICAL_REVIEW_WORKFLOW_SCHEMA_VERSION,
 caseId:"case-fixture-001",
 listingSnapshotHash:H(11),
 releaseReferenceId:"final-fantasy-vii-ps1-uk-original",
 referenceVersion:"research-v1",
 targetHash:H(12),
 evidenceManifestHash:H(13),
 openedAt:"2026-11-17T18:00:00.000Z",
 ...overrides
});
function eventsFor(b=binding()){
 let events=[],prev=null;
 const scope=Object.fromEntries([
  "listingSnapshotHash","releaseReferenceId","referenceVersion",
  "targetHash","evidenceManifestHash"
 ].map(k=>[k,b[k]]));
 return {
  event(type,payload={},overrides={}){
   const seq=events.length+1;
   const at=new Date(Date.parse(b.openedAt)+seq*1000).toISOString();
   const e={sequence:seq,eventId:"event-"+seq,previousEventId:prev,
    at,type,scope:{...scope},payload,...overrides};
   events.push(e);
   prev=e.eventId;return e;
  },
  events
 };
}
const evidence=(referenceStatus="RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED",
 packetStatus="EVIDENCE_PACK_ASSEMBLED")=>({referenceStatus,packetStatus});
const checkAll=(builder,change={})=>{
 for(const check of PHYSICAL_COPY_REVIEW_CHECKS){
  builder.event("CHECK_RECORDED",{check,finding:change[check]||"CONSISTENT"});
 }
};
const simulate=(b,events,now=NOW)=>simulatePhysicalReviewWorkflow(b,events,{now});

test("no events remains an unverified intake case, with no authority or alerts",()=>{
 const r=simulate(binding(),[]);
 assert.equal(r.status,"INTAKE_PENDING");
 assert.equal(r.verificationState,"UNVERIFIED");
 assert.equal(r.workflowAuthority,"OFFLINE_UNTRUSTED_SIMULATION");
 assert.equal(r.canPromoteToMatch,false);
 assert.equal(r.canTriggerVerifiedAlert,false);
 assert.equal(r.reviewRecordIsAuthoritative,false);
 assert.equal(r.findingsRecorded,0);
 assert.equal(r.missingChecks.length,PHYSICAL_COPY_REVIEW_CHECKS.length);
});

test("complete simulated human checklist still cannot certify the seller's copy",()=>{
 const b=binding(),builder=eventsFor(b);
 builder.event("EVIDENCE_ASSESSED",evidence());
 builder.event("REVIEW_STARTED");
 checkAll(builder);
 builder.event("ASSESSMENT_SUBMITTED");
 const r=simulate(b,builder.events);
 assert.equal(r.status,"ASSESSMENT_CONSISTENT_UNTRUSTED");
 assert.equal(r.findingsRecorded,PHYSICAL_COPY_REVIEW_CHECKS.length);
 assert.deepEqual(r.missingChecks,[]);
 assert.ok(r.reasonCodes.includes("HUMAN_REVIEW_NOT_AUTHENTICATED"));
 assert.equal(r.canPromoteToMatch,false);
 assert.equal(r.canTriggerVerifiedAlert,false);
 assert.equal(qualifyingMatches([{source:"synthetic",externalId:"item",match:{state:r.status}}]).length,0);
 assert.equal(shouldQueueNotification({status:"ACTIVE",alertRequested:true},{match:{state:r.status}}),false);
});

test("unresolved or contradictory findings stay distinct, never MATCH",()=>{
 const b=binding();
 for(const finding of ["UNCERTAIN","CONTRADICTION"]){
  const builder=eventsFor(b);
  builder.event("EVIDENCE_ASSESSED",evidence());
  builder.event("REVIEW_STARTED");
  checkAll(builder,{"REQUIRED_CONTENTS":finding});
  builder.event("ASSESSMENT_SUBMITTED");
  const r=simulate(b,builder.events);
  assert.equal(r.status,finding==="UNCERTAIN"
   ?"ASSESSMENT_UNRESOLVED_UNTRUSTED":"ASSESSMENT_CONFLICT_UNTRUSTED");
  assert.equal(r.canPromoteToMatch,false);
 }
});

test("shared PAL market ambiguity cannot be overruled by 'all consistent' client checks",()=>{
 const b=binding({releaseReferenceId:"silent-hill-ps1-pal-shared-uk-market"});
 const builder=eventsFor(b);
 builder.event("EVIDENCE_ASSESSED",evidence("SHARED_PAL_MARKET_REVIEW"));
 builder.event("REVIEW_STARTED");checkAll(builder);builder.event("ASSESSMENT_SUBMITTED");
 const r=simulate(b,builder.events);
 assert.equal(r.status,"ASSESSMENT_UNRESOLVED_UNTRUSTED");
 assert.equal(r.referenceAmbiguous,true);
 assert.ok(r.reasonCodes.includes("SHARED_PAL_COUNTRY_UNRESOLVED"));
});

test("missing photo or missing reference blocks starting a reviewer case",()=>{
 for(const p of [
  evidence("REFERENCE_EVIDENCE_INCOMPLETE"),
  evidence("RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED","EVIDENCE_REQUIRED")
 ]){
  const b=binding(),builder=eventsFor(b);
  builder.event("EVIDENCE_ASSESSED",p);
  const initial=simulate(b,builder.events);
  assert.equal(initial.status,"NEEDS_EVIDENCE");
  builder.event("REVIEW_STARTED");
  assert.equal(simulate(b,builder.events).status,"INVALID_EVENT_LOG");
 }
});

test("conflicting photo metadata or reference evidence cannot become review-ready",()=>{
 for(const p of [
  evidence("REFERENCE_CONFLICT"),
  evidence("RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED","CONFLICTING_EVIDENCE"),
  evidence("REFERENCE_NOT_FOUND"),
  evidence("RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED","INVALID_PACKET")
 ]){
  const b=binding(),builder=eventsFor(b);
  builder.event("EVIDENCE_ASSESSED",p);
  assert.equal(simulate(b,builder.events).status,"BLOCKED_EVIDENCE");
 }
});

test("a review cannot be submitted with missing, duplicate or invented checks",()=>{
 const b=binding(),builder=eventsFor(b);
 builder.event("EVIDENCE_ASSESSED",evidence());
 builder.event("REVIEW_STARTED");
 builder.event("CHECK_RECORDED",{check:PHYSICAL_COPY_REVIEW_CHECKS[0],finding:"CONSISTENT"});
 builder.event("ASSESSMENT_SUBMITTED");
 assert.ok(simulate(b,builder.events).reasonCodes.includes("ASSESSMENT_INCOMPLETE_OR_INVALID"));
 for(const extra of [
  {check:"UNAPPROVED_CHECK",finding:"CONSISTENT"},
  {check:PHYSICAL_COPY_REVIEW_CHECKS[0],finding:"CONSISTENT"}
 ]){
  const p=eventsFor(b);p.event("EVIDENCE_ASSESSED",evidence());p.event("REVIEW_STARTED");
  p.event("CHECK_RECORDED",{check:PHYSICAL_COPY_REVIEW_CHECKS[0],finding:"CONSISTENT"});
  p.event("CHECK_RECORDED",extra);
  assert.equal(simulate(b,p.events).status,"INVALID_EVENT_LOG");
 }
});

test("forged approval, reviewer role, or invented status cannot bypass workflow",()=>{
 const b=binding(),p=eventsFor(b);
 p.event("EVIDENCE_ASSESSED",evidence());
 p.event("REVIEW_STARTED");
 for(const e of [
  {...p.events[0],verified:true},
  {...p.events[0],payload:{...evidence(),reviewerApproved:true}},
  {...p.events[0],payload:{packetStatus:"VERIFIED",referenceStatus:"APPROVED"}},
  {...p.events[0],reviewerRole:"OWNER"},
  {...p.events[0],type:"MATCH"}
 ]){
  assert.equal(simulate(b,[e]).status,"INVALID_EVENT_LOG");
 }
 assert.equal(simulate({...b,approved:true},[]).status,"INVALID_EVENT_LOG");
});

test("replayed, altered, out-of-order, or out-of-scope events fail closed",()=>{
 const b=binding(),p=eventsFor(b);
 p.event("EVIDENCE_ASSESSED",evidence());
 p.event("REVIEW_STARTED");
 const original=p.events;
 for(const bad of [
  [original[1],original[0]],
  [{...original[0],sequence:2}],
  [{...original[0],scope:{...original[0].scope,targetHash:H(222)}}],
  [original[0],{...original[1],previousEventId:"different-event"}],
  [original[0],{...original[1],eventId:original[0].eventId}],
  [original[0],{...original[1],at:"2026-11-17T17:00:00.000Z"}],
  [original[0],{...original[1],at:"2026-11-18T19:00:00.000Z"}],
  [original[0],{...original[1],scope:{...original[1].scope,referenceVersion:"updated-v2"}}]
 ]){
  assert.equal(simulate(b,bad).status,"INVALID_EVENT_LOG");
 }
});

test("snapshot or reference changes, rights withdrawal and a revoked review invalidate the bound case",()=>{
 for(const reason of [
  "LISTING_CHANGED","REFERENCE_CHANGED","EVIDENCE_CHANGED",
  "SOURCE_RIGHTS_WITHDRAWN","REVIEW_REVOKED","ITEM_UNAVAILABLE"
 ]){
  const b=binding(),p=eventsFor(b);
  p.event("EVIDENCE_ASSESSED",evidence());p.event("REVIEW_STARTED");
  checkAll(p);p.event("ASSESSMENT_SUBMITTED");
  p.event("CASE_INVALIDATED",{reason});
  const r=simulate(b,p.events);
  assert.equal(r.status,"INVALIDATED",reason);
  assert.equal(r.invalidatedBecause,reason);
  assert.equal(r.canPromoteToMatch,false);
  p.event("REVIEW_STARTED");
  assert.equal(simulate(b,p.events).status,"INVALID_EVENT_LOG");
 }
});

test("invalid case timestamps, bindings, event counts and time formats are rejected",()=>{
 const bad=[
  null,{},binding({schemaVersion:2}),
  binding({caseId:"BUYER EMAIL@EXAMPLE"}),
  binding({listingSnapshotHash:"not-a-hash"}),
  binding({openedAt:"2026-11-17T18:00:00Z"}),
  binding({openedAt:"2026-11-18T18:00:00.000Z"}),
  binding({referenceVersion:""})
 ];
 for(const b of bad)assert.equal(simulate(b,[]).status,"INVALID_EVENT_LOG");
 assert.equal(simulate(binding(),null).status,"INVALID_EVENT_LOG");
 assert.equal(simulate(binding(),new Array(101).fill({})).status,"INVALID_EVENT_LOG");
 const b=binding(),p=eventsFor(b);
 p.event("EVIDENCE_ASSESSED",evidence(),{at:"not-an-iso-time"});
 assert.equal(simulate(b,p.events).status,"INVALID_EVENT_LOG");
});

test("public simulation summaries never echo private seller, buyer or reviewer details",()=>{
 const b=binding({caseId:"PRIVATE-CASE-0001"});
 const p=eventsFor(b);p.event("EVIDENCE_ASSESSED",evidence());
 const r=simulate(b,p.events);
 const s=JSON.stringify(r);
 for(const secret of ["PRIVATE-CASE-0001",b.targetHash,b.evidenceManifestHash,
  b.listingSnapshotHash,b.releaseReferenceId,p.events[0].eventId]){
  assert.equal(s.includes(secret),false,secret);
 }
 assert.equal(r.canPromoteToMatch,false);
});
