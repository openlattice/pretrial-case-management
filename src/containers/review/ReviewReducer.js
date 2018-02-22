/*
 * @flow
 */

import Immutable from 'immutable';

import * as ActionTypes from './ReviewActionTypes';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  scoresEntitySetId: '',
  scoresAsMap: Immutable.Map(),
  psaNeighborsByDate: Immutable.Map(),
  loadingResults: false,
  errorMesasge: ''
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case ActionTypes.LOAD_PSAS_BY_DATE_REQUEST:
      return state
        .set('loadingResults', true)
        .set('errorMesasge', '')
        .set('scoresEntitySetId', '');

    case ActionTypes.LOAD_PSAS_BY_DATE_SUCCESS:
      return state
        .set('scoresAsMap', action.scoresAsMap)
        .set('scoresEntitySetId', action.entitySetId)
        .set('psaNeighborsByDate', action.psaNeighborsByDate)
        .set('loadingResults', false)
        .set('errorMesasge', '');

    case ActionTypes.LOAD_PSAS_BY_DATE_FAILURE:
      return state
        .set('scoresEntitySetId', '')
        .set('scoresAsMap', Immutable.Map())
        .set('psaNeighborsByDate', Immutable.Map())
        .set('loadingResults', false)
        .set('errorMesasge', action.errorMesasge);

    case ActionTypes.UPDATE_SCORES_AND_RISK_FACTORS_SUCCESS: {
      let scoresAsMap = state.get('scoresAsMap');
      let psaNeighborsByDate = state.get('psaNeighborsByDate');
      scoresAsMap = scoresAsMap.set(action.scoresId, Immutable.fromJS(action.scoresEntity));
      psaNeighborsByDate.keySeq().forEach((date) => {
        if (psaNeighborsByDate.get(date).get(action.scoresId)) {
          psaNeighborsByDate = psaNeighborsByDate.setIn(
            [date, action.scoresId, ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'],
            Immutable.fromJS(action.riskFactorsEntity)
          );
        }
      });
      return state
        .set('scoresAsMap', scoresAsMap)
        .set('psaNeighborsByDate', psaNeighborsByDate);
    }

    default:
      return state;
  }
}
