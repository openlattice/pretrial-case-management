/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
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

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${(props) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  contact :string,
  time :string,
  personName :string,
  personId :string,
  reason :string
};

class OptOutRow extends React.Component<Props, State> {

  renderRow = () => {
    const {
      contact,
      personName,
      personId,
      time,
      reason
    } = this.props;

    const row = (
      <Row disabled>
        <Cell>{ time }</Cell>
        <Cell>
          <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`}>
            { personName }
          </StyledLink>
        </Cell>
        <Cell>{ contact }</Cell>
        <Cell>{ reason }</Cell>

      </Row>
    );
    return row;
  }

  render() {
    return this.renderRow();
  }
}

export default OptOutRow;
