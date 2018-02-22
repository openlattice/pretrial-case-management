/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import PersonCard from './PersonCard';
import { InfoContainer, InfoWrapper, InfoHeader, Spacer } from '../../utils/Layout';


const CardContainer = styled.div`
  display: inline-block;
`;

type Props = {
  personDetails :Immutable.Map<*, *>
};

const SelectedPersonInfo = ({ personDetails } :Props) => {

  if (!personDetails.size) return null;
  return (
    <InfoContainer>
      <Spacer />
      <InfoHeader>Person</InfoHeader>
      <InfoWrapper>
        <CardContainer>
          <PersonCard person={personDetails} />
        </CardContainer>
      </InfoWrapper>
    </InfoContainer>
  );
};

export default SelectedPersonInfo;
