/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import { chargeFieldIsViolent } from '../../utils/consts/ChargeConsts';
import { formatValue } from '../../utils/Utils';
import {
  ChargeItem,
  ChargeRow,
  ChargesWrapper,
  ChargeTag,
  ChargeTagWrapper,
  InlineBold,
  InfoSubHeader
} from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  MOST_SERIOUS_CHARGE_NO,
  CHARGE_STATUTE,
  CHARGE_DESCRIPTION,
  CHARGE_DEGREE
} = PROPERTY_TYPES;

const MostSeriousTag = styled(ChargeTag)`
  background-color: #393a3b;
`;

const ViolentTag = styled(ChargeTag)`
  background-color: #992619;
`;

type Props = {
  charges :Immutable.List<*>,
  pretrialCaseDetails :Immutable.Map<*, *>
};

export default class ChargeList extends React.Component<Props, *> {

  renderTags = (chargeNumField :string[]) => {
    let mostSerious = false;
    let violent = false;

    const mostSeriousNumField = this.props.pretrialCaseDetails.get(MOST_SERIOUS_CHARGE_NO, Immutable.List());
    chargeNumField.forEach((chargeNum) => {
      mostSeriousNumField.forEach((mostSeriousNum) => {
        if (mostSeriousNum === chargeNum) mostSerious = true;
      });
    });
    if (chargeFieldIsViolent(chargeNumField)) violent = true;

    return (
      <ChargeTagWrapper>
        { (mostSerious) ? <MostSeriousTag>MOST SERIOUS</MostSeriousTag> : null }
        { (violent) ? <ViolentTag>VIOLENT</ViolentTag> : null }
      </ChargeTagWrapper>
    );
  }

  getChargeList = () => {
    const rows = this.props.charges.map((charge, index) => {
      if (!charge.get(CHARGE_STATUTE, Immutable.List()).size) {
        return (
          <ChargeRow key={index}><ChargeItem /></ChargeRow>
        );
      }
      const chargeDescription = charge.get(CHARGE_DESCRIPTION, Immutable.List());
      const chargeDegree = charge.get(CHARGE_DEGREE, Immutable.List());
      const chargeNum = charge.get(CHARGE_STATUTE, Immutable.List());

      const description = (
        <div>
          { chargeDescription.size ? <span> {formatValue(chargeDescription)}</span> : null }
          { chargeDegree.size ? <i> ({formatValue(chargeDegree)})</i> : null }
        </div>
      );

      return (
        <ChargeRow key={index}>
          <ChargeItem><InlineBold>{formatValue(chargeNum.toJS())}</InlineBold></ChargeItem>
          <ChargeItem>
            {description}
            {this.renderTags(chargeNum)}
          </ChargeItem>
        </ChargeRow>
      );
    });
    return (
      <table>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  render = () => {
    if (!this.props.charges.size) return null;
    return (
      <div>
        <InfoSubHeader>Charges:</InfoSubHeader>
        <ChargesWrapper>
          {this.getChargeList()}
        </ChargesWrapper>
        <br />
      </div>
    );
  }
}
