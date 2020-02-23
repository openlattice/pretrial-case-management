/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';

import {
  CLEAR_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS,
  LOAD_MANUAL_REMINDERS_NEIGHBORS,
  SUBMIT_MANUAL_REMINDER,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
  submitManualReminder
} from './ManualRemindersActions';
import { submitContact } from '../contactinformation/ContactInfoActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { MANUAL_REMINDERS_DATA } from '../../utils/consts/redux/ManualRemindersConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const { CONTACT_INFORMATION } = APP_TYPES;

const { NOTIFIED } = PROPERTY_TYPES;

const {
  FAILED_REMINDER_IDS,
  REMINDER_NEIGHBORS,
  REMINDERS_BY_ID,
  PEOPLE_NEIGHBORS,
  PEOPLE_RECEIVING_REMINDERS,
  SUBMITTED_MANUAL_REMINDER,
  SUCCESSFUL_REMINDER_IDS,
} = MANUAL_REMINDERS_DATA;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [LOAD_MANUAL_REMINDERS_FORM]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_MANUAL_REMINDERS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_MANUAL_REMINDERS_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [SUBMIT_MANUAL_REMINDER]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
  },
  [REDUX.ERRORS]: {
    [LOAD_MANUAL_REMINDERS_FORM]: Map(),
    [LOAD_MANUAL_REMINDERS]: Map(),
    [LOAD_MANUAL_REMINDERS_NEIGHBORS]: Map(),
    [SUBMIT_MANUAL_REMINDER]: Map(),
  },
  [FAILED_REMINDER_IDS]: Set(),
  [REMINDER_NEIGHBORS]: Map(),
  [REMINDERS_BY_ID]: Map(),
  [PEOPLE_NEIGHBORS]: Map(),
  [PEOPLE_RECEIVING_REMINDERS]: Set(),
  [SUBMITTED_MANUAL_REMINDER]: Map(),
  [SUCCESSFUL_REMINDER_IDS]: Set()
});

export default function manualRemindersReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadManualRemindersForm.case(action.type): {
      return loadManualRemindersForm.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_FORM, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_FORM, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { neighborsByAppTypeFqn } = action.value;
          return state
            .set(PEOPLE_NEIGHBORS, neighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_FORM, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_MANUAL_REMINDERS_FORM], error)
            .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_FORM, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_FORM, action.id])
      });
    }

    case loadManualRemindersForDate.case(action.type): {
      return loadManualRemindersForDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            manualReminders,
            successfulManualRemindersIds,
            failedManualRemindersIds
          } = action.value;
          return state
            .set(REMINDERS_BY_ID, manualReminders)
            .set(SUCCESSFUL_REMINDER_IDS, successfulManualRemindersIds)
            .set(FAILED_REMINDER_IDS, failedManualRemindersIds)
            .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_MANUAL_REMINDERS], error)
            .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS, action.id])
      });
    }

    case loadManualRemindersNeighborsById.case(action.type): {
      return loadManualRemindersNeighborsById.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_NEIGHBORS, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { peopleReceivingManualReminders, manualReminderNeighborsById } = action.value;
          return state
            .set(PEOPLE_RECEIVING_REMINDERS, peopleReceivingManualReminders)
            .set(REMINDER_NEIGHBORS, manualReminderNeighborsById)
            .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_MANUAL_REMINDERS_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_MANUAL_REMINDERS_NEIGHBORS, action.id])
      });
    }

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        SUCCESS: () => {
          const { contactInfo } = action.value;
          const contactEntity = Map().withMutations((map) => map.set(PSA_NEIGHBOR.DETAILS, contactInfo));
          const updatedContactInfo = state
            .getIn([PEOPLE_NEIGHBORS, CONTACT_INFORMATION], List()).push(contactEntity);
          const nextState = state
            .setIn([PEOPLE_NEIGHBORS, CONTACT_INFORMATION], updatedContactInfo);
          return nextState;
        }
      });
    }

    case submitManualReminder.case(action.type): {
      return submitManualReminder.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, SUBMIT_MANUAL_REMINDER, action.id], action)
          .setIn([REDUX.ACTIONS, SUBMIT_MANUAL_REMINDER, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { manualReminder, manualReminderEKID, manualReminderNeighbors } = action.value;
          const { [NOTIFIED]: wasNotified } = getEntityProperties(manualReminder, [NOTIFIED]);
          let successfulReminderIds = state.get(SUCCESSFUL_REMINDER_IDS, Set());
          let failedReminderIds = state.get(FAILED_REMINDER_IDS, Set());
          if (wasNotified) {
            successfulReminderIds = successfulReminderIds.add(manualReminderEKID);
          }
          else {
            failedReminderIds = failedReminderIds.add(manualReminderEKID);
          }
          return state
            .set(SUBMITTED_MANUAL_REMINDER, manualReminder)
            .setIn([REMINDERS_BY_ID, manualReminderEKID], manualReminder)
            .setIn([REMINDER_NEIGHBORS, manualReminderEKID], manualReminderNeighbors)
            .set(FAILED_REMINDER_IDS, failedReminderIds)
            .set(SUCCESSFUL_REMINDER_IDS, successfulReminderIds)
            .setIn([REDUX.ACTIONS, SUBMIT_MANUAL_REMINDER, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, SUBMIT_MANUAL_REMINDER], error)
            .setIn([REDUX.ACTIONS, SUBMIT_MANUAL_REMINDER, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, SUBMIT_MANUAL_REMINDER, action.id])
      });
    }

    case CLEAR_MANUAL_REMINDERS_FORM:
      return state
        .set(PEOPLE_NEIGHBORS, Map())
        .set(SUBMITTED_MANUAL_REMINDER, Map())
        .set(REMINDER_NEIGHBORS, Map());

    default:
      return state;
  }
}
