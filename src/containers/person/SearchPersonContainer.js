/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import DatePicker from 'react-bootstrap-date-picker';
import styled from 'styled-components';
import qs from 'query-string';
import { Button, FormControl, Col } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StyledButton from '../../components/buttons/StyledButton';
import PersonCard from '../../components/person/PersonCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { clearSearchResults, searchPeopleRequest } from './PersonActionFactory';
import {
  PaddedRow,
  TitleLabel
} from '../../utils/Layout';
import * as Routes from '../../core/router/Routes';

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

const LoadingText = styled.div`
  font-size: 20px;
  margin: 15px;
`;

const ButtonWrapper = styled.div`
  margin-top: -5px;
  text-align: center;
`;

const NoResultsContainer = styled.div`
  text-align: center;
`;

/*
 * types
 */

type Props = {
  actions :{
    clearSearchResults :Function,
    searchPeopleRequest :Function
  },
  isLoadingPeople :boolean,
  searchHasRun :boolean,
  searchResults :Immutable.List<Immutable.Map<*, *>>,
  onSelectPerson :Function,
  history :string[]
}

type State = {
  firstName :string,
  lastName :string,
  dob :?string
};

class SearchPeopleContainer extends React.Component<Props, State> {

  static defaultProps = {
    onSelectPerson: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      dob: undefined
    };
  }

  componentWillUnmount() {

    this.props.actions.clearSearchResults();
  }

  handleOnSelectPerson = (person :Immutable.Map, entityKeyId :string) => {

    this.props.onSelectPerson(person, entityKeyId);
  }

  handleOnSubmitSearch = () => {

    const {
      firstName,
      lastName,
      dob
    } = this.state;
    if (firstName.length || lastName.length || dob) {
      this.props.actions.searchPeopleRequest(firstName, lastName, dob);
    }
  }

  createNewPerson = () => {

    const {
      firstName,
      lastName,
      dob
    } = this.state;
    const params = {
      [Routes.LAST_NAME]: lastName,
      [Routes.FIRST_NAME]: firstName
    };
    if (dob) params[Routes.DOB] = dob;

    this.props.history.push(`${Routes.NEW_PERSON}?${qs.stringify(params)}`);
  }

  renderSearchResults = () => {

    const {
      isLoadingPeople,
      searchResults,
      searchHasRun
    } = this.props;

    if (isLoadingPeople) {
      return (
        <div>
          <LoadingText>Loading results...</LoadingText>
          <LoadingSpinner />
        </div>
      );
    }

    if (searchHasRun && searchResults.isEmpty()) {
      return (
        <NoResultsContainer>
          <div>No search results.</div>
          <StyledButton onClick={this.createNewPerson}>Create Person</StyledButton>
        </NoResultsContainer>
      );
    }

    const searchResultCards = searchResults.map((personResult :Immutable.Map<*, *>) => (
      <PersonCard
          key={personResult.getIn(['id', 0], '')}
          person={personResult}
          handleSelect={this.handleOnSelectPerson} />
    ));

    return (
      <SearchResultsList>
        { searchResultCards.toSeq() }
      </SearchResultsList>
    );
  }

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleOnSubmitSearch();
    }
  }

  render() {
    const {
      firstName,
      lastName,
      dob
    } = this.state;

    return (
      <Wrapper>
        <Header>Search for people</Header>
        <SearchRow>
          <Col lg={4}>
            <TitleLabel>Last Name</TitleLabel>
            <FormControl
                name="lastName"
                value={lastName}
                onKeyPress={this.handleKeyPress}
                onChange={this.onInputChange} />
          </Col>
          <Col lg={4}>
            <TitleLabel>First Name</TitleLabel>
            <FormControl
                name="firstName"
                value={firstName}
                onKeyPress={this.handleKeyPress}
                onChange={this.onInputChange} />
          </Col>
          <Col lg={4}>
            <TitleLabel>Date of Birth</TitleLabel>
            <DatePicker
                value={dob}
                onChange={(newDate) => {
                  this.setState({ dob: newDate });
                }} />
          </Col>
        </SearchRow>
        <SearchRow>
          <Col lg={12}>
            <ButtonWrapper>
              <Button onClick={this.handleOnSubmitSearch}>Search</Button>
            </ButtonWrapper>
          </Col>
        </SearchRow>
        { this.renderSearchResults() }
      </Wrapper>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {

  return {
    searchResults: state.getIn(['search', 'searchResults'], Immutable.List()),
    isLoadingPeople: state.getIn(['search', 'isLoadingPeople'], false),
    searchHasRun: state.getIn(['search', 'searchHasRun'], false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ clearSearchResults, searchPeopleRequest }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPeopleContainer);
