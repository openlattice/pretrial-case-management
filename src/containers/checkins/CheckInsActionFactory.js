/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_CHECK_INS_FORM :string = 'CLEAR_CHECK_INS_FORM';
const clearCheckInsForm :RequestSequence = newRequestSequence(CLEAR_CHECK_INS_FORM);

const LOAD_CHECK_INS_FORM :string = 'LOAD_CHECK_INS_FORM';
const loadCheckInsForm :RequestSequence = newRequestSequence(LOAD_CHECK_INS_FORM);

export {
  CLEAR_CHECK_INS_FORM,
  LOAD_CHECK_INS_FORM,
  clearCheckInsForm,
  loadCheckInsForm
};
