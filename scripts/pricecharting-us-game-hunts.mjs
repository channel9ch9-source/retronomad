// Single-month PriceCharting experiment: availability for specific US collector targets.
// Never commits or prints raw offers, prices, UPCs, seller details or credentials.
// Product+title+console matching is a candidate only; exact US physical edition is UNVERIFIED.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createPriceChartingClient } from "../backend/pricecharting-provider.js";
import { INTERNATIONAL_CONSOLES, matchesInternationalTitle, sameConsole } from "./pricecharting-international-benchmark.mjs";

export const US_HUNT_TARGETS = Object.freeze([
  { platform: "PS1", game: "Silent Hill", segment: "familiar" },
  { platform: "PS1", game: "Resident Evil 2", segment: "familiar" },
  { platform: "PS1", game: "Final Fantasy VII", segment: "familiar" },
  { platform: "PS1", game: "Crash Bandicoot", segment: "familiar" },
  { platform: "PS1", game: "Tomba!", segment: "collector" },
  { platform: "PS1", game: "Suikoden II", segment: "collector" },
  { platform: "PS2", game: "Silent Hill 2", segment: "familiar" },
  { platform: "PS2", game: "Kingdom Hearts", segment: "familiar" },
  { platform: "PS2", game: "Grand Theft Auto San Andreas", segment: "familiar" },
  { platform: "PS2", game: "Devil May Cry", segment: "familiar" },
  { platform: "PS2", game: "Rule of Rose", segment: "collector" },
  { platform: "PS2", game: "Haunting Ground", segment: "collector" },
  { platform: "Dreamcast", game: "Shenmue", segment: "familiar" },
  { platform: "Dreamcast", game: "Sonic Adventure", segment: "familiar" },
  { platform: "Dreamcast", game: "Crazy Taxi", segment: "familiar" },
  { platform: "Dreamcast", game: "Jet Grind Radio", segment: "familiar" },
  { platform: "Dreamcast", game: "Illbleed", segment: "collector" },
  { platform: "Dreamcast", game: "Cannon Spike", segment: "collector" }
]);

function isAvailable(offer) {
  return String(offer?.["offer-status"] || "available") === "available" &&
    offer?.["is-available"] !== false && offer?.["is-ended"] !== true &&
    offer?.["is-sold"] !== true;
}

