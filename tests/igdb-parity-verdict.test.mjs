import test from "node:test";
import assert from "node:assert/strict";
import {resolveIgdbParityOutcome} from "../shared/igdb-parity-verdict.js";

function safeReport(){
 return {
  status:"REVIEW_REQUIRED",
  failedChecks:["apiRefsAbsentFromCsv","selectedCsvMissingFromApi"],
  checks:{
   expectedSeeds:100,preservedSeeds:100,apiSeedCount:100,explicitMappingCount:9,
   changedSeedIdentity:0,unmappedSeeds:0,mappingMissing:0,mappingWrongRef:0,
   mappingWrongTitle:0,mappingExcluded:0,duplicateApiRefs:0,invalidApiRef:0,
   apiRefsExcluded:0,apiBaseTitleDrift:0,apiBaseYearDrift:0,
   apiBaseMissingAliases:0,apiBaseReferencesNotChosenByCsvDedup:0,
   apiRefsAbsentFromCsv:1,selectedCsvMissingFromApi:115
  },
  diagnostics:{
   reviewEvidenceAvailable:true,
   missingCsvReference:{
    sourceOnlyNewIdentity:1,sourceIdPresentOtherPlatforms:0,
    affectedDeepSeeds:0,affectedBaseOnly:1
   },
   missingSelectedCsvPair:{
    apiHeldAmbiguousCanonicalTitle:0,apiSuppressedSameTitle:0,
    apiHeldSeedAmbiguity:114,apiHeldCanonicalIdCollision:0,
    matchesExistingDeepSeedTitleOrAlias:0,noReviewEvidenceOfCause:1
   },
   liveApiByIdRecheck:{
    status:"TARGETED_PRIVATE_API_ID_RECHECK_COMPLETED",
    csvSelectedNotInApiCatalogue:{
     total:115,stillPresentWithRequestedPlatform:114,
     presentButDifferentPlatform:0,noRecordReturned:1
    },
    apiCandidateReferenceAbsentFromCsv:{
     total:1,stillPresentWithRequestedPlatform:1,
     presentButDifferentPlatform:0,noRecordReturned:0
    }
   }
  }
 };
}
test("only evidence-accounted intentional holds and small source snapshot differences reconcile",()=>{
 const report=safeReport(),r=resolveIgdbParityOutcome(report);
 assert.equal(r.status,"RECONCILED_WITH_REVIEW_HOLDS");
 assert.equal(r.exactParity,false);
 assert.equal(r.allDifferencesAccountedFor,true);
 assert.equal(r.allDifferencesExplained,false);
 assert.equal(r.publicationApproved,false);
 assert.equal(r.heldProviderRecordsStillExcluded,true);
 assert.equal(r.heldSeedCandidatePairs,114);
 assert.equal(r.csvOnlyIdsAbsentFromLiveApi,1);
 assert.equal(r.apiOnlyIdsAbsentFromCsv,1);
 assert.equal(report.status,"REVIEW_REQUIRED");
});
test("missing live API check cannot be silently accepted",()=>{
 const r=safeReport();
 r.diagnostics.liveApiByIdRecheck={status:"TARGETED_PRIVATE_API_ID_RECHECK_UNAVAILABLE"};
 assert.equal(resolveIgdbParityOutcome(r).status,"REVIEW_REQUIRED");
});
test("hard seed, curated mapping, titles and alias drift always block reconciliation",()=>{
 for(const field of ["changedSeedIdentity","mappingWrongTitle","apiBaseYearDrift","apiBaseMissingAliases","apiRefsExcluded"]){
  const r=safeReport();r.checks[field]=1;
  assert.equal(resolveIgdbParityOutcome(r).reason,"SAFETY_OR_METADATA_DRIFT");
 }
});
test("ambiguous provider mismatch that is not a recorded seed hold remains red",()=>{
 const r=safeReport();
 r.diagnostics.missingSelectedCsvPair.apiHeldSeedAmbiguity=113;
 r.diagnostics.missingSelectedCsvPair.apiHeldCanonicalIdCollision=1;
 assert.equal(resolveIgdbParityOutcome(r).status,"REVIEW_REQUIRED");
});
test("API by-ID still present but not imported is not explained as snapshot drift",()=>{
 const r=safeReport();
 r.diagnostics.liveApiByIdRecheck.csvSelectedNotInApiCatalogue.stillPresentWithRequestedPlatform=115;
 r.diagnostics.liveApiByIdRecheck.csvSelectedNotInApiCatalogue.noRecordReturned=0;
 assert.equal(resolveIgdbParityOutcome(r).status,"REVIEW_REQUIRED");
});
test("platform migration, missing source API ID or large drift remains red",()=>{
 let r=safeReport();
 r.diagnostics.liveApiByIdRecheck.apiCandidateReferenceAbsentFromCsv.presentButDifferentPlatform=1;
 r.diagnostics.liveApiByIdRecheck.apiCandidateReferenceAbsentFromCsv.stillPresentWithRequestedPlatform=0;
 assert.equal(resolveIgdbParityOutcome(r).status,"REVIEW_REQUIRED");
 r=safeReport();r.checks.apiRefsAbsentFromCsv=4;
 r.diagnostics.missingCsvReference.sourceOnlyNewIdentity=4;
 r.diagnostics.missingCsvReference.affectedBaseOnly=4;
 r.diagnostics.liveApiByIdRecheck.apiCandidateReferenceAbsentFromCsv.total=4;
 r.diagnostics.liveApiByIdRecheck.apiCandidateReferenceAbsentFromCsv.stillPresentWithRequestedPlatform=4;
 assert.equal(resolveIgdbParityOutcome(r).reason,"SNAPSHOT_DELTA_TOO_LARGE");
});
test("exact parity passes only without failed checks",()=>{
 const r=safeReport();
 r.status="PARITY_PASS";r.failedChecks=[];
 const result=resolveIgdbParityOutcome(r);
 assert.equal(result.status,"PARITY_PASS");
 assert.equal(result.exactParity,true);
 assert.equal(result.allDifferencesAccountedFor,true);
 assert.equal(result.publicationApproved,false);
});
