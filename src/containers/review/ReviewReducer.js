/*
 * @flow
 */

import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, REVIEW } from '../../utils/consts/FrontEndStateConsts';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import { editPSA } from '../psa/PSAFormActions';
import { loadRequiresActionPeople } from '../people/PeopleActions';
import { refreshHearingAndNeighbors } from '../hearings/HearingsActions';
import {
  changePSAStatus,
  checkPSAPermissions,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  updateScoresAndRiskFactors
} from './ReviewActions';

const {
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  HEARINGS,
  PSA_RISK_FACTORS,
  RELEASE_RECOMMENDATIONS,
  PSA_SCORES,
  STAFF
} = APP_TYPES;

const {
  ENTITY_KEY_ID
} = PROPERTY_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REVIEW.ENTITY_SET_ID]: '',
  [REVIEW.SCORES]: Map(),
  [REVIEW.PSA_NEIGHBORS_BY_ID]: Map(),
  [REVIEW.NEIGHBORS_BY_DATE]: Map(),
  [REVIEW.LOADING_DATA]: false,
  [REVIEW.LOADING_RESULTS]: false,
  [REVIEW.ERROR]: '',
  [REVIEW.ALL_FILERS]: Set(),
  [REVIEW.CASE_HISTORY]: Map(),
  [REVIEW.MANUAL_CASE_HISTORY]: Map(),
  [REVIEW.CHARGE_HISTORY]: Map(),
  [REVIEW.MANUAL_CHARGE_HISTORY]: Map(),
  [REVIEW.SENTENCE_HISTORY]: Map(),
  [REVIEW.FTA_HISTORY]: Map(),
  [REVIEW.HEARINGS]: Map(),
  [REVIEW.READ_ONLY]: true,
  [REVIEW.PSA_IDS_REFRESHING]: Set()
});

