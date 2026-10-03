import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const brand=JSON.parse(await readFile("brand.json","utf8"));
const PUBLIC_BRAND_NAME=String(brand.name||"").trim();
const TRANSACTIONAL_EMAIL=String(brand.transactionalEmail||"").trim();
if(!PUBLIC_BRAND_NAME||!/^[A-Za-z0-9 .&'’-]+$/.test(PUBLIC_BRAND_NAME)){
  throw new Error("brand.json contains an invalid public brand name");
}
if(!TRANSACTIONAL_EMAIL||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(TRANSACTIONAL_EMAIL)){
  throw new Error("brand.json contains an invalid transactional email address");
}

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

// Keep the source Worker brand-neutral/legacy-compatible. Generate the deployed
// copy from the central public-brand configuration so another rename does not
// require editing authentication/monitor logic.
const workerSource=await readFile("backend/alerts-worker.js","utf8");
const generatedWorker=workerSource.split("RetroNomad").join(PUBLIC_BRAND_NAME);
const generatedWorkerPath="backend/alerts-worker.generated.js";
await writeFile(generatedWorkerPath,generatedWorker,"utf8");

const vars={
  APP_ORIGIN:"self",
  PUBLIC_BRAND_NAME,
  PUBLIC_BRAND_DOMAIN:String(brand.domain||""),
  PUBLIC_CONTACT_EMAIL:String(brand.contactEmail||""),
  AUTH_EMAIL_FROM:process.env.AUTH_EMAIL_FROM||`${PUBLIC_BRAND_NAME} <${TRANSACTIONAL_EMAIL}>`,
  MARKETPLACE_PROVIDER:"disabled",
  NOTIFICATION_PROVIDER:"disabled",
  CHECK_INTERVAL_MINUTES:"60"
};
if(process.env.AUTH_EMAIL_WEBHOOK_URL)vars.AUTH_EMAIL_WEBHOOK_URL=process.env.AUTH_EMAIL_WEBHOOK_URL;

const config={
  "$schema":"./node_modules/wrangler/config-schema.json",
  name:WORKER_NAME,
  main:"./"+generatedWorkerPath,
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
console.log("Prepared .wrangler.deploy.jsonc for "+WORKER_NAME+" using D1 "+DB_NAME+" and public brand "+PUBLIC_BRAND_NAME);
