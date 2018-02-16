/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Button, FormControl, Col } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SearchControl from '../../components/controls/SearchControl';
import PersonCard from '../../components/person/PersonCard';
import { clearSearchResults, searchPeopleRequest } from './PersonActionFactory';
import {
  PaddedRow,
  TitleLabel
} from '../../utils/Layout';

/*
 * styled components
 */

const Wrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  padding: 50px;
  width: 100%;
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

const SearchRow = styled(PaddedRow)`
  align-items: flex-end;
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

  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: ''
    };
  }

  componentWillUnmount() {

    this.props.actions.clearSearchResults();
  }

  handleOnSelectPerson = (person :Map, entityKeyId :string) => {

    this.props.onSelectPerson(person, entityKeyId);
  }

  handleOnSubmitSearch = () => {

    const { firstName, lastName } = this.state;
    if (firstName.length || lastName.length) {
      this.props.actions.searchPeopleRequest(firstName, lastName);
    }
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

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleOnSubmitSearch()
    }
  }

  render() {
    const { firstName, lastName } = this.state;

    return (
      <Wrapper>
        <Header>Search for people</Header>
        <SearchRow>
          <Col lg={5}>
            <TitleLabel>First Name</TitleLabel>
            <FormControl
                name="firstName"
                value={firstName}
                onKeyPress={this.handleKeyPress}
                onChange={this.onInputChange} />
          </Col>
          <Col lg={5}>
            <TitleLabel>Last Name</TitleLabel>
            <FormControl
                name="lastName"
                value={lastName}
                onKeyPress={this.handleKeyPress}
                onChange={this.onInputChange} />
          </Col>
          <Col lg={2}>
            <Button onClick={this.handleOnSubmitSearch}>Search</Button>
          </Col>
        </SearchRow>
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
