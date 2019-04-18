/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faMicrophoneAlt } from '@fortawesome/pro-light-svg-icons';

import { getDateAndTime, getEntityProperties, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { formatPhoneNumber } from '../../utils/ContactInfoUtils';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FILTERS, RESULT_TYPE } from '../../utils/consts/CheckInConsts';

import * as Routes from '../../core/router/Routes';

const {
  CONFIDENCE,
  COMPLETED_DATE_TIME,
  CASE_ID,
  END_DATE,
  RESULT,
  START_DATE,
  PHONE
} = PROPERTY_TYPES;

const {
  CHECKINS,
  PEOPLE,
  HEARINGS,
  PRETRIAL_CASES
} = APP_TYPES;

const StyledLink = styled(Link)`
  color: ${OL.GREY01};
  :hover {
    color: ${OL.PURPLE02};
  }
`;

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 5px;
`;

const CenteredCell = styled(Cell)`
  text-align: center;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${props => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  checkInAppointment :Map<*, *>,
  neighbors :Map<*, *>
};

class CheckInRow extends React.Component<Props, State> {

  renderbooleanIcon = (checkInStatus) => {
    let statusIcon;
    switch (checkInStatus) {
      case FILTERS.FAILED:
        statusIcon = (
          <StatusIconContainer><FontAwesomeIcon color={OL.ORANGE01} icon={faMicrophoneAlt} /></StatusIconContainer>
        );
        break;
      case FILTERS.SUCCESSFUL:
        statusIcon = (
          <StatusIconContainer><FontAwesomeIcon color={OL.GREEN01} icon={faMicrophoneAlt} /></StatusIconContainer>
        );
        break;
      case FILTERS.PENDING:
        statusIcon = (
          <StatusIconContainer><FontAwesomeIcon color={OL.PURPLE03} icon={faHourglassHalf} /></StatusIconContainer>
        );
        break;
      default:
        break;
    }
    return statusIcon;
  }

  getCheckInAttempts = () => {
    let checkInStatus;
    let checkInTimes;
    let checkInNumbers;
    let successfulCheckIns = List();
    const successfulNumbers = [];
    const successfulCheckInTimes = [];
    let failedCheckIns = List();
    const failedNumbers = [];
    const failedCheckInTimes = [];
    const { checkInAppointment, neighbors } = this.props;
    const checkIns = neighbors.get(CHECKINS, Map());
    const {
      [START_DATE]: startDate,
      [END_DATE]: endDate
    } = getEntityProperties(checkInAppointment, [END_DATE, START_DATE]);
    checkIns.forEach((checkIn) => {
      const {
        [RESULT]: result,
        [COMPLETED_DATE_TIME]: checkInTime,
        [CONFIDENCE]: confidence,
        [PHONE]: phone
      } = getEntityProperties(checkIn, [COMPLETED_DATE_TIME, RESULT, PHONE, CONFIDENCE]);
      const { date, time } = getDateAndTime(checkInTime);
      const validCheckInTime = moment(checkInTime).isBetween(startDate, endDate);
      const checkInAccepted = result === RESULT_TYPE.ACCEPT;
      console.log(confidence);
      if (validCheckInTime && checkInAccepted) {
        successfulCheckIns = successfulCheckIns.push(checkIn);
        successfulNumbers.push(formatPhoneNumber(phone));
        successfulCheckInTimes.push(`${date} ${time}`);
      }
      else {
        failedCheckIns = failedCheckIns.push(checkIn);
        failedNumbers.push(formatPhoneNumber(phone));
        failedCheckInTimes.push(`${date} ${time}`);
      }
    });
    const numAttempts = successfulCheckIns.size + failedCheckIns.size;
    if (moment().isAfter(endDate) || (!successfulCheckIns.size && failedCheckIns.size)) checkInStatus = FILTERS.FAILED;
    else if (successfulCheckIns.size) checkInStatus = FILTERS.SUCCESSFUL;
    else checkInStatus = FILTERS.PENDING;

    if (checkInStatus === FILTERS.FAILED) {
      checkInTimes = failedNumbers;
      checkInNumbers = failedCheckInTimes;
    }
    else if (checkInStatus === FILTERS.SUCCESSFUL) {
      checkInTimes = successfulCheckInTimes;
      checkInNumbers = successfulNumbers;
    }

    return {
      checkInStatus,
      checkInTimes,
      checkInNumbers,
      numAttempts
    };
  }

  renderRow = () => {
    const { neighbors } = this.props;
    const person = getNeighborDetailsForEntitySet(neighbors, PEOPLE);
    const hearings = neighbors.get(HEARINGS, List());
    const pretrialCase = neighbors.get(PRETRIAL_CASES, Map());
    const { [CASE_ID]: caseNumber } = getEntityProperties(pretrialCase, [CASE_ID]);
    const {
      checkInStatus,
      checkInTimes,
      checkInNumbers,
      numAttempts
    } = this.getCheckInAttempts();

    let mostRecentHearing;
    hearings.forEach((hearing) => {
      const {
        [PROPERTY_TYPES.COURTROOM]: courtroom,
        [PROPERTY_TYPES.DATE_TIME]: dateTime,
        [PROPERTY_TYPES.HEARING_TYPE]: hearingType
      } = getEntityProperties(hearing, [
        PROPERTY_TYPES.COURTROOM,
        PROPERTY_TYPES.DATE_TIME,
        PROPERTY_TYPES.HEARING_TYPE
      ]);
      if (!mostRecentHearing || moment(dateTime).isAfter(mostRecentHearing.dateTime)) {
        const { date: hearingDate, time: hearingTime } = getDateAndTime(dateTime);
        mostRecentHearing = { courtroom, dateTime: `${hearingDate} ${hearingTime}`, hearingType };
      }
    });
    const {
      personId,
      lastFirstMid
    } = formatPeopleInfo(person);
    const row = (
      <Row disabled>
        <Cell>{ checkInTimes || '-' }</Cell>
        <Cell>
          <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`}>
            { lastFirstMid }
          </StyledLink>
        </Cell>
        <Cell>{ checkInNumbers ? checkInNumbers[0] : '-' }</Cell>
        <Cell>{ mostRecentHearing.dateTime }</Cell>
        <Cell>{ mostRecentHearing.courtroom }</Cell>
        <Cell>{ mostRecentHearing.hearingType }</Cell>
        <Cell>{ caseNumber }</Cell>
        <CenteredCell>{ this.renderbooleanIcon(checkInStatus) }</CenteredCell>
        <CenteredCell>{ numAttempts }</CenteredCell>
      </Row>
    );
    return row;
  }

  render() {
    return this.renderRow();
  }
}

export default CheckInRow;
