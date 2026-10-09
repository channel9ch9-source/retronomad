// RetroNomad account + Saved Hunts monitor Worker (Cloudflare Worker / D1 style).
//
// Infrastructure scaffold only; not deployed by this repository.
//
// Required future bindings / secrets:
// DB                         - D1 database created from backend/schema.sql
// APP_ORIGIN                 - public app origin, e.g. https://www.retronomad.example
// ADMIN_TOKEN                - internal scheduler test secret
// RESEND_API_KEY             - preferred transactional email secret
// AUTH_EMAIL_FROM            - optional sender; defaults to Resend test sender
// AUTH_EMAIL_WEBHOOK_URL     - legacy/fallback email-delivery adapter endpoint
// AUTH_EMAIL_WEBHOOK_SECRET  - optional bearer secret for that endpoint
// MARKETPLACE_PROVIDER       - "disabled" until authorised inventory access exists
// NOTIFICATION_PROVIDER      - "disabled" until real notification delivery exists
// CHECK_INTERVAL_MINUTES     - optional, default 60
//
// Production account deployment should use app/API hosts on the same site so
// secure SameSite=Lax HttpOnly sessions work reliably. Do not put session
// tokens in localStorage.

import { runHunt } from "./monitor-core.js";
import { evaluateNormalizedCandidates } from "./search-engine.js";
import {
  normalizeEmail, validEmail, randomToken, sha256Hex, isoAfterMinutes,
  isoAfterDays, sessionTokenFromRequest, sessionCookie, clearSessionCookie,
  safeReturnUrl, opaqueId
} from "./auth-core.js";

function effectiveAppOrigin(request, env) {
  const configured = String(env.APP_ORIGIN || "").replace(/\/$/, "");
  if (configured && configured !== "self") return configured;
  return new URL(request.url).origin;
}

function corsHeaders(env, request) {
  const allowed = effectiveAppOrigin(request, env);
  const origin = request.headers.get("origin") || "";
  const h = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin"
  };
  if (allowed && origin === allowed) {
    h["access-control-allow-origin"] = allowed;
    h["access-control-allow-credentials"] = "true";
  }
  return h;
}

function json(body, status = 200, env = {}, request = new Request("https://invalid.local")) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(env, request) });
}

function originAllowed(request, env) {
  const allowed = effectiveAppOrigin(request, env);
  if (!allowed) return false;
  const origin = request.headers.get("origin") || "";
  if (origin) return origin === allowed;
  // Same-origin GETs may omit Origin entirely. Only accept that case when the
  // request itself is hosted on the configured app origin.
  return new URL(request.url).origin === allowed;
}

function parseJson(text, fallback = null) {
  try { return JSON.parse(text); } catch { return fallback; }
}

function safeIso(v, fallback) {
  const d = new Date(v || "");
  return Number.isFinite(d.getTime()) ? d.toISOString() : fallback;
}

function boolInt(v) { return v === true ? 1 : 0; }

function normaliseTarget(t = {}) {
  const n = Number(t.maxDeliveredGbp);
  return {
    catalogueId: String(t.catalogueId || "").trim().slice(0, 220),
    game: String(t.game || "").trim().slice(0, 200),
    platform: String(t.platform || "").trim().slice(0, 40),
    compatibility: String(t.compatibility || "UK_EU_PAL").slice(0, 80),
    releasePreference: String(t.releasePreference || "pal-compatible").slice(0, 80),
    editionPreference: String(t.editionPreference || "any").slice(0, 80),
    completeness: String(t.completeness || "any").slice(0, 80),
    condition: String(t.condition || "any").slice(0, 80),
    englishRequired: t.englishRequired === true,
    excludeBundles: t.excludeBundles !== false,
    excludePromo: t.excludePromo !== false,
    maxDeliveredGbp: Number.isFinite(n) && n >= 0 ? n : null
  };
}

function validateIncomingHunt(h) {
  const target = normaliseTarget(h?.target || {});
  if (!target.game) return { ok: false, error: "game_required" };
  const status = ["ACTIVE", "PAUSED", "ARCHIVED"].includes(h?.status) ? h.status : "ACTIVE";
  return {
    ok: true,
    hunt: {
      id: String(h?.id || "").slice(0, 180),
      label: String(h?.label || (target.game + (target.platform ? " · " + target.platform : ""))).trim().slice(0, 240),
      target,
      status,
      alertRequested: h?.alerts?.requested === true,
      createdAt: safeIso(h?.createdAt, new Date().toISOString()),
      clientUpdatedAt: safeIso(h?.updatedAt, new Date().toISOString())
    }
  };
}

