/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SUBSCRIPTION_MODAL :'CLEAR_SUBSCRIPTION_MODAL' = 'CLEAR_SUBSCRIPTION_MODAL';
const clearSubscriptionModal = () => ({
  type: CLEAR_SUBSCRIPTION_MODAL
});

const LOAD_SUBSCRIPTION_MODAL :string = 'LOAD_SUBSCRIPTION_MODAL';
const loadSubcriptionModal :RequestSequence = newRequestSequence(LOAD_SUBSCRIPTION_MODAL);

const SUBSCRIBE :string = 'SUBSCRIBE';
const subscribe :RequestSequence = newRequestSequence(SUBSCRIBE);

const UNSUBSCRIBE :string = 'UNSUBSCRIBE';
const unsubscribe :RequestSequence = newRequestSequence(UNSUBSCRIBE);

export {
  CLEAR_SUBSCRIPTION_MODAL,
  LOAD_SUBSCRIPTION_MODAL,
  SUBSCRIBE,
  UNSUBSCRIBE,
  clearSubscriptionModal,
  loadSubcriptionModal,
  subscribe,
  unsubscribe
};
