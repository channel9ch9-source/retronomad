import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { normalizeCatalogueTitle } from "../shared/catalogue-core.js";

const CLIENT_ID=String(process.env.IGDB_CLIENT_ID||"").trim();
const CLIENT_SECRET=String(process.env.IGDB_CLIENT_SECRET||"").trim();
if(!CLIENT_ID||!CLIENT_SECRET){
  console.error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are required. Never commit the secret.");
  process.exit(2);
}

const root=process.cwd();
const canonical=JSON.parse(await fs.readFile(path.join(root,"catalogue","base-catalogue.json"),"utf8"));
const seed=canonical.games||[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function escapeQuery(value){
  return String(value).replace(/\\/g,"\\\\").replace(/"/g,'\\"');
}

function romanReviewNorm(value){
  return normalizeCatalogueTitle(value)
    .split(" ")
    .map(token=>({ii:"2",iii:"3",iv:"4",v:"5",vi:"6",vii:"7",viii:"8",ix:"9",x:"10"}[token]||token))
    .join(" ");
}

function tokenScore(query,candidate){
  const q=new Set(normalizeCatalogueTitle(query).split(" ").filter(Boolean));
  const c=new Set(normalizeCatalogueTitle(candidate).split(" ").filter(Boolean));
  if(!q.size||!c.size) return 0;
  let intersection=0;
  for(const token of q) if(c.has(token)) intersection++;
  const union=new Set([...q,...c]).size;
  return intersection/union;
}

async function getToken(){
  const url=new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id",CLIENT_ID);
  url.searchParams.set("client_secret",CLIENT_SECRET);
  url.searchParams.set("grant_type","client_credentials");
  const res=await fetch(url,{method:"POST"});
  if(!res.ok) throw new Error(`Twitch token request failed: ${res.status} ${await res.text()}`);
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

const wantedPlatforms={
  PS1:["PlayStation","PS1"],
  PS2:["PlayStation 2","PS2"],
  Dreamcast:["Dreamcast","DC"]
};

async function resolvePlatform(label,names){
  const rows=await igdb("platforms",`fields id,name,abbreviation,slug; search "${escapeQuery(names[0])}"; limit 50;`);
  const wanted=names.map(normalizeCatalogueTitle);
  const hit=rows.find(r=>wanted.includes(normalizeCatalogueTitle(r.name))||wanted.includes(normalizeCatalogueTitle(r.abbreviation)));
  if(!hit) throw new Error(`Could not resolve IGDB platform for ${label}`);
  return hit;
}

async function fetchPlatformGames(label,platform){
  const countPayload=await igdb("games/count",`where platforms = (${platform.id});`);
  const rawCount=Number(countPayload?.count||0);
  const rows=[];
  const pageSize=500;
  for(let offset=0;offset<rawCount;offset+=pageSize){
    process.stdout.write(`[${label}] fetching ${offset+1}-${Math.min(offset+pageSize,rawCount)} of ${rawCount}\n`);
    const page=await igdb(
      "games",
      `fields id,name,slug,first_release_date,cover.image_id,alternative_names.name; where platforms = (${platform.id}); sort id asc; limit ${pageSize}; offset ${offset};`
    );
    rows.push(...page);
    if(page.length<pageSize) break;
  }
  return {
    rawCount,
    records:rows.map(row=>({
      igdbId:String(row.id),
      name:String(row.name||""),
      slug:row.slug||null,
      firstReleaseDate:row.first_release_date||null,
      coverImageId:row.cover?.image_id||null,
      alternativeNames:[...new Set((row.alternative_names||[]).map(x=>String(x.name||"").trim()).filter(Boolean))]
    }))
  };
}

function buildExactIndex(records){
  const canonicalIndex=new Map();
  const aliasIndex=new Map();
  const add=(map,key,row)=>{
    if(!key) return;
    if(!map.has(key)) map.set(key,[]);
    map.get(key).push(row);
  };
  for(const row of records){
    add(canonicalIndex,normalizeCatalogueTitle(row.name),row);
    for(const alias of row.alternativeNames) add(aliasIndex,normalizeCatalogueTitle(alias),row);
  }
  return {canonicalIndex,aliasIndex};
}

function uniqueById(rows){
  const map=new Map();
  for(const row of rows||[]) map.set(row.igdbId,row);
  return [...map.values()];
}

function compact(row){
  return row?{
    igdbId:row.igdbId,
    name:row.name,
    slug:row.slug,
    firstReleaseDate:row.firstReleaseDate,
    hasCover:Boolean(row.coverImageId),
    alternativeNames:row.alternativeNames
  }:null;
}

function reviewCandidates(title,records){
  const reviewNorm=romanReviewNorm(title);
  return records
    .map(row=>{
      const names=[row.name,...row.alternativeNames];
      let score=Math.max(...names.map(name=>{
        const exactRoman=romanReviewNorm(name)===reviewNorm?0.99:0;
        return Math.max(exactRoman,tokenScore(title,name));
      }));
      return {row,score};
    })
    .filter(x=>x.score>=0.45)
    .sort((a,b)=>b.score-a.score||a.row.name.localeCompare(b.row.name))
    .slice(0,5)
    .map(x=>({score:Number(x.score.toFixed(3)),...compact(x.row)}));
}

function resolveSeedGame(game,records,index){
  const key=normalizeCatalogueTitle(game.title);
  const canonicalHits=index.canonicalIndex.get(key)||[];
  const aliasHits=index.aliasIndex.get(key)||[];
  const exact=uniqueById([...canonicalHits,...aliasHits]);

  let status="UNRESOLVED";
  let matched=null;
  if(exact.length===1){
    matched=exact[0];
    status=canonicalHits.some(x=>x.igdbId===matched.igdbId)?"EXACT_CANONICAL":"EXACT_ALIAS";
  }else if(exact.length>1){
    status="AMBIGUOUS_EXACT";
  }

  return {
    id:game.id,
    title:game.title,
    platform:game.platform,
    status,
    exactMatches:exact.map(compact),
    match:compact(matched),
    reviewCandidates:status==="UNRESOLVED"?reviewCandidates(game.title,records):[]
  };
}

function collisionGroups(index){
  const canonical=[];
  for(const [normalized,rows] of index.canonicalIndex){
    const unique=uniqueById(rows);
    if(unique.length>1) canonical.push({normalized,count:unique.length,records:unique.map(compact)});
  }
  const aliases=[];
  for(const [normalized,rows] of index.aliasIndex){
    const unique=uniqueById(rows);
    if(unique.length>1) aliases.push({normalized,count:unique.length,records:unique.map(compact)});
  }
  canonical.sort((a,b)=>b.count-a.count||a.normalized.localeCompare(b.normalized));
  aliases.sort((a,b)=>b.count-a.count||a.normalized.localeCompare(b.normalized));
  return {canonical,aliases};
}

const report={
  schemaVersion:1,
  provider:"IGDB",
  generatedAt:new Date().toISOString(),
  mode:"READ_ONLY_PLATFORM_INVENTORY",
  credentialsIncluded:false,
  catalogueModified:false,
  platforms:{},
  benchmark:{seedCount:seed.length,results:[]}
};

const inventories={};
for(const [label,names] of Object.entries(wantedPlatforms)){
  const platform=await resolvePlatform(label,names);
  const inventory=await fetchPlatformGames(label,platform);
  const index=buildExactIndex(inventory.records);
  const collisions=collisionGroups(index);
  inventories[label]={records:inventory.records,index};
  report.platforms[label]={
    igdbPlatform:{id:platform.id,name:platform.name,abbreviation:platform.abbreviation||null,slug:platform.slug||null},
    reportedRawCount:inventory.rawCount,
    fetchedCount:inventory.records.length,
    uniqueIgdbIds:new Set(inventory.records.map(x=>x.igdbId)).size,
    uniqueNormalizedCanonicalNames:index.canonicalIndex.size,
    recordsWithAliases:inventory.records.filter(x=>x.alternativeNames.length).length,
    aliasCount:inventory.records.reduce((sum,x)=>sum+x.alternativeNames.length,0),
    recordsWithCover:inventory.records.filter(x=>x.coverImageId).length,
    recordsWithReleaseDate:inventory.records.filter(x=>x.firstReleaseDate).length,
    canonicalCollisionGroupCount:collisions.canonical.length,
    aliasCollisionGroupCount:collisions.aliases.length,
    canonicalCollisionSamples:collisions.canonical.slice(0,50),
    aliasCollisionSamples:collisions.aliases.slice(0,50)
  };
}

for(const game of seed){
  const inv=inventories[game.platform];
  report.benchmark.results.push(resolveSeedGame(game,inv.records,inv.index));
}

const results=report.benchmark.results;
const counts=results.reduce((acc,row)=>(acc[row.status]=(acc[row.status]||0)+1,acc),{});
report.benchmark.summary={
  statuses:counts,
  safeExactMatches:(counts.EXACT_CANONICAL||0)+(counts.EXACT_ALIAS||0),
  ambiguousExact:counts.AMBIGUOUS_EXACT||0,
  unresolved:counts.UNRESOLVED||0,
  safeByPlatform:Object.fromEntries(Object.keys(wantedPlatforms).map(platform=>[
    platform,
    results.filter(x=>x.platform===platform&&(x.status==="EXACT_CANONICAL"||x.status==="EXACT_ALIAS")).length
  ])),
  unresolvedRows:results.filter(x=>x.status==="UNRESOLVED"||x.status==="AMBIGUOUS_EXACT")
};

const out=process.argv.find(x=>x.startsWith("--out="))?.slice(6)||`benchmarks/igdb-platform-inventory-${new Date().toISOString().slice(0,10)}.json`;
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify(report,null,2)+"\n","utf8");
console.log(`Wrote ${out}`);
console.log(JSON.stringify(report.benchmark.summary,null,2));
