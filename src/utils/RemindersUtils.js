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

export const REMINDERS_HEADERS = [
  { key: 'hearingDateTime', label: 'Hearing Time', cellStyle: { width: '145px' } },
  { key: 'caseNumber', label: 'Case', cellStyle: { width: '125px' } },
  { key: 'personName', label: 'Name', cellStyle: { width: '220px' }  },
  { key: 'contact', label: 'Contact', cellStyle: { width: '125px' } },
  { key: 'courtroom', label: 'Courtroom', cellStyle: { width: '130px' } },
  { key: 'reminderType', label: 'Type', cellStyle: { width: '80px' } },
  { key: 'wasNotified', label: 'Staus', cellStyle: { width: '130px' } }
];

export const OPT_OUT_HEADERS = [
  { key: 'dateTime', label: 'Time' },
  { key: 'personName', label: 'Name' },
  { key: 'contact', label: 'Contact' },
  { key: 'reason', label: 'Reason' }
];

export const REMINDER_TYPES = {
  HEARING: 'Hearing',
  CHECKIN: 'Check-in'
};

export const FILTERS = {
  ALL: 'All',
  FAILED: 'Failed',
  SUCCESSFUL: 'Successful',
  MANUAL: 'Manual'
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
    const hearingDateTime1 = DateTime.fromISO(neighbors
      .getIn([entityKeyId1, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const dateTime1 = DateTime.fromISO(getFirstNeighborValue(entity1, PROPERTY_TYPES.DATE_TIME));
    const firstName1 = getFirstNeighborValue(person1, PROPERTY_TYPES.FIRST_NAME);
    const lastName1 = getFirstNeighborValue(person1, PROPERTY_TYPES.LAST_NAME);

    const entityKeyId2 = getEntityKeyId(entity2);
    const person2 = neighbors.getIn([entityKeyId2, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const caseNumber2 = neighbors.getIn(
      [entityKeyId2, PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
    );
    const hearingDateTime2 = DateTime.fromISO(neighbors
      .getIn([entityKeyId2, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const dateTime2 = DateTime.fromISO(getFirstNeighborValue(entity2, PROPERTY_TYPES.DATE_TIME));
    const firstName2 = getFirstNeighborValue(person2, PROPERTY_TYPES.FIRST_NAME);
    const lastName2 = getFirstNeighborValue(person2, PROPERTY_TYPES.LAST_NAME);

    if (shouldSortByDateTime && !dateTime1.hasSame(dateTime2, 'minutes')) return dateTime1 < dateTime2 ? -1 : 1;
    if (sort === SORT_TYPES.CASE_NUM) {
      if (isNotEqual(caseNumber1, caseNumber2)) return isGreater(caseNumber1, caseNumber2);
      if (!hearingDateTime1.hasSame(hearingDateTime2, 'minutes')) return hearingDateTime1 < hearingDateTime2 ? -1 : 1;
      if (isNotEqual(lastName1, lastName2)) return isGreater(lastName1, lastName2);
      if (isNotEqual(firstName1, firstName2)) return isGreater(firstName1, firstName2);
    }
    if (sort === SORT_TYPES.DATE) {
      if (!hearingDateTime1.hasSame(hearingDateTime2, 'minutes')) return hearingDateTime1 < hearingDateTime2 ? -1 : 1;
      if (isNotEqual(lastName1, lastName2)) return isGreater(lastName1, lastName2);
      if (isNotEqual(firstName1, firstName2)) return isGreater(firstName1, firstName2);
    }
    if (isNotEqual(lastName1, lastName2)) return isGreater(lastName1, lastName2);
    if (isNotEqual(firstName1, firstName2)) return isGreater(firstName1, firstName2);
    if (!hearingDateTime1.hasSame(hearingDateTime2, 'minutes')) return hearingDateTime1 < hearingDateTime2 ? -1 : 1;
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
