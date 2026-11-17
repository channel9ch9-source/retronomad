-- GrailRaven PRIVATE REVIEW LEDGER v1 — OFFLINE SQL DESIGN, NEVER AUTO-APPLY.
--
-- Intentionally OUTSIDE backend/migrations. This script is NOT a production
-- migration, and NO Worker endpoint, access token, D1 binding, or reviewer
-- permission is created by committing it.
--
-- Requires an existing users(id TEXT PRIMARY KEY) table (normal app users).
-- Its sessions are NOT privileged reviewer authentication.
-- All writes must eventually be authorised by a private server, transactional
-- and linked to a real, authenticated reviewer. SQL constraints by themselves
-- cannot defend against an attacker with database write access.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS reviewer_access_grants (
 id TEXT PRIMARY KEY,
 subject_user_id TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('REVIEWER','SENIOR_REVIEWER','REVIEW_ADMIN','AUDITOR')),
 issuer_user_id TEXT NOT NULL,
 granted_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 reason_code TEXT NOT NULL CHECK(length(reason_code) BETWEEN 3 AND 80),
 FOREIGN KEY(subject_user_id) REFERENCES users(id) ON DELETE RESTRICT,
 FOREIGN KEY(issuer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
 CHECK(expires_at>granted_at)
);
CREATE INDEX IF NOT EXISTS idx_reviewer_grants_subject
 ON reviewer_access_grants(subject_user_id,role,expires_at);

