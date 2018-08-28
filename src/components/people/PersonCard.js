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
  },
  hasOpenPSA? :string
};

const StyledUndecoratedLink = styled(UndecoratedLink)`
  display: flex;
  flex-direction: column;
`;

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

const OpenPSATag = styled.span`
  z-index: 1;
  margin-left: 85px;
  margin-bottom: -8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 65px;
  height: 16px;
  border-radius: 3px;
  background-color: #8b66db;
  padding: 2px;
  text-transform: uppercase;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
`;

const TagPlaceholder = styled.span`
  height: 8px;
`;

const PersonCard = ({ person, hasOpenPSA } :Props) => {
  const {
    firstName,
    middleName,
    lastName,
    dob,
    photo,
    identification
  } = person;

  const midName = middleName ? ` ${middleName}` : '';

  const name = `${lastName}, ${firstName}${midName}`;

  return (
    <StyledUndecoratedLink to={`${Routes.PERSON_DETAILS_ROOT}/${identification}`}>
      {hasOpenPSA ? <OpenPSATag>Open PSA</OpenPSATag> : <TagPlaceholder />}
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
    </StyledUndecoratedLink>
  );
};

PersonCard.defaultProps = {
  hasOpenPSA: false
};

export default PersonCard;
