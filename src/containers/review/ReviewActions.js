/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

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

const LOAD_PSAS_BY_STATUS :string = 'LOAD_PSAS_BY_STATUS';
const loadPSAsByStatus :RequestSequence = newRequestSequence(LOAD_PSAS_BY_STATUS);

const UPDATE_SCORES_AND_RISK_FACTORS :string = 'UPDATE_SCORES_AND_RISK_FACTORS';
const updateScoresAndRiskFactors :RequestSequence = newRequestSequence(UPDATE_SCORES_AND_RISK_FACTORS);

export {
  BULK_DOWNLOAD_PSA_REVIEW_PDF,
  CHANGE_PSA_STATUS,
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSA_DATA,
  LOAD_PSAS_BY_STATUS,
  UPDATE_SCORES_AND_RISK_FACTORS,
  bulkDownloadPSAReviewPDF,
  changePSAStatus,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByStatus,
  updateScoresAndRiskFactors
};
