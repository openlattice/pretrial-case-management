/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Tag } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  color: ${OL.GREY15};
  font-size: 14px;
  padding: 5px 10px;
  text-align: left;
`;

const ChargeDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  span {
    width: max-content;
    margin: 5px 0;
  }
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 7px 30px;

  &:active {
    background-color: ${OL.GREY08};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  data :Object;
};

const ChargeRow = ({ data } :Props) => (
  <Row>
    <Cell>{ data.statute }</Cell>
    <Cell>{ data.numCounts }</Cell>
    <Cell>{ data.qualifier }</Cell>
    <Cell>
      <ChargeDescriptionWrapper>
        { data.isViolent && <Tag mode="danger">VIOLENT</Tag> }
        { data.chargeDescription }
      </ChargeDescriptionWrapper>
    </Cell>
  </Row>
);

export default ChargeRow;
