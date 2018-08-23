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

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  scoresEntitySetId: '',
  scoresAsMap: Immutable.Map(),
  psaNeighborsById: Immutable.Map(),
  psaNeighborsByDate: Immutable.Map(),
  loadingPSAData: false,
  loadingResults: false,
  errorMessage: '',
  allFilers: Immutable.Set(),
  caseHistory: Immutable.Map(),
  manualCaseHistory: Immutable.Map(),
  chargeHistory: Immutable.Map(),
  manualChargeHistory: Immutable.Map(),
  sentenceHistory: Immutable.Map(),
  ftaHistory: Immutable.Map(),
  hearings: Immutable.Map(),
  readOnly: true,
  psaIdsRefreshing: Immutable.Set()
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () =>
          state.set('scoresAsMap', state.get('scoresAsMap').set(action.value.id, Immutable.fromJS(action.value.entity)))
      });
    }

    case checkPSAPermissions.case(action.type): {
      return checkPSAPermissions.reducer(state, action, {
        REQUEST: () => state.set('readOnly', true),
        SUCCESS: () => state.set('readOnly', action.value.readOnly),
        FAILURE: () => state.set('readOnly', true)
      });
    }

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn(['caseHistory', action.value.personId], Immutable.List())
          .setIn(['manualCaseHistory', action.value.personId], Immutable.List())
          .setIn(['chargeHistory', action.value.personId], Immutable.Map())
          .setIn(['manualChargeHistory', action.value.personId], Immutable.Map())
          .setIn(['sentenceHistory', action.value.personId], Immutable.Map())
          .setIn(['ftaHistory', action.value.personId], Immutable.List())
          .setIn(['hearings', action.value.personId], Immutable.List()),
        SUCCESS: () => state
          .setIn(['caseHistory', action.value.personId], action.value.allCases)
          .setIn(['manualCaseHistory', action.value.personId], action.value.allManualCases)
          .setIn(['chargeHistory', action.value.personId], action.value.chargesByCaseId)
          .setIn(['manualChargeHistory', action.value.personId], action.value.manualChargesByCaseId)
          .setIn(['sentenceHistory', action.value.personId], action.value.sentencesByCaseId)
          .setIn(['ftaHistory', action.value.personId], action.value.allFTAs)
          .setIn(['hearings', action.value.personId], action.value.allHearings),
        FAILURE: () => state
          .setIn(['caseHistory', action.value.personId], Immutable.List())
          .setIn(['manualCaseHistory', action.value.personId], Immutable.List())
          .setIn(['chargeHistory', action.value.personId], Immutable.Map())
          .setIn(['manualChargeHistory', action.value.personId], Immutable.Map())
          .setIn(['sentenceHistory', action.value.personId], Immutable.Map())
          .setIn(['ftaHistory', action.value.personId], Immutable.List())
          .setIn(['hearings', action.value.personId], Immutable.List())
      });
    }

    case loadPSAData.case(action.type): {
      return loadPSAData.reducer(state, action, {
        REQUEST: () => state
          .set('loadingPSAData', true)
          .set('errorMessage', ''),
        SUCCESS: () => state
          .set('psaNeighborsById', Immutable.fromJS(action.value.psaNeighborsById))
          .set('psaNeighborsByDate', Immutable.fromJS(action.value.psaNeighborsByDate))
          .set('allFilers', action.value.allFilers.sort())
          .set('errorMessage', ''),
        FAILURE: () => state
          .set('psaNeighborsByDate', Immutable.Map())
          .set('errorMessage', action.value),
        FINALLY: () => state.set('loadingPSAData', false)
      });
    }

    case loadPSAsByDate.case(action.type): {
      return loadPSAsByDate.reducer(state, action, {
        REQUEST: () => state
          .set('loadingResults', true)
          .set('scoresEntitySetId', ''),
        SUCCESS: () => state
          .set('scoresAsMap', Immutable.fromJS(action.value.scoresAsMap))
          .set('scoresEntitySetId', action.value.entitySetId),
        FAILURE: () => state
          .set('scoresEntitySetId', '')
          .set('scoresAsMap', Immutable.Map()),
        FINALLY: () => state.set('loadingResults', false)
      });
    }

    case refreshPSANeighbors.case(action.type): {
      return refreshPSANeighbors.reducer(state, action, {
        REQUEST: () => state.set('psaIdsRefreshing', state.get('psaIdsRefreshing').add(action.value.id)),
        SUCCESS: () => {
          let psaNeighborsById = state.get('psaNeighborsById');

          psaNeighborsById = psaNeighborsById.set(action.value.id, Immutable.fromJS(action.value.neighbors));

          return state.set('psaNeighborsById', psaNeighborsById);
        },
        FINALLY: () => state.set('psaIdsRefreshing', state.get('psaIdsRefreshing').delete(action.value.id))
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

          let scoresAsMap = state.get('scoresAsMap');
          let psaNeighborsByDate = state.get('psaNeighborsByDate');
          scoresAsMap = scoresAsMap.set(scoresId, Immutable.fromJS(newScoreEntity));
          const notesEntity = newNotesEntity
            ? Immutable.fromJS(newNotesEntity)
            : state.getIn(['psaNeighborsById', scoresId, ENTITY_SETS.RELEASE_RECOMMENDATIONS, 'neighborDetails']);
          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(scoresId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn(
                [date, scoresId, ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'],
                Immutable.fromJS(newRiskFactorsEntity)
              ).setIn(
                [date, scoresId, ENTITY_SETS.DMF_RESULTS, 'neighborDetails'],
                Immutable.fromJS(newDMFEntity)
              ).setIn(
                [date, scoresId, ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'],
                Immutable.fromJS(newDMFRiskFactorsEntity)
              ).setIn(
                [date, scoresId, ENTITY_SETS.RELEASE_RECOMMENDATIONS, 'neighborDetails'],
                Immutable.fromJS(notesEntity)
              );
            }
          });
          const psaNeighborsById = state.get('psaNeighborsById')
            .setIn(
              [scoresId, ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'],
              Immutable.fromJS(newRiskFactorsEntity)
            )
            .setIn(
              [scoresId, ENTITY_SETS.DMF_RESULTS, 'neighborDetails'],
              Immutable.fromJS(newDMFEntity)
            )
            .setIn(
              [scoresId, ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'],
              Immutable.fromJS(newDMFRiskFactorsEntity)
            )
            .setIn(
              [scoresId, ENTITY_SETS.RELEASE_RECOMMENDATIONS, 'neighborDetails'],
              Immutable.fromJS(notesEntity)
            );
          return state
            .set('scoresAsMap', scoresAsMap)
            .set('psaNeighborsById', psaNeighborsById)
            .set('psaNeighborsByDate', psaNeighborsByDate);
        }
      });
    }

    default:
      return state;
  }
}
