/*
 * @flow
 */

import { EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, takeEvery, all } from 'redux-saga/effects';

import {
  HARD_RESTART,
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  loadDataModel,
  loadNeighbors
} from './FormActionFactory';
import { loadPSAData } from '../review/ReviewActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';

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

const getOpenPSAIds = (neighbors) => {
  return neighbors.filter((neighbor) => {
    if (neighbor.neighborEntitySet && neighbor.neighborEntitySet.name === ENTITY_SETS.PSA_SCORES) {
      const statusValues = neighbor.neighborDetails[PROPERTY_TYPES.STATUS];
      if (statusValues && statusValues.includes(PSA_STATUSES.OPEN)) {
        return true;
      }
    }
    return false;
  }).map(neighbor => neighbor.neighborId);
}

function* getOpenPSANeighbors(entitySetId, neighbors) :Generator<*, *, *> {
  const ids = getOpenPSAIds(neighbors);
  return ids.length ? yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, ids) : {};
}

function* loadNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entitySetId, entityKeyId } = action.value;

  try {
    yield put(loadNeighbors.request(action.id));
    const neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
    const openPSAs = yield call(getOpenPSANeighbors, entitySetId, neighbors);
    yield put(loadNeighbors.success(action.id, { neighbors, openPSAs }));
    yield put(loadPSAData(getOpenPSAIds(neighbors)));
  }
  catch (error) {
    console.error(error)
    yield put(loadNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadNeighbors.finally(action.id));
  }
}

function* loadNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_NEIGHBORS, loadNeighborsWorker);
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
  loadNeighborsWatcher
};
