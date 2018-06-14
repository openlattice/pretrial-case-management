/*
 * @flow
 */

import Immutable from 'immutable';
import { loadDashboardData } from './DashboardActionFactory';

const INITIAL_STATE = Immutable.fromJS({
  dashboardData: Immutable.Map(),
  isLoading: false,
  error: false
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case loadDashboardData.case(action.type): {
      return loadDashboardData.reducer(state, action, {
        REQUEST: () => state.set('dashboardData', Immutable.Map()).set('isLoading', true).set('error', false),
        SUCCESS: () => state.set('dashboardData', Immutable.fromJS(action.value)).set('error', false),
        FAILURE: () => state.set('dashboardData', Immutable.Map()).set('error', true),
        FINALLY: () => state.set('isLoading', false)
      });
    }

    default:
      return state;
  }
}
