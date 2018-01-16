import * as ActionTypes from './DownloadActionTypes';

export function downloadRequest(startDate :string, endDate :string) :Object {
  return {
    type: ActionTypes.DOWNLOAD_PSA_FORMS_REQUEST,
    startDate,
    endDate
  };
}

export function downloadSuccess() :Object {
  return {
    type: ActionTypes.DOWNLOAD_PSA_FORMS_SUCCESS
  };
}

export function downloadFailure(errorMessage :string) {
  return {
    type: ActionTypes.DOWNLOAD_PSA_FORMS_FAILURE,
    errorMessage
  };
}
