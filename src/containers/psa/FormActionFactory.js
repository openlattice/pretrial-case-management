/*
 * @flow
 */

import * as FormActionTypes from './FormActionTypes';

export function loadPersonDataModel() :Object {
  return {
    type: FormActionTypes.LOAD_PERSON_DATA_MODEL_REQUEST
  };
}

export function loadPersonDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_PERSON_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadPersonDataModelFailure() :Object {
  return {
    type: FormActionTypes.LOAD_PERSON_DATA_MODEL_FAILURE
  };
}

export function loadPretrialCaseDataModel() :Object {
  return {
    type: FormActionTypes.LOAD_PRETRIAL_DATA_MODEL_REQUEST
  };
}

export function loadPretrialCaseDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_PRETRIAL_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadPretrialCaseDataModelFailure() :Object {
  return {
    type: FormActionTypes.LOAD_RISK_FACTORS_DATA_MODEL_FAILURE
  };
}

export function loadRiskFactorsDataModel() :Object {
  return {
    type: FormActionTypes.LOAD_RISK_FACTORS_DATA_MODEL_REQUEST
  };
}

export function loadRiskFactorsDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_RISK_FACTORS_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadRiskFactorsDataModelFailure() :Object {
  return {
    type: FormActionTypes.LOAD_PRETRIAL_DATA_MODEL_FAILURE
  };
}

export function loadPsaDataModel() :Object {
  return {
    type: FormActionTypes.LOAD_PSA_DATA_MODEL_REQUEST
  };
}

export function loadPsaDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_PSA_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadPsaDataModelFailure() :Object {
  return {
    type: FormActionTypes.LOAD_PSA_DATA_MODEL_FAILURE
  };
}

export function loadReleaseRecommendationDataModel() :Object {
  return {
    type: FormActionTypes.LOAD_RELEASE_RECOMMENDATION_DATA_MODEL_REQUEST
  };
}

export function loadReleaseRecommendationDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_RELEASE_RECOMMENDATION_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadReleaseRecommendationDataModelFailure() :Object {
  return {
    type: FormActionTypes.LOAD_RELEASE_RECOMMENDATION_DATA_MODEL_FAILURE
  };
}

export function loadCalculatedForDataModel() :Object {
  return {
    type: FormActionTypes.LOAD_CALCULATED_FOR_DATA_MODEL_REQUEST
  };
}

export function loadCalculatedForDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_CALCULATED_FOR_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadCalculatedForDataModelFailure() :Object {
  return {
    type: FormActionTypes.LOAD_CALCULATED_FOR_DATA_MODEL_FAILURE
  };
}

export function searchPeople(entitySetId :UUID, searchOptions :Object[]) :Object {
  return {
    type: FormActionTypes.SEARCH_PEOPLE_REQUEST,
    entitySetId,
    searchOptions
  };
}

export function searchPeopleSuccess(people :Object[]) :Object {
  return {
    type: FormActionTypes.SEARCH_PEOPLE_SUCCESS,
    people
  };
}

export function searchPeopleFailure() {
  return {
    type: FormActionTypes.SEARCH_PEOPLE_FAILURE
  };
}

export function loadNeighbors(entitySetId :UUID, rowId :UUID) :Object {
  return {
    type: FormActionTypes.LOAD_NEIGHBORS_REQUEST,
    entitySetId,
    rowId
  };
}

export function loadNeighborsSuccess(neighbors :Object[]) :Object {
  return {
    type: FormActionTypes.LOAD_NEIGHBORS_SUCCESS,
    neighbors
  };
}

export function loadNeighborsFailure() {
  return {
    type: FormActionTypes.LOAD_NEIGHBORS_FAILURE
  };
}

export function submitData(
    personEntity :Object,
    pretrialCaseEntity :Object,
    riskFactorsEntity :Object,
    psaEntity :Object,
    releaseRecommendationEntity :Object,
    calculatedForEntity :Object) :Object {
  return {
    type: FormActionTypes.SUBMIT_DATA_REQUEST,
    personEntity,
    pretrialCaseEntity,
    riskFactorsEntity,
    psaEntity,
    releaseRecommendationEntity,
    calculatedForEntity
  };
}

export function submitDataSuccess() :Object {
  return {
    type: FormActionTypes.SUBMIT_DATA_SUCCESS
  };
}

export function submitDataFailure() {
  return {
    type: FormActionTypes.SUBMIT_DATA_FAILURE
  };
}

export function selectPerson(selectedPerson :Object) {
  return {
    type: FormActionTypes.SELECT_PERSON,
    selectedPerson
  };
}

export function selectPretrialCase(selectedPretrialCase :Object) {
  return {
    type: FormActionTypes.SELECT_PRETRIAL,
    selectedPretrialCase
  };
}

export function updateRecommendation(recommendation :string, entityId :string, dataModel :Object) {
  return {
    type: FormActionTypes.UPDATE_RECOMMENDATION_REQUEST,
    recommendation,
    entityId,
    dataModel
  };
}

export function updateRecommendationSuccess() {
  return {
    type: FormActionTypes.UPDATE_RECOMMENDATION_SUCCESS
  };
}

export function updateRecommendationFailure() {
  return {
    type: FormActionTypes.UPDATE_RECOMMENDATION_FAILURE
  };
}

export function clearForm() {
  return {
    type: FormActionTypes.CLEAR_FORM
  };
}
