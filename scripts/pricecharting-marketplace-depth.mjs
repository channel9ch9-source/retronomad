// Diagnostic only: count available PriceCharting Marketplace offers by PAL console.
// Does not save or print offer IDs, individual listings, seller data or prices.
import fs from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { PAL_CONSOLES, createPriceChartingClient } from "../backend/pricecharting-provider.js";

export async function probePalMarketplace(client) {
  const results = [];
  for (const [platform, consoleInfo] of Object.entries(PAL_CONSOLES)) {
    const offers = await client.getOffers({ consoleId: consoleInfo.id });
    if (!Array.isArray(offers)) throw new Error("Marketplace offers response must be an array.");
    const available = offers.filter(row =>
      row["offer-status"] === "available" &&
      row["is-available"] !== false
    );
    const matchingConsole = available.filter(row =>
      String(row["console-name"] || "").toLowerCase() === consoleInfo.name.toLowerCase()
    );
    results.push({
      platform,
      consoleName: consoleInfo.name,
      apiRowsReturned: offers.length,
      availableOffers: available.length,
      availableForExpectedConsole: matchingConsole.length,
      distinctProductsWithAvailableOffers: new Set(
        matchingConsole.map(row => String(row.id || "")).filter(Boolean)
      ).size
    });
  }
  return {
    schemaVersion: 1,
    provider: "PriceCharting",
    scope: "Available Marketplace offers grouped by PAL console, not the pinned 100-game sample",
    caveat: "Counts reflect offers returned by the API query at one instant. API truncation/pagination is not established by this diagnostic. They are not verified UK-shippable listings.",
    generatedAt: new Date().toISOString(),
    apiQueries: results.length,
    platforms: results,
    totalAvailableForExpectedConsoles: results.reduce((sum,row)=>sum+row.availableForExpectedConsole,0)
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const token = String(process.env.PRICECHARTING_TOKEN || "").trim();
  if (!token) {
    console.error("Private PRICECHARTING_TOKEN GitHub secret is required.");
    process.exitCode = 2;
  } else {
    try {
      const client = createPriceChartingClient({ token });
      const report = await probePalMarketplace(client);
      const json = JSON.stringify(report, null, 2) + "\n";
      if (json.includes(token)) throw new Error("Refusing to write token-bearing output.");
      const arg = process.argv.find(value => value.startsWith("--out="));
      if (arg) {
        const out = arg.slice(6);
        await fs.mkdir((await import("node:path")).default.dirname(out), { recursive: true });
        await fs.writeFile(out, json, "utf8");
        console.log("Wrote aggregate PAL Marketplace depth report to " + out);
      } else console.log(json);
    } catch (error) {
      // The provider adapter emits errors without request URLs or token values.
      console.error("PAL Marketplace depth check failed: " + (error.code || "request_failed"));
      process.exitCode = 1;
    }
  }
}
