import test from "node:test";
import assert from "node:assert/strict";
import {reconcileIgdbCatalogueParity,selectPalScoutParitySeeds} from "../shared/igdb-catalogue-parity.js";

const labels=["PS1","PS2","Dreamcast"];
function fixture(){
 const seedGames=[],apiGames=[],csvRecords=[];
 for(let i=1;i<=100;i++){
  const platform=i<=40?labels[0]:i<=80?labels[1]:labels[2];
  const title="Synthetic Game "+i;
  const game={id:platform.toLowerCase()+":synthetic-"+i,title,platform,aliases:[],releaseYear:2000,
   externalRefs:{igdb:String(i)},releaseIntelligence:{coverage:"PALSCOUT_DEEP"}};
  seedGames.push({...game,externalRefs:{},releaseIntelligence:{coverage:"PALSCOUT_DEEP"}});
  apiGames.push(game);
  csvRecords.push({id:i,name:title,platforms:[platform],aliases:[],typeBucket:"INCLUDE_CANDIDATE",
   gameTypeLabel:"Main Game",releaseYearByPlatform:{[platform]:2000}});
 }
 const extra={id:101,name:"Additional Game",platforms:["PS1","PS2"],aliases:["Bonus Alias"],typeBucket:"INCLUDE_CANDIDATE",
  gameTypeLabel:"Main Game",releaseYearByPlatform:{PS1:1998,PS2:2000}};
 csvRecords.push(extra);
 for(const platform of extra.platforms)apiGames.push({
  id:platform.toLowerCase()+":additional-game",title:extra.name,platform,aliases:["Bonus Alias"],
  releaseYear:extra.releaseYearByPlatform[platform],externalRefs:{igdb:"101"},releaseIntelligence:{coverage:"BASE_ONLY"}
 });
 const mappings={seedMappings:Array.from({length:9},(_,i)=>({
  seedId:seedGames[i].id,platform:seedGames[i].platform,igdbId:String(i+1),providerTitle:seedGames[i].title
 }))};
 return {csvRecords,apiCatalogue:{games:apiGames},seedCatalogue:{games:seedGames},mappings};
}
test("private parity reconciles the 100 PALScout seeds, nine curated mappings and platform reuse",()=>{
 const f=fixture(),r=reconcileIgdbCatalogueParity(f);
 assert.equal(r.status,"PARITY_PASS");
 assert.equal(r.checks.preservedSeeds,100);
 assert.equal(r.checks.explicitMappingCount,9);
 assert.equal(r.csvAttachedUniqueGames,101);
 assert.equal(r.apiCandidateCount,102);
 assert.equal(r.platforms.PS1.apiBaseOnly,1);
 assert.equal(r.platforms.PS2.apiBaseOnly,1);
 assert.equal(r.checks.selectedCsvMissingFromApi,0);
 assert.equal(r.aggregateOnly,true);
 assert.ok(!JSON.stringify(r).includes("Bonus Alias"));
 assert.ok(!JSON.stringify(r).includes("Additional Game"));
});
test("parity catches missing base releases and changed catalogue seed identities",()=>{
 const f=fixture();
 f.apiCatalogue.games=f.apiCatalogue.games.filter(g=>g.externalRefs.igdb!=="101");
 f.apiCatalogue.games[0].title="Retitled seed";
 const r=reconcileIgdbCatalogueParity(f);
 assert.equal(r.status,"REVIEW_REQUIRED");
 assert.equal(r.checks.changedSeedIdentity,1);
 assert.equal(r.checks.selectedCsvMissingFromApi,2);
 assert.ok(r.failedChecks.includes("100_PALSCOUT_SEED_GUARD"));
});
test("parity flags excluded type references, year, title and alias differences",()=>{
 const f=fixture();
 f.csvRecords.find(g=>g.id===1).typeBucket="EXCLUDE_VERSION";
 f.csvRecords.find(g=>g.id===101).name="Different Provider Name";
 f.apiCatalogue.games.find(g=>g.externalRefs.igdb==="101").releaseYear=1999;
 f.apiCatalogue.games.find(g=>g.externalRefs.igdb==="101").aliases=[];
 const r=reconcileIgdbCatalogueParity(f);
 assert.equal(r.status,"REVIEW_REQUIRED");
 assert.equal(r.checks.apiRefsExcluded,1);
 assert.equal(r.checks.apiBaseYearDrift,1);
 assert.equal(r.checks.apiBaseTitleDrift,2);
 assert.equal(r.checks.apiBaseMissingAliases,1);
});
test("CSV unique Main Game wins same-title port; ambiguous duplicate main-game title is held",()=>{
 const f=fixture();
 f.csvRecords.push({id:110,name:"Additional Game",platforms:["PS1"],aliases:[],
  typeBucket:"INCLUDE_CANDIDATE",gameTypeLabel:"Port",releaseYearByPlatform:{PS1:2000}});
 const pass=reconcileIgdbCatalogueParity(f);
 assert.equal(pass.status,"PARITY_PASS");
 assert.equal(pass.platforms.PS1.csvSuppressedTitleRows,1);
 f.csvRecords.push({id:111,name:"Additional Game",platforms:["PS1"],aliases:[],
  typeBucket:"INCLUDE_CANDIDATE",gameTypeLabel:"Main Game",releaseYearByPlatform:{PS1:2000}});
 const held=reconcileIgdbCatalogueParity(f);
 assert.equal(held.status,"REVIEW_REQUIRED");
 assert.equal(held.platforms.PS1.csvHeldTitleRows,3);
});
test("mismatching explicit provider title fails closed without provider titles in report",()=>{
 const f=fixture();
 f.mappings.seedMappings[0].providerTitle="Wrong mapping secret title";
 const result=reconcileIgdbCatalogueParity(f);
 assert.equal(result.status,"REVIEW_REQUIRED");
 assert.equal(result.checks.mappingWrongTitle,1);
 assert.ok(!JSON.stringify(result).includes("Wrong mapping secret title"));
});