function mapMonitorHunt(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    label: row.label,
    target: parseJson(row.target_json, {}),
    status: row.status,
    alertRequested: Boolean(row.alert_requested),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastCheckedAt: row.last_checked_at,
    nextCheckAt: row.next_check_at
  };
}

function authEmailProvider(env) {
  if (env.RESEND_API_KEY) return "resend";
  if (env.AUTH_EMAIL_WEBHOOK_URL) return "webhook";
  return "none";
}

function escapeHtml(v) {
  return String(v || "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

async function sendViaResend(env, to, magicLink) {
  const from = String(env.AUTH_EMAIL_FROM || "RetroNomad <onboarding@resend.dev>").trim();
  const safeLink = escapeHtml(magicLink);
  const requestedAt = new Date();
  const requestRef = requestedAt.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const subjectTime = requestedAt.toISOString().slice(11, 16) + " UTC";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + env.RESEND_API_KEY
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "RetroNomad sign-in link · " + subjectTime,
      text:
        "RetroNomad sign-in request " + requestRef + "\n\n" +
        "Use this one-time link to sign in:\n\n" +
        magicLink +
        "\n\nThis link expires in 15 minutes and can only be used once. " +
        "If you did not request it, you can ignore this email.",
      html:
        '<div style="display:none;max-height:0;overflow:hidden">RetroNomad sign-in request ' + requestRef + '</div>' +
        "<h2>Sign in to RetroNomad</h2>" +
        "<p>Use the button below to finish signing in.</p>" +
        '<p><a href="' + safeLink + '" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Sign in to RetroNomad</a></p>' +
        "<p>This link expires in 15 minutes and can only be used once.</p>" +
        "<p>If you did not request it, you can ignore this email.</p>",
      tags: [{ name: "category", value: "sign_in" }]
    })
  });
  if (!r.ok) {
    const e = new Error("Authentication email delivery failed.");
    e.code = "auth_email_failed";
    throw e;
  }
}

async function sendViaWebhook(env, to, magicLink) {
  const headers = { "content-type": "application/json" };
  if (env.AUTH_EMAIL_WEBHOOK_SECRET) headers.authorization = "Bearer " + env.AUTH_EMAIL_WEBHOOK_SECRET;
  const r = await fetch(env.AUTH_EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "RETRO_NOMAD_SIGN_IN_LINK",
      to,
      subject: "Sign in to RetroNomad",
      magicLink
    })
  });
  if (!r.ok) {
    const e = new Error("Authentication email delivery failed.");
    e.code = "auth_email_failed";
    throw e;
  }
}

async function sendMagicLink(env, to, magicLink) {
  const provider = authEmailProvider(env);
  if (provider === "resend") return sendViaResend(env, to, magicLink);
  if (provider === "webhook") return sendViaWebhook(env, to, magicLink);
  const e = new Error("Authentication email delivery is not configured.");
  e.code = "auth_email_not_configured";
  throw e;
}

async function enforceLoginRequestRate(env, email) {
  const emailNorm = normalizeEmail(email);
  const now = Date.now();
  const oneMinuteAgo = new Date(now - 60 * 1000).toISOString();
  const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000).toISOString();

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM auth_tokens WHERE email_norm = ? AND created_at >= ?"
  ).bind(emailNorm, oneMinuteAgo).first();
  if (Number(recent?.n || 0) >= 1) {
    const e = new Error("Please wait a minute before requesting another sign-in link.");
    e.code = "rate_limited";
    e.status = 429;
    throw e;
  }

  const windowed = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM auth_tokens WHERE email_norm = ? AND created_at >= ?"
  ).bind(emailNorm, fifteenMinutesAgo).first();
  if (Number(windowed?.n || 0) >= 5) {
    const e = new Error("Too many sign-in-link requests. Please try again later.");
    e.code = "rate_limited";
    e.status = 429;
    throw e;
  }
}

