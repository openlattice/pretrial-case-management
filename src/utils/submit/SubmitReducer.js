/*
 * @flow
 */

import Immutable from 'immutable';

import { submit } from './SubmitActionFactory';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.Map().withMutations((map :Immutable.Map<*, *>) => {
  map.set('submitSuccess', false);
});

function submitReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case submit.case(action.type): {
      return submit.reducer(state, action, {
        REQUEST: () => state.set('submitSuccess', false),
        SUCCESS: () => state.set('submitSuccess', true),
        FAILURE: () => state.set('submitSuccess', false)
      });
    }

    default:
      return state;
  }
}

export default submitReducer;