export default function reviewReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case SWITCH_ORGANIZATION: {
      return INITIAL_STATE;
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => state.set(
          REVIEW.SCORES,
          state.get(REVIEW.SCORES).set(action.value.id, fromJS(action.value.entity))
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


    case editPSA.case(action.type): {
      return editPSA.reducer(state, action, {
        SUCCESS: () => {
          const { psaEKID, staffNeighbors } = action.value;
          let psaNeighbors = state.get(REVIEW.PSA_NEIGHBORS_BY_ID, Map());
          psaNeighbors = psaNeighbors.setIn([psaEKID, STAFF], staffNeighbors);
          return state.set(REVIEW.PSA_NEIGHBORS_BY_ID, psaNeighbors);
        }
      });
    }

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn([REVIEW.CASE_HISTORY, action.value.personEKID], List())
          .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personEKID], List())
          .setIn([REVIEW.CHARGE_HISTORY, action.value.personEKID], Map())
          .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personEKID], Map())
          .setIn([REVIEW.SENTENCE_HISTORY, action.value.personEKID], Map())
          .setIn([REVIEW.FTA_HISTORY, action.value.personEKID], List())
          .setIn([REVIEW.HEARINGS, action.value.personEKID], List()),
        SUCCESS: () => {
          const uniqCases = action.value.allCases.toSet().toList();
          return state
            .setIn([REVIEW.CASE_HISTORY, action.value.personEKID], uniqCases)
            .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personEKID], action.value.allManualCases)
            .setIn([REVIEW.CHARGE_HISTORY, action.value.personEKID], action.value.chargesByCaseId)
            .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personEKID], action.value.manualChargesByCaseId)
            .setIn([REVIEW.SENTENCE_HISTORY, action.value.personEKID], action.value.sentencesByCaseId)
            .setIn([REVIEW.FTA_HISTORY, action.value.personEKID], action.value.allFTAs)
            .setIn([REVIEW.HEARINGS, action.value.personEKID], action.value.allHearings);
        },
        FAILURE: () => state
          .setIn([REVIEW.CASE_HISTORY, action.value.personEKID], List())
          .setIn([REVIEW.MANUAL_CASE_HISTORY, action.value.personEKID], List())
          .setIn([REVIEW.CHARGE_HISTORY, action.value.personEKID], Map())
          .setIn([REVIEW.MANUAL_CHARGE_HISTORY, action.value.personEKID], Map())
          .setIn([REVIEW.SENTENCE_HISTORY, action.value.personEKID], Map())
          .setIn([REVIEW.FTA_HISTORY, action.value.personEKID], List())
          .setIn([REVIEW.HEARINGS, action.value.personEKID], List())
      });
    }

    case loadPSAData.case(action.type): {
      return loadPSAData.reducer(state, action, {
        REQUEST: () => state
          .set(REVIEW.LOADING_DATA, true)
          .set(REVIEW.ERROR, ''),
        SUCCESS: () => {
          const { psaNeighborsById, psaNeighborsByDate } = action.value;
          const currentNeighborsByIdState = state.get(REVIEW.PSA_NEIGHBORS_BY_ID);
          const currentNeighborsByDate = state.get(REVIEW.PSA_NEIGHBORS_BY_ID);
          const newNeighborsByIdState = currentNeighborsByIdState.merge(psaNeighborsById);
          const newNeighborsByDate = currentNeighborsByDate.merge(psaNeighborsByDate);
          return state
            .set(REVIEW.PSA_NEIGHBORS_BY_ID, newNeighborsByIdState)
            .set(REVIEW.NEIGHBORS_BY_DATE, newNeighborsByDate)
            .set(REVIEW.ALL_FILERS, action.value.allFilers.sort())
            .set(REVIEW.ERROR, '');
        },
        FAILURE: () => state
          .set(REVIEW.NEIGHBORS_BY_DATE, Map())
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
          .set(REVIEW.SCORES, fromJS(action.value.scoresAsMap))
          .set(REVIEW.ENTITY_SET_ID, action.value.entitySetId),
        FAILURE: () => state
          .set(REVIEW.ENTITY_SET_ID, '')
          .set(REVIEW.SCORES, Map()),
        FINALLY: () => state.set(REVIEW.LOADING_RESULTS, false)
      });
    }

    case loadRequiresActionPeople.case(action.type): {
      return loadRequiresActionPeople.reducer(state, action, {
        SUCCESS: () => {
          const { psaNeighborsById, psaScoreMap } = action.value;
          const nextPSANeighbors = state.get(REVIEW.PSA_NEIGHBORS_BY_ID, Map()).merge(psaNeighborsById);
          const nextPSAScores = state.get(REVIEW.SCORES, Map()).merge(psaScoreMap)
          return state
            .set(REVIEW.SCORES, nextPSAScores)
            .set(REVIEW.PSA_NEIGHBORS_BY_ID, nextPSANeighbors);
        }
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn, hearingEntityKeyId } = action.value;
          /*
          * Get psaEKID && psaNeighbors
          */
          const psaEntity = hearingNeighborsByAppTypeFqn.get(PSA_SCORES, Map());
          const { [ENTITY_KEY_ID]: psaEKID } = getEntityProperties(psaEntity, [ENTITY_KEY_ID]);
          const psaNeighbors = state.getIn([REVIEW.PSA_NEIGHBORS_BY_ID, psaEKID], Map());
          /*
          * Replace the hearing in the psa's neighbors.
          */
          const nextPSANeighbors = psaNeighbors.withMutations((mutableMap) => {
            const nextPSAHearings = psaNeighbors.get(HEARINGS, List()).map((existingHearing) => {
              const { [ENTITY_KEY_ID]: hearingEKID } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
              return hearingEKID === hearingEntityKeyId ? hearing : existingHearing;
            });
            mutableMap.set(HEARINGS, nextPSAHearings);
          });
          return state.setIn([REVIEW.PSA_NEIGHBORS_BY_ID, psaEKID], nextPSANeighbors);
        }
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
          scoresAsMap = scoresAsMap.set(scoresId, fromJS(newScoreEntity));
          const notesEntity = newNotesEntity
            ? fromJS(newNotesEntity)
            : state.getIn([
              REVIEW.PSA_NEIGHBORS_BY_ID,
              scoresId,
              RELEASE_RECOMMENDATIONS,
              PSA_NEIGHBOR.DETAILS
            ]);
          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(scoresId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn(
                [date, scoresId, PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
                fromJS(newRiskFactorsEntity)
              ).setIn(
                [date, scoresId, DMF_RESULTS, PSA_NEIGHBOR.DETAILS],
                fromJS(newDMFEntity)
              ).setIn(
                [date, scoresId, DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
                fromJS(newDMFRiskFactorsEntity)
              ).setIn(
                [date, scoresId, RELEASE_RECOMMENDATIONS, PSA_NEIGHBOR.DETAILS],
                fromJS(notesEntity)
              );
            }
          });
          const psaNeighborsById = state.get(REVIEW.PSA_NEIGHBORS_BY_ID)
            .setIn(
              [scoresId, PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
              fromJS(newRiskFactorsEntity)
            ).setIn(
              [scoresId, DMF_RESULTS, PSA_NEIGHBOR.DETAILS],
              fromJS(newDMFEntity)
            ).setIn(
              [scoresId, DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS],
              fromJS(newDMFRiskFactorsEntity)
            )
            .setIn(
              [scoresId, RELEASE_RECOMMENDATIONS, PSA_NEIGHBOR.DETAILS],
              fromJS(notesEntity)
            );
          return state
            .set(REVIEW.SCORES, scoresAsMap)
            .set(REVIEW.PSA_NEIGHBORS_BY_ID, psaNeighborsById)
            .set(REVIEW.NEIGHBORS_BY_DATE, psaNeighborsByDate);
        }
      });
    }

    default:
      return state;
  }
}
