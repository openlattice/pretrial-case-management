/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 3px 0 3px 10px;
`;

const Row = styled.tr`
  padding: 5px 30px;
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
  deleteFn :(agencyEKID :UUID) => void;
  editing :boolean;
};

const AgencyRow = ({ data, deleteFn, editing } :Props) => (
  <Row>
    <Cell>{ data.name }</Cell>
    <Cell>{ data.abbreviation }</Cell>
    <Cell><Button disabled={!editing} onClick={() => deleteFn(data.agencyEKID)}>Delete</Button></Cell>
  </Row>
);

export default AgencyRow;
