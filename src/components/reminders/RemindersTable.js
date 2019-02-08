/*
 * @flow
 */
import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Map } from 'immutable';

import RemindersRow from './RemindersRow';
import { NoResults } from '../../utils/Layout';
import { getReminderFields, sortReminders, REMINDERS_HEADERS } from '../../utils/RemindersUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { getHearingFields } from '../../utils/consts/HearingConsts';

import { OL } from '../../utils/consts/Colors';

let { PEOPLE, CONTACT_INFORMATION, HEARINGS } = APP_TYPES_FQNS;

PEOPLE = PEOPLE.toString();
CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();

const Table = styled.table`
  width: 100%;
  max-height: 70vh !important;
  border: 1px solid ${OL.GREY08};
  margin-bottom: 10px;
`;

const HeaderRow = styled.tr`
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
`;

const HeaderElement = styled.th`
  font-size: 12px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY02};
  text-transform: uppercase;
  padding: 10px 5px;
`;

const NoResultsForTable = styled(NoResults)`
  padding: 100px 0;
`;

class RemindersTable extends React.Component<Props, State> {
  renderHeaders = () => (
    <HeaderRow>
      <HeaderElement>{REMINDERS_HEADERS.TIME}</HeaderElement>
      <HeaderElement>{REMINDERS_HEADERS.NAME}</HeaderElement>
      <HeaderElement>{REMINDERS_HEADERS.CONTACT}</HeaderElement>
      <HeaderElement>{REMINDERS_HEADERS.COURTROOM}</HeaderElement>
      <HeaderElement>{REMINDERS_HEADERS.HEARING_TYPE}</HeaderElement>
      <HeaderElement>{REMINDERS_HEADERS.STATUS}</HeaderElement>
      <HeaderElement>{REMINDERS_HEADERS.PSA_STATUS}</HeaderElement>
    </HeaderRow>
  )

  render() {
    const {
      reminders,
      neighbors,
      remindersWithOpenPSA,
      noResults
    } = this.props;
    if (noResults) return <NoResultsForTable>No Results</NoResultsForTable>;
    const reminderSeq = sortReminders(reminders, neighbors)
      .map(((reminder) => {
        const {
          reminderId,
          dateTime,
          wasNotified,
          entityKeyId
        } = getReminderFields(reminder);
        const person = neighbors.getIn([entityKeyId, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
        const hearing = neighbors.getIn([entityKeyId, HEARINGS, PSA_NEIGHBOR.DETAILS], Map());
        const contactInfo = neighbors.getIn([entityKeyId, CONTACT_INFORMATION, PSA_NEIGHBOR.DETAILS], Map());
        const {
          identification,
          lastFirstMid
        } = formatPeopleInfo(person);
        const {
          courtroom,
          hearingType
        } = getHearingFields(hearing);
        const contact = contactInfo.get(PROPERTY_TYPES.PHONE);

        const hasOpenPSA = remindersWithOpenPSA.includes(reminderId);
        return (
          <RemindersRow
              key={reminderId}
              contact={contact}
              courtroom={courtroom}
              hearingType={hearingType}
              reminderId={reminderId}
              time={moment(dateTime).format('HH:mm')}
              wasNotified={wasNotified}
              personId={identification}
              personName={lastFirstMid}
              hasOpenPSA={hasOpenPSA} />
        );
      }));
    return (
      <Table>
        <tbody>
          { this.renderHeaders() }
          { reminderSeq }
        </tbody>
      </Table>
    );
  }
}

export default RemindersTable;