async function createLoginToken(env, email, returnTo, request) {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();
  const id = opaqueId("auth");
  const expires = isoAfterMinutes(15);
  await env.DB.prepare(
    `INSERT INTO auth_tokens
     (id, email_norm, email_display, token_hash, purpose, return_to, created_at, expires_at, used_at)
     VALUES (?, ?, ?, ?, 'LOGIN', ?, ?, ?, NULL)`
  ).bind(id, normalizeEmail(email), String(email).trim(), tokenHash, returnTo, now, expires).run();

  const apiOrigin = new URL(request.url).origin;
  const u = new URL("/api/auth/verify", apiOrigin);
  u.searchParams.set("token", token);
  return { magicLink: u.toString(), tokenId: id };
}

async function sessionFromRequest(request, env) {
  const raw = sessionTokenFromRequest(request);
  if (!raw || !env.DB) return null;
  const hash = await sha256Hex(raw);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT s.id AS session_id, s.user_id, s.expires_at, u.email_display, u.email_norm
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
     LIMIT 1`
  ).bind(hash, now).first();
  if (!row) return null;
  await env.DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").bind(now, row.session_id).run();
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    email: row.email_display,
    emailNorm: row.email_norm,
    rawToken: raw,
    tokenHash: hash
  };
}

async function requireSession(request, env) {
  const session = await sessionFromRequest(request, env);
  if (!session) {
    const e = new Error("Sign in is required.");
    e.code = "not_authenticated";
    e.status = 401;
    throw e;
  }
  return session;
}

async function verifyMagicLink(request, env) {
  if (!env.DB) return json({ error: "account_backend_not_configured" }, 503, env, request);
  const appOrigin = effectiveAppOrigin(request, env);
  const u = new URL(request.url);
  const token = u.searchParams.get("token") || "";
  if (!token) return json({ error: "invalid_or_expired_link" }, 400, env, request);

  const hash = await sha256Hex(token);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT * FROM auth_tokens
     WHERE token_hash = ? AND purpose = 'LOGIN' AND used_at IS NULL AND expires_at > ?
     LIMIT 1`
  ).bind(hash, now).first();

  if (!row) return json({ error: "invalid_or_expired_link" }, 400, env, request);

  const used = await env.DB.prepare(
    "UPDATE auth_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL"
  ).bind(now, row.id).run();
  if (!(used.meta?.changes > 0)) return json({ error: "invalid_or_expired_link" }, 400, env, request);

  let user = await env.DB.prepare("SELECT * FROM users WHERE email_norm = ? LIMIT 1").bind(row.email_norm).first();
  if (!user) {
    const id = opaqueId("usr");
    await env.DB.prepare(
      "INSERT INTO users (id, email_norm, email_display, created_at, last_login_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, row.email_norm, row.email_display, now, now).run();
    user = { id, email_norm: row.email_norm, email_display: row.email_display };
  } else {
    await env.DB.prepare("UPDATE users SET last_login_at = ?, email_display = ? WHERE id = ?")
      .bind(now, row.email_display, user.id).run();
  }

  const rawSession = randomToken(40);
  const sessionHash = await sha256Hex(rawSession);
  const sessionId = opaqueId("sess");
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at, last_seen_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?, NULL)"
  ).bind(sessionId, user.id, sessionHash, now, isoAfterDays(30), now).run();

  const dest = safeReturnUrl(row.return_to, appOrigin);
  return new Response(null, {
    status: 302,
    headers: {
      location: dest || appOrigin + "/wishlist.html",
      "set-cookie": sessionCookie(rawSession, 30 * 86400),
      "cache-control": "no-store"
    }
  });
}

