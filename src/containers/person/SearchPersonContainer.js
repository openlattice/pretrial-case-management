/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SearchControl from '../../components/controls/SearchControl';
import PersonCard from '../../components/person/PersonCard';
import { clearSearchResults, searchPeopleRequest } from './PersonActionFactory';

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

const PersonResultWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 0 auto;
  margin: 10px 0;
  &:hover {
    cursor: pointer;
  }
`;

const PersonPictureWrapper = styled.div`

`;

const PersonPicture = styled.img`
  max-height: 150px;
`;

const PersonInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
`;

const PersonInfoHeaders = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  strong {
    font-weight: 600;
  }
`;

const PersonInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 0;
  margin-left: 10px;
  span {
    margin: 0;
  }
`;

/*
 * types
 */

type Props = {
  actions :{
    clearSearchResults :Function,
    searchPeopleRequest :Function
  },
  searchResults :List<Map<*, *>>,
  onSelectPerson :Function
}

class SearchPeopleContainer extends React.Component<Props> {

  static defaultProps = {
    onSelectPerson: () => {}
  }

  componentWillUnmount() {

    this.props.actions.clearSearchResults();
  }

  handleOnSelectPerson = (person :Map, entityKeyId :string) => {

    this.props.onSelectPerson(person, entityKeyId);
  }

  handleOnSubmitSearch = (searchQuery :string) => {

    this.props.actions.searchPeopleRequest(searchQuery);
  }

  renderSearchResults = () => {

    if (this.props.searchResults.isEmpty()) {
      return (
        <SearchResultsList>No search results.</SearchResultsList>
      );
    }

    const searchResults = this.props.searchResults.map((personResult :Map<*, *>) => {
      return <PersonCard key={personResult.getIn(['id', 0], '')} person={personResult} handleSelect={this.handleOnSelectPerson} />
    });

    return (
      <SearchResultsList>
        { searchResults.toSeq() }
      </SearchResultsList>
    );
  }

  render() {
    return (
      <Wrapper>
        <Header>Search for people</Header>
        <SearchControl withButton onSubmit={this.handleOnSubmitSearch} />
        { this.renderSearchResults() }
      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    searchResults: state.getIn(['search', 'searchResults'], Immutable.List())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ clearSearchResults, searchPeopleRequest }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPeopleContainer);
