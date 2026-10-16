// Strictly offline benchmark for a partner-provided inventory file.
// This entrypoint NEVER fetches URLs, sends messages, publishes rows or writes D1.
// Usage documented in RETAILER_FEED_INTAKE_V1.md. All logs are fixed safe strings.
import fs from "node:fs/promises";
import path from "node:path";
import {parseRetailerFeed,benchmarkRetailerFeed,requireRetailerBenchmarkRights} from "../shared/retailer-feed-benchmark.js";

const options=Object.fromEntries(process.argv.slice(2).map(arg=>{
 const i=arg.indexOf("=");
 return i<3||!arg.startsWith("--")?[null,null]:[arg.slice(2,i),arg.slice(i+1)];
}).filter(([k])=>k));
async function main(){
 const {feed,mapping,rights,out}=options;
 if(!feed||!mapping||!rights||!out||Object.keys(options).some(k=>
  !["feed","mapping","rights","out","synthetic-fixture"].includes(k))||
  (options["synthetic-fixture"]!==undefined&&options["synthetic-fixture"]!=="true"))
  throw new Error("MISSING_OR_UNKNOWN_ARGUMENTS");
 const format=path.extname(feed).toLowerCase()===".csv"?"csv":
  path.extname(feed).toLowerCase()===".json"?"json":null;
 if(!format)throw new Error("UNSUPPORTED_FEED_FORMAT");
 // Refuse unapproved/expired sources before reading any vendor inventory bytes.
 const [configRaw,rightsRaw]=await Promise.all([
  fs.readFile(mapping,"utf8"),fs.readFile(rights,"utf8")
 ]);
 let config,permission;
 try{config=JSON.parse(configRaw);permission=JSON.parse(rightsRaw);}
 catch{throw new Error("CONFIG_JSON_INVALID");}
 requireRetailerBenchmarkRights(permission,config);
 const raw=await fs.readFile(feed,"utf8");
 const rows=parseRetailerFeed(raw,format);
 const report=benchmarkRetailerFeed(rows,permission,config,{fixture:options["synthetic-fixture"]==="true"});
 const result=JSON.stringify(report,null,2)+"\n";
 // Only fixed-target/aggregate output can ever be written. Never include raw data.
 await fs.mkdir(path.dirname(out),{recursive:true});
 await fs.writeFile(out,result,{encoding:"utf8",flag:"wx",mode:0o600});
 console.log("PRIVATE_RETAILER_BENCHMARK_COMPLETE");
 console.log("Aggregate report written. Check only the requested local output path.");
}
main().catch(error=>{
 const allowed=new Set([
  "MISSING_OR_UNKNOWN_ARGUMENTS","UNSUPPORTED_FEED_FORMAT","CONFIG_JSON_INVALID",
  "RIGHTS_MANIFEST_REQUIRED","FEED_MAPPING_REQUIRED","PROVIDER_MISMATCH",
  "PRIVATE_BENCHMARK_PERMISSION_REQUIRED","WRITTEN_AUTHORISATION_REFERENCE_REQUIRED",
  "PARTNER_HOST_ALLOWLIST_REQUIRED","PARTNER_PERMISSION_EXPIRED_OR_UNDATED",
  "FEED_MAPPING_COLUMNS_REQUIRED","MISSING_FEED_COLUMN_MAPPING","UNSAFE_FEED_COLUMN_MAPPING",
  "FEED_SIZE_INVALID","JSON_PARSE_FAILED","JSON_FEED_ROWS_INVALID","FEED_TOO_MANY_ROWS",
  "CSV_QUOTE_INVALID","CSV_CELL_OR_WIDTH_TOO_LARGE","CSV_UNTERMINATED_QUOTE",
  "CSV_ROW_COUNT_INVALID","CSV_HEADER_DUPLICATE_OR_EMPTY","CSV_ROW_WIDTH_MISMATCH",
  "FRESHNESS_THRESHOLD_INVALID","FEED_EMPTY_OR_REQUIRED_COLUMNS_ABSENT"
 ]);
 const code=allowed.has(error?.message)?error.message:"PRIVATE_BENCHMARK_FAILED";
 console.error(code);
 process.exitCode=1;
});
