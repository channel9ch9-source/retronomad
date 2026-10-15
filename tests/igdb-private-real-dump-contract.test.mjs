import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("real IGDB private CSV workflow requires manual launch and uploads aggregates only",async()=>{
 const workflow=await readFile(new URL("../.github/workflows/igdb-private-real-dump-check.yml",import.meta.url),"utf8");
 assert.match(workflow,/workflow_dispatch:/);
 assert.doesNotMatch(workflow,/schedule:|cron:|push:/);
 assert.match(workflow,/IGDB_PRIVATE_REAL_DUMP_CONFIRM: PRIVATE_TEST_ONLY/);
 assert.match(workflow,/IGDB_CLIENT_ID:.*secrets\.IGDB_CLIENT_ID/);
 assert.match(workflow,/igdb-private-real-dump-check\.json/);
 assert.doesNotMatch(workflow,/upload-artifact[\s\S]*path:\s*\S+\.csv/);
});

test("private real CSV runner has temporary-file cleanup and never prints individual records or URLs",async()=>{
 const c=await readFile(new URL("../scripts/igdb-private-real-dump-check.mjs",import.meta.url),"utf8");
 assert.match(c,/await fs\.rm\(tmp,\{recursive:true,force:true\}\)/);
 assert.match(c,/noRawCsvInArtifact:true/);
 assert.match(c,/noArtworkPublished:true/);
 assert.match(c,/await enrichIgdbDumpRelations\(/);
 assert.match(c,/await inspectIgdbDumpRelations\(/);
 assert.match(c,/const endpointNames=\["games","release_dates","covers","alternative_names","game_types","platforms","genres","involved_companies","companies"\]/);
 assert.doesNotMatch(c,/console\.log\(metadata|console\.log\(full\.records|upload.*csv/i);
});
