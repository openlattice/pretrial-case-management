/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DELETE_ENTITY :string = 'DELETE_ENTITY';
const deleteEntity :RequestSequence = newRequestSequence(DELETE_ENTITY);

const REPLACE_ENTITY_DATA :string = 'REPLACE_ENTITY_DATA';
const replaceEntity :RequestSequence = newRequestSequence(REPLACE_ENTITY_DATA);

const UPDATE_ENTITY_DATA :string = 'UPDATE_ENTITY_DATA';
const updateEntity :RequestSequence = newRequestSequence(UPDATE_ENTITY_DATA);

export {
  DELETE_ENTITY,
  REPLACE_ENTITY_DATA,
  UPDATE_ENTITY_DATA,
  deleteEntity,
  replaceEntity,
  updateEntity
};
