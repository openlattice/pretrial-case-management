/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import CheckboxButton from '../controls/StyledCheckboxButton';
import { OL } from '../../utils/consts/Colors';
import { CHARGE_TYPES, CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 10px;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    background: ${props => (props.disabled ? OL.WHITE : OL.GREY14)};
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
  chargeType :string,
  disabled? :boolean
};

class ChargeRow extends React.Component<Props, State> {
  static defaultProps = {
    disabled: false
  };

  getChargeConsts = () => {
    const { charge } = this.props;
    const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
    const degree = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, 0], '');
    const degreeShort = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, 0], '');
    const isViolent = charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT], false);
    const isStep2 = charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_2], false);
    const isStep4 = charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_4], false);
    const isBRE = charge.getIn([PROPERTY_TYPES.BRE, 0], false);
    const isBHE = charge.getIn([PROPERTY_TYPES.BHE, 0], false);
    return {
      statute,
      description,
      degree,
      degreeShort,
      isViolent,
      isStep2,
      isStep4,
      isBRE,
      isBHE
    };
  }

  formatBooleanLabel = boolean => (boolean ? 'Yes' : 'No');

  renderRow = () => {
    const { chargeType, disabled } = this.props;
    const {
      statute,
      description,
      degree,
      degreeShort,
      isViolent,
      isStep2,
      isStep4,
      isBRE,
      isBHE
    } = this.getChargeConsts();

    const isViolentLabel = this.formatBooleanLabel(isViolent);
    const isStep2Label = this.formatBooleanLabel(isStep2);
    const isStep4Label = this.formatBooleanLabel(isStep4);
    const isBRELabel = this.formatBooleanLabel(isBRE);
    const isBHELabel = this.formatBooleanLabel(isBHE);

    let row;
    if (chargeType === CHARGE_TYPES.ARREST) {
      row = (
        <Row disabled={disabled}>
          <Cell>{ statute }</Cell>
          <Cell>{ description }</Cell>
          <Cell>{ degree }</Cell>
          <Cell>{ degreeShort }</Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.VIOLENT}
                value={CHARGE_HEADERS.VIOLENT}
                checked={isViolent}
                onChange={this.handleCheckboxChange}
                disabled={disabled}
                label={isViolentLabel} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.STEP_2}
                value={CHARGE_HEADERS.STEP_2}
                checked={isStep2}
                onChange={this.handleCheckboxChange}
                disabled={disabled}
                label={isStep2Label} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.STEP_4}
                value={CHARGE_HEADERS.STEP_4}
                checked={isStep4}
                onChange={this.handleCheckboxChange}
                disabled={disabled}
                label={isStep4Label} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.BHE}
                value={CHARGE_HEADERS.BHE}
                checked={isBHE}
                onChange={this.handleCheckboxChange}
                disabled={disabled}
                label={isBHELabel} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.BRE}
                value={CHARGE_HEADERS.BRE}
                checked={isBRE}
                onChange={this.handleCheckboxChange}
                disabled={disabled}
                label={isBRELabel} />
          </Cell>
        </Row>
      );
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      row = (
        <Row disabled={disabled}>
          <Cell>{ statute }</Cell>
          <Cell>{ description }</Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.VIOLENT}
                value={CHARGE_HEADERS.VIOLENT}
                checked={isViolent}
                onChange={this.handleCheckboxChange}
                disabled={disabled}
                label={`${isViolent}`} />
          </Cell>
        </Row>
      );
    }
    return row;
  }

  render() {
    return this.renderRow();
  }
}

export default ChargeRow;
