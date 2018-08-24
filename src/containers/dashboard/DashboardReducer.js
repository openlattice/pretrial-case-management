/*
 * @flow
 */

import Immutable from 'immutable';
import { loadDashboardData } from './DashboardActionFactory';
import { DASHBOARD } from '../../utils/consts/FrontEndStateConsts';


const INITIAL_STATE = Immutable.fromJS({
  [DASHBOARD.DATA]: Immutable.Map(),
  [DASHBOARD.LOADING]: false,
  [DASHBOARD.ERROR]: false
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case loadDashboardData.case(action.type): {
      return loadDashboardData.reducer(state, action, {
        REQUEST: () => state.set(DASHBOARD.DATA, Immutable.Map())
          .set(DASHBOARD.LOADING, true).set(DASHBOARD.ERROR, false),
        SUCCESS: () => state.set(DASHBOARD.DATA, Immutable.fromJS(action.value))
          .set(DASHBOARD.ERROR, false),
        FAILURE: () => state.set(DASHBOARD.DATA, Immutable.Map())
          .set(DASHBOARD.ERROR, true),
        FINALLY: () => state.set(DASHBOARD.LOADING, false)
      });
    }

    default:
      return state;
  }
}
