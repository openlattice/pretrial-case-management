/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';

import {
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadOptOutsForDate,
  loadPeopleWithHearingsButNoContacts,
  loadReminderNeighborsById,
  loadRemindersforDate
} from './RemindersActionFactory';
import { REMINDERS } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [REMINDERS.REMINDER_IDS]: Set(),
  [REMINDERS.FUTURE_REMINDERS]: Map(),
  [REMINDERS.PAST_REMINDERS]: Map(),
  [REMINDERS.SUCCESSFUL_REMINDER_IDS]: Set(),
  [REMINDERS.FAILED_REMINDER_IDS]: Set(),
  [REMINDERS.LOADING_REMINDERS]: false,
  [REMINDERS.REMINDER_NEIGHBORS]: Map(),
  [REMINDERS.REMINDERS_WITH_OPEN_PSA_IDS]: Map(),
  [REMINDERS.LOADING_REMINDER_NEIGHBORS]: false,
  [REMINDERS.PEOPLE_WITH_HEARINGS_BUT_NO_CONTACT]: Map(),
  [REMINDERS.LOADING_PEOPLE_NO_CONTACTS]: false,
  [REMINDERS.OPT_OUTS]: Map(),
  [REMINDERS.OPT_OUT_NEIGHBORS]: Map(),
  [REMINDERS.OPT_OUT_PEOPLE_IDS]: Set(),
  [REMINDERS.OPT_OUTS_WITH_REASON]: Set(),
  [REMINDERS.LOADING_OPT_OUTS]: false,
  [REMINDERS.LOADING_OPT_OUT_NEIGHBORS]: false,
  [REMINDERS.LOADING_REMINDER_PDF]: false,
});
export default function remindersReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case bulkDownloadRemindersPDF.case(action.type): {
      return bulkDownloadRemindersPDF.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_REMINDER_PDF, true),
        FINALLY: () => state.set(REMINDERS.LOADING_REMINDER_PDF, false)
      });
    }
    case loadOptOutNeighbors.case(action.type): {
      return loadOptOutNeighbors.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_OPT_OUT_NEIGHBORS, true),
        SUCCESS: () => {
          const { optOutNeighborsById, optOutPeopleIds } = action.value;
          return state
            .set(REMINDERS.OPT_OUT_NEIGHBORS, optOutNeighborsById)
            .set(REMINDERS.OPT_OUT_PEOPLE_IDS, optOutPeopleIds);
        },
        FINALLY: () => state.set(REMINDERS.LOADING_OPT_OUT_NEIGHBORS, false)
      });
    }

    case loadOptOutsForDate.case(action.type): {
      return loadOptOutsForDate.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_OPT_OUTS, true),
        SUCCESS: () => {
          const {
            optOutMap,
            optOutsWithReasons
          } = action.value;
          return state
            .set(REMINDERS.OPT_OUTS, optOutMap)
            .set(REMINDERS.OPT_OUTS_WITH_REASON, optOutsWithReasons);
        },
        FINALLY: () => state.set(REMINDERS.LOADING_OPT_OUTS, false)
      });
    }

    case loadRemindersforDate.case(action.type): {
      return loadRemindersforDate.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_REMINDERS, true),
        SUCCESS: () => {
          const {
            reminderIds,
            futureReminders,
            pastReminders,
            successfulRemindersIds,
            failedRemindersIds,
          } = action.value;
          return state
            .set(REMINDERS.REMINDER_IDS, reminderIds)
            .set(REMINDERS.FUTURE_REMINDERS, futureReminders)
            .set(REMINDERS.PAST_REMINDERS, pastReminders)
            .set(REMINDERS.SUCCESSFUL_REMINDER_IDS, successfulRemindersIds)
            .set(REMINDERS.FAILED_REMINDER_IDS, failedRemindersIds);
        },
        FINALLY: () => state.set(REMINDERS.LOADING_REMINDERS, false)
      });
    }

    case loadReminderNeighborsById.case(action.type): {
      return loadReminderNeighborsById.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_REMINDER_NEIGHBORS, true),
        SUCCESS: () => {
          const { reminderNeighborsById } = action.value;
          return state
            .set(REMINDERS.REMINDER_NEIGHBORS, reminderNeighborsById);
        },
        FINALLY: () => state.set(REMINDERS.LOADING_REMINDER_NEIGHBORS, false)
      });
    }

    case loadPeopleWithHearingsButNoContacts.case(action.type): {
      return loadPeopleWithHearingsButNoContacts.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_PEOPLE_NO_CONTACTS, true),
        SUCCESS: () => {
          const { peopleWithOpenPSAsandHearingsButNoContactById } = action.value;
          return state
            .set(REMINDERS.PEOPLE_WITH_HEARINGS_BUT_NO_CONTACT, peopleWithOpenPSAsandHearingsButNoContactById);
        },
        FINALLY: () => state.set(REMINDERS.LOADING_PEOPLE_NO_CONTACTS, false)
      });
    }

    default:
      return state;
  }
}
