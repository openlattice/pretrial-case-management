/*
 * @flow
 */

import Immutable from 'immutable';

import * as SubmitActionTypes from './SubmitActionTypes';

const INITIAL_STATE :Map<> = Immutable.Map().withMutations((map :Map<>) => {
  map.set('submitSuccess', false);
});

function submitReducer(state :Map<> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case SubmitActionTypes.SUBMIT_SUCCESS: {
      return state;
    }

    default:
      return state;
  }
}

export default submitReducer;
