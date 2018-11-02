/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';

import InfoButton from '../../components/buttons/InfoButton';
import HearingCardsWithTitle from '../../components/hearings/HearingCardsWithTitle';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import NewHearingSection from '../../components/hearings/NewHearingSection';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import SelectReleaseConditions from '../../components/releaseconditions/SelectReleaseConditions';
import { OL } from '../../utils/consts/Colors';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { Title } from '../../utils/Layout';
import {
  HEARING_CONSTS,
  formatJudgeName,
  getHearingsIdsFromNeighbors,
  getScheduledHearings,
  getPastHearings
} from '../../utils/consts/HearingConsts';
import {
  FORM_IDS,
  ID_FIELD_NAMES,
  HEARING,
  HEARING_TYPES,
  JURISDICTION
} from '../../utils/consts/Consts';
import {
  STATE,
  REVIEW,
  COURT,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;


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

const SubmittedPSAWrapper = styled.div`
  margin: 30px;
`;

const StyledTitle = styled(Title)`
  margin: 0;
`;

const CreateButton = styled(InfoButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
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
  defaultBond :Map<*, *>,
  defaultConditions :Map<*, *>,
  defaultDMF :Map<*, *>,
  dmfId :string,
  hearings :List<*, *>,
  hearingIdsRefreshing :Set<*, *>,
  hearingNeighborsById :Map<*, *>,
  neighbors :Map<*, *>,
  psaId :string,
  psaNeighborsById :Map<*, *>,
  psaEntityKeyId :string,
  personId :string,
  submitting :boolean,
  PSASubmittedPage :boolean,
  context :string,
  refreshingNeighbors :boolean,
  readOnly :boolean,
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
      newHearingCourtroom: undefined,
      newHearingDate: undefined,
      newHearingTime: undefined,
      judge: '',
      otherJudgeText: '',
      selectedHearing: Map(),
      selectingReleaseConditions: false
    };
  }

  componentWillReceiveProps = (nextProps) => {
    const { neighbors, actions } = this.props;
    const { loadHearingNeighbors } = actions;
    const nextNeighbors = nextProps.neighbors;
    if (neighbors.size !== nextNeighbors.size) {
      const hearingIds = getHearingsIdsFromNeighbors(nextNeighbors);
      loadHearingNeighbors({ hearingIds });
    }
  }

  onInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  getSortedHearings = (scheduledHearings) => {
    const { hearings, hearingNeighborsById } = this.props;
    let scheduledHearingMap = Map();
    scheduledHearings.forEach((scheduledHearing) => {
      const dateTime = scheduledHearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
      const courtroom = scheduledHearing.getIn([PROPERTY_TYPES.COURTROOM, 0]);
      scheduledHearingMap = scheduledHearingMap.set(dateTime, courtroom);
    });

    const unusedHearings = hearings.filter((hearing) => {
      const hearingDateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
      const hearingCourtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
      const id = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
      const hasOutcome = !!hearingNeighborsById.getIn([id, ENTITY_SETS.OUTCOMES]);
      const hearingHasBeenCancelled = hearing.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '')
        .toLowerCase().trim() === 'cancelled';
      const hearingIsInPast = moment(hearingDateTime).isBefore(moment());
      return !((scheduledHearingMap.get(hearingDateTime) === hearingCourtroom)
      || hasOutcome
      || hearingHasBeenCancelled
      || hearingIsInPast
      );
    });
    return unusedHearings.sort((h1, h2) => (moment(h1.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''))
      .isBefore(h2.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')) ? 1 : -1));
  }

  selectExistingHearing = (row, hearingId) => {
    const { onSubmit } = this.props;
    const hearingWithOnlyId = { [ID_FIELD_NAMES.HEARING_ID]: hearingId };
    this.selectHearing(hearingWithOnlyId);
    onSubmit(Object.assign({}, hearingWithOnlyId, {
      [HEARING.DATE_TIME]: row.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''),
      [HEARING.COURTROOM]: row.getIn([PROPERTY_TYPES.COURTROOM, 0], '')
    }));
  }

  renderNewHearingSection = () => {
    const { manuallyCreatingHearing } = this.state;
    const {
      PSASubmittedPage,
      neighbors,
      allJudges,
      context,
      personId,
      psaId,
      psaEntityKeyId
    } = this.props;
    const psaContext = neighbors
      ? neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0])
      : context;
    const jurisdiction = JURISDICTION[psaContext];

    return (
      <NewHearingSection
          personId={personId}
          psaEntityKeyId={psaEntityKeyId}
          psaId={psaId}
          manuallyCreatingHearing={manuallyCreatingHearing || PSASubmittedPage}
          allJudges={allJudges}
          jurisdiction={jurisdiction} />
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
    const { actions } = this.props;
    actions.refreshHearingNeighbors({ id: selectedHearing.entityKeyId });
  }

  renderSelectReleaseCondtions = (selectedHearing) => {
    const {
      allJudges,
      actions,
      hearingNeighborsById,
      defaultBond,
      defaultConditions,
      defaultDMF,
      dmfId,
      neighbors,
      personId,
      psaId,
      refreshPSANeighborsCallback,
      hearingIdsRefreshing,
      submitting,
      psaEntityKeyId,
      psaNeighborsById,
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
    let judgeEntitySetId;
    const { hearingId, entityKeyId } = selectedHearing;
    const hearing = psaNeighborsById.getIn([psaEntityKeyId, ENTITY_SETS.HEARINGS])
      .filter(hearingObj => (hearingObj.getIn([OPENLATTICE_ID_FQN, 0]) === entityKeyId))
      .get(0);

    const hasMultipleHearings = hearingNeighborsById.size > 1;
    const oldDataOutcome = defaultDMF.getIn([PROPERTY_TYPES.OUTCOME, 0]);
    const onlyOldExists = oldDataOutcome && !hearingNeighborsById.getIn([entityKeyId, ENTITY_SETS.OUTCOMES]);

    if (onlyOldExists) {
      outcome = defaultDMF;
      bond = defaultBond;
      conditions = defaultConditions;
    }
    else {
      outcome = hearingNeighborsById.getIn([entityKeyId, ENTITY_SETS.OUTCOMES], Map());
      bond = hearingNeighborsById.getIn([entityKeyId, ENTITY_SETS.BONDS], Map());
      conditions = hearingNeighborsById
        .getIn([entityKeyId, ENTITY_SETS.RELEASE_CONDITIONS], Map());
    }
    const submittedOutcomes = (onlyOldExists && hasMultipleHearings)
      ? false
      : !!(hearingNeighborsById.getIn([entityKeyId, ENTITY_SETS.OUTCOMES]) || oldDataOutcome);

    const judgeFromJudgeEntity = hearingNeighborsById.getIn([
      entityKeyId,
      ENTITY_SETS.MIN_PEN_PEOPLE
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
      .getIn([ENTITY_SETS.DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0]);
    const jurisdiction = JURISDICTION[psaContext];

    return (
      <Wrapper withPadding>
        <SelectReleaseConditions
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

  renderAvailableHearings = (manuallyCreatingHearing, scheduledHearings) => {
    const { readOnly } = this.props;
    if (readOnly) return null;
    return (
      <div>
        <Header>
          <StyledTitle with withSubtitle>
            <span>Available Hearings</span>
            Select a hearing to add it to the defendant's schedule
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

  render() {
    const { manuallyCreatingHearing, selectingReleaseConditions, selectedHearing } = this.state;
    const {
      psaEntityKeyId,
      psaNeighborsById,
      hearingIdsRefreshing,
      submitting,
      refreshingNeighbors,
      hearingNeighborsById,
      PSASubmittedPage
    } = this.props;

    const psaNeighbors = psaNeighborsById.get(psaEntityKeyId, Map());
    const hearingsWithOutcomes = hearingNeighborsById
      .keySeq().filter(id => hearingNeighborsById.getIn([id, ENTITY_SETS.OUTCOMES]));
    const scheduledHearings = getScheduledHearings(psaNeighbors);
    const pastHearings = getPastHearings(psaNeighbors);

    if (submitting || refreshingNeighbors || hearingIdsRefreshing) {
      return (
        <Wrapper>
          <SubmittingWrapper>
            <span>{ submitting ? 'Submitting' : 'Reloading' }</span>
            <LoadingSpinner />
          </SubmittingWrapper>
        </Wrapper>
      );
    }

    if (PSASubmittedPage) {
      return (
        <SubmittedPSAWrapper>
          {this.renderNewHearingSection()}
        </SubmittedPSAWrapper>
      );
    }
    return (
      <Container>
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
      </Container>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get(STATE.REVIEW);
  const court = state.get(STATE.COURT);
  return {
    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
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
