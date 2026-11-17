// GrailRaven OFFLINE REVIEW DESK demo.
// Only imports synthetic, already-projected read-only local case data.
// No network, credentials, public route, upload, database writes or MATCH API.
import {
 DEMO_SCENARIOS,listDemoReviewerCases,getDemoReviewerCase
} from "./model.js";

const byId=id=>document.getElementById(id);
const scenario=byId("scenario"),filter=byId("filter"),list=byId("case-list"),
 details=byId("details");
let current="reviewer-alpha",chosen=null,tab="evidence";
function node(tag,cls="",text=null){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(text!==null)n.textContent=String(text);
 return n;
}
function add(parent,...children){for(const child of children)parent.append(child);return parent;}
function badge(status){
 const styles={"Needs evidence":"needs","Review queue":"review","In review":"active"};
 return node("span","pill "+(styles[status]||""),status);
}
function empty(title,description){
 const box=node("div","empty");
 return add(box,node("h3","",title),node("p","",description));
}
function labelValue(label,value){
 return add(node("div","mini"),node("label","",label),node("b","",value));
}
function sectionTitle(text){return node("h3","",text);}
function evidenceItem(title,subtitle){
 const row=node("div","evidence"),dot=node("div","dot");
 dot.setAttribute("aria-hidden","true");
 const copy=add(node("div"),node("strong","",title),node("small","",subtitle));
 return add(row,dot,copy);
}
function showEvidence(c,container){
 const missing=[...c.missingViews];
 const ref=[...c.missingReferenceEvidence];
 const body=add(container,sectionTitle("Missing item evidence"));
 const grid=node("div","gridlist");
 if(!missing.length)add(grid,node("div","none","All required photograph labels are present. Photos are not authenticated."));
 for(const view of missing)add(grid,evidenceItem(view.replaceAll("_"," ").replace(":"," — disc "), "A real reviewer would need a legally usable item-specific image"));
 body.append(grid);
 body.append(node("hr","rule"));
 body.append(sectionTitle("Release-reference review"));
 const another=node("div","gridlist");
 if(ref.length===0)add(another,node("div","none","No reference-field omissions in the synthetic observation set."));
 for(const code of ref)add(another,evidenceItem(code.replaceAll("_"," ").replace(":"," — disc "), "Claim is missing or the market identity needs independent corroboration"));
 if(c.unresolvedCountry)add(another,evidenceItem("Shared PAL market ambiguity","Matching identifiers do not establish uniquely UK packaging"));
 body.append(another);
 body.append(node("hr","rule"));
 body.append(sectionTitle("Reviewer checklist"));
 body.append(node("p","muted",`${c.checksRecorded} of ${c.checksTotal} simulated reviewer findings recorded. These are not authenticated opinions.`));
 const checks=node("div","gridlist");
 if(c.checklist.length===0)add(checks,node("div","none","All check labels have simulated findings, but no copy is verified."));
 for(const name of c.checklist)add(checks,evidenceItem(name,"Still awaiting a simulated finding"));
 body.append(checks);
}
function showHistory(c,container){
 container.append(sectionTitle("Append-only review timeline · simulated"));
 if(!c.history.length){container.append(node("p","muted","No simulated events."));return;}
 const timeline=node("div","timeline");
 for(const e of c.history){
  const entry=node("div","entry");
  const time=node("time","",e.time.replace("T"," ").replace(".000Z"," UTC"));
  add(entry,node("b","",e.description),time);
  timeline.append(entry);
 }
 container.append(timeline);
 container.append(node("p","foot","Timeline labels are fictional and not authenticated, cryptographically anchored, or stored in D1."));
}
function renderDetail(caseId){
 details.replaceChildren();
 const c=getDemoReviewerCase(current,caseId);
 if(!c){
  details.append(empty("No accessible case","The simulated role does not have permission to inspect this case."));
  return;
 }
 const wrap=node("div","detail");
 const top=node("div","detail-top");
 add(top,node("span","eyebrow","Fictional case · read-only"),badge(c.status));
 add(wrap,top,node("h2","",c.game),node("p","subtitle",
  `${c.platform} · ${c.market} · ${c.edition} · ${c.id}`));
 const truth=node("div","truth");
 add(truth,node("span","","◈"),add(node("div"),
  node("strong","","UNVERIFIED · No match or alert authority"),
  node("p","", "The source records and photograph labels are synthetic. No actual item has been inspected, authenticated or approved.")));
 wrap.append(truth);
 wrap.append(node("hr","rule"));
 const minis=node("div","two");
 add(minis,
  labelValue("Reference comparison",c.referenceStatus.replaceAll("_"," ")),
  labelValue("Photo evidence packet",c.photoStatus.replaceAll("_"," ")),
  labelValue("Workflow",c.workflowStatus.replaceAll("_"," ")),
  labelValue("Snapshot note",c.note)
 );
 wrap.append(minis);
 const tabs=node("div","tabs");
 tabs.setAttribute("role","tablist");
 for(const [id,text] of [["evidence","Evidence gaps"],["history","Review history"]]){
  const btn=node("button","tab",text);
  btn.type="button";btn.setAttribute("role","tab");
  btn.setAttribute("aria-selected",String(tab===id));
  btn.addEventListener("click",()=>{tab=id;renderDetail(caseId);});
  tabs.append(btn);
 }
 wrap.append(tabs);
 const contents=node("section");
 contents.setAttribute("aria-label",tab==="evidence"?"Evidence gaps":"Review history");
 if(tab==="history")showHistory(c,contents);
 else showEvidence(c,contents);
 wrap.append(contents);
 details.append(wrap);
}
function render(){
 const allowed=listDemoReviewerCases(current);
 byId("total").textContent=allowed.length;
 byId("need").textContent=allowed.filter(x=>x.status==="Needs evidence").length;
 byId("queuecount").textContent=allowed.filter(x=>x.status==="Review queue"||x.status==="In review").length;
 const shown=allowed.filter(c=>filter.value==="All"||c.status===filter.value);
 byId("visible-count").textContent=`${shown.length} visible`;
 list.replaceChildren();
 if(!shown.length){
  const unauthorized=current==="no-session";
  list.append(empty(unauthorized?"Access denied in demo":"No cases match",
   unauthorized?"No reviewer session is simulated. Ordinary customer sessions do not grant reviewer access.":"Try selecting another filter."));
  chosen=null;
  details.replaceChildren(empty("No accessible case",
   unauthorized?"All case details are hidden in this scenario.":"No selected case is available in this filter."));
  return;
 }
 if(!shown.some(c=>c.id===chosen))chosen=shown[0].id;
 for(const c of shown){
  const btn=node("button","case");
  btn.type="button";btn.setAttribute("aria-current",String(c.id===chosen));
  btn.setAttribute("aria-label",`View synthetic ${c.game} case`);
  add(btn,
   node("div","title",c.game),
   node("span","sub",`${c.platform} · ${c.market} · ${c.edition}`),
   add(node("div","bottom"),badge(c.status),node("span","case-id",c.id)));
  btn.addEventListener("click",()=>{chosen=c.id;render();});
  list.append(btn);
 }
 renderDetail(chosen);
}
for(const option of DEMO_SCENARIOS){
 const item=node("option","",option.label);item.value=option.id;
 scenario.append(item);
}
scenario.value=current;
scenario.addEventListener("change",()=>{current=scenario.value;chosen=null;tab="evidence";render();});
filter.addEventListener("change",()=>{chosen=null;render();});
render();
