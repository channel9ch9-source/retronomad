import {normalizeCatalogueTitle} from "./catalogue-core.js";

// Only counts leave the private runner. Neither provider titles nor IDs are exported.
const PLATFORMS=["PS1","PS2","Dreamcast"];
const key=(platform,id)=>platform+"|"+String(id);
const countOf=(rows,predicate)=>rows.filter(predicate).length;
const norm=normalizeCatalogueTitle;
function requireDocument(document,label){
 if(!document||!Array.isArray(document.games))throw Error("Missing private "+label+" catalogue");
}
function requireRecordId(value){
 const id=String(value??"").trim();
 if(!/^[1-9][0-9]*$/.test(id))throw Error("Invalid private IGDB provider reference");
 return id;
}
function perPlatform(){
 return Object.fromEntries(PLATFORMS.map(p=>[p,{
  csvAttached:0,csvInclude:0,csvReview:0,csvExcluded:0,
  csvSelectedAfterTitleDedup:0,csvHeldTitleRows:0,csvSuppressedTitleRows:0,
  apiEntries:0,apiDeepSeeds:0,apiBaseOnly:0,
  apiRefsAbsentFromCsv:0,apiRefsExcluded:0,
  apiBaseTitleDrift:0,apiBaseYearDrift:0,apiBaseMissingAliases:0,
  selectedCsvMissingFromApi:0
 }]));
}
function selectCsvTitles(records,platform,stats){
 const groups=new Map();
 for(const record of records){
  if(record.typeBucket!=="INCLUDE_CANDIDATE"||!record.platforms.includes(platform))continue;
  const name=norm(record.name);
  if(!name)throw Error("Empty private IGDB normalized name");
  if(!groups.has(name))groups.set(name,[]);
  groups.get(name).push(record);
 }
 const selected=[];
 for(const group of groups.values()){
  if(group.length===1){selected.push(group[0]);continue;}
  const main=group.filter(r=>norm(r.gameTypeLabel)==="main game");
  if(main.length===1){
   selected.push(main[0]);
   stats.csvSuppressedTitleRows+=group.length-1;
  }else stats.csvHeldTitleRows+=group.length;
 }
 stats.csvSelectedAfterTitleDedup=selected.length;
 return selected;
}
export function reconcileIgdbCatalogueParity({csvRecords,apiCatalogue,seedCatalogue,mappings}){
 if(!Array.isArray(csvRecords)||!csvRecords.length)throw Error("No private CSV records");
 requireDocument(apiCatalogue,"API candidate");
 requireDocument(seedCatalogue,"PALScout seed");
 if(!Array.isArray(mappings?.seedMappings))throw Error("Missing private explicit seed mappings");
 const platforms=perPlatform();
 const csvByPair=new Map();
 let csvIncluded=0,csvReview=0,csvExcluded=0;
 for(const record of csvRecords){
  const id=requireRecordId(record.id);
  if(!Array.isArray(record.platforms)||!record.platforms.length)throw Error("CSV platform attachment missing");
  if(!["INCLUDE_CANDIDATE","REVIEW","EXCLUDE_VERSION","EXCLUDE_NON_BASE"].includes(record.typeBucket))
   throw Error("Unknown CSV game-type bucket");
  if(record.typeBucket==="INCLUDE_CANDIDATE")csvIncluded++;
  else if(record.typeBucket==="REVIEW")csvReview++;
  else csvExcluded++;
  for(const platform of record.platforms){
   if(!Object.hasOwn(platforms,platform))throw Error("Unexpected CSV launch platform");
   const k=key(platform,id);
   if(csvByPair.has(k))throw Error("Duplicate CSV provider/platform pair");
   csvByPair.set(k,record);
   const s=platforms[platform];s.csvAttached++;
   if(record.typeBucket==="INCLUDE_CANDIDATE")s.csvInclude++;
   else if(record.typeBucket==="REVIEW")s.csvReview++;
   else s.csvExcluded++;
  }
 }
 const selectedPairs=new Set();
 for(const platform of PLATFORMS){
  const selected=selectCsvTitles(csvRecords,platform,platforms[platform]);
  for(const row of selected)selectedPairs.add(key(platform,row.id));
 }
 const seedById=new Map();
 for(const original of seedCatalogue.games){
  if(seedById.has(original.id))throw Error("Duplicate private PALScout seed ID");
  seedById.set(original.id,original);
 }
 const apiByPair=new Map(),apiById=new Map();
 let preservedSeeds=0,changedSeedIdentity=0,unmappedSeeds=0,duplicateApiRefs=0;
 let invalidApiRef=0,apiMissingCsv=0,apiExcludedRef=0,apiTitleDrift=0,apiYearDrift=0,apiMissingAliases=0;
 let apiNonselected=0;
 for(const game of apiCatalogue.games){
  if(!Object.hasOwn(platforms,game.platform))throw Error("Unexpected API launch platform");
  if(apiById.has(game.id))throw Error("Duplicate API canonical ID");
  apiById.set(game.id,game);
  const stats=platforms[game.platform];stats.apiEntries++;
  const seed=seedById.get(game.id);
  if(seed){
   if(seed.title===game.title && seed.platform===game.platform
      && game.releaseIntelligence?.coverage==="PALSCOUT_DEEP")preservedSeeds++;
   else changedSeedIdentity++;
   stats.apiDeepSeeds++;
  }else stats.apiBaseOnly++;
  const ref=game.externalRefs?.igdb;
  if(ref===undefined||ref===null||String(ref).trim()===""){
   invalidApiRef++;
   if(seed)unmappedSeeds++;
   continue;
  }
  const id=requireRecordId(ref),pair=key(game.platform,id);
  if(apiByPair.has(pair)){duplicateApiRefs++;continue;}
  apiByPair.set(pair,game);
  const csv=csvByPair.get(pair);
  if(!csv){apiMissingCsv++;stats.apiRefsAbsentFromCsv++;continue;}
  if(csv.typeBucket==="EXCLUDE_NON_BASE"||csv.typeBucket==="EXCLUDE_VERSION"){
   apiExcludedRef++;stats.apiRefsExcluded++;
  }
  if(!selectedPairs.has(pair)&&!seed)apiNonselected++;
  if(!seed){
   if(norm(game.title)!==norm(csv.name)){apiTitleDrift++;stats.apiBaseTitleDrift++;}
   const csvYear=csv.releaseYearByPlatform?.[game.platform]??null;
   const apiYear=game.releaseYear??null;
   if(csvYear!==apiYear){apiYearDrift++;stats.apiBaseYearDrift++;}
   const aliases=new Set((game.aliases||[]).map(norm).filter(Boolean));
   const missing=(csv.aliases||[]).some(alias=>norm(alias)!==norm(game.title)&&!aliases.has(norm(alias)));
   if(missing){apiMissingAliases++;stats.apiBaseMissingAliases++;}
  }
 }
 let mappingMissing=0,mappingWrongRef=0,mappingWrongTitle=0,mappingExcluded=0;
 const seenMappings=new Set();
 for(const mapping of mappings.seedMappings){
  if(seenMappings.has(mapping.seedId))throw Error("Duplicate private explicit seed mapping");
  seenMappings.add(mapping.seedId);
  const seed=seedById.get(mapping.seedId);
  const game=apiById.get(mapping.seedId);
  if(!seed||seed.platform!==mapping.platform||!game){mappingMissing++;continue;}
  const expected=requireRecordId(mapping.igdbId);
  if(String(game.externalRefs?.igdb??"")!==expected)mappingWrongRef++;
  const provider=csvByPair.get(key(mapping.platform,expected));
  if(!provider){mappingMissing++;continue;}
  if(norm(provider.name)!==norm(mapping.providerTitle))mappingWrongTitle++;
  if(provider.typeBucket.startsWith("EXCLUDE"))mappingExcluded++;
 }
 let selectedCsvMissingFromApi=0;
 for(const pair of selectedPairs){
  if(apiByPair.has(pair))continue;
  const platform=pair.split("|")[0];
  platforms[platform].selectedCsvMissingFromApi++;
  selectedCsvMissingFromApi++;
 }
 const expectedSeeds=seedCatalogue.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP").length;
 const apiSeedCount=apiCatalogue.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP").length;
 // A CSV type-eligible record can belong to several platforms; report pairs separately.
 const checks={
  expectedSeeds,preservedSeeds,changedSeedIdentity,unmappedSeeds,apiSeedCount,
  explicitMappingCount:mappings.seedMappings.length,mappingMissing,mappingWrongRef,mappingWrongTitle,mappingExcluded,
  duplicateApiRefs,invalidApiRef,apiRefsAbsentFromCsv:apiMissingCsv,apiRefsExcluded:apiExcludedRef,
  apiBaseTitleDrift:apiTitleDrift,apiBaseYearDrift:apiYearDrift,apiBaseMissingAliases:apiMissingAliases,
  apiBaseReferencesNotChosenByCsvDedup:apiNonselected,
  selectedCsvMissingFromApi
 };
 const blockers=["changedSeedIdentity","unmappedSeeds","mappingMissing","mappingWrongRef","mappingWrongTitle","mappingExcluded",
   "duplicateApiRefs","invalidApiRef","apiRefsAbsentFromCsv","apiRefsExcluded","apiBaseTitleDrift",
   "apiBaseYearDrift","apiBaseMissingAliases","apiBaseReferencesNotChosenByCsvDedup","selectedCsvMissingFromApi"];
 const failed=blockers.filter(k=>checks[k]!==0);
 if(expectedSeeds!==100||preservedSeeds!==100||apiSeedCount!==100)failed.push("100_PALSCOUT_SEED_GUARD");
 if(mappings.seedMappings.length!==9)failed.push("NINE_CURATED_MAPPINGS_GUARD");
 return {
  mode:"PRIVATE_IGDB_CSV_API_CANONICAL_PARITY",status:failed.length?"REVIEW_REQUIRED":"PARITY_PASS",
  historicalApiCandidateCount:8433,historicalCountIsNotSnapshotBaseline:true,
  apiCandidateCount:apiCatalogue.games.length,csvAttachedUniqueGames:csvRecords.length,
  csvGameTypes:{include:csvIncluded,review:csvReview,excluded:csvExcluded},
  csvCandidatePlatformPairs:[...csvByPair.values()].filter(r=>r.typeBucket==="INCLUDE_CANDIDATE").length,
  apiMappedPlatformPairs:apiByPair.size,
  checks,platforms,failedChecks:failed,
  aggregateOnly:true,noRawProviderRecords:true,noProviderIdentifiers:true,
  noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,
  commercialApprovalUnchanged:true
 };
}
