/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import ArrestTable from '../../../components/arrest/ArrestTable';
import BasicButton from '../../../components/buttons/BasicButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';

/*
 * styled components
 */

const Header = styled.h1`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: #555e6f;
`;

const SearchResultsList = styled.div`
  background-color: #fefefe;
  margin: 20px 0;
`;

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 30px;

  h1 {
    flex: 2;
  }
  div {
    flex: 1;
  }
`;

const ButtonWrapper = styled.div`
  margin-right: 20px;
`;

const StyledNavBtnWrapper = styled.div`
  text-align: center;
  width: 100%;
`;

const ModifyButton = styled(BasicButton)`
  width: 100%;
  height: 39px;
  font-size: 14px;
  font-weight: 600;
  margin-right: 10px;
`;

export const NavButton = styled(Button)`
  font-weight: medium;
  margin: 0 10px;
  width: 170px;
`;

/*
 * types
 */

type Props = {
  caseOptions :Immutable.List<Map<*, *>>,
  onSelectCase :Function,
  nextPage :Function,
  prevPage :Function
}

const SelectArrestContainer = ({
  caseOptions,
  onSelectCase,
  nextPage,
  prevPage
}) :Props => {

  const handleOnSelectCase = (selectedCase :Immutable.Map<*, *>, entityKeyId :string) => {
    onSelectCase(selectedCase, entityKeyId);
  };

  const renderNoResults = () => (
    <div>
      <SearchResultsList>No cases found.</SearchResultsList>
      <StyledNavBtnWrapper>
        <NavButton onClick={prevPage}>Modify Search</NavButton>
        <NavButton onClick={nextPage}>Proceed Without Arrest</NavButton>
      </StyledNavBtnWrapper>
    </div>
  );

  const renderSearchResults = () => {

    if (caseOptions.isEmpty()) {
      return renderNoResults();
    }

    return (
      <ResultsWrapper>
        <ArrestTable arrests={caseOptions} handleSelect={handleOnSelectCase} />
      </ResultsWrapper>
    );
  };

  const renderHeader = () => {
    return (
      <HeaderWrapper>
        <Header>Select an arrest</Header>
        <ButtonWrapper>
          <ModifyButton onClick={prevPage}>Modify Search</ModifyButton>
        </ButtonWrapper>
        <div>
          <SecondaryButton onClick={nextPage}>Proceed Without Arrest</SecondaryButton>
        </div>
      </HeaderWrapper>
    );
  }

  return (
    <SearchResultsList>
      { renderHeader() }
      { renderSearchResults() }
    </SearchResultsList>
  );
};

SelectArrestContainer.defaultProps = {
  onSelectCase: () => {}
};

export default SelectArrestContainer;
