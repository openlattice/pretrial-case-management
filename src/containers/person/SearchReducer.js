/*
 * @flow
 */

import Immutable from 'immutable';

import {
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS_FAILURE,
  LOAD_PERSON_DETAILS_REQUEST,
  LOAD_PERSON_DETAILS_SUCCESS,
  NEW_PERSON_SUBMIT_FAILURE,
  NEW_PERSON_SUBMIT_REQUEST,
  NEW_PERSON_SUBMIT_SUCCESS,
  SEARCH_PEOPLE_FAILURE,
  SEARCH_PEOPLE_REQUEST,
  SEARCH_PEOPLE_SUCCESS,
  UPDATE_CASE_FAILURE,
  UPDATE_CASE_REQUEST,
  UPDATE_CASE_SUCCESS
} from './PersonActionFactory';

import type { Action } from './PersonActionFactory';
import { PSA_PERSON } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [PSA_PERSON.LOADING]: false,
  [PSA_PERSON.SEARCH_RESULTS]: Immutable.List(),
  [PSA_PERSON.SEARCH_ERROR]: false,
  [PSA_PERSON.SELECTED_PERSON_ID]: '',
  [PSA_PERSON.PERSON_DETAILS]: Immutable.List(),
  [PSA_PERSON.LOADING_CASES]: false,
  [PSA_PERSON.NUM_CASES_TO_LOAD]: 0,
  [PSA_PERSON.NUM_CASES_LOADED]: 0,
  [PSA_PERSON.SEARCH_HAS_RUN]: false,
  [PSA_PERSON.CREATING_PERSON]: false,
  [PSA_PERSON.CREATE_PERSON_ERROR]: false
});

export default function searchReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CLEAR_SEARCH_RESULTS:
      return state
        .set(PSA_PERSON.SEARCH_RESULTS, Immutable.List())
        .set(PSA_PERSON.PERSON_DETAILS, Immutable.List())
        .set(PSA_PERSON.SEARCH_HAS_RUN, false)
        .set(PSA_PERSON.LOADING, false);

    case SEARCH_PEOPLE_REQUEST:
      return state.set(PSA_PERSON.LOADING, true).set(PSA_PERSON.SEARCH_ERROR, false);

    case SEARCH_PEOPLE_FAILURE:
      return state.set(PSA_PERSON.LOADING, false).set(PSA_PERSON.SEARCH_ERROR, true);

    case SEARCH_PEOPLE_SUCCESS:
      return state
        .set(PSA_PERSON.SEARCH_RESULTS, Immutable.fromJS(action.searchResults.hits))
        .set(PSA_PERSON.LOADING, false)
        .set(PSA_PERSON.SEARCH_HAS_RUN, true)
        .set(PSA_PERSON.SEARCH_ERROR, false);

    case LOAD_PERSON_DETAILS_REQUEST:
      return state.set(PSA_PERSON.SELECTED_PERSON_ID, action.id).set(PSA_PERSON.LOADING_CASES, true);

    case LOAD_PERSON_DETAILS_SUCCESS:
      return state
        .set(PSA_PERSON.PERSON_DETAILS, Immutable.fromJS(action.details))
        .set(PSA_PERSON.LOADING_CASES, false)
        .set(PSA_PERSON.NUM_CASES_TO_LOAD, 0)
        .set(PSA_PERSON.NUM_CASES_LOADED, 0);

    case LOAD_PERSON_DETAILS_FAILURE:
      return state
        .set(PSA_PERSON.PERSON_DETAILS, Immutable.List())
        .set(PSA_PERSON.LOADING_CASES, false)
        .set(PSA_PERSON.NUM_CASES_TO_LOAD, 0)
        .set(PSA_PERSON.NUM_CASES_LOADED, 0);


    case UPDATE_CASE_REQUEST:
      return state
        .set(PSA_PERSON.NUM_CASES_TO_LOAD, state.get(PSA_PERSON.NUM_CASES_TO_LOAD) + 1)
        .set(PSA_PERSON.LOADING_CASES, true);

    case UPDATE_CASE_SUCCESS:
      return state.set(PSA_PERSON.NUM_CASES_LOADED, state.get(PSA_PERSON.NUM_CASES_LOADED) + 1);

    case UPDATE_CASE_FAILURE:
      return state.set(PSA_PERSON.NUM_CASES_LOADED, state.get(PSA_PERSON.NUM_CASES_LOADED) + 1);

    case NEW_PERSON_SUBMIT_FAILURE:
      return state.set(PSA_PERSON.CREATING_PERSON, false).set(PSA_PERSON.CREATE_PERSON_ERROR, true);

    case NEW_PERSON_SUBMIT_REQUEST:
      return state.set(PSA_PERSON.CREATING_PERSON, true).set(PSA_PERSON.CREATE_PERSON_ERROR, false);

    case NEW_PERSON_SUBMIT_SUCCESS:
      return state.set(PSA_PERSON.CREATING_PERSON, false).set(PSA_PERSON.CREATE_PERSON_ERROR, false);

    default:
      return state;
  }
}
