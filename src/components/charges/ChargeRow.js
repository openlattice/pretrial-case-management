/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getAllViolentCharges } from '../../utils/ArrestChargeUtils';

const { OPENLATTICE_ID_FQN } = Constants;

const Cell = styled.td`
  padding: 15px 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: '#2e2e34';
  text-align: left;
`;

const ChargeDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  span {
    width: 58px;
    height: 16px;
    border-radius: 3px;
    background-color: #ff3c5d;
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    color: #ffffff;
    margin-top: -8px;
    text-transform: uppercase;
  }
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid #e1e1eb;

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
  const statuteField = charge.get(PROPERTY_TYPES.CHARGE_STATUTE, Immutable.List());
  const statute = statuteField.get(0, '');
  const numberOfCounts = charge.getIn([PROPERTY_TYPES.NUMBER_OF_COUNTS, 0], '');
  const qualifier = charge.getIn([PROPERTY_TYPES.QUALIFIER, 0], '');
  const chargeDescription = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');

  const violent = getAllViolentCharges(Immutable.List.of(charge)).size > 0;
  const entityKeyId :string = charge.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <Row
        disabled={disabled}
        onClick={() => {
          if (handleSelect) {
            handleSelect(charge, entityKeyId);
          }
        }}>
      <Cell>{ statute }</Cell>
      <Cell>{ numberOfCounts }</Cell>
      <Cell>{ qualifier }</Cell>
      <Cell>
        <ChargeDescriptionWrapper>
          { violent ? <span>VIOLENT</span> : null }
          { chargeDescription }
        </ChargeDescriptionWrapper>
      </Cell>
    </Row>
  );
};

ChargeRow.defaultProps = {
  handleSelect: () => {},
  disabled: false
};

export default ChargeRow;
