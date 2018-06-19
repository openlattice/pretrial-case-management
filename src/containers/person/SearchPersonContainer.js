/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import DatePicker from 'react-bootstrap-date-picker';
import styled from 'styled-components';
import qs from 'query-string';
import moment from 'moment';
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
import { toISODate } from '../../utils/Utils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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

const FooterContainer = styled.div`
  text-align: center;
`;

const ListSectionHeader = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0;
`;

const GrayListSectionHeader = styled(ListSectionHeader)`
  color: #aaa;
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

  handleOnSelectPerson = (person :Immutable.Map, entityKeyId :string, personId :string) => {

    this.props.onSelectPerson(person, entityKeyId, personId);
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
    if (dob) {
      params[Routes.DOB] = toISODate(moment(dob));
    }

    this.props.history.push(`${Routes.NEW_PERSON}?${qs.stringify(params)}`);
  }

  getSortedPeopleList = (peopleList, gray) => {
    return peopleList.sort((p1 :Immutable.Map<*, *>, p2 :Immutable.Map<*, *>) => {
      const p1Last = p1.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
      const p2Last = p2.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
      if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

      const p1First = p1.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
      const p2First = p2.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
      if (p1First !== p2First) return p1First < p2First ? -1 : 1;

      const p1Dob = moment(p1.getIn([PROPERTY_TYPES.DOB, 0], ''));
      const p2Dob = moment(p2.getIn([PROPERTY_TYPES.DOB, 0], ''));
      if (p1Dob.isValid() && p2Dob.isValid()) return p1Dob.isBefore(p2Dob) ? -1 : 1;

      return 0;
    }).map((personResult :Immutable.Map<*, *>) => (
      <PersonCard
          key={personResult.getIn(['id', 0], '')}
          person={personResult}
          handleSelect={this.handleOnSelectPerson}
          gray={gray} />
    )).toSeq();
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

    let footer = null;
    if (searchHasRun) {
      footer = (
        <FooterContainer>
          { searchResults.isEmpty() ? <div>No search results.</div> : null }
          <StyledButton onClick={this.createNewPerson}>Create Person</StyledButton>
        </FooterContainer>
      );
    }

    let peopleWithHistory = Immutable.List();
    let peopleWithoutHistory = Immutable.List();

    searchResults.forEach((person) => {
      const id = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
      const hasHistory = Number.parseInt(id, 10).toString() === id.toString();
      if (hasHistory) {
        peopleWithHistory = peopleWithHistory.push(person);
      }
      else {
        peopleWithoutHistory = peopleWithoutHistory.push(person);
      }
    });

    const body = searchHasRun ? (
      <div>
        {
          peopleWithHistory.size ? (
            <div>
              <ListSectionHeader>People With Case History:</ListSectionHeader>
              { this.getSortedPeopleList(peopleWithHistory) }
              <hr />
            </div>
          ) : null
        }
        {
          peopleWithoutHistory.size ? (
            <div>
              <GrayListSectionHeader>People Without Case History:</GrayListSectionHeader>
              { this.getSortedPeopleList(peopleWithoutHistory, true) }
            </div>
          ) : null
        }
      </div>
    ) : null;

    return (
      <SearchResultsList>
        { body }
        { footer }
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
