// Shared RetroNomad target matcher used by browser Deal Finder and backend monitor.
// Pure logic: no DOM, storage or provider access.
export function createSearchMatcher() {

 function norm(s){return String(s||"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim();}
 const PAL_MARKETS=new Set(["UK_EXACT","UK_SHARED_PAL","PAL_SHARED","UK_COMPATIBLE_EU_ENGLISH","UK_VISUAL_REQUIRED","PAL_EUROPE","EUROPEAN_ENGLISH_MATERIALS"]);
 const UK_STRONG=new Set(["UK_EXACT"]);
 const UK_SHARED=new Set(["UK_EXACT","UK_SHARED_PAL"]);
 const ORIGINAL_EDITIONS=new Set(["original","original / black label"]);
 const UNCERTAIN_EDITIONS=new Set(["original / not flagged","unknown","unverified","unclear"]);
 const BUDGET_EDITIONS=new Set(["platinum","budget","budget / reissue","greatest hits","essentials"]);
 const PROMO_EDITIONS=new Set(["demo","promo","demo / promo","promotional"]);

 function asBool(v){return v===true?true:v===false?false:null;}
 function lower(v){return String(v||"").toLowerCase();}
 function classificationOf(candidate){return candidate.classification||candidate.palScout||{};}
 function addUnique(arr,msg){if(msg&&!arr.includes(msg))arr.push(msg);}
 function classifierReviewCheck(c){
  if(Array.isArray(c.conflicts)&&c.conflicts.length)return{state:"review",reason:c.conflicts[0]};
  if(String(c.marketBucket||"").toUpperCase()==="UK_VISUAL_REQUIRED")return{state:"review",reason:"UK package/release still requires visual confirmation."};
  return{state:"ok"};
 }

 function copyEvidenceCheck(c){
  // PALScout classifies supplier descriptions and identifiers; these are
  // candidate evidence, not a first-party inspection of the actual copy.
  if(c.physicalCopyEvidence==="SELLER_CLAIMS_UNVERIFIED")
   return{state:"review",reason:"The seller's physical copy has not been independently verified."};
  return{state:"ok"};
 }
 function itemTypeCheck(c){
  const kind=String(c.itemType||"").trim().toUpperCase();
  if(["CASE_ONLY","MANUAL_ONLY","ARTWORK_ONLY","BOX_ONLY","BOOKLET_ONLY","NO_GAME","MAGAZINE_DEMO"].includes(kind))
   return{state:"filter",reason:"Listing is for a non-game item rather than a usable game copy."};
  if(kind&&kind!=="GAME"&&kind!=="DISC_ONLY")
   return{state:"review",reason:"Listing item type requires review."};
  return{state:"ok"};
 }
 function gameCheck(target,c){
  if(!c.game)return{state:"review",reason:"Game identity is not confirmed."};
  return norm(c.game)===norm(target.game)?{state:"ok"}:{state:"filter",reason:"Different game."};
 }
 function platformCheck(target,c){
  if(!target.platform)return{state:"ok"};
  if(!c.platform)return{state:"review",reason:"Platform is not confirmed."};
  return c.platform===target.platform?{state:"ok"}:{state:"filter",reason:"Wrong platform."};
 }
 function compatibilityCheck(target,c){
  const state=lower(c.compatibility?.state||c.compatibilityState||c.compatibility);
  if(!state||state==="unknown"||state==="unconfirmed"||state==="review")return{state:"review",reason:"PAL/UK hardware compatibility is not confirmed."};
  if(state==="incompatible"||state==="not compatible"||state==="non-pal")return{state:"filter",reason:"Not compatible with the target UK/European PAL hardware."};
  return{state:"ok"};
 }
 function releaseCheck(target,c){
  const m=String(c.marketBucket||c.releaseMarket||"").toUpperCase();
  const pref=target.releasePreference;
  if(!m){
   return pref==="pal-compatible"||pref==="uk-preferred"
    ?{state:"review",reason:"Exact release market is not confirmed."}
    :{state:"review",reason:"Release evidence is not strong enough for this territory requirement."};
  }
  if(m==="NON_UK_EXACT"&&!PAL_MARKETS.has(m)){
   if(pref==="pal-compatible"||pref==="europe-pal")return{state:"review",reason:"This non-UK release still needs PAL compatibility evidence."};
   return{state:"filter",reason:"Release does not satisfy the UK-market requirement."};
  }
  if(pref==="uk-only")return UK_STRONG.has(m)?{state:"ok"}:{state:"filter",reason:"Not an exact UK release."};
  if(pref==="shared-pal"){
   if(UK_SHARED.has(m))return{state:"ok"};
   if(m==="PAL_SHARED")return{state:"review",reason:"Shared PAL release is not yet proven to include the UK market."};
   return{state:"filter",reason:"Release falls outside the UK/shared-PAL target."};
  }
  if(pref==="europe-pal")return PAL_MARKETS.has(m)?{state:"ok"}:{state:"review",reason:"European PAL release is not confirmed."};
  if(pref==="pal-compatible")return PAL_MARKETS.has(m)?{state:"ok"}:{state:"review",reason:"PAL-family release is not confirmed."};
  if(pref==="uk-preferred"){
   if(PAL_MARKETS.has(m))return{state:"ok"};
   return{state:"review",reason:"PAL-family release is not confirmed."};
  }
  return{state:"ok"};
 }
 function editionCheck(target,c){
  const pref=target.editionPreference;
  const e=lower(c.edition).trim();
  // Explicit unofficial editions are never eligible physical copies, even with "any" selected.
  if(/^(?:reproduction|replica|counterfeit|bootleg)(?: copy| edition)?$/.test(e))return{state:"filter",reason:"Unofficial or reproduction copy is excluded."};
  if(pref==="any")return{state:"ok"};
  if(!e||UNCERTAIN_EDITIONS.has(e))return{state:"review",reason:"Edition is not confirmed; no evidence of the original or a permitted reissue."};
  if(/^(?:not original|non[ -]?original)$/.test(e))return{state:"review",reason:"Edition description does not establish an eligible release."};
  if(PROMO_EDITIONS.has(e)||e.includes("demo")||e.includes("promo"))return{state:"filter",reason:"Demo/promo edition does not match the target."};
  if(pref==="original"){
   if(ORIGINAL_EDITIONS.has(e)||e.includes("original")||e.includes("black label"))return{state:"ok"};
   return{state:"filter",reason:"Target requires the original release."};
  }
  if(pref==="budget-ok"){
   if(ORIGINAL_EDITIONS.has(e)||BUDGET_EDITIONS.has(e)||e.includes("original")||e.includes("platinum")||e.includes("budget")||e.includes("reissue"))return{state:"ok"};
   return{state:"filter",reason:"Edition falls outside original/budget target."};
  }
  return{state:"ok"};
 }
 function completenessCheck(target,c){
  const pref=target.completeness;
  const v=lower(c.completeness).trim();
  if(c.missingGameDisc===true)
   return{state:"filter",reason:"Incomplete copy: a game disc is missing."};
  // Even when the customer selects "any", a box-only offer or a
  // game missing a required disc must not qualify as a usable copy.
  if(v==="case_only"||/\b(?:case only|box only|artwork only|cover only|empty case|empty box|no game|game not included|without (?:the )?game|no (?:game )?(?:disc|disk)|(?:disc|disk) not included)\b/.test(v))
   return{state:"filter",reason:"Listing does not contain a usable game copy."};
  if(/\b(?:missing (?:a |one |the )?(?:disc|disk)(?:\s*\d+)?|(?:disc|disk)\s*\d+\s+missing)\b/.test(v))
   return{state:"filter",reason:"Incomplete copy: a game disc is missing."};
  if(pref==="any"){
   if(/\b(?:incomplete|not complete|almost complete|partial set)\b/.test(v))
    return{state:"review",reason:"Copy is described as incomplete; usability requires review."};
   return{state:"ok"};
  }
  if(!v||v==="unknown")return{state:"review",reason:"Completeness is not confirmed."};
  const noManual=v==="no_manual"||v==="missing manual"||/\b(?:no manual|manual missing|missing manual|without (?:the )?manual|manual not included)\b/.test(v);
  const discOnly=v==="disc_only"||v==="loose"||/\b(?:disc only|disk only|loose|no case)\b/.test(v);
  const caseOnly=v==="case_only"||/\b(?:case only|box only|artwork only|cover only|empty case)\b/.test(v);
  const incomplete=v==="incomplete"||/\b(?:incomplete|not complete|almost complete|missing (?:a |one )?(?:disc|disk|game)|no game|partial set)\b/.test(v);
  // Negated or partial descriptions must never pass as complete merely
  // because they contain the substring "complete".
  const complete=!noManual&&!discOnly&&!caseOnly&&!incomplete&&(v==="cib"||/\bcomplete\b/.test(v));
  if(pref==="cib")return complete?{state:"ok"}:{state:"filter",reason:"Target requires a complete-in-box copy."};
  if(pref==="manual-optional"){
   if(complete||noManual)return{state:"ok"};
   return{state:"filter",reason:"Target requires the game and case; loose/incomplete copies are excluded."};
  }
  if(pref==="loose-ok"){
   if(complete||noManual||discOnly)return{state:"ok"};
   if(caseOnly||incomplete)return{state:"filter",reason:"Listing does not contain a usable game copy."};
   return{state:"review",reason:"Completeness cannot be safely evaluated."};
  }
  return{state:"ok"};
 }
 function englishCheck(target,c){
  if(!target.englishRequired)return{state:"ok"};
  const v=asBool(c.englishFriendly);
  if(v===true)return{state:"ok"};
  if(v===false)return{state:"filter",reason:"English-friendly packaging/materials are required."};
  return{state:"review",reason:"English-friendly packaging/materials are not confirmed."};
 }
 function bundlePromoCheck(target,c){
  if(target.excludeBundles){
   const b=asBool(c.isBundle);
   if(b===true)return{state:"filter",reason:"Multi-game bundles are excluded."};
   if(b===null&&c.bundleStatus==="unknown")return{state:"review",reason:"Bundle status is not confirmed."};
  }
  if(target.excludePromo){
   const p=asBool(c.isPromo);
   const e=lower(c.edition);
   if(p===true||e.includes("demo")||e.includes("promo"))return{state:"filter",reason:"Demo/promo copies are excluded."};
  }
  return{state:"ok"};
 }
 function conditionCheck(target,c){
  if(target.condition==="any"){
   if(c.majorDamage===true)return{state:"filter",reason:"Listing has known major damage and is not treated as a usable copy."};
   return{state:"ok"};
  }
  if(target.condition==="no-major"){
   if(c.majorDamage===true)return{state:"filter",reason:"Target excludes major damage."};
   if(c.majorDamage===false)return{state:"ok"};
   return{state:"review",reason:"Major-damage status is not confirmed."};
  }
  if(target.condition==="collector"){
   if(c.collectorQuality===true)return{state:"ok"};
   if(c.majorDamage===true)return{state:"filter",reason:"Major damage conflicts with collector-quality preference."};
   return{state:"ok",soft:"Collector-quality is preferred but not confirmed."};
  }
  return{state:"ok"};
 }
 // Missing, blank and invalid amounts are NOT zero-priced listings.
 function knownNonnegativeAmount(value){
  if(value==null||typeof value==="boolean"||(typeof value==="string"&&!value.trim()))return null;
  const amount=Number(value);
  return Number.isFinite(amount)&&amount>=0?amount:null;
 }
 function deliveredPrice(candidate){
  const confirmed=knownNonnegativeAmount(candidate.deliveredGbp);
  if(confirmed!==null)return confirmed;
  return String(candidate.currency||"").toUpperCase()==="GBP"
   ?knownNonnegativeAmount(candidate.total):null;
 }
 function priceCheck(target,candidate){
  if(!target.maxDeliveredGbp)return{state:"ok"};
  const gbp=deliveredPrice(candidate);
  if(gbp!==null){
   return gbp<=target.maxDeliveredGbp?{state:"ok"}:{state:"filter",reason:"Delivered price is above the target ceiling."};
  }
  return{state:"review",reason:"Delivered GBP price is not available, so the price ceiling cannot be checked."};
 }

 function rankPreference(target,c){
  let rank=0;
  const m=String(c.marketBucket||c.releaseMarket||"").toUpperCase();
  if(target.releasePreference==="uk-preferred"){
   if(m==="UK_EXACT")rank+=30;
   else if(m==="UK_SHARED_PAL")rank+=20;
   else if(m==="UK_COMPATIBLE_EU_ENGLISH")rank+=10;
   else if(PAL_MARKETS.has(m))rank+=5;
  }
  if(c.confidence==="High"||c.confidence==="high")rank+=12;
  if(c.englishFriendly===true)rank+=5;
  if(c.collectorQuality===true)rank+=4;
  return rank;
 }

 function evaluate(target,candidate){
  const c=classificationOf(candidate);
  const filtered=[],review=[],soft=[];
  const checks=[
   classifierReviewCheck(c),
   copyEvidenceCheck(c),
   itemTypeCheck(c),
   gameCheck(target,c),
   platformCheck(target,c),
   compatibilityCheck(target,c),
   releaseCheck(target,c),
   editionCheck(target,c),
   completenessCheck(target,c),
   englishCheck(target,c),
   bundlePromoCheck(target,c),
   conditionCheck(target,c),
   priceCheck(target,candidate)
  ];
  for(const x of checks){
   if(x.state==="filter")addUnique(filtered,x.reason);
   else if(x.state==="review")addUnique(review,x.reason);
   if(x.soft)addUnique(soft,x.soft);
  }
  const state=filtered.length?"FILTERED":review.length?"REVIEW":"MATCH";
  return{
   state,
   reasons:state==="FILTERED"?filtered:state==="REVIEW"?review:[],
   notes:soft,
   preferenceRank:rankPreference(target,c),
   deliveredGbp:deliveredPrice(candidate)
  };
 }

 function sortEvaluated(rows){
  const stateOrder={MATCH:0,REVIEW:1,FILTERED:2};
  return [...rows].sort((a,b)=>{
   const sa=stateOrder[a.match?.state]??9,sb=stateOrder[b.match?.state]??9;
   if(sa!==sb)return sa-sb;
   const ra=a.match?.preferenceRank||0,rb=b.match?.preferenceRank||0;
   if(ra!==rb)return rb-ra;
   const pa=a.match?.deliveredGbp,pb=b.match?.deliveredGbp;
   if(pa!=null&&pb!=null&&pa!==pb)return pa-pb;
   return 0;
  });
 }

 return {evaluate,sortEvaluated};

}
