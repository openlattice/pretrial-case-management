/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
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

    const searchResults = this.props.searchResults.map((personResult :Map<*, *>) => (
      <PersonCard
          key={personResult.getIn(['id', 0], '')}
          person={personResult}
          handleSelect={this.handleOnSelectPerson} />
    ));

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
