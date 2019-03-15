import moment from 'moment';
import { Map } from 'immutable';
import { Constants } from 'lattice';

import { getHearingFields } from './consts/HearingConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { addWeekdays, getEntityKeyId } from './DataUtils';


let { HEARINGS, PEOPLE } = APP_TYPES_FQNS;

HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();

const { OPENLATTICE_ID_FQN } = Constants;

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

export const OPT_OUT_HEADERS = {
  NAME: 'Name',
  CONTACT: 'Contact',
  OPT_OUT_TIME: 'Time of Opt Out',
  REASON: 'Reason'
};

export const FILTERS = {
  ALL: 'All',
  FAILED: 'Failed',
  SUCCESSFUL: 'Successful'
};

export const getReminderFields = (reminder) => {
  const reminderId = reminder.getIn([OPENLATTICE_ID_FQN, 0], '');
  const wasNotified = reminder.getIn([PROPERTY_TYPES.NOTIFIED, 0], false);
  const dateTime = reminder.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
  const entityKeyId = reminder.getIn([OPENLATTICE_ID_FQN, 0]);
  return {
    reminderId,
    wasNotified,
    dateTime,
    entityKeyId
  };
};

export const getOptOutFields = (optOut) => {
  const dateTime = optOut.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
  const entityKeyId = optOut.getIn([OPENLATTICE_ID_FQN, 0], '');
  const reason = optOut.getIn([PROPERTY_TYPES.REASON, 0], 'No Response');
  return {
    dateTime,
    entityKeyId,
    reason
  };
};

export const sortEntities = (entities, neighbors, shouldSortByDateTime) => (
  entities.valueSeq().sort((entity1, entity2) => {
    const entityKeyId1 = getEntityKeyId(entity1);
    const person1 = neighbors.getIn([entityKeyId1, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const hearingDateTime1 = moment(neighbors
      .getIn([entityKeyId1, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const dateTime1 = moment(entity1.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
    const firstName1 = person1.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
    const lastName1 = person1.getIn([PROPERTY_TYPES.LAST_NAME, 0]);

    const entityKeyId2 = getEntityKeyId(entity2);
    const person2 = neighbors.getIn([entityKeyId2, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const hearingDateTime2 = moment(neighbors
      .getIn([entityKeyId2, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const dateTime2 = moment(entity2.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
    const firstName2 = person2.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
    const lastName2 = person2.getIn([PROPERTY_TYPES.LAST_NAME, 0]);
    if (shouldSortByDateTime && !dateTime1.isSame(dateTime2)) return dateTime1.isBefore(dateTime2) ? -1 : 1;
    if (!hearingDateTime1.isSame(hearingDateTime2)) return hearingDateTime1.isBefore(hearingDateTime2) ? -1 : 1;
    if (lastName1 !== lastName2) return lastName1 > lastName2 ? 1 : -1;
    if (firstName1 !== firstName2) return firstName1 > firstName2 ? 1 : -1;
    return 0;
  }));

export const hearingNeedsReminder = (hearing) => {
  const today = moment();
  const oneDayAhead = addWeekdays(today, 1);
  const oneWeekAhead = addWeekdays(today, 5);
  const { hearingDateTime } = getHearingFields(hearing);
  return hearingDateTime.isSame(oneDayAhead, 'day')
   || hearingDateTime.isSame(oneWeekAhead, 'day');
};
