/*
 * @flow
 */

import React from 'react';

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

const PersonCard = ({ person } :Props) => {
  const {
    firstName,
    lastName,
    dob,
    photo,
    identification
  } = person;

  return (
    <UndecoratedLink to={`${Routes.PERSON_DETAILS_ROOT}/${identification}`}>
      <StyledCard>
        <Headshot photo={photo} />
        <h3>{firstName}</h3>
        <h3>{lastName}</h3>
        <p>DOB: {dob}</p>
      </StyledCard>
    </UndecoratedLink>
  );
};

export default PersonCard;
