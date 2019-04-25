/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_SUBMIT :string = 'CLEAR_SUBMIT';
const clearSubmit :RequestSequence = newRequestSequence(CLEAR_SUBMIT);

const CREATE_ASSOCIATIONS :string = 'CREATE_ASSOCIATIONS';
const createAssociations :RequestSequence = newRequestSequence(CREATE_ASSOCIATIONS);

const REPLACE_ENTITY :string = 'REPLACE_ENTITY';
const replaceEntity :RequestSequence = newRequestSequence(REPLACE_ENTITY);

const REPLACE_ASSOCIATION :string = 'REPLACE_ASSOCIATION';
const replaceAssociation :RequestSequence = newRequestSequence(REPLACE_ASSOCIATION);

const SUBMIT :string = 'SUBMIT';
const submit :RequestSequence = newRequestSequence(SUBMIT);

export {
  CLEAR_SUBMIT,
  CREATE_ASSOCIATIONS,
  REPLACE_ASSOCIATION,
  REPLACE_ENTITY,
  SUBMIT,
  clearSubmit,
  createAssociations,
  replaceEntity,
  replaceAssociation,
  submit
};
