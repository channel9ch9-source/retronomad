// PRIVATE LOCAL CSV relationship check. NEVER wired into a public endpoint,
// scheduled workflow or automatic production catalogue promotion.
import {createReadStream} from "node:fs";
import {access,stat} from "node:fs/promises";
import {parseIgdbCsv} from "../shared/igdb-dump-csv.js";
import {inspectIgdbDumpRelations} from "../shared/igdb-dump-relations.js";
import {enrichIgdbDumpRelations} from "../shared/igdb-dump-enrichment.js";

function flag(name){
 const prefix="--"+name+"=";
 return process.argv.find(x=>x.startsWith(prefix))?.slice(prefix.length);
}
if(flag("confirm")!=="PRIVATE_LOCAL_DATA_ONLY")throw new Error("Private CSV preview only. Set --confirm=PRIVATE_LOCAL_DATA_ONLY; no public import.");
const paths={
 games:flag("games"),
 releaseDates:flag("release-dates"),
 covers:flag("covers"),
 alternativeNames:flag("alternative-names"),
 gameTypes:flag("game-types"),
 platforms:flag("platforms"),
 genres:flag("genres"),
 involvedCompanies:flag("involved-companies"),
 companies:flag("companies")
};
const required={
 games:["id","name","platforms"],
 releaseDates:["id","game","platform","date"],
 covers:["id","game","image_id"],
 alternativeNames:["id","game","name"],
 gameTypes:["id","type"],
 platforms:["id","name"],
 genres:["id","name"],
 involvedCompanies:["id","game","company","developer","publisher"],
 companies:["id","name"]
};
for(const [label,file] of Object.entries(paths)){
 if(!file)throw new Error("Missing local CSV argument for "+label);
 const info=await stat(file);
 if(!info.isFile()||info.size===0)throw new Error("Expected a nonempty private CSV file for "+label);
 await access(file);
}
const platformIds={};
for(const entry of String(flag("platform-ids")||"").split(",")){
 if(!entry)continue;
 const match=/^(PS1|PS2|Dreamcast):([1-9][0-9]*)$/.exec(entry);
 if(!match||Object.hasOwn(platformIds,match?.[1]))throw new Error("Use --platform-ids=PS1:N,PS2:N,Dreamcast:N (validated IGDB platform IDs)");
 platformIds[match[1]]=Number(match[2]);
}
if(!Object.keys(platformIds).length)throw new Error("Explicit validated IGDB platform IDs are required.");

const tables=Object.fromEntries(Object.entries(paths).map(([key,file])=>[
 key,
 parseIgdbCsv(createReadStream(file,{encoding:"utf8",highWaterMark:64*1024}),{requiredColumns:required[key]})
]));

const report=await enrichIgdbDumpRelations(
  await inspectIgdbDumpRelations(tables,{platformIds}),
  tables,{platformIds}
);
// Report only aggregate statistics. Never print actual game rows, seller data,
// third-party CSV records, signed download URLs or input file paths.
console.log(JSON.stringify({
 mode:report.mode,
 schemaVersion:1,
 noCanonicalChanges:true,
 noD1Changes:true,
 noArtworkPublished:true,
 recordsExported:false,
 typeClassificationNotYetSupported:report.typeClassificationNotYetSupported,
 counts:report.counts,
 platformStats:report.platformStats,
 typeCounts:report.typeCounts,
 linkedCompanyRelations:report.linkedCompanyRelations,
 missing:report.missing
},null,2));
