/*
 * @flow
 */

import Immutable from 'immutable';
import { loadDashboardData } from './DashboardActionFactory';

const INITIAL_STATE = Immutable.fromJS({
  dashboardData: Immutable.Map(),
  isLoading: false
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case loadDashboardData.case(action.type): {
      return loadDashboardData.reducer(state, action, {
        REQUEST: () => state.set('dashboardData', Immutable.Map()).set('isLoading', true),
        SUCCESS: () => state.set('dashboardData', Immutable.fromJS(action.value)),
        FAILURE: () => state.set('dashboardData', Immutable.Map()),
        FINALLY: () => state.set('isLoading', false)
      });
    }

    default:
      return state;
  }
}
