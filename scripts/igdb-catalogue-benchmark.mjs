import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CLIENT_ID=String(process.env.IGDB_CLIENT_ID||"").trim();
const CLIENT_SECRET=String(process.env.IGDB_CLIENT_SECRET||"").trim();
if(!CLIENT_ID||!CLIENT_SECRET){
  console.error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are required. Never commit the secret.");
  process.exit(2);
}

const root=process.cwd();
const catalogue=JSON.parse(await fs.readFile(path.join(root,"catalogue","base-catalogue.json"),"utf8"));
const seed=catalogue.games||[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function norm(v){
  return String(v||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[’']/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}
function escapeQuery(v){return String(v).replace(/\\/g,"\\\\").replace(/"/g,'\\"');}

async function getToken(){
  const url=new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id",CLIENT_ID);
  url.searchParams.set("client_secret",CLIENT_SECRET);
  url.searchParams.set("grant_type","client_credentials");
  const res=await fetch(url,{method:"POST"});
  if(!res.ok) throw new Error(`Twitch token request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

const token=await getToken();
async function igdb(endpoint,body){
  const res=await fetch(`https://api.igdb.com/v4/${endpoint}`,{
    method:"POST",
    headers:{
      "Accept":"application/json",
      "Client-ID":CLIENT_ID,
      "Authorization":`Bearer ${token.access_token}`,
      "Content-Type":"text/plain"
    },
    body
  });
  if(!res.ok) throw new Error(`IGDB ${endpoint} failed: ${res.status} ${await res.text()}`);
  const json=await res.json();
  await sleep(275); // keep below IGDB's documented 4 requests/sec rate limit
  return json;
}

const wantedPlatforms={
  PS1:["PlayStation","PS1"],
  PS2:["PlayStation 2","PS2"],
  Dreamcast:["Dreamcast","DC"]
};

async function resolvePlatform(label,names){
  const rows=await igdb("platforms",`fields id,name,abbreviation,slug; search "${escapeQuery(names[0])}"; limit 50;`);
  const wanted=names.map(norm);
  const hit=rows.find(r=>wanted.includes(norm(r.name))||wanted.includes(norm(r.abbreviation)));
  if(!hit) throw new Error(`Could not resolve IGDB platform for ${label}`);
  return hit;
}

const platforms={};
for(const [label,names] of Object.entries(wantedPlatforms)) platforms[label]=await resolvePlatform(label,names);

async function platformCount(platformId){
  const rows=await igdb("games/count",`where platforms = (${platformId});`);
  return Number(rows?.count||0);
}

async function searchSeed(game){
  const platform=platforms[game.platform];
  const rows=await igdb("games",
    `fields id,name,slug,first_release_date,cover.image_id,alternative_names.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher; search "${escapeQuery(game.title)}"; where platforms = (${platform.id}); limit 20;`
  );
  const q=norm(game.title);
  const ranked=rows.map(r=>{
    const name=norm(r.name);
    const aliases=(r.alternative_names||[]).map(a=>norm(a.name));
    let score=0;
    if(name===q) score=100;
    else if(aliases.includes(q)) score=95;
    else if(name.startsWith(q)) score=80;
    else if(name.includes(q)) score=60;
    return {row:r,score};
  }).sort((a,b)=>b.score-a.score);
  const best=ranked[0]?.score?ranked[0]:null;
  return {
    id:game.id,title:game.title,platform:game.platform,
    status:best&&best.score>=95?"EXACT_NAME_OR_ALIAS":best?"CANDIDATE_REVIEW":"NO_MATCH",
    score:best?.score||0,
    igdb:best?{
      id:best.row.id,
      name:best.row.name,
      slug:best.row.slug||null,
      firstReleaseDate:best.row.first_release_date||null,
      hasCover:Boolean(best.row.cover?.image_id),
      alternativeNames:(best.row.alternative_names||[]).map(x=>x.name).filter(Boolean),
      companies:(best.row.involved_companies||[]).map(x=>({
        name:x.company?.name||null,
        developer:Boolean(x.developer),
        publisher:Boolean(x.publisher)
      })).filter(x=>x.name)
    }:null,
    candidateNames:rows.slice(0,5).map(x=>x.name)
  };
}

const report={
  schemaVersion:1,
  provider:"IGDB",
  generatedAt:new Date().toISOString(),
  credentialsIncluded:false,
  mode:"READ_ONLY_COVERAGE_BENCHMARK",
  platforms:{},
  benchmark:{seedCount:seed.length,results:[]}
};

for(const [label,p] of Object.entries(platforms)){
  report.platforms[label]={id:p.id,name:p.name,abbreviation:p.abbreviation||null,slug:p.slug||null,rawGameCount:await platformCount(p.id)};
}

for(let i=0;i<seed.length;i++){
  const game=seed[i];
  process.stdout.write(`[${i+1}/${seed.length}] ${game.title} · ${game.platform}\n`);
  try{report.benchmark.results.push(await searchSeed(game));}
  catch(error){report.benchmark.results.push({id:game.id,title:game.title,platform:game.platform,status:"ERROR",error:String(error.message||error)});}
}

const results=report.benchmark.results;
report.benchmark.summary={
  statuses:results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{}),
  exactOrAliasMatches:results.filter(r=>r.status==="EXACT_NAME_OR_ALIAS").length,
  matchedWithCover:results.filter(r=>r.igdb?.hasCover).length,
  matchedWithAlternativeNames:results.filter(r=>(r.igdb?.alternativeNames||[]).length>0).length,
  matchedWithCompanyData:results.filter(r=>(r.igdb?.companies||[]).length>0).length,
  matchedWithReleaseDate:results.filter(r=>r.igdb?.firstReleaseDate).length
};

const out=process.argv.find(x=>x.startsWith("--out="))?.slice(6)||`benchmarks/igdb-catalogue-${new Date().toISOString().slice(0,10)}.json`;
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify(report,null,2)+"\n","utf8");
console.log(`Wrote ${out}`);
