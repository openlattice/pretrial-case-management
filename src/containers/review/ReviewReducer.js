/*
 * @flow
 */

import { RequestStates } from 'redux-reqseq';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import { editPSA } from '../psa/PSAFormActions';
import { loadRequiresActionPeople } from '../people/PeopleActions';
import { refreshHearingAndNeighbors } from '../hearings/HearingsActions';
import {
  BULK_DOWNLOAD_PSA_REVIEW_PDF,
  CHANGE_PSA_STATUS,
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSA_DATA,
  LOAD_PSAS_BY_STATUS,
  UPDATE_SCORES_AND_RISK_FACTORS,
  changePSAStatus,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByStatus,
  updateScoresAndRiskFactors
} from './ReviewActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import REVIEW_DATA from '../../utils/consts/redux/ReviewConsts';

const { HEARINGS, PSA_SCORES, STAFF } = APP_TYPES;

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map = fromJS({
  [REDUX.ACTIONS]: {
    [BULK_DOWNLOAD_PSA_REVIEW_PDF]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CHANGE_PSA_STATUS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CHECK_PSA_PERMISSIONS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [DOWNLOAD_PSA_REVIEW_PDF]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_CASE_HISTORY]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_PSA_DATA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_PSAS_BY_STATUS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [UPDATE_SCORES_AND_RISK_FACTORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [BULK_DOWNLOAD_PSA_REVIEW_PDF]: Map(),
    [CHANGE_PSA_STATUS]: Map(),
    [CHECK_PSA_PERMISSIONS]: Map(),
    [DOWNLOAD_PSA_REVIEW_PDF]: Map(),
    [LOAD_CASE_HISTORY]: Map(),
    [LOAD_PSA_DATA]: Map(),
    [LOAD_PSAS_BY_STATUS]: Map(),
    [UPDATE_SCORES_AND_RISK_FACTORS]: Map()
  },
  [REVIEW_DATA.ALL_FILERS]: Set(),
  [REVIEW_DATA.NEIGHBORS_BY_DATE]: Map(),
  [REVIEW_DATA.PSA_NEIGHBORS_BY_ID]: Map(),
  [REVIEW_DATA.SCORES]: Map(),
  [REVIEW_DATA.READ_ONLY]: true,
});

