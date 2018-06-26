/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import LoadingSpinner from '../../components/LoadingSpinner';
import { StyledErrorMessage } from '../../utils/Layout';
import PersonCard from './PersonCard';

const CardsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;

type Props = {
  didMapPeopleToProps :boolean,
  isFetchingPeople :boolean,
  people :Immutable.List<*>
};

const PeopleList = ({ people, isFetchingPeople, didMapPeopleToProps } :Props) => {

  const renderPersonCards = () => {
    try {
      if (people && people.size > 0) {
        return people.map(person => <PersonCard key={person.identification} person={person} />);
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

export default PeopleList;
