/*
 * @flow
 */

import Immutable from 'immutable';

import { CLEAR_SUBMIT, replaceEntity, submit } from './SubmitActionFactory';
import { CLEAR_FORM } from '../../containers/psa/FormActionFactory';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.Map().withMutations((map :Immutable.Map<*, *>) => {
  map.set('submitting', false);
  map.set('submitSuccess', false);
  map.set('submitted', false)
  map.set('error', '')
});

function submitReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case replaceEntity.case(action.type): {
      return replaceEntity.reducer(state, action, {
        REQUEST: () => state
          .set('submitting', true)
          .set('submitted', false)
          .set('submitSuccess', false)
          .set('error', ''),
        SUCCESS: () => state.set('submitSuccess', true).set('error', ''),
        FAILURE: () => state.set('submitSuccess', false).set('error', action.value),
        FINALLY: () => state.set('submitting', false).set('submitted', true)
      });
    }

    case submit.case(action.type): {
      return submit.reducer(state, action, {
        REQUEST: () => state
          .set('submitting', true)
          .set('submitted', false)
          .set('submitSuccess', false)
          .set('error', ''),
        SUCCESS: () => state.set('submitSuccess', true).set('error', ''),
        FAILURE: () => state.set('submitSuccess', false).set('error', action.value),
        FINALLY: () => state.set('submitting', false).set('submitted', true)
      });
    }

    case CLEAR_SUBMIT:
    case CLEAR_FORM:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default submitReducer;
