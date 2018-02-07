import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import styled from 'styled-components';

import PersonCard from './PersonCard';
import { formatValue, formatDateList } from '../../utils/Utils';
import { InfoContainer, InfoWrapper, InfoHeader, Spacer } from '../../utils/Layout';


const CardContainer = styled.div`
  display: inline-block;
`;

export default class SelectedPersonInfo extends React.Component {

  static propTypes = {
    personDetails: PropTypes.object.isRequired
  }

  getField = (fieldName) => {
    if (!this.props.personDetails[fieldName]) return '';
    return formatValue(this.props.personDetails[fieldName]);
  }

  getDateField = (fieldName) => {
    if (!this.props.personDetails[fieldName]) return '';
    return formatDateList(this.props.personDetails[fieldName]);
  }

  render() {
    if (!Object.keys(this.props.personDetails).length) return null;
    return (
      <InfoContainer>
        <Spacer />
        <InfoHeader>Person</InfoHeader>
        <InfoWrapper>
          <CardContainer>
            <PersonCard person={Immutable.fromJS(this.props.personDetails)} />
          </CardContainer>
        </InfoWrapper>
      </InfoContainer>
    );
  }
}
