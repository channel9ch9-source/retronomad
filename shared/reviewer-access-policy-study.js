// GrailRaven private-review role policy STUDY.
// Pure, offline eligibility calculation. NOT an authentication implementation
// and NOT a database permission boundary. All inputs are assumed to have
// been loaded by a future trusted server, not supplied by a browser/seller.
// An attacker can forge a self-consistent input to this pure function.
// Never use the output by itself to authorise a route or promote to MATCH.
const ROLE_ACTIONS=Object.freeze({
 REVIEWER:["READ_ASSIGNED_CASE","RECORD_FINDING"],
 SENIOR_REVIEWER:["READ_ASSIGNED_CASE","RECORD_FINDING","SUBMIT_ASSESSMENT","INVALIDATE_CASE"],
 REVIEW_ADMIN:["ASSIGN_CASE","INVALIDATE_CASE","READ_REDACTED_AUDIT","REVOKE_GRANT"],
 AUDITOR:["READ_REDACTED_AUDIT"]
});
const SCOPED=new Set(["READ_ASSIGNED_CASE","RECORD_FINDING","SUBMIT_ASSESSMENT"]);
const ADMIN_SCOPED=new Set(["ASSIGN_CASE","REVOKE_GRANT","READ_REDACTED_AUDIT"]);
const HASH=/^[a-f\d]{64}$/i;
const STEP_UP_WINDOW_MS=15*60*1000;
function object(x){return x&&typeof x==="object"&&!Array.isArray(x);}
function time(x){return typeof x==="string"?Date.parse(x):NaN;}
function deny(reasonCode){return{policyVersion:1,decision:"DENY",reasonCode,
 authoritative:false,canPromoteToMatch:false,canTriggerVerifiedAlert:false};}
function eligible(){return{policyVersion:1,decision:"POLICY_ELIGIBLE",reasonCode:"OFFLINE_POLICY_ONLY",
 authoritative:false,canPromoteToMatch:false,canTriggerVerifiedAlert:false};}
export const REVIEWER_POLICY_ACTIONS=Object.freeze(
 [...new Set(Object.values(ROLE_ACTIONS).flat())].sort()
);

// action is the requested internal operation. Any top-level browser-provided
// role/reviewerApproved field is intentionally ignored; only the future
// backend must construct actor/grant/assignment/caseRecord from its DB.
export function assessOfflineReviewerEligibility({
 action,actor,grant,assignment=null,caseRecord,now=new Date()
}={}){
 if(!REVIEWER_POLICY_ACTIONS.includes(action))return deny("ACTION_NOT_ALLOWED");
 if(!object(actor)||!object(grant)||!object(caseRecord))
  return deny("TRUSTED_CONTEXT_MISSING");
 const t=new Date(now).getTime();
 const step=time(actor.stepUpAt),grantStart=time(grant.grantedAt),
  grantEnd=time(grant.expiresAt),caseEnd=time(caseRecord.expiresAt);
 if(!Number.isFinite(t)||!Number.isFinite(step)||
    !Number.isFinite(grantStart)||!Number.isFinite(grantEnd)||!Number.isFinite(caseEnd))
  return deny("CONTEXT_TIMESTAMP_INVALID");
 if(actor.sessionValid!==true||actor.internalReviewerEligible!==true)
  return deny("REVIEWER_SESSION_REQUIRED");
 if(typeof actor.userId!=="string"||!actor.userId||
    actor.userId!==grant.subjectUserId)return deny("GRANT_NOT_FOR_ACTOR");
 if(step>t||t-step>STEP_UP_WINDOW_MS)return deny("RECENT_STEP_UP_REQUIRED");
 if(grant.revoked===true||grantStart>t||grantEnd<=t)
  return deny("NO_ACTIVE_REVIEWER_GRANT");
 if(!Object.hasOwn(ROLE_ACTIONS,grant.role)||
    !ROLE_ACTIONS[grant.role].includes(action))return deny("ROLE_CANNOT_PERFORM_ACTION");
 if(typeof caseRecord.id!=="string"||!caseRecord.id||
    typeof caseRecord.rightsStatus!=="string")return deny("CASE_CONTEXT_MISSING");
 if(caseRecord.subjectUserId!=null&&caseRecord.subjectUserId===actor.userId)
  return deny("SELF_REVIEW_PROHIBITED");
 if(caseRecord.invalidatedAt!=null||caseEnd<=t)return deny("REVIEW_CASE_INACTIVE");
 if(caseRecord.rightsStatus!=="APPROVED_PRIVATE_REVIEW")
  return deny("SOURCE_RIGHTS_NOT_APPROVED");
 if(SCOPED.has(action)||action==="INVALIDATE_CASE"&&grant.role==="SENIOR_REVIEWER"){
  if(!object(assignment)||assignment.caseId!==caseRecord.id||
     assignment.reviewerGrantId!==grant.id||assignment.unassigned===true)
    return deny("ASSIGNMENT_REQUIRED");
 }
 // Admin/auditor permission is only to act on a private case reference.
 // Policy cannot access raw images or approve publication in any role.
 if(ADMIN_SCOPED.has(action)&&grant.role!=="REVIEW_ADMIN"&&grant.role!=="AUDITOR")
  return deny("ROLE_CANNOT_PERFORM_ACTION");
 return eligible();
}
