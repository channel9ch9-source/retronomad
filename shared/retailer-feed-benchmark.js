// Offline, permission-gated intake of partner-SUPPLIED files. No network/deploy hooks.
// Raw inventory stays in the local process; results are fixed-target aggregate counts.
export const RETAILER_BENCHMARK_TARGETS = Object.freeze([
 {id:"GR01",game:"Tomba!",aliases:["Tombi!"],platform:"PS1",market:"US"},
 {id:"GR02",game:"Tombi!",aliases:["Tomba!"],platform:"PS1",market:"UK"},
 {id:"GR03",game:"Silent Hill",platform:"PS1",market:"UK"},
 {id:"GR04",game:"Silent Hill",platform:"PS1",market:"US"},
 {id:"GR05",game:"Resident Evil 2",platform:"PS1",market:"UK"},
 {id:"GR06",game:"Resident Evil 2",platform:"PS1",market:"US"},
 {id:"GR07",game:"Suikoden II",platform:"PS1",market:"US"},
 {id:"GR08",game:"Parasite Eve",platform:"PS1",market:"US"},
 {id:"GR09",game:"Project Zero II: Crimson Butterfly",aliases:["Fatal Frame II: Crimson Butterfly"],platform:"PS2",market:"UK"},
 {id:"GR10",game:"Fatal Frame II: Crimson Butterfly",aliases:["Project Zero II: Crimson Butterfly"],platform:"PS2",market:"US"},
 {id:"GR11",game:"Forbidden Siren",aliases:["Siren"],platform:"PS2",market:"UK"},
 {id:"GR12",game:"Siren",aliases:["Forbidden Siren"],platform:"PS2",market:"US"},
 {id:"GR13",game:"Haunting Ground",platform:"PS2",market:"UK"},
 {id:"GR14",game:"Rule of Rose",platform:"PS2",market:"US"},
 {id:"GR15",game:"Silent Hill 2",platform:"PS2",market:"UK"},
 {id:"GR16",game:"Kuon",platform:"PS2",market:"US"},
 {id:"GR17",game:"Jet Set Radio",aliases:["Jet Grind Radio"],platform:"Dreamcast",market:"UK"},
 {id:"GR18",game:"Jet Grind Radio",aliases:["Jet Set Radio"],platform:"Dreamcast",market:"US"},
 {id:"GR19",game:"Illbleed",platform:"Dreamcast",market:"US"},
 {id:"GR20",game:"Shenmue II",platform:"Dreamcast",market:"UK"}
]);

