// Server-side PriceCharting provider adapter for RetroNomad.
//
// This module deliberately returns marketplace evidence only. PALScout and the
// shared target matcher remain responsible for release identity and MATCH /
// REVIEW / FILTERED decisions.

const BASE_URL = "https://www.pricecharting.com";
const DEFAULT_MIN_INTERVAL_MS = 1050;
const OFFERS_CACHE_MS = 5 * 60 * 1000;
const PRODUCT_CACHE_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 250;

export const PAL_CONSOLES = Object.freeze({
  PS1: Object.freeze({ id: "G72", name: "PAL Playstation" }),
  PS2: Object.freeze({ id: "G63", name: "PAL Playstation 2" }),
  Dreamcast: Object.freeze({ id: "G65", name: "PAL Sega Dreamcast" })
});

export const PRICECHARTING_CONDITION_IDS = Object.freeze({
  loose: "1",
  new: "2",
  cib: "3",
  graded: "5",
  boxOnly: "6",
  manualOnly: "7",
  itemAndBox: "8",
  itemAndManual: "9",
  boxAndManual: "10",
  gradedCib: "13"
});

const sharedRateState = { lastCallAt: 0 };
const sharedCache = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stripProviderVariantSuffix(value) {
  return String(value || "")
    .replace(/\s*[\[(][^\])]+[\])]\s*$/g, "")
    .trim();
}

function sameGameTitle(targetGame, providerTitle) {
  return norm(targetGame) === norm(stripProviderVariantSuffix(providerTitle));
}

function centsToUsd(value) {
  const cents = Number(value);
  return Number.isFinite(cents) && cents >= 0 ? cents / 100 : null;
}

function absolutePriceChartingUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw, BASE_URL).toString();
  } catch {
    return "";
  }
}

export function priceChartingAttributionUrl(productId) {
  const id = String(productId || "").trim();
  if (!id) return BASE_URL;
  const url = new URL("/offers", BASE_URL);
  url.searchParams.set("product", id);
  return url.toString();
}

function safeDate(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "0001-01-01") return null;
  const d = new Date(raw.length === 10 ? raw + "T00:00:00Z" : raw);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

function identifiersFromProduct(product = {}) {
  const raw = String(product.upc || "");
  const matches = raw.match(/\d{11,14}/g) || [];
  return [...new Set(matches)];
}

function completenessEvidence(includeString) {
  const raw = String(includeString || "").trim();
  const n = norm(raw);
  if (!raw) return "";
  if (/\b(game|item) box (and )?manual\b/.test(n)) return `Complete in box (CIB). ${raw}`;
  if (/\b(game|item) (only|disc only)\b/.test(n) || n === "loose") return `Disc only / loose copy. ${raw}`;
  if (/\b(game|item) (and )?box\b/.test(n) && !/manual/.test(n)) return `Game and case; no manual. ${raw}`;
  if (/\b(game|item) (and )?manual\b/.test(n) && !/box/.test(n)) return `Game and manual; no case. ${raw}`;
  if (/\bbox only\b/.test(n)) return `Box only / case only. ${raw}`;
  if (/\bmanual only\b/.test(n)) return `Manual only. ${raw}`;
  if (/\bnew|sealed\b/.test(n)) return `New / sealed. ${raw}`;
  return raw;
}

function offerConditionFilter(target = {}) {
  return target.completeness === "cib" ? PRICECHARTING_CONDITION_IDS.cib : null;
}

function cacheGet(cache, key, now) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= now) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cachePut(cache, key, value, ttlMs, now) {
  if (!ttlMs) return;
  for (const [k, v] of cache) {
    if (v.expiresAt <= now) cache.delete(k);
  }
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { value, expiresAt: now + ttlMs });
}

function cacheKey(path, params) {
  const copy = new URLSearchParams(params);
  copy.delete("t");
  return `${path}?${copy.toString()}`;
}

async function throttle({ minIntervalMs, rateState, nowFn, sleepFn }) {
  if (!(minIntervalMs > 0)) return;
  const now = nowFn();
  const wait = rateState.lastCallAt ? minIntervalMs - (now - rateState.lastCallAt) : 0;
  if (wait > 0) await sleepFn(wait);
  rateState.lastCallAt = nowFn();
}

function providerError(code, message, status = 502) {
  const e = new Error(message);
  e.code = code;
  e.status = status;
  return e;
}

export function createPriceChartingClient({
  token,
  fetchFn = fetch,
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
  rateState = sharedRateState,
  cache = sharedCache,
  nowFn = Date.now,
  sleepFn = sleep
} = {}) {
  const privateToken = String(token || "").trim();
  if (!privateToken) throw providerError("pricecharting_token_missing", "PriceCharting token is not configured.", 503);

  async function request(path, query = {}, ttlMs = 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    const key = cacheKey(path, params);
    const now = nowFn();
    const cached = cacheGet(cache, key, now);
    if (cached) return cached;

    await throttle({ minIntervalMs, rateState, nowFn, sleepFn });
    params.set("t", privateToken);
    const url = `${BASE_URL}${path}?${params.toString()}`;

    let response;
    try {
      response = await fetchFn(url, { method: "GET", headers: { accept: "application/json" } });
    } catch {
      throw providerError("pricecharting_unavailable", `PriceCharting request failed for ${path}.`, 503);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.status === "error") {
      throw providerError("pricecharting_request_failed", `PriceCharting request failed for ${path}.`, response.status || 502);
    }
    cachePut(cache, key, data, ttlMs, nowFn());
    return data;
  }

  return {
    async searchProducts(query) {
      const data = await request("/api/products", { q: query }, PRODUCT_CACHE_MS);
      return Array.isArray(data.products) ? data.products : [];
    },
    async getProductById(id) {
      return request("/api/product", { id }, PRODUCT_CACHE_MS);
    },
    async getProductByUpc(upc) {
      return request("/api/product", { upc }, PRODUCT_CACHE_MS);
    },
    async getOffers({ productId, consoleId, conditionId = null, sort = "lowest-price" }) {
      const data = await request("/api/offers", {
        status: "available",
        id: productId,
        console: consoleId,
        "condition-id": conditionId,
        sort
      }, OFFERS_CACHE_MS);
      return Array.isArray(data.offers) ? data.offers : [];
    }
  };
}

