/*
 * @flow
 */

import { Map, List, fromJS } from 'immutable';

import { CLEAR_SUBSCRIPTION_MODAL, loadSubcriptionModal } from './SubscriptionsActionFactory';
import { refreshPersonNeighbors, updateContactInfo } from '../people/PeopleActionFactory';

import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, SUBSCRIPTIONS } from '../../utils/consts/FrontEndStateConsts';

const { CONTACT_INFORMATION, SUBSCRIPTION } = APP_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL]: false,
  [SUBSCRIPTIONS.CONTACT_INFO]: List(),
  [SUBSCRIPTIONS.PERSON_NEIGHBORS]: Map(),
  [SUBSCRIPTIONS.SUBSCRIPTION]: Map()
});
export default function subscriptionsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_SUBSCRIPTION_MODAL: return INITIAL_STATE;

    case loadSubcriptionModal.case(action.type): {
      return loadSubcriptionModal.reducer(state, action, {
        REQUEST: () => state.set(SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL, true),
        SUCCESS: () => {
          const { personNeighbors } = action.value;
          return state
            .set(SUBSCRIPTIONS.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTIONS.CONTACT_INFO, personNeighbors.get(CONTACT_INFORMATION, List()))
            .set(SUBSCRIPTIONS.SUBSCRIPTION, personNeighbors.get(SUBSCRIPTION, Map()));
        },
        FINALLY: () => state.set(SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL, false)
      });
    }

    case refreshPersonNeighbors.case(action.type): {
      return refreshPersonNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { neighbors } = action.value;
          const contactInfo = neighbors.get(CONTACT_INFORMATION, Map());
          const subscription = neighbors.getIn([SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], Map());
          const personNeighbors = {
            CONTACT_INFORMATION: contactInfo,
            SUBSCRIPTION: subscription,
          };
          return state
            .set(SUBSCRIPTIONS.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTIONS.CONTACT_INFO, contactInfo)
            .set(SUBSCRIPTIONS.SUBSCRIPTION, subscription);
        }
      });
    }

    case updateContactInfo.case(action.type): {
      return updateContactInfo.reducer(state, action, {
        SUCCESS: () => {
          const { contactInformation } = action.value;
          const personNeighbors = state.merge({ CONTACT_INFORMATION: contactInformation });
          return state
            .set(SUBSCRIPTIONS.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTIONS.CONTACT_INFO, contactInformation);
        }
      });
    }

    default:
      return state;
  }
}
