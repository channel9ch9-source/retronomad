// Safe, metadata-only preflight for IGDB Data Dump CSV schemas.
// No CSV content, signed URLs, credentials or provider records belong in reports.
export const REQUIRED_IGDB_DUMPS=Object.freeze({
  games:Object.freeze(["id","name","platforms"]),
  release_dates:Object.freeze(["id","game","platform","date"]),
  covers:Object.freeze(["id","game","image_id"]),
  alternative_names:Object.freeze(["id","game","name"])
});

function safeText(value,max=160){
  return typeof value==="string"?value.slice(0,max):null;
}
function integerOrNull(value){
  return Number.isSafeInteger(Number(value))&&Number(value)>=0?Number(value):null;
}

export function assessIgdbDumpReadiness(listing,metadataByEndpoint,checkedAt=new Date().toISOString()){
  if(!Array.isArray(listing))throw new TypeError("IGDB /dumps must return an array");
  const known=new Map();
  for(const item of listing){
    const endpoint=item?.endpoint;
    if(typeof endpoint==="string"&&/^[a-z_]+$/.test(endpoint))known.set(endpoint,item);
  }
  const inspections=[];
  let metadataReady=true;
  for(const [endpoint,requiredFields] of Object.entries(REQUIRED_IGDB_DUMPS)){
    const listed=known.get(endpoint);
    const meta=metadataByEndpoint?.[endpoint];
    const schema=meta?.schema&&typeof meta.schema==="object"&&!Array.isArray(meta.schema)?meta.schema:null;
    const missingFields=schema?requiredFields.filter(field=>!Object.hasOwn(schema,field)):[...requiredFields];
    const status=!listed?"MISSING_DUMP":!meta?"METADATA_UNAVAILABLE":!schema?"SCHEMA_UNAVAILABLE":missingFields.length?"SCHEMA_REVIEW":"SCHEMA_READY";
    if(status!=="SCHEMA_READY")metadataReady=false;
    const updatedAt=integerOrNull(meta?.updated_at??listed?.updated_at);
    inspections.push({
      endpoint,
      status,
      schemaVersion:safeText(String(meta?.schema_version??""),80)||null,
      updatedAt,
      sizeBytes:integerOrNull(meta?.size_bytes),
      requiredFields:[...requiredFields],
      missingFields
    });
  }
  return {
    schemaVersion:1,
    mode:"IGDB_DATA_DUMP_METADATA_ONLY",
    checkedAt,
    dumpCount:known.size,
    requiredAvailable:inspections.every(x=>x.status!=="MISSING_DUMP"),
    metadataReady,
    noCsvDownloaded:true,
    noSignedUrlsStored:true,
    noCanonicalChanges:true,
    noD1Changes:true,
    noArtworkPublished:true,
    inspected:inspections,
    availableEndpoints:[...known.keys()].sort()
  };
}
