/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SUBSCRIPTION_MODAL :string = 'CLEAR_SUBSCRIPTION_MODAL';
const clearSubscriptionModal :RequestSequence = newRequestSequence(CLEAR_SUBSCRIPTION_MODAL);


const LOAD_SUBSCRIPTION_MODAL :string = 'LOAD_SUBSCRIPTION_MODAL';
const loadSubcriptionModal :RequestSequence = newRequestSequence(LOAD_SUBSCRIPTION_MODAL);

export {
  CLEAR_SUBSCRIPTION_MODAL,
  LOAD_SUBSCRIPTION_MODAL,
  clearSubscriptionModal,
  loadSubcriptionModal
};
