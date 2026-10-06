import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { normalizeCatalogueTitle } from "../shared/catalogue-core.js";

const CLIENT_ID=String(process.env.IGDB_CLIENT_ID||"").trim();
const CLIENT_SECRET=String(process.env.IGDB_CLIENT_SECRET||"").trim();
if(!CLIENT_ID||!CLIENT_SECRET){
  console.error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are required.");
  process.exit(2);
}
const root=process.cwd();
const catalogue=JSON.parse(await fs.readFile(path.join(root,"catalogue","base-catalogue.json"),"utf8"));
const seed=catalogue.games||[];
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

async function fetchAllGames(label,platformId){
  const countPayload=await igdb("games/count",`where platforms = (${platformId});`);
  const total=Number(countPayload?.count||0);
  const records=[];
  for(let offset=0;offset<total;offset+=500){
    process.stdout.write(`[${label}] ${offset+1}-${Math.min(offset+500,total)} / ${total}\n`);
    const page=await igdb("games",
      `fields id,name,slug,first_release_date,cover.image_id,alternative_names.name,version_parent,version_title,game_type.type,parent_game; where platforms = (${platformId}); sort id asc; limit 500; offset ${offset};`
    );
    records.push(...page);
    if(page.length<500) break;
  }
  return {reportedCount:total,records};
}

function typeName(row){
  return String(row.game_type?.type||"unknown");
}

function classifyRecord(row){
  const type=typeName(row);
  const isVersion=Boolean(row.version_parent);
  if(isVersion) return {bucket:"EXCLUDE_VERSION",reason:"version_parent"};
  if(["dlc_addon","mod","episode","season","pack","update"].includes(type)){
    return {bucket:"EXCLUDE_NON_BASE",reason:type};
  }
  if(["bundle","expansion"].includes(type)){
    return {bucket:"REVIEW",reason:type};
  }
  // main games, ports, remakes, remasters, expanded games and standalone expansions
  // remain candidates because physical console libraries can legitimately contain them.
  return {bucket:"INCLUDE_CANDIDATE",reason:type};
}

function exactMatches(game,records){
  const q=normalizeCatalogueTitle(game.title);
  return records.filter(row=>{
    if(normalizeCatalogueTitle(row.name)===q) return true;
    return (row.alternative_names||[]).some(a=>normalizeCatalogueTitle(a.name)===q);
  });
}

const report={
  schemaVersion:1,
  provider:"IGDB",
  generatedAt:new Date().toISOString(),
  mode:"READ_ONLY_DEDUP_FILTER_BENCHMARK",
  catalogueModified:false,
  credentialsIncluded:false,
  platforms:{},
  benchmark:{seedCount:seed.length,results:[]}
};

const inventory={};
for(const [label,names] of Object.entries(platformNames)){
  const platform=await resolvePlatform(label,names);
  const fetched=await fetchAllGames(label,platform.id);
  const rows=fetched.records.map(row=>({
    igdbId:String(row.id),
    name:String(row.name||""),
    slug:row.slug||null,
    firstReleaseDate:row.first_release_date||null,
    hasCover:Boolean(row.cover?.image_id),
    alternativeNames:(row.alternative_names||[]).map(x=>String(x.name||"")).filter(Boolean),
    versionParent:row.version_parent?String(row.version_parent):null,
    versionTitle:row.version_title||null,
    gameType:typeName(row),
    parentGame:row.parent_game?String(row.parent_game):null,
    classification:classifyRecord(row)
  }));
  inventory[label]=rows;
  const buckets=rows.reduce((a,r)=>(a[r.classification.bucket]=(a[r.classification.bucket]||0)+1,a),{});
  const types=rows.reduce((a,r)=>(a[r.gameType]=(a[r.gameType]||0)+1,a),{});
  report.platforms[label]={
    igdbPlatform:{id:platform.id,name:platform.name,abbreviation:platform.abbreviation||null},
    reportedRawCount:fetched.reportedCount,
    fetchedCount:rows.length,
    classificationBuckets:buckets,
    gameTypeDistribution:types,
    versionParentCount:rows.filter(r=>r.versionParent).length,
    includeCandidateCount:rows.filter(r=>r.classification.bucket==="INCLUDE_CANDIDATE").length,
    reviewCount:rows.filter(r=>r.classification.bucket==="REVIEW").length,
    excludedCount:rows.filter(r=>r.classification.bucket.startsWith("EXCLUDE")).length
  };
}

for(const game of seed){
  const all=inventory[game.platform];
  const before=exactMatches(game,all);
  const include=all.filter(r=>r.classification.bucket==="INCLUDE_CANDIDATE");
  const review=all.filter(r=>r.classification.bucket==="REVIEW");
  const after=exactMatches(game,include);
  const afterPlusReview=exactMatches(game,[...include,...review]);
  const status=after.length===1?"SAFE_AFTER_FILTER":after.length>1?"AMBIGUOUS_AFTER_FILTER":
    afterPlusReview.length===1?"REVIEW_BUCKET_MATCH":"UNRESOLVED_AFTER_FILTER";
  report.benchmark.results.push({
    id:game.id,title:game.title,platform:game.platform,status,
    exactBeforeFilter:before.map(r=>({igdbId:r.igdbId,name:r.name,gameType:r.gameType,versionParent:r.versionParent,classification:r.classification})),
    exactAfterFilter:after.map(r=>({igdbId:r.igdbId,name:r.name,gameType:r.gameType,versionParent:r.versionParent,classification:r.classification})),
    reviewBucketMatches:afterPlusReview.filter(r=>r.classification.bucket==="REVIEW").map(r=>({igdbId:r.igdbId,name:r.name,gameType:r.gameType,classification:r.classification}))
  });
}

const statuses=report.benchmark.results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
report.benchmark.summary={
  statuses,
  safeAfterFilter:statuses.SAFE_AFTER_FILTER||0,
  ambiguousAfterFilter:statuses.AMBIGUOUS_AFTER_FILTER||0,
  reviewBucketMatch:statuses.REVIEW_BUCKET_MATCH||0,
  unresolvedAfterFilter:statuses.UNRESOLVED_AFTER_FILTER||0,
  safeByPlatform:Object.fromEntries(Object.keys(platformNames).map(platform=>[
    platform,
    report.benchmark.results.filter(r=>r.platform===platform&&r.status==="SAFE_AFTER_FILTER").length
  ])),
  problemRows:report.benchmark.results.filter(r=>r.status!=="SAFE_AFTER_FILTER")
};

const out=process.argv.find(x=>x.startsWith("--out="))?.slice(6)||`benchmarks/igdb-dedup-filter-${new Date().toISOString().slice(0,10)}.json`;
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify(report,null,2)+"\n","utf8");
console.log(`Wrote ${out}`);
console.log(JSON.stringify(report.benchmark.summary,null,2));
