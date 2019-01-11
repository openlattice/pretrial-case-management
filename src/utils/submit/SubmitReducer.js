/*
 * @flow
 */

import Immutable from 'immutable';

import { CLEAR_FORM } from '../../containers/psa/FormActionFactory';
import { SUBMIT } from '../consts/FrontEndStateConsts';
import {
  CLEAR_SUBMIT,
  replaceAssociation,
  replaceEntity,
  submit
} from './SubmitActionFactory';


const INITIAL_STATE :Immutable.Map<*, *> = Immutable.Map().withMutations((map :Immutable.Map<*, *>) => {
  map.set(SUBMIT.REPLACING_ASSOCIATION, false);
  map.set(SUBMIT.REPLACE_ASSOCIATION_SUCCESS, false);
  map.set(SUBMIT.REPLACING_ENTITY, false);
  map.set(SUBMIT.REPLACE_ENTITY_SUCCESS, false);
  map.set(SUBMIT.SUBMITTING, false);
  map.set(SUBMIT.SUCCESS, false);
  map.set(SUBMIT.SUBMITTED, false);
  map.set(SUBMIT.ERROR, '');
});

function submitReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case replaceEntity.case(action.type): {
      return replaceEntity.reducer(state, action, {
        REQUEST: () => state
          .set(SUBMIT.REPLACING_ENTITY, true)
          .set(SUBMIT.REPLACE_ENTITY_SUCCESS, false)
          .set(SUBMIT.ERROR, ''),
        SUCCESS: () => state
          .set(SUBMIT.REPLACE_ENTITY_SUCCESS, true)
          .set(SUBMIT.ERROR, ''),
        FAILURE: () => state
          .set(SUBMIT.REPLACE_ENTITY_SUCCESS, true)
          .set(SUBMIT.ERROR, action.value),
        FINALLY: () => state.set(SUBMIT.REPLACING_ENTITY, false)
      });
    }

    case submit.case(action.type): {
      return submit.reducer(state, action, {
        REQUEST: () => state
          .set(SUBMIT.SUBMITTING, true)
          .set(SUBMIT.SUBMITTED, false)
          .set(SUBMIT.SUCCESS, false)
          .set(SUBMIT.ERROR, ''),
        SUCCESS: () => state.set(SUBMIT.SUCCESS, true).set(SUBMIT.ERROR, ''),
        FAILURE: () => state.set(SUBMIT.SUCCESS, false).set(SUBMIT.ERROR, action.value),
        FINALLY: () => state.set(SUBMIT.SUBMITTING, false).set(SUBMIT.SUBMITTED, true)
      });
    }

    case replaceAssociation.case(action.type): {
      return replaceAssociation.reducer(state, action, {
        REQUEST: () => state
          .set(SUBMIT.REPLACING_ASSOCIATION, true)
          .set(SUBMIT.REPLACE_ASSOCIATION_SUCCESS, false)
          .set(SUBMIT.ERROR, ''),
        SUCCESS: () => state
          .set(SUBMIT.REPLACE_ASSOCIATION_SUCCESS, true)
          .set(SUBMIT.REPLACING_ASSOCIATION, true)
          .set(SUBMIT.ERROR, ''),
        FAILURE: () => state
          .set(SUBMIT.REPLACE_ASSOCIATION_SUCCESS, false)
          .set(SUBMIT.ERROR, action.value),
        FINALLY: () => state.set(SUBMIT.REPLACING_ASSOCIATION, false)
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
