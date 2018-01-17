import * as ActionTypes from './ReviewActionTypes';

export function loadPsasByDateRequest() {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_REQUEST
  };
}

export function loadPsasByDateSuccess(scoresAsMap :Map, psaNeighborsByDate :Map) {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_SUCCESS,
    scoresAsMap,
    psaNeighborsByDate
  };
}

export function loadPsasByDateFailure(errorMesasge :string) {
  return {
    type: ActionTypes.LOAD_PSAS_BY_DATE_FAILURE,
    errorMesasge
  };
}

export function downloadPsaReviewPdfRequest(neighbors :Map, scores :Map) {
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
