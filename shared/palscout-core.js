// Shared PALScout classifier core used by browser Deal Finder and backend monitor.
// Keep DOM/window access out of this module.
export function createPALScoutClassifier(releaseEvidence = []) {

 const GAMES=[{"t":"Silent Hill","p":"PS1","s":"UK_VISUAL_REQUIRED","n":"SLES-01514 / 4988602555660 is shared across PAL territories; cover/manual evidence is needed."},{"t":"Final Fantasy VII","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Final Fantasy VIII","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Final Fantasy IX","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Klonoa: Door to Phantomile","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Castlevania: Symphony of the Night","p":"PS1","s":"UK_SHARED_PAL","n":"Original SLES-00524 / 4988602060652 is shared across UK and continental PAL variants; treat the documented shared release as UK-market compatible."},{"t":"Dino Crisis","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Dino Crisis 2","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Resident Evil","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Resident Evil 2","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Resident Evil 3: Nemesis","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Metal Gear Solid","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Parasite Eve II","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Alundra","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Suikoden","p":"PS1","s":"UK_SHARED_PAL","n":"SLES-00527 / 4988602029529 is shared across UK and other PAL territories."},{"t":"Suikoden II","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Koudelka","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Breath of Fire III","p":"PS1","s":"UK_SHARED_PAL","n":"SLES-01304 / 4014762800149 is documented for UK/Italy/Spain."},{"t":"Breath of Fire IV","p":"PS1","s":"UK_SHARED_PAL","n":"SLES-03552 / 5055060900000 is documented for UK/Italy/Spain."},{"t":"Ape Escape","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Fear Effect","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Tekken 3","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Gran Turismo 2","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Rival Schools: United by Fate","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Final Fantasy VI","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Final Fantasy Anthology","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"R-Type Delta","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Tenchu 2: Birth of the Stealth Assassins","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Grand Theft Auto","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Tombi!","p":"PS1","s":"UK_SHARED_PAL","n":"SCES-01330 / 0711719734123 is a multi-country PAL release including the UK."},{"t":"Tombi! 2","p":"PS1","s":"UK_VISUAL_REQUIRED","n":"UK and Dutch copies can share SCES-02147; exact UK packaging requires cover/manual evidence."},{"t":"The Legend of Dragoon","p":"PS1","s":"UK_SHARED_PAL","n":"English PAL disc set is the useful UK-market bucket; serial identifies language set rather than a unique country."},{"t":"MediEvil","p":"PS1","s":"UK_EXACT","n":"UK-specific launch/reissue EANs have been added."},{"t":"MediEvil 2","p":"PS1","s":"UK_EXACT","n":"UK-specific EAN has been added."},{"t":"Street Fighter Alpha 3","p":"PS1","s":"EUROPE_UNRESOLVED","n":"PAL serial is known but the reference database still flags country/EAN details as unresolved."},{"t":"Crash Bandicoot 3: Warped","p":"PS1","s":"UK_EXACT","n":"UK-specific EAN has been added."},{"t":"Vagrant Story","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Tomb Raider","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Tomb Raider II","p":"PS1","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Fear Effect 2: Retro Helix","p":"PS1","s":"UK_EXACT","n":"UK-specific EAN has been added."},{"t":"Silent Hill 2","p":"PS2","s":"UK_VISUAL_REQUIRED","n":"Original EAN/package identifiers overlap with non-UK European/Nordic variants; English insert/package evidence is needed."},{"t":"Silent Hill 2: Director's Cut","p":"PS2","s":"UK_EXACT","n":"UK Director's Cut/Platinum packaging code and EAN are distinct."},{"t":"Silent Hill 3","p":"PS2","s":"UK_EXACT","n":"Verified UK reissue packaging/EAN gives exact UK evidence."},{"t":"Silent Hill 4: The Room","p":"PS2","s":"UK_EXACT","n":"Verified UK 2005 reissue code/EAN gives exact UK evidence."},{"t":"Rule of Rose","p":"PS2","s":"NO_OFFICIAL_UK_RETAIL","n":"505 Games cancelled the normal UK retail release. Rare English/British materials exist but must not be treated as a normal UK retail SKU."},{"t":"Haunting Ground","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"General European release is documented; English packaging/gallery evidence is needed before calling an individual copy UK-market compatible."},{"t":"Kuon","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"PAL release is multi-language; serial alone does not identify a UK package."},{"t":"Project Zero","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European serial/EAN is known, but exact UK packaging still needs positive visual evidence."},{"t":"Project Zero II: Crimson Butterfly","p":"PS2","s":"UK_SHARED_PAL","n":"Generic European release sits alongside separately coded French/German/Italian/Spanish variants; the generic release is the useful English/UK-market bucket."},{"t":"Project Zero 3: The Tormented","p":"PS2","s":"UK_VISUAL_REQUIRED","n":"Reference sources disagree on PAL EANs; require packaging evidence rather than guessing."},{"t":"Forbidden Siren","p":"PS2","s":"UK_SHARED_PAL","n":"Documented as a European/British edition; shared release is suitable for the UK-market bucket."},{"t":"Forbidden Siren 2","p":"PS2","s":"UK_EXACT","n":"UK-specific barcode evidence added."},{"t":"God Hand","p":"PS2","s":"UK_VISUAL_REQUIRED","n":"PAL serial is shared and current reference sites conflict on European EANs; require cover/package evidence."},{"t":"Shin Megami Tensei: Persona 3 FES","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"English European package is identifiable, but not uniquely UK from the serial/EAN alone."},{"t":"Shin Megami Tensei: Persona 4","p":"PS2","s":"UK_EXACT","n":"UK product barcode / 'Only for Sale in the UK' packaging evidence added."},{"t":"Def Jam: Fight for NY","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"English/French PAL SKU is the relevant UK-market release but is not country-unique."},{"t":"The Warriors","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European multi-language PS2 SKU is used in the UK; not country-unique from serial/EAN alone."},{"t":"Shadow of the Colossus","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European multi-language EAN is used by UK copies; packaging is not country-unique."},{"t":"Resident Evil: Code Veronica X","p":"PS2","s":"UK_EXACT","n":"UK/English EAN is distinguishable from Spanish and other variants."},{"t":"Marvel vs. Capcom 2: New Age of Heroes","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"English European EAN is widely used for UK copies, but it is a Europe release rather than a country-unique SKU."},{"t":"ICO","p":"PS2","s":"UK_EXACT","n":"UK retail EAN evidence added."},{"t":"Okami","p":"PS2","s":"UK_EXACT","n":"UK release EAN evidence added."},{"t":"Shin Megami Tensei: Lucifer's Call","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European multi-language release is the relevant UK-market SKU; identifier alone is not country proof."},{"t":"Shin Megami Tensei: Digital Devil Saga","p":"PS2","s":"UK_EXACT","n":"UK product EAN evidence added."},{"t":"Shin Megami Tensei: Digital Devil Saga 2","p":"PS2","s":"UK_EXACT","n":"UK Collector's Edition EAN evidence added."},{"t":"Resident Evil 4","p":"PS2","s":"UK_EXACT","n":"UK Limited Edition EAN/product evidence added."},{"t":"Resident Evil Outbreak","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"PAL-EUR release is known; exact UK packaging is not isolated by the serial."},{"t":"Resident Evil Outbreak File #2","p":"PS2","s":"UK_EXACT","n":"UK product EAN evidence added."},{"t":"Devil May Cry","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"PAL multi-language SKU is the relevant UK-market release but is not country-unique."},{"t":"Devil May Cry 3: Special Edition","p":"PS2","s":"UK_EXACT","n":"UK product EAN evidence added."},{"t":"Metal Gear Solid 2: Substance","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European two-disc release is the relevant UK-market SKU; serials are not country-specific."},{"t":"Metal Gear Solid 3: Subsistence","p":"PS2","s":"UK_EXACT","n":"UK three-disc product EAN evidence added."},{"t":"Gregory Horror Show","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European release is English-capable and sold in the UK, but the identifier is not uniquely UK."},{"t":"Obscure","p":"PS2","s":"UK_EXACT","n":"UK product EAN evidence added."},{"t":"Obscure II","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"PAL release recognised; packaging evidence remains useful because multiple regional packaging variants exist."},{"t":"Killer7","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European multi-language release is UK-market compatible but not uniquely UK."},{"t":"Viewtiful Joe","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European PAL release recognised; exact country packaging is not established by serial alone."},{"t":"TimeSplitters 2","p":"PS2","s":"UK_EXACT","n":"UK product EAN / ELSPA package evidence added."},{"t":"TimeSplitters: Future Perfect","p":"PS2","s":"UK_EXACT","n":"BBFC-labelled UK/EU package EAN evidence added."},{"t":"Castlevania: Curse of Darkness","p":"PS2","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European release is the UK-market SKU but serial/EAN is not country-unique."},{"t":"Shenmue","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European -50 release is the UK-market release, but product code is not country-unique."},{"t":"Shenmue II","p":"Dreamcast","s":"UK_SHARED_PAL","n":"MK-51184-50 / 5060004761302 is explicitly documented for UK, France, Germany and Spain."},{"t":"Skies of Arcadia","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is the UK-market release but not country-unique."},{"t":"Power Stone","p":"Dreamcast","s":"UK_VISUAL_REQUIRED","n":"Multiple European language-group product codes exist; exact UK package should be resolved from cover/manual language."},{"t":"Power Stone 2","p":"Dreamcast","s":"UK_VISUAL_REQUIRED","n":"Multiple European language-group product codes exist; exact UK package should be resolved from cover/manual language."},{"t":"Project Justice: Rival Schools 2","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is used in the UK; not a country-unique code."},{"t":"Cannon Spike","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European SKU/EAN is used for UK copies; seller/gallery evidence can confirm the English package."},{"t":"Marvel vs. Capcom 2","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is used for UK copies; not country-unique."},{"t":"Street Fighter III: 3rd Strike","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is the relevant UK-market release."},{"t":"JoJo's Bizarre Adventure","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"European SKU/EAN is seen on UK copies but is not country-unique."},{"t":"Resident Evil: Code Veronica","p":"Dreamcast","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Resident Evil 2","p":"Dreamcast","s":"UK_SHARED_PAL","n":"T-7004D-61 is shared by UK/Spain/Italy."},{"t":"Resident Evil 3: Nemesis","p":"Dreamcast","s":"UK_SHARED_PAL","n":"T-7021D-56 is shared by UK/Italy."},{"t":"Dino Crisis","p":"Dreamcast","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Sonic Adventure","p":"Dreamcast","s":"UK_SHARED_PAL","n":"Documented PAL variants explicitly include UK in shared country groups."},{"t":"Sonic Adventure 2","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is the UK-market release but not country-unique."},{"t":"Crazy Taxi","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is the UK-market release but not country-unique."},{"t":"Jet Set Radio","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is the UK-market release but not country-unique."},{"t":"Grandia II","p":"Dreamcast","s":"UK_EXACT","n":"Retained from verified v2 exact-UK identifier evidence."},{"t":"Rez","p":"Dreamcast","s":"UK_COMPATIBLE_EU_ENGLISH","n":"Single European SKU/EAN is used by UK copies but is not country-unique."}];
 const ALIASES={"klonoa":"Klonoa: Door to Phantomile","ff7":"Final Fantasy VII","ffvii":"Final Fantasy VII","final fantasy 7":"Final Fantasy VII","ff8":"Final Fantasy VIII","ffviii":"Final Fantasy VIII","final fantasy 8":"Final Fantasy VIII","ff9":"Final Fantasy IX","ffix":"Final Fantasy IX","final fantasy 9":"Final Fantasy IX","sh1":"Silent Hill","silent hill 1":"Silent Hill","sh2":"Silent Hill 2","sh3":"Silent Hill 3","sh4":"Silent Hill 4: The Room","mgs":"Metal Gear Solid","mgs2":"Metal Gear Solid 2: Substance","mgs3":"Metal Gear Solid 3: Subsistence","re2":"Resident Evil 2","re3":"Resident Evil 3: Nemesis","re4":"Resident Evil 4","code veronica":"Resident Evil: Code Veronica","sotc":"Shadow of the Colossus"};
 const PAL_MARKETS=new Set(["UK_EXACT","UK_SHARED_PAL","PAL_SHARED","UK_COMPATIBLE_EU_ENGLISH","UK_VISUAL_REQUIRED","PAL_EUROPE","EUROPEAN_ENGLISH_MATERIALS"]);
 const EVIDENCE_RANK={NON_UK_EXACT:100,UK_EXACT:95,NO_OFFICIAL_UK_RETAIL:95,UK_SHARED_PAL:90,UK_COMPATIBLE_EU_ENGLISH:80,UK_VISUAL_REQUIRED:75,EUROPEAN_ENGLISH_MATERIALS:70,PAL_SHARED:65,PAL_EUROPE:50};

 function norm(s){return String(s||"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim().replace(/\bvii\b/g,"7").replace(/\bviii\b/g,"8").replace(/\bix\b/g,"9").replace(/\biii\b/g,"3").replace(/\bii\b/g,"2");}
 function normId(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"");}
 function evidenceRows(){return releaseEvidence||[];}
 function catalogue(){return GAMES.slice();}
 function aliases(){return {...ALIASES};}
 function listingText(listing){
  const specifics=listing.itemSpecifics&&typeof listing.itemSpecifics==="object"
   ?Object.entries(listing.itemSpecifics).map(([k,v])=>k+" "+(Array.isArray(v)?v.join(" "):v)).join(" "):"";
  return [listing.title,listing.description,listing.sourceRegion,listing.conditionText,specifics,listing.ocrText].filter(Boolean).join(" ");
 }

 function detectPlatformSignal(text){
  const n=norm(text),hits=[];
  if(/\b(ps2|playstation 2|playstation two)\b/.test(n))hits.push("PS2");
  if(/\b(ps1|psx|playstation 1|playstation one)\b/.test(n))hits.push("PS1");
  if(/\b(sega dreamcast|dreamcast)\b/.test(n))hits.push("Dreamcast");
  const u=[...new Set(hits)];
  if(u.length===1)return{value:u[0],confidence:"High",reason:"Explicit platform wording"};
  if(u.length>1)return{value:"",confidence:"Conflict",reason:"Multiple platform signals: "+u.join(", ")};
  return{value:"",confidence:"None",reason:"No explicit platform wording"};
 }

 function detectRegionSignal(text){
  const raw=String(text||"").toLowerCase(),n=norm(text);
  const scan=raw
   .replace(/\b(?:not|is not|isn't|isnt|non)[\s-]+(?:an?\s+)?(?:japanese(?:\s+version)?|japan|jp version)(?:[\s,/-]+ntsc[\s-]*j)?\b/g," ")
   .replace(/\b(?:not|is not|isn't|isnt|non)[\s-]+(?:an?\s+)?(?:american(?:\s+version)?|north american(?:\s+version)?|usa|u\.s\.|us version)(?:[\s,/-]+ntsc[\s-]*(?:u\/?c|u|us))?\b/g," ")
   .replace(/\b(?:not|is not|isn't|isnt|non)[\s-]+ntsc[\s-]*(?:j|u\/?c|u|us)\b/g," ");
  const signals=[],palSerial=/\b(?:SLES|SCES)[-\s]?\d{5}\b/i.test(raw);
  if(/\b(ntsc[\s-]*j|jpn|japan|japanese|jp version|japanese version)\b/.test(scan)||/\b(?:SLPS|SLPM|SCPS|SCPM)[-\s]?\d{5}\b/i.test(raw))signals.push("Non-PAL Japan/Asia");
  if(/\b(ntsc[\s-]*(u\/?c|u|us)|usa|u\.s\.|us version|american version|north american)\b/.test(scan)||/\b(?:SLUS|SCUS)[-\s]?\d{5}\b/i.test(raw))signals.push("NTSC-U/C / North America");
  if(/\b(pal[\s-]*(fr|fra)|fr[\s-]*pal|french version|french cover|french manual|version francaise|france)\b/.test(raw))signals.push("PAL France");
  if(/\b(pal[\s-]*(it|ita)|ita[\s-]*pal|it[\s-]*pal|italian version|italian cover|italian manual|italy|italia)\b/.test(raw))signals.push("PAL Italy");
  if(/\b(pal[\s-]*(de|ger)|de[\s-]*pal|ger[\s-]*pal|german version|german cover|germany|deutsch)\b/.test(raw))signals.push("PAL Germany");
  if(/\b(pal[\s-]*(es|spa)|es[\s-]*pal|spa[\s-]*pal|spanish version|spanish cover|spain|espana|españa)\b/.test(raw))signals.push("PAL Spain");
  if(signals.length){if(palSerial)signals.push("PAL Europe PlayStation serial");return{kind:"foreign",label:[...new Set(signals)].join(", "),confidence:"High"};}
  if(palSerial)return{kind:"pal_serial",label:"PAL Europe PlayStation serial",confidence:"High"};
  if(/\b(uk pal|pal uk|uk version|british version|english uk|only for sale in the uk)\b/.test(raw))return{kind:"uk_claim",label:"UK / British seller wording",confidence:"Medium"};
  if(/\b(european pal|pal europe|pal eu)\b/.test(raw))return{kind:"pal_europe",label:"European PAL wording",confidence:"Medium"};
  if(/\bpal\b/.test(n))return{kind:"pal_generic",label:"Generic PAL wording",confidence:"Low"};
  return{kind:"unknown",label:"No explicit territory wording",confidence:"None"};
 }

 function detectCompletenessSignal(text){
  const n=norm(text);
  if(/\b(case only|box only|artwork only|cover only|empty case|empty box|replacement case|no game|game not included|without (?:the )?game|no (?:game )?(?:disc|disk)|(?:disc|disk) not included)\b/.test(n))return{value:"case_only",confidence:"High"};
  if(/\b(disc only|disk only|loose disc|loose disk|loose copy|no case)\b/.test(n))return{value:"disc_only",confidence:"High"};
  if(/\b(no manual|without manual|manual missing|missing manual|manual not included|no booklets?|without booklets?)\b/.test(n))return{value:"no_manual",confidence:"High"};
  if(/\b(missing (?:disc|disk) ?\d*|(?:disc|disk) ?\d+ missing|missing one (?:disc|disk)|missing a (?:disc|disk))\b/.test(n))
   return{value:"incomplete",confidence:"High",missingGameDisc:true};
  if(/\bincomplete set\b/.test(n))return{value:"incomplete",confidence:"High"};
  const strong=[/\bcomplete in box\b/,/\bcib\b/,/\bcomplete with (?:the )?(?:instruction )?manual\b/,/\bboxed (?:copy )?(?:(?:with|and) )?(?:the )?(?:instruction )?manuals?\b/,/\b(?:box|case) (?:(?:and|with) )?(?:the )?(?:instruction )?manuals?\b/,/\b(?:instruction )?manual included\b/,/\bincludes (?:the )?(?:instruction )?manual\b/];
  if(strong.some(r=>r.test(n)))return{value:"complete",confidence:"High"};
  if(!/\b(incomplete|not complete|missing|without)\b/.test(n)&&/\bcomplete\b/.test(n))return{value:"complete",confidence:"Medium"};
  if(/\b(new )?sealed\b/.test(n)&&!/\b(case only|box only|artwork only)\b/.test(n))return{value:"complete",confidence:"Medium"};
  return{value:"unknown",confidence:"None"};
 }

 function detectBonusDemo(text){const n=norm(text);return /\b(with|includes?|including|bonus|plus|and) (?:a )?(?:bonus )?demo(?: disc)?\b/.test(n)||/\bdemo disc included\b/.test(n);}
 function detectEdition(text){
  const n=norm(text),bonus=detectBonusDemo(text);
  const demo=/\b(demo only|demo disc only|promotional copy|promo copy|not for resale|standalone demo|playable demo)\b/.test(n)||(!bonus&&/^.*\bdemo(?: disc)?\b.*$/i.test(n)&&!/\bcomplete\b/.test(n));
  if(demo)return"Demo / promo";
  if(/\bplatinum\b/.test(n))return"Platinum";
  if(/\b(greatest hits|essentials|value series|white label)\b/.test(n))return"Budget / reissue";
  if(/\b(directors cut|director s cut)\b/.test(n))return"Director's Cut";
  if(/\b(limited edition|collectors edition|collector s edition|special edition)\b/.test(n))return"Special / limited edition";
  if(/\b(black label|original release|first print|first pressing)\b/.test(n))return"Original / black label";
  return"Original / not flagged";
 }
 function detectItemType(text){
  const n=norm(text);
  if(/\b(official uk playstation magazine|playstation magazine|magazine)\b/.test(n)&&/\bdemo\b/.test(n))return"MAGAZINE_DEMO";
  if(/\b(manual only|instruction manual only|booklet only|instruction booklet only)\b/.test(n))return"MANUAL_ONLY";
  if(/\b(case only|box only|artwork only|cover only|empty case|empty box|replacement case|no game|game not included|without (?:the )?game|no (?:game )?(?:disc|disk)|(?:disc|disk) not included)\b/.test(n))return"CASE_ONLY";
  return"GAME";
 }
 function detectCondition(text){
  const n=norm(text),issues=[];
  if(/\bcracked? (?:disc|disk)|(?:disc|disk) crack|(?:disc|disk) has (?:a )?crack|hairline crack\b/.test(n))issues.push("cracked disc");
  if(/\bdeep scratches?|heavily scratched|badly scratched|significant scratches?\b/.test(n))issues.push("significant disc scratches");
  if(/\bcase cracked|cracked case|broken case|damaged case\b/.test(n))issues.push("case damage");
  if(/\bwater damage|torn manual|manual torn|writing on manual|writing on disc\b/.test(n))issues.push("paper/writing damage");
  const collector=/\b(mint|near mint|excellent condition|collector grade|collector quality)\b/.test(n)&&!issues.length;
  const noMajor=/\b(no cracks?|no damage|no major damage|very good condition|excellent condition|near mint|mint)\b/.test(n)&&!issues.length;
  return{issues,majorDamage:issues.length?true:(noMajor?false:null),collectorQuality:collector?true:null};
 }
 function detectEnglishFriendly(text,explicit){
  if(explicit===true||explicit===false)return explicit;
  const raw=String(text||"").toLowerCase();
  const pos=/\b(english language|english text|english manual|english cover|english version|uk version|british version|pal uk|uk pal)\b/.test(raw);
  const neg=/\b(french version|french cover|french manual|german version|german cover|german manual|spanish version|spanish cover|spanish manual|italian version|italian cover|italian manual)\b/.test(raw);
  if(pos&&!neg)return true;if(neg&&!pos)return false;return null;
 }
 function extractIdentifierCandidates(text){
  const raw=String(text||""),out=[],seen=new Set(),serial=/\b(?:SLES|SCES|SLUS|SCUS|SLPS|SLPM|SCPS|SCPM|MK|T)[-\s]?[A-Z0-9]{4,8}(?:[-\s]?[A-Z0-9]{1,3})?\b/gi,barcode=/\b\d{11,14}\b/g;
  for(const re of [serial,barcode])for(const m of raw.matchAll(re)){const v=m[0].trim(),k=normId(v);if(k&&!seen.has(k)){seen.add(k);out.push(v);}}
  return out;
 }
 function findEvidence(text,ids=[]){
  const rows=evidenceRows(),hay=normId(text),exact=ids.map(normId).filter(Boolean);let hits=[];
  if(exact.length)hits=rows.filter(x=>exact.includes(normId(x[4])));
  else if(hay)hits=rows.filter(x=>{const n=normId(x[4]);return n&&x[3]!=="market_release_status"&&hay.includes(n);});
  hits.sort((a,b)=>{const len=normId(b[4]).length-normId(a[4]).length;if(len)return len;return(EVIDENCE_RANK[b[5]]||10)-(EVIDENCE_RANK[a[5]]||10);});
  return hits;
 }
 function scoreTitle(text,g){const a=norm(text),b=norm(g.t);if(a.includes(b))return 100+b.length;let score=0;for(const w of b.split(" ")){if(w.length>2&&a.includes(w))score+=w.length;}return score;}
 function canonicalMentions(text,platform){
  const n=norm(text),found=[],push=t=>{const g=GAMES.find(x=>x.t===t&&(!platform||x.p===platform));if(g&&!found.includes(t))found.push(t);};
  const explicit=[["final fantasy 7","Final Fantasy VII"],["ff7","Final Fantasy VII"],["ffvii","Final Fantasy VII"],["final fantasy 8","Final Fantasy VIII"],["ff8","Final Fantasy VIII"],["ffviii","Final Fantasy VIII"],["final fantasy 9","Final Fantasy IX"],["ff9","Final Fantasy IX"],["ffix","Final Fantasy IX"],["klonoa","Klonoa: Door to Phantomile"],["silent hill 2 directors cut","Silent Hill 2: Director's Cut"],["silent hill 2 director s cut","Silent Hill 2: Director's Cut"],["metal gear solid 3 subsistence","Metal Gear Solid 3: Subsistence"],["mgs3 subsistence","Metal Gear Solid 3: Subsistence"]];
  for(const [a,t] of explicit)if(n.includes(norm(a)))push(t);
  for(const [a,t] of Object.entries(ALIASES))if(n.includes(norm(a)))push(t);
  for(const g of GAMES){const gn=norm(g.t);if(gn.length>=6&&n.includes(gn))push(g.t);}
  return found.filter(a=>!found.some(b=>a!==b&&(norm(b).startsWith(norm(a)+" ")||norm(b).startsWith(norm(a)+" director"))));
 }
 function detectGame(text,platform,hit){
  if(hit)return GAMES.find(g=>g.t===hit[0]&&g.p===hit[1])||{t:hit[0],p:hit[1],s:hit[5]};
  const n=norm(text);
  if(/\bmetal gear solid 3\b/.test(n)&&/\bsnake eater\b/.test(n)&&!/\bsubsistence\b/.test(n))return null;
  const mentions=canonicalMentions(text,platform);if(mentions.length===1){const g=GAMES.find(x=>x.t===mentions[0]&&(!platform||x.p===platform));if(g)return g;}
  for(const [a,t] of Object.entries(ALIASES))if(n.includes(norm(a))){if(t==="Metal Gear Solid 3: Subsistence"&&!/subsistence/.test(n))continue;const g=GAMES.find(x=>x.t===t&&(!platform||x.p===platform));if(g)return g;}
  let best=null,bs=0;for(const g of GAMES.filter(g=>!platform||g.p===platform)){const s=scoreTitle(text,g);if(s>bs){best=g;bs=s;}}return bs>=8?best:null;
 }
 function detectBundle(text,platform){
  const n=norm(text),mentions=canonicalMentions(text,platform),raw=String(text||"").toLowerCase(),bundleWords=/\b(bundle|job lot|joblot|collection|multi game|multiple games|games lot|game lot|lot of)\b/.test(n),joiner=/\s(?:&|\+|and)\s/.test(raw);
  const seriesPair=/final fantasy\s*(?:vii|7)\s*(?:&|\+|and)\s*(?:viii|8)|final fantasy\s*(?:viii|8)\s*(?:&|\+|and)\s*(?:vii|7)/i.test(raw);
  if(seriesPair){if(!mentions.includes("Final Fantasy VII"))mentions.push("Final Fantasy VII");if(!mentions.includes("Final Fantasy VIII"))mentions.push("Final Fantasy VIII");}
  return{isBundle:mentions.length>=2&&(bundleWords||joiner||seriesPair),games:mentions};
 }
 function compatibility(region,hit,itemType,bundle){
  if(itemType!=="GAME")return{state:"review",label:"Compatibility not assessed for non-game item"};
  if(bundle.isBundle)return{state:"review",label:"Check each game in bundle"};
  const label=String(region.label||""),ntsc=/NTSC-J|Japan|Asia|NTSC-U|North America|Non-PAL/i.test(label),explicitPal=/PAL (France|Italy|Germany|Spain|Europe)/i.test(label)||["uk_claim","pal_serial","pal_europe"].includes(region.kind),generic=region.kind==="pal_generic",market=hit?.[5]||"",exactPal=PAL_MARKETS.has(market);
  if(ntsc&&(exactPal||explicitPal))return{state:"review",label:"Conflicting PAL and NTSC evidence"};
  if(ntsc)return{state:"incompatible",label:"Non-PAL / NTSC region evidence"};
  if(exactPal)return{state:"compatible",label:"PAL-family identifier evidence"};
  if(market==="NON_UK_EXACT"&&explicitPal)return{state:"compatible",label:"Non-UK PAL territory evidence"};
  if(explicitPal)return{state:"compatible",label:"Explicit European PAL evidence"};
  if(generic)return{state:"review",label:"Generic PAL wording only"};
  return{state:"review",label:"Compatibility unconfirmed"};
 }
 function inferMarket(game,hit,region,english){
  if(hit)return hit[5];
  if(game?.s==="NO_OFFICIAL_UK_RETAIL")return"NO_OFFICIAL_UK_RETAIL";
  if(region.kind==="pal_serial"||region.kind==="pal_europe")return"PAL_EUROPE";
  if(region.kind==="foreign"&&/PAL (France|Italy|Germany|Spain)/.test(region.label))return"PAL_EUROPE";
  if(region.kind==="uk_claim"&&english!==false)return"UK_VISUAL_REQUIRED";
  return"";
 }
 function classifyListing(listing={},options={}){
  const text=listingText(listing),ids=[...(Array.isArray(listing.identifiers)?listing.identifiers:[]),...(listing.identifier?[listing.identifier]:[]),...extractIdentifierCandidates(text)];
  const uniqueIds=[...new Set(ids.filter(Boolean))],platformSignal=detectPlatformSignal(text),seedPlatform=options.platform||listing.platform||platformSignal.value||"",hits=findEvidence(text,uniqueIds),hit=hits[0]||null;
  const titleGame=detectGame(text,seedPlatform,null),game=detectGame(text,seedPlatform,hit),platform=hit?.[1]||seedPlatform||game?.p||"",region=detectRegionSignal(text+" "+uniqueIds.join(" ")),itemType=detectItemType(text),bundle=detectBundle(text,platform),complete=detectCompletenessSignal(text),edition=hit?.[2]&&hit[2]!=="original"?hit[2][0].toUpperCase()+hit[2].slice(1):detectEdition(text),english=detectEnglishFriendly(text,listing.englishFriendly),condition=detectCondition(text),compat=compatibility(region,hit,itemType,bundle),market=inferMarket(game,hit,region,english),review=[],conflicts=[];
  if(!game)review.push("Game identity is not confirmed.");
  if(!platform)review.push("Platform is not confirmed.");
  if(platformSignal.confidence==="Conflict")conflicts.push(platformSignal.reason);
  if(hit&&titleGame&&titleGame.t!==hit[0])conflicts.push("Identifier evidence conflicts with the listing title game.");
  if(hit&&platformSignal.value&&platformSignal.value!==hit[1])conflicts.push("Identifier evidence conflicts with the listing platform wording.");
  if(compat.state==="review")review.push(compat.label);
  if(!market)review.push("Exact release market is not confirmed.");
  if(complete.value==="unknown")review.push("Completeness is not confirmed.");
  if(conflicts.length)review.push(...conflicts);
  let confidence=hit&&!conflicts.length?"High":game&&platform&&region.confidence!=="None"?"Medium":"Low";
  if(conflicts.length)confidence="Low";
  return{game:game?.t||"",platform,itemType,physicalCopyEvidence:"SELLER_CLAIMS_UNVERIFIED",compatibility:compat,regionSignal:region,marketBucket:market,catalogMarket:game?.s||"",edition,completeness:complete.value,completenessConfidence:complete.confidence,missingGameDisc:complete.missingGameDisc===true,englishFriendly:english,isBundle:bundle.isBundle,bundleGames:bundle.games,isPromo:itemType==="MAGAZINE_DEMO"||/demo|promo/i.test(edition),majorDamage:condition.majorDamage,collectorQuality:condition.collectorQuality,conditionIssues:condition.issues,confidence,identifier:hit?.[4]||"",identifierType:hit?.[3]||"",evidenceMarket:hit?.[5]||"",detectedIdentifiers:uniqueIds,reviewReasons:[...new Set(review)],conflicts:[...new Set(conflicts)]};
 }
 function classifyMarketplaceListing(listing,options={}){return{...listing,classification:classifyListing(listing,options)};}
 return {classifyListing,classifyMarketplaceListing,catalogue,aliases,detectRegionSignal,detectPlatformSignal,detectCompletenessSignal,detectEdition,extractIdentifierCandidates,findEvidence};

}
