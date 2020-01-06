/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


import PersonSearchFields from '../../components/person/PersonSearchFields';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import PersonTable from '../../components/people/PersonTable';
import LogoLoader from '../../components/LogoLoader';
import NoSearchResults from '../../components/people/NoSearchResults';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { SEARCH } from '../../utils/consts/FrontEndStateConsts';
import { OL } from '../../utils/consts/Colors';
import { StyledFormViewWrapper, StyledSectionWrapper, StyledFormWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';

import * as Routes from '../../core/router/Routes';
import { clearSearchResults, searchPeople } from './PersonActions';

/*
 * styled components
 */


const Wrapper = styled.div`
   display: flex;
   flex: 1 0 auto;
   flex-direction: column;
   width: 100%;
`;

const SearchResultsList = styled.div`
  background-color: ${OL.GREY16};
  display: flex;
  flex-direction: column;
  padding: 30px 0;
  width: 100%;

  &:last-child {
    padding-bottom: 0;
  }
`;

const NonResultsContainer = styled.div`
  margin-top: 50px;
  text-align: center;
  width: 100%;
`;

const ListSectionHeader = styled.div`
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  padding: 0 0 30px 30px;
`;

const GrayListSectionHeader = styled(ListSectionHeader)`
  padding-top: 30px;
`;

const ErrorMessage = styled.div`
  color: ${OL.RED01};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  text-align: center;
`;

const CreateButtonWrapper = styled(StyledFormViewWrapper)`
  margin-top: -60px;

  ${StyledFormWrapper} {
    border-top: 1px solid ${OL.GREY11};

    ${StyledSectionWrapper} {
      padding: 20px 30px;

      ${SecondaryButton} {
        width: 100%;
      }
    }
  }
`;

const SearchResultsWrapper = styled(StyledSectionWrapper)`
  padding: 0;
`;


/*
 * types
 */

type Props = {
  actions :{
    clearSearchResults :() => void;
    searchPeople :RequestSequence;
  };
  error :boolean;
  history :string[];
  isLoadingPeople :boolean;
  onSelectPerson :Function;
  searchHasRun :boolean;
  searchResults :List;
}

type State = {
  firstName :string;
  lastName :string;
  dob :?string;
};

class SearchPeopleContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      dob: undefined
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  handleOnSelectPerson = (person :Map, entityKeyId :string, personId :string) => {
    const { onSelectPerson } = this.props;
    onSelectPerson(person, entityKeyId, personId);
  }

  handleOnSubmitSearch = ({ firstName, lastName, dob }) => {
    const { actions } = this.props;
    if (firstName.length || lastName.length || dob) {
      actions.searchPeople({ firstName, lastName, dob });
      this.setState({ firstName, lastName, dob });
    }
  }

  createNewPerson = () => {
    const { history } = this.props;
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
      params[Routes.DOB] = DateTime.fromFormat(dob, DATE_FORMAT).toISODate();
    }

    history.push(`${Routes.NEW_PERSON}?${qs.stringify(params)}`);
  }

  getSortedPeopleList = (peopleList, gray) => {
    const rows = peopleList.sort((p1 :Map<*, *>, p2 :Map<*, *>) => {
      const p1Last = p1.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
      const p2Last = p2.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
      if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

      const p1First = p1.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
      const p2First = p2.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
      if (p1First !== p2First) return p1First < p2First ? -1 : 1;

      const p1Dob = DateTime.fromISO(p1.getIn([PROPERTY_TYPES.DOB, 0], ''));
      const p2Dob = DateTime.fromISO(p2.getIn([PROPERTY_TYPES.DOB, 0], ''));
      if (p1Dob.isValid && p2Dob.isValid) return p1Dob < p2Dob ? -1 : 1;

      return 0;
    });
    return <PersonTable people={rows} gray={gray} handleSelect={this.handleOnSelectPerson} />;
  }

  renderCreatePersonButton = () => {
    const { searchHasRun } = this.props;
    if (!searchHasRun) {
      return null;
    }

    return (
      <CreateButtonWrapper>
        <StyledFormWrapper>
          <StyledSectionWrapper>
            <SecondaryButton onClick={this.createNewPerson}>Create Person</SecondaryButton>
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </CreateButtonWrapper>
    );
  }

  renderSearchResults = () => {

    const {
      isLoadingPeople,
      searchResults,
      searchHasRun,
      error
    } = this.props;

    /* display loading spinner if necessary */
    if (isLoadingPeople) {
      return (
        <NonResultsContainer>
          <LogoLoader loadingText="Loading results..." />
        </NonResultsContainer>
      );
    }

    /* display error message if necessary */
    if (error) {
      return <NonResultsContainer><ErrorMessage>Unable to load search results.</ErrorMessage></NonResultsContainer>;
    }

    /* search has not run and is not currently running -- don't display anything */
    if (!searchHasRun) {
      return null;
    }

    /* search has finished running -- if there are no results, display the NoSearchResults component */
    if (searchResults.isEmpty()) {
      return <NonResultsContainer><NoSearchResults /></NonResultsContainer>;
    }

    /* search has finished running and there are results -- display the results */
    let peopleWithHistory = List();
    let peopleWithoutHistory = List();

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

    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <SearchResultsWrapper>
            <SearchResultsList>
              {
                peopleWithHistory.size ? (
                  <div>
                    <ListSectionHeader>People With Case History</ListSectionHeader>
                    { this.getSortedPeopleList(peopleWithHistory) }
                  </div>
                ) : null
              }
              {
                peopleWithoutHistory.size ? (
                  <div>
                    <GrayListSectionHeader>People Without Case History</GrayListSectionHeader>
                    { this.getSortedPeopleList(peopleWithoutHistory, true) }
                  </div>
                ) : null
              }
            </SearchResultsList>
          </SearchResultsWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }

  render() {
    return (
      <Wrapper>
        <StyledFormViewWrapper>
          <StyledFormWrapper>
            <StyledSectionWrapper>
              <PersonSearchFields handleSubmit={this.handleOnSubmitSearch} />
            </StyledSectionWrapper>
          </StyledFormWrapper>
        </StyledFormViewWrapper>
        { this.renderCreatePersonButton() }
        { this.renderSearchResults() }
      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const search = state.get(STATE.SEARCH);
  // TODO: error is not in SearchReducer
  return {
    // Search
    [SEARCH.SEARCH_RESULTS]: search.get(SEARCH.SEARCH_RESULTS, List()),
    [SEARCH.LOADING]: search.get(SEARCH.LOADING, false),
    [SEARCH.SEARCH_HAS_RUN]: search.get(SEARCH.SEARCH_HAS_RUN),
    error: search.get('searchError', false)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Person Actions
    clearSearchResults,
    searchPeople
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPeopleContainer);
