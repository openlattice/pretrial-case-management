/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DOWNLOAD_PSA_REVIEW_PDF :string = 'DOWNLOAD_PSA_REVIEW_PDF';
const downloadPSAReviewPDF :RequestSequence = newRequestSequence(DOWNLOAD_PSA_REVIEW_PDF);

const LOAD_CASE_HISTORY :string = 'LOAD_CASE_HISTORY';
const loadCaseHistory :RequestSequence = newRequestSequence(LOAD_CASE_HISTORY);

const LOAD_PSAS_BY_DATE :string = 'LOAD_PSAS_BY_DATE';
const loadPSAsByDate :RequestSequence = newRequestSequence(LOAD_PSAS_BY_DATE);

const UPDATE_SCORES_AND_RISK_FACTORS :string = 'UPDATE_SCORES_AND_RISK_FACTORS';
const updateScoresAndRiskFactors :RequestSequence = newRequestSequence(UPDATE_SCORES_AND_RISK_FACTORS);

export {
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSAS_BY_DATE,
  UPDATE_SCORES_AND_RISK_FACTORS,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAsByDate,
  updateScoresAndRiskFactors
};
