// Read-only, small-sample US/Japan PriceCharting benchmark.
// Deliberately independent from the PALScout-specific matching logic.
// Never stores individual provider prices, offer IDs or the private API token.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createPriceChartingClient } from "../backend/pricecharting-provider.js";

export const INTERNATIONAL_CONSOLES = Object.freeze({
  US: Object.freeze({
    PS1: Object.freeze({ id: "G6", name: "Playstation" }),
    PS2: Object.freeze({ id: "G7", name: "Playstation 2" }),
    Dreamcast: Object.freeze({ id: "G16", name: "Sega Dreamcast" })
  }),
  JP: Object.freeze({
    PS1: Object.freeze({ id: "G107", name: "JP Playstation" }),
    PS2: Object.freeze({ id: "G108", name: "JP Playstation 2" }),
    Dreamcast: Object.freeze({ id: "G64", name: "JP Sega Dreamcast" })
  })
});

// Purposive, not statistically representative: 4 recognizable collector titles
// per platform/region, including common releases and edition-sensitive games.
// Japanese titles use PriceCharting's English/romanized naming where known.
export const INTERNATIONAL_TARGETS = Object.freeze([
  { region: "US", platform: "PS1", game: "Silent Hill" },
  { region: "US", platform: "PS1", game: "Resident Evil 2" },
  { region: "US", platform: "PS1", game: "Final Fantasy VII" },
  { region: "US", platform: "PS1", game: "Crash Bandicoot" },
  { region: "US", platform: "PS2", game: "Silent Hill 2" },
  { region: "US", platform: "PS2", game: "Kingdom Hearts" },
  { region: "US", platform: "PS2", game: "Grand Theft Auto San Andreas" },
  { region: "US", platform: "PS2", game: "Devil May Cry" },
  { region: "US", platform: "Dreamcast", game: "Shenmue" },
  { region: "US", platform: "Dreamcast", game: "Sonic Adventure" },
  { region: "US", platform: "Dreamcast", game: "Crazy Taxi" },
  { region: "US", platform: "Dreamcast", game: "Jet Grind Radio" },
  { region: "JP", platform: "PS1", game: "Silent Hill" },
  { region: "JP", platform: "PS1", game: "Biohazard" },
  { region: "JP", platform: "PS1", game: "Final Fantasy VII" },
  { region: "JP", platform: "PS1", game: "Pepsiman" },
  { region: "JP", platform: "PS2", game: "Silent Hill 2" },
  { region: "JP", platform: "PS2", game: "Kingdom Hearts" },
  { region: "JP", platform: "PS2", game: "Final Fantasy X" },
  { region: "JP", platform: "PS2", game: "Okami" },
  { region: "JP", platform: "Dreamcast", game: "Shenmue" },
  { region: "JP", platform: "Dreamcast", game: "Sonic Adventure" },
  { region: "JP", platform: "Dreamcast", game: "Crazy Taxi" },
  { region: "JP", platform: "Dreamcast", game: "Biohazard Code Veronica" }
]);

function normalized(value) {
  return String(value || "").toLowerCase().replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function stemTitle(value) {
  return String(value || "").replace(/\s*[\[(][^\])]+[\])]\s*$/g, "").trim();
}

export function matchesInternationalTitle(game, providerName) {
  return normalized(game) === normalized(stemTitle(providerName));
}

export function sameConsole(expected, candidate) {
  return String(candidate?.["console-name"] || "").toLowerCase() === expected.name.toLowerCase();
}

function validPrice(product, field) {
  return Number.isFinite(Number(product?.[field])) && Number(product[field]) > 0;
}

function count(rows, key) {
  return rows.filter(row => row[key]).length;
}

async function priceTarget(client, target) {
  const consoleInfo = INTERNATIONAL_CONSOLES[target.region]?.[target.platform];
  if (!consoleInfo) throw new Error("Unmapped region/platform in international benchmark.");

  try {
    const rows = await client.searchProducts(target.game + " " + consoleInfo.name);
    const regional = rows.filter(row => sameConsole(consoleInfo, row));
    const title = regional.filter(row => matchesInternationalTitle(target.game, row["product-name"]));
    const confirmedTitles = [];
    for (const row of title.slice(0, 3)) {
      const detail = await client.getProductById(row.id);
      if (sameConsole(consoleInfo, detail) &&
          matchesInternationalTitle(target.game, detail["product-name"])) confirmedTitles.push(detail);
    }
    const cibs = confirmedTitles.filter(row => validPrice(row, "cib-price"));
    return {
      ...target,
      status: confirmedTitles.length ? "TITLE_AND_CONSOLE_CANDIDATE" :
        regional.length ? "REGION_RESULTS_TITLE_MISMATCH" : "NO_REGION_CANDIDATE",
      searchResultsReturned: rows.length,
      regionConsoleResults: regional.length,
      exactTitleCandidates: confirmedTitles.length,
      candidatesWithCibValue: cibs.length,
      candidatesWithLooseValue: confirmedTitles.filter(row => validPrice(row, "loose-price")).length,
      candidatesWithNewValue: confirmedTitles.filter(row => validPrice(row, "new-price")).length,
      candidatesWithProductBarcode: confirmedTitles.filter(row => /\d{11,14}/.test(String(row.upc || ""))).length,
      exactReleaseVerified: false
    };
  } catch (error) {
    return {
      ...target,
      status: "PROVIDER_ERROR",
      error: String(error.code || "request_failed"),
      exactReleaseVerified: false
    };
  }
}

