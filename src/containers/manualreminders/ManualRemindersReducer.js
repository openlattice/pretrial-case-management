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
  CLEAR_MANUAL_REMINDERS_FORM,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
  submitManualReminder
} from './ManualRemindersActions';
import { submitContact } from '../contactinformation/ContactInfoActions';
import { MANUAL_REMINDERS, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';

const { CONTACT_INFORMATION } = APP_TYPES;

const { NOTIFIED } = PROPERTY_TYPES;

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
  [MANUAL_REMINDERS.FAILED_REMINDER_IDS]: Set(),
  [MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER]: Map(),
  [MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER_NEIGHBORS]: Map(),
  [MANUAL_REMINDERS.SUBMITTING_MANUAL_REMINDER]: false,
  [MANUAL_REMINDERS.SUBMISSION_ERROR]: List()
});

export default function manualRemindersReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
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

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        SUCCESS: () => {
          const { contactInfo } = action.value;
          const contactEntity = Map().withMutations(map => map.set(PSA_NEIGHBOR.DETAILS, contactInfo));
          const updatedContactInfo = state
            .getIn([MANUAL_REMINDERS.PEOPLE_NEIGHBORS, CONTACT_INFORMATION], List()).push(contactEntity);
          const nextState = state
            .setIn([MANUAL_REMINDERS.PEOPLE_NEIGHBORS, CONTACT_INFORMATION], updatedContactInfo);
          return nextState;
        }
      });
    }

    case submitManualReminder.case(action.type): {
      return submitManualReminder.reducer(state, action, {
        REQUEST: () => state.set(MANUAL_REMINDERS.SUBMITTING_MANUAL_REMINDER, true),
        SUCCESS: () => {
          const { manualReminder, manualReminderEKID, manualReminderNeighbors } = action.value;
          const { [NOTIFIED]: wasNotified } = getEntityProperties(manualReminder, [NOTIFIED]);
          const manualReminderIds = state
            .get(MANUAL_REMINDERS.REMINDER_IDS, Set())
            .add(manualReminderEKID);
          let successfulReminderIds = state.get(MANUAL_REMINDERS.SUCCESSFUL_REMINDER_IDS, Set());
          let failedReminderIds = state.get(MANUAL_REMINDERS.FAILED_REMINDER_IDS, Set());
          if (wasNotified) {
            successfulReminderIds = successfulReminderIds.add(manualReminderEKID);
          }
          else {
            failedReminderIds = failedReminderIds.add(manualReminderEKID);
          }
          return state
            .set(MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER, manualReminder)
            .set(MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER_NEIGHBORS, manualReminderNeighbors)
            .setIn([MANUAL_REMINDERS.REMINDERS_BY_ID, manualReminderEKID], manualReminder)
            .setIn([MANUAL_REMINDERS.MANUAL_REMINDER_NEIGHBORS, manualReminderEKID], manualReminderNeighbors)
            .set(MANUAL_REMINDERS.REMINDER_IDS, manualReminderIds)
            .set(MANUAL_REMINDERS.FAILED_REMINDER_IDS, failedReminderIds)
            .set(MANUAL_REMINDERS.SUCCESSFUL_REMINDER_IDS, successfulReminderIds);
        },
        FAILURE: () => state.set(MANUAL_REMINDERS.SUBMISSION_ERROR, action.value),
        FINALLY: () => state.set(MANUAL_REMINDERS.SUBMITTING_MANUAL_REMINDER, false)
      });
    }

    case CLEAR_MANUAL_REMINDERS_FORM:
      return state
        .set(MANUAL_REMINDERS.PEOPLE_NEIGHBORS, Map())
        .set(MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER, Map())
        .set(MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER_NEIGHBORS, Map());

    default:
      return state;
  }
}
