import test from "node:test";
import assert from "node:assert/strict";
import {assessOfflineReviewerEligibility,REVIEWER_POLICY_ACTIONS}
 from "../shared/reviewer-access-policy-study.js";

const NOW=new Date("2026-11-17T19:00:00.000Z");
function context(role="REVIEWER",overrides={}){
 const o={
  action:"READ_ASSIGNED_CASE",
  now:NOW,
  actor:{userId:"reviewer-1",sessionValid:true,internalReviewerEligible:true,
   stepUpAt:"2026-11-17T18:55:00.000Z"},
  grant:{id:"grant-1",subjectUserId:"reviewer-1",role,
   grantedAt:"2026-11-17T18:00:00.000Z",
   expiresAt:"2026-11-18T18:00:00.000Z",revoked:false},
  assignment:{caseId:"case-1",reviewerGrantId:"grant-1",unassigned:false},
  caseRecord:{id:"case-1",subjectUserId:"seller-1",rightsStatus:"APPROVED_PRIVATE_REVIEW",
   invalidatedAt:null,expiresAt:"2026-11-18T00:00:00.000Z"}
 };
 return {...o,...overrides};
}
function check(c){return assessOfflineReviewerEligibility(c);}
function approved(c){const r=check(c);assert.equal(r.decision,"POLICY_ELIGIBLE");assert.equal(r.authoritative,false);assert.equal(r.canPromoteToMatch,false);return r;}
function denied(c,reason){const r=check(c);assert.equal(r.decision,"DENY");if(reason)assert.equal(r.reasonCode,reason);assert.equal(r.authoritative,false);assert.equal(r.canPromoteToMatch,false);return r;}

test("reviewers only see assigned cases and record provisional findings",()=>{
 approved(context());
 approved(context("REVIEWER",{action:"RECORD_FINDING"}));
 denied(context("REVIEWER",{action:"SUBMIT_ASSESSMENT"}),"ROLE_CANNOT_PERFORM_ACTION");
 denied(context("REVIEWER",{action:"ASSIGN_CASE"}),"ROLE_CANNOT_PERFORM_ACTION");
 denied(context("REVIEWER",{assignment:null}),"ASSIGNMENT_REQUIRED");
 denied(context("REVIEWER",{assignment:{caseId:"different",reviewerGrantId:"grant-1",unassigned:false}}),"ASSIGNMENT_REQUIRED");
 denied(context("REVIEWER",{assignment:{caseId:"case-1",reviewerGrantId:"grant-1",unassigned:true}}),"ASSIGNMENT_REQUIRED");
});

test("senior reviewers may submit provisional assessments only in assigned cases",()=>{
 approved(context("SENIOR_REVIEWER",{action:"SUBMIT_ASSESSMENT"}));
 approved(context("SENIOR_REVIEWER",{action:"INVALIDATE_CASE"}));
 denied(context("SENIOR_REVIEWER",{action:"SUBMIT_ASSESSMENT",assignment:null}),"ASSIGNMENT_REQUIRED");
 denied(context("SENIOR_REVIEWER",{action:"REVOKE_GRANT"}),"ROLE_CANNOT_PERFORM_ACTION");
});

test("admin assignment/revocation and auditor-only redacted audit are distinct",()=>{
 approved(context("REVIEW_ADMIN",{action:"ASSIGN_CASE",assignment:null}));
 approved(context("REVIEW_ADMIN",{action:"REVOKE_GRANT",assignment:null}));
 approved(context("REVIEW_ADMIN",{action:"READ_REDACTED_AUDIT",assignment:null}));
 approved(context("REVIEW_ADMIN",{action:"INVALIDATE_CASE",assignment:null}));
 denied(context("REVIEW_ADMIN",{action:"RECORD_FINDING"}),"ROLE_CANNOT_PERFORM_ACTION");
 approved(context("AUDITOR",{action:"READ_REDACTED_AUDIT",assignment:null}));
 denied(context("AUDITOR",{action:"READ_ASSIGNED_CASE"}),"ROLE_CANNOT_PERFORM_ACTION");
 denied(context("AUDITOR",{action:"ASSIGN_CASE"}),"ROLE_CANNOT_PERFORM_ACTION");
});

