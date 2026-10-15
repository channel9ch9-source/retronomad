import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";

const page=await readFile(new URL("../search.html",import.meta.url),"utf8");

test("Search provides one visible explicit listing action without automatic provider lookups",()=>{
 assert.equal((page.match(/id="searchBtn"/g)||[]).length,1);
 assert.match(page,/<button id="searchBtn" class="v2-search-submit" type="button">Search listings<\/button>/);
 assert.doesNotMatch(page,/<button id="searchBtn" class="gr-hidden"/);
 assert.match(page,/addEventListener\("click",runSearch\)/);
 assert.match(page,/if\(button\.disabled\)return;/);
 assert.match(page,/button\.disabled=true;[\s\S]*?finally\{\s*button\.disabled=false;/);
 assert.match(page,/id="searchStatus"[^>]*role="status" aria-live="polite"/);
});

test("Search invalidates an existing selection when platform and relevant filters change",()=>{
 assert.match(page,/platformButtons\.forEach\(button=>button\.addEventListener\("click",[\s\S]*?setSelectedPlatform\(button\.dataset\.platform\);\s*markResultsNeedRefresh\(\);/);
 assert.match(page,/const changed=\(\)=>\{syncLegacyFields\(\);resetSaveButtonLabel\(\);markResultsNeedRefresh\(\);\}/);
 assert.match(page,/id="regionUs" type="checkbox"/);
 assert.match(page,/input\.checked=!input\.checked;sw\.classList\.toggle\("on",input\.checked\);resetSaveButtonLabel\(\);markResultsNeedRefresh\(\);/);
 assert.match(page,/syncLegacyFields\(\);resetSaveButtonLabel\(\);markResultsNeedRefresh\(\);\s*\}\);\s*document\.querySelector\("#mobileFilterButton"\)/);
 assert.match(page,/gameInput\.addEventListener\("input",e=>\{\s*window\.GrailRavenUSMarketplace\?\.stop\(\);/);
});

test("markResultsNeedRefresh clears stale visible offers without automatically querying the provider",()=>{
 const from=page.indexOf("function markResultsNeedRefresh(){");
 const to=page.indexOf("\nconst filterIds=",from);
 assert.ok(from>0&&to>from);
 const fn=page.slice(from,to);
 assert.doesNotMatch(fn,/\.run\(|fetch\(|runSearch\(/);
 let stops=0,clears=0;
 const panel={hidden:false};
 const listings={childElementCount:1,replaceChildren(){clears++;this.childElementCount=0;}};
 const demo={style:{display:""}};
 const banner={hidden:false};
 const note={textContent:""};
 const status={textContent:""};
 const save={disabled:false};
 const refs=new Map([
  ["#catalogueSelection",panel],["#liveResults",listings],
  ["#demoResults",demo],["#demoBanner",banner],["#resultNote",note],
  ["#searchStatus",status],["#saveBtn",save]
 ]);
 const heading={textContent:""};
 const window={currentTarget:{game:"Suikoden II"},GrailRavenUSMarketplace:{stop(){stops++;}}};
 const document={querySelector(selector){return refs.get(selector)??null;}};
 const ctx={window,document,resultsHeading:heading};
 vm.runInNewContext(fn+"\nmarkResultsNeedRefresh();",ctx,{timeout:1500});
 assert.equal(panel.hidden,true);
 assert.equal(listings.childElementCount,0);
 assert.equal(clears,1);
 assert.equal(stops,1);
 assert.equal(demo.style.display,"none");
 assert.equal(banner.hidden,true);
 assert.equal(heading.textContent,"Search settings changed");
 assert.match(note.textContent,/REVIEW-only/);
 assert.match(status.textContent,/Filters changed/);
 assert.equal(save.disabled,true);
 assert.equal(window.currentTarget,null);
 vm.runInNewContext("markResultsNeedRefresh();",ctx,{timeout:1500});
 assert.equal(stops,1);
 assert.equal(clears,1);
});
