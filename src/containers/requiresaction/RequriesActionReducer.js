/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOAD_REQUIRES_ACTION,
  SET_VALUE,
  loadRequiresAction
} from './actions';

import REQUIRES_ACTION from '../../utils/consts/redux/RequiresAction';
import {
  HITS,
  PAGE,
  REQUEST_STATE,
  RS_INITIAL_STATE,
  TOTAL_HITS,
} from '../../core/redux/constants';
import { PSA_STATUSES } from '../../utils/consts/Consts';

const INITIAL_STATE = fromJS({
  [LOAD_REQUIRES_ACTION]: RS_INITIAL_STATE,

  [HITS]: Map(),
  [PAGE]: 1,
  [TOTAL_HITS]: 0,
  [REQUIRES_ACTION.STATUS]: PSA_STATUSES.OPEN,
  decending: false,

});

export default function reducer(state :Map = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case loadRequiresAction.case(action.type): {
      return loadRequiresAction.reducer(state, action, {
        REQUEST: () => state
          .setIn([LOAD_REQUIRES_ACTION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([LOAD_REQUIRES_ACTION, action.id], action),
        SUCCESS: () => {
          const storedAction = state.getIn([LOAD_REQUIRES_ACTION, action.id]);
          if (storedAction) {
            const { numHits, psaMap } = action.value;
            return state
              .set(HITS, psaMap)
              .set(TOTAL_HITS, numHits)
              .setIn([LOAD_REQUIRES_ACTION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([LOAD_REQUIRES_ACTION, action.id])) {
            return state.setIn([LOAD_REQUIRES_ACTION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([LOAD_REQUIRES_ACTION, action.id]),
      });
    }

    case SET_VALUE: {
      const { field, value } = action.value;
      return state.set(field, value);
    }

    default:
      return state;
  }
}
