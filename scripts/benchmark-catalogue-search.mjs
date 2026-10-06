import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";
import { buildCatalogueSearchIndex } from "../shared/catalogue-core.js";
import { rankCatalogueMatches, resolveCatalogueQuery } from "../shared/catalogue-search-core.js";

function arg(name,fallback=null){
  const prefix="--"+name+"=";
  return process.argv.find(x=>x.startsWith(prefix))?.slice(prefix.length)??fallback;
}

const input=arg("input");
const output=arg("output","benchmarks/full-catalogue-search-benchmark.json");
const markdown=arg("markdown",output.replace(/\.json$/,".md"));

if(!input){
  console.error("Usage: node scripts/benchmark-catalogue-search.mjs --input=<catalogue.json> [--output=report.json]");
  process.exit(2);
}

const catalogue=JSON.parse(await fs.readFile(input,"utf8"));
const searchConfig=JSON.parse(await fs.readFile(new URL("../catalogue/search-aliases.json",import.meta.url),"utf8"));

const buildStarted=performance.now();
const index=buildCatalogueSearchIndex(
  catalogue,
  searchConfig.aliases||{},
  searchConfig.suppressAliases||{}
);
const buildMs=performance.now()-buildStarted;
const indexBytes=Buffer.byteLength(JSON.stringify(index),"utf8");

const cases=[
  {group:"exact",query:"Silent Hill",platform:"PS1",expectTop:"ps1:silent-hill"},
  {group:"partial",query:"silent h",platform:"PS1",expectTop:"ps1:silent-hill"},
  {group:"abbreviation",query:"FF7",platform:"PS1",expectTop:"ps1:final-fantasy-vii"},
  {group:"abbreviation",query:"FFVII",platform:"PS1",expectTop:"ps1:final-fantasy-vii"},
  {group:"numeral",query:"Final Fantasy 7",platform:"PS1",expectTop:"ps1:final-fantasy-vii"},
  {group:"ambiguity",query:"MGS3",platform:"PS2",expectFirstN:["ps2:metal-gear-solid-3-snake-eater","ps2:metal-gear-solid-3-subsistence"],expectStatus:"ambiguous"},
  {group:"duplicate-platform",query:"RE2",platform:"",expectFirstN:["ps1:resident-evil-2","dreamcast:resident-evil-2"],expectStatus:"ambiguous"},
  {group:"platform-filter",query:"RE2",platform:"PS1",expectTop:"ps1:resident-evil-2"},
  {group:"regional",query:"Jet Grind Radio",platform:"Dreamcast",expectTop:"dreamcast:jet-set-radio"},
  {group:"abbreviation",query:"JSR",platform:"Dreamcast",expectTop:"dreamcast:jet-set-radio"},
  {group:"regional",query:"Siren",platform:"PS2",expectTop:"ps2:forbidden-siren"},
  {group:"regional",query:"Fatal Frame 3",platform:"PS2",expectTop:"ps2:project-zero-3-the-tormented"},
  {group:"regional",query:"SMT3",platform:"PS2",expectTop:"ps2:shin-megami-tensei-lucifer-s-call"},
  {group:"regional",query:"Nocturne",platform:"PS2",expectTop:"ps2:shin-megami-tensei-lucifer-s-call"},
  {group:"regional",query:"MediEvil II",platform:"PS1",expectTop:"ps1:medievil-2"},
  {group:"regional",query:"ObsCure: The Aftermath",platform:"PS2",expectTop:"ps2:obscure-ii"},
  {group:"numeral",query:"Project Zero III",platform:"PS2",expectTop:"ps2:project-zero-3-the-tormented"},
  {group:"punctuation",query:"Marvel vs Capcom 2",platform:"PS2",expectTop:"ps2:marvel-vs-capcom-2-new-age-of-heroes"},
  {group:"partial",query:"Castlevania Symphony",platform:"PS1",expectTop:"ps1:castlevania-symphony-of-the-night"},
  {group:"typo",query:"Silnt Hill",platform:"PS1",expectTop:"ps1:silent-hill",expectStatus:"corrected"},
  {group:"typo",query:"Resdient Evil 2",platform:"PS1",expectTop:"ps1:resident-evil-2",expectStatus:"corrected"},
  {group:"token-subsequence",query:"metal gear 3",platform:"PS2",expectTopAny:["ps2:metal-gear-solid-3-snake-eater","ps2:metal-gear-solid-3-subsistence"]},
  {group:"curated-alias",query:"Crash 3",platform:"PS1",expectTop:"ps1:crash-bandicoot-3-warped"},
  {group:"regional",query:"Biohazard 2",platform:"",expectFirstN:["ps1:resident-evil-2","dreamcast:resident-evil-2"]}
];

const failures=[];
const caseResults=[];

