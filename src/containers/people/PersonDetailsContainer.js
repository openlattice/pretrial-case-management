/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Constants } from 'lattice';

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
import { getChargeHistory } from '../../utils/CaseUtils';
import { JURISDICTION } from '../../utils/consts/Consts';
import { getEntityKeyId, getIdOrValue, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import {
  APP_TYPES_FQNS,
  PROPERTY_TYPES,
  SETTINGS,
  MODULE
} from '../../utils/consts/DataModelConsts';
import {
  getScheduledHearings,
  getPastHearings,
  getAvailableHearings,
  getHearingsIdsFromNeighbors
} from '../../utils/consts/HearingConsts';
import {
  APP,
  COURT,
  STATE,
  SUBMIT,
  PEOPLE,
  REVIEW,
  PSA_NEIGHBOR,
  PSA_MODAL
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';
import * as CourtActionFactory from '../court/CourtActionFactory';
import * as PeopleActionFactory from './PeopleActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as PSAModalActionFactory from '../psamodal/PSAModalActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;
let {
  BONDS,
  CONTACT_INFORMATION,
  HEARINGS,
  OUTCOMES,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  RELEASE_CONDITIONS
} = APP_TYPES_FQNS;

BONDS = BONDS.toString();
CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();
OUTCOMES = OUTCOMES.toString();
DMF_RESULTS = DMF_RESULTS.toString();
DMF_RISK_FACTORS = DMF_RISK_FACTORS.toString();
RELEASE_CONDITIONS = RELEASE_CONDITIONS.toString();

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  entityKeyId :string,
  hearingNeighborsById :Map<*, *>,
  hearings :List<*, *>,
  hearingIds :List<*, *>,
  isLoadingHearingsNeighbors :boolean,
  isLoadingJudges :boolean,
  isFetchingPersonData :boolean,
  loadingPSAData :boolean,
  loadingPSAResults :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  mostRecentPSANeighbors :Map<*, *>,
  neighbors :Map<*, *>,
  personHearings :List<*, *>,
  personId :string,
  psaNeighborsById :Map<*, *>,
  readOnlyPermissions :boolean,
  refreshingPersonNeighbors :boolean,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  selectedPersonData :Map<*, *>,
  updatingEntity :boolean,
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
    const { actions, personId, selectedOrganizationId } = this.props;
    if (selectedOrganizationId && personId) {
      actions.checkPSAPermissions();
      actions.loadJudges();
      actions.getPersonData(personId);
      actions.getPersonNeighbors({ personId });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      actions,
      neighbors,
      personId,
      hearingIds,
      selectedOrganizationId
    } = this.props;
    const orgChanged = selectedOrganizationId !== prevProps.selectedOrganizationId;
    const personHearingIds = getHearingsIdsFromNeighbors(neighbors);
    const psaIds = getPSAIdsFromNeighbors(neighbors);
    const personChanged = (psaIds.length && !prevProps.neighbors.size && neighbors.size);
    if (selectedOrganizationId && orgChanged) {
      actions.checkPSAPermissions();
      actions.loadJudges();
      actions.getPersonData(personId);
      actions.getPersonNeighbors({ personId });
    }
    if (personChanged) {
      actions.loadPSAData(psaIds);
      actions.loadHearingNeighbors({ hearingIds: personHearingIds });
    }
    if (hearingIds.size !== prevProps.hearingIds.size) {
      actions.loadHearingNeighbors({ hearingIds: hearingIds.toJS() });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearPerson();
  }

  refreshPSANeighborsCallback = () => {
    const { actions, mostRecentPSA } = this.props;
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    actions.refreshPSANeighbors({ id: mostRecentPSAEntityKeyId });
  }

  handleStatusChange = () => {
    this.setState({ closing: false });
  }

  closeModal = () => {
    this.setState({ open: false });
  };

  openModal = () => (this.setState({ open: true }));

  renderPSADetailsModal = () => {
    const { closePSAButtonActive, closing, open } = this.state;
    const {
      actions,
      entityKeyId,
      mostRecentPSA,
      personId,
    } = this.props;

    const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map());
    const mostRecentPSAEntityKeyId = getEntityKeyId(scores);

    const modal = closePSAButtonActive === true
      ? (
        <ClosePSAModal
            scores={scores}
            entityKeyId={entityKeyId}
            open={closing}
            defaultStatus={scores.getIn([PROPERTY_TYPES.STATUS, 0])}
            defaultStatusNotes={scores.getIn([PROPERTY_TYPES.STATUS_NOTES, 0])}
            defaultFailureReasons={scores.get(PROPERTY_TYPES.FAILURE_REASON, List()).toJS()}
            openModal={this.openModal}
            onClose={() => this.setState({ closePSAButtonActive: false, closing: false, open: false })}
            onSubmit={this.handleStatusChange}
            onStatusChangeCallback={this.refreshPSANeighborsCallback} />
      )
      : (
        <PSAModal
            entityKeyId={mostRecentPSAEntityKeyId}
            open={open}
            openModal={this.openModal}
            onClose={this.closeModal}
            scores={scores}
            personId={personId}
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
    const contactInfo = neighbors.get(CONTACT_INFORMATION, List());
    const email = getIdOrValue(neighbors, CONTACT_INFORMATION, PROPERTY_TYPES.EMAIL);
    const phone = getIdOrValue(neighbors, CONTACT_INFORMATION, PROPERTY_TYPES.PHONE);
    const isMobile = getIdOrValue(neighbors, CONTACT_INFORMATION, PROPERTY_TYPES.IS_MOBILE);
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

  loadCaseHistoryCallback = (personId, psaNeighbors) => {
    const { actions } = this.props;
    const { loadCaseHistory } = actions;
    loadCaseHistory({ personId, neighbors: psaNeighbors });
  }

  openDetailsModal = () => {
    const {
      mostRecentPSA,
      actions
    } = this.props;
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    actions.loadPSAModal({ psaId: mostRecentPSAEntityKeyId, callback: this.loadCaseHistoryCallback });
    this.openModal();
  }

  renderPSA = () => {
    const {
      isFetchingPersonData,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      mostRecentPSANeighbors,
      neighbors,
      personId,
      selectedPersonData
    } = this.props;

    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const isLoading = (loadingPSAData || loadingPSAResults || isFetchingPersonData);

    return (
      <PersonPSA
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSANeighbors={mostRecentPSANeighbors}
          mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
          selectedPersonData={selectedPersonData}
          neighbors={neighbors}
          openDetailsModal={this.openDetailsModal}
          personId={personId}
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
      personHearings,
      isLoadingHearingsNeighbors,
      isLoadingJudges,
      loadingPSAData,
      loadingPSAResults,
      isFetchingPersonData,
      neighbors,
      personId,
      psaNeighborsById,
      mostRecentPSA,
      selectedOrganizationId
    } = this.props;
    const personHearingsWithOutcomes = neighbors.get(HEARINGS, List()).filter((hearing) => {
      const id = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
      const hasOutcome = !!hearingNeighborsById.getIn([id, OUTCOMES]);
      return hasOutcome;
    });
    const chargeHistory = getChargeHistory(neighbors);
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const neighborsForMostRecentPSA = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const psaId = mostRecentPSA.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.GENERAL_ID, 0], '');
    const dmfId = getIdOrValue(neighborsForMostRecentPSA, DMF_RESULTS);
    const context = getIdOrValue(neighborsForMostRecentPSA, DMF_RISK_FACTORS, PROPERTY_TYPES.CONTEXT);
    const jurisdiction = JURISDICTION[context];
    const hearingsWithOutcomes = hearingNeighborsById
      .keySeq().filter(id => hearingNeighborsById.getIn([id, OUTCOMES]));
    const scheduledHearings = getScheduledHearings(personHearingsWithOutcomes);
    const pastHearings = getPastHearings(personHearingsWithOutcomes);
    const availableHearings = getAvailableHearings(personHearings, scheduledHearings, hearingNeighborsById);
    const defaultOutcome = getNeighborDetailsForEntitySet(neighborsForMostRecentPSA, OUTCOMES);
    const defaultDMF = getNeighborDetailsForEntitySet(neighborsForMostRecentPSA, DMF_RESULTS);
    const defaultBond = getNeighborDetailsForEntitySet(neighborsForMostRecentPSA, BONDS);
    const defaultConditions = neighborsForMostRecentPSA.get(RELEASE_CONDITIONS, List())
      .map(neighbor => neighbor.get(PSA_NEIGHBOR.DETAILS, Map()));

    const isLoading = (
      isLoadingHearingsNeighbors
      || !selectedOrganizationId
      || isLoadingJudges
      || loadingPSAData
      || loadingPSAResults
      || isFetchingPersonData
    );

    return (
      <PersonHearings
          availableHearings={availableHearings}
          chargeHistory={chargeHistory}
          defaultBond={defaultBond}
          defaultConditions={defaultConditions}
          defaultDMF={defaultDMF}
          defaultOutcome={defaultOutcome}
          dmfId={dmfId}
          hearings={personHearings}
          hearingsWithOutcomes={hearingsWithOutcomes}
          jurisdiction={jurisdiction}
          loading={isLoading}
          scheduledHearings={scheduledHearings}
          neighbors={neighborsForMostRecentPSA}
          hearingNeighborsById={hearingNeighborsById}
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
      mostRecentPSANeighbors,
      neighbors,
      personId,
      psaNeighborsById,
      refreshingPersonNeighbors,
      selectedPersonData,
      readOnlyPermissions,
      selectedOrganizationId,
      selectedOrganizationSettings,
      updatingEntity
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    const { downloadPSAReviewPDF } = actions;
    const contactInfo = neighbors.get(CONTACT_INFORMATION, List());
    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const allScheduledHearings = getScheduledHearings(neighbors);
    const isLoading = (
      isLoadingJudges
      || loadingPSAData
      || loadingPSAResults
      || isFetchingPersonData
      || !selectedOrganizationId
      || !personId
    );
    return (
      <PersonOverview
          courtRemindersEnabled={courtRemindersEnabled}
          refreshingPersonNeighbors={refreshingPersonNeighbors}
          updatingEntity={updatingEntity}
          includesPretrialModule={includesPretrialModule}
          contactInfo={contactInfo}
          downloadPSAReviewPDF={downloadPSAReviewPDF}
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSANeighbors={mostRecentPSANeighbors}
          mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
          neighbors={neighbors}
          personId={personId}
          psaNeighborsById={psaNeighborsById}
          readOnlyPermissions={readOnlyPermissions}
          allScheduledHearings={allScheduledHearings}
          selectedPersonData={selectedPersonData}
          openDetailsModal={this.openDetailsModal}
          openUpdateContactModal={this.openUpdateContactModal} />
    );
  }

  render() {
    const { personId, selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const overviewRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`;
    const psaRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.PSA}`;
    const hearingsRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.HEARINGS}`;
    const casesRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.CASES}`;

    let navButtons = [
      {
        path: overviewRoute,
        label: 'Overview'
      },
      {
        path: psaRoute,
        label: 'PSA'
      }
    ];
    if (includesPretrialModule) {
      navButtons = navButtons.concat([
        {
          path: hearingsRoute,
          label: 'Hearings'
        },
        {
          path: casesRoute,
          label: 'Cases'
        }
      ]);
    }

    return (
      <DashboardMainSection>
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
        </ToolbarWrapper>
        { this.renderPSADetailsModal() }
        {/* { this.renderContactInfoModal() } */}
        {
          includesPretrialModule
            ? (
              <>
                <Switch>
                  <Route path={overviewRoute} render={this.renderOverview} />
                  <Route path={psaRoute} render={this.renderPSA} />
                  <Route path={hearingsRoute} render={this.renderHearings} />
                  <Route path={casesRoute} render={this.renderCases} />
                  <Redirect from={Routes.PEOPLE} to={overviewRoute} />
                  <Redirect from={Routes.PERSON_DETAILS_ROOT} to={overviewRoute} />
                  <Redirect from={`${Routes.PERSON_DETAILS_ROOT}/${personId}`} to={overviewRoute} />
                </Switch>
              </>
            )
            : (
              <>
                <Switch>
                  <Route path={overviewRoute} render={this.renderOverview} />
                  <Route path={psaRoute} render={this.renderPSA} />
                  <Redirect from={Routes.PEOPLE} to={overviewRoute} />
                  <Redirect from={Routes.PERSON_DETAILS_ROOT} to={overviewRoute} />
                  <Redirect from={`${Routes.PERSON_DETAILS_ROOT}/${personId}`} to={overviewRoute} />
                </Switch>
              </>
            )
        }
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const app = state.get(STATE.APP);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  const court = state.get(STATE.COURT);
  const submit = state.get(STATE.SUBMIT);
  const psaModal = state.get(STATE.PSA_MODAL);

  return {
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    personId,
    [REVIEW.ENTITY_SET_ID]: review.get(REVIEW.ENTITY_SET_ID) || people.get(PEOPLE.SCORES_ENTITY_SET_ID),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.HEARINGS]: review.get(REVIEW.HEARINGS),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    [PEOPLE.FETCHING_PERSON_DATA]: people.get(PEOPLE.FETCHING_PERSON_DATA),
    [PEOPLE.PERSON_DATA]: people.get(PEOPLE.PERSON_DATA),
    [PEOPLE.NEIGHBORS]: people.getIn([PEOPLE.NEIGHBORS, personId], Map()),
    [PEOPLE.MOST_RECENT_PSA]: people.get(PEOPLE.MOST_RECENT_PSA),
    [PEOPLE.MOST_RECENT_PSA_NEIGHBORS]: people.get(PEOPLE.MOST_RECENT_PSA_NEIGHBORS),
    [PEOPLE.REFRESHING_PERSON_NEIGHBORS]: people.get(PEOPLE.REFRESHING_PERSON_NEIGHBORS),
    personHearings: people.getIn([PEOPLE.NEIGHBORS, personId, HEARINGS], Map()),

    [PSA_MODAL.HEARING_IDS]: psaModal.get(PSA_MODAL.HEARING_IDS),

    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.LOADING_JUDGES]: court.get(COURT.LOADING_JUDGES),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false),
    [SUBMIT.UPDATING_ENTITY]: submit.get(SUBMIT.UPDATING_ENTITY, false)
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

  Object.keys(PSAModalActionFactory).forEach((action :string) => {
    actions[action] = PSAModalActionFactory[action];
  });

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonDetailsContainer);
