/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_PSA_MODAL :string = 'CLEAR_PSA_MODAL';
const clearPSAModal :RequestSequence = newRequestSequence(CLEAR_PSA_MODAL);

const LOAD_PSA_MODAL :string = 'LOAD_PSA_MODAL';
const loadPSAModal :RequestSequence = newRequestSequence(LOAD_PSA_MODAL);

export {
  CLEAR_PSA_MODAL,
  LOAD_PSA_MODAL,
  clearPSAModal,
  loadPSAModal
};
