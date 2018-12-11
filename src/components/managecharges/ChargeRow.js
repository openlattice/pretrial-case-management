/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import CheckboxButton from '../controls/StyledCheckboxButton';
import NewChargeModal from '../../containers/charges/NewChargeModal';
import { OL } from '../../utils/consts/Colors';
import { CHARGE_TYPES, CHARGE_HEADERS, getChargeConsts } from '../../utils/consts/ChargeConsts';

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 10px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 5px;
`;

const DegreeCell = styled(Cell)`
  min-width: 100px;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${props => (props.disabled ? OL.WHITE : OL.GREY14)};
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
  constructor(props :Props) {
    super(props);
    this.state = {
      chargeModalOpen: false
    };
  }

  static defaultProps = {
    disabled: false
  };

  formatBooleanLabel = boolean => (boolean ? 'Yes' : 'No');

  openChargeModal = () => (this.setState({ chargeModalOpen: true }))
  closeChargeModal = () => (this.setState({ chargeModalOpen: false }))

  renderChargeModal = () => {
    const { charge, chargeType } = this.props;
    const { chargeModalOpen } = this.state;
    const {
      degree,
      degreeShort,
      description,
      entityKeyId,
      isViolent,
      isStep2,
      isStep4,
      isBRE,
      isBHE,
      statute
    } = getChargeConsts(charge);
    return (
      <NewChargeModal
          chargeType={chargeType}
          degree={degree}
          degreeShort={degreeShort}
          description={description}
          existingCharge
          entityKeyId={entityKeyId}
          isViolent={isViolent}
          isStep2={isStep2}
          isStep4={isStep4}
          isBRE={isBRE}
          isBHE={isBHE}
          onClose={this.closeChargeModal}
          open={chargeModalOpen}
          statute={statute} />
    );
  }

  renderRow = () => {
    const { charge, chargeType, disabled } = this.props;
    const {
      degree,
      degreeShort,
      description,
      isViolent,
      isStep2,
      isStep4,
      isBRE,
      isBHE,
      statute
    } = getChargeConsts(charge);
    const isViolentLabel = this.formatBooleanLabel(isViolent);
    const isStep2Label = this.formatBooleanLabel(isStep2);
    const isStep4Label = this.formatBooleanLabel(isStep4);
    const isBRELabel = this.formatBooleanLabel(isBRE);
    const isBHELabel = this.formatBooleanLabel(isBHE);

    let row;
    if (chargeType === CHARGE_TYPES.ARREST) {
      row = (
        <Row disabled onClick={this.openChargeModal}>
          { this.renderChargeModal() }
          <Cell>{ statute }</Cell>
          <Cell>{ description }</Cell>
          <DegreeCell>{ degree }</DegreeCell>
          <Cell>{ degreeShort }</Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.VIOLENT}
                value={CHARGE_HEADERS.VIOLENT}
                checked={isViolent}
                onChange={null}
                disabled
                label={isViolentLabel} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.STEP_2}
                value={CHARGE_HEADERS.STEP_2}
                checked={isStep2}
                onChange={null}
                disabled
                label={isStep2Label} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.STEP_4}
                value={CHARGE_HEADERS.STEP_4}
                checked={isStep4}
                onChange={null}
                disabled
                label={isStep4Label} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.BHE}
                value={CHARGE_HEADERS.BHE}
                checked={isBHE}
                onChange={null}
                disabled
                label={isBHELabel} />
          </Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.BRE}
                value={CHARGE_HEADERS.BRE}
                checked={isBRE}
                onChange={null}
                disabled
                label={isBRELabel} />
          </Cell>
        </Row>
      );
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      row = (
        <Row disabled onClick={this.openChargeModal}>
          { this.renderChargeModal() }
          <Cell>{ statute }</Cell>
          <Cell>{ description }</Cell>
          <Cell>
            <CheckboxButton
                xSmall
                name={CHARGE_HEADERS.VIOLENT}
                value={CHARGE_HEADERS.VIOLENT}
                checked={isViolent}
                onChange={null}
                disabled
                label={isViolentLabel} />
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
