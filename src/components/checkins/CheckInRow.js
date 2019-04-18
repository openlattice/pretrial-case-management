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
import { getCheckInAttempts } from '../../utils/CheckInUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FILTERS } from '../../utils/consts/CheckInConsts';

import * as Routes from '../../core/router/Routes';

const { CASE_ID } = PROPERTY_TYPES;

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

  renderRow = () => {
    const { checkInAppointment, neighbors } = this.props;
    const checkIns = neighbors.get(CHECKINS, Map());
    const person = getNeighborDetailsForEntitySet(neighbors, PEOPLE);
    const hearings = neighbors.get(HEARINGS, List());
    const pretrialCase = neighbors.get(PRETRIAL_CASES, Map());
    const { [CASE_ID]: caseNumber } = getEntityProperties(pretrialCase, [CASE_ID]);
    const {
      entityKeyId,
      checkInStatus,
      checkInTime,
      checkInNumber,
      numAttempts
    } = getCheckInAttempts(checkInAppointment, checkIns);

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
      <Row key={entityKeyId} disabled>
        <Cell>{ checkInTime || '-' }</Cell>
        <Cell>
          <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`}>
            { lastFirstMid }
          </StyledLink>
        </Cell>
        <Cell>{ checkInNumber || '-' }</Cell>
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
