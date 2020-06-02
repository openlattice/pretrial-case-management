/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_ASSOCIATIONS :string = 'CREATE_ASSOCIATIONS';
const createAssociations :RequestSequence = newRequestSequence(CREATE_ASSOCIATIONS);

const DELETE_ENTITY :string = 'DELETE_ENTITY';
const deleteEntity :RequestSequence = newRequestSequence(DELETE_ENTITY);

export {
  CREATE_ASSOCIATIONS,
  DELETE_ENTITY,
  createAssociations,
  deleteEntity
};
