import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  normalizeCatalogueTitle,
  makeCatalogueId,
  validateCatalogue
} from "../shared/catalogue-core.js";

const CLIENT_ID=String(process.env.IGDB_CLIENT_ID||"").trim();
const CLIENT_SECRET=String(process.env.IGDB_CLIENT_SECRET||"").trim();
if(!CLIENT_ID||!CLIENT_SECRET){
  console.error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are required.");
  process.exit(2);
}

const root=process.cwd();
const source=JSON.parse(await fs.readFile(path.join(root,"catalogue","base-catalogue.json"),"utf8"));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function getToken(){
  const url=new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id",CLIENT_ID);
  url.searchParams.set("client_secret",CLIENT_SECRET);
  url.searchParams.set("grant_type","client_credentials");
  const res=await fetch(url,{method:"POST"});
  if(!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  return res.json();
}
const auth=await getToken();

async function igdb(endpoint,body){
  const res=await fetch(`https://api.igdb.com/v4/${endpoint}`,{
    method:"POST",
    headers:{
      Accept:"application/json",
      "Client-ID":CLIENT_ID,
      Authorization:`Bearer ${auth.access_token}`,
      "Content-Type":"text/plain"
    },
    body
  });
  if(!res.ok) throw new Error(`IGDB ${endpoint} failed: ${res.status} ${await res.text()}`);
  const json=await res.json();
  await sleep(275);
  return json;
}

const platformNames={
  PS1:["PlayStation","PS1"],
  PS2:["PlayStation 2","PS2"],
  Dreamcast:["Dreamcast","DC"]
};

async function resolvePlatform(label,names){
  const rows=await igdb("platforms",`fields id,name,abbreviation,slug; search "${names[0]}"; limit 50;`);
  const wanted=names.map(normalizeCatalogueTitle);
  const hit=rows.find(r=>wanted.includes(normalizeCatalogueTitle(r.name))||wanted.includes(normalizeCatalogueTitle(r.abbreviation)));
  if(!hit) throw new Error(`Could not resolve platform ${label}`);
  return hit;
}

function normalizeGameType(row){
  return normalizeCatalogueTitle(row.game_type?.type||"unknown");
}

function safeReleaseYear(timestamp){
  if(!timestamp) return {year:null,invalid:false,raw:null};
  const year=new Date(timestamp*1000).getUTCFullYear();
  if(!Number.isInteger(year)||year<1980||year>2100){
    return {year:null,invalid:true,raw:year};
  }
  return {year,invalid:false,raw:year};
}

function classify(row){
  const rawType=String(row.game_type?.type||"unknown");
  const type=normalizeGameType(row);
  if(row.version_parent) return {bucket:"EXCLUDE_VERSION",reason:"version_parent",gameType:rawType};
  if(["dlc addon","mod","episode","season","pack addon","update"].includes(type)){
    return {bucket:"EXCLUDE_NON_BASE",reason:type,gameType:rawType};
  }
  if(["bundle","expansion","fork","unknown"].includes(type)){
    return {bucket:"REVIEW",reason:type,gameType:rawType};
  }
  if(["main game","port","remake","remaster","expanded game","standalone expansion"].includes(type)){
    return {bucket:"INCLUDE_CANDIDATE",reason:type,gameType:rawType};
  }
  return {bucket:"REVIEW",reason:"unrecognised_game_type:"+type,gameType:rawType};
}

async function fetchPlatform(label,platformId){
  const countPayload=await igdb("games/count",`where platforms = (${platformId});`);
  const total=Number(countPayload?.count||0);
  const records=[];
  for(let offset=0;offset<total;offset+=500){
    process.stdout.write(`[${label}] ${offset+1}-${Math.min(offset+500,total)} / ${total}\n`);
    const page=await igdb("games",
      `fields id,name,slug,first_release_date,cover.image_id,alternative_names.name,version_parent,version_title,game_type.type,parent_game,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,genres.name; where platforms = (${platformId}); sort id asc; limit 500; offset ${offset};`
    );
    records.push(...page);
    if(page.length<500) break;
  }
  return records.map(row=>{
    const releaseYear=safeReleaseYear(row.first_release_date);
    return {
    igdbId:String(row.id),
    name:String(row.name||"").trim(),
    slug:row.slug||null,
    firstReleaseDate:row.first_release_date||null,
    releaseYear:releaseYear.year,
    invalidReleaseYear:releaseYear.invalid?releaseYear.raw:null,
    coverImageId:row.cover?.image_id||null,
    alternativeNames:[...new Set((row.alternative_names||[]).map(x=>String(x.name||"").trim()).filter(Boolean))],
    versionParent:row.version_parent?String(row.version_parent):null,
    versionTitle:row.version_title||null,
    parentGame:row.parent_game?String(row.parent_game):null,
    gameType:String(row.game_type?.type||"unknown"),
    developers:[...new Set((row.involved_companies||[]).filter(x=>x.developer&&x.company?.name).map(x=>x.company.name))],
    publishers:[...new Set((row.involved_companies||[]).filter(x=>x.publisher&&x.company?.name).map(x=>x.company.name))],
    genres:[...new Set((row.genres||[]).map(x=>x.name).filter(Boolean))],
    classification:classify(row)
  };
  });
}

function namesForProvider(row){
  return [...new Set([row.name,...row.alternativeNames].map(normalizeCatalogueTitle).filter(Boolean))];
}
function namesForSeed(game){
  return [...new Set([game.title,...(game.aliases||[])].map(normalizeCatalogueTitle).filter(Boolean))];
}
function intersects(a,b){
  const set=new Set(a);
  return b.some(x=>set.has(x));
}
function seedMatchScore(seed,row){
  const seedTitle=normalizeCatalogueTitle(seed.title);
  const seedAliases=(seed.aliases||[]).map(normalizeCatalogueTitle);
  const providerTitle=normalizeCatalogueTitle(row.name);
  const providerAliases=(row.alternativeNames||[]).map(normalizeCatalogueTitle);
  if(providerTitle===seedTitle) return 100;
  if(seedAliases.includes(providerTitle)) return 95;
  if(providerAliases.includes(seedTitle)) return 90;
  if(seedAliases.some(alias=>providerAliases.includes(alias))) return 85;
  return 0;
}
function addAliases(existing,candidates,title){
  const titleKey=normalizeCatalogueTitle(title);
  const byKey=new Map((existing||[]).map(x=>[normalizeCatalogueTitle(x),x]));
  for(const alias of candidates||[]){
    const key=normalizeCatalogueTitle(alias);
    if(!key||key===titleKey||byKey.has(key)) continue;
    byKey.set(key,alias);
  }
  return [...byKey.values()].sort((a,b)=>a.localeCompare(b));
}
function groupByCanonical(rows){
  const groups=new Map();
  for(const row of rows){
    const key=normalizeCatalogueTitle(row.name);
    if(!key) continue;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(row);
  }
  return groups;
}
function chooseGroup(group){
  if(group.length===1) return {selected:group[0],decision:"UNIQUE_CANONICAL_NAME",suppressed:[]};
  const main=group.filter(r=>normalizeCatalogueTitle(r.gameType)==="main game");
  if(main.length===1){
    return {
      selected:main[0],
      decision:"UNIQUE_MAIN_GAME_WINS_SAME_TITLE_COLLISION",
      suppressed:group.filter(r=>r.igdbId!==main[0].igdbId)
    };
  }
  return {selected:null,decision:"HOLD_AMBIGUOUS_SAME_TITLE",suppressed:group};
}

const report={
  schemaVersion:1,
  provider:"IGDB",
  generatedAt:new Date().toISOString(),
  mode:"DRY_RUN_FULL_CATALOGUE_IMPORT",
  canonicalCatalogueModified:false,
  d1Modified:false,
  artworkImported:false,
  platforms:{},
  mergeSummary:{},
  review:{
    ambiguousProviderTitleGroups:[],
    seedAmbiguities:[],
    idCollisions:[],
    invalidReleaseYears:[],
    seedGamesWithoutExactProviderMapping:[]
  }
};

const proposed=structuredClone(source);
proposed.catalogueVersion="dry-run-igdb-"+new Date().toISOString().slice(0,10);
const proposedById=new Map(proposed.games.map(g=>[g.id,g]));
const seedByPlatform=Object.fromEntries(Object.keys(platformNames).map(p=>[p,source.games.filter(g=>g.platform===p)]));
const mappedSeedIds=new Set();

let newGames=0, enrichedSeedGames=0, heldProviderRecords=0, suppressedSameTitleRecords=0;

for(const [platformLabel,names] of Object.entries(platformNames)){
  const platform=await resolvePlatform(platformLabel,names);
  const all=await fetchPlatform(platformLabel,platform.id);
  for(const row of all){
    if(row.invalidReleaseYear!=null){
      report.review.invalidReleaseYears.push({
        platform:platformLabel,
        igdbId:row.igdbId,
        title:row.name,
        invalidReleaseYear:row.invalidReleaseYear
      });
    }
  }

  const include=all.filter(r=>r.classification.bucket==="INCLUDE_CANDIDATE");
  const reviewRows=all.filter(r=>r.classification.bucket==="REVIEW");
  const excluded=all.filter(r=>r.classification.bucket.startsWith("EXCLUDE"));
  const groups=groupByCanonical(include);
  const selected=[];

  for(const [normalizedTitle,group] of groups){
    const decision=chooseGroup(group);
    if(decision.selected){
      selected.push(decision.selected);
      if(decision.suppressed.length){
        suppressedSameTitleRecords+=decision.suppressed.length;
        report.review.ambiguousProviderTitleGroups.push({
          platform:platformLabel,
          normalizedTitle,
          decision:decision.decision,
          selectedIgdbId:decision.selected.igdbId,
          records:group.map(r=>({igdbId:r.igdbId,name:r.name,gameType:r.gameType,versionParent:r.versionParent}))
        });
      }
    }else{
      heldProviderRecords+=group.length;
      report.review.ambiguousProviderTitleGroups.push({
        platform:platformLabel,
        normalizedTitle,
        decision:decision.decision,
        selectedIgdbId:null,
        records:group.map(r=>({igdbId:r.igdbId,name:r.name,gameType:r.gameType,versionParent:r.versionParent}))
      });
    }
  }

  const rowsBySeed=new Map();
  const newRows=[];

  for(const row of selected){
    const providerNames=namesForProvider(row);
    const seedMatches=seedByPlatform[platformLabel].filter(seed=>intersects(providerNames,namesForSeed(seed)));

    if(seedMatches.length>1){
      report.review.seedAmbiguities.push({
        platform:platformLabel,
        igdbId:row.igdbId,
        providerTitle:row.name,
        reason:"PROVIDER_ROW_MATCHES_MULTIPLE_SEEDS",
        seedMatches:seedMatches.map(g=>({id:g.id,title:g.title,score:seedMatchScore(g,row)}))
      });
      heldProviderRecords++;
      continue;
    }

    if(seedMatches.length===1){
      const seed=seedMatches[0];
      if(!rowsBySeed.has(seed.id)) rowsBySeed.set(seed.id,[]);
      rowsBySeed.get(seed.id).push({row,seed,score:seedMatchScore(seed,row)});
      continue;
    }

    newRows.push(row);
  }

  for(const entries of rowsBySeed.values()){
    entries.sort((a,b)=>b.score-a.score||a.row.igdbId.localeCompare(b.row.igdbId));
    const bestScore=entries[0].score;
    const best=entries.filter(x=>x.score===bestScore);

    if(best.length!==1){
      report.review.seedAmbiguities.push({
        platform:platformLabel,
        seedId:entries[0].seed.id,
        seedTitle:entries[0].seed.title,
        reason:"MULTIPLE_PROVIDER_ROWS_TIED_FOR_SEED",
        providerRows:entries.map(x=>({igdbId:x.row.igdbId,title:x.row.name,score:x.score,gameType:x.row.gameType}))
      });
      heldProviderRecords+=entries.length;
      continue;
    }

    const winner=best[0];
    const seed=proposedById.get(winner.seed.id);
    mappedSeedIds.add(seed.id);
    seed.aliases=addAliases(seed.aliases,[winner.row.name,...winner.row.alternativeNames],seed.title);
    if(seed.releaseYear==null&&winner.row.releaseYear) seed.releaseYear=winner.row.releaseYear;
    if(seed.developer==null&&winner.row.developers.length) seed.developer=winner.row.developers[0];
    if(seed.publisher==null&&winner.row.publishers.length) seed.publisher=winner.row.publishers[0];
    if((seed.genres||[]).length===0&&winner.row.genres.length) seed.genres=[...winner.row.genres];
    seed.externalRefs={...(seed.externalRefs||{}),igdb:winner.row.igdbId};
    seed.provenance=[
      ...(seed.provenance||[]),
      {source:"IGDB_DRY_RUN",sourceKey:winner.row.igdbId,importedAt:new Date().toISOString().slice(0,10)}
    ];
    enrichedSeedGames++;

    const losers=entries.filter(x=>x!==winner);
    if(losers.length){
      heldProviderRecords+=losers.length;
      report.review.seedAmbiguities.push({
        platform:platformLabel,
        seedId:seed.id,
        seedTitle:seed.title,
        reason:"LOWER_CONFIDENCE_PROVIDER_ALIAS_ROWS_HELD",
        selected:{igdbId:winner.row.igdbId,title:winner.row.name,score:winner.score},
        held:losers.map(x=>({igdbId:x.row.igdbId,title:x.row.name,score:x.score,gameType:x.row.gameType}))
      });
    }
  }

  for(const row of newRows){
    const id=makeCatalogueId(platformLabel,row.name);
    if(proposedById.has(id)){
      report.review.idCollisions.push({platform:platformLabel,id,igdbId:row.igdbId,title:row.name});
      heldProviderRecords++;
      continue;
    }

    const aliases=addAliases([],row.alternativeNames,row.name);
    const game={
      id,
      title:row.name,
      platform:platformLabel,
      aliases,
      releaseYear:row.releaseYear,
      developer:row.developers[0]||null,
      publisher:row.publishers[0]||null,
      genres:[...row.genres],
      artwork:null,
      externalRefs:{igdb:row.igdbId},
      provenance:[{source:"IGDB_DRY_RUN",sourceKey:row.igdbId,importedAt:new Date().toISOString().slice(0,10)}],
      releaseIntelligence:{coverage:"BASE_ONLY"}
    };
    proposed.games.push(game);
    proposedById.set(id,game);
    newGames++;
  }

  report.platforms[platformLabel]={
    igdbPlatform:{id:platform.id,name:platform.name,abbreviation:platform.abbreviation||null},
    fetched:all.length,
    includeCandidates:include.length,
    reviewRows:reviewRows.length,
    excludedRows:excluded.length,
    uniqueCanonicalGroups:groups.size,
    selectedCanonicalRecords:selected.length
  };
}

for(const seed of source.games){
  if(!mappedSeedIds.has(seed.id)){
    report.review.seedGamesWithoutExactProviderMapping.push({
      id:seed.id,
      title:seed.title,
      platform:seed.platform,
      aliases:seed.aliases||[]
    });
  }
}

proposed.games.sort((a,b)=>a.platform.localeCompare(b.platform)||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
const validation=validateCatalogue(proposed);
report.mergeSummary={
  originalSeedGames:source.games.length,
  proposedTotalGames:proposed.games.length,
  newBaseOnlyGames:newGames,
  enrichedSeedGames,
  seedGamesWithoutExactProviderMapping:report.review.seedGamesWithoutExactProviderMapping.length,
  heldProviderRecords,
  suppressedSameTitleRecords,
  providerSameTitleReviewGroups:report.review.ambiguousProviderTitleGroups.length,
  seedAmbiguities:report.review.seedAmbiguities.length,
  idCollisions:report.review.idCollisions.length,
  invalidReleaseYears:report.review.invalidReleaseYears.length,
  proposedCatalogueValid:validation.ok,
  validationErrors:validation.errors
};

if(!validation.ok){
  console.error("Dry-run proposed catalogue failed validation:",validation.errors);
  process.exitCode=1;
}

const day=new Date().toISOString().slice(0,10);
await fs.mkdir("benchmarks",{recursive:true});
await fs.writeFile(`benchmarks/igdb-dry-import-proposed-${day}.json`,JSON.stringify(proposed,null,2)+"\n","utf8");
await fs.writeFile(`benchmarks/igdb-dry-import-review-${day}.json`,JSON.stringify(report,null,2)+"\n","utf8");
console.log(JSON.stringify(report.mergeSummary,null,2));
