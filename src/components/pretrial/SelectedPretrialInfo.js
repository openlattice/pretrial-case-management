/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import PretrialCard from './PretrialCard';
import ChargeList from '../charges/ChargeList';
import { formatValue, formatDateList } from '../../utils/Utils';
import {
  InlineBold,
  InfoContainer,
  InfoHeader,
  InfoItem
} from '../../utils/Layout';

const CardContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const CardWrapper = styled.div`
  display: inline-block;
`;

const ChargeWrapper = styled.div`
  width: 50%;
  min-width: 700px;
  display: inline-block;
`;

const ChargeContainer = styled.div`
  text-align: center;
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

  render() {
    const { pretrialCaseDetails, charges } = this.props;
    if (!pretrialCaseDetails.size) return null;
    return (
      <InfoContainer>
        <InfoHeader>Pretrial Case Processing</InfoHeader>
        <CardContainer>
          <CardWrapper>
            <PretrialCard pretrialCase={pretrialCaseDetails} />
          </CardWrapper>
        </CardContainer>
        <ChargeContainer>
          <ChargeWrapper>
            <ChargeList pretrialCaseDetails={pretrialCaseDetails} charges={charges} />
          </ChargeWrapper>
        </ChargeContainer>
      </InfoContainer>
    );
  }
}
