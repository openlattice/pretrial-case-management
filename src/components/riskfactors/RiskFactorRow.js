/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  color: ${OL.GREY15};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  padding: 15px 30px;
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 7px 30px;

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
  disabled :?boolean;
  row :Map;
};

const RiskFactorRow = ({ disabled, row } :Props) => {

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
