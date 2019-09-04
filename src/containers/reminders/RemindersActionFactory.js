/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SET_DATE_FOR_REMIDNERS_ACTION_LIST :'SET_DATE_FOR_REMIDNERS_ACTION_LIST' = 'SET_DATE_FOR_REMIDNERS_ACTION_LIST';
const setDateForRemindersActionList = value => ({
  type: SET_DATE_FOR_REMIDNERS_ACTION_LIST,
  value
});

const BULK_DOWNLOAD_REMINDERS_PDF :string = 'BULK_DOWNLOAD_REMINDERS_PDF';
const bulkDownloadRemindersPDF :RequestSequence = newRequestSequence(BULK_DOWNLOAD_REMINDERS_PDF);

const LOAD_OPT_OUT_NEIGHBORS :string = 'LOAD_OPT_OUT_NEIGHBORS';
const loadOptOutNeighbors :RequestSequence = newRequestSequence(LOAD_OPT_OUT_NEIGHBORS);

const LOAD_OPT_OUTS_FOR_DATE :string = 'LOAD_OPT_OUTS_FOR_DATE';
const loadOptOutsForDate :RequestSequence = newRequestSequence(LOAD_OPT_OUTS_FOR_DATE);

const LOAD_REMINDERS_ACTION_LIST :string = 'LOAD_REMINDERS_ACTION_LIST';
const loadRemindersActionList :RequestSequence = newRequestSequence(LOAD_REMINDERS_ACTION_LIST);

const LOAD_REMINDERS_FOR_DATE :string = 'LOAD_REMINDERS_FOR_DATE';
const loadRemindersforDate :RequestSequence = newRequestSequence(LOAD_REMINDERS_FOR_DATE);

const LOAD_REMINDER_NEIGHBORS :string = 'LOAD_REMINDER_NEIGHBORS';
const loadReminderNeighborsById :RequestSequence = newRequestSequence(LOAD_REMINDER_NEIGHBORS);

const REMOVE_FROM_REMIDNERS_ACTION_LIST :string = 'REMOVE_FROM_REMIDNERS_ACTION_LIST';
const removeFromRemindersActionList :RequestSequence = newRequestSequence(REMOVE_FROM_REMIDNERS_ACTION_LIST);

export {
  BULK_DOWNLOAD_REMINDERS_PDF,
  LOAD_OPT_OUT_NEIGHBORS,
  LOAD_OPT_OUTS_FOR_DATE,
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_ACTION_LIST,
  LOAD_REMINDERS_FOR_DATE,
  REMOVE_FROM_REMIDNERS_ACTION_LIST,
  SET_DATE_FOR_REMIDNERS_ACTION_LIST,
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadRemindersActionList,
  loadOptOutsForDate,
  loadReminderNeighborsById,
  loadRemindersforDate,
  removeFromRemindersActionList,
  setDateForRemindersActionList
};
