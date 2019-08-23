/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Map, List } from 'immutable';
import { Constants } from 'lattice';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StatButtons from '../../components/requiresaction/RequiresActionStatButtons';
import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
import LogoLoader from '../../components/LogoLoader';
import SearchBar from '../../components/PSASearchBar';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import Pagination from '../../components/Pagination';
import PersonTable from '../../components/people/PersonTable';
import { formatPeopleInfo, sortPeopleByName } from '../../utils/PeopleUtils';
import { OL } from '../../utils/consts/Colors';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, SEARCH } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as PeopleActionFactory from './PeopleActionFactory';
import * as PSAModalActionFactory from '../psamodal/PSAModalActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const { PSA_SCORES } = APP_TYPES;

const SectionWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 30px;
    margin-bottom: 30px;
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

const PSAListTitle = styled.div`
  color: ${OL.GREY01};
  padding-top: 10px;
  font-size: 18px;
  font-weight: 400;
  padding-bottom: 20px;
  min-height: 56px;
`;

const SubToolbarWrapper = styled(ToolbarWrapper)`
  margin-right: -30px;
`;

type Props = {
  entitySetIdsToAppType :Map<*, *>,
  loadingRequiresActionPeople :boolean,
  requiresActionPeople :Map<*, *>,
  requiresActionPeopleNeighbors :Map<*, *>,
  peopleWithMultiplePSAs :Set<*>,
  peopleWithRecentFTAs :Set<*>,
  psaNeighborsById :Map<*, *>,
  psaScoresWithNoPendingCharges :Set<*>,
  psaScoresWithRecentFTAs :Set<*>,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  actions :{
    loadPSAsByDate :(filter :string) => void
  }
};

const REQUIRES_ACTION_FILTERS = {
  MULTIPLE_PSA_PEOPLE: PEOPLE.MULTIPLE_PSA_PEOPLE,
  RECENT_FTA_PEOPLE: PEOPLE.RECENT_FTA_PEOPLE,
  NO_PENDING_CHARGES_PEOPLE: PEOPLE.NO_PENDING_CHARGES_PEOPLE
};

const PAGE_SIZE = 8;

