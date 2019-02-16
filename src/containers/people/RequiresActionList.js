/*
 * @flow
 */

import React from 'react';
import Immutable, { Map } from 'immutable';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StatButtons from '../../components/requiresaction/RequiresActionStatButtons';
import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchBar from '../../components/PSASearchBar';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import Pagination from '../../components/Pagination';
import PersonTable from '../../components/people/PersonTable';
import { formatPeopleInfo, sortPeopleByName } from '../../utils/PeopleUtils';
import { OL } from '../../utils/consts/Colors';
import {
  APP,
  PEOPLE,
  SEARCH,
  REVIEW,
  STATE,
} from '../../utils/consts/FrontEndStateConsts';

import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as PeopleActionFactory from './PeopleActionFactory';

const SectionWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 30px;
    justify-content: center;
    background-color: ${OL.WHITE};
    border-radius: 5px;
    border: solid 1px ${OL.GREY11};
`;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

const SubToolbarWrapper = styled(ToolbarWrapper)`
  margin-right: -30px;
`;

type Props = {
  loadingRequiresActionPeople :boolean,
  requiresActionPeople :Immutable.Map<*, *>,
  peopleWithMultiplePSAs :Set<*>,
  peopleWithRecentFTAs :Set<*>,
  psaScoresWithNoPendingCharges :Set<*>,
  selectedOrganizationId :string,
  actions :{
    loadPSAsByDate :(filter :string) => void
  }
};

const REQUIRES_ACTION_FILTERS = {
  MULTIPLE_PSA_PEOPLE: PEOPLE.MULTIPLE_PSA_PEOPLE,
  RECENT_FTA_PEOPLE: PEOPLE.RECENT_FTA_PEOPLE,
  NO_PENDING_CHARGES_PEOPLE: PEOPLE.NO_PENDING_CHARGES_PEOPLE
};

const MAX_RESULTS = 8;

class RequiresActionList extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      filter: REQUIRES_ACTION_FILTERS.MULTIPLE_PSA_PEOPLE,
      start: 0,
      searchQuery: ''
    };
  }

  componentDidMount() {
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      actions.loadRequiresActionPeople();
    }
  }

  componentDidUpdate(prevProps) {
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.loadRequiresActionPeople();
    }
  }

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    let { start } = this.state;
    const { numPages } = this.getActionList();
    const currPage = (start / MAX_RESULTS) + 1;
    if (currPage > numPages) start = (numPages - 1) * MAX_RESULTS;
    if (start <= 0) start = 0;
    this.setState({
      searchQuery: event.target.value,
      start
    });
  }

  handleFilterRequest = (people) => {
    const { searchQuery } = this.state;
    let nextPeople = people.sort(sortPeopleByName);
    if (searchQuery) {
      const searchQueryWords = searchQuery.split(' ');
      nextPeople = people.filter((person) => {
        let matchesDOB = false;
        let matchesFirstName = false;
        let matchesIdentification = false;
        let matchesLastName = false;
        let matchesMiddleName = false;
        const {
          dob,
          firstName,
          identification,
          lastName,
          middleName
        } = formatPeopleInfo(person);
        searchQueryWords.forEach((word) => {
          if (dob && dob.toLowerCase().includes(word.toLowerCase())) matchesDOB = true;
          if (firstName && firstName.toLowerCase().includes(word.toLowerCase())) matchesFirstName = true;
          if (identification && identification.toLowerCase().includes(word.toLowerCase())) matchesIdentification = true;
          if (lastName && lastName.toLowerCase().includes(word.toLowerCase())) matchesLastName = true;
          if (middleName && middleName.toLowerCase().includes(word.toLowerCase())) matchesMiddleName = true;
        });
        return (
          matchesDOB
          || matchesFirstName
          || matchesIdentification
          || matchesLastName
          || matchesMiddleName
        );
      });
    }
    return nextPeople;
  }

  getActionList = () => {
    const { props } = this;
    const { requiresActionPeople } = this.props;
    const { filter } = this.state;
    let people = props[filter].map(personId => requiresActionPeople.get(personId, Map()));
    people = this.handleFilterRequest(people);
    const numResults = people.length || people.size;
    const numPages = Math.ceil(numResults / MAX_RESULTS);
    return { people, numResults, numPages };
  }

  updatePage = (start) => {
    this.setState({ start });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  renderPagination = () => {
    const { start } = this.state;
    const { numPages } = this.getActionList();
    const currPage = (start / MAX_RESULTS) + 1;
    return (
      <Pagination
          numPages={numPages}
          activePage={currPage}
          updateStart={this.updateStart}
          onChangePage={page => this.updatePage((page - 1) * MAX_RESULTS)} />
    );
  }

  renderPersonSearch = () => (
    <SearchBar onChange={this.handleOnChangeSearchQuery} />
  )

  renderPeople = () => {
    const { start } = this.state;
    const { people } = this.getActionList();
    const pageOfPeople = people.slice(start, start + MAX_RESULTS);
    return (
      <PersonTable
          small
          people={pageOfPeople} />
    );
  }

  updateFilter = filter => this.setState({
    filter,
    start: 0
  });

  renderStatButtons = () => {
    const { filter } = this.state;
    const {
      peopleWithMultiplePSAs,
      peopleWithRecentFTAs,
      psaScoresWithNoPendingCharges,
    } = this.props;
    return (
      <StatButtons
          peopleWithMultiplePSAs={peopleWithMultiplePSAs}
          peopleWithRecentFTAs={peopleWithRecentFTAs}
          peopleWithNoPendingCharges={psaScoresWithNoPendingCharges}
          filter={filter}
          onChange={this.updateFilter} />
    );
  }

  render() {
    const { loadingRequiresActionPeople } = this.props;

    if (loadingRequiresActionPeople) {
      return <LoadingSpinner />;
    }
    return (
      <DashboardMainSection>
        { this.renderStatButtons() }
        <SectionWrapper>
          <SubToolbarWrapper>
            { this.renderPersonSearch() }
            { this.renderPagination() }
          </SubToolbarWrapper>
          { this.renderPeople() }
          <SubToolbarWrapper>
            <div />
            { this.renderPagination() }
          </SubToolbarWrapper>
        </SectionWrapper>
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  const search = state.get(STATE.SEARCH);
  return {
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),

    [PEOPLE.REQUIRES_ACTION_PEOPLE]: people.get(PEOPLE.REQUIRES_ACTION_PEOPLE),
    [PEOPLE.REQUIRES_ACTION_SCORES]: people.get(PEOPLE.REQUIRES_ACTION_SCORES),
    [PEOPLE.NO_PENDING_CHARGES_PSA_SCORES]: people.get(PEOPLE.NO_PENDING_CHARGES_PSA_SCORES),
    [PEOPLE.REQUIRES_ACTION_NEIGHBORS]: people.get(PEOPLE.REQUIRES_ACTION_NEIGHBORS),
    [PEOPLE.MULTIPLE_PSA_PEOPLE]: people.get(PEOPLE.MULTIPLE_PSA_PEOPLE),
    [PEOPLE.RECENT_FTA_PEOPLE]: people.get(PEOPLE.RECENT_FTA_PEOPLE),
    [PEOPLE.NO_PENDING_CHARGES_PEOPLE]: people.get(PEOPLE.NO_PENDING_CHARGES_PEOPLE),
    [PEOPLE.REQUIRES_ACTION_LOADING]: people.get(PEOPLE.REQUIRES_ACTION_LOADING),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID)
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = {};

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RequiresActionList);
