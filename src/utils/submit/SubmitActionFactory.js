/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_SUBMIT :string = 'CLEAR_SUBMIT';
const clearSubmit :RequestSequence = newRequestSequence(CLEAR_SUBMIT);

const REPLACE_ENTITY :string = 'REPLACE_ENTITY';
const replaceEntity :RequestSequence = newRequestSequence(REPLACE_ENTITY);

const SUBMIT :string = 'SUBMIT';
const submit :RequestSequence = newRequestSequence(SUBMIT);

export {
  CLEAR_SUBMIT,
  REPLACE_ENTITY,
  SUBMIT,
  clearSubmit,
  replaceEntity,
  submit
};
