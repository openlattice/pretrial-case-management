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
    personDetails: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  render() {
    if (!this.props.personDetails.size) return null;
    return (
      <InfoContainer>
        <Spacer />
        <InfoHeader>Person</InfoHeader>
        <InfoWrapper>
          <CardContainer>
            <PersonCard person={this.props.personDetails} />
          </CardContainer>
        </InfoWrapper>
      </InfoContainer>
    );
  }
}
