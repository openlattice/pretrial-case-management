/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import PretrialCard from '../../../components/pretrial/PretrialCard';

import { PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
const {
  CASE_ID_FQN,
  ARREST_DATE_FQN,
  MOST_SERIOUS_CHARGE_NO,
  MOST_SERIOUS_CHARGE_DESC,
  MOST_SERIOUS_CHARGE_DEG,
  NUMBER_OF_CHARGES_FQN
} = PROPERTY_TYPES;

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

const CaseResultWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 0 auto;
  margin: 10px 0;
  &:hover {
    cursor: pointer;
  }
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

    const caseOptions = this.props.caseOptions.map((caseResult :Map<*, *>) => {
      return <PretrialCard key={caseResult.get('id')} handleSelect={this.handleOnSelectCase} pretrialCase={caseResult} />;
    });

    return (
      <SearchResultsList>
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
