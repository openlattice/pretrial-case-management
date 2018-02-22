/*
 * @flow
 */

import Immutable from 'immutable';
import * as FormActionTypes from './FormActionTypes';

export function loadDataModelRequest() :Object {
  return {
    type: FormActionTypes.LOAD_DATA_MODEL_REQUEST
  };
}

export function loadDataModelSuccess(dataModel :Object) :Object {
  return {
    type: FormActionTypes.LOAD_DATA_MODEL_SUCCESS,
    dataModel
  };
}

export function loadDataModelFailure(errorMessage :string) :Object {
  return {
    type: FormActionTypes.LOAD_DATA_MODEL_FAILURE,
    errorMessage
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
  staffEntity :Object,
  calculatedForEntity :Object,
  assessedByEntity :Object
) :Object {
  return {
    type: FormActionTypes.SUBMIT_DATA_REQUEST,
    personEntity,
    pretrialCaseEntity,
    riskFactorsEntity,
    psaEntity,
    releaseRecommendationEntity,
    staffEntity,
    calculatedForEntity,
    assessedByEntity
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

export function updateRecommendation(
  recommendation :string,
  entityId :string,
  entitySetId :string,
  propertyTypes :Immutable.List<Immutable.Map<*, *>>
) {
  return {
    type: FormActionTypes.UPDATE_RECOMMENDATION_REQUEST,
    recommendation,
    entityId,
    entitySetId,
    propertyTypes
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

export function setPSAValues(values :Map<string, string>) {
  return {
    type: FormActionTypes.SET_PSA_VALUES,
    values
  };
}
