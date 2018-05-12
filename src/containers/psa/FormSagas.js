/*
 * @flow
 */

import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, takeEvery, all } from 'redux-saga/effects';

import {
  HARD_RESTART,
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  UPDATE_NOTES,
  loadDataModel,
  loadNeighbors,
  updateNotes
} from './FormActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

function* loadDataModelWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadDataModel.request(action.id));
    const entitySetIds = yield all(Object.values(ENTITY_SETS).map(entitySetName =>
      call(EntityDataModelApi.getEntitySetId, entitySetName)));
    const selectors = entitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: ['EntitySet', 'EntityType', 'PropertyTypeInEntitySet']
    }));
    const dataModel = yield call(EntityDataModelApi.getEntityDataModelProjection, selectors);
    yield put(loadDataModel.success(action.id, { dataModel }));
  }
  catch (error) {
    yield put(loadDataModel.failure(action.id, { error }));
  }
  finally {
    yield put(loadDataModel.finally(action.id));
  }
}

function* loadDataModelWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DATA_MODEL, loadDataModelWorker);
}

function* loadNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entitySetId, entityKeyId } = action.value;

  try {
    yield put(loadNeighbors.request(action.id));
    const neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
    yield put(loadNeighbors.success(action.id, { neighbors }));
  }
  catch (error) {
    yield put(loadNeighbors.failure(action.id));
  }
  finally {
    yield put(loadNeighbors.finally(action.id));
  }
}

function* loadNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_NEIGHBORS, loadNeighborsWorker);
}

function* updateNotesWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    notes,
    entityId,
    entitySetId,
    propertyTypes
  } = action.value;

  try {
    yield put(updateNotes.request(action.id));
    const fqnToId = {};
    propertyTypes.forEach((propertyType) => {
      const fqn = `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`;
      fqnToId[fqn] = propertyType.get('id');
    });
    const searchOptions = {
      start: 0,
      maxHits: 1,
      searchTerm: `${fqnToId[PROPERTY_TYPES.GENERAL_ID]}:"${entityId}"`
    };
    const response = yield call(SearchApi.searchEntitySetData, entitySetId, searchOptions);
    const result = response.hits[0];
    if (result) {
      const entity = {};
      Object.keys(result).forEach((fqn) => {
        const propertyTypeId = fqnToId[fqn];
        if (propertyTypeId) entity[propertyTypeId] = result[fqn];
      });
      entity[fqnToId[PROPERTY_TYPES.RELEASE_RECOMMENDATION]] = [notes];
      yield call(DataApi.replaceEntityInEntitySet, entitySetId, result.id[0], entity);
      yield put(updateNotes.success(action.id));
    }
  }
  catch (error) {
    console.error(error);
    yield put(updateNotes.failure(action.id));
  }
  finally {
    yield put(updateNotes.finally(action.id));
  }
}

function* updateNotesWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_NOTES, updateNotesWorker);
}

function* hardRestartWorker() :Generator<*, *, *> {
  // hardRestartWorker and Watcher taken from BHR
  yield call(() => {
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  });
}

function* hardRestartWatcher() :Generator<*, *, *> {

  yield takeEvery(HARD_RESTART, hardRestartWorker);
}


export {
  hardRestartWatcher,
  loadDataModelWatcher,
  loadNeighborsWatcher,
  updateNotesWatcher
};
