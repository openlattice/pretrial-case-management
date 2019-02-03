/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_REMINDERS_FOR_DATE :string = 'LOAD_REMINDERS_FOR_DATE';
const loadRemindersforDate :RequestSequence = newRequestSequence(LOAD_REMINDERS_FOR_DATE);

const LOAD_REMINDER_NEIGHBORS :string = 'LOAD_REMINDER_NEIGHBORS';
const loadReminderNeighborsById :RequestSequence = newRequestSequence(LOAD_REMINDER_NEIGHBORS);

export {
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_FOR_DATE,
  loadReminderNeighborsById,
  loadRemindersforDate
};
