/*
 * @flow
 */

import Immutable from 'immutable';

import {
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
  chargeHistory: Immutable.Map()
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn(['caseHistory', action.value.personId], Immutable.Map())
          .setIn(['chargeHistory', action.value.personId], Immutable.Map()),
        SUCCESS: () => state
          .setIn(['caseHistory', action.value.personId], action.value.casesById)
          .setIn(['chargeHistory', action.value.personId], action.value.chargesByCaseId),
        FAILURE: () => state
          .setIn(['caseHistory', action.value.personId], Immutable.Map())
          .setIn(['chargeHistory', action.value.personId], Immutable.Map())
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
          const { scoresId, newScoreEntity, newRiskFactorsEntity } = action.value;
          let scoresAsMap = state.get('scoresAsMap');
          let psaNeighborsByDate = state.get('psaNeighborsByDate');
          scoresAsMap = scoresAsMap.set(scoresId, Immutable.fromJS(newScoreEntity));
          psaNeighborsByDate.keySeq().forEach((date) => {
            if (psaNeighborsByDate.get(date).get(scoresId)) {
              psaNeighborsByDate = psaNeighborsByDate.setIn(
                [date, scoresId, ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'],
                Immutable.fromJS(newRiskFactorsEntity)
              );
            }
          });
          const psaNeighborsById = state.get('psaNeighborsById')
            .setIn(
              [scoresId, ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'],
              Immutable.fromJS(newRiskFactorsEntity)
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
