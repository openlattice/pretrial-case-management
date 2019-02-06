/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import { loadSubcriptionModal } from './SubscriptionsActionFactory';

import { SUBSCRIPTIONS } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL]: false,
  [SUBSCRIPTIONS.PERSON_NEIGHBORS]: Map(),
});
export default function subscriptionsReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case loadSubcriptionModal.case(action.type): {
      return loadSubcriptionModal.reducer(state, action, {
        REQUEST: () => state.set(SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL, true),
        SUCCESS: () => {
          const { personNeighbors } = action.value;
          return state.set(
            SUBSCRIPTIONS.PERSON_NEIGHBORS,
            personNeighbors
          );
        },
        FINALLY: () => state.set(SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL, false)
      });
    }

    default:
      return state;
  }
}
