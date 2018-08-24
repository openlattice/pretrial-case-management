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
import { SEARCH } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [SEARCH.LOADING]: false,
  [SEARCH.SEARCH_RESULTS]: Immutable.List(),
  [SEARCH.SEARCH_ERROR]: false,
  [SEARCH.SELECTED_PERSON_ID]: '',
  [SEARCH.PERSON_DETAILS]: Immutable.List(),
  [SEARCH.LOADING_CASES]: false,
  [SEARCH.NUM_CASES_TO_LOAD]: 0,
  [SEARCH.NUM_CASES_LOADED]: 0,
  [SEARCH.SEARCH_HAS_RUN]: false,
  [SEARCH.CREATING_PERSON]: false,
  [SEARCH.CREATE_PERSON_ERROR]: false
});

export default function searchReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CLEAR_SEARCH_RESULTS:
      return state
        .set(SEARCH.SEARCH_RESULTS, Immutable.List())
        .set(SEARCH.PERSON_DETAILS, Immutable.List())
        .set(SEARCH.SEARCH_HAS_RUN, false)
        .set(SEARCH.LOADING, false);

    case SEARCH_PEOPLE_REQUEST:
      return state.set(SEARCH.LOADING, true).set(SEARCH.SEARCH_ERROR, false);

    case SEARCH_PEOPLE_FAILURE:
      return state.set(SEARCH.LOADING, false).set(SEARCH.SEARCH_ERROR, true);

    case SEARCH_PEOPLE_SUCCESS:
      return state
        .set(SEARCH.SEARCH_RESULTS, Immutable.fromJS(action.searchResults.hits))
        .set(SEARCH.LOADING, false)
        .set(SEARCH.SEARCH_HAS_RUN, true)
        .set(SEARCH.SEARCH_ERROR, false);

    case LOAD_PERSON_DETAILS_REQUEST:
      return state.set(SEARCH.SELECTED_PERSON_ID, action.id).set(SEARCH.LOADING_CASES, true);

    case LOAD_PERSON_DETAILS_SUCCESS:
      return state
        .set(SEARCH.PERSON_DETAILS, Immutable.fromJS(action.details))
        .set(SEARCH.LOADING_CASES, false)
        .set(SEARCH.NUM_CASES_TO_LOAD, 0)
        .set(SEARCH.NUM_CASES_LOADED, 0);

    case LOAD_PERSON_DETAILS_FAILURE:
      return state
        .set(SEARCH.PERSON_DETAILS, Immutable.List())
        .set(SEARCH.LOADING_CASES, false)
        .set(SEARCH.NUM_CASES_TO_LOAD, 0)
        .set(SEARCH.NUM_CASES_LOADED, 0);


    case UPDATE_CASE_REQUEST:
      return state
        .set(SEARCH.NUM_CASES_TO_LOAD, state.get(SEARCH.NUM_CASES_TO_LOAD) + 1)
        .set(SEARCH.LOADING_CASES, true);

    case UPDATE_CASE_SUCCESS:
      return state.set(SEARCH.NUM_CASES_LOADED, state.get(SEARCH.NUM_CASES_LOADED) + 1);

    case UPDATE_CASE_FAILURE:
      return state.set(SEARCH.NUM_CASES_LOADED, state.get(SEARCH.NUM_CASES_LOADED) + 1);

    case NEW_PERSON_SUBMIT_FAILURE:
      return state.set(SEARCH.CREATING_PERSON, false).set(SEARCH.CREATE_PERSON_ERROR, true);

    case NEW_PERSON_SUBMIT_REQUEST:
      return state.set(SEARCH.CREATING_PERSON, true).set(SEARCH.CREATE_PERSON_ERROR, false);

    case NEW_PERSON_SUBMIT_SUCCESS:
      return state.set(SEARCH.CREATING_PERSON, false).set(SEARCH.CREATE_PERSON_ERROR, false);

    default:
      return state;
  }
}
