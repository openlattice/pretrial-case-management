/*
 * @flow
 */

import Immutable from 'immutable';

import * as ActionTypes from './ReviewActionTypes';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  scoresAsMap: Immutable.Map(),
  psaNeighborsByDate: Immutable.Map(),
  loadingResults: false,
  errorMesasge: ''
});

export default function reviewReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case ActionTypes.LOAD_PSAS_BY_DATE_REQUEST:
      return state
        .set('loadingResults', true)
        .set('errorMesasge', '');

    case ActionTypes.LOAD_PSAS_BY_DATE_SUCCESS:
      return state
        .set('scoresAsMap', action.scoresAsMap)
        .set('psaNeighborsByDate', action.psaNeighborsByDate)
        .set('loadingResults', false)
        .set('errorMesasge', '');

    case ActionTypes.LOAD_PSAS_BY_DATE_FAILURE:
      return state
        .set('scoresAsMap', Immutable.Map())
        .set('psaNeighborsByDate', Immutable.Map())
        .set('loadingResults', false)
        .set('errorMesasge', action.errorMesasge);

    default:
      return state;
  }
}
