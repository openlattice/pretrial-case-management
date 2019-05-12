/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { List, Map, Set } from 'immutable';

import InfoButton from '../../components/buttons/InfoButton';
import HearingCardsWithTitle from '../../components/hearings/HearingCardsWithTitle';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import NewHearingSection from '../../components/hearings/NewHearingSection';
import LogoLoader from '../../components/LogoLoader';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import ReleaseConditionsContainer from '../releaseconditions/ReleaseConditionsContainer';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getScheduledHearings, getPastHearings, getHearingString } from '../../utils/HearingUtils';
import { OL } from '../../utils/consts/Colors';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { Title } from '../../utils/Layout';
import {
  FORM_IDS,
  ID_FIELD_NAMES,
  HEARING,
  JURISDICTION
} from '../../utils/consts/Consts';
import {
  APP,
  STATE,
  SUBMIT,
  REVIEW,
  COURT,
  PEOPLE,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';

import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as HearingsActionFactory from './HearingsActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

const {
  CONTACT_INFORMATION,
  DMF_RISK_FACTORS,
  OUTCOMES,
  SUBSCRIPTION
} = APP_TYPES;

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const Container = styled.div`
  hr {
    margin: 30px -30px;
    width: calc(100% + 60px);
  }
`;

const Wrapper = styled.div`
  max-height: 100%;
  margin: -30px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: ${OL.GREY01};
  }
`;

const StyledTitle = styled(Title)`
  margin: 0;
`;

const CreateButton = styled(InfoButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
  margin: 0;
`;

type Props = {
  app :Map<*, *>,
  psaHearings :List<*, *>,
  personHearings :List<*, *>,
  hearingIdsRefreshing :Set<*, *>,
  hearingNeighborsById :Map<*, *>,
  neighbors :Map<*, *>,
  psaIdsRefreshing :Map<*, *>,
  psaId :string,
  psaEntityKeyId :string,
  personId :string,
  psaNeighbors :Map<*, *>,
  submitting :boolean,
  context :string,
  refreshingNeighbors :boolean,
  refreshingPersonNeighbors :boolean,
  readOnly :boolean,
  replacingAssociation :boolean,
  replacingEntity :boolean,
  personNeighbors :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
  updatingEntity :boolean,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshHearingAndNeighbors :({ hearingEntityKeyId :string }) => void,
    replaceAssociation :(values :{
      associationEntity :Map<*, *>,
      associationEntityName :string,
      associationEntityKeyId :string,
      srcEntityName :string,
      srcEntityKeyId :string,
      dstEntityName :string,
      dstEntityKeyId :string,
      callback :() => void
    }) => void
  },
  onSubmit? :(hearing :Object) => void
}

type State = {
  manuallyCreatingHearing :boolean,
  newHearingDate :?string,
  newHearingTime :?string,
  newHearingCourtroom :?string,
  selectedHearing :Object,
  judge :string,
  otherJudgeText :string,
  selectingReleaseConditions :boolean
};

class SelectHearingsContainer extends React.Component<Props, State> {

  static defaultProps = {
    onSubmit: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      manuallyCreatingHearing: false,
      selectedHearing: Map(),
      selectingReleaseConditions: false
    };
  }

  getSortedHearings = () => {
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
    const { manuallyCreatingHearing } = this.state;
    const {
      neighbors,
      context,
      personId,
      psaId,
      psaEntityKeyId
    } = this.props;
    const psaContext = neighbors
      ? neighbors.getIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0])
      : context;
    const jurisdiction = JURISDICTION[psaContext];

    return (
      <NewHearingSection
          personId={personId}
          psaEntityKeyId={psaEntityKeyId}
          psaId={psaId}
          manuallyCreatingHearing={manuallyCreatingHearing}
          jurisdiction={jurisdiction}
          afterSubmit={this.backToHearingSelection} />
    );
  }

  manuallyCreateHearing = () => {
    this.setState({
      manuallyCreatingHearing: true,
      selectingReleaseConditions: false,
    });
  };

  selectingReleaseConditions = (row, hearingId, entityKeyId) => {
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

  refreshHearingsNeighborsCallback = () => {
    const { selectedHearing } = this.state;
    const { actions, psaEntityKeyId } = this.props;
    actions.refreshHearingAndNeighbors({ id: selectedHearing.entityKeyId });
    if (psaEntityKeyId) actions.refreshPSANeighbors({ id: psaEntityKeyId });
  }

  renderSelectReleaseCondtions = (selectedHearing) => {
    const { entityKeyId } = selectedHearing;
    return (
      <Wrapper withPadding>
        <ReleaseConditionsContainer
            backToSelection={this.backToHearingSelection}
            hearingEntityKeyId={entityKeyId} />
      </Wrapper>
    );
  }
  selectHearing = (hearingDetails) => {
    const {
      app,
      psaId,
      personId,
      actions
    } = this.props;

    const values = Object.assign({}, hearingDetails, {
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [FORM_IDS.PERSON_ID]: personId
    });

    actions.submit({
      app,
      values,
      config: psaHearingConfig,
      callback: this.refreshHearingsNeighborsCallback
    });
  }

  selectExistingHearing = (row, hearingId) => {
    const {
      actions,
      app,
      onSubmit,
      psaId
    } = this.props;
    const values = {
      [ID_FIELD_NAMES.HEARING_ID]: hearingId,
      [ID_FIELD_NAMES.PSA_ID]: psaId,
    };
    actions.submit({
      app,
      values,
      config: psaHearingConfig,
      callback: this.refreshHearingsNeighborsCallback
    });
    onSubmit({
      [ID_FIELD_NAMES.HEARING_ID]: hearingId,
      [HEARING.DATE_TIME]: row.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''),
      [HEARING.COURTROOM]: row.getIn([PROPERTY_TYPES.COURTROOM, 0], '')
    });
  }

  renderAvailableHearings = (manuallyCreatingHearing, scheduledHearings) => {
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
                  hearings={this.getSortedHearings(scheduledHearings)}
                  handleSelect={this.selectExistingHearing} />
            )
        }
      </div>
    );
  }

  renderSubscriptionInfo = () => {
    const {
      refreshingPersonNeighbors,
      readOnly,
      personNeighbors,
      psaNeighbors,
      selectedOrganizationSettings,
      updatingEntity,
    } = this.props;
    const subscription = personNeighbors.getIn([SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], Map());
    const contactInfo = personNeighbors.get(CONTACT_INFORMATION, List());
    const person = psaNeighbors.getIn([PEOPLE_FQN, PSA_NEIGHBOR.DETAILS], Map());
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    return courtRemindersEnabled
      ? (
        <SubscriptionInfo
            refreshingPersonNeighbors={refreshingPersonNeighbors}
            updatingEntity={updatingEntity}
            readOnly={readOnly}
            subscription={subscription}
            contactInfo={contactInfo}
            person={person} />
      ) : null;
  }

  renderHearings = () => {
    const { manuallyCreatingHearing, selectingReleaseConditions, selectedHearing } = this.state;
    const {
      neighbors,
      hearingNeighborsById,
      hearingIdsRefreshing,
      submitting,
      psaIdsRefreshing,
      refreshingNeighbors,
      replacingAssociation,
      replacingEntity
    } = this.props;
    const hearingsWithOutcomes = hearingNeighborsById
      .keySeq().filter(id => hearingNeighborsById.getIn([id, OUTCOMES]));
    const scheduledHearings = getScheduledHearings(neighbors);
    const pastHearings = getPastHearings(neighbors);
    const isLoading = (submitting
      || replacingEntity
      || replacingAssociation
      || refreshingNeighbors
      || psaIdsRefreshing.size
      || hearingIdsRefreshing);

    const loadingText = (submitting || replacingEntity || replacingAssociation) ? 'Submitting' : 'Reloading';
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
        <hr />
        { selectingReleaseConditions
          ? this.renderSelectReleaseCondtions(selectedHearing)
          : this.renderAvailableHearings(manuallyCreatingHearing, scheduledHearings)
        }
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
  const orgId = app.get(APP.SELECTED_ORG_ID, '');
  const court = state.get(STATE.COURT);
  const review = state.get(STATE.REVIEW);
  const submit = state.get(STATE.SUBMIT);
  return {
    app,
    [APP.SELECTED_ORG_ID]: orgId,
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS, Map()),
    [APP.ENTITY_SETS_BY_ORG]: app.get(APP.ENTITY_SETS_BY_ORG, Map()),
    [APP.FQN_TO_ID]: app.get(APP.FQN_TO_ID),

    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),

    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),

    [PEOPLE.REFRESH_PERSON_NEIGHBORS]: review.get(PEOPLE.REFRESH_PERSON_NEIGHBORS),

    [SUBMIT.REPLACING_ENTITY]: submit.get(SUBMIT.REPLACING_ENTITY),
    [SUBMIT.REPLACING_ASSOCIATION]: submit.get(SUBMIT.REPLACING_ASSOCIATION),
    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING),
    [SUBMIT.UPDATING_ENTITY]: submit.get(SUBMIT.UPDATING_ENTITY)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(HearingsActionFactory).forEach((action :string) => {
    actions[action] = HearingsActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectHearingsContainer);
