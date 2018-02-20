/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import PretrialCard from '../../../components/pretrial/PretrialCard';

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
  caseOptions :List<Map<*, *>>,
  onSelectCase :Function,
  nextPage :Function,
  prevPage :Function
}

export default class SelectPretrialCaseContainer extends React.Component<Props> {

  static defaultProps = {
    onSelectCase: () => {}
  }

  handleOnSelectCase = (selectedCase :Map, entityKeyId :string) => {

    this.props.onSelectCase(selectedCase, entityKeyId);
  }

  renderNoResults = () => {
    return (
      <div>
        <SearchResultsList>No cases found.</SearchResultsList>
        <StyledNavBtnWrapper>
          <NavButton onClick={this.props.prevPage}>Modify Search</NavButton>
          <NavButton onClick={this.props.nextPage}>Proceed Without Case</NavButton>
        </StyledNavBtnWrapper>
      </div>
    );
  }

  renderSearchResults = () => {

    if (this.props.caseOptions.isEmpty()) {
      return this.renderNoResults();
    }

    const caseOptions = this.props.caseOptions.map((caseResult :Map<*, *>) =>
      <PretrialCard key={caseResult.get('id')} handleSelect={this.handleOnSelectCase} pretrialCase={caseResult} />);

    return (
      <SearchResultsList>
        <StyledNavBtnWrapper>
          <NavButton onClick={this.props.nextPage}>Proceed Without Case</NavButton>
        </StyledNavBtnWrapper>
        { caseOptions.toSeq() }
      </SearchResultsList>
    );
  }

  render() {
    return (
      <Wrapper>
        <Header>Select a case</Header>
        { this.renderSearchResults() }
      </Wrapper>
    );
  }
}
