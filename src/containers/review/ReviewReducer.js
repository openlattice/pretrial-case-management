/*
 * @flow
 */

import Immutable from 'immutable';

import {
  checkPSAPermissions,
  loadCaseHistory,
  loadPSAsByDate,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  scoresEntitySetId: '',
  scoresAsMap: Immutable.Map(),
  psaNeighborsById: Immutable.Map(),
  psaNeighborsByDate: Immutable.Map(),
  loadingResults: false,
  errorMesasge: '',
  allFilers: Immutable.Set(),
  caseHistory: Immutable.Map(),
  manualCaseHistory: Immutable.Map(),
  chargeHistory: Immutable.Map(),
  manualChargeHistory: Immutable.Map(),
  sentenceHistory: Immutable.Map(),
  ftaHistory: Immutable.Map(),
  readOnly: true
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

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
          .setIn(['ftaHistory', action.value.personId], Immutable.List()),
        SUCCESS: () => state
          .setIn(['caseHistory', action.value.personId], action.value.allCases)
          .setIn(['manualCaseHistory', action.value.personId], action.value.allManualCases)
          .setIn(['chargeHistory', action.value.personId], action.value.chargesByCaseId)
          .setIn(['manualChargeHistory', action.value.personId], action.value.manualChargesByCaseId)
          .setIn(['sentenceHistory', action.value.personId], action.value.sentencesByCaseId)
          .setIn(['ftaHistory', action.value.personId], action.value.allFTAs),
        FAILURE: () => state
          .setIn(['caseHistory', action.value.personId], Immutable.List())
          .setIn(['manualCaseHistory', action.value.personId], Immutable.List())
          .setIn(['chargeHistory', action.value.personId], Immutable.Map())
          .setIn(['manualChargeHistory', action.value.personId], Immutable.Map())
          .setIn(['sentenceHistory', action.value.personId], Immutable.Map())
          .setIn(['ftaHistory', action.value.personId], Immutable.List())
      });
    }

    case loadPSAsByDate.case(action.type): {
      return loadPSAsByDate.reducer(state, action, {
        REQUEST: () => state
          .set('loadingResults', true)
          .set('errorMesasge', '')
          .set('scoresEntitySetId', ''),
        SUCCESS: () => state
          .set('scoresAsMap', Immutable.fromJS(action.value.scoresAsMap))
          .set('scoresEntitySetId', action.value.entitySetId)
          .set('psaNeighborsById', Immutable.fromJS(action.value.psaNeighborsById))
          .set('psaNeighborsByDate', Immutable.fromJS(action.value.psaNeighborsByDate))
          .set('allFilers', action.value.allFilers.sort())
          .set('errorMesasge', ''),
        FAILURE: () => state
          .set('scoresEntitySetId', '')
          .set('scoresAsMap', Immutable.Map())
          .set('psaNeighborsByDate', Immutable.Map())
          .set('errorMesasge', action.value.errorMesasge),
        FINALLY: () => state.set('loadingResults', false)
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
            newDMFRiskFactorsEntity
          } = action.value;

          let scoresAsMap = state.get('scoresAsMap');
          let psaNeighborsByDate = state.get('psaNeighborsByDate');
          scoresAsMap = scoresAsMap.set(scoresId, Immutable.fromJS(newScoreEntity));
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
              );
            }
          });
          const psaNeighborsById = state.get('psaNeighborsById')
            .setIn(
              [scoresId, ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'],
              Immutable.fromJS(newRiskFactorsEntity)
            ).setIn(
              [scoresId, ENTITY_SETS.DMF_RESULTS, 'neighborDetails'],
              Immutable.fromJS(newDMFEntity)
            ).setIn(
              [scoresId, ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'],
              Immutable.fromJS(newDMFRiskFactorsEntity)
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
