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

const brandRuntime=`// Generated from brand.json. Public presentation only; no secrets here.\n(function(){\n  const brand=Object.freeze(${JSON.stringify(brand)});\n  window.APP_BRAND=brand;\n  const legacy=brand.legacyPublicName;\n  const legacySpacedUpper=legacy.replace(/([a-z0-9])([A-Z])/g,\"$1 $2\").toUpperCase();\n  const blocked=new Set([\"SCRIPT\",\"STYLE\",\"NOSCRIPT\",\"TEXTAREA\"]);\n  const replace=value=>{\n    if(typeof value!==\"string\")return value;\n    return value.split(legacy).join(brand.name).split(legacySpacedUpper).join(brand.name.toUpperCase());\n  };\n  function replaceTextNode(node){\n    const parent=node.parentElement;\n    if(!parent||blocked.has(parent.tagName))return;\n    const next=replace(node.nodeValue||\"\");\n    if(next!==node.nodeValue)node.nodeValue=next;\n  }\n  function applyTree(root){\n    if(!root)return;\n    if(root.nodeType===Node.TEXT_NODE){replaceTextNode(root);return;}\n    if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_FRAGMENT_NODE)return;\n    if(root.nodeType===Node.ELEMENT_NODE&&blocked.has(root.tagName))return;\n    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);\n    let node;\n    while((node=walker.nextNode()))replaceTextNode(node);\n  }\n  function applyAttributes(root=document){\n    root.querySelectorAll?.(\"[title],[aria-label]\").forEach(el=>{\n      if(el.hasAttribute(\"title\")){\n        const value=replace(el.getAttribute(\"title\"));\n        if(value!==el.getAttribute(\"title\"))el.setAttribute(\"title\",value);\n      }\n      if(el.hasAttribute(\"aria-label\")){\n        const value=replace(el.getAttribute(\"aria-label\"));\n        if(value!==el.getAttribute(\"aria-label\"))el.setAttribute(\"aria-label\",value);\n      }\n    });\n  }\n  function apply(){\n    document.title=replace(document.title);\n    document.querySelectorAll('meta[name=\"description\"],meta[property=\"og:title\"],meta[property=\"og:description\"],meta[name=\"twitter:title\"],meta[name=\"twitter:description\"]').forEach(el=>{\n      if(el.content)el.content=replace(el.content);\n    });\n    document.querySelectorAll(\".mark\").forEach(el=>{\n      if(el.textContent.trim()===\"RN\")el.textContent=brand.mark;\n    });\n    applyTree(document.body);\n    applyAttributes();\n    const observer=new MutationObserver(mutations=>{\n      for(const mutation of mutations){\n        if(mutation.type===\"characterData\")replaceTextNode(mutation.target);\n        for(const node of mutation.addedNodes||[])applyTree(node);\n      }\n    });\n    observer.observe(document.body,{subtree:true,childList:true,characterData:true});\n  }\n  if(document.readyState===\"loading\")document.addEventListener(\"DOMContentLoaded\",apply,{once:true});\n  else apply();\n})();\n`;
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
