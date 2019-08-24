/*
 * @flow
 */
import { DateTime } from 'luxon';
import randomUUID from 'uuid/v4';
import type { SequenceAction } from 'redux-reqseq';
import { SearchApi } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';

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
import { REMINDER_TYPES } from '../../utils/RemindersUtils';
import { MAX_HITS } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { refreshHearingAndNeighbors } from '../hearings/HearingsActions';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  CREATE_CHECK_IN_APPOINTMENTS,
  LOAD_CHECKIN_APPOINTMENTS_FOR_DATE,
  LOAD_CHECK_IN_NEIGHBORS,
  createCheckinAppointments,
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors
} from './CheckInsActionFactory';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const { PREFERRED_COUNTY } = SETTINGS;

const { createEntityAndAssociationData } = DataApiActions;
const { createEntityAndAssociationDataWorker } = DataApiSagas;

const {
  APPEARS_IN,
  CHECKINS,
  CHECKIN_APPOINTMENTS,
  COUNTIES,
  HEARINGS,
  PEOPLE,
  REGISTERED_FOR,
  REMINDERS,
  PRETRIAL_CASES
} = APP_TYPES;

const {
  COMPLETED_DATE_TIME,
  END_DATE,
  ENTITY_KEY_ID,
  GENERAL_ID,
  PHONE,
  START_DATE,
  TYPE
} = PROPERTY_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const LIST_APP_TYPES = List.of(HEARINGS, REMINDERS);

function* createCheckinAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(createCheckinAppointments.request(action.id));
    const {
      checkInAppointments,
      hearingEKID,
      personEKID
    } = action.value;

    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const completedDateTimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const endDatePTID = getPropertyTypeId(edm, END_DATE);
    const generalIdPTID = getPropertyTypeId(edm, GENERAL_ID);
    const startDatePTID = getPropertyTypeId(edm, START_DATE);
    const typePTID = getPropertyTypeId(edm, TYPE);

    /*
     * Get Entity Set Ids
     */
    const appearsInESID = getEntitySetIdFromApp(app, APPEARS_IN);
    const checkInAppointmentsESID = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);

    /*
     * Get Preferred County from app settings
     */
    const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');

    const entities = {};
    const associations = {};
    const data = { [completedDateTimePTID]: [DateTime.local().toISO()] };
    if (checkInAppointments.length) {
      entities[checkInAppointmentsESID] = [];
      associations[registeredForESID] = [];
      associations[appearsInESID] = [];
      checkInAppointments.forEach((appointment, index) => {
        const newCheckInAppointmentId = randomUUID();
        const { [PROPERTY_TYPES.START_DATE]: startDate, [PROPERTY_TYPES.END_DATE]: endDate } = appointment;

        const newCheckInAppointmentEntity = {
          [generalIdPTID]: [newCheckInAppointmentId],
          [typePTID]: [REMINDER_TYPES.CHECKIN],
          [startDatePTID]: [startDate],
          [endDatePTID]: [endDate],
        };

        const registeredForAssociations = [
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: checkInAppointmentsESID,
            dstEntityKeyId: personEKID,
            dstEntitySetId: peopleESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: checkInAppointmentsESID,
            dstEntityKeyId: hearingEKID,
            dstEntitySetId: hearingsESID
          }
        ];

        const appearsInAssociations = [
          {
            data: {},
            srcEntityIndex: index,
            srcEntitySetId: checkInAppointmentsESID,
            dstEntityKeyId: preferredCountyEKID,
            dstEntitySetId: countiesESID
          }
        ];

        entities[checkInAppointmentsESID].push(newCheckInAppointmentEntity);
        associations[registeredForESID] = associations[registeredForESID].concat(registeredForAssociations);
        associations[appearsInESID] = associations[appearsInESID].concat(appearsInAssociations);
      });
      /*
      * Submit data and collect response
      */
      const response = yield call(
        createEntityAndAssociationDataWorker,
        createEntityAndAssociationData({ associations, entities })
      );
      if (response.error) throw response.error;
    }
    /*
    * Refresh Hearing and Neighbors
    */
    const hearingRefresh = refreshHearingAndNeighbors({ hearingEntityKeyId: hearingEKID });
    yield put(hearingRefresh);

    yield put(createCheckinAppointments.success(action.id, {
      hearingEKID,
      personEKID
    }));
  }

  catch (error) {
    console.error(error);
    yield put(createCheckinAppointments.failure(action.id, { error }));
  }
  finally {
    yield put(createCheckinAppointments.finally(action.id));
  }
}

function* createCheckinAppointmentsWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_CHECK_IN_APPOINTMENTS, createCheckinAppointmentsWorker);
}

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
      maxHits: MAX_HITS,
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
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
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
              if (DateTime.fromISO(dateTime).hasSame(DateTime.fromISO(date), 'day')) {
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
  createCheckinAppointmentsWatcher,
  loadCheckInAppointmentsForDateWatcher,
  loadCheckInNeighborsWatcher
};
