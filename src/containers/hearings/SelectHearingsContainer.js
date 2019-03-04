/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import CaseHistoryList from '../../components/casehistory/CaseHistoryList';
import InfoButton from '../../components/buttons/InfoButton';
import HearingCardsWithTitle from '../../components/hearings/HearingCardsWithTitle';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import NewHearingSection from '../../components/hearings/NewHearingSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import SelectReleaseConditions from '../../components/releaseconditions/SelectReleaseConditions';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import { getEntitySetId } from '../../utils/AppUtils';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES_FQNS, PROPERTY_TYPES, SETTINGS } from '../../utils/consts/DataModelConsts';
import { Title } from '../../utils/Layout';
import {
  formatJudgeName,
  getScheduledHearings,
  getPastHearings,
  getHearingFields
} from '../../utils/consts/HearingConsts';
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
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';

let {
  ASSESSED_BY,
  BONDS,
  PRETRIAL_CASES,
  CONTACT_INFORMATION,
  DMF_RISK_FACTORS,
  HEARINGS,
  OUTCOMES,
  RELEASE_CONDITIONS,
  JUDGES,
  SUBSCRIPTION
} = APP_TYPES_FQNS;

ASSESSED_BY = ASSESSED_BY.toString();
BONDS = BONDS.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();
CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
DMF_RISK_FACTORS = DMF_RISK_FACTORS.toString();
HEARINGS = HEARINGS.toString();
OUTCOMES = OUTCOMES.toString();
RELEASE_CONDITIONS = RELEASE_CONDITIONS.toString();
JUDGES = JUDGES.toString();
SUBSCRIPTION = SUBSCRIPTION.toString();
const PEOPLE_FQN = APP_TYPES_FQNS.PEOPLE.toString();

const { OPENLATTICE_ID_FQN } = Constants;


const Container = styled.div`
  hr {
    margin: 30px -30px;
    width: calc(100% + 60px);
  }
`;

const ChargeTableContainer = styled.div`
  text-align: center;
  width: 100%;
  margin: 0;
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


const SubmittingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    margin: 20px 0;
    color: ${OL.GREY15};
  }
`;

