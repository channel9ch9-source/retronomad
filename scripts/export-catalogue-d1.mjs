import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  artworkRows, chunkRows, externalRefRows, normalizeAlias, sha256Hex, sqlString, stableCatalogueJson
} from "./catalogue-promotion-core.mjs";
import { mergeCatalogueSearchAliases } from "../shared/catalogue-core.js";

function arg(name,fallback=null){
  const prefix="--"+name+"=";
  return process.argv.find(x=>x.startsWith(prefix))?.slice(prefix.length)??fallback;
}
const input=arg("input");
const manifestPath=arg("manifest");
const outDir=arg("out-dir","promotion-output/d1");
if(!input||!manifestPath){
  console.error("Usage: node scripts/export-catalogue-d1.mjs --input=<catalogue.json> --manifest=<manifest.json> [--out-dir=...]");
  process.exit(2);
}
const catalogue=JSON.parse(await fs.readFile(input,"utf8"));
const manifest=JSON.parse(await fs.readFile(manifestPath,"utf8"));
const searchConfig=JSON.parse(await fs.readFile(new URL("../catalogue/search-aliases.json",import.meta.url),"utf8"));
const checksum=sha256Hex(stableCatalogueJson(catalogue));
if(checksum!==manifest.checksumSha256)throw new Error("Catalogue checksum does not match promotion manifest");
const datasetId=manifest.datasetId;
const day=manifest.createdAt;

await fs.rm(outDir,{recursive:true,force:true});
await fs.mkdir(outDir,{recursive:true});

const datasetSql=[
  "-- Immutable catalogue dataset metadata. Safe to rerun.",
  "INSERT OR IGNORE INTO catalogue_datasets",
  "(id,source,schema_version,checksum_sha256,created_at,game_count,alias_count,external_ref_count,artwork_count,manifest_json)",
  "VALUES ("+[
    sqlString(datasetId),sqlString(manifest.source),Number(manifest.schemaVersion),sqlString(manifest.checksumSha256),
    sqlString(day),Number(manifest.counts.games),Number(manifest.counts.aliases),Number(manifest.counts.externalRefs),
    Number(manifest.counts.artwork),sqlString(JSON.stringify(manifest))
  ].join(",")+");",""
].join("\n");
await fs.writeFile(path.join(outDir,"00-dataset.sql"),datasetSql,"utf8");

const gameRows=catalogue.games.map(g=>[
  datasetId,g.id,g.platform,g.title,normalizeAlias(g.title),g.releaseYear??null,g.developer??null,g.publisher??null,
  JSON.stringify(g.genres||[]),g.releaseIntelligence?.coverage||"BASE_ONLY",JSON.stringify(g.provenance||[])
]);
const aliasRows=[];
const refRows=[];
const artRows=[];
for(const g of catalogue.games){
  const canonicalNorms=new Set((g.aliases||[]).map(normalizeAlias).filter(Boolean));
  for(const alias of mergeCatalogueSearchAliases(
    g,
    searchConfig.aliases||{},
    searchConfig.suppressAliases||{}
  )){
    const norm=normalizeAlias(alias);
    aliasRows.push([
      datasetId,
      g.id,
      alias,
      norm,
      canonicalNorms.has(norm)?"CANONICAL_CATALOGUE":"CURATED_SEARCH"
    ]);
  }
  for(const ref of externalRefRows(g)){
    refRows.push([datasetId,g.id,ref.provider,ref.externalId,ref.canonicalUrl,JSON.stringify(ref.metadata||{})]);
  }
  for(const art of artworkRows(g)){
    artRows.push([datasetId,g.id,art.kind,art.source,art.sourceRef,art.assetUrl,art.rightsStatus,art.attribution,JSON.stringify(art.metadata||{})]);
  }
}

function valuesSql(table,columns,rows,prefix){
  return chunkRows(rows,250).map((chunk,index)=>{
    const values=chunk.map(row=>"("+row.map(v=>typeof v==="number"?String(v):sqlString(v)).join(",")+")").join(",\n");
    const sql=`-- ${prefix} chunk ${index+1}\nINSERT OR IGNORE INTO ${table} (${columns.join(",")}) VALUES\n${values};\n`;
    const name=`${prefix}-${String(index+1).padStart(3,"0")}.sql`;
    return {name,sql};
  });
}

const files=[
  ...valuesSql("catalogue_v2_games",
    ["dataset_id","game_id","platform","title","title_norm","release_year","developer","publisher","genres_json","release_coverage","provenance_json"],
    gameRows,"10-games"),
  ...valuesSql("catalogue_v2_aliases",
    ["dataset_id","game_id","alias_display","alias_norm","source"],aliasRows,"20-aliases"),
  ...valuesSql("catalogue_v2_external_refs",
    ["dataset_id","game_id","provider","external_id","canonical_url","metadata_json"],refRows,"30-refs"),
  ...valuesSql("catalogue_v2_artwork",
    ["dataset_id","game_id","kind","source","source_ref","asset_url","rights_status","attribution","metadata_json"],artRows,"40-artwork")
];
for(const file of files)await fs.writeFile(path.join(outDir,file.name),file.sql,"utf8");

const activationSql=`INSERT INTO catalogue_active_dataset (singleton_id,dataset_id,activated_at)
VALUES (1,${sqlString(datasetId)},CURRENT_TIMESTAMP)
ON CONFLICT(singleton_id) DO UPDATE SET
 dataset_id=excluded.dataset_id,
 activated_at=excluded.activated_at;\n`;
await fs.writeFile(path.join(outDir,"90-activate.sql"),activationSql,"utf8");

const summary={
  datasetId,
  checksumSha256:manifest.checksumSha256,
  counts:{games:gameRows.length,aliases:aliasRows.length,externalRefs:refRows.length,artwork:artRows.length},
  stagingFiles:1+files.length,
  activationFile:"90-activate.sql"
};
await fs.writeFile(path.join(outDir,"export-summary.json"),JSON.stringify(summary,null,2)+"\n","utf8");
console.log(JSON.stringify(summary,null,2));
