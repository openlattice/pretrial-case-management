/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import NewChargeModal from '../../containers/charges/NewChargeModal';
import { OL } from '../../utils/consts/Colors';
import { CHARGE_TYPES, getChargeConsts } from '../../utils/consts/ChargeConsts';

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
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
    background: ${(props) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const BooleanDisplay = styled.div`
  padding: 9px 22px;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background-color: ${(props) => (props.checked ? OL.GREY05 : OL.GREY10)};
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: normal;
  color: ${OL.GREY02};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
`;

type Props = {
  hasPermission :boolean,
  charge :Immutable.Map<*, *>,
  chargeType :string
};

class ChargeRow extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      chargeModalOpen: false
    };
  }

  formatBooleanLabel = (boolean) => (boolean ? 'Yes' : 'No');

  openChargeModal = () => {
    const { hasPermission } = this.props;
    this.setState({ chargeModalOpen: hasPermission });
  }
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
    const { charge, chargeType } = this.props;
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
        <Row disabled>
          <td>{ this.renderChargeModal() }</td>
          <Cell onClick={this.openChargeModal}>{ statute }</Cell>
          <Cell onClick={this.openChargeModal}>{ description }</Cell>
          <DegreeCell onClick={this.openChargeModal}>{ degree }</DegreeCell>
          <Cell onClick={this.openChargeModal}>{ degreeShort }</Cell>
          <Cell onClick={this.openChargeModal}>
            <BooleanDisplay checked={isViolent}>{isViolentLabel}</BooleanDisplay>
          </Cell>
          <Cell onClick={this.openChargeModal}>
            <BooleanDisplay checked={isStep2}>{isStep2Label}</BooleanDisplay>
          </Cell>
          <Cell onClick={this.openChargeModal}>
            <BooleanDisplay checked={isStep4}>{isStep4Label}</BooleanDisplay>
          </Cell>
          <Cell onClick={this.openChargeModal}>
            <BooleanDisplay checked={isBHE}>{isBHELabel}</BooleanDisplay>
          </Cell>
          <Cell onClick={this.openChargeModal}>
            <BooleanDisplay checked={isBRE}>{isBRELabel}</BooleanDisplay>
          </Cell>
        </Row>
      );
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      row = (
        <Row disabled>
          <td>{ this.renderChargeModal() }</td>
          <Cell onClick={this.openChargeModal}>{ statute }</Cell>
          <Cell onClick={this.openChargeModal}>{ description }</Cell>
          <Cell onClick={this.openChargeModal}>
            <BooleanDisplay checked={isViolent}>{isViolentLabel}</BooleanDisplay>
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
