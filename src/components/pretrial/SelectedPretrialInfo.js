/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import PretrialCard from './PretrialCard';
import { chargeFieldIsViolent } from '../../utils/consts/ChargeConsts';
import { formatValue, formatDateList } from '../../utils/Utils';
import {
  ChargeItem,
  ChargeRow,
  ChargesWrapper,
  ChargeTag,
  ChargeTagWrapper,
  InlineBold,
  InfoContainer,
  InfoHeader,
  InfoItem,
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

const CardContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const CardWrapper = styled.div`
  display: inline-block;
`;

type Props = {
  propertyTypes :Object[],
  charges :Immutable.List<*>,
  pretrialCaseDetails :Immutable.Map<*, *>
};

export default class SelectedPretrialInfo extends React.Component<Props, *> {

  getField = (fieldName :string) => this.props.pretrialCaseDetails.get(fieldName, '')

  getInfoItems = () => {
    const labels = [];
    this.props.propertyTypes.forEach((propertyType) => {
      const fqn = `${propertyType.type.namespace}.${propertyType.type.name}`;
      const rawValue = this.props.pretrialCaseDetails.get(fqn);
      if (rawValue) {
        const value = (propertyType.datatype === 'Date') ? formatDateList(rawValue) : formatValue(rawValue);
        labels.push(
          <InfoItem key={propertyType.id}>
            <InlineBold>{propertyType.title}: </InlineBold> {value}
          </InfoItem>
        );
      }
    });
    return labels;
  }

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

  renderCharges = () => {
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

  render() {
    if (!this.props.pretrialCaseDetails.size) return null;
    return (
      <InfoContainer>
        <InfoHeader>Pretrial Case Processing</InfoHeader>
        <CardContainer>
          <CardWrapper>
            <PretrialCard pretrialCase={this.props.pretrialCaseDetails} />
          </CardWrapper>
        </CardContainer>
        {this.renderCharges()}
      </InfoContainer>
    );
  }
}