const MAX_ROWS=5000;
const MAX_FILE_CHARS=5_000_000;
const FIELD_NAMES=new Set([
 "listingId","game","title","url","platform","market","edition","completeness",
 "condition","itemType","photoType","currency","itemPrice","deliveryPrice",
 "status","quantity","updatedAt"
]);
const MANDATORY=["listingId","game","title","url","platform","market","edition","completeness","itemType","status","updatedAt"];
const norm=s=>String(s??"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim();
const short=(s,max=300)=>String(s??"").trim().slice(0,max);
function requireCondition(ok,code){if(!ok)throw new Error(code);}
function finiteMoney(v) {
 if(v===null||v===undefined||String(v).trim()==="")return null;
 if(!/^\d+(?:\.\d{1,2})?$/.test(String(v).trim()))return null;
 const n=Number(v);
 return Number.isFinite(n)&&n>=0&&n<=1_000_000?n:null;
}
function quantity(v){
 if(v===undefined||v===null||String(v).trim()==="")return null;
 const n=Number(v);
 return Number.isSafeInteger(n)&&n>=0?n:-1;
}
function normalizePlatform(s){
 const v=norm(s);
 if(["ps1","psx","playstation","playstation 1"].includes(v))return "PS1";
 if(["ps2","playstation 2"].includes(v))return "PS2";
 if(["dreamcast","sega dreamcast"].includes(v))return "Dreamcast";
 return "";
}
function normalizeMarket(s){
 const v=norm(s);
 if(["us","usa","ntsc u","north america","united states"].includes(v))return "US";
 if(["uk","gb","united kingdom","uk pal","great britain"].includes(v))return "UK";
 if(["europe","european","eu","pal","pal europe","europe pal"].includes(v))return "EU_PAL";
 if(["japan","jp","ntsc j"].includes(v))return "JP";
 return "";
}
function validPartnerUrl(raw,hosts) {
 try {
  const u=new URL(String(raw??""));
  return u.protocol==="https:"&&!u.username&&!u.password&&
   hosts.includes(u.hostname.toLowerCase())&&u.pathname.length<=1000 &&
   u.toString().length<=1600;
 }catch{return false;}
}

export function requireRetailerBenchmarkRights(rights,config,now=new Date()) {
 requireCondition(rights&&typeof rights==="object"&&!Array.isArray(rights),"RIGHTS_MANIFEST_REQUIRED");
 requireCondition(config&&typeof config==="object"&&!Array.isArray(config),"FEED_MAPPING_REQUIRED");
 requireCondition(rights.provider===config.provider&&
   /^[A-Za-z0-9][A-Za-z0-9 _.-]{1,69}$/.test(String(config.provider||"")),"PROVIDER_MISMATCH");
 requireCondition(rights.dataAccessAllowed===true&&rights.privateBenchmarkAllowed===true,
   "PRIVATE_BENCHMARK_PERMISSION_REQUIRED");
 requireCondition(typeof rights.authorisationRef==="string"&&rights.authorisationRef.trim().length>=8,
   "WRITTEN_AUTHORISATION_REFERENCE_REQUIRED");
 requireCondition(Array.isArray(rights.allowedHosts)&&rights.allowedHosts.length>0&&
   rights.allowedHosts.length<=15&&rights.allowedHosts.every(h=>
    typeof h==="string"&&/^(?!-)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(h) &&
    h===h.toLowerCase()),"PARTNER_HOST_ALLOWLIST_REQUIRED");
 const checked=new Date(now).getTime();
 const expiry=new Date(rights.expiresAt).getTime();
 requireCondition(Number.isFinite(checked)&&Number.isFinite(expiry)&&expiry>checked,
   "PARTNER_PERMISSION_EXPIRED_OR_UNDATED");
 requireCondition(config.columns&&typeof config.columns==="object"&&!Array.isArray(config.columns),
   "FEED_MAPPING_COLUMNS_REQUIRED");
 for(const k of MANDATORY)requireCondition(typeof config.columns[k]==="string"&&
   config.columns[k].trim().length>0,"MISSING_FEED_COLUMN_MAPPING");
 requireCondition(Object.keys(config.columns).every(k=>FIELD_NAMES.has(k)) &&
   Object.values(config.columns).every(v=>typeof v==="string"&&v.length<=100&&v.length>0),
   "UNSAFE_FEED_COLUMN_MAPPING");
 return true;
}

// Strict RFC4180-style comma/quoted-CRLF parsing; fail instead of silently shifting columns.
export function parseRetailerFeed(text,format="csv"){
 requireCondition(typeof text==="string"&&text.length<=MAX_FILE_CHARS,"FEED_SIZE_INVALID");
 if(format==="json"){
  let v;try{v=JSON.parse(text);}catch{throw new Error("JSON_PARSE_FAILED");}
  const rows=Array.isArray(v)?v:v?.items;
  requireCondition(Array.isArray(rows)&&rows.length<=MAX_ROWS&&rows.every(x=>
   x&&typeof x==="object"&&!Array.isArray(x)),"JSON_FEED_ROWS_INVALID");
  return rows;
 }
 requireCondition(format==="csv","UNSUPPORTED_FEED_FORMAT");
 const rows=[];let record=[],value="",quoted=false,closed=false;
 const input=text.replace(/^\uFEFF/,"");
 for(let i=0;i<input.length;i++){
  const ch=input[i];
  if(quoted){
   if(ch==='"'&&input[i+1]==='"'){value+='"';i++;}
   else if(ch==='"'){quoted=false;closed=true;}
   else value+=ch;
  }else if(ch==='"'&&value===""&&!closed){quoted=true;}
  else if(ch===","){record.push(value);value="";closed=false;}
  else if(ch==="\n"||ch==="\r"){
   if(ch==="\r"&&input[i+1]==="\n")i++;
   record.push(value);value="";closed=false;
   if(record.some(x=>x.trim()!==""))rows.push(record);
   record=[];
   requireCondition(rows.length<=MAX_ROWS+1,"FEED_TOO_MANY_ROWS");
  }else{
   requireCondition(!closed&&ch!=='"',"CSV_QUOTE_INVALID");
   value+=ch;
  }
  requireCondition(value.length<=100_000&&record.length<=100,"CSV_CELL_OR_WIDTH_TOO_LARGE");
 }
 requireCondition(!quoted,"CSV_UNTERMINATED_QUOTE");
 if(value!==""||record.length){record.push(value);rows.push(record);}
 requireCondition(rows.length>0&&rows.length<=MAX_ROWS+1,"CSV_ROW_COUNT_INVALID");
 const headers=rows.shift().map(x=>x.trim());
 requireCondition(headers.length>0&&headers.every(Boolean)&&
  new Set(headers).size===headers.length,"CSV_HEADER_DUPLICATE_OR_EMPTY");
 requireCondition(rows.every(row=>row.length===headers.length),"CSV_ROW_WIDTH_MISMATCH");
 return rows.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]])));
}

