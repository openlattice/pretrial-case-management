/*
 * @flow
 */
import React from 'react';
import { Map } from 'immutable';
import { Table } from 'lattice-ui-kit';

import ReminderRow from './RemindersRow';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { formatDateTime } from '../../utils/FormattingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { REMINDERS_HEADERS } from '../../utils/RemindersUtils';

const {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES
} = APP_TYPES;

const {
  CASE_ID,
  COURTROOM,
  DATE_TIME,
  EMAIL,
  ENTITY_KEY_ID,
  NOTIFIED,
  PHONE
} = PROPERTY_TYPES;

const defaultPageOptions = [10, 20, 30, 50];

const RemindersTable = ({
  isLoading,
  manualReminders,
  manualRemindersNeighbors = Map(),
  noNames,
  pageOptions,
  reminders,
  remindersNeighbors = Map(),
  searchQuery,
} :{
  isLoading :boolean;
  manualReminders ?:Map;
  manualRemindersNeighbors ?:Map;
  noNames ?:boolean;
  pageOptions ?:number[];
  reminders ?:Map;
  remindersNeighbors ?:Map;
  searchQuery ?:string;
}) => {

  const getReminderNeighborDetails = (reminder :Map, reminderNeighbors :Map) => {
    const {
      [ENTITY_KEY_ID]: id,
      [NOTIFIED]: wasNotified
    } = getEntityProperties(reminder, [ENTITY_KEY_ID, NOTIFIED]);
    const person = reminderNeighbors.get(PEOPLE, Map());
    const hearing = reminderNeighbors.get(HEARINGS, Map());
    const contactInfo = reminderNeighbors.get(CONTACT_INFORMATION, Map());
    const pretrialCase = reminderNeighbors.get(PRETRIAL_CASES, Map());
    const {
      lastFirstMidString: personNameString,
      lastFirstMid: personName,
      personEntityKeyId: personEKID
    } = formatPeopleInfo(person);
    const { [CASE_ID]: caseNumber } = getEntityProperties(pretrialCase, [CASE_ID]);
    const {
      [EMAIL]: email,
      [PHONE]: phone
    } = getEntityProperties(contactInfo, [EMAIL, PHONE]);
    const {
      [COURTROOM]: courtroom,
      [DATE_TIME]: hearingDTString,
    } = getEntityProperties(hearing, [COURTROOM, DATE_TIME]);
    const hearingDateTime = formatDateTime(hearingDTString);
    const contact = phone || email;
    const dataObj = {
      caseNumber,
      contact,
      courtroom,
      hearingDateTime,
      id,
      personEKID,
      personName,
      wasNotified
    };
    const matchesSearchTerm = [
      caseNumber,
      contact,
      courtroom,
      hearingDateTime,
      id,
      personEKID,
      personNameString,
      wasNotified
    ].some((field) => {
      let fieldValue :any = field;
      if (typeof fieldValue === 'boolean') fieldValue = fieldValue.toString();
      return searchQuery && fieldValue.toLowerCase().includes(searchQuery.toLowerCase());
    });
    if (!searchQuery) return dataObj;
    if (matchesSearchTerm) return dataObj;
    return null;
  };

  const getFormattedData = () => {
    const data = [];
    if (manualReminders && manualReminders.size) {
      manualReminders.entrySeq().forEach(([reminderEKID, reminder]) => {
        const reminderNeighbors = manualRemindersNeighbors.get(reminderEKID, Map());
        const dataObj :Object | null = getReminderNeighborDetails(reminder, reminderNeighbors);
        if (dataObj) {
          dataObj.reminderType = 'Manual';
          data.push(dataObj);
        }
      });
    }

    if (reminders && reminders.size) {
      reminders.entrySeq().forEach(([reminderEKID, reminder]) => {
        const reminderNeighbors = remindersNeighbors.get(reminderEKID, Map());
        const dataObj :Object | null = getReminderNeighborDetails(reminder, reminderNeighbors);
        if (dataObj) {
          dataObj.reminderType = 'SMS';
          data.push(dataObj);
        }
      });
    }
    return { data };
  };

  const { data: reminderData } = getFormattedData();

  if (noNames && REMINDERS_HEADERS.length === 7) {
    REMINDERS_HEADERS.splice(2, 1);
  }

  const components :Object = {
    Row: ({ data } :Object) => (
      <ReminderRow data={data} noNames={noNames} />
    )
  };

  return (
    <Table
        components={components}
        isLoading={isLoading}
        headers={REMINDERS_HEADERS}
        paginated
        rowsPerPageOptions={pageOptions}
        data={reminderData} />
  );
};

RemindersTable.defaultProps = {
  manualReminders: Map(),
  manualRemindersNeighbors: Map(),
  noNames: false,
  pageOptions: defaultPageOptions,
  reminders: Map(),
  remindersNeighbors: Map(),
  searchQuery: ''
};

export default RemindersTable;
