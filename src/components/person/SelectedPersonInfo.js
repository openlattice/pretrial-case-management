/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import PersonCard from './PersonCard';
import { InfoContainer, InfoWrapper, InfoHeader, Spacer } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';


const CardContainer = styled.div`
  display: inline-block;
`;

const CaseHistoryMessage = styled.div`
  font-size: 16px;
  font-style: italic;
`;

type Props = {
  personDetails :Immutable.Map<*, *>
};

const CaseHistoryLoaded = ({ personId } :{ personId :string }) => {
  const text = (Number.parseInt(personId, 10).toString() === personId)
    ? 'Case history loaded from Odyssey' : 'No Odyssey case history';
  return <CaseHistoryMessage>{text}</CaseHistoryMessage>;
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
          <CaseHistoryLoaded personId={personDetails.getIn([PROPERTY_TYPES.PERSON_ID, 0], '')} />
        </CardContainer>
      </InfoWrapper>
    </InfoContainer>
  );
};

export default SelectedPersonInfo;
