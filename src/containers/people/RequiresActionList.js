import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { Map, List, Set } from 'immutable';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SearchInput } from 'lattice-ui-kit';

import StatButtons from '../../components/requiresaction/RequiresActionStatButtons';
import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
import LogoLoader from '../../components/LogoLoader';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import RequiresActionTable from '../../components/requiresaction/RequiresActionTable';
import { getEntityProperties } from '../../utils/DataUtils';
import { OL } from '../../utils/consts/Colors';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SEARCH } from '../../utils/consts/FrontEndStateConsts';

import REVIEW_DATA from '../../utils/consts/redux/ReviewConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

import { downloadPSAReviewPDF, loadCaseHistory } from '../review/ReviewActions';
import { loadRequiresActionPeople } from './PeopleActions';
import { loadPSAModal } from '../psamodal/PSAModalActionFactory';

const { PSA_SCORES } = APP_TYPES;
const {
  DATE_TIME,
  DOB,
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME
} = PROPERTY_TYPES;

const SectionWrapper = styled.div`
  background-color: white;
  border: solid 1px ${OL.GREY11};
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px 30px;
  width: 100%;
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
  actions :{
    downloadPSAReviewPDF :RequestSequence;
    loadCaseHistory :RequestSequence;
    loadPSAModal :RequestSequence;
    loadRequiresActionPeople :RequestSequence;
  };
  entitySetIdsToAppType :Map;
  loadRequiresActionPeopleReqState :RequestState;
  requiresActionPeople :Map;
  peopleNeighborsById :Map;
  peopleWithMultiplePSAs :Set;
  peopleWithPSAsWithNoHearings :Set;
  peopleWithRecentFTAs :Set;
  psaNeighborsById :Map;
  psaScoresWithNoPendingCharges :Set;
  psaScoresWithNoHearings :Set;
  psaScoresWithRecentFTAs :Set;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
};

type State = {
  filter :string;
  searchQuery :string;
  selectedPersonId :string;
}

const REQUIRES_ACTION_FILTERS = {
  MULTIPLE_PSA_PEOPLE: PEOPLE_DATA.MULTIPLE_PSA_PEOPLE,
  RECENT_FTA_PEOPLE: PEOPLE_DATA.RECENT_FTA_PEOPLE,
  NO_PENDING_CHARGES_PEOPLE: PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE,
  NO_HEARINGS_PEOPLE: PEOPLE_DATA.NO_HEARINGS_PEOPLE,
};

class RequiresActionList extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      filter: REQUIRES_ACTION_FILTERS.MULTIPLE_PSA_PEOPLE,
      searchQuery: '',
      selectedPersonId: ''
    };
  }

  static getDerivedStateFromProps(nextProps :Props, prevState :State) {
    const { selectedPersonId, filter } = prevState;
    const { peopleWithMultiplePSAs } = nextProps;
    const selectedPersonNoLongerHasMultiplePSAs = !peopleWithMultiplePSAs.includes(selectedPersonId);
    if (selectedPersonNoLongerHasMultiplePSAs && (filter === PEOPLE_DATA.MULTIPLE_PSA_PEOPLE)) {
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

  componentDidUpdate(prevProps :Props) {
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.loadRequiresActionPeople();
    }
  }

  setPersonId = (selectedPersonId :UUID) => this.setState({ selectedPersonId });

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {
    this.setState({
      searchQuery: event.target.value
    });
  }

  handleFilterRequest = (people :List) => {
    const { searchQuery, selectedPersonId } = this.state;
    let nextPeople = people;
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
          personEKID,
          dob,
          firstName,
          personId,
          lastName,
          middleName
        } = person;
        if (selectedPersonId === personEKID) personIsSelected = true;
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
    const { requiresActionPeople, peopleNeighborsById } = this.props;
    const { filter } = this.state;
    let people = props[filter].map(
      (personId, idx) => {
        const person = requiresActionPeople.get(personId, Map());
        const id = personId + idx;
        const {
          [DOB]: dob,
          [FIRST_NAME]: firstName,
          [LAST_NAME]: lastName,
          [MIDDLE_NAME]: middleName,
          [ENTITY_KEY_ID]: personEKID,
        } = getEntityProperties(person, [DOB, FIRST_NAME, LAST_NAME, MIDDLE_NAME, ENTITY_KEY_ID]);
        let oldPSADate;
        const personPSAs = peopleNeighborsById.getIn([personEKID, PSA_SCORES], List());
        personPSAs.forEach((psaScore) => {
          const { [DATE_TIME]: psaCreationDate } = getEntityProperties(psaScore, [DATE_TIME]);
          const psaDateTime = DateTime.fromISO(psaCreationDate);
          if (!oldPSADate || oldPSADate > psaDateTime) oldPSADate = psaDateTime.toISODate();
        });
        return {
          dob,
          firstName,
          lastName,
          middleName,
          oldPSADate,
          personEKID,
          psaCount: personPSAs.size,
          id
        };
      }
    );
    people = this.handleFilterRequest(people);
    return { people };
  }

  renderPersonSearch = () => (
    <SearchInput onChange={this.handleOnChangeSearchQuery} />
  )

  renderPeople = () => {
    const { selectedPersonId } = this.state;
    const { people } = this.getActionList();
    return (
      <RequiresActionTable
          handleSelect={this.setPersonId}
          selectedPersonId={selectedPersonId}
          people={people.toJS()} />
    );
  }

  updateFilter = (filter :string) => this.setState({
    filter,
    selectedPersonId: ''
  });

  renderStatButtons = () => {
    const { filter } = this.state;
    const {
      peopleWithMultiplePSAs,
      peopleWithRecentFTAs,
      psaScoresWithNoPendingCharges,
      peopleWithPSAsWithNoHearings,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    if (!includesPretrialModule) return null;
    return (
      <StatButtons
          peopleWithMultiplePSAs={peopleWithMultiplePSAs}
          peopleWithRecentFTAs={peopleWithRecentFTAs}
          peopleWithNoPendingCharges={psaScoresWithNoPendingCharges}
          peopleWithPSAsWithNoHearings={peopleWithPSAsWithNoHearings}
          filter={filter}
          onChange={this.updateFilter} />
    );
  }

  loadCaseHistoryCallback = ({ personId, psaNeighbors } :Object) => {
    const { actions } = this.props;
    actions.loadCaseHistory({ personId, neighbors: psaNeighbors });
  }

  renderPSAReviewRows = () => {
    const { filter, selectedPersonId } = this.state;
    const {
      actions,
      entitySetIdsToAppType,
      psaNeighborsById,
      peopleNeighborsById,
      psaScoresWithRecentFTAs,
      psaScoresWithNoHearings,
      selectedOrganizationSettings
    } = this.props;
    if (!selectedPersonId) return null;

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    let personPSAs = peopleNeighborsById.getIn([selectedPersonId, PSA_SCORES], List());
    let earliestPSADate;
    if (filter === REQUIRES_ACTION_FILTERS.RECENT_FTA_PEOPLE) {
      personPSAs = personPSAs.filter((psa) => {
        const entityKeyId = psa.getIn([ENTITY_KEY_ID, 0], '');
        return psaScoresWithRecentFTAs.includes(entityKeyId);
      });
    }
    if (filter === REQUIRES_ACTION_FILTERS.NO_HEARINGS_PEOPLE) {
      personPSAs = personPSAs.filter((psa) => {
        const entityKeyId = psa.getIn([ENTITY_KEY_ID, 0], '');
        return psaScoresWithNoHearings.includes(entityKeyId);
      });
    }
    const psaList = personPSAs.sortBy((psa) => {
      const psaDate = psa.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
      const psaDT = DateTime.fromISO(psaDate);
      if (!earliestPSADate || earliestPSADate > psaDT) earliestPSADate = DateTime.fromISO(psaDate);
    }).map((psa) => {
      const entityKeyId = psa.getIn([ENTITY_KEY_ID, 0], '');
      const psaNeighbors = psaNeighborsById.get(entityKeyId, Map());

      return (
        <PSAReviewReportsRow
            key={entityKeyId}
            component={CONTENT_CONSTS.PENDING_PSAS}
            downloadFn={actions.downloadPSAReviewPDF}
            entityKeyId={entityKeyId}
            entitySetIdsToAppType={entitySetIdsToAppType}
            hideProfile
            includesPretrialModule={includesPretrialModule}
            loadCaseHistoryFn={this.loadCaseHistoryCallback}
            loadPSAModal={actions.loadPSAModal}
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
    const { loadRequiresActionPeopleReqState } = this.props;
    const loadingRequiresActionPeople = requestIsPending(loadRequiresActionPeopleReqState);
    if (loadingRequiresActionPeople) {
      return <LogoLoader loadingText="Loading..." />;
    }
    return (
      <DashboardMainSection>
        { this.renderStatButtons() }
        <SectionWrapper>
          <SubToolbarWrapper>
            { this.renderPersonSearch() }
          </SubToolbarWrapper>
          { this.renderPeople() }
          <SubToolbarWrapper>
            <div />
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
  const review = state.get(STATE.REVIEW);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID);
  return {
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    entitySetIdsToAppType: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map()),

    // Review
    [REVIEW_DATA.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW_DATA.PSA_NEIGHBORS_BY_ID),

    loadRequiresActionPeopleReqState: getReqState(people, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE),
    [PEOPLE_DATA.REQUIRES_ACTION_PEOPLE]: people.get(PEOPLE_DATA.REQUIRES_ACTION_PEOPLE),
    [PEOPLE_DATA.REQUIRES_ACTION_SCORES]: people.get(PEOPLE_DATA.REQUIRES_ACTION_SCORES),
    [PEOPLE_DATA.NO_PENDING_CHARGES_PSA_SCORES]: people.get(PEOPLE_DATA.NO_PENDING_CHARGES_PSA_SCORES),
    [PEOPLE_DATA.NO_HEARINGS_PSA_SCORES]: people.get(PEOPLE_DATA.NO_HEARINGS_PSA_SCORES),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID),
    [PEOPLE_DATA.MULTIPLE_PSA_PEOPLE]: people.get(PEOPLE_DATA.MULTIPLE_PSA_PEOPLE),
    [PEOPLE_DATA.RECENT_FTA_PEOPLE]: people.get(PEOPLE_DATA.RECENT_FTA_PEOPLE),
    [PEOPLE_DATA.RECENT_FTA_PSA_SCORES]: people.get(PEOPLE_DATA.RECENT_FTA_PSA_SCORES),
    [PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE]: people.get(PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE),
    [PEOPLE_DATA.NO_HEARINGS_PEOPLE]: people.get(PEOPLE_DATA.NO_HEARINGS_PEOPLE),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // People Actions
    loadRequiresActionPeople,
    // Review Actions
    downloadPSAReviewPDF,
    loadCaseHistory,
    // PSA Modal Actions
    loadPSAModal
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(RequiresActionList);
