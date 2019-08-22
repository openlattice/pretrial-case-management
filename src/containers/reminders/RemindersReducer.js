/*
 * @flow
 */
import { DateTime } from 'luxon';
import { Map, Set, fromJS } from 'immutable';

import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { submitManualReminder } from '../manualreminders/ManualRemindersActionFactory';
import {
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadOptOutsForDate,
  loadRemindersActionList,
  loadReminderNeighborsById,
  loadRemindersforDate,
  REMOVE_FROM_REMIDNERS_ACTION_LIST,
  SET_DATE_FOR_REMIDNERS_ACTION_LIST
} from './RemindersActionFactory';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import { REMINDERS } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [REMINDERS.REMINDERS_ACTION_LIST_DATE]: DateTime.local(),
  [REMINDERS.LOADING_REMINDERS_ACTION_LIST]: false,
  [REMINDERS.REMINDERS_ACTION_LIST]: Map(),
  [REMINDERS.REMINDER_IDS]: Set(),
  [REMINDERS.FUTURE_REMINDERS]: Map(),
  [REMINDERS.PAST_REMINDERS]: Map(),
  [REMINDERS.SUCCESSFUL_REMINDER_IDS]: Set(),
  [REMINDERS.FAILED_REMINDER_IDS]: Set(),
  [REMINDERS.LOADING_REMINDERS]: false,
  [REMINDERS.LOADED]: false,
  [REMINDERS.REMINDER_NEIGHBORS]: Map(),
  [REMINDERS.REMINDERS_WITH_OPEN_PSA_IDS]: Map(),
  [REMINDERS.LOADING_REMINDER_NEIGHBORS]: false,
  [REMINDERS.OPT_OUTS]: Map(),
  [REMINDERS.OPT_OUT_NEIGHBORS]: Map(),
  [REMINDERS.OPT_OUT_PEOPLE_IDS]: Set(),
  [REMINDERS.OPT_OUTS_WITH_REASON]: Set(),
  [REMINDERS.LOADING_OPT_OUTS]: false,
  [REMINDERS.LOADING_OPT_OUT_NEIGHBORS]: false,
  [REMINDERS.LOADING_REMINDER_PDF]: false,
});
export default function remindersReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
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
        REQUEST: () => state
          .set(REMINDERS.LOADING_REMINDERS, true)
          .set(REMINDERS.LOADED, false),
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
        FINALLY: () => state
          .set(REMINDERS.LOADING_REMINDERS, false)
          .set(REMINDERS.LOADED, true),
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

    case loadRemindersActionList.case(action.type): {
      return loadRemindersActionList.reducer(state, action, {
        REQUEST: () => state.set(REMINDERS.LOADING_REMINDERS_ACTION_LIST, true),
        SUCCESS: () => {
          const { remindersActionList } = action.value;
          return state
            .set(REMINDERS.REMINDERS_ACTION_LIST, remindersActionList);
        },
        FINALLY: () => state.set(REMINDERS.LOADING_REMINDERS_ACTION_LIST, false)
      });
    }

    case submitManualReminder.case(action.type): {
      return submitManualReminder.reducer(state, action, {
        SUCCESS: () => {
          const { personEKID } = action.value;
          const remindersActionList = state.get(REMINDERS.REMINDERS_ACTION_LIST, Map()).delete(personEKID);
          return state
            .set(REMINDERS.REMINDERS_ACTION_LIST, remindersActionList);
        }
      });
    }

    case REMOVE_FROM_REMIDNERS_ACTION_LIST: {
      const { personEntityKeyId } = action.value;
      const remindersActionList = state.get(REMINDERS.REMINDERS_ACTION_LIST, Map()).delete(personEntityKeyId);
      return state.set(REMINDERS.REMINDERS_ACTION_LIST, remindersActionList);
    }

    case SET_DATE_FOR_REMIDNERS_ACTION_LIST: {
      const { date } = action.value;
      const formattedDate = DateTime.fromFormat(date, DATE_FORMAT);
      return state.set(REMINDERS.REMINDERS_ACTION_LIST_DATE, formattedDate);
    }

    case SWITCH_ORGANIZATION:
      return INITIAL_STATE;

    default:
      return state;
  }
}
