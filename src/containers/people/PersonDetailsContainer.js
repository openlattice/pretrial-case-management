/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestState } from 'redux-reqseq';
import { Map, List } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Constants } from 'lattice';

import { faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import AboutPersonGeneral from '../../components/person/AboutPersonGeneral';
import ClosePSAModal from '../../components/review/ClosePSAModal';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import LogoLoader from '../../components/LogoLoader';
import PersonOverview from '../../components/people/PersonOverview';
import PersonPSA from '../../components/people/PersonPSA';
import PersonHearings from '../../components/people/PersonHearings';
import PersonCases from '../../components/people/PersonCases';
import PSAModal from '../psamodal/PSAModal';
import ViewMoreLink from '../../components/buttons/ViewMoreLink';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { getMostRecentPSA } from '../../utils/PSAUtils';
import { getChargeHistory } from '../../utils/CaseUtils';
import { JURISDICTION } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  getEntityProperties,
  getEntityKeyId,
  getIdOrValue,
  getNeighborDetailsForEntitySet
} from '../../utils/DataUtils';
import {
  getScheduledHearings,
  getPastHearings,
  getAvailableHearings
} from '../../utils/HearingUtils';
import {
  SUBMIT,
  REVIEW,
  PSA_NEIGHBOR,
  PSA_MODAL
} from '../../utils/consts/FrontEndStateConsts';

// Redux State Imports
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

import * as Routes from '../../core/router/Routes';
import { loadHearingNeighbors } from '../hearings/HearingsActions';
import { clearPerson, getPersonData, getPeopleNeighbors } from './PeopleActions';
import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import { checkPSAPermissions, loadPSAData } from '../review/ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  BONDS,
  CONTACT_INFORMATION,
  HEARINGS,
  OUTCOMES,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  RELEASE_CONDITIONS,
  REMINDERS,
  MANUAL_REMINDERS,
  SPEAKER_RECOGNITION_PROFILES,
  PSA_SCORES
} = APP_TYPES;

const {
  STATUS,
  STATUS_NOTES,
  FAILURE_REASON
} = PROPERTY_TYPES;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const PathContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const IconContainer = styled.div`
  padding: 10px;
`;

