/*
 * @flow
 */

import Immutable from 'immutable';

import * as ActionTypes from './ReviewActionTypes';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  scoresAsMap: Immutable.Map(),
  psaNeighborsByDate: Immutable.Map(),
  errorMesasge: ''
});

export default function reviewReducer(state :Map<*, *> = INITIAL_STATE, action :Action) {

  switch (action.type) {

    case ActionTypes.LOAD_PSAS_BY_DATE_SUCCESS:
      return state
        .set('scoresAsMap', action.scoresAsMap)
        .set('psaNeighborsByDate', action.psaNeighborsByDate)
        .set('errorMesasge', '');

    case ActionTypes.LOAD_PSAS_BY_DATE_FAILURE:
      return state
        .set('scoresAsMap', Immutable.Map())
        .set('psaNeighborsByDate', Immutable.Map())
        .set('errorMesasge', action.errorMesasge);

    default:
      return state;
  }
}
