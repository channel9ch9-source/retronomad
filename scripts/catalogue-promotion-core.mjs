import crypto from "node:crypto";
import { buildCatalogueSearchIndex, mergeCatalogueSearchAliases, normalizeCatalogueTitle, validateCatalogue } from "../shared/catalogue-core.js";

export function stableCatalogueJson(document){
  return JSON.stringify(document,null,2)+"\n";
}

export function sha256Hex(value){
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function sqlString(value){
  if(value==null)return "NULL";
  return "'"+String(value).replaceAll("'","''")+"'";
}

export function externalRefRows(game){
  const rows=[];
  for(const [provider,value] of Object.entries(game.externalRefs||{})){
    if(value==null)continue;
    if(typeof value==="object"){
      const externalId=String(value.id??value.externalId??"").trim();
      if(!externalId)continue;
      rows.push({
        provider:String(provider),
        externalId,
        canonicalUrl:value.canonicalUrl??null,
        metadata:value.metadata&&typeof value.metadata==="object"?value.metadata:{}
      });
    }else{
      const externalId=String(value).trim();
      if(externalId)rows.push({provider:String(provider),externalId,canonicalUrl:null,metadata:{}});
    }
  }
  return rows;
}

export function artworkRows(game){
  const a=game.artwork;
  if(!a||typeof a!=="object")return [];
  const assetUrl=String(a.assetUrl??a.url??"").trim();
  const source=String(a.source??"").trim();
  const rightsStatus=String(a.rightsStatus??"PENDING").trim();
  if(!assetUrl||!source)return [];
  if(!["APPROVED","PENDING","DO_NOT_USE"].includes(rightsStatus))return [];
  return [{
    kind:String(a.kind??"COVER"),
    source,
    sourceRef:a.sourceRef??null,
    assetUrl,
    rightsStatus,
    attribution:a.attribution??null,
    metadata:a.metadata&&typeof a.metadata==="object"?a.metadata:{}
  }];
}

export function buildPromotionManifest(candidate,seed,{source="IGDB",requireFull=true,supplementalAliases={},suppressedAliases={}}={}){
  const validation=validateCatalogue(candidate);
  if(!validation.ok)throw new Error("Candidate catalogue is invalid: "+validation.errors.join("; "));

  const seedValidation=validateCatalogue(seed);
  if(!seedValidation.ok)throw new Error("Seed catalogue is invalid: "+seedValidation.errors.join("; "));

  const seedDeep=seed.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP");
  const candidateById=new Map(candidate.games.map(g=>[g.id,g]));
  const missingSeeds=[];
  const changedSeedIdentity=[];
  for(const original of seedDeep){
    const next=candidateById.get(original.id);
    if(!next){missingSeeds.push(original.id);continue;}
    if(next.title!==original.title||next.platform!==original.platform||next.releaseIntelligence?.coverage!=="PALSCOUT_DEEP"){
      changedSeedIdentity.push(original.id);
    }
  }
  if(missingSeeds.length)throw new Error("Candidate dropped PALScout seed IDs: "+missingSeeds.join(", "));
  if(changedSeedIdentity.length)throw new Error("Candidate changed PALScout seed identity/coverage: "+changedSeedIdentity.join(", "));

  const deep=candidate.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_DEEP");
  const baseOnly=candidate.games.filter(g=>g.releaseIntelligence?.coverage==="BASE_ONLY");
  const partial=candidate.games.filter(g=>g.releaseIntelligence?.coverage==="PALSCOUT_PARTIAL");
  const unmappedDeep=deep.filter(g=>!String(g.externalRefs?.igdb||"").trim());
  if(requireFull&&deep.length!==100)throw new Error("Expected 100 PALSCOUT_DEEP games, got "+deep.length);
  if(requireFull&&unmappedDeep.length)throw new Error("PALSCOUT_DEEP games missing IGDB mappings: "+unmappedDeep.map(g=>g.id).join(", "));
  if(requireFull&&candidate.games.length<8000)throw new Error("Full promotion candidate unexpectedly small: "+candidate.games.length);

  const platformCounts={};
  for(const game of candidate.games)platformCounts[game.platform]=(platformCounts[game.platform]||0)+1;
  if(requireFull){
    for(const [platform,min] of Object.entries({PS1:3000,PS2:3000,Dreamcast:500})){
      if((platformCounts[platform]||0)<min)throw new Error(`Candidate ${platform} count is below safety floor: ${platformCounts[platform]||0}`);
    }
  }

  const aliasCount=candidate.games.reduce(
    (n,g)=>n+mergeCatalogueSearchAliases(g,supplementalAliases,suppressedAliases).length,
    0
  );
  const refKeysByPlatform=new Set();
  const refPlatforms=new Map();
  let externalRefCount=0;
  for(const game of candidate.games){
    for(const ref of externalRefRows(game)){
      const platformKey=ref.provider+"|"+ref.externalId+"|"+game.platform;
      if(refKeysByPlatform.has(platformKey)){
        throw new Error("Duplicate provider external reference on the same platform: "+platformKey);
      }
      refKeysByPlatform.add(platformKey);
      const providerKey=ref.provider+"|"+ref.externalId;
      if(!refPlatforms.has(providerKey))refPlatforms.set(providerKey,new Set());
      refPlatforms.get(providerKey).add(game.platform);
      externalRefCount++;
    }
  }
  const crossPlatformProviderRefReuseGroups=[...refPlatforms.values()].filter(platforms=>platforms.size>1).length;
  const artworkCount=candidate.games.reduce((n,g)=>n+artworkRows(g).length,0);
  const canonicalText=stableCatalogueJson(candidate);
  const checksum=sha256Hex(canonicalText);
  const index=buildCatalogueSearchIndex(candidate,supplementalAliases,suppressedAliases);
  const indexBytes=Buffer.byteLength(JSON.stringify(index),"utf8");
  if(requireFull&&indexBytes>2*1024*1024)throw new Error("Compact browser index exceeds 2 MiB safety limit");

  return {
    manifestVersion:1,
    datasetId:"cat-"+checksum.slice(0,20),
    source,
    schemaVersion:candidate.schemaVersion,
    checksumSha256:checksum,
    createdAt:new Date().toISOString(),
    publicationGate:"IGDB_COMMERCIAL_APPROVAL_REQUIRED",
    canonicalCatalogueModified:false,
    remoteD1Activated:false,
    counts:{
      games:candidate.games.length,
      aliases:aliasCount,
      externalRefs:externalRefCount,
      artwork:artworkCount,
      crossPlatformProviderRefReuseGroups,
      baseOnly:baseOnly.length,
      palScoutPartial:partial.length,
      palScoutDeep:deep.length,
      platforms:platformCounts
    },
    searchIndexBytes:indexBytes,
    searchIndexMiB:Number((indexBytes/1024/1024).toFixed(3)),
    seedSafety:{
      seedDeepCount:seedDeep.length,
      preservedDeepIds:seedDeep.length-missingSeeds.length,
      changedSeedIdentityCount:changedSeedIdentity.length,
      unmappedDeepCount:unmappedDeep.length
    }
  };
}

export function chunkRows(rows,size=250){
  const out=[];
  for(let i=0;i<rows.length;i+=size)out.push(rows.slice(i,i+size));
  return out;
}

export function normalizeAlias(value){
  return normalizeCatalogueTitle(value);
}