-- Revocation is an appended record: never rewrite a previously granted role.
CREATE TABLE IF NOT EXISTS reviewer_access_revocations (
 grant_id TEXT PRIMARY KEY,
 revoked_by_user_id TEXT NOT NULL,
 revoked_at TEXT NOT NULL,
 reason_code TEXT NOT NULL CHECK(length(reason_code) BETWEEN 3 AND 80),
 FOREIGN KEY(grant_id) REFERENCES reviewer_access_grants(id) ON DELETE RESTRICT,
 FOREIGN KEY(revoked_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Every case belongs to ONE listing snapshot, one target, one reference
-- revision, and one evidence-manifest version. Re-review = a NEW case.
-- Hashes are only meaningful if they were calculated by a trusted backend
-- from legitimately obtained source content. NO hash authenticates a photo.
CREATE TABLE IF NOT EXISTS reviewer_cases (
 id TEXT PRIMARY KEY,
 source TEXT NOT NULL CHECK(length(source) BETWEEN 2 AND 80),
 external_listing_id TEXT NOT NULL CHECK(length(external_listing_id) BETWEEN 1 AND 160),
 subject_user_id TEXT,
 listing_snapshot_hash TEXT NOT NULL CHECK(length(listing_snapshot_hash)=64 AND lower(listing_snapshot_hash) NOT GLOB '*[^0-9a-f]*'),
 release_reference_id TEXT NOT NULL,
 release_reference_version TEXT NOT NULL,
 target_hash TEXT NOT NULL CHECK(length(target_hash)=64 AND lower(target_hash) NOT GLOB '*[^0-9a-f]*'),
 evidence_manifest_hash TEXT NOT NULL CHECK(length(evidence_manifest_hash)=64 AND lower(evidence_manifest_hash) NOT GLOB '*[^0-9a-f]*'),
 rights_record_ref TEXT NOT NULL CHECK(length(rights_record_ref) BETWEEN 3 AND 160),
 created_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 created_by_user_id TEXT NOT NULL,
 supersedes_case_id TEXT,
 FOREIGN KEY(subject_user_id) REFERENCES users(id) ON DELETE RESTRICT,
 FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
 FOREIGN KEY(supersedes_case_id) REFERENCES reviewer_cases(id) ON DELETE RESTRICT,
 CHECK(expires_at>created_at),
 CHECK(supersedes_case_id IS NULL OR supersedes_case_id<>id)
);
CREATE INDEX IF NOT EXISTS idx_reviewer_cases_listing
 ON reviewer_cases(source,external_listing_id,created_at DESC);

-- Single mutable materialised head, updated atomically by DB triggers only
-- for appender events; this projection is NOT a substitute for the event log.
CREATE TABLE IF NOT EXISTS reviewer_case_heads (
 case_id TEXT PRIMARY KEY,
 last_sequence INTEGER NOT NULL DEFAULT 0 CHECK(last_sequence>=0),
 last_event_hash TEXT,
 invalidated_at TEXT,
 FOREIGN KEY(case_id) REFERENCES reviewer_cases(id) ON DELETE RESTRICT
);

-- Assignments append new history; withdrawal appends a separate record.
CREATE TABLE IF NOT EXISTS reviewer_case_assignments (
 id TEXT PRIMARY KEY,
 case_id TEXT NOT NULL,
 reviewer_grant_id TEXT NOT NULL,
 assigned_by_user_id TEXT NOT NULL,
 assigned_at TEXT NOT NULL,
 FOREIGN KEY(case_id) REFERENCES reviewer_cases(id) ON DELETE RESTRICT,
 FOREIGN KEY(reviewer_grant_id) REFERENCES reviewer_access_grants(id) ON DELETE RESTRICT,
 FOREIGN KEY(assigned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_review_assignments_case
 ON reviewer_case_assignments(case_id,assigned_at DESC);

CREATE TABLE IF NOT EXISTS reviewer_case_unassignments (
 assignment_id TEXT PRIMARY KEY,
 unassigned_by_user_id TEXT NOT NULL,
 unassigned_at TEXT NOT NULL,
 reason_code TEXT NOT NULL CHECK(length(reason_code) BETWEEN 3 AND 80),
 FOREIGN KEY(assignment_id) REFERENCES reviewer_case_assignments(id) ON DELETE RESTRICT,
 FOREIGN KEY(unassigned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Append-only event payloads are private; never store raw photos, image URLs,
-- secrets, customer email addresses or unrestricted seller descriptions here.
-- Hash chaining MUST be server-computed over a specified canonical encoding.
-- Checking a previous hash does NOT make this log tamper-proof or authenticated.
CREATE TABLE IF NOT EXISTS reviewer_case_events (
 case_id TEXT NOT NULL,
 sequence_no INTEGER NOT NULL CHECK(sequence_no>=1),
 event_id TEXT NOT NULL UNIQUE,
 event_type TEXT NOT NULL CHECK(event_type IN
  ('EVIDENCE_ASSESSED','REVIEW_STARTED','CHECK_RECORDED','ASSESSMENT_SUBMITTED','CASE_INVALIDATED')),
 actor_user_id TEXT NOT NULL,
 occurred_at TEXT NOT NULL,
 previous_event_hash TEXT CHECK(previous_event_hash IS NULL OR
  (length(previous_event_hash)=64 AND lower(previous_event_hash) NOT GLOB '*[^0-9a-f]*')),
 event_hash TEXT NOT NULL CHECK(length(event_hash)=64 AND lower(event_hash) NOT GLOB '*[^0-9a-f]*'),
 payload_json TEXT NOT NULL CHECK(json_valid(payload_json) AND json_type(payload_json)='object'),
 PRIMARY KEY(case_id,sequence_no),
 FOREIGN KEY(case_id) REFERENCES reviewer_cases(id) ON DELETE RESTRICT,
 FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_review_events_case_time
 ON reviewer_case_events(case_id,occurred_at);

-- Ensure a case head exists for EVERY new case. This trigger is intentionally
-- not enough to authorise opening the case; that belongs to a private backend.
CREATE TRIGGER IF NOT EXISTS reviewer_cases_initial_head
 AFTER INSERT ON reviewer_cases
 BEGIN
  INSERT INTO reviewer_case_heads(case_id,last_sequence,last_event_hash,invalidated_at)
  VALUES(NEW.id,0,NULL,NULL);
 END;

CREATE TRIGGER IF NOT EXISTS reviewer_events_sequence_guard
 BEFORE INSERT ON reviewer_case_events
 BEGIN
  SELECT RAISE(ABORT,'REVIEW_CASE_INVALID_OR_TERMINATED')
   WHERE NOT EXISTS(
    SELECT 1 FROM reviewer_case_heads
    WHERE case_id=NEW.case_id AND invalidated_at IS NULL
   );
  SELECT RAISE(ABORT,'REVIEW_EVENT_OUT_OF_SEQUENCE')
   WHERE NEW.sequence_no<>(SELECT last_sequence+1 FROM reviewer_case_heads WHERE case_id=NEW.case_id);
  SELECT RAISE(ABORT,'REVIEW_EVENT_PREVIOUS_HASH_MISMATCH')
   WHERE COALESCE(NEW.previous_event_hash,'') <>
     COALESCE((SELECT last_event_hash FROM reviewer_case_heads WHERE case_id=NEW.case_id),'');
  SELECT RAISE(ABORT,'REVIEW_EVENT_TIMESTAMP_REGRESSION')
   WHERE EXISTS(
    SELECT 1 FROM reviewer_case_events
    WHERE case_id=NEW.case_id AND occurred_at>NEW.occurred_at
   );
 END;

CREATE TRIGGER IF NOT EXISTS reviewer_events_advance_head
 AFTER INSERT ON reviewer_case_events
 BEGIN
  UPDATE reviewer_case_heads SET
   last_sequence=NEW.sequence_no,
   last_event_hash=NEW.event_hash,
   invalidated_at=CASE WHEN NEW.event_type='CASE_INVALIDATED'
     THEN NEW.occurred_at ELSE invalidated_at END
  WHERE case_id=NEW.case_id;
 END;

-- Guard the source-of-truth history against accidental mutation. A database
-- administrator could still disable/replace triggers; preserve off-DB audit
-- anchors/backups and restrictive database credentials in future production.
CREATE TRIGGER IF NOT EXISTS reviewer_case_no_update
 BEFORE UPDATE ON reviewer_cases BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_CASE'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_case_no_delete
 BEFORE DELETE ON reviewer_cases BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_CASE'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_event_no_update
 BEFORE UPDATE ON reviewer_case_events BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_EVENT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_event_no_delete
 BEFORE DELETE ON reviewer_case_events BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_EVENT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_grant_no_update
 BEFORE UPDATE ON reviewer_access_grants BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_GRANT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_grant_no_delete
 BEFORE DELETE ON reviewer_access_grants BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_GRANT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_grant_revoke_no_update
 BEFORE UPDATE ON reviewer_access_revocations BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_REVOKE'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_grant_revoke_no_delete
 BEFORE DELETE ON reviewer_access_revocations BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_REVOKE'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_assign_no_update
 BEFORE UPDATE ON reviewer_case_assignments BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_ASSIGNMENT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_assign_no_delete
 BEFORE DELETE ON reviewer_case_assignments BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_ASSIGNMENT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_unassign_no_update
 BEFORE UPDATE ON reviewer_case_unassignments BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_UNASSIGNMENT'); END;
CREATE TRIGGER IF NOT EXISTS reviewer_unassign_no_delete
 BEFORE DELETE ON reviewer_case_unassignments BEGIN SELECT RAISE(ABORT,'IMMUTABLE_REVIEW_UNASSIGNMENT'); END;

-- No public read permissions or routes, no AUTH_TOKEN as a reviewer grant.
-- Private service must enforce active grant + assignment, step-up auth,
-- source rights, case scope and reviewer/seller separation atomically.
