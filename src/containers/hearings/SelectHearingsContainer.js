/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import HearingsForm from './HearingsForm';
import { submitExistingHearing } from './HearingsActions';

import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import HearingCardsWithTitle from '../../components/hearings/HearingCardsWithTitle';
import LogoLoader from '../../components/LogoLoader';
import REVIEW_DATA from '../../utils/consts/redux/ReviewConsts';
import ReleaseConditionsContainer from '../releaseconditions/ReleaseConditionsContainer';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import { getEntityProperties } from '../../utils/DataUtils';
import { getHearingString, getPastHearings, getScheduledHearings } from '../../utils/HearingUtils';
import { Title } from '../../utils/Layout';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';

const {
  CONTACT_INFORMATION,
  OUTCOMES,
  RELEASE_CONDITIONS,
  SUBSCRIPTION
} = APP_TYPES;

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const { ENTITY_KEY_ID, CASE_ID } = PROPERTY_TYPES;

const Container = styled.div`
  width: 100%;
`;

const Wrapper = styled.div`
  max-height: 100%;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;

  span {
    font-size: 16px;
    font-weight: 600;
    color: ${OL.GREY01};
  }
`;

const StyledTitle = styled(Title)`
  margin: 0;
`;

const CreateButton = styled(Button)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
  margin: 0;
