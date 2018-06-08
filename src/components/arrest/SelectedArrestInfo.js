/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import ArrestCard from './ArrestCard';
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
  arrest :Immutable.Map<*, *>
};

export default class SelectedArrestInfo extends React.Component<Props, *> {

  getField = (fieldName :string) => this.props.arrest.get(fieldName, '')

  getInfoItems = () => {
    const labels = [];
    this.props.propertyTypes.forEach((propertyType) => {
      const fqn = `${propertyType.type.namespace}.${propertyType.type.name}`;
      const rawValue = this.props.arrest.get(fqn);
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
    const { arrest, charges } = this.props;
    if (!arrest.size) return null;
    return (
      <InfoContainer>
        <InfoHeader>Arrest</InfoHeader>
        <CardContainer>
          <CardWrapper>
            <ArrestCard arrest={arrest} />
          </CardWrapper>
        </CardContainer>
        <ChargeContainer>
          <ChargeWrapper>
            <ChargeList pretrialCaseDetails={arrest} charges={charges} />
          </ChargeWrapper>
        </ChargeContainer>
      </InfoContainer>
    );
  }
}
