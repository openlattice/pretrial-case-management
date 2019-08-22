import moment from 'moment';
import { DateTime } from 'luxon';
import { Map } from 'immutable';

import { SORT_TYPES } from './consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import {
  addWeekdays,
  getEntityKeyId,
  getEntityProperties,
  getFirstNeighborValue
} from './DataUtils';

const { HEARINGS, PEOPLE, PRETRIAL_CASES } = APP_TYPES;

export const REMINDERS_HEADERS = {
  TIME: 'Time',
  NAME: 'Name',
  CONTACT: 'Contact',
  COURT_TIME: 'Hearing Time',
  COURTROOM: 'Courtroom',
  HEARING_TYPE: 'Type',
  CASE_NUM: 'Case',
  STATUS: 'Status'
};

export const REMINDER_TYPES = {
  HEARING: 'Hearing',
  CHECKIN: 'Check-in'
};

export const OPT_OUT_HEADERS = {
  NAME: 'Name',
  CONTACT: 'Contact',
  OPT_OUT_TIME: 'Time of Opt Out',
  REASON: 'Reason'
};

export const FILTERS = {
  ALL: 'All',
  FAILED: 'Failed',
  SUCCESSFUL: 'Successful',
  MANUAL: 'Manual'
};

export const getReminderFields = (reminder) => {
  const reminderEntityKeyId = getEntityKeyId(reminder);
  const wasNotified = getFirstNeighborValue(reminder, PROPERTY_TYPES.NOTIFIED, false);
  const dateTime = getFirstNeighborValue(reminder, PROPERTY_TYPES.DATE_TIME);
  return {
    reminderEntityKeyId,
    wasNotified,
    dateTime,
  };
};

export const getOptOutFields = (optOut) => {
  const optOutEntityKeyId = getEntityKeyId(optOut);
  const reason = getFirstNeighborValue(optOut, PROPERTY_TYPES.REASON);
  const dateTime = getFirstNeighborValue(optOut, PROPERTY_TYPES.DATE_TIME);
  return {
    dateTime,
    optOutEntityKeyId,
    reason
  };
};

const isNotEqual = (str1, str2) => (str1 !== str2);
const isGreater = (str1, str2) => (str1 > str2 ? 1 : -1);

export const sortEntities = (entities, neighbors, shouldSortByDateTime, sort) => (
  entities.valueSeq().sort((entity1, entity2) => {
    const entityKeyId1 = getEntityKeyId(entity1);
    const person1 = neighbors.getIn([entityKeyId1, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const caseNumber1 = neighbors.getIn(
      [entityKeyId1, PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
    );
    const hearingDateTime1 = moment(neighbors
      .getIn([entityKeyId1, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const dateTime1 = moment(getFirstNeighborValue(entity1, PROPERTY_TYPES.DATE_TIME));
    const firstName1 = getFirstNeighborValue(person1, PROPERTY_TYPES.FIRST_NAME);
    const lastName1 = getFirstNeighborValue(person1, PROPERTY_TYPES.LAST_NAME);

    const entityKeyId2 = getEntityKeyId(entity2);
    const person2 = neighbors.getIn([entityKeyId2, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const caseNumber2 = neighbors.getIn(
      [entityKeyId2, PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
    );
    const hearingDateTime2 = moment(neighbors
      .getIn([entityKeyId2, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const dateTime2 = moment(getFirstNeighborValue(entity2, PROPERTY_TYPES.DATE_TIME));
    const firstName2 = getFirstNeighborValue(person2, PROPERTY_TYPES.FIRST_NAME);
    const lastName2 = getFirstNeighborValue(person2, PROPERTY_TYPES.LAST_NAME);

    if (shouldSortByDateTime && !dateTime1.isSame(dateTime2)) return dateTime1.isBefore(dateTime2) ? -1 : 1;
    if (sort === SORT_TYPES.CASE_NUM) {
      if (isNotEqual(caseNumber1, caseNumber2)) return isGreater(caseNumber1, caseNumber2);
      if (!hearingDateTime1.isSame(hearingDateTime2)) return hearingDateTime1.isBefore(hearingDateTime2) ? -1 : 1;
      if (isNotEqual(lastName1, lastName2)) return isGreater(lastName1, lastName2);
      if (isNotEqual(firstName1, firstName2)) return isGreater(firstName1, firstName2);
    }
    if (sort === SORT_TYPES.DATE) {
      if (!hearingDateTime1.isSame(hearingDateTime2)) return hearingDateTime1.isBefore(hearingDateTime2) ? -1 : 1;
      if (isNotEqual(lastName1, lastName2)) return isGreater(lastName1, lastName2);
      if (isNotEqual(firstName1, firstName2)) return isGreater(firstName1, firstName2);
    }
    if (isNotEqual(lastName1, lastName2)) return isGreater(lastName1, lastName2);
    if (isNotEqual(firstName1, firstName2)) return isGreater(firstName1, firstName2);
    if (!hearingDateTime1.isSame(hearingDateTime2)) return hearingDateTime1.isBefore(hearingDateTime2) ? -1 : 1;
    return 0;
  }));

export const hearingNeedsReminder = (hearing, date) => {
  const today = date || DateTime.local();
  const oneDayAhead = addWeekdays(today, 1);
  const oneWeekAhead = addWeekdays(today, 7);
  const { [PROPERTY_TYPES.DATE_TIME]: hearingDateTime } = getEntityProperties(hearing, [PROPERTY_TYPES.DATE_TIME]);
  return DateTime.fromISO(hearingDateTime).hasSame(oneDayAhead, 'day')
   || DateTime.fromISO(hearingDateTime).hasSame(oneWeekAhead, 'day');
};
