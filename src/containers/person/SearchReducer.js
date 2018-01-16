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
  SEARCH_PEOPLE_SUCCESS
} from './PersonActionFactory';

import type { Action } from './PersonActionFactory';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  searchResults: Immutable.List(),
  selectedPersonId: '',
  personDetails: Immutable.List()
});

export default function searchReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case CLEAR_SEARCH_RESULTS:
      return state
        .set('searchResults', Immutable.List())
        .set('personDetails', Immutable.List());

    case LOAD_PERSON_DETAILS_FAILURE:
    case SEARCH_PEOPLE_FAILURE:
    case SEARCH_PEOPLE_REQUEST:
      return state;

    case SEARCH_PEOPLE_SUCCESS:
      return state.set('searchResults', Immutable.fromJS(action.searchResults.hits));

    case LOAD_PERSON_DETAILS_REQUEST:
      return state.set('selectedPersonId', action.id);

    case LOAD_PERSON_DETAILS_SUCCESS:
      return state.set('personDetails', Immutable.fromJS(action.details));

    default:
      return state;
  }
}
