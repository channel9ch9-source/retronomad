import test from "node:test";
import assert from "node:assert/strict";
import {preparePrivateParityRecheck,summarizePrivateParityRecheck}
 from "../shared/igdb-private-parity-recheck.js";

const csv=[{id:101,name:"Synthetic Private Name",platforms:["PS1"],typeBucket:"INCLUDE_CANDIDATE",gameTypeLabel:"Main Game",aliases:[]}];
const api={games:[{id:"ps1:other",platform:"PS1",externalRefs:{igdb:"202"},title:"Synthetic API Name"}]};
test("target only platform/provider identities missing on either side, never emit names or IDs",()=>{
 const targets=preparePrivateParityRecheck(csv,api);
 assert.deepEqual(targets.ids,["101","202"]);
 const summary=summarizePrivateParityRecheck(targets,[
  {id:101,platforms:[7]},{id:202,platforms:[8]}
 ],{platformIds:{PS1:7,PS2:8,Dreamcast:23}});
 assert.equal(summary.uniqueIdsQueried,2);
 assert.equal(summary.csvSelectedNotInApiCatalogue.stillPresentWithRequestedPlatform,1);
 assert.equal(summary.apiCandidateReferenceAbsentFromCsv.presentButDifferentPlatform,1);
 assert.equal(summary.rawIdsExported,false);
 assert.ok(!JSON.stringify(summary).includes("Synthetic"));
 assert.ok(!JSON.stringify(summary).includes("101"));
 assert.ok(!JSON.stringify(summary).includes("202"));
});
test("nonreturned rows and omitted platform lists are separately measured",()=>{
 const targets=preparePrivateParityRecheck(csv,api);
 const summary=summarizePrivateParityRecheck(targets,[{id:202}],{platformIds:{PS1:7,PS2:8,Dreamcast:23}});
 assert.equal(summary.csvSelectedNotInApiCatalogue.noRecordReturned,1);
 assert.equal(summary.apiCandidateReferenceAbsentFromCsv.presentButDifferentPlatform,1);
});
test("by-ID recheck rejects unexpected IDs and duplicates before reporting counts",()=>{
 const targets=preparePrivateParityRecheck(csv,api);
 assert.throws(()=>summarizePrivateParityRecheck(targets,[{id:999,platforms:[7]}],{platformIds:{PS1:7}}),/Unexpected provider/);
 assert.throws(()=>summarizePrivateParityRecheck(targets,[{id:101,platforms:[7]},{id:101,platforms:[7]}],{platformIds:{PS1:7}}),/Duplicate provider/);
});
