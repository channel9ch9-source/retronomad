import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { RELEASE_EVIDENCE } from "../shared/release-evidence-data.js";
import {
  PAL_CONSOLES,
  createPriceChartingClient,
  findPriceChartingProductsForTarget,
  referencePriceFromProduct,
  searchPriceChartingMarketplace
} from "../backend/pricecharting-provider.js";
import { evaluateNormalizedCandidates } from "../backend/search-engine.js";

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find(v => v.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function baseProviderTitle(value) {
  return String(value || "")
    .replace(/\s*[\[(][^\])]+[\])]\s*$/g, "")
    .trim();
}

function productMatchesTarget(target, product) {
  const expected = PAL_CONSOLES[target.platform];
  return Boolean(expected) &&
    String(product?.["console-name"] || "").toLowerCase() === expected.name.toLowerCase() &&
    norm(baseProviderTitle(product?.["product-name"])) === norm(target.game);
}

function launchTargets() {
  const seen = new Set();
  const out = [];
  for (const row of RELEASE_EVIDENCE) {
    const [game, platform] = row;
    if (!PAL_CONSOLES[platform]) continue;
    const key = `${game}|${platform}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ game, platform });
  }
  return out;
}

const MARKET_RANK = {
  UK_EXACT: 100,
  UK_SHARED_PAL: 90,
  PAL_SHARED: 80,
  PAL_EUROPE: 70,
  UK_COMPATIBLE_EU_ENGLISH: 60,
  UK_VISUAL_REQUIRED: 50,
  EUROPEAN_ENGLISH_MATERIALS: 40
};

function bestBarcode(game, platform) {
  const rows = RELEASE_EVIDENCE
    .filter(r =>
      r[0] === game &&
      r[1] === platform &&
      r[3] === "barcode" &&
      /^\d{11,14}$/.test(String(r[4] || "")) &&
      r[5] !== "NON_UK_EXACT"
    )
    .sort((a, b) => (MARKET_RANK[b[5]] || 0) - (MARKET_RANK[a[5]] || 0));
  return rows[0] ? { value: String(rows[0][4]), market: String(rows[0][5] || "") } : null;
}

function createFixtureClient(targets) {
  const byId = new Map();
  const byUpc = new Map();
  const byQuery = new Map();

  targets.forEach((target, index) => {
    const expected = PAL_CONSOLES[target.platform];
    const id = `fixture-${String(index + 1).padStart(3, "0")}`;
    const barcode = bestBarcode(target.game, target.platform);
    const product = {
      status: "success",
      id,
      "product-name": target.game,
      "console-name": expected.name,
      upc: barcode?.value || "",
      "release-date": "2000-01-01",
      "loose-price": 3000 + index,
      "cib-price": 5000 + index,
      "new-price": 9000 + index,
      "box-only-price": 2000 + index,
      "manual-only-price": 1000 + index
    };
    byId.set(id, product);
    if (barcode?.value) byUpc.set(barcode.value, product);
    byQuery.set(`${target.game} ${expected.name}`, [{
      id,
      "product-name": target.game,
      "console-name": expected.name
    }]);
  });

  return {
    async searchProducts(query) {
      return byQuery.get(String(query || "")) || [];
    },
    async getProductById(id) {
      const product = byId.get(String(id));
      if (!product) throw Object.assign(new Error("Fixture product not found"), { code: "fixture_product_missing" });
      return product;
    },
    async getProductByUpc(upc) {
      const product = byUpc.get(String(upc));
      if (!product) throw Object.assign(new Error("Fixture UPC not found"), { code: "fixture_upc_missing" });
      return product;
    },
    async getOffers({ productId, consoleId }) {
      const product = byId.get(String(productId));
      if (!product) return [];
      const expectedConsole = Object.values(PAL_CONSOLES).find(row => row.id === String(consoleId));
      if (!expectedConsole || expectedConsole.name !== product["console-name"]) return [];
      return [{
        "condition-string": "Normal wear",
        "console-name": product["console-name"],
        id: product.id,
        "include-string": "Game, Box, and Manual",
        "is-available": true,
        "offer-id": "fixture-offer-" + product.id,
        "offer-status": "available",
        "offer-url": "/offer/fixture-offer-" + product.id,
        price: 4200,
        "product-name": product["product-name"],
        "start-time": "2026-10-01"
      }];
    }
  };
}

function compactProduct(product) {
  if (!product) return null;
  return {
    id: String(product.id || ""),
    productName: String(product["product-name"] || ""),
    consoleName: String(product["console-name"] || ""),
    upc: String(product.upc || ""),
    releaseDate: product["release-date"] || null,
    pricesUsd: {
      loose: referencePriceFromProduct(product, "loose")?.amount ?? null,
      cib: referencePriceFromProduct(product, "cib")?.amount ?? null,
      new: referencePriceFromProduct(product, "new")?.amount ?? null,
      boxOnly: referencePriceFromProduct(product, "box_only")?.amount ?? null,
      manualOnly: referencePriceFromProduct(product, "manual_only")?.amount ?? null
    }
  };
}

function countBy(rows, selector) {
  const out = {};
  for (const row of rows) {
    const key = String(selector(row) || "unknown");
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function stripEvaluatedRow(row) {
  return {
    source: row.source,
    externalId: row.externalId,
    canonicalUrl: row.canonicalUrl,
    title: row.title,
    currency: row.currency,
    itemPrice: row.itemPrice,
    total: row.total,
    deliveredGbp: row.deliveredGbp ?? null,
    sourceRegion: row.sourceRegion,
    identifiers: row.identifiers,
    classification: row.classification,
    match: row.match,
    provider: {
      productId: row.itemSpecifics?.priceChartingProductId || "",
      consoleName: row.itemSpecifics?.consoleName || "",
      includeString: row.itemSpecifics?.includeString || "",
      conditionString: row.itemSpecifics?.conditionString || ""
    }
  };
}

async function runPricing(target, client) {
  const barcode = bestBarcode(target.game, target.platform);
  let exactLookup = null;
  let exactLookupSafe = false;
  let exactLookupError = null;

  if (barcode) {
    try {
      exactLookup = await client.getProductByUpc(barcode.value);
      exactLookupSafe = productMatchesTarget(target, exactLookup);
    } catch (error) {
      exactLookupError = error.code || "request_failed";
    }
  }

  let rawDiscovery = [];
  let discovered = [];
  let discoveryError = null;
  try {
    const expected = PAL_CONSOLES[target.platform];
    rawDiscovery = await client.searchProducts(`${target.game} ${expected.name}`);
    const result = await findPriceChartingProductsForTarget(target, { client });
    discovered = result.products;
  } catch (error) {
    discoveryError = error.code || "request_failed";
  }

  const products = [];
  const ids = new Set();
  if (exactLookupSafe && exactLookup?.id) {
    ids.add(String(exactLookup.id));
    products.push(exactLookup);
  }
  for (const product of discovered) {
    const id = String(product.id || "");
    if (!id || ids.has(id)) continue;
    ids.add(id);
    products.push(product);
  }

  const expectedConsole = PAL_CONSOLES[target.platform]?.name || "";
  const rawPalCandidates = rawDiscovery.filter(product =>
    String(product?.["console-name"] || "").toLowerCase() === expectedConsole.toLowerCase()
  );

  let status = "NO_PROVIDER_MATCH";
  if (exactLookupSafe) status = "EXACT_IDENTIFIER_MATCH";
  else if (exactLookup && !exactLookupSafe) status = "IDENTIFIER_CONFLICT";
  else if (products.length) status = "PAL_TITLE_CANDIDATES";
  else if (rawPalCandidates.length) status = "PAL_CANDIDATES_REJECTED_BY_TITLE";
  else if (exactLookupError || discoveryError) status = "PROVIDER_ERROR";

  return {
    game: target.game,
    platform: target.platform,
    evidenceBarcode: barcode,
    status,
    exactLookupSafe,
    exactLookup: compactProduct(exactLookup),
    exactLookupError,
    discoveryError,
    rawCandidateCount: rawDiscovery.length,
    rawPalCandidateCount: rawPalCandidates.length,
    rawCandidates: rawDiscovery.map(product => ({
      id: String(product.id || ""),
      productName: String(product["product-name"] || ""),
      consoleName: String(product["console-name"] || "")
    })),
    candidateCount: products.length,
    candidates: products.map(compactProduct)
  };
}

async function runOffers(target, client) {
  const hunt = {
    game: target.game,
    platform: target.platform,
    compatibility: "UK_EU_PAL",
    releasePreference: "pal-compatible",
    editionPreference: "any",
    completeness: "any",
    condition: "any",
    englishRequired: false,
    excludeBundles: true,
    excludePromo: true,
    maxDeliveredGbp: null
  };

  const normalized = await searchPriceChartingMarketplace(hunt, { client });
  const palEvaluated = evaluateNormalizedCandidates(hunt, normalized);
  const ukEvaluated = evaluateNormalizedCandidates({ ...hunt, releasePreference: "uk-only" }, normalized);

  return {
    game: target.game,
    platform: target.platform,
    offerCount: normalized.length,
    palCompatible: countBy(palEvaluated, r => r.match?.state),
    ukExact: countBy(ukEvaluated, r => r.match?.state),
    exactIdentifierRows: palEvaluated.filter(r => r.classification?.identifier).length,
    classificationConfidence: countBy(palEvaluated, r => r.classification?.confidence),
    completeness: countBy(palEvaluated, r => r.classification?.completeness),
    rows: palEvaluated.map(stripEvaluatedRow)
  };
}

async function writeReport(outputPath, report) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8");
}

const mode = arg("mode", "pricing");
if (!new Set(["pricing", "offers"]).has(mode)) {
  console.error("Use --mode=pricing or --mode=offers");
  process.exit(2);
}

const fixture = ["1", "true", "yes"].includes(String(arg("fixture", "false")).toLowerCase());
const token = String(process.env.PRICECHARTING_TOKEN || "").trim();
if (!fixture && !token) {
  console.error("PRICECHARTING_TOKEN is required for real API runs. Use --fixture=true for offline harness validation.");
  process.exit(2);
}

const allTargets = launchTargets();
if (allTargets.length !== 100) {
  console.error(`Expected the pinned launch population to contain 100 game/platform pairs; found ${allTargets.length}. Review the benchmark population before continuing.`);
  process.exit(2);
}

const start = Math.max(0, Number(arg("start", "0")) || 0);
const limit = Math.max(1, Number(arg("limit", String(allTargets.length))) || allTargets.length);
const targets = allTargets.slice(start, start + limit);
const date = new Date().toISOString().slice(0, 10);
const outputPath = arg("out", `benchmarks/pricecharting-${mode}-${date}.json`);
const client = fixture ? createFixtureClient(allTargets) : createPriceChartingClient({ token });

const report = {
  schemaVersion: 1,
  provider: "PriceCharting",
  mode,
  fixture,
  networkAccess: !fixture,
  generatedAt: new Date().toISOString(),
  launchPopulation: allTargets.length,
  start,
  requestedCount: targets.length,
  apiTokenIncluded: false,
  results: []
};

for (let index = 0; index < targets.length; index++) {
  const target = targets[index];
  process.stdout.write(`[${index + 1}/${targets.length}] ${target.game} · ${target.platform}\n`);
  try {
    report.results.push(mode === "pricing" ? await runPricing(target, client) : await runOffers(target, client));
  } catch (error) {
    report.results.push({
      game: target.game,
      platform: target.platform,
      status: "PROVIDER_ERROR",
      error: error.code || "request_failed",
      message: String(error.message || error)
    });
  }
  report.completedAt = new Date().toISOString();
  await writeReport(outputPath, report);
}

if (mode === "pricing") {
  report.summary = {
    statuses: countBy(report.results, r => r.status),
    exactIdentifierMatches: report.results.filter(r => r.status === "EXACT_IDENTIFIER_MATCH").length,
    rowsWithAnyPalCandidate: report.results.filter(r => Number(r.candidateCount || 0) > 0).length,
    rowsWithCibPrice: report.results.filter(r => (r.candidates || []).some(p => p.pricesUsd?.cib != null)).length,
    rowsWithLoosePrice: report.results.filter(r => (r.candidates || []).some(p => p.pricesUsd?.loose != null)).length,
    rowsWithNewPrice: report.results.filter(r => (r.candidates || []).some(p => p.pricesUsd?.new != null)).length
  };
} else {
  report.summary = {
    titlesWithOffers: report.results.filter(r => Number(r.offerCount || 0) > 0).length,
    totalOffers: report.results.reduce((sum, r) => sum + Number(r.offerCount || 0), 0),
    totalExactIdentifierRows: report.results.reduce((sum, r) => sum + Number(r.exactIdentifierRows || 0), 0),
    palMatchStates: report.results.reduce((acc, r) => {
      for (const [state, count] of Object.entries(r.palCompatible || {})) acc[state] = (acc[state] || 0) + count;
      return acc;
    }, {}),
    ukExactStates: report.results.reduce((acc, r) => {
      for (const [state, count] of Object.entries(r.ukExact || {})) acc[state] = (acc[state] || 0) + count;
      return acc;
    }, {})
  };
}

report.platforms = countBy(report.results, row => row.platform);
report.completedAt = new Date().toISOString();

const serialized = JSON.stringify(report);
if (token && serialized.includes(token)) {
  throw new Error("Refusing to write benchmark report because it contains the PriceCharting API token.");
}
await writeReport(outputPath, report);
process.stdout.write(`Wrote ${outputPath}${fixture ? " (offline fixture mode)" : ""}\n`);
