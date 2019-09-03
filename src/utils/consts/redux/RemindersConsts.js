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
  REMINDERS_ACTION_LIST_DATE: 'remindersActionListDate',
  REMINDERS_ACTION_LIST: 'remindersActionList',
  REMINDER_IDS: 'reminderIds',
  FUTURE_REMINDERS: 'futureReminders',
  REMINDERS_BY_ID: 'remindersById',
  REMINDERS_BY_COUNTY: 'remindersByCounty',
  SUCCESSFUL_REMINDER_IDS: 'successfulReminderIds',
  FAILED_REMINDER_IDS: 'failedReminderIds',
  REMINDER_NEIGHBORS: 'reminderNeighborsById',
  REMINDERS_WITH_OPEN_PSA_IDS: 'remindersWithOpenPSA',
  OPT_OUTS: 'optOutMap',
  OPT_OUT_NEIGHBORS: 'optOutNeighbors',
  OPT_OUT_PEOPLE_IDS: 'optOutPeopleIds',
};
