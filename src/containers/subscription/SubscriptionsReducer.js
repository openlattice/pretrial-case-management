/*
 * @flow
 */

import { Map, List, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';


import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, SUBSCRIPTIONS } from '../../utils/consts/FrontEndStateConsts';
import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { getEntityKeyId } from '../../utils/DataUtils';
import { SUBSCRIPTION_ACTIONS, SUBSCRIPTION_DATA } from '../../utils/consts/redux/SubscriptionConsts';

import { submitContact, updateContactsBulk } from '../contactinformation/ContactInfoActions';
import {
  CLEAR_SUBSCRIPTION_MODAL,
  loadSubcriptionModal,
  subscribe,
  unsubscribe
} from './SubscriptionActions';

const { CONTACT_INFORMATION, SUBSCRIPTION } = APP_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [SUBSCRIPTION_ACTIONS.SUBSCRIBE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [SUBSCRIPTION_ACTIONS.UNSUBSCRIBE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL]: Map(),
    [SUBSCRIPTION_ACTIONS.SUBSCRIBE]: Map(),
    [SUBSCRIPTION_ACTIONS.UNSUBSCRIBE]: Map()
  },
  [SUBSCRIPTION_DATA.CONTACT_INFO]: List(),
  [SUBSCRIPTION_DATA.PERSON_NEIGHBORS]: Map(),
  [SUBSCRIPTION_DATA.SUBSCRIPTION]: Map(),
  [SUBSCRIPTION_DATA.SUBSCRIPTIONS_BY_ID]: Map()
});

export default function subscriptionsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_SUBSCRIPTION_MODAL: return INITIAL_STATE;

    case loadSubcriptionModal.case(action.type): {
      return loadSubcriptionModal.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL, action.id], action)
          .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { personNeighbors } = action.value;
          const contactInfo = personNeighbors.get(CONTACT_INFORMATION, List());
          const subscription = personNeighbors.get(SUBSCRIPTION, Map());

          const subscriptionEKID = getEntityKeyId(subscription);
          const subscriptionsById = state
            .get(SUBSCRIPTION_DATA.SUBSCRIPTIONS_BY_ID, Map()).set(subscriptionEKID, subscription);
          return state
            .set(SUBSCRIPTION_DATA.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTION_DATA.CONTACT_INFO, contactInfo)
            .set(SUBSCRIPTIONS.SUBSCRIPTION, subscription)
            .set(SUBSCRIPTIONS.SUBSCRIPTIONS_BY_ID, subscriptionsById)
            .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(SUBSCRIPTIONS.SUBSCRIPTION, Map())
            .setIn([REDUX.ERRORS, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL], error)
            .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL, action.id])
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

    case subscribe.case(action.type): {
      return subscribe.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.SUBSCRIBE, action.id], action)
          .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.SUBSCRIBE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { subscriptionEKID, subscription } = action.value;
          const personNeighbors = state
            .get(SUBSCRIPTION_DATA.PERSON_NEIGHBORS, Map())
            .set(SUBSCRIPTION, subscription);
          const subscriptionsById = state
            .get(SUBSCRIPTION_DATA.SUBSCRIPTIONS_BY_ID, Map()).set(subscriptionEKID, subscription);
          return state
            .set(SUBSCRIPTION_DATA.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTIONS.SUBSCRIPTION, subscription)
            .set(SUBSCRIPTIONS.SUBSCRIPTIONS_BY_ID, subscriptionsById)
            .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.SUBSCRIBE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(SUBSCRIPTIONS.SUBSCRIPTION, Map())
            .setIn([REDUX.ERRORS, SUBSCRIPTION_ACTIONS.SUBSCRIBE], error)
            .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.SUBSCRIBE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.SUBSCRIBE, action.id])
      });
    }

    case unsubscribe.case(action.type): {
      return unsubscribe.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE, action.id], action)
          .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { subscriptionEKID, subscription } = action.value;
          const personNeighbors = state
            .get(SUBSCRIPTION_DATA.PERSON_NEIGHBORS, Map())
            .set(SUBSCRIPTION, subscription);
          const subscriptionsById = state
            .get(SUBSCRIPTION_DATA.SUBSCRIPTIONS_BY_ID, Map()).set(subscriptionEKID, subscription);
          return state
            .set(SUBSCRIPTION_DATA.PERSON_NEIGHBORS, personNeighbors)
            .set(SUBSCRIPTIONS.SUBSCRIPTION, subscription)
            .set(SUBSCRIPTIONS.SUBSCRIPTIONS_BY_ID, subscriptionsById)
            .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(SUBSCRIPTIONS.SUBSCRIPTION, Map())
            .setIn([REDUX.ERRORS, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE], error)
            .setIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE, action.id])
      });
    }

    default:
      return state;
  }
}
