import Immutable from 'immutable';
import moment from 'moment';
import { Constants, EntityDataModelApi, SearchApi } from 'lattice';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getFqnObj, toISODate, TIME_FORMAT } from '../../utils/Utils';
import {
  LOAD_HEARINGS_FOR_DATE,
  loadHearingsForDate
} from './CourtActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

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
      .filter(hearing => {
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

    const hearingNeighbors = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, hearingIds);
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
        }
      });
    });

    yield put(loadHearingsForDate.success(action.id, { hearingsToday, hearingNeighborsById, hearingsByTime }));
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
