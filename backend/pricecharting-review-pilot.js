// Private, server-side US PriceCharting listing pilot.
// This module is deliberately NOT wired into the Cloudflare Worker or public pages.
// PriceCharting offer metadata is evidence, not proof of physical release, CIB, or shipping.
import {
  createPriceChartingClient,
  normalizePriceChartingOffer,
  priceChartingAttributionUrl
} from "./pricecharting-provider.js";

export const US_PRICECHARTING_CONSOLES = Object.freeze({
  PS1: Object.freeze({id:"G6",name:"Playstation"}),
  PS2: Object.freeze({id:"G7",name:"Playstation 2"}),
  Dreamcast: Object.freeze({id:"G16",name:"Sega Dreamcast"})
});

function norm(x) {
  return String(x||"").toLowerCase().replace(/[’']/g,"")
    .replace(/[^a-z0-9]+/g," ").trim();
}
function trimVariant(s) {
  return String(s||"").replace(/\s*[\[(][^\])]+[\])]\s*$/g,"").trim();
}
function matchesTitle(a,b) {return norm(a) === norm(trimVariant(b));}

// The main GrailRaven catalogue is region-neutral / EU-informed. Its canonical
// title is not necessarily what a US marketplace uses (e.g. Tombi! vs Tomba!).
// Add deliberate, edition-safe regional aliases here, never a blind global
// substitution for games with similar titles.
const US_MARKETPLACE_GAME_TITLES = Object.freeze({
  PS1:Object.freeze({
    tombi:"Tomba!"
  })
});
export function usMarketplaceGameTitle(title,platform) {
  const raw=String(title||"").trim();
  return US_MARKETPLACE_GAME_TITLES[platform]?.[norm(raw)] || raw;
}
function matchesConsole(value,expected) {
  return String(value||"").toLowerCase() === expected.name.toLowerCase();
}
function isAvailable(offer) {
  return String(offer?.["offer-status"]||"available") === "available" &&
    offer?.["is-available"] !== false &&
    offer?.["is-sold"] !== true && offer?.["is-ended"] !== true;
}
function safeOfferUrl(value) {
  try {
    const url = new URL(String(value||""), "https://www.pricecharting.com");
    return url.protocol === "https:" && url.hostname === "www.pricecharting.com" &&
      /^\/offer\/[a-z0-9_-]+\/?$/i.test(url.pathname) && !url.search && !url.hash ?
        url.toString() : "";
  } catch {return "";}
}
function safeImageUrl(value) {
  try {
    const url = new URL(String(value||""), "https://www.pricecharting.com");
    // A restricted set of official/commonly used PriceCharting asset hosts.
    // Unknown hosts are omitted; no user-controlled hotlink or script URLs.
    if (url.protocol !== "https:") return "";
    if (!["www.pricecharting.com","pricecharting.com","cdn.pricecharting.com",
      "storage.googleapis.com"].includes(url.hostname)) return "";
    return url.toString();
  } catch {return "";}
}
function readSellerClaim(offer) {
  return String(offer?.["include-string"] || "").trim();
}
function safePlainText(s,max=400) {
  return String(s||"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max);
}
function candidateFromOffer(target,offer,product,consoleInfo) {
  if (!isAvailable(offer) ||
      !matchesConsole(offer["console-name"]||product["console-name"],consoleInfo) ||
      !matchesTitle(target.game,offer["product-name"]||product["product-name"])) return null;
  const normalized = normalizePriceChartingOffer(offer,product,consoleInfo);
  const canonicalUrl=safeOfferUrl(normalized.canonicalUrl);
  const price=Number(normalized.itemPrice);
  if (!canonicalUrl || !String(normalized.externalId).trim() ||
      !Number.isFinite(price) || price<0) return null;
  const claim=readSellerClaim(offer);
  const reasons=[
    "US region is based on the PriceCharting console category; the physical disc and cover have not been independently verified.",
    "The exact edition and release identifiers have not been verified from seller photographs.",
    claim ? "The seller's stated contents have not been independently verified." :
      "The included disc, case and manual are not confirmed.",
    "The condition and disc playing surface have not been independently verified.",
    "Buyer-specific shipping eligibility and delivered total are unknown."
  ];
  return {
    source:"pricecharting",
    externalId:String(normalized.externalId),
    canonicalUrl,
    title:safePlainText(offer["product-name"]||product["product-name"]||target.game,150),
    platform:target.platform,
    market:"US (provider console category)",
    imageUrl:safeImageUrl(normalized.imageUrl),
    currency:"USD",
    itemPrice:price,
    postage:null,
    total:null,
    deliveredGbp:null,
    completenessClaim:safePlainText(claim,160),
    conditionClaim:safePlainText(offer["condition-string"],160),
    description:safePlainText(offer.description,400),
    attribution:{
      label:"Marketplace offer via PriceCharting",
      url:priceChartingAttributionUrl(product.id)
    },
    match:{
      state:"REVIEW",
      reasons,
      evidence:{
        gameAndConsoleTitleCandidate:true,
        exactUsReleaseVerified:false,
        exactEditionVerified:false,
        cibVerified:false,
        conditionVerified:false,
        deliveryVerified:false
      }
    }
  };
}

export async function searchUsPriceChartingReview(target, options={}) {
  const platform=String(target?.platform||"");
  const game=usMarketplaceGameTitle(target?.game,platform);
  if (!game || game.length>160 || !US_PRICECHARTING_CONSOLES[platform]) {
    throw Object.assign(new Error("Provide a game title and US PS1, PS2, or Dreamcast platform."),{code:"invalid_target"});
  }
  const consoleInfo=US_PRICECHARTING_CONSOLES[platform];
  const client=options.client || createPriceChartingClient({token:options.token});
  const maxProducts=Math.max(1,Math.min(4,Number(options.maxProducts)||4));
  const search=await client.searchProducts(game+" "+consoleInfo.name);
  const products=search.filter(row=>matchesConsole(row["console-name"],consoleInfo) &&
    matchesTitle(game,row["product-name"])).slice(0,maxProducts);
  const results=[];
  const seen=new Set();
  for(const candidate of products){
    const product=await client.getProductById(candidate.id);
    if(!matchesConsole(product["console-name"],consoleInfo) ||
       !matchesTitle(game,product["product-name"]))continue;
    const offers=await client.getOffers({productId:product.id,consoleId:consoleInfo.id});
    for(const offer of offers){
      const row=candidateFromOffer({game,platform},offer,product,consoleInfo);
      if(!row || seen.has(row.externalId))continue;
      seen.add(row.externalId);
      results.push(row);
    }
  }
  return {
    mode:"PRIVATE_REVIEW_ONLY",
    target:{game,platform,region:"US"},
    candidateProductVariants:products.length,
    rows:results,
    notice:"Candidates are not verified exact physical editions. Check original PriceCharting photos and shipping before buying."
  };
}

function escapeHtml(v) {
  return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}
export function renderPrivateReviewHtml(result) {
  const rows=Array.isArray(result?.rows)?result.rows:[];
  const cards=rows.map(row=>{
    const href=safeOfferUrl(row.canonicalUrl);
    if(!href || row.match?.state!=="REVIEW")return "";
    const image=safeImageUrl(row.imageUrl);
    const price=Number.isFinite(row.itemPrice)?Number(row.itemPrice).toFixed(2):"unavailable";
    const reasons=(row.match.reasons||[]).map(reason=>`<li>${escapeHtml(reason)}</li>`).join("");
    return `<article class="card">
      <div class="thumb">${image?`<img src="${escapeHtml(image)}" alt="Seller listing thumbnail">`:"No seller thumbnail"}</div>
      <section><div class="status">REVIEW — edition and completeness unverified</div>
      <h2>${escapeHtml(row.title)}</h2>
      <p>${escapeHtml(row.market)} · ${escapeHtml(row.platform)} · Seller-stated ${escapeHtml(row.completenessClaim||"contents unknown")}</p>
      <p>Condition (seller): ${escapeHtml(row.conditionClaim||"Unknown")}</p>
      <p>${escapeHtml(row.description||"No additional listing description supplied.")}</p>
      <ul>${reasons}</ul>
      <p><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Inspect original offer and photos</a></p>
      <p class="credit"><a href="${escapeHtml(row.attribution.url)}" target="_blank" rel="noopener noreferrer">Via PriceCharting</a></p>
      </section>
      <aside><strong>USD ${escapeHtml(price)}</strong><p>Item price only</p><p>Postage and delivered total unknown</p></aside>
    </article>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>GrailRaven — private US PriceCharting review preview</title>
  <style>
   body{font:15px/1.55 system-ui,sans-serif;background:#111923;color:#e6edf3;max-width:1100px;margin:28px auto;padding:0 20px}
   h1{font-size:26px}.notice{color:#f1c983}.card{display:grid;grid-template-columns:145px 1fr 170px;gap:22px;border:1px solid #405066;border-radius:12px;margin:22px 0;padding:18px}
   .thumb{display:flex;align-items:flex-start;justify-content:center;color:#9ba9b8}.thumb img{max-width:140px;max-height:175px;object-fit:contain}
   h2{margin:4px 0}.status{color:#f1c983;font-weight:700}a{color:#8bd4f4}.credit{font-size:12px}.card aside{font-size:14px}
   @media(max-width:720px){.card{grid-template-columns:1fr}}
  </style></head><body>
  <h1>GrailRaven — PRIVATE REVIEW-first prototype</h1>
  <p class="notice">Private testing only. Not a public GrailRaven service. Exact edition, manual and shipping are unverified.</p>
  <p>Search: ${escapeHtml(result?.target?.game||"")} · ${escapeHtml(result?.target?.platform||"")} · US</p>
  <p>${rows.length} candidate offer${rows.length===1?"":"s"}. Seller information can change.</p>
  ${cards||"<p>No available candidate listings were returned.</p>"}
  </body></html>`;
}
