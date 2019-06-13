/*
 * @flow
 */

import { Map, Set, fromJS } from 'immutable';

import {
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors
} from './CheckInsActionFactory';
import { CHECK_IN } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [CHECK_IN.CHECK_INS_LOADED]: false,
  [CHECK_IN.LOADING_CHECK_INS]: false,
  [CHECK_IN.CHECK_IN_IDS]: Map(),
  [CHECK_IN.CHECK_INS_BY_ID]: Map(),
  [CHECK_IN.LOADING_CHECK_IN_NEIGHBORS]: false,
  [CHECK_IN.CHECK_IN_NEIGHBORS_BY_ID]: Map(),
  [CHECK_IN.SUCCESSFUL_IDS]: Set(),
  [CHECK_IN.FAILED_IDS]: Set(),
  [CHECK_IN.PENDING_IDS]: Set()
});

export default function manualRemindersReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadCheckInAppointmentsForDate.case(action.type): {
      return loadCheckInAppointmentsForDate.reducer(state, action, {
        REQUEST: () => state
          .set(CHECK_IN.CHECK_INS_LOADED, false)
          .set(CHECK_IN.LOADING_CHECK_INS, true),
        SUCCESS: () => {
          const { checkInAppointmentIds, checkInAppointmentMap } = action.value;
          return state
            .set(CHECK_IN.CHECK_INS_BY_ID, checkInAppointmentMap)
            .set(CHECK_IN.CHECK_IN_IDS, checkInAppointmentIds)
            .set(CHECK_IN.CHECK_INS_LOADED, true);
        },
        FAILURE: () => state.set(CHECK_IN.LOADING_CHECK_INS, false),
        FINALLY: () => state.set(CHECK_IN.LOADING_CHECK_INS, false)
      });
    }

    case loadCheckInNeighbors.case(action.type): {
      return loadCheckInNeighbors.reducer(state, action, {
        REQUEST: () => state.set(CHECK_IN.LOADING_CHECK_IN_NEIGHBORS, true),
        SUCCESS: () => {
          const { checkInNeighborsById } = action.value;
          return state.set(CHECK_IN.CHECK_IN_NEIGHBORS_BY_ID, checkInNeighborsById);
        },
        FINALLY: () => state.set(CHECK_IN.LOADING_CHECK_IN_NEIGHBORS, false)
      });
    }

    default:
      return state;
  }
}
