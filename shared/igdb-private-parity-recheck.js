// One-run IGDB API spot recheck of only identities with CSV/API parity differences.
// All provider IDs remain memory-only and are never written to CI artifacts.
import {selectPrivateCsvParityPairs} from "./igdb-catalogue-parity.js";

const PLATFORMS=["PS1","PS2","Dreamcast"];
const pairKey=(p,id)=>p+"|"+String(id);
function idString(value){
 const id=String(value??"").trim();
 if(!/^[1-9][0-9]*$/.test(id))throw Error("Invalid private provider game ID");
 return id;
}
export function preparePrivateParityRecheck(csvRecords,apiCatalogue){
 if(!Array.isArray(csvRecords)||!Array.isArray(apiCatalogue?.games))throw Error("Missing private recheck inputs");
 const allCsvPairs=new Set(),apiPairs=new Set();
 for(const row of csvRecords){
  const id=idString(row.id);
  for(const platform of row.platforms||[]){
   if(!PLATFORMS.includes(platform))throw Error("Unexpected launch platform");
   allCsvPairs.add(pairKey(platform,id));
  }
 }
 for(const game of apiCatalogue.games){
  if(!PLATFORMS.includes(game.platform))throw Error("Unexpected candidate platform");
  const id=idString(game.externalRefs?.igdb);
  apiPairs.add(pairKey(game.platform,id));
 }
 const csvOnly=selectPrivateCsvParityPairs(csvRecords).filter(({platform,igdbId})=>
  !apiPairs.has(pairKey(platform,igdbId)));
 const apiOnly=apiCatalogue.games.filter(g=>
  !allCsvPairs.has(pairKey(g.platform,idString(g.externalRefs?.igdb))))
   .map(g=>({platform:g.platform,igdbId:idString(g.externalRefs.igdb)}));
 const ids=[...new Set([...csvOnly,...apiOnly].map(r=>r.igdbId))];
 return {csvOnly,apiOnly,ids};
}
export function summarizePrivateParityRecheck(targets,apiRows,{platformIds}={}){
 if(!targets||!Array.isArray(targets.csvOnly)||!Array.isArray(targets.apiOnly)||!Array.isArray(targets.ids))
  throw Error("Invalid private API parity targets");
 if(!platformIds||!apiRows||!Array.isArray(apiRows))throw Error("Missing private API by-ID response");
 const wanted=new Set(targets.ids.map(idString));
 const found=new Map();
 for(const row of apiRows){
  const id=idString(row.id);
  if(!wanted.has(id))throw Error("Unexpected provider game ID returned by private recheck");
  if(found.has(id))throw Error("Duplicate provider ID returned by private recheck");
  if(!Array.isArray(row.platforms))throw Error("Missing platform list on by-ID recheck");
  found.set(id,new Set(row.platforms.map(x=>Number(x))));
 }
 const summarize=entries=>{
  const output={total:entries.length,stillPresentWithRequestedPlatform:0,
   presentButDifferentPlatform:0,noRecordReturned:0};
  for(const record of entries){
   const id=idString(record.igdbId),row=found.get(id);
   if(!row){output.noRecordReturned++;continue;}
   if(row.has(Number(platformIds[record.platform])))
    output.stillPresentWithRequestedPlatform++;
   else output.presentButDifferentPlatform++;
  }
  return output;
 };
 return {
  status:"TARGETED_PRIVATE_API_ID_RECHECK_COMPLETED",
  uniqueIdsQueried:targets.ids.length,
  csvSelectedNotInApiCatalogue:summarize(targets.csvOnly),
  apiCandidateReferenceAbsentFromCsv:summarize(targets.apiOnly),
  rawIdsExported:false,rawRowsExported:false,noCanonicalChanges:true,
  noCommercialApprovalChanges:true
 };
}
