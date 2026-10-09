(function(){
 const STORAGE_KEY="retronomad_saved_hunts_v1";
 const TOMBSTONE_KEY="retronomad_saved_hunt_tombstones_v1";
 const LEGACY_KEY="retronomad_saved_targets";
 const VERSION=1;
 const MAX_HISTORY=100;

 function now(){return new Date().toISOString();}
 function clone(v){return JSON.parse(JSON.stringify(v));}
 function uid(){
  if(globalThis.crypto&&typeof globalThis.crypto.randomUUID==="function")return "hunt_"+globalThis.crypto.randomUUID();
  return "hunt_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,10);
 }
 function numberOrNull(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
 function normaliseTarget(t={}){
  return{
   catalogueId:String(t.catalogueId||"").trim(),
   game:String(t.game||"").trim(),
   platform:String(t.platform||"").trim(),
   compatibility:String(t.compatibility||"UK_EU_PAL"),
   releasePreference:String(t.releasePreference||"pal-compatible"),
   editionPreference:String(t.editionPreference||"any"),
   completeness:String(t.completeness||"any"),
   condition:String(t.condition||"any"),
   englishRequired:t.englishRequired===true,
   excludeBundles:t.excludeBundles!==false,
   excludePromo:t.excludePromo!==false,
   maxDeliveredGbp:numberOrNull(t.maxDeliveredGbp)
  };
 }
 function defaultLabel(t){return t.game+(t.platform?" · "+t.platform:"");}
 function readRaw(){
  try{
   const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
   return Array.isArray(x)?x:[];
  }catch(e){return[];}
 }
 function writeRaw(rows){localStorage.setItem(STORAGE_KEY,JSON.stringify(rows));return rows;}
 function readTombstones(){
  try{
   const x=JSON.parse(localStorage.getItem(TOMBSTONE_KEY)||"[]");
   return Array.isArray(x)?x.filter(t=>t&&t.id&&t.deletedAt):[];
  }catch(e){return[];}
 }
 function writeTombstones(rows){localStorage.setItem(TOMBSTONE_KEY,JSON.stringify(rows));return rows;}
 function tombstones(){return readTombstones().sort((a,b)=>String(b.deletedAt).localeCompare(String(a.deletedAt)));}
 function clearTombstones(ids=[]){
  const set=new Set((ids||[]).map(String));
  const rows=readTombstones().filter(t=>!set.has(String(t.id)));
  writeTombstones(rows);return rows;
 }
 function normaliseHunt(h={}){
  const target=normaliseTarget(h.target||h);
  return{
   schemaVersion:VERSION,
   id:String(h.id||uid()),
   label:String(h.label||defaultLabel(target)),
   target,
   status:["ACTIVE","PAUSED","ARCHIVED"].includes(h.status)?h.status:"ACTIVE",
   createdAt:h.createdAt||h.savedAt||now(),
   updatedAt:h.updatedAt||h.savedAt||now(),
   monitoring:{
    state:String(h.monitoring?.state||"NOT_RUNNING"),
    lastCheckedAt:h.monitoring?.lastCheckedAt||null,
    lastCheckSummary:h.monitoring?.lastCheckSummary||null
   },
   alerts:{
    requested:h.alerts?.requested===true,
    state:String(h.alerts?.state||"UNAVAILABLE_STATIC_BETA"),
    channel:h.alerts?.channel||null,
    lastNotifiedAt:h.alerts?.lastNotifiedAt||null
   },
   matchHistory:Array.isArray(h.matchHistory)?h.matchHistory.slice(-MAX_HISTORY):[]
  };
 }
 function migrateLegacy(){
  let legacy=[];
  try{legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||"[]");}catch(e){}
  if(!Array.isArray(legacy)||!legacy.length)return 0;
  const current=readRaw().map(normaliseHunt);
  let added=0;
  for(const old of legacy){
   const target=normaliseTarget(old);
   if(!target.game)continue;
   const sig=targetSignature(target);
   if(current.some(h=>targetSignature(h.target)===sig))continue;
   current.push(normaliseHunt({
    target,
    createdAt:old.savedAt||now(),
    updatedAt:old.savedAt||now(),
    alerts:{requested:false,state:"UNAVAILABLE_STATIC_BETA"},
    monitoring:{state:"NOT_RUNNING",lastCheckedAt:null,lastCheckSummary:null}
   }));
   added++;
  }
  if(added)writeRaw(current);
  localStorage.removeItem(LEGACY_KEY);
  return added;
 }
 function list(){
  migrateLegacy();
  return readRaw().map(normaliseHunt).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
 }
 function get(id){return list().find(h=>h.id===id)||null;}
 function targetSignature(t){return JSON.stringify(normaliseTarget(t));}
 function create(target,options={}){
  migrateLegacy();
  const t=normaliseTarget(target);
  if(!t.game)throw new Error("A game is required to save a hunt.");
  const rows=readRaw().map(normaliseHunt);
  const existing=rows.find(h=>targetSignature(h.target)===targetSignature(t)&&h.status!=="ARCHIVED");
  if(existing){
   existing.updatedAt=now();
   if(options.label)existing.label=String(options.label);
   writeRaw(rows);
   return{hunt:clone(existing),created:false};
  }
  const hunt=normaliseHunt({
   id:uid(),label:options.label||defaultLabel(t),target:t,status:"ACTIVE",
   createdAt:now(),updatedAt:now(),
   monitoring:{state:"NOT_RUNNING",lastCheckedAt:null,lastCheckSummary:null},
   alerts:{requested:options.alertRequested===true,state:"UNAVAILABLE_STATIC_BETA",channel:null,lastNotifiedAt:null},
   matchHistory:[]
  });
  rows.push(hunt);writeRaw(rows);
  return{hunt:clone(hunt),created:true};
 }
 function update(id,patch={}){
  const rows=readRaw().map(normaliseHunt),i=rows.findIndex(h=>h.id===id);
  if(i<0)return null;
  const h=rows[i];
  if(patch.label!=null)h.label=String(patch.label).trim()||defaultLabel(h.target);
  if(patch.target)h.target=normaliseTarget({...h.target,...patch.target});
  if(["ACTIVE","PAUSED","ARCHIVED"].includes(patch.status))h.status=patch.status;
  if(patch.monitoring&&typeof patch.monitoring==="object")h.monitoring={...h.monitoring,...patch.monitoring};
  if(patch.alerts&&typeof patch.alerts==="object")h.alerts={...h.alerts,...patch.alerts,state:"UNAVAILABLE_STATIC_BETA"};
  h.updatedAt=now();rows[i]=normaliseHunt(h);writeRaw(rows);return clone(rows[i]);
 }
 function remove(id){
  const rows=readRaw().map(normaliseHunt),found=rows.find(h=>h.id===id),next=rows.filter(h=>h.id!==id);
  if(found){
   const ts=now(),stones=readTombstones().filter(t=>t.id!==id);
   stones.push({id:String(id),deletedAt:ts});
   writeTombstones(stones);
  }
  writeRaw(next);return next.length!==rows.length;
 }
 function replaceAll(hunts=[]){
  const rows=(Array.isArray(hunts)?hunts:[]).map(normaliseHunt);
  writeRaw(rows);return rows.map(clone);
 }
 function setAlertRequested(id,requested){return update(id,{alerts:{requested:requested===true}});}
 function setStatus(id,status){return update(id,{status});}
 function recordCheck(id,summary={}){
  return update(id,{monitoring:{state:"CHECKED_FOREGROUND_ONLY",lastCheckedAt:now(),lastCheckSummary:clone(summary)}});
 }
 function recordMatches(id,rows=[]){
  const hunts=readRaw().map(normaliseHunt),i=hunts.findIndex(h=>h.id===id);if(i<0)return null;
  const h=hunts[i],ts=now(),map=new Map(h.matchHistory.map(x=>[(x.source||"")+"|"+(x.externalId||""),x]));
  for(const row of rows){
   if(!row||row.match?.state!=="MATCH")continue;
   const key=(row.source||"")+"|"+(row.externalId||"");
   if(!row.externalId)continue;
   const old=map.get(key);
   map.set(key,{
    source:String(row.source||""),
    externalId:String(row.externalId||""),
    title:String(row.title||""),
    canonicalUrl:String(row.canonicalUrl||""),
    deliveredGbp:Number.isFinite(Number(row.match?.deliveredGbp))?Number(row.match.deliveredGbp):null,
    firstSeenAt:old?.firstSeenAt||ts,
    lastSeenAt:ts,
    lastMatchState:"MATCH"
   });
  }
  h.matchHistory=[...map.values()].sort((a,b)=>String(b.lastSeenAt).localeCompare(String(a.lastSeenAt))).slice(0,MAX_HISTORY);
  h.updatedAt=ts;hunts[i]=h;writeRaw(hunts);return clone(h);
 }
 function clearAll(){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(TOMBSTONE_KEY);localStorage.removeItem(LEGACY_KEY);}
 function exportData(){return{schemaVersion:VERSION,exportedAt:now(),hunts:list(),deletions:tombstones()};}

 window.RetroNomadSavedHunts={
  STORAGE_KEY,TOMBSTONE_KEY,VERSION,list,get,create,update,remove,replaceAll,tombstones,clearTombstones,setAlertRequested,setStatus,
  recordCheck,recordMatches,migrateLegacy,clearAll,exportData,normaliseTarget,targetSignature,normaliseHunt
 };
})();