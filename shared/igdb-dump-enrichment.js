import {igdbRef} from "./igdb-dump-csv.js";

// Expand the previously selected PS1/PS2/Dreamcast *private* CSV preview.
// IDs must be joined to dedicated tables, not treated as enum codes.
const INCLUDED=new Set(["main game","port","remake","remaster","expanded game","standalone expansion"]);
const EXCLUDED=new Set(["mod","pack addon","dlc addon","episode","season","update"]);
const REVIEW=new Set(["bundle","expansion","fork","unknown"]);
const PLATFORM_NAMES={PS1:new Set(["playstation","ps1"]),PS2:new Set(["playstation 2","ps2"]),Dreamcast:new Set(["dreamcast","dc"])};
const normalized=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function maybeRef(v){
 const s=String(v??"").trim();
 return !s||s==="0"?null:igdbRef(s);
}
function truth(v){
 const s=String(v??"").trim().toLowerCase();
 if(s==="true"||s==="t"||s==="1")return true;
 if(!s||s==="false"||s==="f"||s==="0")return false;
 throw new Error("Unknown IGDB boolean encoding");
}
function requireIterable(value,name){
 if(!value||!(Symbol.iterator in Object(value))&&!(Symbol.asyncIterator in Object(value)))
  throw new Error("Missing private CSV table "+name);
}
export async function enrichIgdbDumpRelations(base,extra,{platformIds}={}){
 if(!Array.isArray(base?.records)||!platformIds)throw new Error("Inspect four core tables before enrichment");
 const names=["gameTypes","platforms","genres","involvedCompanies","companies"];
 for(const k of names)requireIterable(extra?.[k],k);
 const games=new Map(base.records.map(g=>[g.id,g]));
 const platformById=new Map(Object.entries(platformIds).map(([label,id])=>[igdbRef(id),label]));
 const platformSeen=new Set();
 for await(const row of extra.platforms){
  const label=platformById.get(maybeRef(row.id));
  if(!label)continue;
  const name=normalized(row.name);
  if(!PLATFORM_NAMES[label]?.has(name))throw new Error("Platform ID does not match expected console name");
  platformSeen.add(label);
 }
 if(platformSeen.size!==platformById.size)throw new Error("Some selected platform IDs do not occur in platform dump");

 const types=new Map();
 for await(const row of extra.gameTypes){
  const id=igdbRef(row.id,{allowZero:true});
  if(types.has(id))throw new Error("Duplicate game type ref");
  types.set(id,String(row.type||"").trim());
 }
 const genreRefs=new Set(base.records.flatMap(g=>g.genreRefs));
 const genres=new Map();
 for await(const row of extra.genres){
  const id=igdbRef(row.id);
  if(!genreRefs.has(id))continue;
  if(genres.has(id))throw new Error("Duplicate genre ref");
  const name=String(row.name||"").trim();
  if(name)genres.set(id,name.slice(0,160));
 }
 const companyIds=new Set();
 const relations=new Map();
 const relationIds=new Set();
 for(const g of base.records)for(const id of g.involvedCompanyRefs)relationIds.add(id);
 let linkedCompanyRelations=0;
 for await(const row of extra.involvedCompanies){
  const id=igdbRef(row.id);
  if(!relationIds.has(id))continue;
  const game=games.get(maybeRef(row.game));
  if(!game||!game.involvedCompanyRefs.includes(id))continue;
  if(relations.has(id))throw new Error("Duplicate involved-company relation");
  const company=maybeRef(row.company);
  if(!company)continue;
  relations.set(id,{gameId:game.id,companyId:company,developer:truth(row.developer),publisher:truth(row.publisher)});
  companyIds.add(company);
  linkedCompanyRelations++;
 }
 const companies=new Map();
 for await(const row of extra.companies){
  const id=igdbRef(row.id);
  if(!companyIds.has(id))continue;
  if(companies.has(id))throw new Error("Duplicate company ref");
  const name=String(row.name||"").trim();
  if(name)companies.set(id,name.slice(0,240));
 }
 const typeCounts={INCLUDE_CANDIDATE:0,EXCLUDE_VERSION:0,EXCLUDE_NON_BASE:0,REVIEW:0};
 const missing={gameType:0,genre:0,companyRelation:0,companyName:0};
 for(const game of base.records){
  const label=types.get(game.gameTypeRef)||null;
  game.gameTypeLabel=label;
  const type=normalized(label);
  if(game.versionParentRef)game.typeBucket="EXCLUDE_VERSION";
  else if(INCLUDED.has(type))game.typeBucket="INCLUDE_CANDIDATE";
  else if(EXCLUDED.has(type))game.typeBucket="EXCLUDE_NON_BASE";
  else if(REVIEW.has(type)||!type)game.typeBucket="REVIEW";
  else game.typeBucket="REVIEW";
  game.status=game.typeBucket==="INCLUDE_CANDIDATE"?"CANDIDATE_NOT_RETAIL_VERIFIED":game.typeBucket;
  typeCounts[game.typeBucket]++;
  if(game.gameTypeRef!==null && game.gameTypeRef!==undefined&&!label)missing.gameType++;
  game.genres=game.genreRefs.flatMap(id=>{
   const name=genres.get(id);if(!name){missing.genre++;return [];}return [name];
  });
  const developers=[],publishers=[];
  for(const id of game.involvedCompanyRefs){
   const rel=relations.get(id);
   if(!rel){missing.companyRelation++;continue;}
   const name=companies.get(rel.companyId);
   if(!name){missing.companyName++;continue;}
   if(rel.developer&&!developers.includes(name))developers.push(name);
   if(rel.publisher&&!publishers.includes(name))publishers.push(name);
  }
  game.developers=developers;
  game.publishers=publishers;
  // Still no evidence that a particular second-hand physical listing matches.
  game.editionVerified=false;game.marketplaceAvailable=false;
 }
 return {
  ...base,mode:"PRIVATE_IGDB_CSV_ENRICHED_RELATIONSHIP_INSPECTION",
  typeClassificationNotYetSupported:false,
  linkedCompanyRelations,
  typeCounts,missing,
  noCanonicalChanges:true,noD1Changes:true,noArtworkPublished:true,
  records:base.records
 };
}