async function offersConsole(client, region, platform, consoleInfo) {
  try {
    const offers = await client.getOffers({ consoleId: consoleInfo.id });
    const available = offers.filter(row =>
      row["offer-status"] === "available" && row["is-available"] !== false
    );
    const matching = available.filter(row => sameConsole(consoleInfo, row));
    return {
      region, platform, consoleId: consoleInfo.id,
      rowsReturned: offers.length,
      availableCorrectConsole: matching.length,
      uniqueProducts: new Set(matching.map(row => String(row.id || "")).filter(Boolean)).size,
      exactReleaseVerified: false,
      buyerShippingEligibilityVerified: false
    };
  } catch (error) {
    return {
      region, platform, consoleId: consoleInfo.id,
      status: "PROVIDER_ERROR",
      error: String(error.code || "request_failed")
    };
  }
}

export async function runInternationalBenchmark(client, targets = INTERNATIONAL_TARGETS) {
  const pricing = [];
  for (const target of targets) {
    console.log("Checking pricing: " + target.region + " " + target.platform + " " + target.game);
    pricing.push(await priceTarget(client, target));
  }
  const marketplace = [];
  for (const [region, platforms] of Object.entries(INTERNATIONAL_CONSOLES)) {
    for (const [platform, consoleInfo] of Object.entries(platforms)) {
      console.log("Counting available offers: " + region + " " + platform);
      marketplace.push(await offersConsole(client, region, platform, consoleInfo));
    }
  }
  const regionalSummaries = {};
  for (const region of ["US", "JP"]) {
    const items = pricing.filter(row => row.region === region);
    const offers = marketplace.filter(row => row.region === region);
    regionalSummaries[region] = {
      targets: items.length,
      titlesWithCandidates: items.filter(row => row.exactTitleCandidates > 0).length,
      titlesWithCibValues: items.filter(row => row.candidatesWithCibValue > 0).length,
      titlesWithLooseValues: items.filter(row => row.candidatesWithLooseValue > 0).length,
      titlesWithNewValues: items.filter(row => row.candidatesWithNewValue > 0).length,
      providerErrors: items.filter(row => row.status === "PROVIDER_ERROR").length +
        offers.filter(row => row.status === "PROVIDER_ERROR").length,
      availableMarketplaceOffersReturned: offers.reduce((total, row) => total + (row.availableCorrectConsole || 0), 0)
    };
  }
  return {
    schemaVersion: 1,
    provider: "PriceCharting",
    fixture: false,
    scope: "Small purposive US/Japan pricing sample and console-wide available-offer counts",
    generatedAt: new Date().toISOString(),
    sampleSize: targets.length,
    note: "Title+console candidates are NOT verified exact physical releases. No independent US/JP barcode catalogue yet. No price values, individual offers, seller data or private tokens are retained. Marketplace counts are API-returned only: pagination/truncation and buyer shipping eligibility are unverified.",
    pricing,
    marketplace,
    regions: regionalSummaries,
    errors: pricing.filter(row => row.status === "PROVIDER_ERROR").length +
      marketplace.filter(row => row.status === "PROVIDER_ERROR").length
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const token = String(process.env.PRICECHARTING_TOKEN || "").trim();
  if (!token) {
    console.error("PRICECHARTING_TOKEN repository secret is missing.");
    process.exitCode = 2;
  } else {
    try {
      const report = await runInternationalBenchmark(createPriceChartingClient({ token }));
      const serialized = JSON.stringify(report, null, 2) + "\n";
      if (serialized.includes(token)) throw new Error("Token found in report; refused.");
      const arg = process.argv.find(value => value.startsWith("--out="));
      const destination = arg ? arg.slice("--out=".length) : "benchmarks/pricecharting-international-small.json";
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, serialized, "utf8");
      console.log("Wrote aggregate-only US/Japan benchmark report to " + destination);
      if (report.errors) {
        console.error("Benchmark encountered " + report.errors + " provider errors; review artifact.");
        process.exitCode = 1;
      }
    } catch(error) {
      console.error("International PriceCharting benchmark failed: " + (error.code || "request_failed"));
      process.exitCode = 1;
    }
  }
}
