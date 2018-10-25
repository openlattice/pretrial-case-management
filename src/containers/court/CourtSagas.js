/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';
import { Constants, EntityDataModelApi, SearchApi, DataApi } from 'lattice';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import { PSA_STATUSES } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { toISODate, TIME_FORMAT } from '../../utils/FormattingUtils';
import { getFqnObj } from '../../utils/DataUtils';
import { obfuscateEntityNeighbors, obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import {
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  LOAD_HEARINGS_FOR_DATE,
  LOAD_HEARING_NEIGHBORS,
  REFRESH_HEARING_NEIGHBORS,
  LOAD_JUDGES,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate,
  loadHearingNeighbors,
  refreshHearingNeighbors,
  loadJudges
} from './CourtActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

function* filterPeopleIdsWithOpenPSAsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(filterPeopleIdsWithOpenPSAs.request(action.id));

    const peopleEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
    const { personIds } = action.value;

    let filteredPersonIds = Immutable.Set();
    let neighborsForOpenPSAs = Immutable.Map();
    if (personIds.size) {
      const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, peopleEntitySetId, personIds.toJS());
      filteredPersonIds = personIds.filter((id) => {
        if (neighborsById[id]) {
          const openPSANeighbors = neighborsById[id].filter((neighbor) => {
            const { neighborEntitySet, neighborDetails, associationDetails } = neighbor;
            const statusList = neighborDetails[PROPERTY_TYPES.STATUS] || [];
            const associationEntitySetId = associationDetails[OPENLATTICE_ID_FQN][0];
            if (neighborEntitySet && neighborEntitySet.name === ENTITY_SETS.PSA_SCORES) {
              const psaNeighbors = neighborsById[id].filter((possibleNeighbor) => {
                const associationId = possibleNeighbor[PSA_ASSOCIATION.DETAILS][OPENLATTICE_ID_FQN][0];
                return (
                  associationId === associationEntitySetId
                );
              });
              if (statusList.includes(PSA_STATUSES.OPEN)) {
                neighborsForOpenPSAs = neighborsForOpenPSAs.set(id, Immutable.fromJS(psaNeighbors));
                return true;
              }
            }
            return false;
          });
          return openPSANeighbors.length;
        }
        return false;
      });
    }
    yield put(filterPeopleIdsWithOpenPSAs.success(action.id, { filteredPersonIds, neighborsForOpenPSAs }));
  }
  catch (error) {
    console.error(error);
    yield put(filterPeopleIdsWithOpenPSAs.failure(action.id, error));
  }
  finally {
    yield put(filterPeopleIdsWithOpenPSAs.finally(action.id));
  }
}

function* filterPeopleIdsWithOpenPSAsWatcher() :Generator<*, *, *> {
  yield takeEvery(FILTER_PEOPLE_IDS_WITH_OPEN_PSAS, filterPeopleIdsWithOpenPSAsWorker);
}

function* loadHearingsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadHearingsForDate.request(action.id));
    let courtrooms = Immutable.Set();
    const [entitySetId, dateTimeId, hearingTypeId] = yield all([
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS),
      call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.DATE_TIME)),
      call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.HEARING_TYPE))
    ]);

    const searchFields = [
      {
        searchTerm: `"${toISODate(action.value)}"`,
        property: dateTimeId,
        exact: true
      }, {
        searchTerm: '"Initial Appearance"',
        property: hearingTypeId,
        exact: true
      }
    ];

    const getSearchOptions = maxHits => ({
      searchFields,
      maxHits,
      start: 0
    });

    const numHitsResult = yield call(SearchApi.advancedSearchEntitySetData, entitySetId, getSearchOptions(0));
    const { numHits } = numHitsResult;

    const hearingsResult = yield call(SearchApi.advancedSearchEntitySetData, entitySetId, getSearchOptions(numHits));
    const hearingsToday = Immutable.fromJS(hearingsResult.hits);

    const hearingIds = hearingsToday.map(hearing => hearing.getIn([OPENLATTICE_ID_FQN, 0])).filter(val => val).toJS();

    let hearingsByTime = Immutable.Map();
    hearingsToday
      .filter((hearing) => {
        if (!moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')).isValid()) return false;
        if (hearing.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '').toLowerCase().trim() === 'cancelled') return false;
        return true;
      })
      .forEach((hearing) => {
        const timeMoment = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
        if (timeMoment.isValid()) {
          const time = timeMoment.format(TIME_FORMAT);
          hearingsByTime = hearingsByTime.set(time, hearingsByTime.get(time, Immutable.List()).push(hearing));
        }
        const courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
        if (courtroom) courtrooms = courtrooms.add(courtroom);
      });
    const loadPersonData = true;
    const hearingNeighbors = loadHearingNeighbors({ hearingIds, loadPersonData });
    yield put(loadHearingsForDate.success(
      action.id,
      { hearingsToday, hearingsByTime, courtrooms }
    ));
    yield put(hearingNeighbors);
  }
  catch (error) {
    console.error(error);
    yield put(loadHearingsForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadHearingsForDate.finally(action.id));
  }
}

function* loadHearingsForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARINGS_FOR_DATE, loadHearingsForDateWorker);
}

function* loadHearingNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadHearingNeighbors.request(action.id));

    const { hearingIds, loadPersonData } = action.value;

    let hearingNeighborsById = Immutable.Map();
    let personIds = Immutable.Set();

    if (hearingIds.length) {
      const hearingEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, hearingEntitySetId, hearingIds);
      neighborsById = Immutable.fromJS(neighborsById);

      neighborsById.keySeq().forEach((id) => {
        if (neighborsById.get(id)) {
          let hearingNeighborsMap = Immutable.Map();
          const neighbors = neighborsById.get(id);
          neighbors.forEach(((neighbor) => {
            const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
            if (entitySetName === ENTITY_SETS.RELEASE_CONDITIONS) {
              hearingNeighborsMap = hearingNeighborsMap.set(
                entitySetName,
                hearingNeighborsMap.get(entitySetName, Immutable.List()).push(neighbor)
              );
            }
            else {
              if (entitySetName === ENTITY_SETS.PEOPLE) {
                personIds = personIds.add(neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]));
              }
              hearingNeighborsMap = hearingNeighborsMap.set(
                entitySetName,
                neighbor
              );
            }
          }));
          hearingNeighborsById = hearingNeighborsById.set(id, hearingNeighborsMap);
        }
      });
    }
    yield put(loadHearingNeighbors.success(action.id, { hearingNeighborsById, loadPersonData }));
    if (loadPersonData) {
      const peopleIdsWithOpenPSAs = filterPeopleIdsWithOpenPSAs({ personIds });
      yield put(peopleIdsWithOpenPSAs);
    }

  }
  catch (error) {
    console.error(error);
    yield put(loadHearingNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadHearingNeighbors.finally(action.id));
  }
}

function* loadHearingNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARING_NEIGHBORS, loadHearingNeighborsWorker);
}

function* refreshHearingNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action.value;
  try {
    yield put(refreshHearingNeighbors.request(action.id, { id }));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS);
    const neighborsList = yield call(SearchApi.searchEntityNeighbors, entitySetId, id);
    let neighbors = Immutable.Map();
    neighborsList.forEach((neighbor) => {
      const entitySetName = Immutable.fromJS(neighbor).getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
      if (entitySetName === ENTITY_SETS.RELEASE_CONDITIONS) {
        neighbors = neighbors.set(
          entitySetName,
          neighbors.get(entitySetName, Immutable.List()).push(Immutable.fromJS(neighbor))
        );
      }
      else {
        neighbors = neighbors.set(
          entitySetName,
          Immutable.fromJS(neighbor)
        );
      }
    });
    yield put(refreshHearingNeighbors.success(action.id, { id, neighbors }));
  }
  catch (error) {
    console.error(error);
    yield put(refreshHearingNeighbors.failure(action.id, error));
  }
  finally {
    yield put(refreshHearingNeighbors.finally(action.id, { id }));
  }
}

function* refreshHearingNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_HEARING_NEIGHBORS, refreshHearingNeighborsWorker);
}

function* loadJudgesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadJudges.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.MIN_PEN_PEOPLE);
    const entitySetSize = yield call(DataApi.getEntitySetSize, entitySetId);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: entitySetSize
    };

    const allJudgeData = yield call(SearchApi.searchEntitySetData, entitySetId, options);
    const allJudges = Immutable.fromJS(allJudgeData.hits);
    yield put(loadJudges.success(action.id, { allJudges }));
  }
  catch (error) {
    console.error(error);
    yield put(loadJudges.failure(action.id, error));
  }
  finally {
    yield put(loadJudges.finally(action.id));
  }
}

function* loadJudgesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_JUDGES, loadJudgesWorker);
}

export {
  filterPeopleIdsWithOpenPSAsWatcher,
  loadHearingsForDateWatcher,
  loadHearingNeighborsWatcher,
  refreshHearingNeighborsWatcher,
  loadJudgesWatcher
};
