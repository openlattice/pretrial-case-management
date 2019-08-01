/*
 * @flow
 */

import { DataApi, EntityDataModelApi, Types } from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import {
  DELETE_ENTITY,
  REPLACE_ENTITY_DATA,
  UPDATE_ENTITY_DATA,
  deleteEntity,
  replaceEntity,
  updateEntity
} from './DataActionFactory';

import { loadPersonDetails } from '../../containers/person/PersonActions';
import { STATE, SEARCH } from '../consts/FrontEndStateConsts';

const { DeleteTypes } = Types;

function* deleteEntityWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entityKeyId, entitySetName, callback } = action.value;
  let { entitySetId } = action.value;

  try {
    yield put(deleteEntity.request(action.id));
    if (!entitySetId) entitySetId = yield call(EntityDataModelApi.getEntitySetId, entitySetName);
    yield call(DataApi.deleteEntity, entitySetId, entityKeyId, DeleteTypes.Soft);
    yield put(deleteEntity.success(action.id, { entityKeyId }));

    if (callback) callback();

    const state = yield select();
    const personId = state.getIn([STATE.SEARCH, SEARCH.SELECTED_PERSON_ID], '');
    if (personId) yield put(loadPersonDetails({ entityKeyId: personId, shouldLoadCases: false }));
  }
  catch (error) {
    console.error(error);
    yield put(deleteEntity.failure(action.id, { entityKeyId, error }));
  }
  finally {
    yield put(deleteEntity.finally(action.id));
  }
}

function* deleteEntityWatcher() :Generator<*, *, *> {
  yield takeEvery(DELETE_ENTITY, deleteEntityWorker);
}

function* replaceEntityWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    entitySetId,
    entityKeyId,
    entity
  } = action.value;

  try {
    yield put(replaceEntity.request(action.id));
    yield call(DataApi.replaceEntityInEntitySet, entitySetId, entityKeyId, entity);
    yield put(replaceEntity.success(action.id, { entityKeyId }));

    const state = yield select();
    const personId = state.getIn([STATE.SEARCH, SEARCH.SELECTED_PERSON_ID], '');
    if (personId) yield put(loadPersonDetails({ entityKeyId: personId, shouldLoadCases: false }));
  }
  catch (error) {
    yield put(replaceEntity.failure(action.id, { entityKeyId, error }));
  }
  finally {
    yield put(replaceEntity.finally(action.id));
  }
}

function* replaceEntityWatcher() :Generator<*, *, *> {
  yield takeEvery(REPLACE_ENTITY_DATA, replaceEntityWorker);
}

function* updateEntityWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    entitySetId,
    entities,
    updateType,
    callback
  } = action.value;

  try {
    yield put(updateEntity.request(action.id));
    yield call(DataApi.updateEntityData, entitySetId, entities, updateType);
    yield put(updateEntity.success(action.id));

    if (callback) callback();
  }
  catch (error) {
    yield put(updateEntity.failure(action.id, { error }));
  }
  finally {
    yield put(updateEntity.finally(action.id));
  }
}

function* updateEntityWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_ENTITY_DATA, updateEntityWorker);
}

export {
  deleteEntityWatcher,
  replaceEntityWatcher,
  updateEntityWatcher
};
