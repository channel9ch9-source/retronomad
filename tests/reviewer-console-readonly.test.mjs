import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 DEMO_SCENARIOS,DEMO_TIME,listDemoReviewerCases,getDemoReviewerCase
} from "../prototypes/reviewer-console/model.js";

test("offline scenario list has two fictional reviewers and one denial case",()=>{
 assert.equal(DEMO_SCENARIOS.length,3);
 assert.ok(DEMO_TIME.startsWith("2026-11-17"));
 assert.deepEqual(DEMO_SCENARIOS.map(s=>s.id),[
  "reviewer-alpha","reviewer-beta","no-session"
 ]);
});

test("only assigned reviewer A's THREE synthetic cases appear",()=>{
 const cases=listDemoReviewerCases("reviewer-alpha");
 assert.equal(cases.length,3);
 assert.deepEqual(new Set(cases.map(c=>c.game)),
  new Set(["Vagrant Story","Silent Hill","Final Fantasy VII"]));
 assert.deepEqual(new Set(cases.map(c=>c.status)),new Set(["Needs evidence","Review queue"]));
 assert.equal(cases.every(c=>c.offlineOnly),true);
 assert.equal(cases.every(c=>c.verificationState==="UNVERIFIED"),true);
});

test("reviewer B gets different case; unassigned, other user and no-session deny",()=>{
 const b=listDemoReviewerCases("reviewer-beta");
 assert.equal(b.length,1);
 assert.equal(b[0].game,"Silent Hill 2: Director's Cut");
 assert.equal(b[0].status,"In review");
 assert.equal(b[0].checksRecorded,4);
 assert.equal(b[0].checksTotal,9);
 assert.equal(b[0].history.length,6);
 assert.equal(getDemoReviewerCase("reviewer-alpha",b[0].id),null);
 assert.equal(getDemoReviewerCase("reviewer-beta","demo-case-1"),null);
 assert.deepEqual(listDemoReviewerCases("no-session"),[]);
 assert.deepEqual(listDemoReviewerCases("unknown-viewer"),[]);
 assert.equal(getDemoReviewerCase("no-session",b[0].id),null);
 assert.equal(getDemoReviewerCase("reviewer-beta",{}),null);
});

test("missing UK barcode and photo views are explained for Vagrant Story",()=>{
 const c=getDemoReviewerCase("reviewer-alpha","demo-case-1");
 assert.equal(c.status,"Needs evidence");
 assert.ok(c.missingReferenceEvidence.includes("PACKAGE_BARCODE"));
 assert.ok(c.missingViews.includes("identifier_closeup"));
 assert.ok(c.missingViews.includes("spine"));
 assert.equal(c.photoStatus,"EVIDENCE_REQUIRED");
 assert.equal(c.referenceStatus,"REFERENCE_EVIDENCE_INCOMPLETE");
});

test("shared PAL UK proof is still a review queue, never exact certified release",()=>{
 const c=getDemoReviewerCase("reviewer-alpha","demo-case-2");
 assert.equal(c.status,"Review queue");
 assert.equal(c.missingViews.length,0);
 assert.equal(c.unresolvedCountry,true);
 assert.equal(c.referenceStatus,"SHARED_PAL_MARKET_REVIEW");
 assert.equal(c.verificationState,"UNVERIFIED");
 assert.equal(c.canPromoteToMatch,false);
});

test("three-disc Final Fantasy VII requires third disc serial and photo",()=>{
 const c=getDemoReviewerCase("reviewer-alpha","demo-case-3");
 assert.equal(c.status,"Needs evidence");
 assert.ok(c.missingViews.includes("disc_label:3"));
 assert.ok(c.missingReferenceEvidence.includes("GAME_DISC_SERIAL:3"));
});

test("an assembled photo packet and in-review checklist are not authority",()=>{
 const c=getDemoReviewerCase("reviewer-beta","demo-case-4");
 assert.equal(c.photoStatus,"EVIDENCE_PACK_ASSEMBLED");
 assert.equal(c.referenceStatus,"RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED");
 assert.equal(c.workflowStatus,"IN_REVIEW");
 assert.equal(c.canPromoteToMatch,false);
 assert.equal(c.canTriggerVerifiedAlert,false);
});

test("case projection never returns synthetic raw hashes, actor IDs, URLs, rights flags or original photos",()=>{
 for(const viewer of ["reviewer-alpha","reviewer-beta","no-session"]){
  const cases=listDemoReviewerCases(viewer);
  for(const c of cases){
   assert.equal(c.canPromoteToMatch,false);
   assert.equal(c.canTriggerVerifiedAlert,false);
   const text=JSON.stringify(c);
   for(const privateValue of [
    "demo-user-alpha","demo-user-beta","demo-seller-does-not-exist",
    "synthetic-local-demo","APPROVED_PRIVATE_REVIEW","sha256",
    "listingSnapshotHash","evidenceManifestHash","targetHash",
    "subjectUserId","demo-grant-alpha","demo-grant-beta","reviewerToken","canonicalUrl"
   ])assert.equal(text.includes(privateValue),false,privateValue);
  }
 }
});

test("prototype HTML and UI make no network calls, writes, privileged action forms or external imports",()=>{
 const html=readFileSync(new URL("../prototypes/reviewer-console/index.html",import.meta.url),"utf8");
 const ui=readFileSync(new URL("../prototypes/reviewer-console/ui.js",import.meta.url),"utf8");
 const model=readFileSync(new URL("../prototypes/reviewer-console/model.js",import.meta.url),"utf8");
 assert.match(html,/Offline development demo/);
 assert.match(html,/Fictional case data only/);
 assert.match(html,/connect-src 'none'/);
 assert.match(html,/type="module" src="\.\/ui\.js"/);
 assert.match(ui,/\.\/model\.js/);
 for(const str of [ui,model]){
  assert.doesNotMatch(str,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b/);
  assert.doesNotMatch(str,/\blocalStorage\b|\bsessionStorage\b|\bnavigator\.sendBeacon\b/);
  assert.doesNotMatch(str,/\bdocument\.cookie\b|\bpostMessage\s*\(/);
  assert.doesNotMatch(str,/\bimport\s*\(/);
 }
 assert.doesNotMatch(ui,/innerHTML\s*=/);
 assert.doesNotMatch(html,/<form\b|<input\b[^>]*type="file"/);
});

test("prototype directory is isolated from the public Cloudflare root copying step",()=>{
 const build=readFileSync(new URL("../scripts/build-cloudflare.mjs",import.meta.url),"utf8");
 assert.match(build,/for\(const entry of await readdir\(root,/);
 assert.match(build,/if\(!entry\.isFile\(\)\)continue/);
 assert.doesNotMatch(build,/cp\(join\(root,"prototypes"/);
 const html=readFileSync(new URL("../prototypes/reviewer-console/index.html",import.meta.url),"utf8");
 assert.doesNotMatch(html,/https?:\/\//);
});
