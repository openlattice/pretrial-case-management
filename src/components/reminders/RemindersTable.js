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
import { getOptOutFields, REMINDERS_HEADERS, OPT_OUT_HEADERS } from '../../utils/RemindersUtils';

const {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES
} = APP_TYPES;

const {
  COURTROOM,
  DATE_TIME,
  NOTIFIED,
  EMAIL,
  CASE_ID,
  PHONE
} = PROPERTY_TYPES;

type Props = {
  isLoading :boolean;
  manualReminders ?:Map;
  manualRemindersNeighbors ?:Map;
  optOuts ?:Map;
  optOutNeighbors ?:Map;
  pageOptions ?:number[];
  reminders ?:Map;
  remindersNeighbors ?:Map;
};

class RemindersTable extends React.Component<Props> {

  static defaultProps = {
    manualReminders: Map(),
    manualRemindersNeighbors: Map(),
    optOuts: Map(),
    optOutNeighbors: Map(),
    pageOptions: [10, 20, 30],
    reminders: Map(),
    remindersNeighbors: Map(),
  }

  getReminderNeighborDetails = (reminder :Map, reminderNeighbors :Map) => {
    const { [NOTIFIED]: wasNotified } = getEntityProperties(reminder, [NOTIFIED]);
    const person = reminderNeighbors.get(PEOPLE, Map());
    const hearing = reminderNeighbors.get(HEARINGS, Map());
    const contactInfo = reminderNeighbors.get(CONTACT_INFORMATION, Map());
    const pretrialCase = reminderNeighbors.get(PRETRIAL_CASES, Map());
    const { lastFirstMid: personName, personEntityKeyId: personEKID } = formatPeopleInfo(person);
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
    return {
      caseNumber,
      contact,
      courtroom,
      hearingDateTime,
      personEKID,
      personName,
      wasNotified
    };
  }

  getFormattedData = () => {
    const {
      manualReminders,
      manualRemindersNeighbors,
      reminders,
      remindersNeighbors,
      optOuts,
      optOutNeighbors
    } = this.props;
    const data = [];
    let headers = [];
    if (manualReminders && manualReminders.size) {
      manualReminders.entrySeq().forEach(([reminderEKID, reminder]) => {
        const reminderNeighbors = manualRemindersNeighbors.get(reminderEKID, Map());
        const dataObj :Object = this.getReminderNeighborDetails(reminder, reminderNeighbors);
        dataObj.id = reminderEKID;
        dataObj.reminderType = 'Manual';
        data.push(dataObj);
        headers = REMINDERS_HEADERS;
      });
    }

    if (reminders && reminders.size) {
      reminders.entrySeq().forEach(([reminderEKID, reminder]) => {
        const reminderNeighbors = remindersNeighbors.get(reminderEKID, Map());
        const dataObj :Object = this.getReminderNeighborDetails(reminder, reminderNeighbors);
        dataObj.id = reminderEKID;
        dataObj.reminderType = 'Text';
        data.push(dataObj);
        headers = REMINDERS_HEADERS;
      });
    }

    if (optOuts && optOuts.size) {
      optOuts.entrySeq().forEach(([optOutEKID, optOut]) => {
        const dataObj :Object = getOptOutFields(optOut);
        const optoutNeighbors = optOutNeighbors.get(optOutEKID, Map());
        const { contact, personEKID, personName } = this.getReminderNeighborDetails(optOut, optoutNeighbors);
        dataObj.id = optOutEKID;
        dataObj.personEKID = personEKID;
        dataObj.personName = personName;
        dataObj.contact = contact;
        data.push(dataObj);
        headers = OPT_OUT_HEADERS;
      });
    }
    return { data, headers };
  }

  render() {
    const { isLoading, optOuts, pageOptions } = this.props;
    const { data: reminderData, headers } = this.getFormattedData();

    const components :Object = {
      Row: ({ data } :Object) => (
        <ReminderRow isOptOut={optOuts && optOuts.size} data={data} />
      )
    };

    return (
      <Table
          components={components}
          isLoading={isLoading}
          headers={headers}
          paginated
          rowsPerPageOptions={pageOptions}
          data={reminderData} />
    );
  }
}

export default RemindersTable;
