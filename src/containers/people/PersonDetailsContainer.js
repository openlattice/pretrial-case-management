/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';
import { Redirect, Route, Switch } from 'react-router-dom';

import ClosePSAModal from '../../components/review/ClosePSAModal';
import UpdateContactInfoModal from '../person/UpdateContactInfoModal';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import PersonOverview from '../../components/people/PersonOverview';
import PersonPSA from '../../components/people/PersonPSA';
import PersonHearings from '../../components/people/PersonHearings';
import PersonCases from '../../components/people/PersonCases';
import PSAModal from '../review/PSAModal';
import { getPSAIdsFromNeighbors } from '../../utils/PeopleUtils';
import { JURISDICTION } from '../../utils/consts/Consts';
import { getEntityKeyId, getIdOrValue, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  getScheduledHearings,
  getPastHearings,
  getAvailableHearings,
  getHearingsIdsFromNeighbors
} from '../../utils/consts/HearingConsts';
import {
  COURT,
  STATE,
  SUBMIT,
  PEOPLE,
  REVIEW,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';
import {
  getChargeHistory,
  getCaseHistory,
} from '../../utils/CaseUtils';

import * as Routes from '../../core/router/Routes';
import * as CourtActionFactory from '../court/CourtActionFactory';
import * as PeopleActionFactory from './PeopleActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  hearings :List<*, *>,
  selectedPersonData :Map<*, *>,
  isFetchingPersonData :boolean,
  loadingPSAData :boolean,
  loadingPSAResults :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  neighbors :Map<*, *>,
  personId :string,
  psaNeighborsById :Map<*, *>,
  actions :{
    getPersonData :(personId :string) => void,
    getPersonNeighbors :(value :{
      personId :string
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    loadPSAData :(psaIds :string[]) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    loadJudges :() => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
    clearSubmit :() => void,

  },
  match :{
    params :{
      personId :string
    }
  }
};

class PersonDetailsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      open: false,
      closing: false,
      closePSAButtonActive: false,
      updateContactModalOpen: false
    };
  }

  componentDidMount() {
    const { actions, personId } = this.props;
    actions.loadJudges();
    actions.getPersonData(personId);
    actions.getPersonNeighbors({ personId });
  }

  componentWillReceiveProps(nextProps) {
    const {
      actions,
      mostRecentPSA,
      neighbors,
      psaNeighborsById
    } = this.props;
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const initialMostRecentPSANeighbors = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const nextMostRecentPSANeighbors = nextProps.psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const hearingIds = getHearingsIdsFromNeighbors(nextMostRecentPSANeighbors);
    const psaIds = getPSAIdsFromNeighbors(nextProps.neighbors);
    if (psaIds.length && !neighbors.size && nextProps.neighbors.size) {
      actions.loadPSAData(psaIds);
    }
    if (hearingIds.length && (initialMostRecentPSANeighbors.size !== nextMostRecentPSANeighbors.size)) {
      actions.loadHearingNeighbors({ hearingIds });
    }
  }

  refreshPSANeighborsCallback = () => {
    const { actions, mostRecentPSA } = this.props;
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    actions.refreshPSANeighbors({ id: mostRecentPSAEntityKeyId });
  }

  handleStatusChange = () => {
    this.setState({ closing: false });
  }

  renderPSADetailsModal = () => {
    const { closePSAButtonActive, closing, open } = this.state;
    const {
      actions,
      entityKeyId,
      ftaHistory,
      hearings,
      manualCaseHistory,
      manualChargeHistory,
      mostRecentPSA,
      personId,
      neighbors,
      psaNeighborsById,
      sentenceHistory
    } = this.props;

    const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map());
    const mostRecentPSAEntityKeyId = getEntityKeyId(scores);
    const neighborsForMostRecentPSA = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const caseHistory = getCaseHistory(neighbors);
    const personManualCaseHistory = manualCaseHistory.get(personId, List());
    const chargeHistory = getChargeHistory(neighbors);
    const personManualChargeHistory = manualChargeHistory.get(personId, Map());
    const personSentenceHistory = sentenceHistory.get(personId, Map());
    const personFTAHistory = ftaHistory.get(personId, Map());
    const personHearings = hearings.get(personId, List());

    const modal = closePSAButtonActive === true
      ? (
        <ClosePSAModal
            scores={scores}
            entityKeyId={entityKeyId}
            open={closing}
            defaultStatus={scores.getIn([PROPERTY_TYPES.STATUS, 0])}
            defaultStatusNotes={scores.getIn([PROPERTY_TYPES.STATUS_NOTES, 0])}
            defaultFailureReasons={scores.get(PROPERTY_TYPES.FAILURE_REASON, List()).toJS()}
            onClose={() => this.setState({ closePSAButtonActive: false, closing: false, open: false })}
            onSubmit={this.handleStatusChange}
            onStatusChangeCallback={this.refreshPSANeighborsCallback} />
      )
      : (
        <PSAModal
            caseHistory={caseHistory}
            chargeHistory={chargeHistory}
            entityKeyId={mostRecentPSAEntityKeyId}
            ftaHistory={personFTAHistory}
            hearings={personHearings}
            manualCaseHistory={personManualCaseHistory}
            manualChargeHistory={personManualChargeHistory}
            neighbors={neighborsForMostRecentPSA}
            open={open}
            onClose={() => this.setState({ open: false })}
            scores={scores}
            personId={personId}
            sentenceHistory={personSentenceHistory}
            {...actions} />
      );
    return modal;
  }

  openUpdateContactModal = () => this.setState({ updateContactModalOpen: true });
  closeUpdateContactModal = () => this.setState({ updateContactModalOpen: false });

  renderContactInfoModal = () => {
    const { updateContactModalOpen } = this.state;
    const { neighbors, selectedPersonData } = this.props;
    const personId = selectedPersonData.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
    const contactInfo = neighbors.get(ENTITY_SETS.CONTACT_INFORMATION, Map());
    const email = getIdOrValue(neighbors, ENTITY_SETS.CONTACT_INFORMATION, PROPERTY_TYPES.EMAIL);
    const phone = getIdOrValue(neighbors, ENTITY_SETS.CONTACT_INFORMATION, PROPERTY_TYPES.PHONE);
    const isMobile = getIdOrValue(neighbors, ENTITY_SETS.CONTACT_INFORMATION, PROPERTY_TYPES.IS_MOBILE);
    const updatingExisting = !!contactInfo.size;
    return (
      <UpdateContactInfoModal
          contactEntity={contactInfo}
          email={email}
          isMobile={isMobile}
          personId={personId}
          phone={phone}
          updatingExisting={updatingExisting}
          onClose={this.closeUpdateContactModal}
          open={updateContactModalOpen} />
    );
  }

  openDetailsModal = () => {
    const {
      psaNeighborsById,
      mostRecentPSA,
      actions,
      personId
    } = this.props;
    const { loadHearingNeighbors, loadCaseHistory } = actions;
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const neighborsForMostRecentPSA = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const hearingIds = neighborsForMostRecentPSA.get(ENTITY_SETS.HEARINGS, List())
      .map(neighbor => neighbor.getIn([OPENLATTICE_ID_FQN, 0]))
      .filter(id => !!id)
      .toJS();
    loadCaseHistory({ personId, neighbors: neighborsForMostRecentPSA });
    loadHearingNeighbors({ hearingIds, loadPersonData: false });
    this.setState({ open: true });
  }

  renderPSA = () => {
    const {
      isFetchingPersonData,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      neighbors,
      selectedPersonData
    } = this.props;

    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const isLoading = (loadingPSAData || loadingPSAResults || isFetchingPersonData);

    return (
      <PersonPSA
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
          selectedPersonData={selectedPersonData}
          neighbors={neighbors}
          openDetailsModal={this.openDetailsModal}
          renderModal={this.renderPSADetailsModal} />
    );
  }

  renderCases = () => {
    const {
      isFetchingPersonData,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      neighbors,
      psaNeighborsById
    } = this.props;

    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const isLoading = (loadingPSAData || loadingPSAResults || isFetchingPersonData);

    return (
      <PersonCases
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
          neighbors={neighbors}
          psaNeighborsById={psaNeighborsById} />
    );
  }

  renderHearings = () => {
    const {
      hearingNeighborsById,
      hearings,
      isLoadingHearingsNeighbors,
      isLoadingJudges,
      loadingPSAData,
      loadingPSAResults,
      isFetchingPersonData,
      personId,
      psaNeighborsById,
      mostRecentPSA
    } = this.props;
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const neighborsForMostRecentPSA = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const psaId = mostRecentPSA.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.GENERAL_ID, 0], '');
    const dmfId = getIdOrValue(neighborsForMostRecentPSA, ENTITY_SETS.DMF_RESULTS);
    const context = getIdOrValue(neighborsForMostRecentPSA, ENTITY_SETS.DMF_RISK_FACTORS, PROPERTY_TYPES.CONTEXT);
    const jurisdiction = JURISDICTION[context];
    const hearingsWithOutcomes = hearingNeighborsById
      .keySeq().filter(id => hearingNeighborsById.getIn([id, ENTITY_SETS.OUTCOMES]));
    const scheduledHearings = getScheduledHearings(neighborsForMostRecentPSA);
    const pastHearings = getPastHearings(neighborsForMostRecentPSA);
    const availableHearings = getAvailableHearings(hearings, scheduledHearings, hearingNeighborsById);
    const defaultOutcome = getNeighborDetailsForEntitySet(neighborsForMostRecentPSA, ENTITY_SETS.OUTCOMES);
    const defaultDMF = getNeighborDetailsForEntitySet(neighborsForMostRecentPSA, ENTITY_SETS.DMF_RESULTS);
    const defaultBond = getNeighborDetailsForEntitySet(neighborsForMostRecentPSA, ENTITY_SETS.BONDS);
    const defaultConditions = neighborsForMostRecentPSA.get(ENTITY_SETS.RELEASE_CONDITIONS, List())
      .map(neighbor => neighbor.get(PSA_NEIGHBOR.DETAILS, Map()));

    const isLoading = (
      isLoadingHearingsNeighbors
      || isLoadingJudges
      || loadingPSAData
      || loadingPSAResults
      || isFetchingPersonData
    );

    return (
      <PersonHearings
          availableHearings={availableHearings}
          defaultBond={defaultBond}
          defaultConditions={defaultConditions}
          defaultDMF={defaultDMF}
          defaultOutcome={defaultOutcome}
          dmfId={dmfId}
          hearings={hearings}
          hearingsWithOutcomes={hearingsWithOutcomes}
          jurisdiction={jurisdiction}
          loading={isLoading}
          scheduledHearings={scheduledHearings}
          neighbors={neighborsForMostRecentPSA}
          pastHearings={pastHearings}
          personId={personId}
          psaEntityKeyId={mostRecentPSAEntityKeyId}
          psaId={psaId} />
    );
  }

  renderOverview = () => {
    const {
      actions,
      isFetchingPersonData,
      isLoadingJudges,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      neighbors,
      personId,
      psaNeighborsById,
      selectedPersonData
    } = this.props;
    const { downloadPSAReviewPDF } = actions;
    const contactInfo = neighbors.get(ENTITY_SETS.CONTACT_INFORMATION, Map());
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const neighborsForMostRecentPSA = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const scheduledHearings = getScheduledHearings(neighborsForMostRecentPSA);
    const isLoading = (isLoadingJudges || loadingPSAData || loadingPSAResults || isFetchingPersonData);
    return (
      <PersonOverview
          contactInfo={contactInfo}
          downloadPSAReviewPDF={downloadPSAReviewPDF}
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
          neighbors={neighbors}
          personId={personId}
          psaNeighborsById={psaNeighborsById}
          scheduledHearings={scheduledHearings}
          selectedPersonData={selectedPersonData}
          openDetailsModal={this.openDetailsModal}
          openUpdateContactModal={this.openUpdateContactModal} />
    );
  }

  render() {
    const { personId } = this.props;
    const overviewRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`;
    const psaRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.PSA}`;
    const hearingsRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.HEARINGS}`;
    const casesRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.CASES}`;

    const navButtons = [
      {
        path: overviewRoute,
        label: 'Overview'
      },
      {
        path: psaRoute,
        label: 'PSA'
      },
      {
        path: hearingsRoute,
        label: 'Hearings'
      },
      {
        path: casesRoute,
        label: 'Cases'
      }
    ];

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
        </ToolbarWrapper>
        { this.renderPSADetailsModal() }
        { this.renderContactInfoModal() }
        <Switch>
          <Route path={overviewRoute} render={this.renderOverview} />
          <Route path={psaRoute} render={this.renderPSA} />
          <Route path={hearingsRoute} render={this.renderHearings} />
          <Route path={casesRoute} render={this.renderCases} />
          <Redirect from={Routes.PEOPLE} to={overviewRoute} />
          <Redirect from={Routes.PERSON_DETAILS_ROOT} to={overviewRoute} />
          <Redirect from={`${Routes.PERSON_DETAILS_ROOT}/${personId}`} to={overviewRoute} />
        </Switch>
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  const court = state.get(STATE.COURT);
  const submit = state.get(STATE.SUBMIT);

  return {
    personId,
    [REVIEW.ENTITY_SET_ID]: review.get(REVIEW.ENTITY_SET_ID) || people.get(PEOPLE.SCORES_ENTITY_SET_ID),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.CASE_HISTORY]: review.get(REVIEW.CASE_HISTORY),
    [REVIEW.MANUAL_CASE_HISTORY]: review.get(REVIEW.MANUAL_CASE_HISTORY),
    [REVIEW.CHARGE_HISTORY]: review.get(REVIEW.CHARGE_HISTORY),
    [REVIEW.MANUAL_CHARGE_HISTORY]: review.get(REVIEW.MANUAL_CHARGE_HISTORY),
    [REVIEW.SENTENCE_HISTORY]: review.get(REVIEW.SENTENCE_HISTORY),
    [REVIEW.FTA_HISTORY]: review.get(REVIEW.FTA_HISTORY),
    [REVIEW.HEARINGS]: review.get(REVIEW.HEARINGS),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    [PEOPLE.FETCHING_PERSON_DATA]: people.get(PEOPLE.FETCHING_PERSON_DATA),
    [PEOPLE.PERSON_DATA]: people.get(PEOPLE.PERSON_DATA),
    [PEOPLE.NEIGHBORS]: people.getIn([PEOPLE.NEIGHBORS, personId], Map()),
    [PEOPLE.MOST_RECENT_PSA]: people.get(PEOPLE.MOST_RECENT_PSA),

    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.LOADING_JUDGES]: court.get(COURT.LOADING_JUDGES),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = {};

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonDetailsContainer);