test("public user session, claimed role, or approval flag never create privileged access",()=>{
 denied(context("REVIEWER",{actor:{...context().actor,internalReviewerEligible:false}}),"REVIEWER_SESSION_REQUIRED");
 denied(context("REVIEWER",{actor:{...context().actor,sessionValid:false}}),"REVIEWER_SESSION_REQUIRED");
 denied(context("REVIEWER",{role:"REVIEW_ADMIN",isOwner:true,verified:true,
  grant:{...context().grant,role:"REVIEWER"},action:"REVOKE_GRANT"}),"ROLE_CANNOT_PERFORM_ACTION");
 for(const action of ["APPROVE_MATCH","CERTIFY_COPY","SET_MATCH","ISSUE_VERIFIED_ALERT"]){
  assert.equal(REVIEWER_POLICY_ACTIONS.includes(action),false);
  denied(context("REVIEW_ADMIN",{action}),"ACTION_NOT_ALLOWED");
 }
});

test("self-review and inactive/expired/revoked sources are denied",()=>{
 denied(context("REVIEWER",{caseRecord:{...context().caseRecord,subjectUserId:"reviewer-1"}}),"SELF_REVIEW_PROHIBITED");
 denied(context("REVIEWER",{caseRecord:{...context().caseRecord,rightsStatus:"NOT_CONFIRMED"}}),"SOURCE_RIGHTS_NOT_APPROVED");
 denied(context("REVIEWER",{caseRecord:{...context().caseRecord,rightsStatus:"REVOKED"}}),"SOURCE_RIGHTS_NOT_APPROVED");
 denied(context("REVIEWER",{caseRecord:{...context().caseRecord,invalidatedAt:"2026-11-17T18:30:00.000Z"}}),"REVIEW_CASE_INACTIVE");
 denied(context("REVIEWER",{caseRecord:{...context().caseRecord,expiresAt:"2026-11-17T18:00:00.000Z"}}),"REVIEW_CASE_INACTIVE");
 denied(context("REVIEWER",{grant:{...context().grant,revoked:true}}),"NO_ACTIVE_REVIEWER_GRANT");
 denied(context("REVIEWER",{grant:{...context().grant,expiresAt:"2026-11-17T18:59:00.000Z"}}),"NO_ACTIVE_REVIEWER_GRANT");
 denied(context("REVIEWER",{grant:{...context().grant,subjectUserId:"someone-else"}}),"GRANT_NOT_FOR_ACTOR");
});

test("recent step-up is required; future, old and malformed timestamps fail closed",()=>{
 denied(context("REVIEWER",{actor:{...context().actor,stepUpAt:"2026-11-17T18:30:00.000Z"}}),"RECENT_STEP_UP_REQUIRED");
 denied(context("REVIEWER",{actor:{...context().actor,stepUpAt:"2026-11-17T19:01:00.000Z"}}),"RECENT_STEP_UP_REQUIRED");
 denied(context("REVIEWER",{actor:{...context().actor,stepUpAt:"bad"}}),"CONTEXT_TIMESTAMP_INVALID");
 denied(context("REVIEWER",{grant:{...context().grant,grantedAt:"bad"}}),"CONTEXT_TIMESTAMP_INVALID");
 denied(context("REVIEWER",{caseRecord:{...context().caseRecord,expiresAt:"invalid"}}),"CONTEXT_TIMESTAMP_INVALID");
});

test("malformed identity and missing trusted server context deny by default",()=>{
 denied(undefined,"ACTION_NOT_ALLOWED");
 denied(context("REVIEWER",{actor:null}),"TRUSTED_CONTEXT_MISSING");
 denied(context("REVIEWER",{grant:null}),"TRUSTED_CONTEXT_MISSING");
 denied(context("REVIEWER",{caseRecord:null}),"TRUSTED_CONTEXT_MISSING");
 denied(context("REVIEWER",{grant:{...context().grant,role:"seller"}}),"ROLE_CANNOT_PERFORM_ACTION");
 denied(context("REVIEWER",{actor:{...context().actor,userId:"different"}}),"GRANT_NOT_FOR_ACTOR");
});
