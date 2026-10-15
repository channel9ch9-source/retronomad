import test from "node:test";
import assert from "node:assert/strict";
import {parseIgdbCsv,igdbRef,igdbRefs,igdbReleaseYear} from "../shared/igdb-dump-csv.js";
import {inspectIgdbDumpRelations} from "../shared/igdb-dump-relations.js";

async function csv(text,requiredColumns=[]){
 const chunks=[...text].map(x=>x); // all quote and CRLF boundaries split between chunks
 const rows=[];
 for await(const row of parseIgdbCsv(chunks,{requiredColumns}))rows.push(row);
 return rows;
}
async function fixture(){
 const games=await csv('id,name,platforms,cover,game_type\r\n100,"Tomba!, Original","[7,8]",900,0\r\n101,"Jet Set Radio", "[23]",,0\r\n102,Unrelated,"[6]",,0\r\n'.replace('", "[23]"','","[23]"'),["id","name","platforms"]);
 const releaseDates=await csv('id,game,platform,date\n1,100,7,905990400\n2,100,8,1000000000\n3,100,7,946684800\n4,101,23,946684800\n5,102,6,946684800\n',["id","game","platform","date"]);
 const covers=await csv('id,game,image_id\n900,100,cov_alpha\n901,100,other_image\n902,101,cov_beta\n',["id","game","image_id"]);
 const alternativeNames=await csv('id,game,name\n300,100,Tombi!\n301,100,Tombi!\n302,101,Jet Grind Radio\n303,102,Ignore Other Game\n',["id","game","name"]);
 return {games,releaseDates,covers,alternativeNames};
}

test("CSV parser handles UTF-8 BOM, CRLF, doubled quotes, commas and multiline quoted cells across byte-sized chunks",async()=>{
 const parsed=await csv('\uFEFFid,name,note\r\n1,"He said ""Hello"", then left","Line one\nLine two"\r\n2,Simple,ok\r\n',["id","name","note"]);
 assert.deepEqual(parsed,[{id:"1",name:'He said "Hello", then left',note:"Line one\nLine two"},{id:"2",name:"Simple",note:"ok"}]);
});

test("IGDB ID arrays and timestamp years are strict and edition-neutral",()=>{
 assert.deepEqual(igdbRefs("[7,8,7]"),[7,8]);
 assert.deepEqual(igdbRefs("7"),[7]);
 assert.deepEqual(igdbRefs(""),[]);
 assert.equal(igdbRef("100"),100);
 assert.equal(igdbReleaseYear("946684800"),2000);
 assert.equal(igdbReleaseYear("2000-03-15T00:00:00Z"),2000);
 assert.equal(igdbReleaseYear("5"),null);
 assert.throws(()=>igdbRefs("[7, \"oops\"]"),/Invalid IGDB reference/);
 assert.throws(()=>igdbRefs("7;8"),/Unsupported/);
 assert.throws(()=>igdbRef("4e2"),/Invalid/);
});

test("four independent CSV tables join game metadata without inventing retail editions or offers",async()=>{
 const report=await inspectIgdbDumpRelations(await fixture(),{platformIds:{PS1:7,PS2:8,Dreamcast:23}});
 assert.equal(report.counts.selectedGames,2);
 assert.deepEqual(report.platformStats.PS1,{gameCount:1,withReleaseYear:1,withCoverMetadata:1,withAlternativeNames:1});
 assert.equal(report.platformStats.Dreamcast.withCoverMetadata,0); // cover id not pointed to from game row
 assert.equal(report.records.length,2);
 const tomba=report.records.find(x=>x.id===100);
 assert.equal(tomba.releaseYearByPlatform.PS1,1998);
 assert.equal(tomba.releaseYearByPlatform.PS2,2001);
 assert.deepEqual(tomba.aliases,["Tombi!"]);
 assert.equal(tomba.hasCoverMetadata,true);
 assert.equal(tomba.status,"REVIEW_GAME_TYPE_AND_RELEASE");
 assert.equal(tomba.editionVerified,false);
 assert.equal(tomba.marketplaceAvailable,false);
 assert.equal(report.noArtworkPublished,true);
 assert.equal(report.typeClassificationNotYetSupported,true);
});

test("unsafe CSV structures, duplicate game identities and wrong platform IDs fail closed",async()=>{
 await assert.rejects(()=>csv("id,name\n1,x,y\n",["id","name"]),/column count/);
 await assert.rejects(()=>csv('id,name\n1,"unclosed',["id","name"]),/Unterminated/);
 await assert.rejects(()=>csv("id,name\n1,foo\n",["id","name","platforms"]),/Missing required/);
 const raw=await fixture();
 await assert.rejects(()=>inspectIgdbDumpRelations({...raw,games:[raw.games[0],raw.games[0]]},{platformIds:{PS1:7}}),/Duplicate IGDB game/);
 await assert.rejects(()=>inspectIgdbDumpRelations(raw,{platformIds:{PS1:7,PS2:7}}),/Duplicate platform/);
});
