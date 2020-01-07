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

const Cell = styled.td`
  color: ${OL.GREY15};
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  padding: 5px;
  text-align: left;
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 7px 30px;

  &:hover {
    background: ${(props) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const StyledLink = styled(Link)`
  color: ${OL.GREY01};

  :hover {
    color: ${OL.PURPLE02};
  }
`;

type Props = {
  caseNumber :string,
  contact :string,
  courtroom :string,
  hearingTime :string,
  hearingType :string,
  personEKID :string,
  personName :string,
  wasNotified :boolean
};

class ReminderRow extends React.Component<Props, *> {

  renderbooleanIcon = (boolean) => (boolean
    ? <FontAwesomeIcon color="green" icon={faCheck} />
    : <FontAwesomeIcon color="red" icon={faTimesCircle} />
  )

  renderRow = () => {
    const {
      caseNumber,
      contact,
      courtroom,
      hearingTime,
      hearingType,
      personName,
      personEKID,
      wasNotified
    } = this.props;

    const row = (
      <Row disabled>
        <Cell>{ hearingTime }</Cell>
        <Cell>{ caseNumber }</Cell>
        <Cell>
          <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${personEKID}${Routes.OVERVIEW}`}>
            { personName }
          </StyledLink>
        </Cell>
        <Cell>{ contact }</Cell>
        <Cell>{ courtroom }</Cell>
        <Cell>{ hearingType }</Cell>
        <Cell>
          <StatusIconContainer key={contact}>
            { this.renderbooleanIcon(wasNotified, contact) }
          </StatusIconContainer>
        </Cell>

      </Row>
    );
    return row;
  }

  render() {
    return this.renderRow();
  }
}

export default ReminderRow;
