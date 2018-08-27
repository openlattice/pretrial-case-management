/*
 * @flow
 */

import Immutable from 'immutable';

import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, REVIEW } from '../../utils/consts/FrontEndStateConsts';
import {
  changePSAStatus,
  checkPSAPermissions,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  refreshPSANeighbors,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';

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

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () =>
          state.set(
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
        SUCCESS: () => state
          .setIn([REVIEW.CASE_HISTORY, action.value.personId], action.value.allCases)
          .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personId], action.value.allManualCases)
          .setIn([REVIEW.CHARGE_HISTORY, action.value.personId], action.value.chargesByCaseId)
          .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personId], action.value.manualChargesByCaseId)
          .setIn([REVIEW.SENTENCE_HISTORY, action.value.personId], action.value.sentencesByCaseId)
          .setIn([REVIEW.FTA_HISTORY, action.value.personId], action.value.allFTAs)
          .setIn([REVIEW.HEARINGS, action.value.personId], action.value.allHearings),
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
        SUCCESS: () => state
          .set(REVIEW.NEIGHBORS_BY_ID, Immutable.fromJS(action.value.psaNeighborsById))
          .set(REVIEW.NEIGHBORS_BY_DATE, Immutable.fromJS(action.value.psaNeighborsByDate))
          .set(REVIEW.ALL_FILERS, action.value.allFilers.sort())
          .set(REVIEW.ERROR, ''),
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

          let psaNeighborsByDate = state.get(REVIEW.NEIGHBORS_BY_DATE);
          let psaNeighborsById = state.get(REVIEW.NEIGHBORS_BY_ID);

          psaNeighborsById = psaNeighborsById.set(action.value.id, Immutable.fromJS(action.value.neighbors));

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
              ENTITY_SETS.RELEASE_RECOMMENDATIONS,
              PSA_NEIGHBOR.DETAILS
            ]);
          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(scoresId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn(
                [date, scoresId, ENTITY_SETS.PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newRiskFactorsEntity)
              ).setIn(
                [date, scoresId, ENTITY_SETS.DMF_RESULTS, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newDMFEntity)
              ).setIn(
                [date, scoresId, ENTITY_SETS.DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(newDMFRiskFactorsEntity)
              ).setIn(
                [date, scoresId, ENTITY_SETS.RELEASE_RECOMMENDATIONS, PSA_NEIGHBOR.DETAILS],
                Immutable.fromJS(notesEntity)
              );
            }
          });
          const psaNeighborsById = state.get(REVIEW.NEIGHBORS_BY_ID)
            .setIn(
              [scoresId, ENTITY_SETS.PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newRiskFactorsEntity)
            ).setIn(
              [scoresId, ENTITY_SETS.DMF_RESULTS, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newDMFEntity)
            ).setIn(
              [scoresId, ENTITY_SETS.DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(newDMFRiskFactorsEntity)
            )
            .setIn(
              [scoresId, ENTITY_SETS.RELEASE_RECOMMENDATIONS, PSA_NEIGHBOR.DETAILS],
              Immutable.fromJS(notesEntity)
            );
          return state
            .set(REVIEW.SCORES, scoresAsMap)
            .set(REVIEW.NEIGHBORS_BY_ID, psaNeighborsById)
            .set(REVIEW.NEIGHBORS_BY_DATE, psaNeighborsByDate);
        }
      });
    }

    default:
      return state;
  }
}
