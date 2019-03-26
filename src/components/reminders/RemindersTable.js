/*
 * @flow
 */
import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Map } from 'immutable';

import RemindersRow from './RemindersRow';
import OptOutRow from './OptOutRow';
import { NoResults } from '../../utils/Layout';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { getIdOrValue } from '../../utils/DataUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { getHearingFields } from '../../utils/consts/HearingConsts';
import {
  getReminderFields,
  getOptOutFields,
  sortEntities,
  REMINDERS_HEADERS,
  OPT_OUT_HEADERS
} from '../../utils/RemindersUtils';

import { OL } from '../../utils/consts/Colors';

let {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES,
  REMINDERS,
  REMINDER_OPT_OUTS,
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();
REMINDERS = REMINDERS.toString();
REMINDER_OPT_OUTS = REMINDER_OPT_OUTS.toString();

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
  padding: 50px 0;
`;

class RemindersTable extends React.Component<Props, State> {

  renderHeaders = () => {
    const { appTypeFqn } = this.props;
    let headers = null;

    if (appTypeFqn === REMINDERS) {
      headers = (
        <HeaderRow>
          <HeaderElement>{REMINDERS_HEADERS.COURT_TIME}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.CASE_NUM}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.NAME}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.COURTROOM}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.HEARING_TYPE}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.CONTACT}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.STATUS}</HeaderElement>
        </HeaderRow>
      );
    }
    if (appTypeFqn === REMINDER_OPT_OUTS) {
      headers = (
        <HeaderRow>
          <HeaderElement>{OPT_OUT_HEADERS.OPT_OUT_TIME}</HeaderElement>
          <HeaderElement>{OPT_OUT_HEADERS.NAME}</HeaderElement>
          <HeaderElement>{OPT_OUT_HEADERS.CONTACT}</HeaderElement>
          <HeaderElement>{OPT_OUT_HEADERS.REASON}</HeaderElement>
        </HeaderRow>
      );
    }

    return headers;
  }

  getNeighborDetails = (entityKeyId, neighbors) => {
    const person = neighbors.getIn([entityKeyId, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const hearing = neighbors.getIn([entityKeyId, HEARINGS, PSA_NEIGHBOR.DETAILS], Map());
    const contactInfo = neighbors.getIn([entityKeyId, CONTACT_INFORMATION, PSA_NEIGHBOR.DETAILS], Map());
    const {
      personId,
      lastFirstMid
    } = formatPeopleInfo(person);
    const {
      courtroom,
      hearingDate,
      hearingTime,
      hearingType
    } = getHearingFields(hearing);
    const contact = contactInfo.get(PROPERTY_TYPES.PHONE, contactInfo.get(PROPERTY_TYPES.EMAIL, ''));
    const hearingDateTime = `${hearingDate} ${hearingTime}`;

    return ({
      personId,
      lastFirstMid,
      courtroom,
      hearingDate,
      hearingTime,
      hearingType,
      contact,
      hearingDateTime
    });
  }

  render() {
    const {
      appTypeFqn,
      entities,
      neighbors,
      noResults
    } = this.props;
    if (noResults) return <NoResultsForTable>No Results</NoResultsForTable>;
    const shouldSortByDateTime = (appTypeFqn === REMINDER_OPT_OUTS);
    const entitySeq = sortEntities(entities, neighbors, shouldSortByDateTime)
      .map(((entity) => {
        let row = null;
        if (appTypeFqn === REMINDERS) {
          const {
            reminderId,
            entityKeyId,
            dateTime,
            wasNotified
          } = getReminderFields(entity);
          const {
            personId,
            lastFirstMid,
            courtroom,
            hearingType,
            contact,
            hearingDateTime
          } = this.getNeighborDetails(entityKeyId, neighbors);
          const reminderNeighbors = neighbors.get(entityKeyId, Map());
          const caseNum = getIdOrValue(reminderNeighbors, PRETRIAL_CASES, PROPERTY_TYPES.CASE_ID);
          row = (
            <RemindersRow
                key={reminderId}
                contact={contact}
                courtroom={courtroom}
                hearingTime={hearingDateTime}
                hearingType={hearingType}
                reminderId={reminderId}
                time={moment(dateTime).format('HH:mm')}
                wasNotified={wasNotified}
                personId={personId}
                personName={lastFirstMid}
                caseNumber={caseNum} />
          );
        }
        if (appTypeFqn === REMINDER_OPT_OUTS) {
          const {
            dateTime,
            entityKeyId,
            reason
          } = getOptOutFields(entity);
          const {
            personId,
            lastFirstMid,
            contact
          } = this.getNeighborDetails(entityKeyId, neighbors);
          row = (
            <OptOutRow
                key={entityKeyId}
                contact={contact}
                optOutId={entityKeyId}
                reason={reason}
                time={moment(dateTime).format('HH:mm')}
                personId={personId}
                personName={lastFirstMid} />
          );
        }
        return row;
      }));
    return (
      <Table>
        <tbody>
          { this.renderHeaders() }
          { entitySeq }
        </tbody>
      </Table>
    );
  }
}

export default RemindersTable;
