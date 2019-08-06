/*
 * @flow
 */

import { fromJS, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';

import { newPersonSubmit } from './PersonActions';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [PERSON_ACTIONS.NEW_PERSON_SUBMIT]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [PERSON_ACTIONS.NEW_PERSON_SUBMIT]: Map()
  },
  [PERSON_DATA.SUBMITTED_PERSON]: Map(),
  [PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS]: Map()
});

export default function personReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case newPersonSubmit.case(action.type): {
      return newPersonSubmit.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { person, personNeighborsByAppTypeFqn } = action.value;
          return state
            .set(PERSON_DATA.SUBMITTED_PERSON, person)
            .set(PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS, personNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(PERSON_DATA.SUBMITTED_PERSON, Map())
            .set(PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, PERSON_ACTIONS.NEW_PERSON_SUBMIT], error)
            .setIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PERSON_ACTIONS.NEW_PERSON_SUBMIT.SUBMIT_CONTACT, action.id])
      });
    }

    default:
      return state;
  }
}
