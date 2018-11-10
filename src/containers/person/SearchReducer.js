/*
 * @flow
 */

import Immutable from 'immutable';

import {
  clearSearchResults,
  loadPersonDetails,
  newPersonSubmit,
  searchPeople,
  updateCases,
} from './PersonActionFactory';

import { SEARCH } from '../../utils/consts/FrontEndStateConsts';

declare var __ENV_DEV__ :boolean;

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [SEARCH.LOADING]: false,
  [SEARCH.SEARCH_RESULTS]: Immutable.List(),
  [SEARCH.SEARCH_ERROR]: false,
  [SEARCH.SELECTED_PERSON_ID]: '',
  [SEARCH.PERSON_DETAILS]: Immutable.List(),
  [SEARCH.LOADING_CASES]: false,
  [SEARCH.NUM_CASES_TO_LOAD]: 0,
  [SEARCH.NUM_CASES_LOADED]: 0,
  [SEARCH.CASE_LOADS_COMPLETE]: false,
  [SEARCH.SEARCH_HAS_RUN]: false,
  [SEARCH.CREATING_PERSON]: false,
  [SEARCH.CREATE_PERSON_ERROR]: false,
});

export default function searchReducer(state = INITIAL_STATE, action) {

  switch (action.type) {

    case clearSearchResults.case(action.type): {
      return clearSearchResults.reducer(state, action, {
        SUCCESS: () => state
          .set(SEARCH.SEARCH_RESULTS, Immutable.List())
          .set(SEARCH.PERSON_DETAILS, Immutable.List())
          .set(SEARCH.SEARCH_HAS_RUN, false)
          .set(SEARCH.LOADING, false)
      });
    }

    case searchPeople.case(action.type): {
      return searchPeople.reducer(state, action, {
        REQUEST: () => state
          .set(SEARCH.LOADING, true)
          .set(SEARCH.SEARCH_ERROR, false),
        SUCCESS: () => state
          .set(SEARCH.SEARCH_RESULTS, Immutable.fromJS(action.value.hits))
          .set(SEARCH.LOADING, false)
          .set(SEARCH.SEARCH_HAS_RUN, true)
          .set(SEARCH.SEARCH_ERROR, false),
        FAILURE: () => state
          .set(SEARCH.LOADING, false)
          .set(SEARCH.SEARCH_ERROR, true),
        FINALLY: () => state.set(SEARCH.LOADING, false)
      });
    }

    case loadPersonDetails.case(action.type): {
      return loadPersonDetails.reducer(state, action, {
        REQUEST: () => {
          const { entityKeyId } = action.value;
          return state.set(SEARCH.SELECTED_PERSON_ID, entityKeyId);
        },
        SUCCESS: () => {
          const { response } = action.value;
          let newState = state.set(SEARCH.PERSON_DETAILS, Immutable.fromJS(response));
          if (!state.get(SEARCH.LOADING_CASES)) {
            newState = newState.set(SEARCH.CASE_LOADS_COMPLETE, true);
          }
          return newState;
        },
        FAILURE: () => state
          .set(SEARCH.PERSON_DETAILS, Immutable.List())
          .set(SEARCH.LOADING_CASES, false)
          .set(SEARCH.NUM_CASES_TO_LOAD, 0)
          .set(SEARCH.NUM_CASES_LOADED, 0),
      });
    }

    case updateCases.case(action.type): {
      return updateCases.reducer(state, action, {
        REQUEST: () => {
          const { cases } = action.value;
          return state
            .set(SEARCH.NUM_CASES_TO_LOAD, state.get(SEARCH.NUM_CASES_TO_LOAD) + cases.length)
            .set(SEARCH.LOADING_CASES, true);
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
