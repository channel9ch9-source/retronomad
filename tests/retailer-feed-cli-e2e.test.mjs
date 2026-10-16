import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,readFile,rm,stat} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

// Real CLI, real local files, no partner account, no network. All sample items
// and all permissions here are obviously fictional, dynamically dated fixtures.
const runner=fileURLToPath(new URL("../scripts/retailer-feed-benchmark.mjs",import.meta.url));
const provider="Fictional Testing Only";
const host="fictional-retro-example.test";
const columns=Object.fromEntries([
 "listingId","game","title","url","platform","market","edition","completeness",
 "itemType","status","updatedAt","currency","itemPrice","photoType","quantity"
].map(k=>[k,k]));
const mapping={provider,columns};
function entry(id,now,details={}){
 return {
  listingId:"FAKE-PRIVATE-ITEM-"+id,game:"Tombi!",title:"Tombi! complete PS1",
  url:"https://"+host+"/products/"+id,platform:"PS1",market:"UK",
  edition:"Original",completeness:"CIB",itemType:"game",
  status:"available",updatedAt:now.toISOString(),
  currency:"GBP",itemPrice:"41.20",photoType:"actual",quantity:"1",...details
 };
}
const toCsv=(rows)=>{
 const keys=Object.keys(rows[0]);
 function enc(x){
  const s=String(x??"");
  return /[,"\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
 }
 return keys.join(",")+"\n"+rows.map(r=>keys.map(k=>enc(r[k])).join(",")).join("\n")+"\n";
};
test("full offline retailer pipeline produces identical safe aggregate-only results from JSON and CSV",async()=>{
 const now=new Date();
 const directory=await mkdtemp(path.join(os.tmpdir(),"grailraven-fully-synthetic-"));
 const fields=["feed","mapping","rights","out"];
 const rights={
  provider,allowedHosts:[host],
  authorisationRef:"SYNTHETIC TEST ONLY -- NO REAL LICENCE",
  dataAccessAllowed:true,privateBenchmarkAllowed:true,
  publicDisplayAllowed:false,photoDisplayAllowed:false,
  expiresAt:new Date(now.valueOf()+30*86400_000).toISOString()
 };
 const stock=[
  entry("uk",now,{title:'Tombi! "original"\nPS1 box + manual'}),
  entry("us",now,{game:"Tomba!",title:"Tomba! PS1",market:"US",currency:"USD"}),
  entry("sh-platinum",now,{game:"Silent Hill",title:"Silent Hill Platinum",edition:"Platinum"}),
  entry("sh-us",now,{game:"Silent Hill",title:"Silent Hill PS1",market:"US"}),
  entry("dreamcast",now,{game:"Illbleed",platform:"Dreamcast",market:"US",title:"Illbleed"}),
  entry("jet-uk",now,{game:"Jet Set Radio",platform:"Dreamcast",market:"UK",title:"Jet Set Radio"}),
  entry("jet-us",now,{game:"Jet Grind Radio",platform:"Dreamcast",market:"US",title:"Jet Grind Radio"}),
  entry("loose",now,{game:"Suikoden II",market:"US",title:"Suikoden II disc only",completeness:"Loose"}),
  entry("cib",now,{game:"Suikoden II",market:"US",title:"Suikoden II complete"}),
  entry("sold",now,{game:"Rule of Rose",platform:"PS2",market:"US",title:"Rule of Rose",status:"sold"}),
  entry("stale",new Date(now.valueOf()-8*86400_000),{game:"Illbleed",platform:"Dreamcast",market:"US",title:"Illbleed"}),
  entry("dreamcast",now,{game:"Illbleed",platform:"Dreamcast",market:"US",title:"Illbleed duplicated"}),
  entry("unsafe-url",now,{title:"PRIVATE-SECRET-DO-NOT-PUBLISH",url:"https://external-fake.test/bad"})
 ];
 try{
  const mappingFile=path.join(directory,"map.json");
  const rightsFile=path.join(directory,"rights.json");
  await writeFile(mappingFile,JSON.stringify(mapping));
  await writeFile(rightsFile,JSON.stringify(rights));
  const reports=[];
  for(const extension of ["json","csv"]){
   const feedFile=path.join(directory,"feed."+extension);
   const outFile=path.join(directory,"report-"+extension+".json");
   await writeFile(feedFile,extension==="json"?JSON.stringify(stock):toCsv(stock));
   const args=[
    runner,"--feed="+feedFile,"--mapping="+mappingFile,
    "--rights="+rightsFile,"--out="+outFile,"--synthetic-fixture=true"
   ];
   const proc=spawnSync(process.execPath,args,{encoding:"utf8",timeout:10_000});
   assert.equal(proc.status,0,proc.stderr);
   assert.equal(proc.stderr,"");
   assert.match(proc.stdout,/PRIVATE_RETAILER_BENCHMARK_COMPLETE/);
   assert.doesNotMatch(proc.stdout,/FAKE-PRIVATE|SYNTHETIC TEST ONLY|https|@|PRIVATE-SECRET/);
   const raw=await readFile(outFile,"utf8");
   const report=JSON.parse(raw);
   assert.equal(report.fixture,true);
   assert.equal(report.status,"PRIVATE_BENCHMARK_ONLY");
   assert.equal(report.publicationApproved,false);
   assert.equal(report.actualOfferPublicationEnabled,false);
   assert.equal(report.summary.testedIntents,20);
   assert.equal(report.exactPhysicalCopiesVerified,0);
   assert.equal(report.counts.inputRows,13);
   assert.equal(report.counts.invalidRows,1);
   assert.equal(report.counts.duplicateRows,1);
   assert.equal(report.counts.outOfStock,1);
   assert.equal(report.counts.staleOrUnknownFreshness,1);
   assert.equal(report.summary.distinctPotentialListings,7);
   assert.equal(report.summary.intentsWithReviewCandidates,7);
   assert.equal(report.intents.find(x=>x.id==="GR01").review,1);
   assert.equal(report.intents.find(x=>x.id==="GR02").review,1);
   assert.equal(report.intents.find(x=>x.id==="GR03").filtered,2); // Platinum UK plus wrong-market US
   assert.equal(report.intents.find(x=>x.id==="GR04").review,1);
   assert.equal(report.intents.find(x=>x.id==="GR07").filtered,1);
   assert.equal(report.intents.find(x=>x.id==="GR07").review,1);
   assert.equal(report.intents.find(x=>x.id==="GR17").review,1);
   assert.equal(report.intents.find(x=>x.id==="GR18").review,1);
   assert.equal(report.intents.find(x=>x.id==="GR19").review,1);
   assert.ok(report.intents.every(x=>x.verifiedMatch===0));
   assert.doesNotMatch(raw,/FAKE-PRIVATE|PRIVATE-SECRET|SYNTHETIC TEST ONLY|fictional-retro-example\.test|41\.20/);
   if(process.platform!=="win32")assert.equal((await stat(outFile)).mode&0o777,0o600);
   const again=spawnSync(process.execPath,args,{encoding:"utf8",timeout:10_000});
   assert.equal(again.status,1,"Cannot overwrite existing report");
   assert.doesNotMatch(again.stderr,/FAKE-PRIVATE|PRIVATE-SECRET/);
   reports.push(report);
  }
  const stripDate=r=>({...r,generatedAt:null});
  assert.deepEqual(stripDate(reports[0]),stripDate(reports[1]));
 }finally{
  await rm(directory,{recursive:true,force:true});
 }
});
