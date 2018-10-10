/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const BULK_DOWNLOAD_PSA_REVIEW_PDF :string = 'BULK_DOWNLOAD_PSA_REVIEW_PDF';
const bulkDownloadPSAReviewPDF :RequestSequence = newRequestSequence(BULK_DOWNLOAD_PSA_REVIEW_PDF);

const CHANGE_PSA_STATUS :string = 'CHANGE_PSA_STATUS';
const changePSAStatus :RequestSequence = newRequestSequence(CHANGE_PSA_STATUS);

const CHECK_PSA_PERMISSIONS :string = 'CHECK_PSA_PERMISSIONS';
const checkPSAPermissions :RequestSequence = newRequestSequence(CHECK_PSA_PERMISSIONS);

const DOWNLOAD_PSA_REVIEW_PDF :string = 'DOWNLOAD_PSA_REVIEW_PDF';
const downloadPSAReviewPDF :RequestSequence = newRequestSequence(DOWNLOAD_PSA_REVIEW_PDF);

const LOAD_CASE_HISTORY :string = 'LOAD_CASE_HISTORY';
const loadCaseHistory :RequestSequence = newRequestSequence(LOAD_CASE_HISTORY);

const LOAD_PSA_DATA :string = 'LOAD_PSA_DATA';
const loadPSAData :RequestSequence = newRequestSequence(LOAD_PSA_DATA);

const LOAD_PSAS_BY_DATE :string = 'LOAD_PSAS_BY_DATE';
const loadPSAsByDate :RequestSequence = newRequestSequence(LOAD_PSAS_BY_DATE);

const REFRESH_PSA_NEIGHBORS :string = 'REFRESH_PSA_NEIGHBORS';
const refreshPSANeighbors :RequestSequence = newRequestSequence(REFRESH_PSA_NEIGHBORS);

const REFRESH_HEARING_NEIGHBORS :string = 'REFRESH_HEARING_NEIGHBORS';
const refreshHearingNeighbors :RequestSequence = newRequestSequence(REFRESH_HEARING_NEIGHBORS);

const UPDATE_SCORES_AND_RISK_FACTORS :string = 'UPDATE_SCORES_AND_RISK_FACTORS';
const updateScoresAndRiskFactors :RequestSequence = newRequestSequence(UPDATE_SCORES_AND_RISK_FACTORS);

const UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS :string = 'UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS';
const updateOutcomesAndReleaseCondtions :RequestSequence = newRequestSequence(UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS);

export {
  BULK_DOWNLOAD_PSA_REVIEW_PDF,
  CHANGE_PSA_STATUS,
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSA_DATA,
  LOAD_PSAS_BY_DATE,
  REFRESH_PSA_NEIGHBORS,
  REFRESH_HEARING_NEIGHBORS,
  UPDATE_SCORES_AND_RISK_FACTORS,
  UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS,
  bulkDownloadPSAReviewPDF,
  changePSAStatus,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  refreshPSANeighbors,
  refreshHearingNeighbors,
  updateScoresAndRiskFactors,
  updateOutcomesAndReleaseCondtions
};