async function listServerHunts(env, ownerId) {
  const q = await env.DB.prepare(
    `SELECT * FROM saved_hunts
     WHERE owner_id = ? AND deleted_at IS NULL
     ORDER BY updated_at DESC`
  ).bind(ownerId).all();
  const out = [];
  for (const row of q.results || []) {
    const mh = await env.DB.prepare(
      `SELECT source, external_id, title, canonical_url, delivered_gbp, first_seen_at, last_seen_at, last_match_state
       FROM hunt_matches WHERE hunt_id = ? ORDER BY last_seen_at DESC LIMIT 100`
    ).bind(row.id).all();
    out.push({
      schemaVersion: row.schema_version || 1,
      id: row.id,
      label: row.label,
      target: parseJson(row.target_json, {}),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.client_updated_at || row.updated_at,
      monitoring: {
        state: row.last_checked_at ? "CHECKED_BACKEND" : "NOT_RUNNING",
        lastCheckedAt: row.last_checked_at || null,
        lastCheckSummary: parseJson(row.last_check_json, null)
      },
      alerts: {
        requested: Boolean(row.alert_requested),
        state: env.NOTIFICATION_PROVIDER && env.NOTIFICATION_PROVIDER !== "disabled"
          ? "BACKEND_READY" : "BACKEND_NO_DELIVERY_PROVIDER",
        channel: null,
        lastNotifiedAt: null
      },
      matchHistory: (mh.results || []).map(x => ({
        source: x.source,
        externalId: x.external_id,
        title: x.title,
        canonicalUrl: x.canonical_url,
        deliveredGbp: x.delivered_gbp == null ? null : Number(x.delivered_gbp),
        firstSeenAt: x.first_seen_at,
        lastSeenAt: x.last_seen_at,
        lastMatchState: x.last_match_state
      }))
    });
  }
  return out;
}

async function syncHunts(request, env, session) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 1024 * 1024) return json({ error: "payload_too_large" }, 413, env, request);
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.hunts) || !Array.isArray(body.deletions || [])) {
    return json({ error: "invalid_sync_payload" }, 400, env, request);
  }
  if (body.hunts.length > 200 || (body.deletions || []).length > 200) {
    return json({ error: "too_many_hunts" }, 400, env, request);
  }

  const now = new Date().toISOString();
  const conflicts = [];
  const acknowledgedDeletionIds = [];

  for (const d of body.deletions || []) {
    const id = String(d?.id || "").slice(0, 180);
    if (!id) continue;
    await env.DB.prepare(
      `UPDATE saved_hunts SET deleted_at = ?, updated_at = ?
       WHERE id = ? AND owner_id = ? AND deleted_at IS NULL`
    ).bind(now, now, id, session.userId).run();
    acknowledgedDeletionIds.push(id);
  }

  for (const input of body.hunts) {
    const parsed = validateIncomingHunt(input);
    if (!parsed.ok) continue;
    const h = parsed.hunt;
    if (!h.id) continue;

    const existing = await env.DB.prepare("SELECT * FROM saved_hunts WHERE id = ? LIMIT 1").bind(h.id).first();
    if (existing && existing.owner_id !== session.userId) {
      conflicts.push({ id: h.id, code: "id_conflict" });
      continue;
    }
    if (existing?.deleted_at) {
      conflicts.push({ id: h.id, code: "server_tombstone" });
      continue;
    }

    if (!existing) {
      await env.DB.prepare(
        `INSERT INTO saved_hunts
         (id, owner_id, schema_version, label, target_json, status, alert_requested,
          created_at, client_updated_at, updated_at, deleted_at, last_checked_at, last_check_json, next_check_at)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)`
      ).bind(
        h.id, session.userId, h.label, JSON.stringify(h.target), h.status, boolInt(h.alertRequested),
        h.createdAt, h.clientUpdatedAt, now
      ).run();
      continue;
    }

    const serverClientUpdated = String(existing.client_updated_at || existing.updated_at || "");
    if (h.clientUpdatedAt > serverClientUpdated) {
      await env.DB.prepare(
        `UPDATE saved_hunts SET
          label = ?, target_json = ?, status = ?, alert_requested = ?,
          client_updated_at = ?, updated_at = ?
         WHERE id = ? AND owner_id = ? AND deleted_at IS NULL`
      ).bind(
        h.label, JSON.stringify(h.target), h.status, boolInt(h.alertRequested),
        h.clientUpdatedAt, now, h.id, session.userId
      ).run();
    }
  }

  return json({
    ok: true,
    syncedAt: now,
    deviceId: String(body.deviceId || "").slice(0, 180) || null,
    hunts: await listServerHunts(env, session.userId),
    acknowledgedDeletionIds,
    conflicts
  }, 200, env, request);
}

async function dueHunts(env, limit = 25) {
  const ts = new Date().toISOString();
  const q = await env.DB.prepare(
    `SELECT * FROM saved_hunts
     WHERE status = 'ACTIVE'
       AND alert_requested = 1
       AND deleted_at IS NULL
       AND (next_check_at IS NULL OR next_check_at <= ?)
     ORDER BY COALESCE(next_check_at, created_at) ASC
     LIMIT ?`
  ).bind(ts, limit).all();
  return (q.results || []).map(mapMonitorHunt);
}

