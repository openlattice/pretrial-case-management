/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  padding: 15px 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: ${OL.GREY15};
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};

  &:hover {
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    background: ${(props) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:active {
    background-color: ${OL.GREY08};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  row :Immutable.Map<*, *>,
  disabled? :boolean
};

const RiskFactorRow = ({ row, disabled } :Props) => {

  const number = row.get('number');
  const riskFactor = row.has('italicText') ? (
    <div>
      <span>
        {row.get('riskFactor')}
        {' '}
        <i>{row.get('italicText')}</i>
      </span>
    </div>
  ) : row.get('riskFactor');
  const response = row.get('response');

  return (
    <Row disabled={disabled}>
      <Cell>{ number }</Cell>
      <Cell>{ riskFactor }</Cell>
      <Cell>{ response }</Cell>
    </Row>
  );
};

RiskFactorRow.defaultProps = {
  disabled: false
};

export default RiskFactorRow;
