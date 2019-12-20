/*
 * @flow
 */

import { RequestStates } from 'redux-reqseq';
import { fromJS, Map } from 'immutable';

import { loadCounties } from './CountiesActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { COUNTIES_ACTIONS, COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;


const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [COUNTIES_ACTIONS.LOAD_COUNTIES_FOR_DATE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [COUNTIES_ACTIONS.LOAD_COUNTIES_FOR_DATE]: Map()
  },
  [COUNTIES_DATA.COUNTIES_BY_ID]: Map()
});

export default function hearingsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadCounties.case(action.type): {
      return loadCounties.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, COUNTIES_ACTIONS.LOAD_COUNTIES, action.id], action)
          .setIn([REDUX.ACTIONS, COUNTIES_ACTIONS.LOAD_COUNTIES, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { countiesById } = action.value;
          return state
            .set(COUNTIES_DATA.COUNTIES_BY_ID, countiesById)
            .setIn([REDUX.ACTIONS, COUNTIES_ACTIONS.LOAD_COUNTIES, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(COUNTIES_DATA.COUNTIES_BY_ID, Map())
            .setIn([REDUX.ERRORS, COUNTIES_ACTIONS.LOAD_COUNTIES], error)
            .setIn([REDUX.ACTIONS, COUNTIES_ACTIONS.LOAD_COUNTIES, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, COUNTIES_ACTIONS.LOAD_COUNTIES, action.id])
      });
    }

    default:
      return state;
  }
}