`;

type Props = {
  actions :{
    submitExistingHearing :RequestSequence;
  },
  hearingsWithOutcomes :Map;
  loadHearingNeighborsReqState :RequestState;
  neighbors :Map;
  openClosePSAModal :() => void;
  personEKID :string;
  personHearings :List;
  personNeighbors :Map;
  psaEntityKeyId :string;
  psaHearings :List;
  psaNeighbors :Map;
  readOnly :boolean;
  refreshHearingAndNeighborsReqState :RequestState;
  selectedOrganizationSettings :Map;
  submitExistingHearingReqState :RequestState;
  submitHearingReqState :RequestState;
  updateHearingReqState :RequestState;
}

type Hearing = { row :Map, hearingId :string, entityKeyId :UUID};

type State = {
  judge :?string;
  manuallyCreatingHearing :boolean;
  newHearingCourtroom :?string;
  newHearingDate :?string;
  newHearingTime :?string;
  otherJudgeText :?string;
  selectedHearing :Hearing;
  selectingReleaseConditions :boolean;
};

const INITIAL_STATE = {
  judge: null,
  manuallyCreatingHearing: false,
  newHearingCourtroom: null,
  newHearingDate: null,
  newHearingTime: null,
  otherJudgeText: null,
  selectedHearing: Map(),
  selectingReleaseConditions: false
};

class SelectHearingsContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  getSortedHearings = () :List => {
    const { psaHearings } = this.props;
    let { personHearings } = this.props;
    let hearingStrings = List();
    psaHearings.forEach((hearing) => {
      const hearingCourtString = getHearingString(hearing);
      hearingStrings = hearingStrings.push(hearingCourtString);
    });
    personHearings = personHearings.filter((hearing) => {
      const hearingCourtString = getHearingString(hearing);
      return !hearingStrings.includes(hearingCourtString);
    });
    return getScheduledHearings(personHearings);
  }

  renderNewHearingSection = () => {
    const {
      personEKID,
      psaEntityKeyId
    } = this.props;

    return (
      <HearingsForm
          backToSelection={this.backToHearingSelection}
          personEKID={personEKID}
          psaEKID={psaEntityKeyId} />
    );
  }

  manuallyCreateHearing = () => {
    this.setState({
      manuallyCreatingHearing: true,
      selectingReleaseConditions: false,
    });
  };

  selectingReleaseConditions = (row :Map, hearingId :string, entityKeyId :UUID) => {
    this.setState({
      manuallyCreatingHearing: false,
      selectingReleaseConditions: true,
      selectedHearing: { row, hearingId, entityKeyId }
    });
  };

  backToHearingSelection = () => {
    this.setState({
      manuallyCreatingHearing: false,
      selectingReleaseConditions: false,
      selectedHearing: Map()
    });
  }

  renderSelectReleaseConditions = (selectedHearing :Hearing) => {
    const { entityKeyId } = selectedHearing;
    const { openClosePSAModal } = this.props;
    return (
      <Wrapper>
        <ReleaseConditionsContainer
            openClosePSAModal={openClosePSAModal}
            backToSelection={this.backToHearingSelection}
            hearingEntityKeyId={entityKeyId} />
      </Wrapper>
    );
  }

  selectExistingHearing = (row :Map) => {
    const {
      actions,
      personEKID,
      psaEntityKeyId
    } = this.props;
    const {
      [ENTITY_KEY_ID]: hearingEKID,
      [CASE_ID]: caseId
    } = getEntityProperties(row, [ENTITY_KEY_ID, CASE_ID]);
    actions.submitExistingHearing({
      caseId,
      hearingEKID,
      personEKID,
      psaEKID: psaEntityKeyId
    });
  }

  renderAvailableHearings = (manuallyCreatingHearing :boolean) => {
    const { readOnly } = this.props;
    if (readOnly) return null;
    return (
      <div>
        <Header>
          <StyledTitle with withSubtitle>
            <span>Available Hearings</span>
            {'Select a hearing to add it to the defendant\'s schedule'}
          </StyledTitle>
          {
            !manuallyCreatingHearing
              ? <CreateButton onClick={this.manuallyCreateHearing}>Create New Hearing</CreateButton>
              : <CreateButton onClick={this.backToHearingSelection}>Back to Selection</CreateButton>
          }
        </Header>
        {
          manuallyCreatingHearing
            ? this.renderNewHearingSection()
            : (
              <HearingCardsHolder
                  hearings={this.getSortedHearings()}
                  hearingsWithOutcomes={List()}
                  handleSelect={this.selectExistingHearing} />
            )
        }
      </div>
    );
  }

  renderSubscriptionInfo = () => {
    const {
      readOnly,
      personNeighbors,
      psaNeighbors,
      selectedOrganizationSettings
    } = this.props;
    const { selectingReleaseConditions } = this.state;
    const subscription = personNeighbors.getIn([SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], Map());
    const contactInfo = personNeighbors.get(CONTACT_INFORMATION, List());
    const person = psaNeighbors.getIn([PEOPLE_FQN, PSA_NEIGHBOR.DETAILS], Map());
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    return courtRemindersEnabled && !selectingReleaseConditions
      ? (
        <SubscriptionInfo
            readOnly={readOnly}
            subscription={subscription}
            contactInfo={contactInfo}
            person={person} />
      ) : null;
  }

  renderHearings = () => {
    const { manuallyCreatingHearing, selectingReleaseConditions, selectedHearing } = this.state;
    const {
      hearingsWithOutcomes,
      loadHearingNeighborsReqState,
      neighbors,
      refreshHearingAndNeighborsReqState,
      submitExistingHearingReqState,
      submitHearingReqState,
      updateHearingReqState
    } = this.props;
    const loadingHearingsNeighbors = requestIsPending(loadHearingNeighborsReqState);
    const submittingHearing = requestIsPending(submitHearingReqState);
    const updatingHearing = requestIsPending(updateHearingReqState);
    const submittingExistingHearing = requestIsPending(submitExistingHearingReqState);
    const refreshingHearingAndNeighbors = requestIsPending(refreshHearingAndNeighborsReqState);
    const scheduledHearings = getScheduledHearings(neighbors);
    const pastHearings = getPastHearings(neighbors);
    const isLoading = (
      submittingHearing
      || updatingHearing
      || submittingExistingHearing
      || refreshingHearingAndNeighbors
      || loadingHearingsNeighbors
    );

    const loadingText = (
      submittingHearing || submittingExistingHearing || updatingHearing
    ) ? 'Submitting' : 'Reloading';
    return (
      <>
        {
          isLoading
            ? (
              <Wrapper>
                <LogoLoader loadingText={loadingText} />
              </Wrapper>
            )
            : (
              <>
                {
                  selectingReleaseConditions
                    ? null
                    : (
                      <>
                        <HearingCardsWithTitle
                            title="Scheduled Hearings"
                            hearings={scheduledHearings}
                            handleSelect={this.selectingReleaseConditions}
                            selectedHearing={selectedHearing}
                            hearingsWithOutcomes={hearingsWithOutcomes} />
                        <HearingCardsWithTitle
                            title="Past Hearings"
                            hearings={pastHearings}
                            handleSelect={this.selectingReleaseConditions}
                            selectedHearing={selectedHearing}
                            hearingsWithOutcomes={hearingsWithOutcomes} />
                      </>
                    )
                }
              </>
            )
        }
        <hr />
        { selectingReleaseConditions
          ? this.renderSelectReleaseConditions(selectedHearing)
          : this.renderAvailableHearings(manuallyCreatingHearing)}
      </>
    );
  }

  render() {
    return (
      <Container>
        { this.renderSubscriptionInfo() }
        { this.renderHearings() }
      </Container>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  const hearings = state.get(STATE.HEARINGS);
  const review = state.get(STATE.REVIEW);
  const hearingNeighborsById = hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID);
  const hearingsWithOutcomes = hearingNeighborsById
    .keySeq().filter((hearingEKID) => (
      hearingNeighborsById.getIn([hearingEKID, OUTCOMES], Map()).size
        || hearingNeighborsById.getIn([hearingEKID, RELEASE_CONDITIONS], List()).size
    ));
  return {
    app,
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS, Map()),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.get(APP_DATA.ENTITY_SETS_BY_ORG, Map()),
    [APP_DATA.FQN_TO_ID]: app.get(APP_DATA.FQN_TO_ID),

    submitExistingHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING),
    submitHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.SUBMIT_HEARING),
    updateHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.UPDATE_HEARING),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    refreshHearingAndNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS),
    hearingNeighborsById,
    hearingsWithOutcomes,

    [REVIEW_DATA.SCORES]: review.get(REVIEW_DATA.SCORES),
    [REVIEW_DATA.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW_DATA.PSA_NEIGHBORS_BY_ID)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    submitExistingHearing
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(SelectHearingsContainer);
