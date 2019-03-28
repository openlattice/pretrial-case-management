/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import { OL } from '../../utils/consts/Colors';

import * as Routes from '../../core/router/Routes';

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
  hasOpenPSA :boolean,
  hearingTime :string,
  hearingType :string,
  contact :string,
  courtroom :string,
  hasOpenPSA :boolean,
  personName :string,
  personId :string,
  time :string,
  wasNotified :boolean
};

class ReminderRow extends React.Component<Props, State> {

  renderbooleanIcon = boolean => (boolean
    ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
    : <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>
  )

  renderRow = () => {
    const {
      caseNumber,
      contact,
      courtroom,
      hearingTime,
      hearingType,
      hasOpenPSA,
      personName,
      personId,
      time,
      wasNotified
    } = this.props;

    const row = (
      <Row disabled>
        <Cell>{ hearingTime }</Cell>
        <Cell>{ caseNumber }</Cell>
        <Cell>
          <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`}>
            { personName }
          </StyledLink>
        </Cell>
        <Cell>{ contact }</Cell>
        <Cell>{ courtroom }</Cell>
        <Cell>{ hearingType }</Cell>
        <Cell>{ this.renderbooleanIcon(wasNotified) }</Cell>

      </Row>
    );
    return row;
  }

  render() {
    return this.renderRow();
  }
}

export default ReminderRow;
