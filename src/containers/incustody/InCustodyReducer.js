/*
 * @flow
 */

import { RequestStates } from 'redux-reqseq';
import { fromJS, Map, Set } from 'immutable';

import { getInCustodyData } from './InCustodyActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { IN_CUSTODY_ACTIONS, IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;


const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA]: Map()
  },
  [IN_CUSTODY_DATA.JAIL_STAYS_BY_ID]: Map(),
  [IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID]: Map(),
  [IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY]: Set(),
});

export default function hearingsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case getInCustodyData.case(action.type): {
      return getInCustodyData.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { jailStaysById, neighborsByAppTypeFqn, peopleInCustody } = action.value;
          return state
            .set(IN_CUSTODY_DATA.JAIL_STAYS_BY_ID, jailStaysById)
            .set(IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID, neighborsByAppTypeFqn)
            .set(IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY, peopleInCustody.keySeq().toSet())
            .setIn([REDUX.ACTIONS, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(IN_CUSTODY_DATA.JAIL_STAYS_BY_ID, Map())
            .setIn([REDUX.ERRORS, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA], error)
            .setIn([REDUX.ACTIONS, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA, action.id])
      });
    }

    default:
      return state;
  }
}
