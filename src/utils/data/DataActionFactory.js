/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DELETE_ENTITY :string = 'DELETE_ENTITY';
const deleteEntity :RequestSequence = newRequestSequence(DELETE_ENTITY);

const REPLACE_ENTITY :string = 'REPLACE_ENTITY';
const replaceEntity :RequestSequence = newRequestSequence(REPLACE_ENTITY);

export {
  DELETE_ENTITY,
  REPLACE_ENTITY,
  deleteEntity,
  replaceEntity
};