type Props = {
  allJudges :List<*, *>,
  app :Map<*, *>,
  chargeHistory :Map<*, *>,
  defaultBond :Map<*, *>,
  defaultConditions :Map<*, *>,
  defaultDMF :Map<*, *>,
  dmfId :string,
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
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  updatingEntity :boolean,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshHearingNeighbors :({ id :string }) => void,
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
  refreshPSANeighborsCallback :() => void,
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
      const { hearingCourtString } = getHearingFields(hearing);
      hearingStrings = hearingStrings.push(hearingCourtString);
    });
    personHearings = personHearings.filter((hearing) => {
      const { hearingCourtString } = getHearingFields(hearing);
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
    actions.refreshHearingNeighbors({ id: selectedHearing.entityKeyId });
    if (psaEntityKeyId) actions.refreshPSANeighbors({ id: psaEntityKeyId });
  }

  renderChargeTable = () => {
    const { selectedHearing } = this.state;
    const {
      chargeHistory,
      hearingNeighborsById,
    } = this.props;
    const { entityKeyId } = selectedHearing;
    const hearingNeighbors = hearingNeighborsById.get(entityKeyId, Map());
    const associatedCasesForForPSA = fromJS([hearingNeighbors.getIn([PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS], Map())]);
    return associatedCasesForForPSA.size
      ? (
        <ChargeTableContainer>
          <CaseHistoryList
              isCompact
              pendingCases
              caseHistory={associatedCasesForForPSA}
              chargeHistory={chargeHistory} />
        </ChargeTableContainer>
      ) : null;
  }

  renderSelectReleaseCondtions = (selectedHearing) => {
    const {
      allJudges,
      actions,
      app,
      defaultBond,
      defaultConditions,
      defaultDMF,
      dmfId,
      psaHearings,
      neighbors,
      personId,
      psaId,
      refreshPSANeighborsCallback,
      hearingNeighborsById,
      hearingIdsRefreshing,
      selectedOrganizationId,
      submitting
    } = this.props;
    const {
      deleteEntity,
      replaceAssociation,
      replaceEntity,
      submit,
      updateOutcomesAndReleaseCondtions
    } = actions;
    let outcome;
    let bond;
    let conditions;

    let judgeName;
    let judgeEntitySetId = getEntitySetId(app, ASSESSED_BY, selectedOrganizationId);
    const { hearingId, entityKeyId } = selectedHearing;
    const hearing = psaHearings
      .filter(hearingObj => (hearingObj.getIn([OPENLATTICE_ID_FQN, 0]) === entityKeyId))
      .get(0);

    const hasMultipleHearings = hearingNeighborsById.size > 1;
    const oldDataOutcome = defaultDMF.getIn([PROPERTY_TYPES.OUTCOME, 0]);
    const onlyOldExists = oldDataOutcome && !hearingNeighborsById.getIn([entityKeyId, OUTCOMES]);

    if (onlyOldExists) {
      outcome = defaultDMF;
      bond = defaultBond;
      conditions = defaultConditions;
    }
    else {
      outcome = hearingNeighborsById.getIn([entityKeyId, OUTCOMES], Map());
      bond = hearingNeighborsById.getIn([entityKeyId, BONDS], Map());
      conditions = hearingNeighborsById
        .getIn([entityKeyId, RELEASE_CONDITIONS], Map());
    }
    const submittedOutcomes = (onlyOldExists && hasMultipleHearings)
      ? false
      : !!(hearingNeighborsById.getIn([entityKeyId, OUTCOMES]) || oldDataOutcome);
    const judgeFromJudgeEntity = hearingNeighborsById.getIn([
      entityKeyId,
      JUDGES
    ]);
    const judgeFromHearingComments = hearing.getIn([PROPERTY_TYPES.HEARING_COMMENTS, 0]);
    if (judgeFromJudgeEntity) {
      const judgeEntity = judgeFromJudgeEntity.get(PSA_NEIGHBOR.DETAILS);
      judgeName = formatJudgeName(judgeEntity);
      judgeEntitySetId = judgeFromJudgeEntity.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
    }
    else {
      judgeName = judgeFromHearingComments;
    }

    const psaContext = neighbors
      .getIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0]);
    const jurisdiction = JURISDICTION[psaContext];

    return (
      <Wrapper withPadding>
        <SelectReleaseConditions
            renderCharges={this.renderChargeTable}
            selectedOrganizationId={selectedOrganizationId}
            app={app}
            submitting={submitting}
            submittedOutcomes={submittedOutcomes}
            jurisdiction={jurisdiction}
            judgeEntity={judgeFromJudgeEntity}
            judgeEntitySetId={judgeEntitySetId}
            judgeName={judgeName}
            allJudges={allJudges}
            neighbors={neighbors}
            personId={personId}
            psaId={psaId}
            dmfId={dmfId}
            submit={submit}
            replace={replaceEntity}
            replaceAssociation={replaceAssociation}
            deleteEntity={deleteEntity}
            submitCallback={refreshPSANeighborsCallback}
            updateFqn={updateOutcomesAndReleaseCondtions}
            refreshHearingsNeighborsCallback={this.refreshHearingsNeighborsCallback}
            hearingIdsRefreshing={hearingIdsRefreshing}
            hearingId={hearingId}
            hearingEntityKeyId={entityKeyId}
            hearing={hearing}
            backToSelection={this.backToHearingSelection}
            defaultOutcome={outcome}
            defaultDMF={defaultDMF}
            defaultBond={bond}
            defaultConditions={conditions} />
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
      hearingNeighborsById
    } = this.props;
    const hearingsWithOutcomes = hearingNeighborsById
      .keySeq().filter(id => hearingNeighborsById.getIn([id, OUTCOMES]));
    const scheduledHearings = getScheduledHearings(neighbors);
    const pastHearings = getPastHearings(neighbors);
    return (
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
        <hr />
        { selectingReleaseConditions
          ? this.renderSelectReleaseCondtions(selectedHearing)
          : this.renderAvailableHearings(manuallyCreatingHearing, scheduledHearings)
        }
      </>
    );
  }

  render() {
    const {
      hearingIdsRefreshing,
      submitting,
      psaIdsRefreshing,
      refreshingNeighbors,
      replacingAssociation,
      replacingEntity
    } = this.props;
    const isLoading = (submitting
      || replacingEntity
      || replacingAssociation
      || refreshingNeighbors
      || psaIdsRefreshing.size
      || hearingIdsRefreshing);

    return (
      <Container>
        {this.renderSubscriptionInfo()}
        {
          isLoading
            ? (
              <Wrapper>
                <SubmittingWrapper>
                  <span>{ (submitting || replacingEntity || replacingAssociation) ? 'Submitting' : 'Reloading' }</span>
                  <LoadingSpinner />
                </SubmittingWrapper>
              </Wrapper>
            )
            : this.renderHearings()
        }
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

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectHearingsContainer);