class RequiresActionList extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      filter: REQUIRES_ACTION_FILTERS.MULTIPLE_PSA_PEOPLE,
      start: 0,
      searchQuery: '',
      selectedPersonId: ''
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedPersonId, filter } = prevState;
    const { peopleWithMultiplePSAs } = nextProps;
    const selectedPersonNoLongerHasMultiplePSAs = !peopleWithMultiplePSAs.includes(selectedPersonId);
    if (selectedPersonNoLongerHasMultiplePSAs && (filter === PEOPLE.MULTIPLE_PSA_PEOPLE)) {
      return {
        selectedPersonId: ''
      };
    }
    return null;
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

  setPersonId = (person, selectedPersonId) => this.setState({ selectedPersonId });

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    let { start } = this.state;
    const { numPages } = this.getActionList();
    const currPage = (start / PAGE_SIZE) + 1;
    if (currPage > numPages) start = (numPages - 1) * PAGE_SIZE;
    if (start <= 0) start = 0;
    this.setState({
      searchQuery: event.target.value,
      start
    });
  }

  handleFilterRequest = (people) => {
    const { searchQuery, selectedPersonId } = this.state;
    let nextPeople = people.sort(sortPeopleByName);
    if (searchQuery) {
      const searchQueryWords = searchQuery.split(' ');
      nextPeople = people.filter((person) => {
        let personIsSelected = false;
        let matchesDOB = false;
        let matchesFirstName = false;
        let matchesIdentification = false;
        let matchesLastName = false;
        let matchesMiddleName = false;
        const {
          personEntityKeyId,
          dob,
          firstName,
          personId,
          lastName,
          middleName
        } = formatPeopleInfo(person);
        if (selectedPersonId === personEntityKeyId) personIsSelected = true;
        searchQueryWords.forEach((word) => {
          if (dob && dob.toLowerCase().includes(word.toLowerCase())) matchesDOB = true;
          if (firstName && firstName.toLowerCase().includes(word.toLowerCase())) matchesFirstName = true;
          if (personId && personId.toLowerCase().includes(word.toLowerCase())) matchesIdentification = true;
          if (lastName && lastName.toLowerCase().includes(word.toLowerCase())) matchesLastName = true;
          if (middleName && middleName.toLowerCase().includes(word.toLowerCase())) matchesMiddleName = true;
        });
        return (
          matchesDOB
          || matchesFirstName
          || matchesIdentification
          || matchesLastName
          || matchesMiddleName
          || personIsSelected
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
    const numResults = people.size;
    const numPages = Math.ceil(numResults / PAGE_SIZE);
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
    const currPage = (start / PAGE_SIZE) + 1;
    return (
      <Pagination
          numPages={numPages}
          activePage={currPage}
          updateStart={this.updateStart}
          onChangePage={page => this.updatePage((page - 1) * PAGE_SIZE)} />
    );
  }

  renderPersonSearch = () => (
    <SearchBar onChange={this.handleOnChangeSearchQuery} />
  )

  renderPeople = () => {
    const { selectedPersonId, start } = this.state;
    const { people } = this.getActionList();
    const pageOfPeople = people.slice(start, start + PAGE_SIZE);
    return (
      <PersonTable
          handleSelect={this.setPersonId}
          selectedPersonId={selectedPersonId}
          people={pageOfPeople}
          small />
    );
  }

  updateFilter = filter => this.setState({
    filter,
    start: 0,
    selectedPersonId: ''
  });

  renderStatButtons = () => {
    const { filter } = this.state;
    const {
      peopleWithMultiplePSAs,
      peopleWithRecentFTAs,
      psaScoresWithNoPendingCharges,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    if (!includesPretrialModule) return null;
    return (
      <StatButtons
          peopleWithMultiplePSAs={peopleWithMultiplePSAs}
          peopleWithRecentFTAs={peopleWithRecentFTAs}
          peopleWithNoPendingCharges={psaScoresWithNoPendingCharges}
          filter={filter}
          onChange={this.updateFilter} />
    );
  }

  loadCaseHistoryCallback = (personId, psaNeighbors) => {
    const { actions } = this.props;
    const { loadCaseHistory } = actions;
    loadCaseHistory({ personId, neighbors: psaNeighbors });
  }

  renderPSAReviewRows = () => {
    const { filter, selectedPersonId } = this.state;
    const {
      actions,
      entitySetIdsToAppType,
      psaNeighborsById,
      requiresActionPeopleNeighbors,
      psaScoresWithRecentFTAs,
      selectedOrganizationSettings
    } = this.props;
    if (!selectedPersonId) return null;

    const { downloadPSAReviewPDF, loadPSAModal } = actions;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    let personPSAs = requiresActionPeopleNeighbors.getIn([selectedPersonId, PSA_SCORES], List());
    let earliestPSADate;
    if (filter === REQUIRES_ACTION_FILTERS.RECENT_FTA_PEOPLE) {
      personPSAs = personPSAs.filter((psa) => {
        const entityKeyId = psa.getIn([OPENLATTICE_ID_FQN, 0], '');
        return psaScoresWithRecentFTAs.includes(entityKeyId);
      });
    }
    const psaList = personPSAs.sortBy((psa) => {
      const psaDate = psa.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
      if (!earliestPSADate || earliestPSADate.isAfter(psaDate)) earliestPSADate = moment(psaDate);
    }).map((psa) => {
      const entityKeyId = psa.getIn([OPENLATTICE_ID_FQN, 0], '');
      const psaNeighbors = psaNeighborsById.get(entityKeyId, Map());

      return (
        <PSAReviewReportsRow
            key={entityKeyId}
            component={CONTENT_CONSTS.PENDING_PSAS}
            downloadFn={downloadPSAReviewPDF}
            entityKeyId={entityKeyId}
            entitySetIdsToAppType={entitySetIdsToAppType}
            hideProfile
            includesPretrialModule={includesPretrialModule}
            loadCaseHistoryFn={this.loadCaseHistoryCallback}
            loadPSAModal={loadPSAModal}
            psaNeighbors={psaNeighbors}
            scores={psa} />
      );
    });

    return (
      <SectionWrapper>
        <PSAListTitle>Open PSAs</PSAListTitle>
        { psaList }
      </SectionWrapper>
    );
  }

  render() {
    const { loadingRequiresActionPeople } = this.props;
    if (loadingRequiresActionPeople) {
      return <LogoLoader loadingText="Loading..." />;
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
        {this.renderPSAReviewRows() }
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  const search = state.get(STATE.SEARCH);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID);
  return {
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    entitySetIdsToAppType: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map()),

    [PEOPLE.REQUIRES_ACTION_PEOPLE]: people.get(PEOPLE.REQUIRES_ACTION_PEOPLE),
    [PEOPLE.REQUIRES_ACTION_SCORES]: people.get(PEOPLE.REQUIRES_ACTION_SCORES),
    [PEOPLE.PSA_NEIGHBORS_BY_ID]: people.get(PEOPLE.PSA_NEIGHBORS_BY_ID),
    [PEOPLE.NO_PENDING_CHARGES_PSA_SCORES]: people.get(PEOPLE.NO_PENDING_CHARGES_PSA_SCORES),
    [PEOPLE.REQUIRES_ACTION_NEIGHBORS]: people.get(PEOPLE.REQUIRES_ACTION_NEIGHBORS),
    [PEOPLE.MULTIPLE_PSA_PEOPLE]: people.get(PEOPLE.MULTIPLE_PSA_PEOPLE),
    [PEOPLE.RECENT_FTA_PEOPLE]: people.get(PEOPLE.RECENT_FTA_PEOPLE),
    [PEOPLE.RECENT_FTA_PSA_SCORES]: people.get(PEOPLE.RECENT_FTA_PSA_SCORES),
    [PEOPLE.NO_PENDING_CHARGES_PEOPLE]: people.get(PEOPLE.NO_PENDING_CHARGES_PEOPLE),
    [PEOPLE.REQUIRES_ACTION_LOADING]: people.get(PEOPLE.REQUIRES_ACTION_LOADING),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING)
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

  Object.keys(PSAModalActionFactory).forEach((action :string) => {
    actions[action] = PSAModalActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RequiresActionList);
