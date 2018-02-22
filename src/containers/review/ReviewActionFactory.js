/*
 * @flow
 */

import * as ActionTypes from './ReviewActionTypes';

export function loadPsasByDateRequest() {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_REQUEST
  };
}

export function loadPsasByDateSuccess(scoresAsMap :Map<*, *>, psaNeighborsByDate :Map<*, *>, entitySetId :UUID) {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_SUCCESS,
    scoresAsMap,
    psaNeighborsByDate,
    entitySetId
  };
}

export function loadPsasByDateFailure(errorMesasge :string) {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_FAILURE,
    errorMesasge
  };
}

export function downloadPsaReviewPdfRequest(neighbors :Map<*, *>, scores :Map<*, *>) {
  return {
    type: ActionTypes.DOWNLOAD_PSA_REVIEW_PDF_REQUEST,
    neighbors,
    scores
  };
}

export function downloadPsaReviewPdfSuccess() {
  return {
    type: ActionTypes.DOWNLOAD_PSA_REVIEW_PDF_SUCCESS
  };
}

export function downloadPsaReviewPdfFailure(errorMesasge :string) {
  return {
    type: ActionTypes.DOWNLOAD_PSA_REVIEW_PDF_FAILURE,
    errorMesasge
  };
}

export function updateScoresAndRiskFactorsRequest(
  scoresEntitySetId :UUID,
  scoresId :UUID,
  scoresEntity :Map<*, *>,
  riskFactorsEntitySetId :UUID,
  riskFactorsId :UUID,
  riskFactorsEntity :Map<*, *>
) {
  return {
    type: ActionTypes.UPDATE_SCORES_AND_RISK_FACTORS_REQUEST,
    scoresEntitySetId,
    scoresId,
    scoresEntity,
    riskFactorsEntitySetId,
    riskFactorsId,
    riskFactorsEntity
  };
}

export function updateScoresAndRiskFactorsSuccess(
  scoresId :UUID,
  scoresEntity :Map<*, *>,
  riskFactorsId :UUID,
  riskFactorsEntity :Map<*, *>
) {
  return {
    type: ActionTypes.UPDATE_SCORES_AND_RISK_FACTORS_SUCCESS,
    scoresId,
    scoresEntity,
    riskFactorsId,
    riskFactorsEntity
  };
}

export function updateScoresAndRiskFactorsFailure(errorMessage :string) {
  return {
    type: ActionTypes.UPDATE_SCORES_AND_RISK_FACTORS_FAILURE,
    errorMessage
  };
}
