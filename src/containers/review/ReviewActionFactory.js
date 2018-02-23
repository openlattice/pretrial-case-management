/*
 * @flow
 */
import Immutable from 'immutable';

import * as ActionTypes from './ReviewActionTypes';

export function loadPsasByDateRequest() {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_REQUEST
  };
}

export function loadPsasByDateSuccess(
  scoresAsMap :Immutable.Map<*, *>,
  psaNeighborsByDate :Immutable.Map<*, *>,
  entitySetId :string
) {
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

export function downloadPsaReviewPdfRequest(neighbors :Immutable.Map<*, *>, scores :Immutable.Map<*, *>) {
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
  scoresEntitySetId :string,
  scoresId :string,
  scoresEntity :Immutable.Map<*, *>,
  riskFactorsEntitySetId :string,
  riskFactorsId :string,
  riskFactorsEntity :Immutable.Map<*, *>
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
  scoresId :string,
  scoresEntity :Immutable.Map<*, *>,
  riskFactorsId :string,
  riskFactorsEntity :Immutable.Map<*, *>
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
