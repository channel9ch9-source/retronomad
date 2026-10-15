import test from "node:test";
import assert from "node:assert/strict";
import {parseIgdbCsv,igdbRefs} from "../shared/igdb-dump-csv.js";
import {inspectIgdbDumpRelations} from "../shared/igdb-dump-relations.js";
import {enrichIgdbDumpRelations} from "../shared/igdb-dump-enrichment.js";
async function csv(text){
 const rows=[];
 for await(const row of parseIgdbCsv([text]))rows.push(row);
 return rows;
}
async function fixture(){
 return {
  games:await csv('id,name,platforms,cover,game_type,version_parent,genres,involved_companies\n100,Tomba!,{7},900,1,,{20,21},{50,51}\n101,Bonus DLC,{7},,2,,{},{}\n102,Revision,{23},,1,100,{},{}\n103,Other,{100},,1,,{},{}\n'),
  releaseDates:await csv('id,game,platform,date\n1,100,7,1998-11-01 00:00:00+00\n2,102,23,1999-09-01\n'),
  covers:await csv('id,game,image_id\n900,100,cov_alpha\n901,102,cov_wrong\n'),
  alternativeNames:await csv('id,game,name\n70,100,Tombi!\n'),
  gameTypes:await csv('id,type\n1,Main Game\n2,DLC / Addon\n'),
  platforms:await csv('id,name\n7,PlayStation\n23,Dreamcast\n'),
  genres:await csv('id,name\n20,Platform\n21,Adventure\n'),
  involvedCompanies:await csv('id,game,company,developer,publisher\n50,100,88,true,false\n51,100,89,false,true\n'),
  companies:await csv('id,name\n88,Studio A\n89,Label B\n')
 };
}
test("real IGDB brace-formatted LONG[] columns parse as distinct safe positive ids",()=>{
 assert.deepEqual(igdbRefs("{7,8,7}"),[7,8]);
 assert.deepEqual(igdbRefs("{ 7, 8 }"),[7,8]);
 assert.deepEqual(igdbRefs("{}"),[]);
 assert.throws(()=>igdbRefs("{7,abc}"),/Invalid IGDB numeric brace/);
 assert.throws(()=>igdbRefs("{7, 0}"),/Invalid IGDB numeric brace/);
 assert.throws(()=>igdbRefs("{7};process.exit(0)"),/Invalid IGDB numeric brace|Unsupported/);
});
test("nine related CSV dumps reconstruct game types, genre names, developer/publisher names without claiming exact editions",async()=>{
 const source=await fixture();
 const core=await inspectIgdbDumpRelations(source,{platformIds:{PS1:7,Dreamcast:23}});
 assert.equal(core.counts.selectedGames,3);
 const got=await enrichIgdbDumpRelations(core,source,{platformIds:{PS1:7,Dreamcast:23}});
 assert.deepEqual(got.typeCounts,{INCLUDE_CANDIDATE:1,EXCLUDE_VERSION:1,EXCLUDE_NON_BASE:1,REVIEW:0});
 const t=got.records.find(x=>x.id===100);
 assert.deepEqual(t.aliases,["Tombi!"]);
 assert.equal(t.releaseYearByPlatform.PS1,1998);
 assert.deepEqual(t.genres,["Platform","Adventure"]);
 assert.deepEqual(t.developers,["Studio A"]);
 assert.deepEqual(t.publishers,["Label B"]);
 assert.equal(t.gameTypeLabel,"Main Game");
 assert.equal(t.typeBucket,"INCLUDE_CANDIDATE");
 assert.equal(t.editionVerified,false);
 assert.equal(t.marketplaceAvailable,false);
 assert.equal(got.noArtworkPublished,true);
 assert.equal(got.missing.companyRelation,0);
 assert.equal(got.missing.gameType,0);
});
test("wrong IGDB console ID and invalid bool encoding fail closed",async()=>{
 const source=await fixture();
 const core=await inspectIgdbDumpRelations(source,{platformIds:{PS1:7}});
 await assert.rejects(()=>enrichIgdbDumpRelations(core,source,{platformIds:{PS1:23}}),/Platform ID|console name/);
 const another=await fixture();another.involvedCompanies[0].developer="sometimes";
 const core2=await inspectIgdbDumpRelations(another,{platformIds:{PS1:7}});
 await assert.rejects(()=>enrichIgdbDumpRelations(core2,another,{platformIds:{PS1:7}}),/Unknown IGDB boolean/);
});
