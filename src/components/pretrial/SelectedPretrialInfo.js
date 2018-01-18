import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Button } from 'react-bootstrap';

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
  InfoSubHeader,
  InfoWrapper
} from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  MOST_SERIOUS_CHARGE_NO,
  CHARGE_NUM_FQN,
  CHARGE_DESCRIPTION_FQN,
  CHARGE_DEGREE_FQN
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

export default class SelectedPretrialInfo extends React.Component {

  static propTypes = {
    propertyTypes: PropTypes.array.isRequired,
    charges: PropTypes.array.isRequired,
    pretrialCaseDetails: PropTypes.object.isRequired
  }

  getField = (fieldName) => {
    if (!this.props.pretrialCaseDetails[fieldName]) return '';
    return formatValue(this.props.pretrialCaseDetails[fieldName]);
  }

  getInfoItems = () => {
    const labels = [];
    this.props.propertyTypes.forEach((propertyType) => {
      const fqn = `${propertyType.type.namespace}.${propertyType.type.name}`;
      if (this.props.pretrialCaseDetails[fqn]) {
        const value = (propertyType.datatype === 'Date')
          ? formatDateList(this.props.pretrialCaseDetails[fqn]) : formatValue(this.props.pretrialCaseDetails[fqn]);
        labels.push(
          <InfoItem key={propertyType.id}>
            <InlineBold>{propertyType.title}: </InlineBold> {value}
          </InfoItem>
        );
      }
    });
    return labels;
  }

  renderTags = (chargeNumField) => {
    let mostSerious = false;
    let violent = false;

    const mostSeriousNumField = this.props.pretrialCaseDetails[MOST_SERIOUS_CHARGE_NO];
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
      if (!charge[CHARGE_NUM_FQN] || !charge[CHARGE_NUM_FQN].length) {
        return (
          <ChargeRow key={index}><ChargeItem /></ChargeRow>
        );
      }

      const description = (
        <div>
          { (charge[CHARGE_DESCRIPTION_FQN] && charge[CHARGE_DESCRIPTION_FQN].length)
            ? <span> {formatValue(charge[CHARGE_DESCRIPTION_FQN])}</span> : null
          }
          {
            (charge[CHARGE_DEGREE_FQN] && charge[CHARGE_DEGREE_FQN].length)
              ? <i> ({formatValue(charge[CHARGE_DEGREE_FQN])})</i> : null
          }
        </div>
      );

      return (
        <ChargeRow key={index}>
          <ChargeItem><InlineBold>{formatValue(charge[CHARGE_NUM_FQN])}</InlineBold></ChargeItem>
          <ChargeItem>
            {description}
            {this.renderTags(charge[CHARGE_NUM_FQN])}
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
    if (!this.props.charges.length) return null;
    return (
      <div>
        <InfoSubHeader>Charges:</InfoSubHeader>
        <ChargesWrapper>
          {this.getChargeList()}
        </ChargesWrapper>
        <br />
      </div>
    )
  }

  render() {
    if (!Object.keys(this.props.pretrialCaseDetails).length) return null;
    return (
      <InfoContainer>
        <InfoHeader>Pretrial Case Processing</InfoHeader>
        <CardContainer>
          <CardWrapper>
            <PretrialCard pretrialCase={Immutable.fromJS(this.props.pretrialCaseDetails)} />
          </CardWrapper>
        </CardContainer>
        {this.renderCharges()}
      </InfoContainer>
    );
  }
}
