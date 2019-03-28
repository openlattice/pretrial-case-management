/*
 * @flow
 */
import { Map } from 'immutable';
import { Constants, EntityDataModelApi, SearchApi } from 'lattice';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { loadPSAData } from '../review/ReviewActionFactory';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, STATE } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import {
  HARD_RESTART,
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  loadDataModel,
  loadNeighbors
} from './FormActionFactory';

const { PEOPLE, PSA_SCORES } = APP_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

function* loadDataModelWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadDataModel.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIds = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId], Map()).keySeq().toJS();
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

const getOpenPSAIds = (neighbors, psaScoresEntitySetId) => {
  if (!neighbors) return [];
  return neighbors.filter((neighbor) => {
    if (neighbor.neighborEntitySet && neighbor.neighborEntitySet.id === psaScoresEntitySetId) {
      const statusValues = neighbor.neighborDetails[PROPERTY_TYPES.STATUS];
      if (statusValues && statusValues.includes(PSA_STATUSES.OPEN)) {
        return true;
      }
    }
    return false;
  }).map(neighbor => neighbor.neighborDetails[OPENLATTICE_ID_FQN][0]);
};

const getAllPSAIds = (neighbors, psaScoresEntitySetId) => {
  if (!neighbors) return [];
  return neighbors.filter((neighbor) => {
    if (neighbor.neighborEntitySet && neighbor.neighborEntitySet.id === psaScoresEntitySetId) {
      const statusValues = neighbor.neighborDetails[PROPERTY_TYPES.STATUS];
      if (statusValues) {
        return true;
      }
    }
    return false;
  }).map(neighbor => neighbor.neighborDetails[OPENLATTICE_ID_FQN][0]);
};

function* getOpenPSANeighbors(neighbors) :Generator<*, *, *> {
  const app = yield select(getApp);
  const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);

  const ids = getOpenPSAIds(neighbors, psaEntitySetId);
  const val = ids.length ? yield call(SearchApi.searchEntityNeighborsBulk, psaEntitySetId, ids) : {};

  return obfuscateBulkEntityNeighbors(val, app); // TODO just for demo
}

function* loadNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entityKeyId } = action.value;

  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
  const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
  const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId], Map());

  try {
    yield put(loadNeighbors.request(action.id));
    let neighbors = yield call(SearchApi.searchEntityNeighbors, peopleEntitySetId, entityKeyId);
    neighbors = obfuscateBulkEntityNeighbors(neighbors, app);

    const openPSAs = yield call(getOpenPSANeighbors, neighbors);

    yield put(loadNeighbors.success(action.id, { neighbors, openPSAs, entitySetIdsToAppType }));
    yield put(loadPSAData(getAllPSAIds(neighbors, psaEntitySetId)));
  }
  catch (error) {
    console.error(error);
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
