/*
 * @flow
 */

import { Map, Set, fromJS } from 'immutable';

import {
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
} from './ManualRemindersActionFactory';
import { MANUAL_REMINDERS } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [MANUAL_REMINDERS.LOADING_MODAL]: false,
  [MANUAL_REMINDERS.PEOPLE_NEIGHBORS]: Map(),

});
export default function remindersReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case loadManualRemindersForm.case(action.type): {
      return loadManualRemindersForm.reducer(state, action, {
        REQUEST: () => state.set(MANUAL_REMINDERS.LOADING_MODAL, true),
        SUCCESS: () => {
          const { neighborsByAppTypeFqn } = action.value;
          return state.set(MANUAL_REMINDERS.PEOPLE_NEIGHBORS, neighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(MANUAL_REMINDERS.LOADING_MODAL, false)
      });
    }

    case loadManualRemindersForDate.case(action.type): {
      return loadManualRemindersForDate.reducer(state, action, {
        REQUEST: () => state,
        SUCCESS: () => {
          return state
        },
        FINALLY: () => state
      });
    }

    case loadManualRemindersNeighborsById.case(action.type): {
      return loadManualRemindersNeighborsById.reducer(state, action, {
        REQUEST: () => state,
        SUCCESS: () => {
          return state
        },
        FINALLY: () => state
      });
    }
    default:
      return state;
  }
}
