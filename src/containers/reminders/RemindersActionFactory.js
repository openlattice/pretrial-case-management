/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const BULK_DOWNLOAD_REMINDERS_PDF :string = 'BULK_DOWNLOAD_REMINDERS_PDF';
const bulkDownloadRemindersPDF :RequestSequence = newRequestSequence(BULK_DOWNLOAD_REMINDERS_PDF);

const LOAD_OPT_OUT_NEIGHBORS :string = 'LOAD_OPT_OUT_NEIGHBORS';
const loadOptOutNeighbors :RequestSequence = newRequestSequence(LOAD_OPT_OUT_NEIGHBORS);

const LOAD_OPT_OUTS_FOR_DATE :string = 'LOAD_OPT_OUTS_FOR_DATE';
const loadOptOutsForDate :RequestSequence = newRequestSequence(LOAD_OPT_OUTS_FOR_DATE);

const LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS :string = 'LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS';
const loadPeopleWithHearingsButNoContacts :RequestSequence = newRequestSequence(
  LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS
);

const LOAD_REMINDERS_FOR_DATE :string = 'LOAD_REMINDERS_FOR_DATE';
const loadRemindersforDate :RequestSequence = newRequestSequence(LOAD_REMINDERS_FOR_DATE);

const LOAD_REMINDER_NEIGHBORS :string = 'LOAD_REMINDER_NEIGHBORS';
const loadReminderNeighborsById :RequestSequence = newRequestSequence(LOAD_REMINDER_NEIGHBORS);

export {
  BULK_DOWNLOAD_REMINDERS_PDF,
  LOAD_OPT_OUT_NEIGHBORS,
  LOAD_OPT_OUTS_FOR_DATE,
  LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS,
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_FOR_DATE,
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadOptOutsForDate,
  loadPeopleWithHearingsButNoContacts,
  loadReminderNeighborsById,
  loadRemindersforDate
};
