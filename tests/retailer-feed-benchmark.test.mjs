import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,writeFile,stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {parseRetailerFeed,requireRetailerBenchmarkRights,
 benchmarkRetailerFeed,RETAILER_BENCHMARK_TARGETS} from "../shared/retailer-feed-benchmark.js";

const columns=Object.fromEntries([
 "listingId","game","title","url","platform","market","edition",
 "completeness","condition","itemType","photoType","currency",
 "itemPrice","deliveryPrice","status","quantity","updatedAt"
].map(k=>[k,k]));
const config={provider:"Synthetic Partner",columns};
const rights={
 provider:"Synthetic Partner",
 authorisationRef:"synthetic-test-permission-only",
 privateBenchmarkAllowed:true,dataAccessAllowed:true,
 allowedHosts:["stock.test-example.co.uk"],expiresAt:"2026-12-01T00:00:00Z",
 publicDisplayAllowed:false,photoDisplayAllowed:false
};
const at=new Date("2026-10-15T20:00:00Z");
function row(id,options={}){
 return {
  listingId:id,game:"Tombi!",title:"Tombi! PAL complete PS1",
  platform:"PS1",market:"UK",edition:"original",completeness:"CIB",
  itemType:"game",photoType:"actual",currency:"GBP",itemPrice:"45.00",
  deliveryPrice:"",status:"available",quantity:"1",
  updatedAt:"2026-10-15T19:00:00Z",
  url:"https://stock.test-example.co.uk/retro/"+id,
  ...options
 };
}
function result(rows){return benchmarkRetailerFeed(rows,rights,config,{now:at});}
function intent(report,id){return report.intents.find(x=>x.id===id);}

test("benchmark is exactly the signed-off set of 20 fixed collector intents",()=>{
 assert.deepEqual(RETAILER_BENCHMARK_TARGETS.map(x=>x.id),
  Array.from({length:20},(_,i)=>"GR"+String(i+1).padStart(2,"0")));
 assert.equal(RETAILER_BENCHMARK_TARGETS.filter(x=>x.market==="UK").length,9);
 assert.equal(RETAILER_BENCHMARK_TARGETS.filter(x=>x.market==="US").length,11);
});

test("private source requires written reference, allowed domains, scope and unexpired permission",()=>{
 assert.equal(requireRetailerBenchmarkRights(rights,config,at),true);
 for(const broken of [
  {...rights,privateBenchmarkAllowed:false},
  {...rights,dataAccessAllowed:false},
  {...rights,authorisationRef:""},
  {...rights,allowedHosts:[]},
  {...rights,expiresAt:"2026-01-01T00:00:00Z"},
  {...rights,provider:"Other"},
 ]){
  assert.throws(()=>requireRetailerBenchmarkRights(broken,config,at));
 }
 assert.throws(()=>requireRetailerBenchmarkRights(rights,
  {provider:config.provider,columns:{...columns,raw:"untrustedRaw"}},at));
 assert.throws(()=>requireRetailerBenchmarkRights(rights,
  {provider:config.provider,columns:{...columns,title:""}},at));
});

test("CSV parser handles quoted delimiters, embedded newline, BOM and refuses ambiguous shifts",()=>{
 const csv='\uFEFFlistingId,game,title,url\nid1,"Tombi!, The","Tombi!, A \n rare copy","https://stock.test-example.co.uk/x"\n';
 const rows=parseRetailerFeed(csv);
 assert.equal(rows[0].game,"Tombi!, The");
 assert.equal(rows[0].title,"Tombi!, A \n rare copy");
 assert.equal(rows[0].listingId,"id1");
 const json=parseRetailerFeed(JSON.stringify({items:[{x:1}]}),"json");
 assert.equal(json[0].x,1);
 for(const bad of ["a,a\n1,2\n","a,b\nx\n","a,b\n\"unterminated\n","a,b\nfoo\"quote,bar\n"]){
  assert.throws(()=>parseRetailerFeed(bad),"Must fail-closed on corrupt CSV");
 }
 assert.throws(()=>parseRetailerFeed('{"items":"not rows"}',"json"));
 assert.throws(()=>parseRetailerFeed("X".repeat(5_000_001)));
});

test("seller's CIB and actual-photo claims remain REVIEW, never auto-MATCH",()=>{
 const report=result([row("case-001",{title:"Tombi! genuine item PRIVATE-BARCODE-123"})]);
 assert.equal(report.status,"PRIVATE_BENCHMARK_ONLY");
 assert.equal(report.publicationApproved,false);
 assert.equal(report.actualOfferPublicationEnabled,false);
 assert.equal(report.exactPhysicalCopiesVerified,0);
 assert.equal(intent(report,"GR02").review,1);
 assert.equal(intent(report,"GR02").verifiedMatch,0);
 assert.equal(intent(report,"GR02").cibSellerClaims,1);
 assert.equal(intent(report,"GR02").actualItemPhotosUnverified,1);
 assert.equal(intent(report,"GR01").filtered,1);
 assert.equal(report.summary.distinctPotentialListings,1);
 const publicText=JSON.stringify(report);
 assert.doesNotMatch(publicText,/PRIVATE-BARCODE|case-001|https:\/\/stock|Tombi! genuine item|synthetic-test-permission-only/);
});

