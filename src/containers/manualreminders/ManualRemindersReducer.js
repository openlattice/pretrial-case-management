/*
 * @flow
 */

import { Map, Set, fromJS } from 'immutable';

import {
  CLEAR_MANUAL_REMINDERS_FORM,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
} from './ManualRemindersActionFactory';
import { refreshPersonNeighbors } from '../people/PeopleActionFactory';
import { MANUAL_REMINDERS } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';

let { CONTACT_INFORMATION } = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();

const INITIAL_STATE :Map<*, *> = fromJS({
  [MANUAL_REMINDERS.LOADING_FORM]: false,
  [MANUAL_REMINDERS.PEOPLE_NEIGHBORS]: Map(),

});
export default function remindersReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case loadManualRemindersForm.case(action.type): {
      return loadManualRemindersForm.reducer(state, action, {
        REQUEST: () => state.set(MANUAL_REMINDERS.LOADING_FORM, true),
        SUCCESS: () => {
          const { neighborsByAppTypeFqn } = action.value;
          return state.set(MANUAL_REMINDERS.PEOPLE_NEIGHBORS, neighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(MANUAL_REMINDERS.LOADING_FORM, false)
      });
    }

    case loadManualRemindersForDate.case(action.type): {
      return loadManualRemindersForDate.reducer(state, action, {
        REQUEST: () => state,
        SUCCESS: () => {
          return state;
        },
        FINALLY: () => state
      });
    }

    case loadManualRemindersNeighborsById.case(action.type): {
      return loadManualRemindersNeighborsById.reducer(state, action, {
        REQUEST: () => state,
        SUCCESS: () => {
          return state;
        },
        FINALLY: () => state
      });
    }

    case refreshPersonNeighbors.case(action.type): {
      return refreshPersonNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { neighbors } = action.value;
          const contactInfo = neighbors.get(CONTACT_INFORMATION, Map());
          const personNeighbors = state.set(CONTACT_INFORMATION, contactInfo);
          return state.set(MANUAL_REMINDERS.PEOPLE_NEIGHBORS, personNeighbors);
        }
      });
    }

    case CLEAR_MANUAL_REMINDERS_FORM:
      return INITIAL_STATE;

    default:
      return state;
  }
}
