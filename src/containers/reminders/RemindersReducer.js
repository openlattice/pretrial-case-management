/*
 * @flow
 */

import { DateTime } from 'luxon';
import { Map, Set, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { submitManualReminder } from '../manualreminders/ManualRemindersActions';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import {
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadOptOutsForDate,
  loadRemindersActionList,
  loadReminderNeighborsById,
  loadRemindersforDate,
  SET_DATE_FOR_REMIDNERS_ACTION_LIST
} from './RemindersActionFactory';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { REMINDERS_ACTIONS, REMINDERS_DATA } from '../../utils/consts/redux/RemindersConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF]: Map(),
    [REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS]: Map(),
    [REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE]: Map(),
    [REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST]: Map(),
    [REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE]: Map(),
    [REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS]: Map()
  },
  [REMINDERS_DATA.REMINDERS_ACTION_LIST_DATE]: DateTime.local(),
  [REMINDERS_DATA.REMINDERS_ACTION_LIST]: Map(),
  [REMINDERS_DATA.REMINDERS_BY_COUNTY]: Map(),
  [REMINDERS_DATA.REMINDERS_BY_ID]: Map(),
  [REMINDERS_DATA.SUCCESSFUL_REMINDER_IDS]: Set(),
  [REMINDERS_DATA.FAILED_REMINDER_IDS]: Set(),
  [REMINDERS_DATA.REMINDER_NEIGHBORS]: Map(),
  [REMINDERS_DATA.REMINDERS_WITH_OPEN_PSA_IDS]: Map(),
  [REMINDERS_DATA.OPT_OUTS]: Map(),
  [REMINDERS_DATA.OPT_OUT_NEIGHBORS]: Map(),
  [REMINDERS_DATA.OPT_OUT_PEOPLE_IDS]: Set()
});

export default function remindersReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case bulkDownloadRemindersPDF.case(action.type): {
      return bulkDownloadRemindersPDF.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF, action.id], action)
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF, REDUX.REQUEST_STATE], PENDING),
        SUCESSS: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF], error)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF, REDUX.REQUEST_STATE], STANDBY)
          .deleteIn([REDUX.ACTIONS, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF, action.id])
      });
    }

    case loadOptOutNeighbors.case(action.type): {
      return loadOptOutNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS, action.id], action)
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { optOutNeighborsById, optOutPeopleIds } = action.value;
          return state
            .set(REMINDERS_DATA.OPT_OUT_NEIGHBORS, optOutNeighborsById)
            .set(REMINDERS_DATA.OPT_OUT_PEOPLE_IDS, optOutPeopleIds)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS, action.id])
      });
    }

    case loadOptOutsForDate.case(action.type): {
      return loadOptOutsForDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE, action.id], action)
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { optOutMap } = action.value;
          return state
            .set(REMINDERS_DATA.OPT_OUTS, optOutMap)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE], error)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE, action.id])
      });
    }

    case loadRemindersActionList.case(action.type): {
      return loadRemindersActionList.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST, action.id], action)
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { remindersActionList } = action.value;
          return state
            .set(REMINDERS_DATA.REMINDERS_ACTION_LIST, remindersActionList)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST], error)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST, action.id])
      });
    }

    case loadRemindersforDate.case(action.type): {
      return loadRemindersforDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE, action.id], action)
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            remindersById,
            successfulRemindersIds,
            failedRemindersIds,
          } = action.value;
          return state
            .set(REMINDERS_DATA.REMINDERS_BY_ID, remindersById)
            .set(REMINDERS_DATA.SUCCESSFUL_REMINDER_IDS, successfulRemindersIds)
            .set(REMINDERS_DATA.FAILED_REMINDER_IDS, failedRemindersIds)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE], error)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE, action.id])
      });
    }

    case loadReminderNeighborsById.case(action.type): {
      return loadReminderNeighborsById.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS, action.id], action)
          .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { reminderNeighborsById, reminderIdsByCounty } = action.value;
          return state
            .set(REMINDERS_DATA.REMINDER_NEIGHBORS, reminderNeighborsById)
            .set(REMINDERS_DATA.REMINDERS_BY_COUNTY, reminderIdsByCounty)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS, action.id])
      });
    }

    case SET_DATE_FOR_REMIDNERS_ACTION_LIST: {
      const { date } = action.value;
      const formattedDate = DateTime.fromFormat(date, DATE_FORMAT);
      return state.set(REMINDERS_DATA.REMINDERS_ACTION_LIST_DATE, formattedDate);
    }

    case submitManualReminder.case(action.type): {
      return submitManualReminder.reducer(state, action, {
        SUCCESS: () => {
          const { personEKID } = action.value;
          const remindersActionList = state.get(REMINDERS_DATA.REMINDERS_ACTION_LIST, Map()).delete(personEKID);
          return state
            .set(REMINDERS_DATA.REMINDERS_ACTION_LIST, remindersActionList);
        }
      });
    }

    case SWITCH_ORGANIZATION:
      return INITIAL_STATE;

    default:
      return state;
  }
}
