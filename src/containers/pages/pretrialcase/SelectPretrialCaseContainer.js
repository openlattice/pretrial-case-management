/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import PretrialCard from '../../../components/pretrial/PretrialCard';
import ManualPretrialCaseEntry from './ManualPretrialCaseEntry';

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
  prevPage :Function,
  onManualEntry :(value :{
    pretrialCase :Immutable.Map<*, *>,
    charges :Immutable.List<Immutable.Map<*, *>>
  }) => void
}

type State = {
  manualEntry :boolean
};

export default class SelectPretrialCaseContainer extends React.Component<Props, State> {

  static defaultProps = {
    onSelectCase: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = { manualEntry: false };
  }

  handleOnSelectCase = (selectedCase :Immutable.Map<*, *>, entityKeyId :string) => {

    this.props.onSelectCase(selectedCase, entityKeyId);
  }

  renderNoResults = () => (
    <div>
      <SearchResultsList>No cases found.</SearchResultsList>
      <StyledNavBtnWrapper>
        <NavButton onClick={this.props.prevPage}>Modify Search</NavButton>
        <NavButton onClick={this.enterManually}>Proceed Without Case</NavButton>
      </StyledNavBtnWrapper>
    </div>
  )

  renderManualEntry = () => {
    const onSubmit = (pretrialCase, charges) => {
      this.props.onManualEntry({ pretrialCase, charges });
      this.props.nextPage();
    };
    return <ManualPretrialCaseEntry onSubmit={onSubmit} />;
  }

  enterManually = () => {
    this.setState({ manualEntry: true });
  }

  renderSearchResults = () => {

    if (this.state.manualEntry) {
      return this.renderManualEntry();
    }

    if (this.props.caseOptions.isEmpty()) {
      return this.renderNoResults();
    }

    const caseOptions = this.props.caseOptions.map((caseResult :Immutable.Map<*, *>) =>
      <PretrialCard key={caseResult.get('id')} handleSelect={this.handleOnSelectCase} pretrialCase={caseResult} />);

    return (
      <SearchResultsList>
        <StyledNavBtnWrapper>
          <NavButton onClick={this.enterManually}>Proceed Without Case</NavButton>
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
