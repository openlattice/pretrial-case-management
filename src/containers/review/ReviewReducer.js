/*
 * @flow
 */

import Immutable from 'immutable';

import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, REVIEW } from '../../utils/consts/FrontEndStateConsts';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import {
  changePSAStatus,
  checkPSAPermissions,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  refreshPSANeighbors,
  updateScoresAndRiskFactors,
  updateOutcomesAndReleaseCondtions
} from './ReviewActionFactory';

const {
  BONDS,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  OUTCOMES,
  PSA_RISK_FACTORS,
  RELEASE_RECOMMENDATIONS
} = APP_TYPES_FQNS;

const bondsFqn :string = BONDS.toString();
const dmfResultsFqn :string = DMF_RESULTS.toString();
const dmfRiskFactorsFqn :string = DMF_RISK_FACTORS.toString();
const outcomesFqn :string = OUTCOMES.toString();
const psaRiskFactorsFqn :string = PSA_RISK_FACTORS.toString();
const releaseRecommendationsFqn :string = RELEASE_RECOMMENDATIONS.toString();

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [REVIEW.ENTITY_SET_ID]: '',
  [REVIEW.SCORES]: Immutable.Map(),
  [REVIEW.NEIGHBORS_BY_ID]: Immutable.Map(),
  [REVIEW.NEIGHBORS_BY_DATE]: Immutable.Map(),
  [REVIEW.LOADING_DATA]: false,
  [REVIEW.LOADING_RESULTS]: false,
  [REVIEW.ERROR]: '',
  [REVIEW.ALL_FILERS]: Immutable.Set(),
  [REVIEW.CASE_HISTORY]: Immutable.Map(),
  [REVIEW.MANUAL_CASE_HISTORY]: Immutable.Map(),
  [REVIEW.CHARGE_HISTORY]: Immutable.Map(),
  [REVIEW.MANUAL_CHARGE_HISTORY]: Immutable.Map(),
  [REVIEW.SENTENCE_HISTORY]: Immutable.Map(),
  [REVIEW.FTA_HISTORY]: Immutable.Map(),
  [REVIEW.HEARINGS]: Immutable.Map(),
  [REVIEW.READ_ONLY]: true,
  [REVIEW.PSA_IDS_REFRESHING]: Immutable.Set()
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case SWITCH_ORGANIZATION: {
      return INITIAL_STATE;
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => state.set(
          REVIEW.SCORES,
          state.get(REVIEW.SCORES).set(action.value.id, Immutable.fromJS(action.value.entity))
        )
      });
    }
    case checkPSAPermissions.case(action.type): {
      return checkPSAPermissions.reducer(state, action, {
        REQUEST: () => state.set(REVIEW.READ_ONLY, true),
        SUCCESS: () => state.set(REVIEW.READ_ONLY, action.value.readOnly),
        FAILURE: () => state.set(REVIEW.READ_ONLY, true)
      });
    }

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn([REVIEW.CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW.CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW.SENTENCE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW.FTA_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW.HEARINGS, action.value.personId], Immutable.List()),
        SUCCESS: () => {
          const uniqCases = action.value.allCases.toSet().toList();
          return state
            .setIn([REVIEW.CASE_HISTORY, action.value.personId], uniqCases)
            .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personId], action.value.allManualCases)
            .setIn([REVIEW.CHARGE_HISTORY, action.value.personId], action.value.chargesByCaseId)
            .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personId], action.value.manualChargesByCaseId)
            .setIn([REVIEW.SENTENCE_HISTORY, action.value.personId], action.value.sentencesByCaseId)
            .setIn([REVIEW.FTA_HISTORY, action.value.personId], action.value.allFTAs)
            .setIn([REVIEW.HEARINGS, action.value.personId], action.value.allHearings);
        },
        FAILURE: () => state
          .setIn([REVIEW.CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW.CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW.SENTENCE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW.FTA_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW.HEARINGS, action.value.personId], Immutable.List())
      });
    }

    case loadPSAData.case(action.type): {
      return loadPSAData.reducer(state, action, {
        REQUEST: () => state
          .set(REVIEW.LOADING_DATA, true)
          .set(REVIEW.ERROR, ''),
        SUCCESS: () => {
          const { psaNeighborsById, psaNeighborsByDate } = action.value;
          const currentNeighborsByIdState = state.get(REVIEW.NEIGHBORS_BY_ID);
          const currentNeighborsByDate = state.get(REVIEW.NEIGHBORS_BY_ID);
          const newNeighborsByIdState = currentNeighborsByIdState.merge(psaNeighborsById);
          const newNeighborsByDate = currentNeighborsByDate.merge(psaNeighborsByDate);
          return state
            .set(REVIEW.NEIGHBORS_BY_ID, newNeighborsByIdState)
            .set(REVIEW.NEIGHBORS_BY_DATE, newNeighborsByDate)
            .set(REVIEW.ALL_FILERS, action.value.allFilers.sort())
            .set(REVIEW.ERROR, '');
        },
        FAILURE: () => state
          .set(REVIEW.NEIGHBORS_BY_DATE, Immutable.Map())
          .set(REVIEW.ERROR, action.value),
        FINALLY: () => state.set(REVIEW.LOADING_DATA, false)
      });
    }

    case loadPSAsByDate.case(action.type): {
      return loadPSAsByDate.reducer(state, action, {
        REQUEST: () => state
          .set(REVIEW.LOADING_RESULTS, true)
          .set(REVIEW.ENTITY_SET_ID, ''),
        SUCCESS: () => state
          .set(REVIEW.SCORES, Immutable.fromJS(action.value.scoresAsMap))
          .set(REVIEW.ENTITY_SET_ID, action.value.entitySetId),
        FAILURE: () => state
          .set(REVIEW.ENTITY_SET_ID, '')
          .set(REVIEW.SCORES, Immutable.Map()),
        FINALLY: () => state.set(REVIEW.LOADING_RESULTS, false)
      });
    }

    case refreshPSANeighbors.case(action.type): {
      return refreshPSANeighbors.reducer(state, action, {
        REQUEST: () => state.set(
          REVIEW.PSA_IDS_REFRESHING,
          state.get(REVIEW.PSA_IDS_REFRESHING).add(action.value.id)
        ),
        SUCCESS: () => {
          const { neighbors } = action.value;
          let psaNeighborsById = state.get(REVIEW.NEIGHBORS_BY_ID);

          psaNeighborsById = psaNeighborsById.set(action.value.id, neighbors);

          return state.set(REVIEW.NEIGHBORS_BY_ID, psaNeighborsById);
        },
        FINALLY: () => state.set(
          REVIEW.PSA_IDS_REFRESHING,
          state.get(REVIEW.PSA_IDS_REFRESHING).delete(action.value.id)
        )
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          const {
            scoresId,
            newScoreEntity,
            newRiskFactorsEntity,
            newDMFEntity,
            newDMFRiskFactorsEntity,
            newNotesEntity
          } = action.value;

          let scoresAsMap = state.get(REVIEW.SCORES);
          let psaNeighborsByDate = state.get(REVIEW.NEIGHBORS_BY_DATE);
          scoresAsMap = scoresAsMap.set(scoresId, Immutable.fromJS(newScoreEntity));
          const notesEntity = newNotesEntity
            ? Immutable.fromJS(newNotesEntity)
            : state.getIn([
              REVIEW.NEIGHBORS_BY_ID,
              scoresId,
              releaseRecommendationsFqn,
              PSA_NEIGHBOR.DETAILS
            ]);
          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(scoresId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn(
                [date, scoresId, psaRiskFactorsFqn, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newRiskFactorsEntity)
              ).setIn(
                [date, scoresId, dmfResultsFqn, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newDMFEntity)
              ).setIn(
                [date, scoresId, dmfRiskFactorsFqn, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newDMFRiskFactorsEntity)
              ).setIn(
                [date, scoresId, releaseRecommendationsFqn, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(notesEntity)
              );
            }
          });
          const psaNeighborsById = state.get(REVIEW.NEIGHBORS_BY_ID)
            .setIn(
              [scoresId, psaRiskFactorsFqn, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newRiskFactorsEntity)
            ).setIn(
              [scoresId, dmfResultsFqn, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newDMFEntity)
            ).setIn(
              [scoresId, dmfRiskFactorsFqn, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newDMFRiskFactorsEntity)
            )
            .setIn(
              [scoresId, releaseRecommendationsFqn, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(notesEntity)
            );
          return state
            .set(REVIEW.SCORES, scoresAsMap)
            .set(REVIEW.NEIGHBORS_BY_ID, psaNeighborsById)
            .set(REVIEW.NEIGHBORS_BY_DATE, psaNeighborsByDate);
        }
      });
    }

    case updateOutcomesAndReleaseCondtions.case(action.type): {
      return updateOutcomesAndReleaseCondtions.reducer(state, action, {
        REQUEST: () => state.set(
          REVIEW.PSA_IDS_REFRESHING,
          state.get(REVIEW.PSA_IDS_REFRESHING)
        ),
        SUCCESS: () => {
          const {
            psaId,
            newBondEntity,
            newOutcomeEntity
          } = action.value;

          let psaNeighborsByDate = state.get(REVIEW.NEIGHBORS_BY_DATE);

          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(psaId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn(
                [date, psaId, outcomesFqn, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newOutcomeEntity)
              ).setIn(
                [date, psaId, bondsFqn, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newBondEntity)
              );
            }
          });
          const psaNeighborsById = state.get(REVIEW.NEIGHBORS_BY_ID)
            .setIn(
              [psaId, outcomesFqn, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newOutcomeEntity)
            ).setIn(
              [psaId, bondsFqn, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newBondEntity)
            );
          return state
            .set(REVIEW.NEIGHBORS_BY_ID, psaNeighborsById)
            .set(REVIEW.NEIGHBORS_BY_DATE, psaNeighborsByDate);
        },
        FINALLY: () => state.set(
          REVIEW.PSA_IDS_REFRESHING,
          state.get(REVIEW.PSA_IDS_REFRESHING)
        )
      });
    }

    default:
      return state;
  }
}
