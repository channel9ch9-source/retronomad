(function(){
 const cfg=window.RETRONOMAD_CONFIG||{};
 const enabled=cfg.accountSyncEnabled===true;
 const base=String(cfg.apiBase||"").trim().replace(/\/$/,"");

 async function request(path,options={}){
  if(!enabled)throw Object.assign(new Error("Account sync backend is not deployed."),{code:"sync_not_configured"});
  const headers={"accept":"application/json",...(options.headers||{})};
  if(options.body&&!headers["content-type"])headers["content-type"]="application/json";
  const r=await fetch(base+path,{...options,headers,credentials:"include"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){
   const e=new Error(j.message||j.error||("HTTP "+r.status));
   e.code=j.error||"http_"+r.status;e.status=r.status;throw e;
  }
  return j;
 }

 function state(){return{enabled,apiBase:base||null};}
 async function me(){return request("/api/me");}
 async function requestSignIn(email,returnTo){
  return request("/api/auth/request-link",{method:"POST",body:JSON.stringify({email,returnTo:returnTo||location.href})});
 }
 async function logout(){return request("/api/auth/logout",{method:"POST",body:"{}"});}
 async function deleteAccount(confirmation){
  return request("/api/account/delete",{method:"POST",body:JSON.stringify({confirmation:String(confirmation||"")})});
 }

 async function syncSavedHunts(){
  if(!window.RetroNomadSavedHunts)throw new Error("Saved Hunts module is unavailable.");
  const payload={
   schemaVersion:1,
   deviceId:deviceId(),
   hunts:RetroNomadSavedHunts.list(),
   deletions:RetroNomadSavedHunts.tombstones?RetroNomadSavedHunts.tombstones():[]
  };
  const result=await request("/api/hunts/sync",{method:"POST",body:JSON.stringify(payload)});
  if(Array.isArray(result.hunts)&&RetroNomadSavedHunts.replaceAll)RetroNomadSavedHunts.replaceAll(result.hunts);
  if(Array.isArray(result.acknowledgedDeletionIds)&&RetroNomadSavedHunts.clearTombstones){
   RetroNomadSavedHunts.clearTombstones(result.acknowledgedDeletionIds);
  }
  return result;
 }

 function deviceId(){
  const key="retronomad_device_id_v1";
  let id=localStorage.getItem(key);
  if(!id){
   id="dev_"+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+"_"+Math.random().toString(36).slice(2));
   localStorage.setItem(key,id);
  }
  return id;
 }

 window.RetroNomadAccount={state,me,requestSignIn,logout,deleteAccount,syncSavedHunts,deviceId};
})();