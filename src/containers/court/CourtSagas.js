/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';
import { Constants, EntityDataModelApi, SearchApi } from 'lattice';
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
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate
} from './CourtActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

function* filterPeopleIdsWithOpenPSAsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    const { personEntitySetId, personIds } = action.value;
    yield put(filterPeopleIdsWithOpenPSAs.request(action.id));
    let filteredPersonIds = Immutable.Set();
    let neighborsForOpenPSAs = Immutable.Map();
    if (personEntitySetId) {
      const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, personEntitySetId, personIds.toJS());
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
    yield put(filterPeopleIdsWithOpenPSAs.failure(action.id, error));
  }
  finally {
    yield put(filterPeopleIdsWithOpenPSAs.finally(action.id));
  }
}

export function* filterPeopleIdsWithOpenPSAsWatcher() :Generator<*, *, *> {
  yield takeEvery(FILTER_PEOPLE_IDS_WITH_OPEN_PSAS, filterPeopleIdsWithOpenPSAsWorker);
}

function* loadHearingsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadHearingsForDate.request(action.id));
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
      });

    let hearingNeighbors = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, hearingIds);
    hearingNeighbors = obfuscateBulkEntityNeighbors(hearingNeighbors); // TODO just for demo

    let personEntitySetId;
    let personIds = Immutable.Set();

    let hearingNeighborsById = Immutable.Map();
    Object.entries(hearingNeighbors).forEach(([hearingId, neighbors]) => {
      hearingNeighborsById = hearingNeighborsById.set(hearingId, Immutable.Map());
      neighbors.forEach((neighbor) => {
        const { neighborEntitySet, neighborDetails } = neighbor;
        if (neighborEntitySet) {
          hearingNeighborsById = hearingNeighborsById.set(
            hearingId,
            hearingNeighborsById.get(hearingId).set(neighborEntitySet.name, Immutable.fromJS(neighborDetails))
          );

          if (neighborEntitySet.name === ENTITY_SETS.PEOPLE) {
            if (!personEntitySetId) {
              personEntitySetId = neighborEntitySet.id;
            }
            personIds = personIds.add(neighborDetails[OPENLATTICE_ID_FQN][0]);
          }
        }
      });
    });

    yield put(loadHearingsForDate.success(action.id, { hearingsToday, hearingNeighborsById, hearingsByTime }));
    const peopleIdsWithOpenPSAs = filterPeopleIdsWithOpenPSAs({ personEntitySetId, personIds });
    yield put(peopleIdsWithOpenPSAs);
  }
  catch (error) {
    console.error(error);
    yield put(loadHearingsForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadHearingsForDate.finally(action.id));
  }
}

export function* loadHearingsForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARINGS_FOR_DATE, loadHearingsForDateWorker);
}
