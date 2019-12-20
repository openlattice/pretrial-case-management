/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_MANUAL_REMINDERS_FORM :'CLEAR_MANUAL_REMINDERS_FORM' = 'CLEAR_MANUAL_REMINDERS_FORM';
const clearManualRemindersForm = () => ({
  type: CLEAR_MANUAL_REMINDERS_FORM
});

const LOAD_MANUAL_REMINDERS_FORM :string = 'LOAD_MANUAL_REMINDERS_FORM';
const loadManualRemindersForm :RequestSequence = newRequestSequence(LOAD_MANUAL_REMINDERS_FORM);

const LOAD_MANUAL_REMINDERS :string = 'LOAD_MANUAL_REMINDERS';
const loadManualRemindersForDate :RequestSequence = newRequestSequence(LOAD_MANUAL_REMINDERS);

const LOAD_MANUAL_REMINDERS_NEIGHBORS :string = 'LOAD_MANUAL_REMINDERS_NEIGHBORS';
const loadManualRemindersNeighborsById :RequestSequence = newRequestSequence(LOAD_MANUAL_REMINDERS_NEIGHBORS);

const SUBMIT_MANUAL_REMINDER :string = 'SUBMIT_MANUAL_REMINDER';
const submitManualReminder :RequestSequence = newRequestSequence(SUBMIT_MANUAL_REMINDER);

export {
  CLEAR_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS,
  LOAD_MANUAL_REMINDERS_NEIGHBORS,
  SUBMIT_MANUAL_REMINDER,
  clearManualRemindersForm,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
  submitManualReminder
};
