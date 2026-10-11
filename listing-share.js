(function(){
  const RESULT_ID="result";
  const BUTTON_ID="copyResultSummary";
  const STATUS_ID="copyResultSummaryStatus";

  function read(id,fallback="—"){
    const el=document.getElementById(id);
    const value=String(el?.textContent||"").trim();
    return value||fallback;
  }

  function buildSummary(){
    return [
      "GrailRaven listing check",
      read("game")+" · "+read("plat"),
      read("badge")+" — "+read("verdictTitle"),
      "Release: "+read("market"),
      "Identifier: "+read("matchedId","None"),
      "Completeness: "+read("comp"),
      "PALScout: "+read("compatBadge")+" — "+read("compatTitle"),
      "Evidence: "+read("evidenceStrength"),
      "Check a listing: https://grailraven.com/analyze"
    ].join("\n");
  }

  async function copyText(text){
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return;
    }
    const area=document.createElement("textarea");
    area.value=text;
    area.setAttribute("readonly","");
    area.style.position="fixed";
    area.style.opacity="0";
    document.body.appendChild(area);
    area.select();
    const ok=document.execCommand("copy");
    area.remove();
    if(!ok)throw new Error("copy_failed");
  }

  async function onCopy(){
    const button=document.getElementById(BUTTON_ID);
    const status=document.getElementById(STATUS_ID);
    try{
      await copyText(buildSummary());
      button.textContent="Copied ✓";
      status.textContent="Summary copied.";
      setTimeout(()=>{
        button.textContent="Copy result summary";
        status.textContent="";
      },2200);
    }catch(error){
      button.textContent="Copy result summary";
      status.textContent="Could not copy automatically.";
    }
  }

  function init(){
    const result=document.getElementById(RESULT_ID);
    if(!result||document.getElementById(BUTTON_ID))return;

    const row=document.createElement("div");
    row.className="listing-share-row";

    const button=document.createElement("button");
    button.id=BUTTON_ID;
    button.type="button";
    button.className="btn secondary";
    button.textContent="Copy result summary";
    button.addEventListener("click",onCopy);

    const status=document.createElement("span");
    status.id=STATUS_ID;
    status.className="listing-share-status";
    status.setAttribute("aria-live","polite");

    row.append(button,status);
    result.prepend(row);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
