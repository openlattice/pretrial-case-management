/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown } from '@fortawesome/pro-light-svg-icons';

import RemindersRow from './RemindersRow';
import OptOutRow from './OptOutRow';
import CheckInRow from '../checkins/CheckInRow';
import { NoResults } from '../../utils/Layout';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { formatTime } from '../../utils/FormattingUtils';
import { CHECKIN_HEADERS } from '../../utils/consts/CheckInConsts';
import {
  getEntityKeyId,
  getDateAndTime,
  getEntityProperties,
  getIdOrValue
} from '../../utils/DataUtils';
import {
  getReminderFields,
  getOptOutFields,
  REMINDERS_HEADERS,
  OPT_OUT_HEADERS
} from '../../utils/RemindersUtils';

import { OL } from '../../utils/consts/Colors';

const {
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES,
  REMINDERS,
  REMINDER_OPT_OUTS,
} = APP_TYPES;

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
    const {
      appTypeFqn,
      sortByDate,
      sortByName,
      sortByCaseNumber
    } = this.props;
    let headers = null;

    if (appTypeFqn === REMINDERS) {
      headers = (
        <HeaderRow>
          <HeaderElement onClick={sortByDate}>
            {`${REMINDERS_HEADERS.COURT_TIME} `}
            <FontAwesomeIcon color={OL.GREY01} icon={faSortDown} />
          </HeaderElement>
          <HeaderElement onClick={sortByCaseNumber}>
            {`${REMINDERS_HEADERS.CASE_NUM} `}
            <FontAwesomeIcon color={OL.GREY01} icon={faSortDown} />
          </HeaderElement>
          <HeaderElement onClick={sortByName}>
            {`${REMINDERS_HEADERS.NAME} `}
            <FontAwesomeIcon color={OL.GREY01} icon={faSortDown} />
          </HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.CONTACT}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.COURTROOM}</HeaderElement>
          <HeaderElement>{REMINDERS_HEADERS.HEARING_TYPE}</HeaderElement>
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
    if (appTypeFqn === CHECKIN_APPOINTMENTS) {
      headers = (
        <HeaderRow>
          <HeaderElement>{CHECKIN_HEADERS.TIME}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.NAME}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.CONTACT}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.COURT_TIME}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.COURTROOM}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.HEARING_TYPE}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.CASE_NUM}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.STATUS}</HeaderElement>
          <HeaderElement>{CHECKIN_HEADERS.NUM_ATTEMPTS}</HeaderElement>
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
      [PROPERTY_TYPES.COURTROOM]: courtroom,
      [PROPERTY_TYPES.DATE_TIME]: dateTime,
      [PROPERTY_TYPES.HEARING_TYPE]: hearingType
    } = getEntityProperties(hearing, [
      PROPERTY_TYPES.COURTROOM,
      PROPERTY_TYPES.DATE_TIME,
      PROPERTY_TYPES.HEARING_TYPE
    ]);
    const { date: hearingDate, time: hearingTime } = getDateAndTime(dateTime);
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
    const entitySeq = entities.map(((entity) => {
      let row = null;
      if (appTypeFqn === REMINDERS) {
        const {
          reminderEntityKeyId,
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
        } = this.getNeighborDetails(reminderEntityKeyId, neighbors);
        const reminderNeighbors = neighbors.get(reminderEntityKeyId, Map());
        const caseNum = getIdOrValue(reminderNeighbors, PRETRIAL_CASES, PROPERTY_TYPES.CASE_ID);
        row = (
          <RemindersRow
              key={reminderEntityKeyId}
              contact={contact}
              courtroom={courtroom}
              hearingTime={hearingDateTime}
              hearingType={hearingType}
              time={formatTime(hearingDateTime)}
              wasNotified={wasNotified}
              personId={personId}
              personName={lastFirstMid}
              caseNumber={caseNum} />
        );
      }
      if (appTypeFqn === REMINDER_OPT_OUTS) {
        const {
          dateTime,
          optOutEntityKeyId,
          reason
        } = getOptOutFields(entity);
        const {
          personId,
          lastFirstMid,
          contact
        } = this.getNeighborDetails(optOutEntityKeyId, neighbors);
        row = (
          <OptOutRow
              key={optOutEntityKeyId}
              contact={contact}
              reason={reason}
              time={formatTime(dateTime)}
              personId={personId}
              personName={lastFirstMid} />
        );
      }
      if (appTypeFqn === CHECKIN_APPOINTMENTS) {
        const checkInsEntityKeyId = getEntityKeyId(entity);
        const checkInNeighbors = neighbors.get(checkInsEntityKeyId, Map());
        row = (
          <CheckInRow
              key={checkInsEntityKeyId}
              neighbors={checkInNeighbors}
              checkInAppointment={entity} />
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
