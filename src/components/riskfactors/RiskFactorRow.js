/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

const Cell = styled.td`
  padding: 15px 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: '#2e2e34';
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid #e1e1eb;
  border-left: 1px solid #e1e1eb;
  border-right: 1px solid #e1e1eb;

  &:hover {
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    background: ${props => (props.disabled ? '#ffffff' : '#f8f8fc')};
  }

  &:active {
    background-color: #f0f0f7;
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
      <span>{row.get('riskFactor')} <i>{row.get('italicText')}</i></span>
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