export function referencePriceFromProduct(product = {}, completeness) {
  const field = {
    cib: "cib-price",
    complete: "cib-price",
    loose: "loose-price",
    disc_only: "loose-price",
    new: "new-price",
    sealed: "new-price",
    box_only: "box-only-price",
    case_only: "box-only-price",
    manual_only: "manual-only-price"
  }[String(completeness || "").toLowerCase()];
  if (!field) return null;
  const usd = centsToUsd(product[field]);
  return usd == null ? null : {
    source: "PriceCharting",
    productId: String(product.id || ""),
    field,
    currency: "USD",
    amount: usd,
    attributionText: "Price data via PriceCharting",
    attributionUrl: priceChartingAttributionUrl(product.id),
    productUrl: priceChartingAttributionUrl(product.id)
  };
}

export function normalizePriceChartingOffer(offer = {}, product = {}, expectedConsole = {}) {
  const productId = String(product.id || offer.id || "");
  const include = String(offer["include-string"] || "").trim();
  const condition = String(offer["condition-string"] || "").trim();
  const completeness = completenessEvidence(include);
  const conditionText = [completeness, condition].filter(Boolean).join(". ");
  const identifiers = identifiersFromProduct(product);
  const productName = String(offer["product-name"] || product["product-name"] || "").trim();
  const consoleName = String(offer["console-name"] || product["console-name"] || expectedConsole.name || "").trim();

  return {
    source: "pricecharting",
    externalId: String(offer["offer-id"] || ""),
    canonicalUrl: absolutePriceChartingUrl(offer["offer-url"]),
    title: productName,
    description: [
      "PriceCharting Marketplace offer.",
      include ? `Includes: ${include}.` : "",
      condition ? `Condition: ${condition}.` : "",
      consoleName ? `Console: ${consoleName}.` : ""
    ].filter(Boolean).join(" "),
    imageUrl: absolutePriceChartingUrl(offer["image-url"]),
    currency: "USD",
    itemPrice: centsToUsd(offer.price),
    postage: null,
    total: null,
    deliveredGbp: null,
    seller: "",
    listedAt: safeDate(offer["start-time"]),
    fetchedAt: new Date().toISOString(),
    sourceRegion: "PAL Europe",
    conditionText,
    itemSpecifics: {
      provider: "PriceCharting Marketplace",
      priceChartingProductId: productId,
      priceChartingConsoleId: String(expectedConsole.id || ""),
      consoleName,
      includeString: include,
      conditionString: condition,
      priceChartingAttributionText: "Price data and marketplace offer via PriceCharting",
      priceChartingAttributionUrl: priceChartingAttributionUrl(productId),
      priceChartingProductUrl: priceChartingAttributionUrl(productId)
    },
    identifiers,
    englishFriendly: null,
    ocrText: "",
    raw: { offer, product }
  };
}

export async function findPriceChartingProductsForTarget(target, options = {}) {
  const platform = String(target?.platform || "");
  const game = String(target?.game || "").trim();
  if (!game) throw providerError("pricecharting_game_required", "Game is required for PriceCharting search.", 400);
  const consoleInfo = PAL_CONSOLES[platform];
  if (!consoleInfo) throw providerError("pricecharting_platform_unsupported", "PriceCharting PAL adapter does not support this platform.", 400);

  const client = options.client || createPriceChartingClient(options);
  const query = `${game} ${consoleInfo.name}`;
  const discovered = await client.searchProducts(query);
  const candidates = discovered.filter(row =>
    String(row["console-name"] || "").toLowerCase() === consoleInfo.name.toLowerCase() &&
    sameGameTitle(game, row["product-name"])
  );

  const details = [];
  for (const row of candidates.slice(0, Math.max(1, Number(options.maxProducts || 8)))) {
    const detail = await client.getProductById(row.id);
    if (String(detail["console-name"] || "").toLowerCase() !== consoleInfo.name.toLowerCase()) continue;
    if (!sameGameTitle(game, detail["product-name"])) continue;
    details.push(detail);
  }
  return { consoleInfo, products: details };
}

export async function searchPriceChartingMarketplace(target, options = {}) {
  const client = options.client || createPriceChartingClient(options);
  const { consoleInfo, products } = await findPriceChartingProductsForTarget(target, { ...options, client });
  const conditionId = offerConditionFilter(target);
  const listings = [];

  for (const product of products) {
    const offers = await client.getOffers({
      productId: product.id,
      consoleId: consoleInfo.id,
      conditionId
    });
    for (const offer of offers) {
      if (String(offer["offer-status"] || "available") !== "available" || offer["is-available"] === false) continue;
      const offerConsole = String(offer["console-name"] || product["console-name"] || "");
      if (offerConsole.toLowerCase() !== consoleInfo.name.toLowerCase()) continue;
      if (!sameGameTitle(target.game, offer["product-name"] || product["product-name"])) continue;
      const normalized = normalizePriceChartingOffer(offer, product, consoleInfo);
      if (!normalized.externalId || !normalized.canonicalUrl || !normalized.title || normalized.itemPrice == null) continue;
      listings.push(normalized);
    }
  }

  return listings;
}