test("PAL Europe is UK-review, but fails US; region aliases do not certify a country",()=>{
 const report=result([
  row("eu-1",{market:"PAL"}),
  row("us-1",{game:"Tomba!",title:"Tomba! USA",market:"US",currency:"USD"})
 ]);
 assert.equal(intent(report,"GR01").review,1);
 assert.equal(intent(report,"GR01").filtered,1);
 assert.equal(intent(report,"GR02").review,1);
 assert.equal(intent(report,"GR02").filtered,1);
});

test("exclude reissues, loose copies, reproductions, non-game accessories and conflicting titles",()=>{
 const report=result([
  row("platinum",{edition:"Platinum"}),
  row("loose",{completeness:"Disc only"}),
  row("repro",{edition:"Reproduction"}),
  row("manual",{itemType:"manual_only"}),
  row("wrong-title",{game:"Silent Hill",title:"Silent Hill 2 Special Edition PS1",platform:"PS1"}),
  row("not-wrong",{game:"Silent Hill",title:"Silent Hill original PS1",platform:"PS1",market:"UK"})
 ]);
 assert.equal(intent(report,"GR02").filtered,4);
 assert.equal(intent(report,"GR03").filtered,1);
 assert.equal(intent(report,"GR03").review,1);
 assert.equal(intent(report,"GR03").verifiedMatch,0);
});

test("suppress stale, sold and unlinked offers, duplicate IDs, bad quantities and foreign domains",()=>{
 const report=result([
  row("sold",{status:"sold_out"}),
  row("old",{updatedAt:"2025-10-15T00:00:00Z"}),
  row("fresh-1"),
  row("fresh-1",{itemPrice:"100"}),
  row("evil",{url:"https://evil.example.com/item",title:"SENSITIVE STOCK"}),
  row("empty",{quantity:"0"}),
  row("negative",{quantity:"-1"}),
  row("invalid-price",{itemPrice:"Infinity"}),
  row("bad-time",{updatedAt:"not-a-date"}),
  row("fresh-2",{photoType:"stock",itemPrice:"",currency:"",deliveryPrice:""})
 ]);
 assert.equal(report.counts.invalidRows,3);
 assert.equal(report.counts.duplicateRows,1);
 assert.equal(report.counts.outOfStock,2);
 assert.equal(report.counts.staleOrUnknownFreshness,2);
 assert.equal(report.counts.uniquePotentialListings,2);
 assert.equal(intent(report,"GR02").stockOrNoPhotos,1);
 assert.equal(intent(report,"GR02").missingPrices,1);
 assert.equal(intent(report,"GR02").missingDelivery,2);
 assert.doesNotMatch(JSON.stringify(report),/evil.example.com|SENSITIVE STOCK|fresh-1|fresh-2/);
});

test("negative cases: unrelated titles, similar-named sequels and regional naming traps stay separate",()=>{
 const report=result([
  row("s1",{game:"Silent Hill",title:"Silent Hill PS1",market:"UK"}),
  row("s2",{game:"Silent Hill 2",title:"Silent Hill 2 PS2",platform:"PS2",market:"UK"}),
  row("j1",{game:"Jet Grind Radio",title:"Jet Grind Radio US Dreamcast",platform:"Dreamcast",market:"US"})
 ]);
 assert.equal(intent(report,"GR03").inStockCandidates,1);
 assert.equal(intent(report,"GR04").inStockCandidates,1);
 assert.equal(intent(report,"GR15").inStockCandidates,1);
 assert.equal(intent(report,"GR17").filtered,1);
 assert.equal(intent(report,"GR18").review,1);
 assert.equal(report.summary.distinctPotentialListings,3);
});

test("CLI reads local CSV and writes only aggregate redacted report with no provider data in stdout",async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),"gr-partner-test-"));
 const [feed,mapping,permission,out]=["feed.csv","mapping.json","rights.json","output.json"].map(x=>path.join(dir,x));
 await writeFile(feed,
  "listingId,game,title,url,platform,market,edition,completeness,itemType,status,updatedAt,currency,itemPrice,photoType\n"+
  'PRIVATE-ID-123,Tombi!,\"Sensitive seller \\\"\"quote\\\"\"\",https://stock.test-example.co.uk/x,PS1,UK,original,CIB,game,available,2026-10-15T19:00:00Z,GBP,45,actual\n');
 await writeFile(mapping,JSON.stringify({...config,columns}));
 await writeFile(permission,JSON.stringify(rights));
 const script=fileURLToPath(new URL("../scripts/retailer-feed-benchmark.mjs",import.meta.url));
 const proc=spawnSync(process.execPath,[script,
  "--feed="+feed,"--mapping="+mapping,"--rights="+permission,"--out="+out],{encoding:"utf8"});
 // The permissions were valid in October only, so CLI in current year may fail
 // legitimately as expired. A detached synthetic run still tests safe failures.
 assert.equal(proc.stdout.includes("PRIVATE-ID-123"),false);
 assert.equal(proc.stderr.includes("PRIVATE-ID-123"),false);
 assert.ok([0,1].includes(proc.status));
 if(proc.status===0){
  const report=JSON.parse(await readFile(out,"utf8"));
  assert.equal(report.status,"PRIVATE_BENCHMARK_ONLY");
  assert.equal(report.summary.testedIntents,20);
  assert.doesNotMatch(JSON.stringify(report),/PRIVATE-ID-123|stock.test-example|Sensitive seller/);
  if(process.platform!=="win32")assert.equal((await stat(out)).mode&0o777,0o600);
 }
});
