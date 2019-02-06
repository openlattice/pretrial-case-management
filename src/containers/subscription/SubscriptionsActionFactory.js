/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_SUBSCRIPTION_MODAL :string = 'LOAD_SUBSCRIPTION_MODAL';
const loadSubcriptionModal :RequestSequence = newRequestSequence(LOAD_SUBSCRIPTION_MODAL);

export {
  LOAD_SUBSCRIPTION_MODAL,
  loadSubcriptionModal
};
