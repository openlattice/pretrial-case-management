import React from 'react';
import PropTypes from 'prop-types';

import StyledCard from '../../components/StyledCard';
import * as Routes from '../../core/router/Routes';
import { UndecoratedLink } from '../../utils/Layout';
import Headshot from '../Headshot';


const PersonCard = ({ person }) => {
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

PersonCard.propTypes = {
  person: PropTypes.shape({
    identification: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    photo: PropTypes.string
  }).isRequired
};

export default PersonCard;
