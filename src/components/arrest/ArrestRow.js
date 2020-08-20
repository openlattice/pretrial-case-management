/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  padding: 15px 30px;
  font-size: 14px;
  color: ${OL.GREY15};
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.GREY08};
  }
`;

type Props = {
  data :Object,
  handleSelect :(arrest :Map, arrestEKID :UUID) => void
};

const ArrestRow = ({ data, handleSelect } :Props) => (
  <Row onClick={() => handleSelect(data.arrest, data.id)}>
    <Cell>{ data.caseNum }</Cell>
    <Cell>{ data.arrestDate }</Cell>
    <Cell>{ data.arrestTime }</Cell>
    <Cell>{ data.numberOfCharges }</Cell>
    <Cell>{ data.arrestingAgency }</Cell>
  </Row>
);

export default ArrestRow;
