/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHourglassHalf, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import { getDateAndTime, getEntityProperties, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { OL } from '../../utils/consts/Colors';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_TYPE } from '../../utils/consts/CheckInConsts';

import * as Routes from '../../core/router/Routes';

const {
  CASE_ID,
  DATE_TIME,
  END_DATE,
  ENTITY_KEY_ID,
  RESULT,
  START_DATE,
  CONFIDENCE
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

  renderbooleanIcon = () => {
    const { checkInAppointment, neighbors } = this.props;
    const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID]);
    const checkInAppointmentNeighbors = neighbors.get(entityKeyId, Map());
    const checkIn = checkInAppointmentNeighbors.get(CHECKINS, Map());
    const {
      [START_DATE]: startDate,
      [END_DATE]: endDate
    } = getEntityProperties(checkInAppointment, [START_DATE, END_DATE]);
    const { [DATE_TIME]: checkInTime, [RESULT]: result } = getEntityProperties(checkIn, [DATE_TIME, RESULT]);
    const validCheckInTime = moment(checkInTime).isBetween(startDate, endDate);

    let statusIcon;
    if ((!checkIn.size && moment().isAfter(endDate))
    || (checkInTime && !validCheckInTime)
    || (result === RESULT_TYPE.REJECT)) {
      statusIcon = <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>;
    }
    else if (checkIn.size && (checkInTime && validCheckInTime) && (result === RESULT_TYPE.ACCEPT)) {
      statusIcon = <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>;
    }
    else {
      statusIcon = (
        <StatusIconContainer><FontAwesomeIcon color={OL.PURPLE03} icon={faHourglassHalf} /></StatusIconContainer>
      );
    }
    return statusIcon;
  }

  renderRow = () => {
    const { checkInAppointment, neighbors } = this.props;
    const person = getNeighborDetailsForEntitySet(neighbors, PEOPLE);
    const checkInEntity = neighbors.get(CHECKINS, Map());
    const hearings = neighbors.get(HEARINGS, List());
    const pretrialCase = neighbors.get(PRETRIAL_CASES, Map());

    const { [START_DATE]: startDate } = getEntityProperties(checkInAppointment, [START_DATE]);
    const { [CASE_ID]: caseNumber } = getEntityProperties(pretrialCase, [CASE_ID]);

    const {
      [RESULT]: result,
      [DATE_TIME]: checkinTime,
      [CONFIDENCE]: confidence
    } = getEntityProperties(checkInEntity, [RESULT, DATE_TIME, CONFIDENCE]);
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
    const { date: checkInDate, time: checkInTime } = getDateAndTime(checkinTime);
    const {
      personId,
      lastFirstMid
    } = formatPeopleInfo(person);
    const row = (
      <Row disabled>
        <Cell>{ checkinTime ? `${checkInDate} ${checkInTime}` : '-' }</Cell>
        <Cell>
          <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`}>
            { lastFirstMid }
          </StyledLink>
        </Cell>
        <Cell>{ mostRecentHearing.dateTime }</Cell>
        <Cell>{ mostRecentHearing.courtroom }</Cell>
        <Cell>{ mostRecentHearing.hearingType }</Cell>
        <Cell>{ caseNumber }</Cell>
        <Cell>{ this.renderbooleanIcon(result, checkinTime, startDate) }</Cell>

      </Row>
    );
    return row;
  }

  render() {
    return this.renderRow();
  }
}

export default CheckInRow;
