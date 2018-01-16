import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import LoadingSpinner from '../../components/LoadingSpinner';
import { StyledErrorMessage } from '../../utils/Layout';
import PersonCard from './PersonCard';

const CardsWrapper = styled.div`
  align-items: center;
  background: #f7f8f9;
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;


const PeopleList = ({ people, isFetchingPeople, didMapPeopleToProps }) => {

  const renderPersonCards = () => {
    try {
      if (people && people.size > 0) {

        return people.map((person) => {
          return <PersonCard key={person.identification} person={person} />;
        });
      }
      else if (people && people.size === 0 && didMapPeopleToProps) {
        return <div>There are no people.</div>;
      }

      return null;
    }
    catch (err) {
      return (
        <StyledErrorMessage>
          There was an error loading people. Please contact support if the error persists.
        </StyledErrorMessage>
      );
    }
  };

  return (
    <CardsWrapper>
      { renderPersonCards() }
      { isFetchingPeople ? <LoadingSpinner /> : null }
    </CardsWrapper>
  );
};

PeopleList.propTypes = {
  didMapPeopleToProps: PropTypes.bool.isRequired,
  isFetchingPeople: PropTypes.bool.isRequired,
  people: ImmutablePropTypes.listOf(ImmutablePropTypes.contains({
    dob: PropTypes.string,
    firstName: PropTypes.string,
    identification: PropTypes.string,
    lastName: PropTypes.string,
    photo: PropTypes.string
  })).isRequired
};

export default PeopleList;
