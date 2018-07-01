/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

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
  charge :Immutable.Map<*, *>,
  handleSelect? :(charge :Immutable.Map<*, *>, entityKeyId :string) => void,
  disabled? :boolean
};

const ChargeRow = ({ charge, handleSelect, disabled } :Props) => {


  const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  const qualifier = charge.getIn([PROPERTY_TYPES.QUALIFIER, 0], '');
  const chargeDescription = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');

  const entityKeyId :string = charge.get('id', '');

  return (
    <Row disabled={disabled} onClick={() => {
      if (handleSelect) {
        handleSelect(charge, entityKeyId);
      }
    }}>
      <Cell>{ statute }</Cell>
      <Cell>{ qualifier }</Cell>
      <Cell>{ chargeDescription }</Cell>
    </Row>
  );
};

ChargeRow.defaultProps = {
  handleSelect: () => {},
  disabled: false
};

export default ChargeRow;
