/*
 * @flow
 */

import { fromJS, List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { FAILED_CASES, PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';

import {
  loadPersonDetails,
  newPersonSubmit,
  RESET_PERSON_ACTION,
  updateCases
} from './PersonActions';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [PERSON_ACTIONS.LOAD_PERSON_DETAILS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PERSON_ACTIONS.NEW_PERSON_SUBMIT]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PERSON_ACTIONS.UPDATE_CASES]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [PERSON_ACTIONS.LOAD_PERSON_DETAILS]: fromJS({ [FAILED_CASES]: [], error: '' }),
    [PERSON_ACTIONS.NEW_PERSON_SUBMIT]: Map(),
    [PERSON_ACTIONS.UPDATE_CASES]: Map()
  },
  [PERSON_DATA.NUM_CASES_TO_LOAD]: 0,
  [PERSON_DATA.NUM_CASES_LOADED]: 0,
  [PERSON_DATA.PERSON_DETAILS]: Map(),
  [PERSON_DATA.SELECTED_PERSON_ID]: '',
  [PERSON_DATA.SUBMITTED_PERSON]: Map(),
  [PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS]: Map()
});

export default function personReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case RESET_PERSON_ACTION: {
      const { actionType } = action.value;
      const error = actionType === PERSON_ACTIONS.UPDATE_CASES
        ? fromJS({ [FAILED_CASES]: [], error: '' })
        : Map();
      return state
        .setIn([REDUX.ACTIONS, actionType, REDUX.REQUEST_STATE], STANDBY)
        .setIn([REDUX.ERRORS, actionType], error);
    }

    case loadPersonDetails.case(action.type): {
      return loadPersonDetails.reducer(state, action, {
        REQUEST: () => {
          const { entityKeyId, shouldLoadCases } = action.value;
          let nextState = state;
          if (shouldLoadCases) {
            nextState = nextState
              .setIn([REDUX.ERRORS, PERSON_ACTIONS.UPDATE_CASES], fromJS({ [FAILED_CASES]: [], error: '' }));
          }
          return nextState
            .set(PERSON_DATA.SELECTED_PERSON_ID, entityKeyId)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.LOAD_PERSON_DETAILS, action.id], action)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.LOAD_PERSON_DETAILS, REDUX.REQUEST_STATE], PENDING);
        },
        SUCCESS: () => {
          const { response } = action.value;
          return state
            .set(PERSON_DATA.PERSON_DETAILS, fromJS(response))
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.LOAD_PERSON_DETAILS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(PERSON_DATA.PERSON_DETAILS, Map())
            .set(PERSON_DATA.SELECTED_PERSON_ID, '')
            .set(PERSON_DATA.NUM_CASES_TO_LOAD, 0)
            .set(PERSON_DATA.NUM_CASES_LOADED, 0)
            .setIn([REDUX.ERRORS, PERSON_ACTIONS.LOAD_PERSON_DETAILS], error)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.LOAD_PERSON_DETAILS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PERSON_ACTIONS.LOAD_PERSON_DETAILS, action.id])
      });
    }

    case newPersonSubmit.case(action.type): {
      return newPersonSubmit.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, action.id], action)
          .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { person, personNeighborsByAppTypeFqn } = action.value;
          return state
            .set(PERSON_DATA.SUBMITTED_PERSON, person)
            .set(PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS, personNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(PERSON_DATA.SUBMITTED_PERSON, Map())
            .set(PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, PERSON_ACTIONS.NEW_PERSON_SUBMIT], error)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, action.id])
      });
    }

    case updateCases.case(action.type): {
      return updateCases.reducer(state, action, {
        REQUEST: () => {
          const { cases } = action.value;
          return state
            .set(PERSON_DATA.NUM_CASES_TO_LOAD, state.get(PERSON_DATA.NUM_CASES_TO_LOAD) + cases.length)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.UPDATE_CASES, action.id], action)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.UPDATE_CASES, REDUX.REQUEST_STATE], PENDING);
        },
        SUCCESS: () => {
          const { cases } = action.value;
          return state
            .set(PERSON_DATA.NUM_CASES_LOADED, state.get(PERSON_DATA.NUM_CASES_LOADED) + cases.length);
        },
        FAILURE: () => {
          const existingFailedCases = state
            .getIn([REDUX.ERRORS, PERSON_ACTIONS.UPDATE_CASES, FAILED_CASES], List());
          const { cases, error } = action.value;
          const failedCases = existingFailedCases.concat(cases);
          return state
            .set(PERSON_DATA.NUM_CASES_LOADED, state.get(PERSON_DATA.NUM_CASES_LOADED) + cases.length)
            .setIn([REDUX.ERRORS, PERSON_ACTIONS.UPDATE_CASES], fromJS({ [FAILED_CASES]: failedCases, error }));
        },
        FINALLY: () => {
          let newState = state;
          const existingFailedCases = state
            .getIn([REDUX.ERRORS, PERSON_ACTIONS.UPDATE_CASES, FAILED_CASES], List());
          const numCasesToLoad = state.get(PERSON_DATA.NUM_CASES_TO_LOAD);
          const numCasesLoaded = state.get(PERSON_DATA.NUM_CASES_LOADED);
          if (numCasesToLoad === numCasesLoaded) {
            const reqState = existingFailedCases.size ? FAILURE : SUCCESS;
            newState = state
              .set(PERSON_DATA.NUM_CASES_TO_LOAD, 0)
              .set(PERSON_DATA.NUM_CASES_LOADED, 0)
              .setIn([REDUX.ACTIONS, PERSON_ACTIONS.UPDATE_CASES, REDUX.REQUEST_STATE], reqState);
          }
          return newState.deleteIn([REDUX.ACTIONS, PERSON_ACTIONS.UPDATE_CASES, action.id]);
        }
      });
    }

    default:
      return state;
  }
}
