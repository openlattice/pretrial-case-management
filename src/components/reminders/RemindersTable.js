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

type Props = {
  isLoading :boolean;
  manualReminders ?:Map;
  manualRemindersNeighbors ?:Map;
  pageOptions ?:number[];
  reminders ?:Map;
  remindersNeighbors ?:Map;
};

const defaultPageOptions = [10, 20, 30, 50];

class RemindersTable extends React.Component<Props> {

  static defaultProps = {
    manualReminders: Map(),
    manualRemindersNeighbors: Map(),
    pageOptions: defaultPageOptions,
    reminders: Map(),
    remindersNeighbors: Map(),
  }

  getReminderNeighborDetails = (reminder :Map, reminderNeighbors :Map) => {
    const {
      [ENTITY_KEY_ID]: id,
      [NOTIFIED]: wasNotified
    } = getEntityProperties(reminder, [ENTITY_KEY_ID, NOTIFIED]);
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
      id,
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
      remindersNeighbors
    } = this.props;
    const data = [];
    if (manualReminders && manualReminders.size) {
      manualReminders.entrySeq().forEach(([reminderEKID, reminder]) => {
        const reminderNeighbors = manualRemindersNeighbors.get(reminderEKID, Map());
        const dataObj :Object = this.getReminderNeighborDetails(reminder, reminderNeighbors);
        dataObj.reminderType = 'Manual';
        data.push(dataObj);
      });
    }

    if (reminders && reminders.size) {
      reminders.entrySeq().forEach(([reminderEKID, reminder]) => {
        const reminderNeighbors = remindersNeighbors.get(reminderEKID, Map());
        const dataObj :Object = this.getReminderNeighborDetails(reminder, reminderNeighbors);
        dataObj.reminderType = 'SMS';
        data.push(dataObj);
      });
    }
    return { data };
  }

  render() {
    const { isLoading, pageOptions } = this.props;
    const { data: reminderData } = this.getFormattedData();

    const components :Object = {
      Row: ({ data } :Object) => (
        <ReminderRow data={data} />
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
  }
}

export default RemindersTable;
