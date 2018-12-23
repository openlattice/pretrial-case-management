/*
 * @flow
 */

import React from 'react';
import { Constants } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map, List } from 'immutable';

import SelectReleaseConditions from '../../components/releaseconditions/SelectReleaseConditions';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatJudgeName } from '../../utils/consts/HearingConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  Wrapper,
  PaddedStyledColumnRow,
  TitleWrapper,
  CloseModalX
} from '../../utils/Layout';
import {
  COURT,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  REVIEW,
  STATE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';

let {
  HEARINGS,
  OUTCOMES,
  BONDS,
  JUDGES,
  RELEASE_CONDITIONS
} = APP_TYPES_FQNS;

HEARINGS = HEARINGS.toString();
OUTCOMES = OUTCOMES.toString();
BONDS = BONDS.toString();
JUDGES = JUDGES.toString();
RELEASE_CONDITIONS = RELEASE_CONDITIONS.toString();

const { OPENLATTICE_ID_FQN } = Constants;

type Props = {
  allJudges :List<*, *>,
  defaultBond :Map<*, *>,
  defaultConditions :Map<*, *>,
  defaultDMF :Map<*, *>,
  dmfId :string,
  hearingId :string,
  hearingEntityKeyId :string,
  hearingIdsRefreshing :Set<*, *>,
  hearingNeighborsById :Map<*, *>,
  jurisdiction :string,
  neighbors :Map<*, *>,
  open :boolean,
  onClose :() => void,
  psaEntityKeyId :string,
  psaId :string,
  psaIdsRefreshing :boolean,
  personId :string,
  selectedHearing :Object,
  submitting :boolean,
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
  }
}


const MODAL_WIDTH = '975px';
const MODAL_HEIGHT = 'max-content';

class ReleaseConditionsModal extends React.Component<Props, State> {

  refreshHearingsNeighborsCallback = () => {
    const { selectedHearing } = this.props;
    const { actions } = this.props;
    actions.refreshHearingNeighbors({ id: selectedHearing.entityKeyId });
  }
  refreshPSANeighborsCallback = () => {
    const { psaEntityKeyId } = this.props;
    const { actions } = this.props;
    actions.refreshPSANeighbors({ id: psaEntityKeyId });
  }

  render() {
    const {
      allJudges,
      actions,
      defaultBond,
      defaultConditions,
      defaultDMF,
      dmfId,
      neighbors,
      hearingId,
      hearingEntityKeyId,
      hearingNeighborsById,
      hearingIdsRefreshing,
      jurisdiction,
      open,
      onClose,
      personId,
      psaEntityKeyId,
      psaId,
      psaIdsRefreshing,
      submitting
    } = this.props;
    const {
      deleteEntity,
      replaceAssociation,
      replaceEntity,
      submit,
      updateOutcomesAndReleaseCondtions
    } = actions;

    const refreshingNeighbors = psaIdsRefreshing.has(psaEntityKeyId);

    const loading = (hearingIdsRefreshing || submitting || refreshingNeighbors);

    let outcome;
    let bond;
    let conditions;

    let judgeName;
    let judgeEntitySetId;
    const hearing = neighbors.get(HEARINGS, List())
      .filter(hearingObj => (hearingObj.getIn([OPENLATTICE_ID_FQN, 0]) === hearingEntityKeyId))
      .get(0, Map());
    const hasMultipleHearings = hearingNeighborsById.size > 1;
    const oldDataOutcome = defaultDMF.getIn([PROPERTY_TYPES.OUTCOME, 0]);
    const onlyOldExists = oldDataOutcome && !hearingNeighborsById.getIn([hearingEntityKeyId, OUTCOMES]);
    const hasOldOrNewOutcome = !!(
      hearingNeighborsById.getIn([hearingEntityKeyId, OUTCOMES]) || oldDataOutcome
    );

    if (onlyOldExists) {
      outcome = defaultDMF;
      bond = defaultBond;
      conditions = defaultConditions;
    }
    else {
      outcome = hearingNeighborsById.getIn([hearingEntityKeyId, OUTCOMES], Map());
      bond = hearingNeighborsById.getIn([hearingEntityKeyId, BONDS], Map());
      conditions = hearingNeighborsById
        .getIn([hearingEntityKeyId, RELEASE_CONDITIONS], Map());
    }
    const submittedOutcomes = (onlyOldExists && hasMultipleHearings)
      ? false
      : hasOldOrNewOutcome;

    const judgeFromJudgeEntity = hearingNeighborsById.getIn([
      hearingEntityKeyId,
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

    return (
      <Wrapper>
        <ModalTransition>
          {
            open
            && (
              <Modal
                  scrollBehavior="outside"
                  onClose={() => onClose()}
                  width={MODAL_WIDTH}
                  height={MODAL_HEIGHT}
                  max-height={MODAL_HEIGHT}
                  shouldCloseOnOverlayClick
                  stackIndex={2}>
                <TitleWrapper>
                  <h1>Hearing Details</h1>
                  <div>
                    <CloseModalX onClick={onClose} />
                  </div>
                </TitleWrapper>
                <PaddedStyledColumnRow>
                  {
                    loading
                      ? <LoadingSpinner />
                      : (
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
                            submitCallback={this.refreshPSANeighborsCallback}
                            updateFqn={updateOutcomesAndReleaseCondtions}
                            refreshHearingsNeighborsCallback={this.refreshHearingsNeighborsCallback}
                            hearingIdsRefreshing={hearingIdsRefreshing}
                            hearingId={hearingId}
                            hearingEntityKeyId={hearingEntityKeyId}
                            hearing={hearing}
                            defaultOutcome={outcome}
                            defaultDMF={defaultDMF}
                            defaultBond={bond}
                            defaultConditions={conditions} />
                      )
                  }
                </PaddedStyledColumnRow>
              </Modal>
            )
          }
        </ModalTransition>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const court = state.get(STATE.COURT);
  const review = state.get(STATE.REVIEW);
  const submit = state.get(STATE.SUBMIT);
  return {
    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),

    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
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

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsModal);
