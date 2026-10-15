// Aggregate-only verdict for an audit where exact CSV/API identity differs.
// A reconciled result is NOT exact parity, a release authorisation, or permission
// to auto-include held titles. It only verifies all differences are accounted for.
export function resolveIgdbParityOutcome(report){
 if(!report||!report.checks||!report.diagnostics||!Array.isArray(report.failedChecks))
  throw new Error("Invalid private parity report");
 const checks=report.checks,diagnostics=report.diagnostics;
 const flags={exactParity:false,allDifferencesExplained:false,publicationApproved:false,
   heldProviderRecordsStillExcluded:true,snapshotDifferencesNeedLaterReview:true};
 if(report.status==="PARITY_PASS"&&report.failedChecks.length===0)
  return {...flags,exactParity:true,allDifferencesExplained:true,
   snapshotDifferencesNeedLaterReview:false,status:"PARITY_PASS",reason:"EXACT_PROVIDER_ID_PARITY"};
 if(report.status!=="REVIEW_REQUIRED")return {...flags,status:"REVIEW_REQUIRED",reason:"PREVIOUS_CHECK_FAILED"};
 const hardBlockers=[
  "changedSeedIdentity","unmappedSeeds","mappingMissing","mappingWrongRef",
  "mappingWrongTitle","mappingExcluded","duplicateApiRefs","invalidApiRef",
  "apiRefsExcluded","apiBaseTitleDrift","apiBaseYearDrift","apiBaseMissingAliases",
  "apiBaseReferencesNotChosenByCsvDedup"
 ];
 const hasHardFailure=hardBlockers.some(k=>checks[k]!==0)||
  checks.expectedSeeds!==100||checks.preservedSeeds!==100||
  checks.apiSeedCount!==100||checks.explicitMappingCount!==9||
  report.failedChecks.some(k=>!["apiRefsAbsentFromCsv","selectedCsvMissingFromApi"].includes(k));
 if(hasHardFailure)return {...flags,status:"REVIEW_REQUIRED",reason:"SAFETY_OR_METADATA_DRIFT"};
 const held=diagnostics.missingSelectedCsvPair,missing=diagnostics.missingCsvReference;
 const recheck=diagnostics.liveApiByIdRecheck;
 if(!diagnostics.reviewEvidenceAvailable||!held||!missing||
    recheck?.status!=="TARGETED_PRIVATE_API_ID_RECHECK_COMPLETED"||
    !recheck.csvSelectedNotInApiCatalogue||!recheck.apiCandidateReferenceAbsentFromCsv)
  return {...flags,status:"REVIEW_REQUIRED",reason:"SOURCE_EVIDENCE_INCOMPLETE"};
 const csv=recheck.csvSelectedNotInApiCatalogue,api=recheck.apiCandidateReferenceAbsentFromCsv;
 const seedHolds=held.apiHeldSeedAmbiguity;
 const csvSnapshotOnly=held.noReviewEvidenceOfCause;
 const unsupported=held.apiHeldAmbiguousCanonicalTitle+held.apiSuppressedSameTitle+
  held.apiHeldCanonicalIdCollision+held.matchesExistingDeepSeedTitleOrAlias;
 const unresolved=!Number.isSafeInteger(seedHolds)||!Number.isSafeInteger(csvSnapshotOnly)||
  seedHolds<0||csvSnapshotOnly<0||
  unsupported!==0||
  checks.selectedCsvMissingFromApi!==seedHolds+csvSnapshotOnly||
  csv.total!==checks.selectedCsvMissingFromApi||
  csv.stillPresentWithRequestedPlatform!==seedHolds||
  csv.noRecordReturned!==csvSnapshotOnly||csv.presentButDifferentPlatform!==0||
  api.total!==checks.apiRefsAbsentFromCsv||
  api.stillPresentWithRequestedPlatform!==checks.apiRefsAbsentFromCsv||
  api.noRecordReturned!==0||api.presentButDifferentPlatform!==0||
  missing.sourceOnlyNewIdentity!==checks.apiRefsAbsentFromCsv||
  missing.sourceIdPresentOtherPlatforms!==0||
  missing.affectedDeepSeeds!==0||
  missing.affectedBaseOnly!==checks.apiRefsAbsentFromCsv;
 if(unresolved)return {...flags,status:"REVIEW_REQUIRED",reason:"UNEXPLAINED_OR_INCONSISTENT_DIFFERENCES"};
 // A small, observed daily snapshot divergence is recorded as such, not erased.
 // Too much divergence requires investigation even if an API lookup responds.
 if(csvSnapshotOnly>3||checks.apiRefsAbsentFromCsv>3)
  return {...flags,status:"REVIEW_REQUIRED",reason:"SNAPSHOT_DELTA_TOO_LARGE"};
 return {...flags,
  status:"RECONCILED_WITH_REVIEW_HOLDS",
  reason:"HELD_AMBIGUOUS_SEEDS_AND_SMALL_SOURCE_SNAPSHOT_DIFFERENCES",
  allDifferencesExplained:true,heldSeedCandidatePairs:seedHolds,
  csvOnlyIdsAbsentFromLiveApi:csvSnapshotOnly,
  apiOnlyIdsAbsentFromCsv:checks.apiRefsAbsentFromCsv
 };
}