function hasPublicOfferUrl(offer) {
  const u = String(offer?.["offer-url"] || "").trim();
  if (!u) return false;
  try {
    const url = new URL(u, "https://www.pricecharting.com");
    return url.hostname === "www.pricecharting.com" &&
      /^\/offer\/[a-z0-9_-]+$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function classifyIncludes(offer) {
  const v = String(offer?.["include-string"] || "").toLowerCase();
  if (!v) return "unknown";
  if (/\b(box|case)\b/.test(v) && /\bmanual\b/.test(v) &&
      /\b(game|disc|item)\b/.test(v)) return "cib_wording";
  if (/game only|disc only|loose/i.test(v)) return "loose_wording";
  return "other_wording";
}

export async function probeUsHunts(client, targets = US_HUNT_TARGETS) {
  const out = [];
  for (const target of targets) {
    const consoleInfo = INTERNATIONAL_CONSOLES.US[target.platform];
    if (!consoleInfo) throw new Error("Unknown US platform");
    console.log("Checking US availability: " + target.game + " — " + target.platform);
    try {
      const discovered = await client.searchProducts(target.game + " " + consoleInfo.name);
      const consoleResults = discovered.filter(x => sameConsole(consoleInfo, x));
      const titleResults = consoleResults.filter(x =>
        matchesInternationalTitle(target.game, x["product-name"]));
      const identified = [];
      for (const candidate of titleResults.slice(0, 4)) {
        const product = await client.getProductById(candidate.id);
        if (sameConsole(consoleInfo, product) &&
            matchesInternationalTitle(target.game, product["product-name"])) {
          identified.push(product);
        }
      }

      // Deliberately cap the number of product variants sampled. Do not call this exhaustive.
      const offers = new Map();
      let responseRows = 0;
      let wrongConsoleOrTitle = 0;
      let noPublicUrl = 0;
      let variantProductsWithOffers = 0;
      for (const product of identified) {
        const providerOffers = await client.getOffers({
          productId: product.id, consoleId: consoleInfo.id
        });
        responseRows += providerOffers.length;
        let countedForVariant = 0;
        for (const offer of providerOffers) {
          if (!isAvailable(offer)) continue;
          if (!sameConsole(consoleInfo, offer) ||
              !matchesInternationalTitle(target.game, offer["product-name"] || product["product-name"])) {
            wrongConsoleOrTitle++;
            continue;
          }
          if (!hasPublicOfferUrl(offer)) {
            noPublicUrl++;
            continue;
          }
          const id = String(offer["offer-id"] || "").trim();
          if (!id) continue;
          if (!offers.has(id)) {
            offers.set(id, classifyIncludes(offer));
            countedForVariant++;
          }
        }
        if (countedForVariant) variantProductsWithOffers++;
      }
      const classifications = [...offers.values()];
      out.push({
        ...target,
        status: identified.length ? "TITLE_AND_CONSOLE_CANDIDATE" :
          consoleResults.length ? "REGION_RESULTS_TITLE_MISMATCH" : "NO_REGION_CANDIDATE",
        regionalSearchCandidates: consoleResults.length,
        strictTitleCandidates: titleResults.length,
        checkedProductVariants: identified.length,
        variantsWithOffers: variantProductsWithOffers,
        candidateOfferRowsReturned: responseRows,
        availableOffersWithUrls: offers.size,
        cibWordingOffers: classifications.filter(x => x === "cib_wording").length,
        looseWordingOffers: classifications.filter(x => x === "loose_wording").length,
        unknownOrOtherCompletenessOffers: classifications.filter(x =>
          x !== "cib_wording" && x !== "loose_wording").length,
        excludedTitleOrConsoleRows: wrongConsoleOrTitle,
        excludedMissingUrlRows: noPublicUrl,
        exactPhysicalEditionVerified: false,
        shippingEligibilityVerified: false
      });
    } catch (error) {
      out.push({
        ...target,
        status: "PROVIDER_ERROR",
        error: String(error.code || "request_failed"),
        exactPhysicalEditionVerified: false,
        shippingEligibilityVerified: false
      });
    }
  }

  const summary = {
    testedGames: out.length,
    gamesWithTitleCandidates: out.filter(x => x.checkedProductVariants > 0).length,
    gamesWithAvailableOffers: out.filter(x => x.availableOffersWithUrls > 0).length,
    totalAvailableOffersWithUrls: out.reduce((n,x) => n+(x.availableOffersWithUrls || 0),0),
    gamesWithCibWordingOffers: out.filter(x => x.cibWordingOffers > 0).length,
    gamesWithProviderErrors: out.filter(x => x.status === "PROVIDER_ERROR").length,
    familiarGamesWithOffers: out.filter(x => x.segment === "familiar" && x.availableOffersWithUrls > 0).length,
    collectorGamesWithOffers: out.filter(x => x.segment === "collector" && x.availableOffersWithUrls > 0).length
  };
  return {
    schemaVersion: 1,
    source: "PriceCharting",
    mode: "US_PRODUCT_SPECIFIC_OFFERS",
    fixture: false,
    generatedAt: new Date().toISOString(),
    scope: "18 nonrepresentative US collector target titles, up to 4 exact-title product variants each",
    caveat: "Offer counts cover only accessible provider responses at a point in time; no exact physical releases, completeness, condition, UK shipping or eligibility independently verified. Item descriptions and prices are not recorded. Do not use as public listing feed.",
    summary,
    games: out
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const token = String(process.env.PRICECHARTING_TOKEN || "").trim();
  if (!token) {
    console.error("Private PRICECHARTING_TOKEN is required.");
    process.exitCode = 2;
  } else {
    try {
      const report = await probeUsHunts(createPriceChartingClient({ token }));
      const json = JSON.stringify(report, null, 2) + "\n";
      if (json.includes(token)) throw new Error("Refusing to write token-bearing output");
      const option = process.argv.find(s => s.startsWith("--out="));
      const dest = option ? option.slice(6) : "benchmarks/pricecharting-us-game-offers.json";
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, json, "utf8");
      console.log("Wrote aggregate-only report to " + dest);
      if (report.summary.gamesWithProviderErrors) {
        console.error(report.summary.gamesWithProviderErrors + " provider errors; see report");
        process.exitCode = 1;
      }
    } catch (error) {
      console.error("US game-specific benchmark failed: " + String(error.code || "request_failed"));
      process.exitCode = 1;
    }
  }
}