async function seenKeys(env, huntId) {
  const q = await env.DB.prepare("SELECT source, external_id FROM hunt_matches WHERE hunt_id = ?").bind(huntId).all();
  return new Set((q.results || []).map(r => String(r.source) + "|" + String(r.external_id)));
}

async function persistMatches(env, huntId, rows) {
  for (const row of rows) {
    await env.DB.prepare(
      `INSERT INTO hunt_matches
       (hunt_id, source, external_id, title, canonical_url, delivered_gbp, first_seen_at, last_seen_at, last_match_state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MATCH')
       ON CONFLICT(hunt_id, source, external_id) DO UPDATE SET
         title = excluded.title, canonical_url = excluded.canonical_url,
         delivered_gbp = excluded.delivered_gbp, last_seen_at = excluded.last_seen_at,
         last_match_state = 'MATCH'`
    ).bind(huntId, row.source, row.externalId, row.title, row.canonicalUrl, row.deliveredGbp, row.firstSeenAt, row.lastSeenAt).run();
  }
}

async function persistRun(env, run) {
  await env.DB.prepare(
    `INSERT INTO monitor_runs
     (id, hunt_id, started_at, finished_at, provider_count, candidate_count, match_count, review_count, filtered_count, new_match_count, status, error_code, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    run.id, run.huntId, run.startedAt, run.finishedAt || null, run.providerCount || 0,
    run.total || 0, run.MATCH || 0, run.REVIEW || 0, run.FILTERED || 0,
    run.newMatchCount || 0, run.status, run.errorCode || null, run.errorMessage || null
  ).run();

  await env.DB.prepare(
    `UPDATE saved_hunts SET last_checked_at = ?, last_check_json = ?, next_check_at = ?, updated_at = ? WHERE id = ?`
  ).bind(
    run.finishedAt || null,
    JSON.stringify({ total: run.total || 0, MATCH: run.MATCH || 0, REVIEW: run.REVIEW || 0, FILTERED: run.FILTERED || 0, newMatchCount: run.newMatchCount || 0, status: run.status }),
    run.nextCheckAt || null, run.finishedAt || new Date().toISOString(), run.huntId
  ).run();
}

function queueId(huntId, source, externalId) {
  return ("notify_" + [huntId, source, externalId].join("_")).replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 220);
}

async function persistNotification(env, item) {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO notification_queue
     (id, hunt_id, source, external_id, channel, payload_json, created_at, status)
     VALUES (?, ?, ?, ?, NULL, ?, ?, 'PENDING')`
  ).bind(queueId(item.huntId, item.source, item.externalId), item.huntId, item.source, item.externalId, JSON.stringify(item.payload), new Date().toISOString()).run();
}

async function fetchAuthorisedCandidates(target, env) {
  if (!env.MARKETPLACE_PROVIDER || env.MARKETPLACE_PROVIDER === "disabled") {
    const e = new Error("No authorised marketplace inventory provider is configured.");
    e.code = "provider_not_configured";
    throw e;
  }

  // Future provider adapters must return the normalised marketplace-listing
  // contract. They must not perform release classification themselves.
  throw Object.assign(
    new Error("Configured marketplace provider has no authorised adapter implementation yet."),
    { code: "provider_adapter_missing" }
  );
}

async function searchAuthorisedInventory(target, env) {
  const candidates = await fetchAuthorisedCandidates(target, env);
  return evaluateNormalizedCandidates(target, candidates);
}

async function runOne(env, hunt) {
  return runHunt({
    hunt,
    search: target => searchAuthorisedInventory(target, env),
    loadSeenKeys: huntId => seenKeys(env, huntId),
    saveMatches: (huntId, rows) => persistMatches(env, huntId, rows),
    saveRun: run => persistRun(env, run),
    queueNotification: item => persistNotification(env, item),
    intervalMinutes: Number(env.CHECK_INTERVAL_MINUTES || 60)
  });
}

async function runDue(env, limit = 25) {
  if (!env.DB) throw new Error("DB binding is not configured.");
  const hunts = await dueHunts(env, limit), results = [];
  for (const hunt of hunts) results.push(await runOne(env, hunt));
  return {
    due: hunts.length,
    completed: results.length,
    providerUnavailable: results.filter(x => x.run?.status === "PROVIDER_UNAVAILABLE").length,
    failed: results.filter(x => x.run?.status === "FAILED").length
  };
}

function authorisedAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  return (request.headers.get("authorization") || "") === "Bearer " + env.ADMIN_TOKEN;
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!originAllowed(request, env)) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": String(env.APP_ORIGIN || "").replace(/\/$/, ""),
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400",
          "vary": "Origin"
        }
      });
    }

    if (request.method === "GET" && u.pathname === "/health") {
      return json({
        service: "retronomad-account-monitor",
        status: "scaffold_only",
        databaseConfigured: Boolean(env.DB),
        appOriginMode: String(env.APP_ORIGIN || "self"),
        authEmailConfigured: authEmailProvider(env) !== "none",
        authEmailProvider: authEmailProvider(env),
        serverClassificationReady: true,
        marketplaceConfigured: Boolean(env.MARKETPLACE_PROVIDER && env.MARKETPLACE_PROVIDER !== "disabled"),
        notificationsConfigured: Boolean(env.NOTIFICATION_PROVIDER && env.NOTIFICATION_PROVIDER !== "disabled")
      }, 200, env, request);
    }

    if (request.method === "GET" && u.pathname === "/api/auth/verify") {
      return verifyMagicLink(request, env);
    }

    if (request.method === "POST" && u.pathname === "/api/auth/request-link") {
      if (!originAllowed(request, env)) return json({ error: "origin_not_allowed" }, 403, env, request);
      if (!env.DB) return json({ error: "account_backend_not_configured" }, 503, env, request);
      const body = await request.json().catch(() => ({}));
      const email = String(body.email || "").trim();
      if (!validEmail(email)) return json({ error: "invalid_email" }, 400, env, request);
      const returnTo = safeReturnUrl(body.returnTo, effectiveAppOrigin(request, env));
      let created;
      try {
        await enforceLoginRequestRate(env, email);
        created = await createLoginToken(env, email, returnTo, request);
        await sendMagicLink(env, email, created.magicLink);
      } catch (e) {
        if (created?.tokenId) await env.DB.prepare("DELETE FROM auth_tokens WHERE id = ?").bind(created.tokenId).run();
        return json(
          { error: e.code || "auth_delivery_failed", message: String(e.message || e) },
          e.status || 503,
          env,
          request
        );
      }
      return json({ ok: true, message: "If delivery is available, a one-time sign-in link has been sent." }, 202, env, request);
    }

    if (request.method === "GET" && u.pathname === "/api/me") {
      if (!originAllowed(request, env)) return json({ error: "origin_not_allowed" }, 403, env, request);
      const s = await sessionFromRequest(request, env);
      if (!s) return json({ authenticated: false }, 200, env, request);
      return json({ authenticated: true, user: { id: s.userId, email: s.email } }, 200, env, request);
    }

    if (request.method === "POST" && u.pathname === "/api/auth/logout") {
      if (!originAllowed(request, env)) return json({ error: "origin_not_allowed" }, 403, env, request);
      const s = await sessionFromRequest(request, env);
      if (s) await env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE id = ?").bind(new Date().toISOString(), s.sessionId).run();
      const response = json({ ok: true }, 200, env, request);
      response.headers.append("set-cookie", clearSessionCookie());
      return response;
    }

    if (request.method === "POST" && u.pathname === "/api/hunts/sync") {
      if (!originAllowed(request, env)) return json({ error: "origin_not_allowed" }, 403, env, request);
      try {
        const s = await requireSession(request, env);
        return await syncHunts(request, env, s);
      } catch (e) {
        return json({ error: e.code || "sync_failed", message: String(e.message || e) }, e.status || 500, env, request);
      }
    }

    if (request.method === "POST" && u.pathname === "/internal/run-due") {
      if (!authorisedAdmin(request, env)) return json({ error: "unauthorised" }, 401, env, request);
      try {
        return json(await runDue(env, Math.min(100, Math.max(1, Number(u.searchParams.get("limit") || 25)))), 200, env, request);
      } catch (e) {
        return json({ error: "run_failed", message: String(e.message || e) }, 500, env, request);
      }
    }

    return json({ error: "not_found" }, 404, env, request);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDue(env, 25));
  }
};
