// Public US Marketplace display. This browser module NEVER sees the private provider token.
(function(){
 "use strict";
 const $=id=>document.getElementById(id);
 let currentController=null;
 const us=()=>Boolean($("regionUs")?.checked);
 function link(value,type){
  try{
   const url=new URL(String(value||""));
   if(url.protocol!=="https:"||url.hostname!=="www.pricecharting.com")return "";
   if(type==="offer"&&(!/^\/offer\/[a-z0-9_-]+\/?$/i.test(url.pathname)||url.search||url.hash))return "";
   if(type==="credit"&&(url.pathname!=="/offers"||!url.searchParams.has("product")))return "";
   return url.toString();
  }catch{return "";}
 }
 function photo(value){
  try{
   const url=new URL(String(value||""));
   if(url.protocol!=="https:"||!["www.pricecharting.com","pricecharting.com","cdn.pricecharting.com","storage.googleapis.com"].includes(url.hostname))return "";
   return url.toString();
  }catch{return "";}
 }
 function toggle(){
  const input=$("maxPrice");if(input)input.disabled=us();
  const heading=$("maxPriceHeading");
  if(heading)heading.textContent=us()?"Delivered GBP · unavailable for US offers":"Max delivered price";
  if(!us()&&$("demoBanner"))$("demoBanner").hidden=false;
 }
 function init(){
  for(const id of ["regionUs","regionUk","regionEu"]){
   $(id)?.addEventListener("change",()=>{
    if($(id).checked&&id==="regionUs"){
     $("regionUk").checked=false;$("regionEu").checked=false;
    } else if($(id).checked){
     $("regionUs").checked=false;
    }
    if(!["regionUs","regionUk","regionEu"].some(key=>$(key)?.checked)){
     $("regionUk").checked=true;
    }
    toggle();
   });
  }
  $("resetFilters")?.addEventListener("click",()=>queueMicrotask(toggle));
  toggle();
 }
 function current(){return us();}
 function stop(){
  if(currentController)currentController.abort();
  currentController=null;
 }
 function append(parent,tag,klass,value){
  const n=document.createElement(tag);
  if(klass)n.className=klass;
  if(value!==undefined)n.textContent=value;
  parent.appendChild(n);return n;
 }
 function render(data,target){
  const output=$("liveResults");output.replaceChildren();
  $("demoResults").style.display="none";
  if($("demoBanner"))$("demoBanner").hidden=true;
  const rows=Array.isArray(data?.candidates)?data.candidates:[];
  $("resultsHeading").textContent=rows.length+" US PriceCharting offer"+(rows.length===1?"":"s")+" for “"+target.game+"”";
  $("resultNote").textContent="Available Marketplace candidates only. All are REVIEW: real US edition, completeness, disc condition and delivery must be verified with the seller. Asking prices in USD exclude shipping. Selection filters are not proof of offer attributes.";
  for(const row of rows){
   if(row?.status!=="REVIEW")continue;
   const href=link(row.url,"offer"),attribution=link(row.attribution?.url,"credit");
   if(!href||!attribution||!Number.isFinite(Number(row.itemPrice)))continue;
   const card=append(output,"article","v2-card");
   const cover=append(card,"div","v2-cover");
   const image=photo(row.imageUrl);
   if(image){
    const img=append(cover,"img","");
    img.src=image;img.alt="Seller listing photograph (not release verified)";
    img.loading="lazy";img.style.cssText="max-width:100%;max-height:165px;object-fit:contain;display:block";
   }else append(cover,"div","v2-cover-main",String(row.title||target.game).toUpperCase().slice(0,24));
   const body=append(card,"div","v2-cardbody");
   const chips=append(body,"div","v2-chips");
   append(chips,"span","v2-chip review","REVIEW");
   append(chips,"span","v2-chip","US console · physical region unverified");
   append(body,"h3","v2-title",String(row.title||target.game));
   append(body,"p","v2-meta-line","Seller-stated contents: "+(row.completenessClaim||"Unspecified")+" · Condition: "+(row.conditionClaim||"Unspecified"));
   if(row.description)append(body,"p","v2-desc",row.description);
   append(body,"p","v2-desc","Inspect the original photos for edition, disc, case and manual. Buyer-specific shipping is unknown.");
   const offer=append(body,"a","","View actual offer and seller photographs ↗");
   offer.href=href;offer.target="_blank";offer.rel="noopener noreferrer";
   const credit=append(body,"p","v2-provider-attribution","Source: ");
   const source=append(credit,"a","","PriceCharting Marketplace");
   source.href=attribution;source.target="_blank";source.rel="noopener noreferrer";
   const price=append(card,"div","v2-pricecol");
   append(price,"div","v2-price","USD "+Number(row.itemPrice).toFixed(2));
   append(price,"p","","Item only · shipping unknown");
  }
  if(!output.childElementCount)append(output,"p","v2-preview-note","No available US Marketplace listings were returned for this title. Other sellers may still have copies.");
 }
 async function run(target,status){
  stop();
  const ctrl=new AbortController();currentController=ctrl;
  status.textContent="Checking live PriceCharting US Marketplace…";
  const route="/api/marketplace/pricecharting/us?game="+encodeURIComponent(target.game)+"&platform="+encodeURIComponent(target.platform);
  try{
   const response=await fetch(route,{signal:ctrl.signal,credentials:"same-origin",headers:{accept:"application/json"}});
   const result=await response.json().catch(()=>({}));
   if(ctrl.signal.aborted)return;
   if(!response.ok){
    $("demoResults").style.display="none";
    if($("demoBanner"))$("demoBanner").hidden=true;
    $("liveResults").replaceChildren();
    $("resultsHeading").textContent="Live Marketplace temporarily unavailable";
    $("resultNote").textContent="We cannot verify offers without an authorised live source.";
    status.textContent=response.status===429?"Live Marketplace is busy. Please wait before searching again.":"US Marketplace is unavailable right now. Please try later.";
    return;
   }
   render(result,target);
   status.textContent="Real US offers via PriceCharting. All candidates require REVIEW.";
  }catch(error){
   if(error?.name==="AbortError")return;
   status.textContent="The US Marketplace could not be reached. Please retry shortly.";
  }finally{
   if(currentController===ctrl)currentController=null;
  }
 }
 window.GrailRavenUSMarketplace={init,current,stop,run,toggle};
})();
