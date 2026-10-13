// Small US PriceCharting Marketplace result-cap diagnostic.
// Compares two DOCUMENTED sort orders. Does not expose any offer IDs,
// individual listing data, seller information, or price values.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createPriceChartingClient } from "../backend/pricecharting-provider.js";
import { INTERNATIONAL_CONSOLES } from "./pricecharting-international-benchmark.mjs";

function availableIds(offers, expected) {
  if (!Array.isArray(offers)) throw new Error("Invalid provider offers response");
  return new Set(offers.filter(row =>
    row["offer-status"] === "available" &&
    row["is-available"] !== false &&
    String(row["console-name"] || "").toLowerCase() === expected.name.toLowerCase()
  ).map(row => String(row["offer-id"] || "")).filter(Boolean));
}

export async function runUsMarketplaceSortComparison(client) {
  const result=[];
  for (const [platform, consoleInfo] of Object.entries(INTERNATIONAL_CONSOLES.US)) {
    const lowest = await client.getOffers({ consoleId:consoleInfo.id, sort:"lowest-price" });
    const recent = await client.getOffers({ consoleId:consoleInfo.id, sort:"starts" });
    const first=availableIds(lowest,consoleInfo), second=availableIds(recent,consoleInfo);
    const extra=[...second].filter(id=>!first.has(id)).length;
    result.push({
      platform,
      lowestPriceRowsReturned:lowest.length,
      recentRowsReturned:recent.length,
      lowestPriceAvailable: first.size,
      recentAvailable: second.size,
      differentOffersInRecentSort: extra,
      uniqueAcrossBoth: new Set([...first,...second]).size,
      moreOffersThanSingleResponseProven: new Set([...first,...second]).size > Math.max(lowest.length,recent.length),
      incompleteOfferIdsDetected:lowest.length > first.size || recent.length > second.size
    });
  }
  return {
    schemaVersion:1,
    scope:"US PS1/PS2/Dreamcast available offers; compare two supported sort orders",
    method:"status=available, console=<official ID>, sort=lowest-price versus sort=starts",
    caution:"A union larger than one response demonstrates a partial result window, not exhaustive site inventory or documented pagination. Without a larger union, API completeness remains unknown.",
    generatedAt:new Date().toISOString(),
    results:result,
    numberOfQueries:result.length*2,
    consolesWithDemonstratedPartialWindow:result.filter(x=>x.moreOffersThanSingleResponseProven).length
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const token=String(process.env.PRICECHARTING_TOKEN||"").trim();
  if(!token) {
    console.error("Missing private PRICECHARTING_TOKEN");
    process.exitCode=2;
  } else {
    try {
      const report=await runUsMarketplaceSortComparison(createPriceChartingClient({token}));
      const json=JSON.stringify(report,null,2)+"\n";
      if(json.includes(token)) throw new Error("Refusing token-bearing report");
      const arg=process.argv.find(x=>x.startsWith("--out="));
      const dest=arg?arg.slice(6):"benchmarks/pricecharting-us-sort-window.json";
      await fs.mkdir(path.dirname(dest),{recursive:true});
      await fs.writeFile(dest,json,"utf8");
      console.log("Wrote aggregate US result-window comparison to "+dest);
    } catch(error) {
      console.error("US marketplace sort-window check failed: "+String(error.code||"request_failed"));
      process.exitCode=1;
    }
  }
}
