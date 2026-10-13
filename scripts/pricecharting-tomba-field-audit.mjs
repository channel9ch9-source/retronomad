// Read-only audit: which PriceCharting API fields exist for an available Tomba! US PS1 offer?
// No raw responses, image URLs, seller data, price values, offer IDs or buyer information
// are logged, written to disk, or committed to the repository.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createPriceChartingClient } from "../backend/pricecharting-provider.js";
import { INTERNATIONAL_CONSOLES, matchesInternationalTitle, sameConsole } from "./pricecharting-international-benchmark.mjs";

const GAME = "Tomba!";
const CONSOLE = INTERNATIONAL_CONSOLES.US.PS1;
function filled(v) { return typeof v === "string" ? v.trim().length > 0 : v !== null && v !== undefined; }
function photoFieldStats(row) {
  const keys = Object.keys(row || {});
  const listKeys = ["images", "photos", "image-urls", "image_urls", "photo-urls", "photo_urls"];
  return {
    explicitPhotoFields: keys.filter(k => /^photo[1-9][0-9]*$|^image[1-9][0-9]*$/i.test(k) && filled(row[k])).length,
    photoArrayEntries: listKeys.reduce((sum, k) => sum + (Array.isArray(row[k]) ? row[k].length : 0), 0)
  };
}
export function fieldPresence(row = {}, detail = false) {
  const photos = photoFieldStats(row);
  return {
    publicOfferUrl: filled(row["offer-url"]),
    primaryImageUrl: filled(row["image-url"]),
    hasPicturesFlag: typeof row["has-pictures"] === "boolean",
    picturesFlagTrue: row["has-pictures"] === true,
    separatePhotoFieldCount: photos.explicitPhotoFields,
    photoArrayEntries: photos.photoArrayEntries,
    sellerId: filled(row["seller-id"]),
    sellerName: filled(row["seller-name"]),
    sellerFeedbackScore: filled(row["seller-feedback"]) || filled(row["seller-rating"]),
    sellerDescription: filled(row.description) || filled(row["offer-description"]) || filled(row["seller-description"]),
    claimedCompleteness: filled(row["include-string"]) || filled(row.includes),
    conditionText: filled(row["condition-string"]) || filled(row.condition),
    priceField: filled(row.price),
    shippingCharge: filled(row["shipping-price"]) || filled(row["shipping-cost"]) || filled(row.postage),
    destinationEligibility: filled(row["ships-to"]) || filled(row["shipping-countries"]) || filled(row["shipping-destinations"]),
    sellerPhotoGalleryAccessible: photos.explicitPhotoFields + photos.photoArrayEntries >= 3,
    offerDetailsResponse: Boolean(detail)
  };
}

function listingSafe(offer) {
  return String(offer?.["offer-status"] || "") === "available" &&
    offer?.["is-available"] !== false && offer?.["is-sold"] !== true &&
    offer?.["is-ended"] !== true && filled(offer?.["offer-id"]) &&
    matchesInternationalTitle(GAME, offer["product-name"] || GAME) &&
    sameConsole(CONSOLE, offer);
}

export async function auditTombaApiFields(client) {
  const search = await client.searchProducts(GAME + " " + CONSOLE.name);
  const candidates = search.filter(x =>
    sameConsole(CONSOLE, x) && matchesInternationalTitle(GAME, x["product-name"]));
  const result = {
    schemaVersion: 1,
    scope: "US PS1 Tomba! available-offer API field-presence audit",
    generatedAt: new Date().toISOString(),
    searchedProductCandidates: candidates.length,
    checkedProductVariants: 0,
    availableCandidateOffers: 0,
    matchedAvailableOffersWithId: 0,
    sampledOneAvailableOffer: false,
    endpointDetailsRequestAttempted: false,
    detailEndpointStatus: "NOT_ATTEMPTED",
    offersApi: null,
    offerDetailsApi: null,
    overall: {
      exactUSReleaseFromApiVerified: false,
      originalManualFromApiVerified: false,
      discPlayingSurfaceFromApiVerified: false,
      allWebsitePhotosAccessibleFromApi: false,
      shippingDestinationVerified: false
    },
    caveat: "Only API field presence for ONE currently available offer. No values, prices, IDs, URLs, photos or personally identifiable buyer/seller data retained. Not a definitive snapshot of the website offer previously photographed. Nonempty presence does not verify seller claims or all images."
  };
  for (const item of candidates.slice(0, 4)) {
    const product = await client.getProductById(item.id);
    if (!sameConsole(CONSOLE, product) ||
        !matchesInternationalTitle(GAME, product["product-name"])) continue;
    result.checkedProductVariants++;
    const offers = await client.getOffers({productId:product.id,consoleId:CONSOLE.id});
    const eligible = offers.filter(listingSafe);
    result.availableCandidateOffers += offers.filter(offer =>
      String(offer["offer-status"] || "") === "available").length;
    result.matchedAvailableOffersWithId += eligible.length;
    if (!eligible.length || result.sampledOneAvailableOffer) continue;

    const offer = eligible[0];
    result.sampledOneAvailableOffer = true;
    result.offersApi = fieldPresence(offer);
    result.endpointDetailsRequestAttempted = true;
    try {
      const details = await client.getAvailableOfferDetails(offer["offer-id"]);
      result.detailEndpointStatus = "SUCCESS";
      result.offerDetailsApi = fieldPresence(details, true);
      // Never serialize the response or keys that may include buyers' addresses.
    } catch(error) {
      result.detailEndpointStatus = String(error?.code || "REQUEST_FAILED");
      result.offerDetailsApi = null;
    }
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const token = String(process.env.PRICECHARTING_TOKEN || "").trim();
  if (!token) {
    console.error("Private PRICECHARTING_TOKEN GitHub Actions secret required.");
    process.exitCode = 2;
  } else {
    try {
      const audit = await auditTombaApiFields(createPriceChartingClient({token}));
      const output = JSON.stringify(audit, null, 2) + "\n";
      if (output.includes(token)) throw new Error("Token leakage guard triggered.");
      const outputArg = process.argv.find(x => x.startsWith("--out="));
      const destination = outputArg ? outputArg.slice(6) : "benchmarks/pricecharting-tomba-fields.json";
      await fs.mkdir(path.dirname(destination), {recursive:true});
      await fs.writeFile(destination, output, "utf8");
      console.log("Wrote field-presence-only Tomba! API audit to "+destination);
      if (!audit.sampledOneAvailableOffer) console.log("No matching currently available offer was sampled; no details endpoint called.");
      else console.log("One available offer inspected; individual offer details not logged.");
    } catch(error) {
      console.error("Tomba! field audit failed: " + String(error?.code || "REQUEST_FAILED"));
      process.exitCode = 1;
    }
  }
}
