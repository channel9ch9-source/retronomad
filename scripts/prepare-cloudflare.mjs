import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const brand=JSON.parse(await readFile("brand.json","utf8"));
const DB_NAME=process.env.RETRONOMAD_D1_NAME||"retronomad-prod";
const WORKER_NAME=process.env.RETRONOMAD_WORKER_NAME||"retronomad-app";

if(!process.env.CLOUDFLARE_API_TOKEN)throw new Error("CLOUDFLARE_API_TOKEN is required");
if(!process.env.CLOUDFLARE_ACCOUNT_ID)throw new Error("CLOUDFLARE_ACCOUNT_ID is required");

function wrangler(args){
  return execFileSync(
    process.platform==="win32"?"npx.cmd":"npx",
    ["wrangler",...args],
    {encoding:"utf8",stdio:["ignore","pipe","inherit"],env:process.env}
  );
}

function listDatabases(){
  const raw=wrangler(["d1","list","--json"]);
  const parsed=JSON.parse(raw);
  return Array.isArray(parsed)?parsed:(parsed.result||[]);
}

let rows=listDatabases();
let db=rows.find(x=>x.name===DB_NAME);
if(!db){
  console.log("Creating D1 database "+DB_NAME+" in Western Europe...");
  wrangler(["d1","create",DB_NAME,"--location","weur"]);
  rows=listDatabases();
  db=rows.find(x=>x.name===DB_NAME);
}
if(!db)throw new Error("Could not resolve D1 database after creation/list");

const databaseId=db.uuid||db.id||db.database_id;
if(!databaseId)throw new Error("D1 database result did not include an ID");

const vars={
  APP_ORIGIN:"self",
  PUBLIC_BRAND_NAME:String(brand.name||"App"),
  PUBLIC_BRAND_DOMAIN:String(brand.domain||""),
  PUBLIC_CONTACT_EMAIL:String(brand.contactEmail||""),
  MARKETPLACE_PROVIDER:"disabled",
  NOTIFICATION_PROVIDER:"disabled",
  CHECK_INTERVAL_MINUTES:"60"
};
if(process.env.AUTH_EMAIL_FROM)vars.AUTH_EMAIL_FROM=process.env.AUTH_EMAIL_FROM;
if(process.env.AUTH_EMAIL_WEBHOOK_URL)vars.AUTH_EMAIL_WEBHOOK_URL=process.env.AUTH_EMAIL_WEBHOOK_URL;

const config={
  "$schema":"./node_modules/wrangler/config-schema.json",
  name:WORKER_NAME,
  main:"./backend/alerts-worker.js",
  compatibility_date:"2026-09-23",
  workers_dev:true,
  assets:{
    directory:"./dist/public",
    binding:"ASSETS",
    run_worker_first:["/api/*","/health","/internal/*"]
  },
  d1_databases:[{
    binding:"DB",
    database_name:DB_NAME,
    database_id:databaseId,
    migrations_dir:"backend/migrations"
  }],
  vars,
  triggers:{crons:["0 * * * *"]},
  observability:{enabled:true}
};

await writeFile(".wrangler.deploy.jsonc",JSON.stringify(config,null,2)+"\n","utf8");
console.log("Prepared .wrangler.deploy.jsonc for "+WORKER_NAME+" using D1 "+DB_NAME+" and public brand "+vars.PUBLIC_BRAND_NAME);
