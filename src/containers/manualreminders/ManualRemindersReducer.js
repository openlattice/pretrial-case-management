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
import { APP_TYPES } from '../../utils/consts/DataModelConsts';

const { CONTACT_INFORMATION } = APP_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [MANUAL_REMINDERS.LOADING_FORM]: false,
  [MANUAL_REMINDERS.PEOPLE_NEIGHBORS]: Map(),

  [MANUAL_REMINDERS.REMINDER_IDS]: Set(),
  [MANUAL_REMINDERS.REMINDERS_BY_ID]: Map(),
  [MANUAL_REMINDERS.LOADING_MANUAL_REMINDERS]: false,
  [MANUAL_REMINDERS.LOADED]: false,
  [MANUAL_REMINDERS.MANUAL_REMINDER_NEIGHBORS]: Map(),
  [MANUAL_REMINDERS.PEOPLE_RECEIVING_REMINDERS]: Set(),
  [MANUAL_REMINDERS.LOADING_REMINDER_NEIGHBORS]: false,
  [MANUAL_REMINDERS.SUCCESSFUL_REMINDER_IDS]: Set(),
  [MANUAL_REMINDERS.FAILED_REMINDER_IDS]: Set()
});

export default function manualRemindersReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
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
        REQUEST: () => state
          .set(MANUAL_REMINDERS.LOADING_MANUAL_REMINDERS, true)
          .set(MANUAL_REMINDERS.LOADED, false),
        SUCCESS: () => {
          const {
            manualReminderIds,
            manualReminders,
            successfulManualRemindersIds,
            failedManualRemindersIds
          } = action.value;
          return state
            .set(MANUAL_REMINDERS.REMINDER_IDS, manualReminderIds)
            .set(MANUAL_REMINDERS.REMINDERS_BY_ID, manualReminders)
            .set(MANUAL_REMINDERS.SUCCESSFUL_REMINDER_IDS, successfulManualRemindersIds)
            .set(MANUAL_REMINDERS.FAILED_REMINDER_IDS, failedManualRemindersIds);
        },
        FINALLY: () => state
          .set(MANUAL_REMINDERS.LOADING_MANUAL_REMINDERS, false)
          .set(MANUAL_REMINDERS.LOADED, true),
      });
    }

    case loadManualRemindersNeighborsById.case(action.type): {
      return loadManualRemindersNeighborsById.reducer(state, action, {
        REQUEST: () => state.set(MANUAL_REMINDERS.LOADING_REMINDER_NEIGHBORS, true),
        SUCCESS: () => {
          const { peopleReceivingManualReminders, manualReminderNeighborsById } = action.value;
          return state
            .set(MANUAL_REMINDERS.PEOPLE_RECEIVING_REMINDERS, peopleReceivingManualReminders)
            .set(MANUAL_REMINDERS.MANUAL_REMINDER_NEIGHBORS, manualReminderNeighborsById);
        },
        FINALLY: () => state.set(MANUAL_REMINDERS.LOADING_REMINDER_NEIGHBORS, false)
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
      return state.set(MANUAL_REMINDERS.PEOPLE_NEIGHBORS, Map());

    default:
      return state;
  }
}
