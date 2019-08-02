/*
 * @flow
 */

import { Map, List, fromJS } from 'immutable';

import {
  CLEAR_CASE_LOADER,
  clearSearchResults,
  loadPersonDetails,
  newPersonSubmit,
  searchPeople,
  searchPeopleByPhoneNumber,
  updateCases,
} from './PersonActions';

import { SEARCH } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [SEARCH.LOADING]: false,
  [SEARCH.SEARCH_RESULTS]: List(),
  [SEARCH.CONTACTS]: Map(),
  [SEARCH.RESULTS_TO_CONTACTS]: Map(),
  [SEARCH.SEARCH_ERROR]: false,
  [SEARCH.SELECTED_PERSON_ID]: '',
  [SEARCH.PERSON_DETAILS]: List(),
  [SEARCH.LOADING_PERSON_DETAILS]: false,
  [SEARCH.LOADING_CASES]: false,
  [SEARCH.NUM_CASES_TO_LOAD]: 0,
  [SEARCH.NUM_CASES_LOADED]: 0,
  [SEARCH.CASE_LOADS_COMPLETE]: false,
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

    case loadPersonDetails.case(action.type): {
      return loadPersonDetails.reducer(state, action, {
        REQUEST: () => {
          const { entityKeyId } = action.value;
          return state
            .set(SEARCH.LOADING_PERSON_DETAILS, true)
            .set(SEARCH.PERSON_DETAILS_LOADED, false)
            .set(SEARCH.SELECTED_PERSON_ID, entityKeyId);
        },
        SUCCESS: () => {
          const { response } = action.value;
          let newState = state
            .set(SEARCH.PERSON_DETAILS, fromJS(response));
          if (!state.get(SEARCH.LOADING_CASES)) {
            newState = newState.set(SEARCH.CASE_LOADS_COMPLETE, true);
          }
          return newState;
        },
        FAILURE: () => state
          .set(SEARCH.PERSON_DETAILS, List())
          .set(SEARCH.LOADING_CASES, false)
          .set(SEARCH.NUM_CASES_TO_LOAD, 0)
          .set(SEARCH.NUM_CASES_LOADED, 0),
        FINALLY: () => state
          .set(SEARCH.LOADING_PERSON_DETAILS, false)
          .set(SEARCH.PERSON_DETAILS_LOADED, true)
      });
    }

    case updateCases.case(action.type): {
      return updateCases.reducer(state, action, {
        REQUEST: () => {
          const { cases } = action.value;
          return state
            .set(SEARCH.NUM_CASES_TO_LOAD, state.get(SEARCH.NUM_CASES_TO_LOAD) + cases.length)
            .set(SEARCH.LOADING_CASES, true)
            .set(SEARCH.CASE_LOADS_COMPLETE, false);
        },
        SUCCESS: () => {
          const { cases } = action.value;
          return state
            .set(SEARCH.NUM_CASES_LOADED, state.get(SEARCH.NUM_CASES_LOADED) + cases.length)
            .set(SEARCH.LOADING_CASES, true);
        },
        FAILURE: () => {
          const { cases } = action.value;
          return state.set(SEARCH.NUM_CASES_LOADED, state.get(SEARCH.NUM_CASES_LOADED) + cases.length);
        },
        FINALLY: () => {
          let newState = state;
          const numCasesToLoad = state.get(SEARCH.NUM_CASES_TO_LOAD);
          const numCasesLoaded = state.get(SEARCH.NUM_CASES_LOADED);
          if (numCasesToLoad === numCasesLoaded) {
            newState = state
              .set(SEARCH.LOADING_CASES, false)
              .set(SEARCH.CASE_LOADS_COMPLETE, true)
              .set(SEARCH.NUM_CASES_TO_LOAD, 0)
              .set(SEARCH.NUM_CASES_LOADED, 0);
          }
          return newState;
        }
      });
    }

    case newPersonSubmit.case(action.type): {
      return newPersonSubmit.reducer(state, action, {
        REQUEST: () => state
          .set(SEARCH.CREATING_PERSON, true)
          .set(SEARCH.CREATE_PERSON_ERROR, false),
        SUCCESS: () => state
          .set(SEARCH.CREATING_PERSON, false)
          .set(SEARCH.CREATE_PERSON_ERROR, false),
        FAILURE: () => state
          .set(SEARCH.CREATING_PERSON, false)
          .set(SEARCH.CREATE_PERSON_ERROR, true),
        FINALLY: () => state.set(SEARCH.CREATING_PERSON, false)
      });
    }

    default:
      return state;
  }
}