export default function reviewReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case SWITCH_ORGANIZATION: {
      return INITIAL_STATE;
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CHANGE_PSA_STATUS, action.id], action)
          .setIn([REDUX.ACTIONS, CHANGE_PSA_STATUS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .update(REVIEW_DATA.SCORES, Map(), (prev) => prev.set(action.value.id, fromJS(action.value.entity)))
          .setIn([REDUX.ACTIONS, CHANGE_PSA_STATUS, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CHANGE_PSA_STATUS], error)
            .setIn([REDUX.ACTIONS, CHANGE_PSA_STATUS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CHANGE_PSA_STATUS, action.id])
      });
    }

    case checkPSAPermissions.case(action.type): {
      return checkPSAPermissions.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CHECK_PSA_PERMISSIONS, action.id], action)
          .setIn([REDUX.ACTIONS, CHECK_PSA_PERMISSIONS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .set(REVIEW_DATA.READ_ONLY, action.value.readOnly)
          .setIn([REDUX.ACTIONS, CHECK_PSA_PERMISSIONS, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CHECK_PSA_PERMISSIONS], error)
            .setIn([REDUX.ACTIONS, CHECK_PSA_PERMISSIONS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CHECK_PSA_PERMISSIONS, action.id])
      });
    }

    case downloadPSAReviewPDF.case(action.type): {
      return downloadPSAReviewPDF.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, DOWNLOAD_PSA_REVIEW_PDF, action.id], action)
          .setIn([REDUX.ACTIONS, DOWNLOAD_PSA_REVIEW_PDF, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, DOWNLOAD_PSA_REVIEW_PDF, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, DOWNLOAD_PSA_REVIEW_PDF], error)
            .setIn([REDUX.ACTIONS, DOWNLOAD_PSA_REVIEW_PDF, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, DOWNLOAD_PSA_REVIEW_PDF, action.id])
      });
    }

    case editPSA.case(action.type): {
      return editPSA.reducer(state, action, {
        SUCCESS: () => {
          const { psaEKID, staffNeighbors } = action.value;
          return state.setIn([REVIEW_DATA.PSA_NEIGHBORS_BY_ID, psaEKID, STAFF], staffNeighbors);
        }
      });
    }

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_CASE_HISTORY, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_CASE_HISTORY, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, LOAD_CASE_HISTORY, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_CASE_HISTORY], error)
            .setIn([REDUX.ACTIONS, LOAD_CASE_HISTORY, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_CASE_HISTORY, action.id])
      });
    }

    case loadPSAData.case(action.type): {
      return loadPSAData.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_PSA_DATA, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_PSA_DATA, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { psaNeighborsById, psaNeighborsByDate } = action.value;
          return state
            .set(REVIEW_DATA.ALL_FILERS, action.value.allFilers.sort())
            .update(REVIEW_DATA.PSA_NEIGHBORS_BY_ID, Map(), (prev) => prev.merge(psaNeighborsById))
            .update(REVIEW_DATA.NEIGHBORS_BY_DATE, Map(), (prev) => prev.merge(psaNeighborsByDate))
            .setIn([REDUX.ACTIONS, LOAD_PSA_DATA, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_PSA_DATA], error)
            .setIn([REDUX.ACTIONS, LOAD_PSA_DATA, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_PSA_DATA, action.id])
      });
    }

    case loadPSAsByStatus.case(action.type): {
      return loadPSAsByStatus.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_PSAS_BY_STATUS, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_PSAS_BY_STATUS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .set(REVIEW_DATA.SCORES, fromJS(action.value.scoresAsMap))
          .setIn([REDUX.ACTIONS, LOAD_PSAS_BY_STATUS, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_PSAS_BY_STATUS], error)
            .setIn([REDUX.ACTIONS, LOAD_PSAS_BY_STATUS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_PSAS_BY_STATUS, action.id])
      });
    }

    case loadRequiresActionPeople.case(action.type): {
      return loadRequiresActionPeople.reducer(state, action, {
        SUCCESS: () => {
          const { psaNeighborsById, psaScoreMap } = action.value;
          const nextPSANeighbors = state.get(REVIEW_DATA.PSA_NEIGHBORS_BY_ID, Map()).merge(psaNeighborsById);
          const nextPSAScores = state.get(REVIEW_DATA.SCORES, Map()).merge(psaScoreMap);
          return state
            .set(REVIEW_DATA.SCORES, nextPSAScores)
            .set(REVIEW_DATA.PSA_NEIGHBORS_BY_ID, nextPSANeighbors);
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
          const psaNeighbors = state.getIn([REVIEW_DATA.PSA_NEIGHBORS_BY_ID, psaEKID], Map());
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
          return state.setIn([REVIEW_DATA.PSA_NEIGHBORS_BY_ID, psaEKID], nextPSANeighbors);
        }
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, UPDATE_SCORES_AND_RISK_FACTORS, action.id], action)
          .setIn([REDUX.ACTIONS, UPDATE_SCORES_AND_RISK_FACTORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            psaNeighborsByAppTypeFqn,
            scoresId,
            newScoreEntity,
          } = action.value;

          let psaNeighborsByDate = state.get(REVIEW_DATA.NEIGHBORS_BY_DATE);
          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(scoresId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn([date, scoresId], psaNeighborsByAppTypeFqn);
            }
          });
          return state
            .set(REVIEW_DATA.NEIGHBORS_BY_DATE, psaNeighborsByDate)
            .update(REVIEW_DATA.SCORES, Map(), (prev) => prev.set(scoresId, newScoreEntity))
            .updateIn(
              [REVIEW_DATA.PSA_NEIGHBORS_BY_ID, scoresId], Map(), (prev) => prev.merge(psaNeighborsByAppTypeFqn)
            )
            .setIn([REDUX.ACTIONS, UPDATE_SCORES_AND_RISK_FACTORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, UPDATE_SCORES_AND_RISK_FACTORS], error)
            .setIn([REDUX.ACTIONS, UPDATE_SCORES_AND_RISK_FACTORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, UPDATE_SCORES_AND_RISK_FACTORS, action.id])
      });
    }

    default:
      return state;
  }
}
