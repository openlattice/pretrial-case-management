/*
 * @flow
 */

import { EntityDataModelApi, DataApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import {
  GET_PEOPLE,
  GET_PERSON_DATA,
  getPeople,
  getPersonData
} from './PeopleActionFactory';

function* getPeopleWorker(action) {

  try {
    yield put(getPeople.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
    const response = yield call(DataApi.getEntitySetData, entitySetId);
    yield put(getPeople.success(action.id, response));
  }
  catch (error) {
    yield put(getPeople.failure(action.id, error));
  }
  finally {
    yield put(getPeople.finally(action.id));
  }
}

function* getPeopleWatcher() {
  yield takeEvery(GET_PEOPLE, getPeopleWorker);
}

function* getPersonDataWorker(action) {
  const searchOptions = {
    searchTerm: action.value,
    start: 0,
    maxHits: 10
  };

  try {
    yield put(getPersonData.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
    const response = yield call(SearchApi.searchEntitySetData, entitySetId, searchOptions);
    yield put(getPersonData.success(action.id, response.hits[0]));
  }
  catch (error) {
    yield put(getPersonData.failure(action.id, error));
  }
  finally {
    yield put(getPersonData.finally(action.id));
  }
}

function* getPersonDataWatcher() {
  yield takeEvery(GET_PERSON_DATA, getPersonDataWorker);
}

export {
  getPeopleWatcher,
  getPeopleWorker,
  getPersonDataWatcher,
  getPersonDataWorker
};
