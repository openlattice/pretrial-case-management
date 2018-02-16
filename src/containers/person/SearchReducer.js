/*
 * @flow
 */

import Immutable from 'immutable';

import {
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS_FAILURE,
  LOAD_PERSON_DETAILS_REQUEST,
  LOAD_PERSON_DETAILS_SUCCESS,
  SEARCH_PEOPLE_FAILURE,
  SEARCH_PEOPLE_REQUEST,
  SEARCH_PEOPLE_SUCCESS,
  UPDATE_CASE_FAILURE,
  UPDATE_CASE_REQUEST,
  UPDATE_CASE_SUCCESS
} from './PersonActionFactory';

import type { Action } from './PersonActionFactory';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  searchResults: Immutable.List(),
  selectedPersonId: '',
  personDetails: Immutable.List(),
  loadingCases: false,
  numCasesToLoad: 0,
  numCasesLoaded: 0
});

export default function searchReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CLEAR_SEARCH_RESULTS:
      return state
        .set('searchResults', Immutable.List())
        .set('personDetails', Immutable.List());

    case SEARCH_PEOPLE_FAILURE:
    case SEARCH_PEOPLE_REQUEST:
      return state;

    case SEARCH_PEOPLE_SUCCESS:
      return state.set('searchResults', Immutable.fromJS(action.searchResults.hits));

    case LOAD_PERSON_DETAILS_REQUEST:
      return state.set('selectedPersonId', action.id).set('loadingCases', true);

    case LOAD_PERSON_DETAILS_SUCCESS:
      return state
        .set('personDetails', Immutable.fromJS(action.details))
        .set('loadingCases', false)
        .set('numCasesToLoad', 0)
        .set('numCasesLoaded', 0);

    case LOAD_PERSON_DETAILS_FAILURE:
      return state
        .set('personDetails', Immutable.List())
        .set('loadingCases', false)
        .set('numCasesToLoad', 0)
        .set('numCasesLoaded', 0);


    case UPDATE_CASE_REQUEST:
      return state
        .set('numCasesToLoad', state.get('numCasesToLoad') + 1)
        .set('loadingCases', true);

    case UPDATE_CASE_SUCCESS:
      return state.set('numCasesLoaded', state.get('numCasesLoaded') + 1);

    case UPDATE_CASE_FAILURE:
      return state.set('numCasesLoaded', state.get('numCasesLoaded') + 1);

    default:
      return state;
  }
}
