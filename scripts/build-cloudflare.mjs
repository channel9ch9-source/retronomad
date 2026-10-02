import { cp, mkdir, readdir, rm, copyFile, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root=process.cwd();
const out=join(root,"dist","public");
await rm(join(root,"dist"),{recursive:true,force:true});
await mkdir(out,{recursive:true});

const brand=JSON.parse(await readFile(join(root,"brand.json"),"utf8"));
for(const key of ["name","mark","domain","contactEmail","legacyPublicName"]){
  if(!String(brand[key]||"").trim())throw new Error(`brand.json is missing ${key}`);
}

const brandRuntime=`// Generated from brand.json. Public presentation only; no secrets here.\n(function(){\n  const brand=Object.freeze(${JSON.stringify(brand)});\n  window.APP_BRAND=brand;\n  const legacy=brand.legacyPublicName;\n  const replace=value=>typeof value===\"string\"?value.split(legacy).join(brand.name):value;\n  function apply(){\n    document.title=replace(document.title);\n    document.querySelectorAll('meta[name=\"description\"],meta[property=\"og:title\"],meta[property=\"og:description\"],meta[name=\"twitter:title\"],meta[name=\"twitter:description\"]').forEach(el=>{\n      if(el.content)el.content=replace(el.content);\n    });\n    document.querySelectorAll(\".mark\").forEach(el=>{\n      if(el.textContent.trim()===\"RN\")el.textContent=brand.mark;\n    });\n    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);\n    let node;\n    while((node=walker.nextNode())){\n      const parent=node.parentElement;\n      if(!parent||[\"SCRIPT\",\"STYLE\",\"NOSCRIPT\",\"TEXTAREA\"].includes(parent.tagName))continue;\n      if(node.nodeValue&&node.nodeValue.includes(legacy))node.nodeValue=replace(node.nodeValue);\n    }\n    document.querySelectorAll(\"[title],[aria-label]\").forEach(el=>{\n      if(el.hasAttribute(\"title\"))el.setAttribute(\"title\",replace(el.getAttribute(\"title\")));\n      if(el.hasAttribute(\"aria-label\"))el.setAttribute(\"aria-label\",replace(el.getAttribute(\"aria-label\")));\n    });\n  }\n  if(document.readyState===\"loading\")document.addEventListener(\"DOMContentLoaded\",apply,{once:true});\n  else apply();\n})();\n`;
await writeFile(join(out,"brand-runtime.js"),brandRuntime,"utf8");

const allowed=new Set([".html",".js",".json"]);
const skip=new Set(["package.json","brand.json"]);
for(const entry of await readdir(root,{withFileTypes:true})){
  if(!entry.isFile())continue;
  if(skip.has(entry.name))continue;
  if(!allowed.has(extname(entry.name)))continue;
  if(entry.name.startsWith("wrangler."))continue;
  const source=join(root,entry.name),dest=join(out,entry.name);
  if(extname(entry.name)===".html"){
    let html=await readFile(source,"utf8");
    const tag='<script src="brand-runtime.js" defer></script>';
    if(!html.includes(tag))html=html.includes("</head>")?html.replace("</head>",tag+"\n</head>"):tag+"\n"+html;
    await writeFile(dest,html,"utf8");
  }else{
    await copyFile(source,dest);
  }
}

await cp(join(root,"shared"),join(out,"shared"),{recursive:true});

const runtime=`// Generated for the Cloudflare same-origin deployment.\nconst config=Object.freeze({\n  accountSyncEnabled: true,\n  apiBase: \"\"\n});\nwindow.APP_CONFIG=config;\n// Legacy alias retained so existing browser code/storage migrations do not break.\nwindow.RETRONOMAD_CONFIG=config;\n`;
await writeFile(join(out,"runtime-config.js"),runtime,"utf8");

console.log(`Built Cloudflare static assets for ${brand.name} in dist/public`);
