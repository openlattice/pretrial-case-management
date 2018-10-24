/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';
import {
  Constants,
  EntityDataModelApi,
  SearchApi,
  DataApi,
  Models
} from 'lattice';
import {
  all,
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import { HEARING_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
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

const DATE_FORMAT = 'YYYY-MM-DD';

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

function* filterPeopleIdsWithOpenPSAsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(filterPeopleIdsWithOpenPSAs.request(action.id));
    const {
      personIds,
      hearingDateTime,
      personIdsToHearingIds
    } = action.value;
    let { scoresAsMap, hearingNeighborsById } = action.value;
    if (!scoresAsMap) {
      scoresAsMap = Immutable.Map();
    }
    const hearingDateTimeMoment = toISODate(moment(hearingDateTime).format(DATE_FORMAT));
    let filteredPersonIds = Immutable.Set();
    let openPSAIds = Immutable.Set();
    let personIdsToOpenPSAIds = Immutable.Map();

    const peopleEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);

    if (personIds.size) {
      let peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsBulk, peopleEntitySetId, personIds.toJS());
      peopleNeighborsById = Immutable.fromJS(peopleNeighborsById);
      peopleNeighborsById.entrySeq().forEach(([id, neighbors]) => {
        let hasValidHearing = false;
        let mostCurrentPSA;
        let currentPSADateTime;
        let mostCurrentPSAEntityKeyId;
        neighbors.forEach((neighbor) => {
          const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
          const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
          const entityDateTime = moment(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));

          if (entitySetName === ENTITY_SETS.HEARINGS) {
            const hearingDate = toISODate(moment(entityDateTime).format(DATE_FORMAT));
            const hearingDateIsValid = hearingDate === hearingDateTimeMoment;
            if (hearingDateIsValid) {
              hasValidHearing = true;
            }
          }

          if (entitySetName === ENTITY_SETS.PSA_SCORES
              && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
            if (!mostCurrentPSA || currentPSADateTime.isBefore(entityDateTime)) {
              mostCurrentPSA = neighbor;
              mostCurrentPSAEntityKeyId = entityKeyId;
              currentPSADateTime = entityDateTime;
            }
            openPSAIds = openPSAIds.add(entityKeyId);
          }
        });

        if (hasValidHearing && mostCurrentPSAEntityKeyId) {
          const hearingId = personIdsToHearingIds.get(id);
          scoresAsMap = scoresAsMap.set(
            mostCurrentPSAEntityKeyId,
            mostCurrentPSA.get(PSA_NEIGHBOR.DETAILS)
          );
          if (hearingId) {
            console.log(hearingId);
            hearingNeighborsById = hearingNeighborsById.setIn(
              [hearingId, ENTITY_SETS.PSA_SCORES],
              mostCurrentPSA
            );
          }
          filteredPersonIds = filteredPersonIds.add(id);
          personIdsToOpenPSAIds = personIdsToOpenPSAIds.set(id, mostCurrentPSAEntityKeyId);
        }
      });
    }
    yield put(filterPeopleIdsWithOpenPSAs.success(action.id, {
      filteredPersonIds,
      scoresAsMap,
      personIdsToOpenPSAIds,
      openPSAIds,
      hearingNeighborsById
    }));
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
    let hearingIds = Immutable.Set();
    let hearingsByTime = Immutable.Map();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const [
      datePropertyTypeId,
      hearingEntitySetId
    ] = yield all([
      call(EntityDataModelApi.getPropertyTypeId, DATE_TIME_FQN),
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS)
    ]);

    const ceiling = yield call(DataApi.getEntitySetSize, hearingEntitySetId);

    const hearingOptions = {
      searchTerm: `${datePropertyTypeId}: ${toISODate(action.value)}`,
      start: 0,
      maxHits: ceiling,
      fuzzy: false
    };

    const allHearingData = yield call(SearchApi.searchEntitySetData, hearingEntitySetId, hearingOptions);
    const hearingsToday = Immutable.fromJS(allHearingData.hits);
    if (hearingsToday.size) {
      hearingsToday.forEach((hearing) => {
        const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        if (hearingType && hearingType === HEARING_TYPES.INITIAL_APPEARANCE) hearingIds = hearingIds.add(hearingId);
      });
    }

    hearingsToday.filter((hearing) => {
      const hearingHasValidDateTime = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')).isValid();
      const hearingHasBeenCancelled = hearing
        .getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '').toLowerCase().trim() === 'cancelled';
      if (!hearingHasValidDateTime) return false;
      if (hearingHasBeenCancelled) return false;
      return true;
    })
      .forEach((hearing) => {
        const hearingDateTime = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
        if (hearingDateTime.isValid()) {
          const time = hearingDateTime.format(TIME_FORMAT);
          hearingsByTime = hearingsByTime.set(
            time,
            hearingsByTime.get(time, Immutable.List()).push(hearing)
          );
        }
      });

    hearingIds = hearingIds.toJS();
    const hearingDateTime = action.value;
    const hearingNeighbors = loadHearingNeighbors({ hearingIds, hearingDateTime });

    yield put(loadHearingsForDate.success(action.id, { hearingsToday, hearingsByTime }));
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

    const { hearingIds, hearingDateTime } = action.value;

    let hearingNeighborsById = Immutable.Map();
    let personIdsToHearingIds = Immutable.Map();
    let personIds = Immutable.Set();
    let scoresAsMap = Immutable.Map();

    if (hearingIds.length) {
      const hearingEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, hearingEntitySetId, hearingIds);
      neighborsById = Immutable.fromJS(neighborsById);

      neighborsById.entrySeq().forEach(([hearingId, neighbors]) => {
        if (neighbors) {
          let hasPerson = false;
          let hasPSA = false;
          let personId;
          let hearingNeighborsMap = Immutable.Map();
          neighbors.forEach(((neighbor) => {
            const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
            if (entitySetName === ENTITY_SETS.RELEASE_CONDITIONS) {
              hearingNeighborsMap = hearingNeighborsMap.set(
                entitySetName,
                hearingNeighborsMap.get(entitySetName, Immutable.List()).push(neighbor)
              );
            }
            else {
              if (entitySetName === ENTITY_SETS.PEOPLE) {
                hasPerson = true;
                personId = entityKeyId;
                personIds = personIds.add(personId);
              }
              if (entitySetName === ENTITY_SETS.PSA_SCORES
                  && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
                hasPSA = true;
                scoresAsMap = scoresAsMap.set(
                  entityKeyId,
                  neighbor.get(PSA_NEIGHBOR.DETAILS)
                );
              }
              hearingNeighborsMap = hearingNeighborsMap.set(
                entitySetName,
                neighbor
              );
            }
          }));
          if (hasPerson && !hasPSA) {
            personIdsToHearingIds = personIdsToHearingIds.set(
              personId,
              hearingId
            );
          }
          hearingNeighborsById = hearingNeighborsById.set(hearingId, hearingNeighborsMap);
        }
      });
    }
    yield put(loadHearingNeighbors.success(action.id, { hearingNeighborsById, hearingDateTime }));
    if (hearingDateTime) {
      const peopleIdsWithOpenPSAs = filterPeopleIdsWithOpenPSAs({
        personIds,
        hearingDateTime,
        scoresAsMap,
        personIdsToHearingIds,
        hearingNeighborsById
      });
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
