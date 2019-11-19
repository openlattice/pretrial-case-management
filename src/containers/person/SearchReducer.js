/*
 * @flow
 */

import { Map, List, fromJS } from 'immutable';

import {
  CLEAR_CASE_LOADER,
  clearSearchResults,
  searchPeople,
  searchPeopleByPhoneNumber,
} from './PersonActions';

import { SEARCH } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [SEARCH.LOADING]: false,
  [SEARCH.SEARCH_RESULTS]: List(),
  [SEARCH.CONTACTS]: Map(),
  [SEARCH.RESULTS_TO_CONTACTS]: Map(),
  [SEARCH.SEARCH_ERROR]: false,
  [SEARCH.SEARCH_HAS_RUN]: false,
  [SEARCH.CREATING_PERSON]: false,
  [SEARCH.CREATE_PERSON_ERROR]: false,
});

export default function searchReducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_CASE_LOADER:
      return state
        .set(SEARCH.LOADING_CASES, false)
        .set(SEARCH.NUM_CASES_TO_LOAD, 0)
        .set(SEARCH.NUM_CASES_LOADED, 0)
        .set(SEARCH.CASE_LOADS_COMPLETE, false);

    case clearSearchResults.case(action.type): {
      return clearSearchResults.reducer(state, action, {
        SUCCESS: () => state
          .set(SEARCH.SEARCH_RESULTS, List())
          .set(SEARCH.PERSON_DETAILS, List())
          .set(SEARCH.CONTACTS, Map())
          .set(SEARCH.RESULTS_TO_CONTACTS, Map())
          .set(SEARCH.SEARCH_HAS_RUN, false)
          .set(SEARCH.LOADING, false)
      });
    }

    case searchPeople.case(action.type): {
      return searchPeople.reducer(state, action, {
        REQUEST: () => state
          .set(SEARCH.SEARCH_HAS_RUN, false)
          .set(SEARCH.LOADING, true)
          .set(SEARCH.SEARCH_ERROR, false),
        SUCCESS: () => state
          .set(SEARCH.SEARCH_RESULTS, action.value)
          .set(SEARCH.LOADING, false)
          .set(SEARCH.SEARCH_ERROR, false),
        FAILURE: () => state
          .set(SEARCH.SEARCH_RESULTS, List())
          .set(SEARCH.LOADING, false)
          .set(SEARCH.SEARCH_ERROR, true),
        FINALLY: () => state
          .set(SEARCH.SEARCH_HAS_RUN, true)
          .set(SEARCH.LOADING, false)
      });
    }

    case searchPeopleByPhoneNumber.case(action.type): {
      return searchPeopleByPhoneNumber.reducer(state, action, {
        REQUEST: () => state
          .set(SEARCH.CONTACTS, Map())
          .set(SEARCH.RESULTS_TO_CONTACTS, Map())
          .set(SEARCH.SEARCH_HAS_RUN, false)
          .set(SEARCH.LOADING, true)
          .set(SEARCH.SEARCH_ERROR, false),
        SUCCESS: () => state
          .set(SEARCH.SEARCH_RESULTS, fromJS(action.value.people))
          .set(SEARCH.CONTACTS, fromJS(action.value.contactMap))
          .set(SEARCH.RESULTS_TO_CONTACTS, fromJS(action.value.personIdsToContactIds))
          .set(SEARCH.LOADING, false)
          .set(SEARCH.SEARCH_ERROR, false),
        FAILURE: () => state
          .set(SEARCH.LOADING, false)
          .set(SEARCH.SEARCH_ERROR, true),
        FINALLY: () => state
          .set(SEARCH.SEARCH_HAS_RUN, true)
          .set(SEARCH.LOADING, false)
      });
    }

    default:
      return state;
  }
}