export function benchmarkRetailerFeed(rows,rights,config,{now=new Date(),maxAgeHours=168}={}){
 requireRetailerBenchmarkRights(rights,config,now);
 requireCondition(Array.isArray(rows)&&rows.length<=MAX_ROWS,"FEED_TOO_MANY_ROWS");
 requireCondition(rows.length>0&&MANDATORY.every(key=>rows.some(row=>
  row&&typeof row==="object"&&Object.hasOwn(row,config.columns[key]))),
  "FEED_EMPTY_OR_REQUIRED_COLUMNS_ABSENT");
 requireCondition(Number.isFinite(maxAgeHours)&&maxAgeHours>0&&maxAgeHours<=720,
   "FRESHNESS_THRESHOLD_INVALID");
 const ts=new Date(now).getTime();
 const out=RETAILER_BENCHMARK_TARGETS.map(target=>({
  id:target.id,game:target.game,platform:target.platform,desiredMarket:target.market,
  inStockCandidates:0,review:0,filtered:0,verifiedMatch:0,
  cibSellerClaims:0,actualItemPhotosUnverified:0,stockOrNoPhotos:0,
  missingPrices:0,missingDelivery:0
 }));
 const keys=new Set(),seen=new Set();
 const allKnownNames=[...new Set(RETAILER_BENCHMARK_TARGETS.flatMap(t=>[t.game,...(t.aliases||[])].map(norm)))];
 const counters={inputRows:rows.length,invalidRows:0,duplicateRows:0,
  outOfStock:0,staleOrUnknownFreshness:0,unmatchedGameOrPlatform:0,
  eligibleInStockRecords:0,uniquePotentialListings:0};
 for(const row of rows){
  if(!row||typeof row!=="object"||Array.isArray(row)){counters.invalidRows++;continue;}
  const get=key=>row[config.columns[key]]; // explicit allowlist: never dump raw feed or row
  const id=short(get("listingId"),200);
  const title=short(get("title"),400);
  const game=short(get("game"),150);
  const platform=normalizePlatform(get("platform"));
  const market=normalizeMarket(get("market"));
  const status=norm(get("status"));
  const itemType=norm(get("itemType"));
  const edition=norm(get("edition"));
  const completeness=norm(get("completeness"));
  const photoType=norm(get("photoType"));
  const currency=short(get("currency"),10).toUpperCase();
  const price=finiteMoney(get("itemPrice"));
  const delivery=finiteMoney(get("deliveryPrice"));
  const qty=quantity(get("quantity"));
  const stamp=new Date(get("updatedAt")).getTime();
  const fresh=Number.isFinite(stamp)&&stamp<=ts+300_000&&ts-stamp<=maxAgeHours*3_600_000;
  if(!id||!title||!game||!platform||!validPartnerUrl(get("url"),rights.allowedHosts)||
    qty===-1||![...["in stock","available","sold out","out of stock","sold","preorder","unknown"]].includes(status)||
    (currency!==""&&!/^[A-Z]{3}$/.test(currency))||
    (get("itemPrice")!==undefined&&String(get("itemPrice")).trim()!==""&&price===null)||
    (get("deliveryPrice")!==undefined&&String(get("deliveryPrice")).trim()!==""&&delivery===null)){
   counters.invalidRows++;continue;
  }
  if(seen.has(id)){counters.duplicateRows++;continue;}
  seen.add(id);
  if(status!=="in stock"&&status!=="available"||qty===0){
   counters.outOfStock++;continue;
  }
  if(!fresh){counters.staleOrUnknownFreshness++;continue;}
  counters.eligibleInStockRecords++;
  let hit=false;
  for(let i=0;i<RETAILER_BENCHMARK_TARGETS.length;i++){
   const t=RETAILER_BENCHMARK_TARGETS[i];
   if(t.platform!==platform)continue;
   if(![t.game,...(t.aliases||[])].some(name=>norm(name)===norm(game)))continue;
   hit=true;
   const agg=out[i];agg.inStockCandidates++;
   // Only explicit contradictions are FILTERED. Claims of original/CIB/region
   // or actual photographs never independently verify a particular copy.
   const wrongMarket=market && (t.market==="US"?market!=="US":market==="US"||market==="JP");
   const wrongEdition=/greatest hits|platinum|reissue|budget|essentials|demo|promo|repro|fake|bootleg/.test(edition);
   const wrongContents=/disc only|game only|loose|no manual|missing manual|case only|box only|manual only|repro|fake|bootleg/.test(completeness);
   const notGame=!!itemType&&itemType!=="game"&&itemType!=="video game";
   const acceptedNames=[t.game,...(t.aliases||[])].map(norm);
   const listingTitle=norm(title);
   // A clear named sequel/other benchmark title in the retailer title
   // contradicts a shorter declared "game" field (e.g. Silent Hill 2).
   const contradictsTitle=allKnownNames.some(name=>!acceptedNames.includes(name)&&
     name.length>norm(game).length&&
     (listingTitle===name||listingTitle.startsWith(name+" ")));
   if(wrongMarket||wrongEdition||wrongContents||notGame||contradictsTitle){agg.filtered++;continue;}
   agg.review++;
   keys.add(id);
   if(/cib|complete|game box and manual/.test(completeness))agg.cibSellerClaims++;
   if(photoType==="actual"||photoType==="item photo")agg.actualItemPhotosUnverified++;
   else agg.stockOrNoPhotos++;
   if(price===null||currency==="")agg.missingPrices++;
   if(delivery===null)agg.missingDelivery++;
  }
  if(!hit)counters.unmatchedGameOrPlatform++;
 }
 counters.uniquePotentialListings=keys.size;
 return {
  schemaVersion:1,status:"PRIVATE_BENCHMARK_ONLY",source:config.provider,
  generatedAt:new Date(ts).toISOString(),fixture:false,
  scope:"20 fixed collector intents; partner-supplied local feed only",
  permissionCheck:"DOCUMENTED_REFERENCE_REQUIRED_NOT_INDEPENDENTLY_VERIFIED",
  publicationApproved:false,actualOfferPublicationEnabled:false,
  exactPhysicalCopiesVerified:0,
  counts:counters,
  summary:{
   testedIntents:out.length,
   intentsWithInStockCandidates:out.filter(x=>x.inStockCandidates>0).length,
   intentsWithReviewCandidates:out.filter(x=>x.review>0).length,
   distinctPotentialListings:keys.size,
   totalReviewIntents:out.reduce((n,x)=>n+x.review,0),
   totalFilteredIntents:out.reduce((n,x)=>n+x.filtered,0)
  },
  intents:out,
  caveat:"Benchmark is NOT evidence of exact UK/US release, real item condition, contents, buyer-specific shipping, currently authorised public display, or complete retailer coverage. No MATCH without independently reviewed per-copy evidence. Stock counts are a single locally provided snapshot."
 };
}
