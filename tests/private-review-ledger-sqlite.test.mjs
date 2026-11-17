import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DatabaseSync} from "node:sqlite";

const SQL=readFileSync(new URL("../proposals/private-review-ledger-v1.sql",import.meta.url),"utf8");
const H=n=>String(n).padStart(64,"0");
const TIME="2026-11-17T19:10:00.000Z";
const LATER="2026-11-18T19:10:00.000Z";
function setup(){
 const db=new DatabaseSync(":memory:");
 db.exec("PRAGMA foreign_keys=ON; CREATE TABLE users(id TEXT PRIMARY KEY);");
 db.exec("INSERT INTO users(id) VALUES ('reviewer'),('senior'),('admin'),('subject'),('auditor')");
 db.exec(SQL);
 return db;
}
function addCase(db,id="case-1"){
 db.prepare(`INSERT INTO reviewer_cases(
  id,source,external_listing_id,subject_user_id,listing_snapshot_hash,
  release_reference_id,release_reference_version,target_hash,evidence_manifest_hash,
  rights_record_ref,created_at,expires_at,created_by_user_id,supersedes_case_id
 ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
  id,"synthetic","fixture-item-1","subject",H(1),"fixture-release","research-v1",
  H(2),H(3),"private-fixture-rights",TIME,LATER,"admin",null
 );
}
function addEvent(db,{caseId="case-1",seq=1,id="evt-1",kind="EVIDENCE_ASSESSED",
 actor="reviewer",at=TIME,prev=null,hash=H(100),payload={packetStatus:"EVIDENCE_PACK_ASSEMBLED"}}={}){
 db.prepare(`INSERT INTO reviewer_case_events(
  case_id,sequence_no,event_id,event_type,actor_user_id,occurred_at,
  previous_event_hash,event_hash,payload_json
 ) VALUES (?,?,?,?,?,?,?,?,?)`).run(
  caseId,seq,id,kind,actor,at,prev,hash,JSON.stringify(payload)
 );
}
function grant(db,{id="grant-1",role="REVIEWER",user="reviewer"}={}){
 db.prepare(`INSERT INTO reviewer_access_grants(
 id,subject_user_id,role,issuer_user_id,granted_at,expires_at,reason_code
 ) VALUES(?,?,?,?,?,?,?)`).run(id,user,role,"admin",TIME,LATER,"PILOT_REVIEW_ROLE");
}
function assignment(db,{id="assignment-1",caseId="case-1",grantId="grant-1"}={}){
 db.prepare(`INSERT INTO reviewer_case_assignments(
  id,case_id,reviewer_grant_id,assigned_by_user_id,assigned_at
 ) VALUES (?,?,?,?,?)`).run(id,caseId,grantId,"admin","2026-11-17T19:15:00.000Z");
}

test("offline SQL proposal executes in an isolated SQLite database and creates private tables",()=>{
 const db=setup();
 const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'reviewer_%' ORDER BY name").all().map(x=>x.name);
 for(const name of [
  "reviewer_access_grants","reviewer_access_revocations","reviewer_cases",
  "reviewer_case_heads","reviewer_case_assignments","reviewer_case_unassignments",
  "reviewer_case_events"
 ])assert.ok(tables.includes(name),name);
 assert.equal(db.prepare("PRAGMA foreign_keys").get().foreign_keys,1);
 assert.ok(!SQL.includes("CREATE TABLE IF NOT EXISTS sessions"));
 db.close();
});

test("case binding is immutable; insertion automatically creates a blank head",()=>{
 const db=setup();addCase(db);
 const head=db.prepare("SELECT * FROM reviewer_case_heads WHERE case_id='case-1'").get();
 assert.equal(head.last_sequence,0);
 assert.equal(head.last_event_hash,null);
 assert.equal(head.invalidated_at,null);
 assert.throws(()=>db.exec("UPDATE reviewer_cases SET release_reference_version='evil-v2' WHERE id='case-1'"),/IMMUTABLE_REVIEW_CASE/);
 assert.throws(()=>db.exec("DELETE FROM reviewer_cases WHERE id='case-1'"),/IMMUTABLE_REVIEW_CASE/);
 const original=db.prepare("SELECT listing_snapshot_hash FROM reviewer_cases WHERE id='case-1'").get();
 assert.equal(original.listing_snapshot_hash,H(1));
 db.close();
});

test("event log chains to preceding hash and advances head on append",()=>{
 const db=setup();addCase(db);
 addEvent(db);
 let head=db.prepare("SELECT * FROM reviewer_case_heads WHERE case_id='case-1'").get();
 assert.equal(head.last_sequence,1);
 assert.equal(head.last_event_hash,H(100));
 addEvent(db,{seq:2,id:"evt-2",kind:"REVIEW_STARTED",prev:H(100),hash:H(101)});
 head=db.prepare("SELECT * FROM reviewer_case_heads WHERE case_id='case-1'").get();
 assert.equal(head.last_sequence,2);
 assert.equal(head.last_event_hash,H(101));
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviewer_case_events").get().n,2);
 db.close();
});

test("bad sequence, previous hash, duplicate event ID, invalid payload and wrong case are rejected",()=>{
 const db=setup();addCase(db);addEvent(db);
 assert.throws(()=>addEvent(db,{seq:3,id:"evt-gap",prev:H(100)}),/REVIEW_EVENT_OUT_OF_SEQUENCE/);
 assert.throws(()=>addEvent(db,{seq:2,id:"evt-bad-prev",prev:H(99)}),/REVIEW_EVENT_PREVIOUS_HASH_MISMATCH/);
 assert.throws(()=>addEvent(db,{seq:2,id:"evt-1",prev:H(100)}),/UNIQUE constraint failed/);
 assert.throws(()=>addEvent(db,{seq:2,id:"evt-2",prev:H(100),hash:"foo"}),/CHECK constraint failed/);
 assert.throws(()=>addEvent(db,{caseId:"unknown",id:"evt-other"}),/REVIEW_CASE_INVALID_OR_TERMINATED|FOREIGN KEY constraint failed/);
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviewer_case_events").get().n,1);
 db.close();
});

test("append-only history cannot be overwritten or deleted",()=>{
 const db=setup();addCase(db);addEvent(db);
 assert.throws(()=>db.exec("UPDATE reviewer_case_events SET event_type='ASSESSMENT_SUBMITTED' WHERE event_id='evt-1'"),/IMMUTABLE_REVIEW_EVENT/);
 assert.throws(()=>db.exec("DELETE FROM reviewer_case_events WHERE event_id='evt-1'"),/IMMUTABLE_REVIEW_EVENT/);
 db.close();
});

test("rights/listing invalidation terminally blocks further event append",()=>{
 const db=setup();addCase(db);addEvent(db);
 addEvent(db,{seq:2,id:"evt-revoke",kind:"CASE_INVALIDATED",prev:H(100),hash:H(102),
  payload:{reason:"SOURCE_RIGHTS_WITHDRAWN"}});
 const head=db.prepare("SELECT * FROM reviewer_case_heads WHERE case_id='case-1'").get();
 assert.equal(head.invalidated_at,TIME);
 assert.throws(()=>addEvent(db,{seq:3,id:"evt-post",prev:H(102),hash:H(103)}),
  /REVIEW_CASE_INVALID_OR_TERMINATED/);
 db.close();
});

test("review role grants and revocations are append-only, linked to real app users",()=>{
 const db=setup();
 grant(db);
 db.prepare(`INSERT INTO reviewer_access_revocations(grant_id,revoked_by_user_id,revoked_at,reason_code)
 VALUES (?,?,?,?)`).run("grant-1","admin","2026-11-17T19:30:00.000Z","NO_LONGER_ASSIGNED");
 assert.throws(()=>grant(db,{id:"grant-2",user:"nonexistent"}),/FOREIGN KEY constraint failed/);
 assert.throws(()=>grant(db,{id:"grant-3",role:"SELLER"}),/CHECK constraint failed/);
 assert.throws(()=>db.exec("UPDATE reviewer_access_grants SET role='REVIEW_ADMIN' WHERE id='grant-1'"),/IMMUTABLE_REVIEW_GRANT/);
 assert.throws(()=>db.exec("DELETE FROM reviewer_access_grants WHERE id='grant-1'"),/IMMUTABLE_REVIEW_GRANT/);
 assert.throws(()=>db.exec("UPDATE reviewer_access_revocations SET reason_code='EVIL' WHERE grant_id='grant-1'"),/IMMUTABLE_REVIEW_REVOKE/);
 assert.throws(()=>db.exec("DELETE FROM reviewer_access_revocations WHERE grant_id='grant-1'"),/IMMUTABLE_REVIEW_REVOKE/);
 assert.throws(()=>db.exec(`INSERT INTO reviewer_access_revocations
 (grant_id,revoked_by_user_id,revoked_at,reason_code)
 VALUES('grant-1','admin','2026-11-17T19:35:00.000Z','SECOND_REVOKE')`),/UNIQUE constraint failed/);
 db.close();
});

test("assignments require active reviewer grants and cannot target an invalidated case",()=>{
 const db=setup();addCase(db);grant(db);
 assignment(db);
 assert.throws(()=>db.exec("UPDATE reviewer_case_assignments SET assigned_by_user_id='reviewer' WHERE id='assignment-1'"),/IMMUTABLE_REVIEW_ASSIGNMENT/);
 assert.throws(()=>db.exec("DELETE FROM reviewer_case_assignments WHERE id='assignment-1'"),/IMMUTABLE_REVIEW_ASSIGNMENT/);
 grant(db,{id:"auditor-grant",role:"AUDITOR",user:"auditor"});
 assert.throws(()=>assignment(db,{id:"bad-assignment",grantId:"auditor-grant"}),/ASSIGNMENT_NOT_AUTHORISED_BY_ACTIVE_GRANT/);
 db.prepare(`INSERT INTO reviewer_access_revocations(grant_id,revoked_by_user_id,revoked_at,reason_code)
 VALUES (?,?,?,?)`).run("grant-1","admin","2026-11-17T19:30:00.000Z","ACCESS_WITHDRAWN");
 assert.throws(()=>assignment(db,{id:"revoked-assignment"}),/ASSIGNMENT_NOT_AUTHORISED_BY_ACTIVE_GRANT/);
 grant(db,{id:"grant-2",role:"SENIOR_REVIEWER",user:"senior"});
 addEvent(db,{kind:"CASE_INVALIDATED",id:"invalidate-1",payload:{reason:"LISTING_CHANGED"}});
 assert.throws(()=>assignment(db,{id:"inactive-assignment",grantId:"grant-2"}),/ASSIGNMENT_CASE_INACTIVE/);
 db.close();
});

test("assignment withdrawal cannot be overwritten or deleted",()=>{
 const db=setup();addCase(db);grant(db);assignment(db);
 db.prepare(`INSERT INTO reviewer_case_unassignments(
 assignment_id,unassigned_by_user_id,unassigned_at,reason_code
 ) VALUES(?,?,?,?)`).run("assignment-1","admin","2026-11-17T19:35:00.000Z","CASE_REASSIGNED");
 assert.throws(()=>db.exec("UPDATE reviewer_case_unassignments SET reason_code='tamper'"),/IMMUTABLE_REVIEW_UNASSIGNMENT/);
 assert.throws(()=>db.exec("DELETE FROM reviewer_case_unassignments"),/IMMUTABLE_REVIEW_UNASSIGNMENT/);
 db.close();
});

test("transaction rollback leaves no partially committed event or head update",()=>{
 const db=setup();addCase(db);
 db.exec("BEGIN IMMEDIATE");
 addEvent(db);
 assert.throws(()=>addEvent(db,{seq:3,id:"evt-skipped",prev:H(100)}),/REVIEW_EVENT_OUT_OF_SEQUENCE/);
 db.exec("ROLLBACK");
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviewer_case_events").get().n,0);
 const head=db.prepare("SELECT * FROM reviewer_case_heads WHERE case_id='case-1'").get();
 assert.equal(head.last_sequence,0);
 assert.equal(head.last_event_hash,null);
 db.close();
});
