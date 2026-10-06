import fs from "node:fs/promises";
import path from "node:path";
import { buildCatalogueSearchIndex, validateCatalogue } from "../shared/catalogue-core.js";

const root=process.cwd();
const sourcePath=path.join(root,"catalogue","base-catalogue.json");
const outputPath=path.join(root,"catalogue-index.js");

const document=JSON.parse(await fs.readFile(sourcePath,"utf8"));
const validation=validateCatalogue(document);
if(!validation.ok){
  console.error(validation.errors.join("\n"));
  process.exit(1);
}
const index=buildCatalogueSearchIndex(document);
const counts=index.reduce((acc,row)=>{
  acc[row.platform]=(acc[row.platform]||0)+1;
  return acc;
},{});
const js=`// Generated from catalogue/base-catalogue.json. Do not edit by hand.\nwindow.BASE_CATALOGUE_INDEX=${JSON.stringify(index)};\n`;
await fs.writeFile(outputPath,js,"utf8");
console.log(`Built catalogue-index.js with ${index.length} games: ${JSON.stringify(counts)}`);
