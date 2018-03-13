/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const SUBMIT :string = 'SUBMIT';
const submit :RequestSequence = newRequestSequence(SUBMIT);

export {
  SUBMIT,
  submit
};
