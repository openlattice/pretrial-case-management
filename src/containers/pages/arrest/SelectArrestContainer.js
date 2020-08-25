/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

import ArrestTable from '../../../components/arrest/ArrestTable';
import { StyledFormWrapper } from '../../../utils/Layout';
import { OL } from '../../../utils/consts/Colors';

/*
 * styled components
 */

const Header = styled.h1`
  font-size: 18px;
  color: ${OL.GREY01};
`;

const SearchResultsList = styled.div`
  background-color: ${OL.GREY16};
  margin: 20px 0;
`;

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    margin-left: 20px;
  }
`;

const NoResultsText = styled.div`
  text-align: center;
  width: 100%;
  padding: 30px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${OL.GREY02};
`;

/*
 * types
 */

type Props = {
  caseOptions :Immutable.List<Map<*, *>>,
  onSelectCase :Function,
  nextPage :Function,
  prevPage :Function,
}

class SelectArrestContainer extends React.Component<Props> {

  handleOnSelectCase = (selectedCase :Immutable.Map<*, *>, entityKeyId :string) => {
    const { onSelectCase } = this.props;
    onSelectCase(selectedCase, entityKeyId);
  };

  renderSearchResults = () => {
    const { caseOptions } = this.props;
    if (caseOptions.isEmpty()) {
      return <NoResultsText>No arrests found.</NoResultsText>;
    }

    return (
      <ResultsWrapper>
        <ArrestTable arrests={caseOptions} handleSelect={this.handleOnSelectCase} />
      </ResultsWrapper>
    );
  };

  renderHeader = () => {
    const { prevPage, nextPage } = this.props;
    return (
      <HeaderWrapper>
        <Header>Select an arrest</Header>
        <ButtonWrapper>
          <Button onClick={prevPage}>Modify Search</Button>
          <Button color="secondary" onClick={nextPage}>Proceed Without Arrest</Button>
        </ButtonWrapper>
      </HeaderWrapper>
    );
  };

  render() {
    return (
      <StyledFormWrapper>
        <SearchResultsList>
          { this.renderHeader() }
          { this.renderSearchResults() }
        </SearchResultsList>
      </StyledFormWrapper>
    );
  }
}

export default SelectArrestContainer;
