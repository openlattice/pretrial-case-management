/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import {
  CLEAR_CHECK_INS_FORM,
  loadCheckInsForm
} from './CheckInsActionFactory';
import { CHECK_IN } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [CHECK_IN.FORM_NEIGHBORS]: Map(),
  [CHECK_IN.LOADING_FORM]: false
});

export default function manualRemindersReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case CLEAR_CHECK_INS_FORM:
      return INITIAL_STATE;

    case loadCheckInsForm.case(action.type): {
      return loadCheckInsForm.reducer(state, action, {
        REQUEST: () => state.set(CHECK_IN.LOADING_FORM, true),
        SUCCESS: () => {
          const { formNeighbors } = action.value;
          return state.set(CHECK_IN.FORM_NEIGHBORS, formNeighbors);
        },
        FINALLY: () => state.set(CHECK_IN.LOADING_FORM, false)
      });
    }

    default:
      return state;
  }
}
