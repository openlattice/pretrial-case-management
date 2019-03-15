/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_MANUAL_REMINDERS_FORM :string = 'LOAD_MANUAL_REMINDERS_FORM';
const loadManualRemindersForm :RequestSequence = newRequestSequence(LOAD_MANUAL_REMINDERS_FORM);

const LOAD_MANUAL_REMINDERS :string = 'LOAD_MANUAL_REMINDERS';
const loadManualRemindersForDate :RequestSequence = newRequestSequence(LOAD_MANUAL_REMINDERS);

const LOAD_MANUAL_REMINDERS_NEIGHBORS :string = 'LOAD_MANUAL_REMINDERS_NEIGHBORS';
const loadManualRemindersNeighborsById :RequestSequence = newRequestSequence(LOAD_MANUAL_REMINDERS_NEIGHBORS);

export {
  LOAD_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS,
  LOAD_MANUAL_REMINDERS_NEIGHBORS,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
};
