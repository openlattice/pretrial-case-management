/*
 * @flow
 */
import randomUUID from 'uuid/v4';
import type { SequenceAction } from 'redux-reqseq';
import { AuthUtils } from 'lattice-auth';
import { DateTime } from 'luxon';
import { SearchApi } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';

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

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties, getSearchTerm, isUUID } from '../../utils/DataUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { APPOINTMENT_TYPES } from '../../utils/consts/AppointmentConsts';
import { REMINDER_TYPES } from '../../utils/RemindersUtils';
import { MAX_HITS } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { refreshHearingAndNeighbors, loadHearingNeighbors } from '../hearings/HearingsActions';
import { getPeopleNeighbors } from '../people/PeopleActions';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  CREATE_CHECK_IN_APPOINTMENTS,
  CREATE_MANUAL_CHECK_IN,
  LOAD_CHECKIN_APPOINTMENTS_FOR_DATE,
  LOAD_CHECK_IN_NEIGHBORS,
  createCheckinAppointments,
  createManualCheckIn,
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors
} from './CheckInActions';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const LOG :Logger = new Logger('CheckInSagas');

const { PREFERRED_COUNTY } = SETTINGS;

const { createEntityAndAssociationData, getEntitySetData, getEntityData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntitySetDataWorker, getEntityDataWorker } = DataApiSagas;

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;

const {
  APPEARS_IN,
  CHECKINS,
  CHECKIN_APPOINTMENTS,
  COUNTIES,
  HEARINGS,
  PEOPLE,
  RECORDED_BY,
  REGISTERED_FOR,
  REMINDERS,
  MANUAL_CHECK_INS,
  STAFF
} = APP_TYPES;

const {
  COMPLETED_DATE_TIME,
  CONTACT_DATETIME,
  CONTACT_METHOD,
  DATE_LOGGED,
  DATE_TIME,
  END_DATE,
  ENTITY_KEY_ID,
  GENERAL_ID,
  NOTES,
  OUTCOME,
  START_DATE,
  TYPE
} = PROPERTY_TYPES;

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const getStaffId = () => {
  const staffInfo = AuthUtils.getUserInfo();
  let staffId = staffInfo.id;
  if (staffInfo.email && staffInfo.email.length > 0) {
    staffId = staffInfo.email;
  }
  return staffId;
};

const LIST_APP_TYPES = List.of(HEARINGS, REMINDERS, MANUAL_CHECK_INS);

function* createCheckinAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(createCheckinAppointments.request(action.id));
    const {
      checkInAppointments,
      hearingEKID,
      personEKID
    } = action.value;
    let submittedCheckins = List();

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

      const { entityKeyIds } = response.data;

      const checkinAppointmentsEKIDs = entityKeyIds[checkInAppointmentsESID] || [];
      const checkInsResponse = yield call(
        getEntitySetDataWorker,
        getEntitySetData({
          entitySetId: checkInAppointmentsESID,
          entityKeyIds: checkinAppointmentsEKIDs
        })
      );
      if (checkInsResponse.error) throw checkInsResponse.error;
      submittedCheckins = fromJS(checkInsResponse.data);
    }

    /*
    * Get Checkin Info
    */

    const hearingRefresh = refreshHearingAndNeighbors({ hearingEntityKeyId: hearingEKID });
    yield put(hearingRefresh);

    yield put(createCheckinAppointments.success(action.id, {
      hearingEKID,
      personEKID,
      submittedCheckins
    }));
  }

  catch (error) {
    LOG.error(action.type, error);
    yield put(createCheckinAppointments.failure(action.id, { error }));
  }
  finally {
    yield put(createCheckinAppointments.finally(action.id));
  }
}

function* createCheckinAppointmentsWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_CHECK_IN_APPOINTMENTS, createCheckinAppointmentsWorker);
}

function* createManualCheckInWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(createManualCheckIn.request(action.id));
    const {
      dateTime,
      contactMethod,
      personEKID,
      notes
    } = action.value;
    let submittedCheckIn = Map();

    if (!dateTime.isValid) throw new Error('Invalid Date and Time.');
    if (!contactMethod) throw new Error('Must include valid contact information.');
    if (!isUUID(personEKID)) throw new Error('Must include valid entity key id for person.');

    const dateTimeString = dateTime.toISO();
    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    /*
     * Get Staff Entity Key Id
     */
    const staffIdsToEntityKeyIds = app.get(APP_DATA.STAFF_IDS_TO_EKIDS, Map());
    const staffId = getStaffId();
    const staffEKID = staffIdsToEntityKeyIds.get(staffId, '');

    /*
     * Get Entity Set Ids
     */
    const appearsInESID = getEntitySetIdFromApp(app, APPEARS_IN);
    const manualCheckInsESID = getEntitySetIdFromApp(app, MANUAL_CHECK_INS);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const recordedByESID = getEntitySetIdFromApp(app, RECORDED_BY);
    const staffESID = getEntitySetIdFromApp(app, STAFF);

    const newManualCheckIn = {
      [CONTACT_METHOD]: [contactMethod],
      [CONTACT_DATETIME]: [dateTimeString],
      [OUTCOME]: ['success'],
      [GENERAL_ID]: [randomUUID()],
      [NOTES]: [notes],
    };
    const newManualCheckInSubmitEntity = getPropertyIdToValueMap(newManualCheckIn, edm);

    const entities = {};
    const appearsInData = getPropertyIdToValueMap({ [DATE_TIME]: [dateTimeString] }, edm);
    const recordedByData = getPropertyIdToValueMap({ [DATE_LOGGED]: [dateTimeString] }, edm);
    entities[manualCheckInsESID] = [newManualCheckInSubmitEntity];
    const associations = {
      [appearsInESID]: [
        {
          data: appearsInData,
          srcEntityKeyId: personEKID,
          srcEntitySetId: peopleESID,
          dstEntityIndex: 0,
          dstEntitySetId: manualCheckInsESID
        }
      ],
      [recordedByESID]: [
        {
          data: recordedByData,
          srcEntityIndex: 0,
          srcEntitySetId: manualCheckInsESID,
          dstEntityKeyId: staffEKID,
          dstEntitySetId: staffESID
        }
      ]
    };

    /*
    * Submit data and collect response
    */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;

    const { entityKeyIds } = response.data;

    const manualCheckInEKID = entityKeyIds[manualCheckInsESID][0];
    const checkInsResponse = yield call(
      getEntityDataWorker,
      getEntityData({
        entitySetId: manualCheckInsESID,
        entityKeyId: manualCheckInEKID
      })
    );
    if (checkInsResponse.error) throw checkInsResponse.error;
    submittedCheckIn = fromJS(checkInsResponse.data);

    /*
    * Get Checkin Info
    */

    yield put(createManualCheckIn.success(action.id, {
      personEKID,
      submittedCheckIn
    }));
  }

  catch (error) {
    LOG.error(action.type, error);
    yield put(createManualCheckIn.failure(action.id, { error }));
  }
  finally {
    yield put(createManualCheckIn.finally(action.id));
  }
}

function* createManualCheckInWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_MANUAL_CHECK_IN, createManualCheckInWorker);
}

function* loadCheckInAppointmentsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadCheckInAppointmentsForDate.request(action.id));
    const { date } = action.value;
    let checkInAppointmentMap = Map();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const checkInAppoiontmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const startDatePropertyTypeId = getPropertyTypeId(edm, START_DATE);
    const isoDate = date.toISODate();

    const constraints = [{
      constraints: [{ type: 'simple', fuzzy: false, searchTerm: getSearchTerm(startDatePropertyTypeId, isoDate) }]
    }]

    const searchOptions = {
      entitySetIds: [checkInAppoiontmentsEntitySetId],
      constraints,
      start: 0,
      maxHits: MAX_HITS,
    };

    const allCheckInDataforDate = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchOptions)
    );
    if (allCheckInDataforDate.error) throw allCheckInDataforDate.error;
    const checkInsOnDate = fromJS(allCheckInDataforDate.data.hits);
    checkInsOnDate.forEach((checkIn) => {
      const {
        [START_DATE]: startDate,
        [ENTITY_KEY_ID]: checkInEKID,
        [TYPE]: type
      } = getEntityProperties(checkIn, [ENTITY_KEY_ID, TYPE, START_DATE]);

      if (checkInEKID && startDate && type === APPOINTMENT_TYPES.CHECK_IN) {
        checkInAppointmentMap = checkInAppointmentMap.set(checkInEKID, checkIn);
      }
    });

    if (checkInAppointmentMap.size) {
      const checkInAppointmentIds = checkInAppointmentMap.keySeq().toJS();
      yield put(loadCheckInNeighbors({ checkInAppointmentIds, date }));
    }
    yield put(loadCheckInAppointmentsForDate.success(action.id, {
      checkInAppointmentMap,
      isoDate
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
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

    const { checkInAppointmentIds } = action.value;

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
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
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

      /* Load Person Neighbors */
      if (peopleIds.size) {
        const getPeopleNeighborsRequest = getPeopleNeighbors({
          peopleEKIDs: peopleIds.toJS(),
          srcEntitySets: [],
          dstEntitySets: [CHECKINS, MANUAL_CHECK_INS]
        });
        yield put(getPeopleNeighborsRequest);
      }

      /* Load Hearing Neighbors */
      const loadHearingNeighborsRequest = loadHearingNeighbors({ hearingIds: hearingIds.toJS() });
      yield put(loadHearingNeighborsRequest);
    }

    yield put(loadCheckInNeighbors.success(action.id, {
      checkInNeighborsById
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
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
  createManualCheckInWatcher,
  loadCheckInAppointmentsForDateWatcher,
  loadCheckInNeighborsWatcher
};