for(const testCase of cases){
  const rows=rankCatalogueMatches(index,testCase.query,{platform:testCase.platform,limit:10});
  const ids=rows.map(row=>row.game.id);
  const top=ids[0]||null;
  let ok=true;

  if(testCase.expectTop&&top!==testCase.expectTop)ok=false;
  if(testCase.expectTopAny&&!testCase.expectTopAny.includes(top))ok=false;

  if(testCase.expectFirstN){
    const first=ids.slice(0,testCase.expectFirstN.length);
    const actual=new Set(first);
    if(testCase.expectFirstN.some(id=>!actual.has(id)))ok=false;
  }

  const resolution=resolveCatalogueQuery(index,testCase.query,{platform:testCase.platform});
  if(testCase.expectStatus&&resolution.status!==testCase.expectStatus)ok=false;

  const rendered=rows.slice(0,5).map(row=>({
    id:row.game.id,
    title:row.game.title,
    platform:row.game.platform,
    score:row.score,
    reason:row.reason,
    matchedText:row.matchedText
  }));

  if(!ok){
    failures.push({
      query:testCase.query,
      platform:testCase.platform||null,
      expected:testCase,
      actualTop:top,
      actualStatus:resolution.status,
      results:rendered
    });
  }

  caseResults.push({
    ...testCase,
    ok,
    actualStatus:resolution.status,
    results:rendered
  });
}

for(let warm=0;warm<2;warm++){
  for(const testCase of cases){
    rankCatalogueMatches(index,testCase.query,{platform:testCase.platform,limit:8});
  }
}

const samples=[];
for(let round=0;round<8;round++){
  for(const testCase of cases){
    const started=performance.now();
    rankCatalogueMatches(index,testCase.query,{platform:testCase.platform,limit:8});
    samples.push(performance.now()-started);
  }
}
samples.sort((a,b)=>a-b);

function percentile(p){
  return samples[Math.min(samples.length-1,Math.floor((samples.length-1)*p))];
}

const performanceSummary={
  samples:samples.length,
  medianMs:Number(percentile(.5).toFixed(2)),
  p95Ms:Number(percentile(.95).toFixed(2)),
  maxMs:Number(samples[samples.length-1].toFixed(2)),
  buildIndexMs:Number(buildMs.toFixed(2))
};

if(catalogue.games.length<8000){
  failures.push({type:"catalogue-size",message:"Expected full catalogue, got "+catalogue.games.length});
}
if(indexBytes>2*1024*1024){
  failures.push({type:"index-size",message:"Search index exceeds 2 MiB: "+indexBytes});
}
if(performanceSummary.medianMs>60){
  failures.push({type:"performance",message:"Median search time too high: "+performanceSummary.medianMs+" ms"});
}
if(performanceSummary.p95Ms>120){
  failures.push({type:"performance",message:"P95 search time too high: "+performanceSummary.p95Ms+" ms"});
}
if(performanceSummary.maxMs>250){
  failures.push({type:"performance",message:"Maximum search time too high: "+performanceSummary.maxMs+" ms"});
}

const groups={};
for(const row of caseResults){
  if(!groups[row.group])groups[row.group]={total:0,passed:0};
  groups[row.group].total++;
  if(row.ok)groups[row.group].passed++;
}

const report={
  generatedAt:new Date().toISOString(),
  input:path.basename(input),
  catalogueGames:catalogue.games.length,
  indexGames:index.length,
  searchIndexBytes:indexBytes,
  searchIndexMiB:Number((indexBytes/1024/1024).toFixed(3)),
  quality:{
    passed:caseResults.filter(x=>x.ok).length,
    total:caseResults.length,
    groups
  },
  performance:performanceSummary,
  cases:caseResults,
  failures
};

await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,JSON.stringify(report,null,2)+"\n","utf8");

const md=[
  "# Full Catalogue Search Benchmark",
  "",
  "Generated: "+report.generatedAt,
  "",
  "- Catalogue games: **"+report.catalogueGames.toLocaleString()+"**",
  "- Search index: **"+report.searchIndexMiB+" MiB**",
  "- Quality checks: **"+report.quality.passed+"/"+report.quality.total+" passed**",
  "- Median query: **"+report.performance.medianMs+" ms**",
  "- P95 query: **"+report.performance.p95Ms+" ms**",
  "- Max query: **"+report.performance.maxMs+" ms**",
  "",
  "## Query checks",
  "",
  "| Query | Platform | Result | Top match | Resolution |",
  "| --- | --- | --- | --- | --- |"
];

for(const row of caseResults){
  const top=row.results[0];
  md.push(
    "| "+row.query.replaceAll("|","\\|")+
    " | "+(row.platform||"Any")+
    " | "+(row.ok?"PASS":"FAIL")+
    " | "+(top?top.title+" ["+top.platform+"]":"—")+
    " | "+row.actualStatus+" |"
  );
}

md.push("");
if(failures.length){
  md.push("## Failures","","~~~json",JSON.stringify(failures,null,2),"~~~");
}else{
  md.push("## Result","","All benchmark checks passed.");
}
md.push("");

await fs.writeFile(markdown,md.join("\n"),"utf8");

console.log(JSON.stringify({
  valid:failures.length===0,
  catalogueGames:report.catalogueGames,
  searchIndexMiB:report.searchIndexMiB,
  quality:report.quality,
  performance:report.performance,
  output,
  markdown
},null,2));

if(failures.length)process.exit(1);
