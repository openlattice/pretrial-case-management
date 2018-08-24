/*
 * @flow
 */

import Immutable from 'immutable';

import {
  changePSAStatus,
  checkPSAPermissions,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  refreshPSANeighbors,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, REVIEW_PSA } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [REVIEW_PSA.ENTITY_SET_ID]: '',
  [REVIEW_PSA.SCORES]: Immutable.Map(),
  [REVIEW_PSA.NEIGHBORS_BY_ID]: Immutable.Map(),
  [REVIEW_PSA.NEIGHBORS_BY_DATE]: Immutable.Map(),
  [REVIEW_PSA.LOADING_DATA]: false,
  [REVIEW_PSA.LOADING_RESULTS]: false,
  [REVIEW_PSA.ERROR]: '',
  [REVIEW_PSA.ALL_FILERS]: Immutable.Set(),
  [REVIEW_PSA.CASE_HISTORY]: Immutable.Map(),
  [REVIEW_PSA.MANUAL_CASE_HISTORY]: Immutable.Map(),
  [REVIEW_PSA.CHARGE_HISTORY]: Immutable.Map(),
  [REVIEW_PSA.MANUAL_CHARGE_HISTORY]: Immutable.Map(),
  [REVIEW_PSA.SENTENCE_HISTORY]: Immutable.Map(),
  [REVIEW_PSA.FTA_HISTORY]: Immutable.Map(),
  [REVIEW_PSA.HEARINGS]: Immutable.Map(),
  [REVIEW_PSA.READ_ONLY]: true,
  [REVIEW_PSA.PSA_IDS_REFRESHING]: Immutable.Set()
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () =>
          state.set(
            REVIEW_PSA.SCORES,
            state.get(REVIEW_PSA.SCORES).set(action.value.id, Immutable.fromJS(action.value.entity))
          )
      });
    }

    case checkPSAPermissions.case(action.type): {
      return checkPSAPermissions.reducer(state, action, {
        REQUEST: () => state.set(REVIEW_PSA.READ_ONLY, true),
        SUCCESS: () => state.set(REVIEW_PSA.READ_ONLY, action.value.readOnly),
        FAILURE: () => state.set(REVIEW_PSA.READ_ONLY, true)
      });
    }

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn([REVIEW_PSA.CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW_PSA.MANUAL_CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW_PSA.CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW_PSA.MANUAL_CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW_PSA.SENTENCE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW_PSA.FTA_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW_PSA.HEARINGS, action.value.personId], Immutable.List()),
        SUCCESS: () => state
          .setIn([REVIEW_PSA.CASE_HISTORY, action.value.personId], action.value.allCases)
          .setIn([REVIEW_PSA.MANUAL_CASE_HISTORY, action.value.personId], action.value.allManualCases)
          .setIn([REVIEW_PSA.CHARGE_HISTORY, action.value.personId], action.value.chargesByCaseId)
          .setIn([REVIEW_PSA.MANUAL_CHARGE_HISTORY, action.value.personId], action.value.manualChargesByCaseId)
          .setIn([REVIEW_PSA.SENTENCE_HISTORY, action.value.personId], action.value.sentencesByCaseId)
          .setIn([REVIEW_PSA.FTA_HISTORY, action.value.personId], action.value.allFTAs)
          .setIn([REVIEW_PSA.HEARINGS, action.value.personId], action.value.allHearings),
        FAILURE: () => state
          .setIn([REVIEW_PSA.CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW_PSA.MANUAL_CASE_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW_PSA.CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW_PSA.MANUAL_CHARGE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW_PSA.SENTENCE_HISTORY, action.value.personId], Immutable.Map())
          .setIn([REVIEW_PSA.FTA_HISTORY, action.value.personId], Immutable.List())
          .setIn([REVIEW_PSA.HEARINGS, action.value.personId], Immutable.List())
      });
    }

    case loadPSAData.case(action.type): {
      return loadPSAData.reducer(state, action, {
        REQUEST: () => state
          .set(REVIEW_PSA.LOADING_DATA, true)
          .set(REVIEW_PSA.ERROR, ''),
        SUCCESS: () => state
          .set(REVIEW_PSA.NEIGHBORS_BY_ID, Immutable.fromJS(action.value.psaNeighborsById))
          .set(REVIEW_PSA.NEIGHBORS_BY_DATE, Immutable.fromJS(action.value.psaNeighborsByDate))
          .set(REVIEW_PSA.ALL_FILERS, action.value.allFilers.sort())
          .set(REVIEW_PSA.ERROR, ''),
        FAILURE: () => state
          .set(REVIEW_PSA.NEIGHBORS_BY_DATE, Immutable.Map())
          .set(REVIEW_PSA.ERROR, action.value),
        FINALLY: () => state.set(REVIEW_PSA.LOADING_DATA, false)
      });
    }

    case loadPSAsByDate.case(action.type): {
      return loadPSAsByDate.reducer(state, action, {
        REQUEST: () => state
          .set(REVIEW_PSA.LOADING_RESULTS, true)
          .set(REVIEW_PSA.ENTITY_SET_ID, ''),
        SUCCESS: () => state
          .set(REVIEW_PSA.SCORES, Immutable.fromJS(action.value.scoresAsMap))
          .set(REVIEW_PSA.ENTITY_SET_ID, action.value.entitySetId),
        FAILURE: () => state
          .set(REVIEW_PSA.ENTITY_SET_ID, '')
          .set(REVIEW_PSA.SCORES, Immutable.Map()),
        FINALLY: () => state.set(REVIEW_PSA.LOADING_RESULTS, false)
      });
    }

    case refreshPSANeighbors.case(action.type): {
      return refreshPSANeighbors.reducer(state, action, {
        REQUEST: () => state.set(
          REVIEW_PSA.PSA_IDS_REFRESHING,
          state.get(REVIEW_PSA.PSA_IDS_REFRESHING).add(action.value.id)
        ),
        SUCCESS: () => {
          let psaNeighborsByDate = state.get(REVIEW_PSA.NEIGHBORS_BY_DATE);
          let psaNeighborsById = state.get(REVIEW_PSA.NEIGHBORS_BY_ID);

          psaNeighborsById = psaNeighborsById.set(action.value.id, Immutable.fromJS(action.value.neighbors));

          return state.set(REVIEW_PSA.NEIGHBORS_BY_ID, psaNeighborsById);
        },
        FINALLY: () => state.set(
          REVIEW_PSA.PSA_IDS_REFRESHING,
          state.get(REVIEW_PSA.PSA_IDS_REFRESHING).delete(action.value.id)
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

          let scoresAsMap = state.get(REVIEW_PSA.SCORES);
          let psaNeighborsByDate = state.get(REVIEW_PSA.NEIGHBORS_BY_DATE);
          scoresAsMap = scoresAsMap.set(scoresId, Immutable.fromJS(newScoreEntity));
          const notesEntity = newNotesEntity
            ? Immutable.fromJS(newNotesEntity)
            : state.getIn([
              REVIEW_PSA.NEIGHBORS_BY_ID,
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
          const psaNeighborsById = state.get(REVIEW_PSA.NEIGHBORS_BY_ID)
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
            .set(REVIEW_PSA.SCORES, scoresAsMap)
            .set(REVIEW_PSA.NEIGHBORS_BY_ID, psaNeighborsById)
            .set(REVIEW_PSA.NEIGHBORS_BY_DATE, psaNeighborsByDate);
        }
      });
    }

    default:
      return state;
  }
}
