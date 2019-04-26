/*
 * @flow
 */

import moment from 'moment';
import { SearchApi, DataApi } from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  fromJS,
  Map,
  List,
  Set
} from 'immutable';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties, getSearchTerm } from '../../utils/DataUtils';
import { toISODate } from '../../utils/FormattingUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { APPOINTMENT_TYPES } from '../../utils/consts/AppointmentConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  STATE
} from '../../utils/consts/FrontEndStateConsts';
import {
  LOAD_CHECKIN_APPOINTMENTS_FOR_DATE,
  LOAD_CHECK_IN_NEIGHBORS,
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors
} from './CheckInsActionFactory';

const {
  CHECKINS,
  CHECKIN_APPOINTMENTS,
  HEARINGS,
  PEOPLE,
  REMINDERS,
  PRETRIAL_CASES
} = APP_TYPES;

const {
  PHONE,
  COMPLETED_DATE_TIME,
  START_DATE,
  ENTITY_KEY_ID,
  TYPE
} = PROPERTY_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const LIST_APP_TYPES = List.of(HEARINGS, REMINDERS);

function* loadCheckInAppointmentsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadCheckInAppointmentsForDate.request(action.id));
    const { date } = action.value;
    let checkInAppointmentIds = Set();
    let checkInAppointmentMap = Map();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const checkInAppoiontmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const startDatePropertyTypeId = getPropertyTypeId(edm, START_DATE);

    const checkInOptions = {
      searchTerm: getSearchTerm(startDatePropertyTypeId, toISODate(date)),
      start: 0,
      maxHits: 10000,
      fuzzy: false
    };
    const allCheckInDataforDate = yield call(
      SearchApi.searchEntitySetData,
      checkInAppoiontmentsEntitySetId,
      checkInOptions
    );
    const checkInsOnDate = fromJS(allCheckInDataforDate.hits);
    checkInsOnDate.forEach((checkIn) => {
      const {
        [START_DATE]: startDate,
        [ENTITY_KEY_ID]: entityKeyId,
        [TYPE]: type
      } = getEntityProperties(checkIn, [ENTITY_KEY_ID, TYPE, START_DATE]);

      if (entityKeyId && startDate && type === APPOINTMENT_TYPES.CHECK_IN) {
        checkInAppointmentIds = checkInAppointmentIds.add(entityKeyId);
        checkInAppointmentMap = checkInAppointmentMap.set(entityKeyId, fromJS(checkIn));
      }
    });

    if (checkInAppointmentIds.size) {
      checkInAppointmentIds = checkInAppointmentIds.toJS();
      yield put(loadCheckInNeighbors({ checkInAppointmentIds, date }));
    }
    yield put(loadCheckInAppointmentsForDate.success(action.id, {
      checkInAppointmentIds,
      checkInAppointmentMap
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadCheckInAppointmentsForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadCheckInAppointmentsForDate.finally(action.id));
  }
}

function* loadCheckInAppointmentsForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CHECKIN_APPOINTMENTS_FOR_DATE, loadCheckInAppointmentsForDateWorker);
}


function* loadCheckInNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadCheckInNeighbors.request(action.id));

    const { checkInAppointmentIds, date } = action.value;

    let checkInNeighborsById = Map();
    let hearingIdsToCheckInIds = Map();
    let peopleIdsToCheckInIds = Map();
    let peopleIds = Set();
    let hearingIds = Set();

    if (checkInAppointmentIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
      const checkInAppoiontmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
      const checkInsEntitySetId = getEntitySetIdFromApp(app, CHECKINS);
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, checkInAppoiontmentsEntitySetId, {
        entityKeyIds: checkInAppointmentIds,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [hearingsEntitySetId, peopleEntitySetId]
      });
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([checkInId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors.size) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ENTITY_KEY_ID, 0]);
            if (appTypeFqn === HEARINGS) {
              hearingIdsToCheckInIds = hearingIdsToCheckInIds.set(entityKeyId, checkInId);
              hearingIds = hearingIds.add(entityKeyId);
            }
            if (appTypeFqn === PEOPLE) {
              peopleIdsToCheckInIds = peopleIdsToCheckInIds.set(entityKeyId, checkInId);
              peopleIds = peopleIds.add(entityKeyId);
            }
            if (LIST_APP_TYPES.includes(appTypeFqn)) {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                appTypeFqn,
                neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighbor))
              );
            }
            else {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                appTypeFqn,
                fromJS(neighbor)
              );
            }
          });
        }
        checkInNeighborsById = checkInNeighborsById.set(checkInId, neighborsByAppTypeFqn);
      });

      let personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
        entityKeyIds: peopleIds.toJS(),
        sourceEntitySetIds: [],
        destinationEntitySetIds: [checkInsEntitySetId]
      });
      personNeighborsById = fromJS(personNeighborsById);
      personNeighborsById.entrySeq().forEach(([personId, neighbors]) => {
        if (neighbors.size) {
          let neighborsByAppTypeFqn = Map();
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            if (appTypeFqn === CHECKINS) {
              const { [COMPLETED_DATE_TIME]: dateTime } = getEntityProperties(neighbor, [PHONE, COMPLETED_DATE_TIME]);
              if (moment(dateTime).isSame(date, 'd')) {
                neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                  appTypeFqn,
                  neighborsByAppTypeFqn.get(appTypeFqn, List()).push(
                    fromJS(neighbor)
                  )
                );
              }
            }
          });
          const checkInId = peopleIdsToCheckInIds.get(personId);
          checkInNeighborsById = checkInNeighborsById.set(
            checkInId,
            checkInNeighborsById.get(checkInId, Map()).merge(neighborsByAppTypeFqn)
          );
        }
      });
      let hearingNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, hearingsEntitySetId, {
        entityKeyIds: hearingIds.toJS(),
        sourceEntitySetIds: [],
        destinationEntitySetIds: [pretrialCasesEntitySetId]
      });
      hearingNeighborsById = fromJS(hearingNeighborsById);
      hearingNeighborsById.entrySeq().forEach(([hearingId, neighbors]) => {
        if (neighbors.size) {
          let neighborsByAppTypeFqn = Map();
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            if (appTypeFqn === PRETRIAL_CASES) {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                appTypeFqn,
                fromJS(neighbor)
              );
            }
          });
          const checkInId = hearingIdsToCheckInIds.get(hearingId);
          checkInNeighborsById = checkInNeighborsById.set(
            checkInId,
            checkInNeighborsById.get(checkInId, Map()).merge(neighborsByAppTypeFqn)
          );
        }
      });
    }

    yield put(loadCheckInNeighbors.success(action.id, {
      checkInNeighborsById
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadCheckInNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadCheckInNeighbors.finally(action.id));
  }
}

function* loadCheckInNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CHECK_IN_NEIGHBORS, loadCheckInNeighborsWorker);
}

export {
  loadCheckInAppointmentsForDateWatcher,
  loadCheckInNeighborsWatcher
};
