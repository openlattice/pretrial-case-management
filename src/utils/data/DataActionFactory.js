/*
 * @flow
 */

import * as ActionTypes from './DataActionTypes';

export function deleteEntityRequest(entitySetId :UUID, entityKeyId :UUID) {
  return {
    type: ActionTypes.DELETE_ENTITY_REQUEST,
    entitySetId,
    entityKeyId
  };
}

export function deleteEntitySuccess(entityKeyId :UUID) {
  return {
    type: ActionTypes.DELETE_ENTITY_SUCCESS,
    entityKeyId
  };
}

export function deleteEntityFailure(entityKeyId :UUID, errorMessage :string) {
  return {
    type: ActionTypes.DELETE_ENTITY_FAILURE,
    entityKeyId,
    errorMessage
  };
}

export function replaceEntityRequest(entitySetId :UUID, entityKeyId :UUID, entity :Object) {
  return {
    type: ActionTypes.REPLACE_ENTITY_REQUEST,
    entitySetId,
    entityKeyId,
    entity
  };
}

export function replaceEntitySuccess(entityKeyId :UUID) {
  return {
    type: ActionTypes.REPLACE_ENTITY_SUCCESS,
    entityKeyId
  };
}

export function replaceEntityFailure(entityKeyId :UUID, errorMessage :string) {
  return {
    type: ActionTypes.REPLACE_ENTITY_FAILURE,
    entityKeyId,
    errorMessage
  };
}
