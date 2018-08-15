/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import StyledCard from '../../components/StyledCard';
import * as Routes from '../../core/router/Routes';
import { UndecoratedLink } from '../../utils/Layout';
import Headshot from '../Headshot';

type Props = {
  person :{
    firstName :string,
    lastName :string,
    dob :string,
    photo :string,
    identification :string
  }
};

const StyledPersonCard = styled(StyledCard)`
  width: 100%;
`

const PersonInfoSection = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #2e2e34;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const DobLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: #8e929b;
`;

const Dob = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: #2e2e34;
  margin-right: 5px;
`;

const PersonCard = ({ person } :Props) => {
  const {
    firstName,
    lastName,
    dob,
    photo,
    identification
  } = person;

  const name = `${lastName}, ${firstName}`;

  return (
    <UndecoratedLink to={`${Routes.PERSON_DETAILS_ROOT}/${identification}`}>
      <StyledPersonCard>
        <Headshot photo={photo} />
        <PersonInfoSection>
          <Name>{name}</Name>
          <div>
            <DobLabel>DOB  </DobLabel>
            <Dob>{dob}</Dob>
          </div>
        </PersonInfoSection>
      </StyledPersonCard>
    </UndecoratedLink>
  );
};

export default PersonCard;
