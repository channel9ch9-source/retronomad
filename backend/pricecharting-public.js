// Public, limited US Marketplace listing bridge.
// Licensed PriceCharting responses stay on the server and are intentionally
// restricted to REVIEW-first metadata. No raw API payloads or secret tokens.
import { searchUsPriceChartingReview } from "./pricecharting-review-pilot.js";
import { sha256Hex } from "./auth-core.js";

async function hashedClientKey(request,now){
  const ip=String(request?.headers?.get?.("cf-connecting-ip")||"").trim();
  if(!ip)return "";
  return sha256Hex("pricecharting-public|"+now.toISOString().slice(0,10)+"|"+ip);
}

export const PUBLIC_PC_PATH="/api/marketplace/pricecharting/us";
const EDGE_TTL_SECONDS=300;
const GLOBAL_GAP_MS=30_000;
const IP_WINDOW_MS=15*60_000;
const IP_WINDOW_MAX=4;

function responseJson(payload,status=200){
  return new Response(JSON.stringify(payload),{
    status,
    headers:{
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-store",
      "x-content-type-options":"nosniff",
      "x-frame-options":"DENY",
      "referrer-policy":"strict-origin-when-cross-origin",
      "vary":"Origin"
    }
  });
}

function cleanInput(url){
  const keys=[...url.searchParams.keys()];
  if(keys.some(key=>!["game","platform"].includes(key)) || keys.length!==2) return null;
  const game=url.searchParams.get("game")?.trim()||"";
  const platform=url.searchParams.get("platform")||"";
  if(game.length<2 || game.length>100 || !/^[\p{L}\p{N}][\p{L}\p{N} :!.,&+’'()\-]{0,99}$/u.test(game)) return null;
  if(!["PS1","PS2","Dreamcast"].includes(platform)) return null;
  return {game,platform};
}

function safeRow(row){
  if(row?.match?.state!=="REVIEW" || row.source!=="pricecharting")return null;
  const url=String(row.canonicalUrl||"");
  const source=String(row.attribution?.url||"");
  try {
    const u=new URL(url);
    const s=new URL(source);
    if(u.origin!=="https://www.pricecharting.com" || !/^\/offer\/[a-z0-9_-]+\/?$/i.test(u.pathname) ||
       u.search || u.hash || s.origin!=="https://www.pricecharting.com" ||
       s.pathname!=="/offers" || !s.searchParams.has("product")) return null;
  } catch {return null;}
  return {
    source:"pricecharting",
    title:String(row.title||"").slice(0,150),
    platform:String(row.platform||""),
    market:"US (not independently verified)",
    url,
    imageUrl:String(row.imageUrl||""),
    currency:"USD",
    itemPrice:Number(row.itemPrice),
    postage:null,
    deliveredTotal:null,
    completenessClaim:String(row.completenessClaim||"").slice(0,160),
    conditionClaim:String(row.conditionClaim||"").slice(0,160),
    description:String(row.description||"").slice(0,400),
    attribution:{label:"Marketplace offer via PriceCharting",url:source},
    status:"REVIEW",
    reviewReasons:(Array.isArray(row.match.reasons)?row.match.reasons:[]).map(x=>String(x).slice(0,240)).slice(0,6)
  };
}

export function publicReviewPayload(data){
  const rows=(Array.isArray(data?.rows)?data.rows:[])
    .map(safeRow).filter(x=>x && Number.isFinite(x.itemPrice) && x.itemPrice>=0).slice(0,12);
  return {
    provider:"PriceCharting Marketplace",
    classification:"REVIEW_ONLY",
    region:"US provider category; physical region and edition unverified",
    candidates:rows,
    sourceCredit:"Offers and pricing via PriceCharting",
    sourceUrl:"https://www.pricecharting.com",
    notice:"These are seller-stated listings, not verified exact releases. Inspect original seller photos, contents and condition. The USD listed price is not a verified delivered total; destination-specific shipping and any shipping already included in the listing price are unconfirmed."
  };
}

function toResponse(cached) {
  return new Response(cached.body,{
    status:cached.status,
    headers:{
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-store",
      "x-content-type-options":"nosniff",
      "x-frame-options":"DENY",
      "referrer-policy":"strict-origin-when-cross-origin"
    }
  });
}

async function reserveQuery(db,request,now,hashFn) {
  if(!db) return {ok:false, status:503, code:"rate_storage_unavailable"};
  // The sole global slot prevents concurrent public searches from exhausting
  // the provider's one-request-per-second account budget across Workers.
  // One search may perform up to five sequential provider calls.
  const ipKey=await hashFn(request,new Date(now));
  if(ipKey){
    const bucket=Math.floor(now/IP_WINDOW_MS);
    const ip=await db.prepare(
      "INSERT INTO pricecharting_public_limits (key,count,valid_until) VALUES (?,1,?) " +
      "ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<?"
    ).bind("ip:"+bucket+":"+ipKey,bucket*IP_WINDOW_MS+IP_WINDOW_MS,IP_WINDOW_MAX).run();
    if(!(ip.meta?.changes>0))return {ok:false,status:429,code:"too_many_searches"};
  }
  const global=await db.prepare(
    "INSERT INTO pricecharting_public_limits (key,count,valid_until) VALUES ('global',1,?) " +
    "ON CONFLICT(key) DO UPDATE SET valid_until=excluded.valid_until WHERE valid_until<=?"
  ).bind(now+GLOBAL_GAP_MS,now).run();
  if(!(global.meta?.changes>0))return {ok:false,status:429,code:"search_cooling_down"};
  // Retain only short-lived pseudonymous buckets; never store raw visitor IPs.
  try{
    await db.prepare("DELETE FROM pricecharting_public_limits WHERE key LIKE 'ip:%' AND valid_until < ?")
      .bind(now-24*60*60*1000).run();
  }catch{/* Rate reservations above remain enforced even if housekeeping is delayed. */}
  return {ok:true};
}

export async function handlePublicPriceChartingSearch(request,env,options={}) {
  if(request.method!=="GET")return responseJson({error:"method_not_allowed"},405);
  if(String(env.PRICECHARTING_PUBLIC_ENABLED)!=="true" || !String(env.PRICECHARTING_TOKEN||"").trim()){
    return responseJson({error:"marketplace_not_available"},503);
  }
  const input=cleanInput(new URL(request.url));
  if(!input)return responseJson({error:"invalid_search",message:"Choose a US game title and PS1, PS2 or Dreamcast."},400);
  const cache=options.cache ?? (typeof caches!=="undefined" ? caches.default : null);
  const cacheKey=new Request(
    "https://grailraven.com"+PUBLIC_PC_PATH+"?platform="+encodeURIComponent(input.platform)+"&game="+encodeURIComponent(input.game.toLowerCase()),
    {method:"GET"}
  );
  if(cache){
    const hit=await cache.match(cacheKey);
    if(hit) return toResponse(hit);
  }
  const now=options.now ?? Date.now();
  try {
    const gate=await reserveQuery(env.DB,request,now,options.hashFn||hashedClientKey);
    if(!gate.ok)return responseJson({error:gate.code,message:"Please try again shortly."},gate.status);
    const search=options.search||((target)=>searchUsPriceChartingReview(target,{
      token:env.PRICECHARTING_TOKEN,
      maxProducts:2
    }));
    const data=await search(input);
    const payload=publicReviewPayload(data);
    const outgoing=responseJson(payload);
    if(cache){
      const stored=new Response(JSON.stringify(payload),{
        status:200,
        headers:{"content-type":"application/json; charset=utf-8",
          "cache-control":"public, max-age="+EDGE_TTL_SECONDS}
      });
      await cache.put(cacheKey,stored);
    }
    return outgoing;
  } catch {
    // Never leak secret-bearing URLs or provider response details.
    return responseJson({error:"marketplace_temporarily_unavailable",
      message:"Live Marketplace offers are temporarily unavailable."},503);
  }
}
