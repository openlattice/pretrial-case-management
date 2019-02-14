import moment from 'moment';
import { Map } from 'immutable';
import { Constants } from 'lattice';

import { APP_TYPES_FQNS, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { getEntityKeyId } from './DataUtils';


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
  STATUS: 'Status',
  PSA_STATUS: 'Open PSA'
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

export const sortReminders = (reminders, neighbors) => (
  reminders.valueSeq().sort((reminder1, reminder2) => {
    const entityKeyId1 = getEntityKeyId(reminder1);
    const person1 = neighbors.getIn([entityKeyId1, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const hearingDateTime1 = moment(neighbors
      .getIn([entityKeyId1, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const firstName1 = person1.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
    const lastName1 = person1.getIn([PROPERTY_TYPES.LAST_NAME, 0]);

    const entityKeyId2 = getEntityKeyId(reminder2);
    const person2 = neighbors.getIn([entityKeyId2, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const hearingDateTime2 = moment(neighbors
      .getIn([entityKeyId2, HEARINGS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
    const firstName2 = person2.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
    const lastName2 = person2.getIn([PROPERTY_TYPES.LAST_NAME, 0]);

    if (!hearingDateTime1.isSame(hearingDateTime2)) return hearingDateTime1.isBefore(hearingDateTime2) ? -1 : 1;
    if (lastName1 !== lastName2) return lastName1 > lastName2 ? 1 : -1;
    if (firstName1 !== firstName2) return firstName1 > firstName2 ? 1 : -1;
    return 0;
  }));
