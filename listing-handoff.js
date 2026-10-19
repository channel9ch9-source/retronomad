// Same-tab, consent-based handoff from a real US Marketplace candidate to Listing Checker.
// Seller data never goes in a URL, account record, analytics payload or backend request.
(function(){
  "use strict";
  const KEY="grailraven:offer-review:v1";
  const MAX_AGE_MS=10*60*1000;
  const platforms=new Set(["PS1","PS2","Dreamcast"]);
  const field=(value,limit)=>String(value||"").trim().slice(0,limit);
  function offerLink(value){
    try{
      const u=new URL(value);
      if(u.protocol!=="https:"||u.hostname!=="www.pricecharting.com"||
        !/^\/offer\/[a-z0-9_-]+\/?$/i.test(u.pathname)||u.search||u.hash)return "";
      return u.href;
    }catch{return "";}
  }
  function normalise(row,target){
    if(!row||!target||!platforms.has(target.platform))return null;
    const url=offerLink(row.url),game=field(target.game,160),title=field(row.title,220);
    if(!url||!game||!title)return null;
    return {v:1,createdAt:Date.now(),source:"PriceCharting Marketplace",game,
      platform:target.platform,title,description:field(row.description,1600),url};
  }
  function storeCandidate(row,target){
    const payload=normalise(row,target);
    if(!payload)return false;
    try{window.sessionStorage.setItem(KEY,JSON.stringify(payload));return true;}
    catch{return false;}
  }
  function consumeCandidate(){
    if(new URLSearchParams(window.location.search).get("grOfferReview")!=="1")return null;
    let item;
    try{
      const raw=window.sessionStorage.getItem(KEY);
      window.sessionStorage.removeItem(KEY);
      if(!raw)return null;
      item=JSON.parse(raw);
    }catch{return null;}
    if(!item||item.v!==1||!Number.isFinite(item.createdAt)||
      item.createdAt>Date.now()||Date.now()-item.createdAt>MAX_AGE_MS)return null;
    const checked=normalise(item,{game:item.game,platform:item.platform});
    if(!checked||item.source!=="PriceCharting Marketplace")return null;
    return checked;
  }
  function consumeAndPrefill(){
    const item=consumeCandidate();
    if(!item)return false;
    const $=id=>document.getElementById(id);
    if(!$("offerReviewContext")||!$("listingUrl")||!$("title")||!$("platform"))return false;
    $("listingUrl").value=item.url;
    $("title").value=item.title;
    $("platform").value=item.platform;
    $("desc").value=item.description;
    // Do NOT infer a US physical region, an exact edition, barcode, completeness,
    // English UK packaging, verified price or shipping from a seller claim.
    $("complete").value="unknown";
    $("identifier").value="";
    $("english").checked=false;
    $("price").value="";
    $("postage").value="";
    $("offerReviewContext").hidden=false;
    $("offerReviewIntro").textContent="Wanted: "+item.game+" · "+item.platform+" · US marketplace. Seller title: "+item.title+".";
    const original=$("offerReviewOriginal");
    original.href=item.url;
    original.target="_blank";
    original.rel="noopener noreferrer";
    const inputs=Array.from(document.querySelectorAll("[data-offer-review-check]"));
    const summary=$("offerReviewProgress");
    function update(){
      const done=inputs.filter(input=>input.checked).length;
      summary.textContent=done+" of "+inputs.length+" manual checks noted. This candidate remains REVIEW — checklist ticks are not independent release certification.";
    }
    inputs.forEach(input=>input.addEventListener("change",update));
    update();
    return true;
  }
  window.GrailRavenListingHandoff=Object.freeze({storeCandidate,consumeAndPrefill});
})();
