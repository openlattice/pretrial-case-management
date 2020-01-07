/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import LogoLoader from '../LogoLoader';
import NoSearchResults from './NoSearchResults';
import PersonCard from './PersonCard';
import { StyledErrorMessage } from '../../utils/Layout';


const CardsWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 31% 31% 31%;
  column-gap: 3%;
  height: 100%;
`;

const NoSearchResultsPadded = styled(NoSearchResults)`
  margin-top: 100px;
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
        const personCards = people.map((person) => (
          <PersonCard
              hasOpenPSA={person.hasOpenPSA}
              multipleOpenPSAs={person.multipleOpenPSAs}
              isReceivingReminders={person.isReceivingReminders}
              key={person.personId}
              personObj={person} />
        ));
        return (
          <CardsWrapper>
            { personCards }
          </CardsWrapper>
        );
      }
      if (people && people.size === 0 && didMapPeopleToProps) {
        return <NoSearchResultsPadded />;
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

  return isFetchingPeople
    ? <LogoLoader loadingText="Searching..." />
    : renderPersonCards();
};

export default PeopleList;
