/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const Cell = styled.td`
  padding: 15px 30px;
  font-size: 14px;
  color: ${OL.GREY15};
  text-align: left;
`;

const ChargeDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  span {
    width: 58px;
    height: 16px;
    border-radius: 3px;
    background-color: ${OL.RED01};
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    color: ${OL.WHITE};
    margin-top: -8px;
    text-transform: uppercase;
  }
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

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
  charge :Immutable.Map<*, *>,
  disabled? :boolean,
  handleSelect? :(charge :Immutable.Map<*, *>, entityKeyId :string) => void,
  isViolent :boolean,
};

const ChargeRow = ({
  charge,
  handleSelect,
  isViolent,
  disabled
} :Props) => {
  const statuteField = charge.get(PROPERTY_TYPES.CHARGE_STATUTE, Immutable.List());
  const statute = statuteField.get(0, '');
  const numberOfCounts = charge
    .getIn([PROPERTY_TYPES.NUMBER_OF_COUNTS, 0], charge.get(PROPERTY_TYPES.NUMBER_OF_COUNTS, '1'));
  const qualifier = charge.getIn([PROPERTY_TYPES.QUALIFIER, 0], '');
  const chargeDescription = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
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
      <Cell>{ `${numberOfCounts}` }</Cell>
      <Cell>{ qualifier }</Cell>
      <Cell>
        <ChargeDescriptionWrapper>
          { isViolent ? <span>VIOLENT</span> : null }
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
