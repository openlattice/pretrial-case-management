/*
 * @flow
 */

import { Map, List, fromJS } from 'immutable';

import { CLEAR_SUBSCRIPTION_MODAL, loadSubcriptionModal } from './SubscriptionsActionFactory';
import { refreshPersonNeighbors } from '../people/PeopleActionFactory';
import { submitContact, updateContactsBulk } from '../contactinformation/ContactInfoActions';

import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, SUBSCRIPTIONS } from '../../utils/consts/FrontEndStateConsts';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid, getErrorStatus } from '../../utils/consts/redux/ReduxUtils';
import { SUBSCRIPTION_ACTIONS, SUBSCRIPTION_DATA } from '../../utils/consts/redux/SubscriptionConsts';

const { CONTACT_INFORMATION, SUBSCRIPTION } = APP_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [SUBSCRIPTION_ACTIONS.SUBSCRIBE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [SUBSCRIPTION_ACTIONS.UNSUBSCRIBE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [SUBSCRIPTION_ACTIONS.SUBSCRIBE]: Map(),
    [SUBSCRIPTION_ACTIONS.UNSUBSCRIBE]: Map()
  },
  [SUBSCRIPTION_DATA.CONTACT_INFO]: Map(),
  [SUBSCRIPTION_DATA.PERSON_NEIGHBORS]: Map(),
  [SUBSCRIPTION_DATA.SUBMITTED_SUBSCRIPTION]: Map()
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

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        SUCCESS: () => {
          const { contactInfo } = action.value;
          const contactEntity = Map().withMutations(map => map.set(PSA_NEIGHBOR.DETAILS, contactInfo));
          const nextContacts = state.getIn([SUBSCRIPTIONS.PERSON_NEIGHBORS, CONTACT_INFORMATION], List())
            .push(contactEntity);
          const personNeighbors = state.setIn([SUBSCRIPTIONS.PERSON_NEIGHBORS, CONTACT_INFORMATION], nextContacts);
          return state
            .set(SUBSCRIPTIONS.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTIONS.CONTACT_INFO, nextContacts);
        }
      });
    }

    case updateContactsBulk.case(action.type): {
      return updateContactsBulk.reducer(state, action, {
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
