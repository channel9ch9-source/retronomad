// RetroNomad alert-monitor core.
// Provider-neutral and notification-neutral by design.
// This file contains no marketplace scraping, API key, or notification credential.

export function nowIso(clock = Date) {
  return new clock().toISOString();
}

export function nextCheckIso(fromIso, intervalMinutes = 60) {
  const base = fromIso ? new Date(fromIso) : new Date();
  return new Date(base.getTime() + Math.max(60, Number(intervalMinutes) || 60) * 60000).toISOString();
}

export function normalizeSummary(summary = {}) {
  return {
    total: Number(summary.total) || 0,
    MATCH: Number(summary.MATCH) || 0,
    REVIEW: Number(summary.REVIEW) || 0,
    FILTERED: Number(summary.FILTERED) || 0
  };
}

export function matchKey(row) {
  return [String(row?.source || ""), String(row?.externalId || "")].join("|");
}

export function qualifyingMatches(rows = []) {
  return rows.filter(row =>
    row &&
    row.match?.state === "MATCH" &&
    String(row.source || "") &&
    String(row.externalId || "")
  );
}

export function diffNewMatches(rows = [], seenKeys = new Set()) {
  return qualifyingMatches(rows).filter(row => !seenKeys.has(matchKey(row)));
}

function knownDeliveredGbp(value){
  if(value==null||typeof value==="boolean"||(typeof value==="string"&&!value.trim()))return null;
  const number=Number(value);
  return Number.isFinite(number)&&number>=0?number:null;
}

export function matchRecord(huntId, row, ts = new Date().toISOString()) {
  return {
    huntId,
    source: String(row.source || ""),
    externalId: String(row.externalId || ""),
    title: String(row.title || ""),
    canonicalUrl: String(row.canonicalUrl || ""),
    deliveredGbp: knownDeliveredGbp(row.match?.deliveredGbp),
    firstSeenAt: ts,
    lastSeenAt: ts,
    lastMatchState: "MATCH"
  };
}

export function notificationPayload(hunt, row, ts = new Date().toISOString()) {
  return {
    schemaVersion: 1,
    type: "NEW_SAVED_HUNT_MATCH",
    createdAt: ts,
    hunt: {
      id: hunt.id,
      label: hunt.label,
      target: hunt.target
    },
    listing: {
      source: String(row.source || ""),
      externalId: String(row.externalId || ""),
      title: String(row.title || ""),
      canonicalUrl: String(row.canonicalUrl || ""),
      deliveredGbp: knownDeliveredGbp(row.match?.deliveredGbp),
      classification: row.classification || null
    }
  };
}

export function shouldQueueNotification(hunt, row) {
  return Boolean(
    hunt &&
    hunt.status === "ACTIVE" &&
    hunt.alertRequested === true &&
    row?.match?.state === "MATCH"
  );
}

export async function runHunt({
  hunt,
  search,
  loadSeenKeys = async () => new Set(),
  saveMatches = async () => {},
  saveRun = async () => {},
  queueNotification = async () => {},
  intervalMinutes = 60,
  clock = Date
}) {
  if (!hunt || hunt.status !== "ACTIVE") {
    return { skipped: true, reason: "hunt_not_active" };
  }
  if (typeof search !== "function") {
    return { skipped: true, reason: "provider_not_configured" };
  }

  const startedAt = nowIso(clock);
  const runId = "run_" + hunt.id + "_" + startedAt.replace(/\D/g, "").slice(0, 14);

  try {
    const rows = await search(hunt.target);
    const summary = normalizeSummary({
      total: rows.length,
      MATCH: rows.filter(x => x.match?.state === "MATCH").length,
      REVIEW: rows.filter(x => x.match?.state === "REVIEW").length,
      FILTERED: rows.filter(x => x.match?.state === "FILTERED").length
    });

    const seenKeys = await loadSeenKeys(hunt.id);
    const matches = qualifyingMatches(rows);
    const newMatches = diffNewMatches(rows, seenKeys);
    const finishedAt = nowIso(clock);

    await saveMatches(hunt.id, matches.map(row => matchRecord(hunt.id, row, finishedAt)));

    let queued = 0;
    for (const row of newMatches) {
      if (!shouldQueueNotification(hunt, row)) continue;
      await queueNotification({
        huntId: hunt.id,
        source: row.source,
        externalId: row.externalId,
        payload: notificationPayload(hunt, row, finishedAt)
      });
      queued++;
    }

    const run = {
      id: runId,
      huntId: hunt.id,
      startedAt,
      finishedAt,
      status: "SUCCESS",
      providerCount: 1,
      ...summary,
      newMatchCount: newMatches.length,
      notificationCount: queued,
      nextCheckAt: nextCheckIso(finishedAt, intervalMinutes)
    };
    await saveRun(run);
    return { run, rows, newMatches };
  } catch (error) {
    const finishedAt = nowIso(clock);
    const run = {
      id: runId,
      huntId: hunt.id,
      startedAt,
      finishedAt,
      status: error?.code === "provider_not_configured" ? "PROVIDER_UNAVAILABLE" : "FAILED",
      errorCode: String(error?.code || "monitor_failed"),
      errorMessage: String(error?.message || error),
      nextCheckAt: nextCheckIso(finishedAt, intervalMinutes)
    };
    await saveRun(run);
    return { run, rows: [], newMatches: [] };
  }
}
