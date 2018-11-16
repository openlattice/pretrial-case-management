/*
 * @flow
 */
import moment from 'moment';
import {
  EntityDataModelApi,
  Constants,
  DataApi,
  SearchApi
} from 'lattice';
import {
  Map,
  List,
  Set,
  fromJS
} from 'immutable';
import { call, put, takeEvery } from 'redux-saga/effects';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { obfuscateEntity, obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';

import {
  GET_PEOPLE,
  GET_PERSON_DATA,
  GET_PERSON_NEIGHBORS,
  REFRESH_PERSON_NEIGHBORS,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  refreshPersonNeighbors
} from './PeopleActionFactory';

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
  const person = obfuscateEntity(response.hits[0]); // TODO just for demo
  return person;
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
    let neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);

    neighbors = obfuscateEntityNeighbors(neighbors);
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

function* refreshPersonNeighborsWorker(action) :Generator<*, *, *> {

  const { personId } = action.value;

  try {
    yield put(refreshPersonNeighbors.request(action.id));
    let caseNums = Set();
    let currentPSADateTime;
    let mostRecentPSA = Map();
    let neighbors = Map();

    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
    const person = yield getEntityForPersonId(personId, entitySetId);
    const entityKeyId = person[OPENLATTICE_ID_FQN][0];
    let neighborsList = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
    neighborsList = obfuscateEntityNeighbors(neighborsList);
    neighborsList = fromJS(neighborsList);

    neighborsList.forEach((neighbor) => {
      const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
      const entityDateTime = moment(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));
      if (entitySetName === ENTITY_SETS.PSA_SCORES) {
        if (!mostRecentPSA || !currentPSADateTime || currentPSADateTime.isBefore(entityDateTime)) {
          mostRecentPSA = neighbor;
          currentPSADateTime = entityDateTime;
        }
      }
      if (entitySetName === ENTITY_SETS.CONTACT_INFORMATION) {
        neighbors = neighbors.set(
          entitySetName,
          neighbor
        );
      }
      else {
        neighbors = neighbors.set(
          entitySetName,
          neighbors.get(entitySetName, List()).push(neighbor)
        );
      }
    });
    neighbors = neighbors.set(ENTITY_SETS.PRETRIAL_CASES,
      neighbors.get(ENTITY_SETS.PRETRIAL_CASES, List())
        .filter((neighbor) => {
          const caseNum = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0]);
          if (!caseNums.has(caseNum)) {
            caseNums = caseNums.add(caseNum);
            return true;
          }
          return false;
        }), neighbors);
    const scoresEntitySetId = neighbors.getIn(
      [ENTITY_SETS.PSA_SCORES, 0, PSA_NEIGHBOR.ENTITY_SET, 'id'],
      ''
    );
    yield put(refreshPersonNeighbors.success(action.id, {
      personId,
      mostRecentPSA,
      neighbors,
      scoresEntitySetId
    }));
  }
  catch (error) {
    console.error(error);
    yield put(refreshPersonNeighbors.failure(action.id, { error, personId }));
  }
  finally {
    yield put(refreshPersonNeighbors.finally(action.id));
  }
}

function* refreshPersonNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_PERSON_NEIGHBORS, refreshPersonNeighborsWorker);
}

export {
  getPeopleWatcher,
  getPersonDataWatcher,
  getPersonNeighborsWatcher,
  refreshPersonNeighborsWatcher
};
