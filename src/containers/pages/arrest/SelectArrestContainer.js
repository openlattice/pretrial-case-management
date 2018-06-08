/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import ArrestCard from '../../../components/arrest/ArrestCard';

/*
 * styled components
 */

const Wrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  padding: 50px;
`;

const Header = styled.h1`
  font-size: 25px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 20px;
`;

const SearchResultsList = styled.div`
  background-color: #fefefe;
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`;

const StyledNavBtnWrapper = styled.div`
  text-align: center;
  width: 100%;
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

    const caseOptionsList = caseOptions.map((caseResult :Immutable.Map<*, *>) =>
      <ArrestCard key={caseResult.get('id')} handleSelect={handleOnSelectCase} arrest={caseResult} />);

    return (
      <SearchResultsList>
        <StyledNavBtnWrapper>
          <NavButton onClick={nextPage}>Proceed Without Arrest</NavButton>
        </StyledNavBtnWrapper>
        { caseOptionsList.toSeq() }
      </SearchResultsList>
    );
  };

  return (
    <Wrapper>
      <Header>Select an arrest</Header>
      { renderSearchResults() }
    </Wrapper>
  );
};

SelectArrestContainer.defaultProps = {
  onSelectCase: () => {}
};

export default SelectArrestContainer;
