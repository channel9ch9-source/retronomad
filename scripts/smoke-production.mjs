const origin=(process.env.PRODUCTION_ORIGIN||"https://grailraven.com").replace(/\/$/,"");
const wwwOrigin=process.env.PRODUCTION_WWW_ORIGIN||"https://www.grailraven.com";
const attempts=Number(process.env.PRODUCTION_SMOKE_ATTEMPTS||6);
const delayMs=Number(process.env.PRODUCTION_SMOKE_DELAY_MS||5000);

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

async function fetchText(path,options={}){
  const response=await fetch(origin+path,{redirect:"manual",...options});
  const body=await response.text();
  return {response,body};
}

function assert(condition,message){
  if(!condition)throw new Error(message);
}

async function verify(){
  const home=await fetchText("/");
  assert(home.response.status===200,`Homepage returned ${home.response.status}`);
  assert(home.body.includes("<title>GrailRaven — Find the right copy at the right price</title>"),"Homepage title metadata missing");
  assert(home.body.includes('<link rel="canonical" href="https://grailraven.com/">'),"Homepage canonical URL missing");
  assert(home.body.includes('<meta property="og:site_name" content="GrailRaven">'),"Homepage Open Graph site name missing");
  assert(home.body.includes('type="application/ld+json"'),"Homepage structured data missing");
  assert(!home.body.split("</head>")[0].includes("\\n"),"Homepage head contains visible literal newline escape text");
  for(const [name,value] of [
    ["x-content-type-options","nosniff"],
    ["x-frame-options","DENY"],
    ["referrer-policy","strict-origin-when-cross-origin"]
  ]) assert(home.response.headers.get(name)===value,`Homepage ${name} header mismatch: ${home.response.headers.get(name)}`);
  assert((home.response.headers.get("permissions-policy")||"").includes("camera=()"),"Homepage Permissions-Policy missing");
  assert((home.response.headers.get("strict-transport-security")||"").includes("max-age=31536000"),"Homepage HSTS missing");

  const robots=await fetchText("/robots.txt");
  assert(robots.response.status===200,`robots.txt returned ${robots.response.status}`);
  assert(robots.body.includes("User-agent: *"),"robots.txt missing user-agent rule");
  assert(robots.body.includes("Sitemap: https://grailraven.com/sitemap.xml"),"robots.txt missing canonical sitemap");

  const sitemap=await fetchText("/sitemap.xml");
  assert(sitemap.response.status===200,`sitemap.xml returned ${sitemap.response.status}`);
  for(const url of [
    "https://grailraven.com/",
    "https://grailraven.com/search",
    "https://grailraven.com/catalogue",
    "https://grailraven.com/analyze",
    "https://grailraven.com/about",
    "https://grailraven.com/uk-pal-game-guide"
  ]) assert(sitemap.body.includes(`<loc>${url}</loc>`),`sitemap missing ${url}`);

  const guide=await fetchText("/uk-pal-game-guide");
  assert(guide.response.status===200,`Guide page returned ${guide.response.status}`);
  assert(guide.body.includes("<title>How to identify a UK/PAL retro game copy — GrailRaven</title>"),"Guide title metadata missing");
  assert(guide.body.includes('<link rel="canonical" href="https://grailraven.com/uk-pal-game-guide">'),"Guide canonical URL missing");
  assert(guide.body.includes("How to identify a UK/PAL retro game copy."),"Guide primary heading missing");


  // Verify the same public catalogue index is available to both browse and hunt flows.
  const cataloguePage=await fetchText("/catalogue");
  assert(cataloguePage.response.status===200,`Catalogue returned ${cataloguePage.response.status}`);
  const searchPage=await fetchText("/search");
  assert(searchPage.response.status===200,`Search returned ${searchPage.response.status}`);
  for(const [pageName,page] of [["Catalogue",cataloguePage],["Search",searchPage]]){
    assert(page.body.includes('<script src="catalogue-index.js"></script>'),`${pageName} missing public catalogue index script`);
    assert(page.body.includes('https://www.igdb.com/'),`${pageName} missing IGDB metadata attribution`);
  }

  const index=await fetchText("/catalogue-index.js");
  assert(index.response.status===200,`Public catalogue index returned ${index.response.status}`);
  const marker="window.BASE_CATALOGUE_INDEX=";
  const offset=index.body.indexOf(marker);
  assert(offset!==-1,"Public catalogue index assignment missing");
  let games;
  try{
    games=JSON.parse(index.body.slice(offset+marker.length).trim().replace(/;\s*$/,""));
  }catch(error){
    throw new Error("Public catalogue index is not valid JSON: "+error.message);
  }
  assert(Array.isArray(games),"Public catalogue index is not an array");
  assert(games.length>=8000,`Expanded catalogue unexpectedly small: ${games.length}`);
  assert(games.filter(game=>game.coverage==="PALSCOUT_DEEP").length===100,"100 PALScout-deep records not preserved in public index");
  assert(new Set(games.map(game=>game.id)).size===games.length,"Public catalogue index contains duplicate IDs");
  for(const platform of ["PS1","PS2","Dreamcast"]){
    assert(games.some(game=>game.platform===platform),`Public catalogue index missing ${platform}`);
  }
  assert(!index.body.includes('"artwork":'),"Unapproved artwork appeared in public catalogue index");

  const analyze=await fetchText("/analyze");
  assert(analyze.response.status===200,`Listing Checker returned ${analyze.response.status}`);
  for(const token of [
    "let photoFiles=[];",
    'let photoOcrText="";',
    "function aggregateGalleryEvidence",
    "function photoEvidenceSummary",
    "async function scanListingPhotos",
    'document.querySelector("#analyse").addEventListener("click",analyse)'
  ]) assert(analyze.body.includes(token),`Listing Checker runtime dependency missing in production: ${token}`);

  const account=await fetchText("/account");
  assert(account.response.status===200,`Account page returned ${account.response.status}`);
  assert(account.body.includes('<meta name="robots" content="noindex,follow">'),"Account page missing noindex");

  for(const internal of ["/design-preview.html","/pricing-coverage.html"]){
    const result=await fetchText(internal);
    assert(result.response.status===404,`${internal} should return 404, got ${result.response.status}`);
  }

  const health=await fetchText("/health");
  assert(health.response.status===200,`/health returned ${health.response.status}`);
  const healthJson=JSON.parse(health.body);
  assert(health.response.headers.get("x-content-type-options")==="nosniff","Health API missing nosniff");
  assert(health.response.headers.get("x-frame-options")==="DENY","Health API missing frame protection");
  assert((health.response.headers.get("content-security-policy")||"").includes("default-src 'none'"),"Health API missing restrictive CSP");
  assert(healthJson.marketplaceConfigured===false,"Saved Hunt monitor marketplace provider unexpectedly enabled");
  assert(healthJson.usMarketplaceEnabled===true,"Public US PriceCharting Marketplace route/secret is not active");
  assert(searchPage.body.includes('id="regionUs" type="checkbox">'),"US Marketplace region checkbox not enabled");
  const browser=await fetchText("/marketplace-us-public.js");
  assert(browser.response.status===200&&browser.body.includes("GrailRavenUSMarketplace"),"US Marketplace browser client unavailable");
  // Invalid title fails without making a paid API request.
  const badUs=await fetchText("/api/marketplace/pricecharting/us?game=A&platform=PS1");
  assert(badUs.response.status===400,`Public US Marketplace validation returned ${badUs.response.status}`);
  assert(healthJson.notificationsConfigured===false,"Notification provider unexpectedly enabled");

  const www=await fetch(wwwOrigin+"/search?smoke=1",{redirect:"manual"});
  assert(www.status===301,`www redirect returned ${www.status}, expected 301`);
  assert(www.headers.get("location")==="https://grailraven.com/search?smoke=1",`Unexpected www redirect target: ${www.headers.get("location")}`);

  console.log("Production smoke check passed for "+origin);
}

let lastError;
for(let attempt=1;attempt<=attempts;attempt++){
  try{
    console.log(`Production smoke attempt ${attempt}/${attempts}...`);
    await verify();
    process.exit(0);
  }catch(error){
    lastError=error;
    console.error(`Attempt ${attempt} failed: ${error.message}`);
    if(attempt<attempts)await sleep(delayMs);
  }
}
console.error("Production smoke check failed after retries.");
throw lastError;
