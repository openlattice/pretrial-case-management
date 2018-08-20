/*
 * @flow
 */

import { EntityDataModelApi, Constants, DataApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  GET_PEOPLE,
  GET_PERSON_DATA,
  GET_PERSON_NEIGHBORS,
  getPeople,
  getPersonData,
  getPersonNeighbors
} from './PeopleActionFactory';
import { obfuscateEntity } from '../../utils/consts/DemoNames';

const { OPENLATTICE_ID_FQN } = Constants;

function* getPeopleWorker(action) :Generator<*, *, *> {

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

function* getPeopleWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PEOPLE, getPeopleWorker);
}

function* getEntityForPersonId(personId :string, entitySetId :string) :Generator<*, *, *> {
  const personIdFqn = PROPERTY_TYPES.PERSON_ID.split('.');
  const propertyTypeId = yield call(EntityDataModelApi.getPropertyTypeId, {
    namespace: personIdFqn[0],
    name: personIdFqn[1]
  });

  const searchOptions = {
    searchTerm: `${propertyTypeId}:"${personId}"`,
    start: 0,
    maxHits: 1
  };

  const response = yield call(SearchApi.searchEntitySetData, entitySetId, searchOptions);
  return response.hits[0];
}

function* getPersonDataWorker(action) :Generator<*, *, *> {

  try {
    yield put(getPersonData.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
    const person = yield getEntityForPersonId(action.value, entitySetId);
    yield put(getPersonData.success(action.id, { person, entityKeyId: person[OPENLATTICE_ID_FQN][0] }));
  }
  catch (error) {
    yield put(getPersonData.failure(action.id, error));
  }
  finally {
    yield put(getPersonData.finally(action.id));
  }
}

function* getPersonDataWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PERSON_DATA, getPersonDataWorker);
}

function* getPersonNeighborsWorker(action) :Generator<*, *, *> {

  const { personId } = action.value;

  try {
    yield put(getPersonNeighbors.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);

    const person = yield getEntityForPersonId(personId, entitySetId);
    const entityKeyId = person[OPENLATTICE_ID_FQN][0];
    const neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
    yield put(getPersonNeighbors.success(action.id, { personId, neighbors }));
  }
  catch (error) {
    yield put(getPersonNeighbors.failure(action.id, { error, personId }));
  }
  finally {
    yield put(getPersonNeighbors.finally(action.id));
  }
}

function* getPersonNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PERSON_NEIGHBORS, getPersonNeighborsWorker);
}

export {
  getPeopleWatcher,
  getPeopleWorker,
  getPersonDataWatcher,
  getPersonDataWorker,
  getPersonNeighborsWatcher
};
