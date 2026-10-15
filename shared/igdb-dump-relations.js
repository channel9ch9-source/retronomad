import {igdbRef,igdbRefs,igdbReleaseYear} from "./igdb-dump-csv.js";

// Private research-only join. The result is not a publishable catalogue.
// game_type is a provider reference in CSV: the existing API import classifier
// needs further joins before it can safely INCLUDE vs REVIEW any game.
export async function inspectIgdbDumpRelations(
 {games,releaseDates,covers,alternativeNames},
 {platformIds}={}
){
 if(!platformIds||typeof platformIds!=="object")throw new Error("Explicit validated IGDB platform IDs are required");
 const wanted=new Map();
 for(const [label,id] of Object.entries(platformIds)){
  if(!["PS1","PS2","Dreamcast"].includes(label))throw new Error("Unrecognised platform label");
  const number=igdbRef(id);
  if(wanted.has(number))throw new Error("Duplicate platform ID");
  wanted.set(number,label);
 }
 if(!wanted.size)throw new Error("Select at least one platform");
 for(const [name,iterable] of Object.entries({games,releaseDates,covers,alternativeNames})){
  if(!iterable||!(Symbol.asyncIterator in Object(iterable))&&!(Symbol.iterator in Object(iterable)))throw new Error("Missing iterable table: "+name);
 }
 const byGame=new Map();
 const counts={scannedGames:0,selectedGames:0,scannedReleaseDates:0,matchedReleaseDates:0,scannedCovers:0,matchedCovers:0,scannedAlternativeNames:0,matchedAlternativeNames:0};
 for await(const row of games){
  counts.scannedGames++;
  const platforms=igdbRefs(row.platforms);
  const relevant=platforms.filter(id=>wanted.has(id));
  if(!relevant.length)continue;
  const id=igdbRef(row.id);
  if(byGame.has(id))throw new Error("Duplicate IGDB game record ID");
  const name=String(row.name||"").trim();
  if(!name||name.length>500)throw new Error("Missing or implausibly long IGDB game name");
  const coverId=igdbRef(row.cover,{optional:true});
  byGame.set(id,{
   id,name,
   platforms:relevant.map(x=>wanted.get(x)),
   platformIds:relevant,
   coverRef:coverId,hasCoverMetadata:false,
   gameTypeRef:(row.game_type&&String(row.game_type).trim()!=="0")?igdbRef(row.game_type):null,
   versionParentRef:row.version_parent?igdbRef(row.version_parent):null,
   genreRefs:igdbRefs(row.genres),involvedCompanyRefs:igdbRefs(row.involved_companies),
   genres:[],developers:[],publishers:[],gameTypeLabel:null,
   typeBucket:"REVIEW",
   aliases:[],releaseYearByPlatform:{},
   status:"REVIEW_GAME_TYPE_AND_RELEASE",
   // Deliberately do not treat a release date as proof of region / retail edition.
   marketplaceAvailable:false,editionVerified:false
  });
  counts.selectedGames++;
 }
 for await(const row of releaseDates){
  counts.scannedReleaseDates++;
  const gameId=igdbRef(row.game,{optional:true});
  const platformId=igdbRef(row.platform,{optional:true});
  const game=byGame.get(gameId);
  if(!game||!wanted.has(platformId)||!game.platformIds.includes(platformId))continue;
  counts.matchedReleaseDates++;
  const year=igdbReleaseYear(row.date);
  if(year){
   const label=wanted.get(platformId);
   const existing=game.releaseYearByPlatform[label];
   if(existing===undefined||year<existing)game.releaseYearByPlatform[label]=year;
  }
 }
 for await(const row of covers){
  counts.scannedCovers++;
  const id=igdbRef(row.id,{optional:true});
  const game=byGame.get(igdbRef(row.game,{optional:true}));
  if(!game)continue;
  // Covers can be variant records; only the cover referenced by the game row
  // may be taken as its primary image. No actual IGDB image is published.
  if(!game.coverRef||id!==game.coverRef)continue;
  if(!String(row.image_id||"").trim())continue;
  game.hasCoverMetadata=true;
  counts.matchedCovers++;
 }
 for await(const row of alternativeNames){
  counts.scannedAlternativeNames++;
  const game=byGame.get(igdbRef(row.game,{optional:true}));
  if(!game)continue;
  const alias=String(row.name||"").trim();
  if(!alias||alias===game.name||alias.length>500||game.aliases.includes(alias))continue;
  game.aliases.push(alias);
  counts.matchedAlternativeNames++;
 }
 const platformStats=Object.fromEntries([...wanted].map(([id,label])=>{
  const records=[...byGame.values()].filter(game=>game.platformIds.includes(id));
  return [label,{
   gameCount:records.length,
   withReleaseYear:records.filter(game=>Number.isInteger(game.releaseYearByPlatform[label])).length,
   withCoverMetadata:records.filter(game=>game.hasCoverMetadata).length,
   withAlternativeNames:records.filter(game=>game.aliases.length>0).length
  }];
 }));
 return {
  mode:"PRIVATE_IGDB_CSV_RELATIONSHIP_INSPECTION",
  noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,
  typeClassificationNotYetSupported:true,
  counts,platformStats,
  records:[...byGame.values()]
 };
}
