import { Constants } from 'lattice';

import { PROPERTY_TYPES } from './consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

export const REMINDERS_HEADERS = {
  TIME: 'Time',
  NAME: 'Name',
  CONTACT: 'Contact',
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
