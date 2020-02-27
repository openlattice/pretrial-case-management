/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { OL } from '../../utils/consts/Colors';
import { formatDateTime } from '../../utils/FormattingUtils';

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
  padding: 5px 0 5px 10px;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${(props :Object) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  data :Object;
};

const OptOutRow = ({ data } :Props) => (
  <Row>
    <Cell>{ formatDateTime(data.dateTime) }</Cell>
    <Cell>
      <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${data.personEKID}${Routes.OVERVIEW}`}>
        { data.personName }
      </StyledLink>
    </Cell>
    <Cell>{ data.contact }</Cell>
    <Cell>{ data.reason }</Cell>
  </Row>
);

export default OptOutRow;