test("seed-only private API rebuild ignores thousands of previously imported base records",()=>{
 const f=fixture();
 const historicBase=Array.from({length:8362},(_,i)=>({
  id:"ps1:historic-base-"+i,title:"Old base "+i,platform:"PS1",
  releaseIntelligence:{coverage:"BASE_ONLY"}
 }));
 const source={schemaVersion:1,games:[...f.seedCatalogue.games,...historicBase]};
 const selected=selectPalScoutParitySeeds(source);
 assert.equal(source.games.length,8462);
 assert.equal(selected.games.length,100);
 assert.equal(selected.games.every(g=>g.releaseIntelligence.coverage==="PALSCOUT_DEEP"),true);
 assert.equal(source.games.length,8462);
 assert.throws(()=>selectPalScoutParitySeeds({games:historicBase}),/100 protected/);
});


test("private reconciliation explains missing CSV selections from held-title review evidence",()=>{
 const f=fixture();
 const base=f.apiCatalogue.games.find(g=>g.platform==="PS1"&&g.externalRefs.igdb==="101");
 assert.ok(base);
 f.apiCatalogue.games=f.apiCatalogue.games.filter(g=>g!==base);
 const p={fetched:0,includeCandidates:0,selectedCanonicalRecords:0};
 const apiDryReview={
  mergeSummary:{
   proposedTotalGames:f.apiCatalogue.games.length,heldProviderRecords:1,
   suppressedSameTitleRecords:0,seedAmbiguities:0,idCollisions:0
  },
  platforms:{PS1:p,PS2:p,Dreamcast:p},
  review:{
   ambiguousProviderTitleGroups:[{
    platform:"PS1",decision:"HOLD_AMBIGUOUS_SAME_TITLE",selectedIgdbId:null,
    records:[{igdbId:101,name:"Private record never exported"}]
   }],seedAmbiguities:[],idCollisions:[]
  }
 };
 const result=reconcileIgdbCatalogueParity({...f,apiDryReview});
 assert.equal(result.status,"REVIEW_REQUIRED");
 assert.equal(result.checks.selectedCsvMissingFromApi,1);
 assert.equal(result.diagnostics.missingSelectedCsvPair.apiHeldAmbiguousCanonicalTitle,1);
 assert.equal(result.diagnostics.missingSelectedCsvPair.noReviewEvidenceOfCause,0);
 assert.equal(result.diagnostics.reviewEvidenceAvailable,true);
 assert.ok(!JSON.stringify(result).includes("Private record never exported"));
 assert.throws(()=>reconcileIgdbCatalogueParity({
  ...f,apiDryReview:{...apiDryReview,mergeSummary:{proposedTotalGames:999}}
 }),/does not match/);
});
test("private reconciliation separates CSV-only alias enrichment from API-only names",()=>{
 const f=fixture();
 const row=f.csvRecords.find(g=>g.id===101);
 row.aliases.push("Extra CSV name", "Another alias");
 const result=reconcileIgdbCatalogueParity(f);
 assert.equal(result.checks.apiBaseMissingAliases,2);
 assert.equal(result.diagnostics.aliases.csvAdditionalAliasCount,4);
 assert.equal(result.diagnostics.aliases.apiBaseWithCsvAdditionalAliases,2);
 assert.equal(result.diagnostics.aliases.apiBaseWithApiAdditionalAliases,0);
 assert.ok(!JSON.stringify(result).includes("Extra CSV name"));
});
test("private reconciliation counts API provider references absent from CSV separately",()=>{
 const f=fixture();
 const item=f.apiCatalogue.games.find(g=>g.platform==="PS1"&&g.externalRefs.igdb==="101");
 item.externalRefs.igdb="9999";
 const result=reconcileIgdbCatalogueParity(f);
 assert.equal(result.checks.apiRefsAbsentFromCsv,1);
 assert.equal(result.diagnostics.missingCsvReference.sourceOnlyNewIdentity,1);
 assert.equal(result.diagnostics.missingCsvReference.affectedBaseOnly,1);
 assert.equal(result.diagnostics.missingSelectedCsvPair.matchesExistingDeepSeedTitleOrAlias,0);
 assert.ok(!JSON.stringify(result).includes("9999"));
});
