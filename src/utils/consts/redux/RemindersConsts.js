/*
 * @flow
 */

export const REMINDERS_ACTIONS = {
  BULK_DOWNLOAD_REMINDERS_PDF: 'bulkDownloadRemindersPDF',
  LOAD_OPT_OUT_NEIGHBORS: 'loadOptOutNeighbors',
  LOAD_OPT_OUTS_FOR_DATE: 'loadOptOutsForDate',
  LOAD_REMINDERS_ACTION_LIST: 'loadRemindersActionList',
  LOAD_REMINDERS_FOR_DATE: 'loadRemindersforDate',
  LOAD_REMINDER_NEIGHBORS: 'loadReminderNeighborsById'
};

export const REMINDERS_DATA = {
  FAILED_REMINDER_IDS: 'failedReminderIds',
  FUTURE_REMINDERS: 'futureReminders',
  OPT_OUTS: 'optOutMap',
  OPT_OUT_NEIGHBORS: 'optOutNeighbors',
  OPT_OUT_PEOPLE_IDS: 'optOutPeopleIds',
  REMINDER_IDS: 'reminderIds',
  REMINDER_NEIGHBORS: 'reminderNeighborsById',
  REMINDERS_ACTION_LIST: 'remindersActionList',
  REMINDERS_ACTION_LIST_DATE: 'remindersActionListDate',
  REMINDERS_BY_COUNTY: 'remindersByCounty',
  REMINDERS_BY_ID: 'remindersById',
  REMINDERS_WITH_OPEN_PSA_IDS: 'remindersWithOpenPSA',
  SUCCESSFUL_REMINDER_IDS: 'successfulReminderIds',
};
