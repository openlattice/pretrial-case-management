/*
 * @flow
 */

const LOAD_PERSON_DETAILS_FAILURE :'LOAD_PERSON_DETAILS_FAILURE' = 'LOAD_PERSON_DETAILS_FAILURE';
const LOAD_PERSON_DETAILS_REQUEST :'LOAD_PERSON_DETAILS_REQUEST' = 'LOAD_PERSON_DETAILS_REQUEST';
const LOAD_PERSON_DETAILS_SUCCESS :'LOAD_PERSON_DETAILS_SUCCESS' = 'LOAD_PERSON_DETAILS_SUCCESS';

type LoadPersonDetailsFailureAction = {
  error :any,
  type :typeof LOAD_PERSON_DETAILS_FAILURE
};

function loadPersonDetailsFailure(error :any) :LoadPersonDetailsFailureAction {

  return {
    error,
    type: LOAD_PERSON_DETAILS_FAILURE
  };
}

type LoadPersonDetailsRequestAction = {
  id :UUID,
  type :typeof LOAD_PERSON_DETAILS_REQUEST
};

function loadPersonDetailsRequest(id :UUID) :LoadPersonDetailsRequestAction {

  return {
    id,
    type: LOAD_PERSON_DETAILS_REQUEST
  };
}

 type LoadPersonDetailsSuccessAction = {
   details :Object[],
   type :typeof LOAD_PERSON_DETAILS_SUCCESS
 };

function loadPersonDetailsSuccess(details :Object[]) :LoadPersonDetailsSuccessAction {

  return {
    details,
    type: LOAD_PERSON_DETAILS_SUCCESS
  };
}

const NEW_PERSON_SUBMIT_FAILURE :'NEW_PERSON_SUBMIT_FAILURE' = 'NEW_PERSON_SUBMIT_FAILURE';
const NEW_PERSON_SUBMIT_REQUEST :'NEW_PERSON_SUBMIT_REQUEST' = 'NEW_PERSON_SUBMIT_REQUEST';
const NEW_PERSON_SUBMIT_SUCCESS :'NEW_PERSON_SUBMIT_SUCCESS' = 'NEW_PERSON_SUBMIT_SUCCESS';

type NewPersonSubmitFailureAction = {
  error :any,
  type :typeof NEW_PERSON_SUBMIT_FAILURE
};

function newPersonSubmitFailure(error :any) :NewPersonSubmitFailureAction {

  return {
    error,
    type: NEW_PERSON_SUBMIT_FAILURE
  };
}

type NewPersonSubmitRequestAction = {
  config :Object,
  type :typeof NEW_PERSON_SUBMIT_REQUEST,
  values :Object
};

function newPersonSubmitRequest(config :Object, values :Object) :NewPersonSubmitRequestAction {

  return {
    config,
    values,
    type: NEW_PERSON_SUBMIT_REQUEST
  };
}

type NewPersonSubmitSuccessAction = {
  type :typeof NEW_PERSON_SUBMIT_SUCCESS
};

function newPersonSubmitSuccess() :NewPersonSubmitSuccessAction {

  return {
    type: NEW_PERSON_SUBMIT_SUCCESS
  };
}

const SEARCH_PEOPLE_FAILURE :'SEARCH_PEOPLE_FAILURE' = 'SEARCH_PEOPLE_FAILURE';
const SEARCH_PEOPLE_REQUEST :'SEARCH_PEOPLE_REQUEST' = 'SEARCH_PEOPLE_REQUEST';
const SEARCH_PEOPLE_SUCCESS :'SEARCH_PEOPLE_SUCCESS' = 'SEARCH_PEOPLE_SUCCESS';

type SearchPeopleFailureAction = {
  error :any,
  type :typeof SEARCH_PEOPLE_FAILURE
};

function searchPeopleFailure(error :any) :SearchPeopleFailureAction {

  return {
    error,
    type: SEARCH_PEOPLE_FAILURE
  };
}

type SearchPeopleRequestAction = {
  searchQuery :string,
  type :typeof SEARCH_PEOPLE_REQUEST
};

function searchPeopleRequest(firstName :string, lastName :string) :SearchPeopleRequestAction {

  return {
    firstName,
    lastName,
    type: SEARCH_PEOPLE_REQUEST
  };
}

type SearchPeopleSuccessAction = {
  searchResults :Object,
  type :typeof SEARCH_PEOPLE_SUCCESS
};

function searchPeopleSuccess(searchResults :Object) :SearchPeopleSuccessAction {

  return {
    searchResults,
    type: SEARCH_PEOPLE_SUCCESS
  };
}

const CLEAR_SEARCH_RESULTS :'CLEAR_SEARCH_RESULTS' = 'CLEAR_SEARCH_RESULTS';

type ClearSearchResultsAction = {
  type :typeof CLEAR_SEARCH_RESULTS
};

function clearSearchResults() :ClearSearchResultsAction {

  return {
    type: CLEAR_SEARCH_RESULTS
  };
}

export {
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS_FAILURE,
  LOAD_PERSON_DETAILS_REQUEST,
  LOAD_PERSON_DETAILS_SUCCESS,
  NEW_PERSON_SUBMIT_FAILURE,
  NEW_PERSON_SUBMIT_REQUEST,
  NEW_PERSON_SUBMIT_SUCCESS,
  SEARCH_PEOPLE_FAILURE,
  SEARCH_PEOPLE_REQUEST,
  SEARCH_PEOPLE_SUCCESS
};

export {
  clearSearchResults,
  loadPersonDetailsFailure,
  loadPersonDetailsRequest,
  loadPersonDetailsSuccess,
  newPersonSubmitFailure,
  newPersonSubmitRequest,
  newPersonSubmitSuccess,
  searchPeopleFailure,
  searchPeopleRequest,
  searchPeopleSuccess
};

export type {
  ClearSearchResultsAction,
  LoadPersonDetailsFailureAction,
  LoadPersonDetailsRequestAction,
  LoadPersonDetailsSuccessAction,
  NewPersonSubmitFailureAction,
  NewPersonSubmitRequestAction,
  NewPersonSubmitSuccessAction,
  SearchPeopleFailureAction,
  SearchPeopleRequestAction,
  SearchPeopleSuccessAction
};

export type Action =
  | ClearSearchResultsAction
  | LoadPersonDetailsFailureAction
  | LoadPersonDetailsRequestAction
  | LoadPersonDetailsSuccessAction
  | NewPersonSubmitFailureAction
  | NewPersonSubmitRequestAction
  | NewPersonSubmitSuccessAction
  | SearchPeopleFailureAction
  | SearchPeopleRequestAction
  | SearchPeopleSuccessAction;