type Props = {
  entityKeyId :UUID,
  entitySetsByOrganization :Map<*, *>,
  getPeopleNeighborsRequestState :RequestState,
  getPersonDataRequestState :RequestState,
  hearingNeighborsById :Map<*, *>,
  hearingIds :List<*, *>,
  isLoadingHearingsNeighbors :boolean,
  isFetchingPersonData :boolean,
  loadingPSAData :boolean,
  loadingPSAResults :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEKID :UUID,
  peopleNeighborsById :Map<*, *>,
  personHearings :List<*, *>,
  personId :string,
  psaNeighborsById :Map<*, *>,
  readOnlyPermissions :boolean,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  selectedPersonData :Map<*, *>,
  updatingEntity :boolean,
  actions :{
    getPersonData :(personId :string) => void,
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
    checkPSAPermissions :() => void,
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
      closePSAButtonActive: false
    };
  }

  componentDidMount() {
    const { actions, personId, selectedOrganizationId } = this.props;
    if (selectedOrganizationId && personId) {
      actions.checkPSAPermissions();
      actions.getPersonData(personId);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      actions,
      personId,
      hearingIds,
      peopleNeighborsById,
      selectedPersonData,
      selectedOrganizationId
    } = this.props;
    const orgChanged = selectedOrganizationId !== prevProps.selectedOrganizationId;
    const personEKID = getEntityKeyId(selectedPersonData);
    const prevPersonEKID = getEntityKeyId(prevProps.selectedPersonData);
    const personNeighbors = peopleNeighborsById.get(personEKID, Map());
    const personHearingIds = personNeighbors.get(HEARINGS, List()).map(hearing => getEntityKeyId(hearing)).toJS();
    const psaIds = personNeighbors.get(PSA_SCORES, List()).map(hearing => getEntityKeyId(hearing)).toJS();
    if (selectedOrganizationId && orgChanged) {
      actions.checkPSAPermissions();
      actions.getPersonData(personId);
    }
    if (!personNeighbors.size && personEKID !== prevPersonEKID) {
      actions.getPeopleNeighbors({ peopleEKIDS: [personEKID] });
    }
    if (personNeighbors.size && personEKID !== prevPersonEKID) {
      let scoresAsMap = Map();
      personNeighbors.get(APP_TYPES.PSA_SCORES, List()).forEach((score) => {
        const {
          [PROPERTY_TYPES.ENTITY_KEY_ID]: psaEntityKeyId
        } = getEntityProperties(score, [PROPERTY_TYPES.ENTITY_KEY_ID]);
        scoresAsMap = scoresAsMap.set(psaEntityKeyId, score);
      });
      actions.loadPSAData({ psaIds, scoresAsMap });
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
      entityKeyId,
      mostRecentPSA,
      mostRecentPSAEKID
    } = this.props;

    const {
      [STATUS]: psaStatus,
      [STATUS_NOTES]: psaNotes,
      [FAILURE_REASON]: failureReason
    } = getEntityProperties(mostRecentPSA, [STATUS, STATUS_NOTES, FAILURE_REASON]);

    const modal = closePSAButtonActive === true
      ? (
        <ClosePSAModal
            scores={mostRecentPSA}
            entityKeyId={entityKeyId}
            open={closing}
            defaultStatus={psaStatus}
            defaultStatusNotes={psaNotes}
            defaultFailureReasons={failureReason}
            openModal={this.openModal}
            onClose={() => this.setState({ closePSAButtonActive: false, closing: false, open: false })}
            onSubmit={this.handleStatusChange} />
      )
      : (
        <PSAModal
            entityKeyId={mostRecentPSAEKID}
            open={open}
            openModal={this.openModal}
            onClose={this.closeModal} />
      );
    return modal;
  }

  loadCaseHistoryCallback = (personId, psaNeighbors) => {
    const { actions } = this.props;
    const { loadCaseHistory } = actions;
    loadCaseHistory({ personId, neighbors: psaNeighbors });
  }

  openDetailsModal = () => {
    const { actions, mostRecentPSAEKID } = this.props;
    actions.loadPSAModal({ psaId: mostRecentPSAEKID, callback: this.loadCaseHistoryCallback });
    this.openModal();
  }

  renderPSA = () => {
    const {
      isFetchingPersonData,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      mostRecentPSAEKID,
      personId,
      psaNeighborsById,
      peopleNeighborsById,
      selectedPersonData
    } = this.props;
    const personEKID = getEntityKeyId(selectedPersonData);
    const personNeighbors = peopleNeighborsById.get(personEKID, Map());
    const mostRecentPSANeighbors = psaNeighborsById.get(mostRecentPSAEKID, Map());

    const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
    const isLoading = (loadingPSAData || loadingPSAResults || isFetchingPersonData);

    return (
      <PersonPSA
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSANeighbors={mostRecentPSANeighbors}
          mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
          selectedPersonData={selectedPersonData}
          neighbors={personNeighbors}
          openDetailsModal={this.openDetailsModal}
          personId={personId}
          personEKID={personEKID}
          renderModal={this.renderPSADetailsModal} />
    );
  }

  renderCases = () => {
    const {
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      mostRecentPSAEKID,
      psaNeighborsById,
      peopleNeighborsById,
      selectedPersonData
    } = this.props;
    const personEKID = getEntityKeyId(selectedPersonData);
    const personNeighbors = peopleNeighborsById.get(personEKID, Map());
    const isLoading = (loadingPSAData || loadingPSAResults);

    return (
      <PersonCases
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSAEntityKeyId={mostRecentPSAEKID}
          neighbors={personNeighbors}
          psaNeighborsById={psaNeighborsById} />
    );
  }

  renderHearings = () => {
    const {
      hearingNeighborsById,
      personHearings,
      isFetchingPersonData,
      isLoadingHearingsNeighbors,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      mostRecentPSAEKID,
      peopleNeighborsById,
      personId,
      psaNeighborsById,
      selectedOrganizationId,
      selectedPersonData
    } = this.props;
    const personEKID = getEntityKeyId(selectedPersonData);
    const personNeighbors = peopleNeighborsById.get(personEKID, Map());
    const personHearingsWithOutcomes = personNeighbors.get(APP_TYPES.HEARINGS, List()).filter((hearing) => {
      const id = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
      const hasOutcome = !!hearingNeighborsById.getIn([id, OUTCOMES]);
      return hasOutcome;
    });
    const chargeHistory = getChargeHistory(personNeighbors);
    const neighborsForMostRecentPSA = psaNeighborsById.get(mostRecentPSAEKID, Map());
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
          personEKID={personEKID}
          psaEntityKeyId={mostRecentPSAEKID}
          psaId={psaId} />
    );
  }

  renderOverview = () => {
    const {
      actions,
      entitySetsByOrganization,
      getPersonDataRequestState,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      mostRecentPSAEKID,
      peopleNeighborsById,
      personId,
      psaNeighborsById,
      readOnlyPermissions,
      selectedOrganizationId,
      selectedOrganizationSettings,
      selectedPersonData,
      updatingEntity,
    } = this.props;
    const personEKID = getEntityKeyId(selectedPersonData);
    const personNeighbors = peopleNeighborsById.get(personEKID, Map());
    const personContactInfo = personNeighbors.get(CONTACT_INFORMATION, List());
    const personManualReminders = personNeighbors.get(MANUAL_REMINDERS, List());
    const personReminders = personNeighbors.get(REMINDERS, List());
    const personVoiceProfile = personNeighbors.get(SPEAKER_RECOGNITION_PROFILES, Map());
    const allReminders = personReminders.concat(personManualReminders);
    const mostRecentPSANeighbors = psaNeighborsById.get(mostRecentPSAEKID, Map());

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const settingsIncludeVoiceEnroll = selectedOrganizationSettings.get(SETTINGS.ENROLL_VOICE, false);
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    const { downloadPSAReviewPDF } = actions;
    const allScheduledHearings = getScheduledHearings(personNeighbors);
    const loadingPersonData = requestIsPending(getPersonDataRequestState);
    const isLoading = (
      loadingPSAData
      || loadingPSAResults
      || loadingPersonData
      || !selectedOrganizationId
      || !personId
    );
    return (
      <PersonOverview
          courtRemindersEnabled={courtRemindersEnabled}
          entitySetIdsToAppType={entitySetsByOrganization.get(selectedOrganizationId, Map())}
          updatingEntity={updatingEntity}
          includesPretrialModule={includesPretrialModule}
          contactInfo={personContactInfo}
          downloadPSAReviewPDF={downloadPSAReviewPDF}
          loading={isLoading}
          mostRecentPSA={mostRecentPSA}
          mostRecentPSANeighbors={mostRecentPSANeighbors}
          mostRecentPSAEntityKeyId={mostRecentPSAEKID}
          neighbors={personNeighbors}
          personId={personId}
          personReminders={allReminders}
          personVoiceProfile={personVoiceProfile}
          psaNeighborsById={psaNeighborsById}
          readOnlyPermissions={readOnlyPermissions}
          allScheduledHearings={allScheduledHearings}
          selectedPersonData={selectedPersonData}
          settingsIncludeVoiceEnroll={settingsIncludeVoiceEnroll}
          openDetailsModal={this.openDetailsModal} />
    );
  }

  renderLinkPath = () => {
    const { personId, selectedPersonData } = this.props;

    const { firstMidLast } = formatPeopleInfo(selectedPersonData);
    const overviewRoute = `${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.OVERVIEW}`;

    return (
      <PathContainer>
        <ViewMoreLink to={Routes.PEOPLE}>Manage People</ViewMoreLink>
        <IconContainer>
          <FontAwesomeIcon small="true" icon={faChevronRight} color={OL.PURPLE02} />
        </IconContainer>
        <ViewMoreLink to={overviewRoute}>{firstMidLast}</ViewMoreLink>
      </PathContainer>
    );
  }

  render() {
    const {
      personId,
      selectedOrganizationSettings,
      selectedPersonData,
      getPeopleNeighborsRequestState,
      getPersonDataRequestState,
      loadingPSAData
    } = this.props;

    const loadingPersonData = requestIsPending(getPersonDataRequestState);
    const loadingPersonNieghbors = requestIsPending(getPeopleNeighborsRequestState);
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

    const routeOptions = includesPretrialModule
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
      );

    return (
      <DashboardMainSection>
        { this.renderLinkPath() }
        <AboutPersonGeneral selectedPersonData={selectedPersonData} />
        <ToolbarWrapper>
          <NavButtonToolbar options={navButtons} />
        </ToolbarWrapper>
        { this.renderPSADetailsModal() }
        {
          loadingPersonData || loadingPersonNieghbors || loadingPSAData
            ? <LogoLoader loadingText="Loading Person Details..." />
            : routeOptions
        }
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  const people = state.get(STATE.PEOPLE);
  const psaModal = state.get(STATE.PSA_MODAL);
  const review = state.get(STATE.REVIEW);
  const submit = state.get(STATE.SUBMIT);
  const person = people.get(PEOPLE_DATA.PERSON_DATA);
  const personEKID = getEntityKeyId(person);
  const personNeighbors = people.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], Map());
  const personPSAs = personNeighbors.get(PSA_SCORES, List());
  const { mostRecentPSA, mostRecentPSAEKID } = getMostRecentPSA(personPSAs);

  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.get(APP_DATA.ENTITY_SETS_BY_ORG),

    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    getPersonDataRequestState: getReqState(people, PEOPLE_ACTIONS.GET_PERSON_DATA),
    getPeopleNeighborsRequestState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PERSON_DATA]: people.get(PEOPLE_DATA.PERSON_DATA),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map()),
    personHearings: people.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, APP_TYPES.HEARINGS], Map()),
    mostRecentPSA,
    mostRecentPSAEKID,

    personId,
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.HEARINGS]: review.get(REVIEW.HEARINGS),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    [PSA_MODAL.HEARING_IDS]: psaModal.get(PSA_MODAL.HEARING_IDS),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false),
    [SUBMIT.UPDATING_ENTITY]: submit.get(SUBMIT.UPDATING_ENTITY, false)
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // HearingsActions
    loadHearingNeighbors,
    // People Actions
    clearPerson,
    getPeopleNeighbors,
    getPersonData,
    // Review Actions
    checkPSAPermissions,
    loadPSAData,
    // PSA Modal Actions
    loadPSAModal,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonDetailsContainer);
