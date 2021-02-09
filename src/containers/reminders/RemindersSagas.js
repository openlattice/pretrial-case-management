/*
 * @flow
 */

import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import {
  fromJS,
  Map,
  Set,
  List
} from 'immutable';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { MAX_HITS } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getUTCDateRangeSearchString } from '../../utils/consts/DateTimeConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { getSimpleConstraintGroup } from '../../core/sagas/constants';
import {
  addWeekdays,
  getEntityProperties,
  getEntityKeyId
} from '../../utils/DataUtils';
import { getPeopleNeighbors } from '../people/PeopleActions';
import {
  LOAD_OPT_OUT_NEIGHBORS,
  LOAD_OPT_OUTS_FOR_DATE,
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_ACTION_LIST,
  LOAD_REMINDERS_FOR_DATE,
  loadOptOutNeighbors,
  loadRemindersActionList,
  loadOptOutsForDate,
  loadReminderNeighborsById,
  loadRemindersforDate
} from './RemindersActionFactory';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';

const LOG :Logger = new Logger('RemindersSagas');

const { PREFERRED_COUNTY } = SETTINGS;

const {
  CONTACT_INFORMATION,
  COUNTIES,
  HEARINGS,
  MANUAL_REMINDERS,
  PEOPLE,
  REMINDERS,
  REMINDER_OPT_OUTS,
  PRETRIAL_CASES,
  SUBSCRIPTION
} = APP_TYPES;

const { DATE_TIME, ENTITY_KEY_ID, NOTIFIED } = PROPERTY_TYPES;

const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const getPeopleInCustody = (state) => state.getIn([STATE.IN_CUSTODY, IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY], Set());

function* loadOptOutNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadOptOutNeighbors.request(action.id));
    const { optOutIds } = action.value;
    let optOutNeighborsById = Map();
    let optOutPeopleIds = Set();
    let contactInfoIdsToOptOutIds = Map();
    let optOutContactInfoIds = Set();
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const optOutEntitySetId = getEntitySetIdFromApp(app, REMINDER_OPT_OUTS);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);

    if (optOutIds.length) {
      /* Get contact info Neighbors */
      const optOutNeighborResponse = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: optOutEntitySetId,
          filter: {
            entityKeyIds: optOutIds,
            sourceEntitySetIds: [],
            destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId, peopleEntitySetId]
          }
        })
      );
      if (optOutNeighborResponse.error) throw optOutNeighborResponse.error;
      const neighborsById = fromJS(optOutNeighborResponse.data);

      neighborsById.entrySeq().forEach(([optOutId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const entityKeyId = getEntityKeyId(neighbor);
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            if (appTypeFqn === PEOPLE) {
              optOutPeopleIds = optOutPeopleIds.add(entityKeyId);
            }
            if (appTypeFqn === CONTACT_INFORMATION) {
              optOutContactInfoIds = optOutContactInfoIds.add(entityKeyId);
              contactInfoIdsToOptOutIds = contactInfoIdsToOptOutIds.set(entityKeyId, optOutId);
            }
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              appTypeFqn,
              fromJS(neighbor)
            );
          });
        }
        optOutNeighborsById = optOutNeighborsById.set(optOutId, neighborsByAppTypeFqn);
      });
    }

    if (optOutContactInfoIds.size) {
      /* Get contact info Neighbors */
      const contactInfoNeighborResponse = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: contactInformationEntitySetId,
          filter: {
            entityKeyIds: optOutContactInfoIds.toJS(),
            sourceEntitySetIds: [peopleEntitySetId],
            destinationEntitySetIds: [peopleEntitySetId]
          }
        })
      );
      if (contactInfoNeighborResponse.error) throw contactInfoNeighborResponse.error;
      const neighborsById = fromJS(contactInfoNeighborResponse.data);

      neighborsById.entrySeq().forEach(([contactInfoId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors.size) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const entityKeyId = getEntityKeyId(neighbor);
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            if (appTypeFqn === PEOPLE) {
              optOutPeopleIds = optOutPeopleIds.add(entityKeyId);
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(appTypeFqn, fromJS(neighbor));
            }
          });
        }
        const optOutId = contactInfoIdsToOptOutIds.get(contactInfoId);
        const newOptOutNeighbors = optOutNeighborsById.get(optOutId).merge(neighborsByAppTypeFqn);
        optOutNeighborsById = optOutNeighborsById.set(optOutId, newOptOutNeighbors);
      });
    }

    yield put(loadOptOutNeighbors.success(action.id, { optOutNeighborsById, optOutPeopleIds }));

  }
  catch (error) {
    LOG.error(error);
    yield put(loadOptOutNeighbors.failure(action.id, { error }));
  }
  finally {
    yield put(loadOptOutNeighbors.finally(action.id));
  }
}

function* loadOptOutNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_OPT_OUT_NEIGHBORS, loadOptOutNeighborsWorker);
}
function* loadOptOutsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadOptOutsForDate.request(action.id));
    const { date } = action.value;
    let optOutMap = Map();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const optOutESID = getEntitySetIdFromApp(app, REMINDER_OPT_OUTS);
    const datePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.DATE_TIME);
    const searchTerm = getUTCDateRangeSearchString(datePropertyTypeId, date);

    const constraints = getSimpleConstraintGroup(searchTerm);

    const searchConstraints = {
      entitySetIds: [optOutESID],
      constraints,
      start: 0,
      maxHits: MAX_HITS
    };
    const optOutResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints)
    );
    if (optOutResponse.error) throw optOutResponse.error;
    const optOutsOnDate = fromJS(optOutResponse.data.hits);
    optOutsOnDate.forEach((optOut) => {
      const entityKeyId = getEntityKeyId(optOut);

      optOutMap = optOutMap.set(entityKeyId, optOut);
    });

    yield put(loadOptOutsForDate.success(action.id, { optOutMap }));

    if (optOutMap.size) {
      const optOutIds = optOutMap.keySeq().toJS();
      yield put(loadOptOutNeighbors({ optOutIds }));
    }
  }
  catch (error) {
    LOG.error(error);
    yield put(loadOptOutsForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadOptOutsForDate.finally(action.id));
  }
}

function* loadOptOutsForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_OPT_OUTS_FOR_DATE, loadOptOutsForDateWorker);
}

function* loadRemindersforDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadRemindersforDate.request(action.id));
    const { date } = action.value;
    let successfulRemindersIds = Set();
    let failedRemindersIds = Set();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const remindersEntitySetId = getEntitySetIdFromApp(app, REMINDERS);
    const datePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.DATE_TIME);
    const searchTerm = getUTCDateRangeSearchString(datePropertyTypeId, date);

    const constraints = getSimpleConstraintGroup(searchTerm);

    const searchConstraints = {
      entitySetIds: [remindersEntitySetId],
      constraints,
      start: 0,
      maxHits: MAX_HITS
    };
    const reminderResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints)
    );
    if (reminderResponse.error) throw reminderResponse.error;
    const remindersOnDate = fromJS(reminderResponse.data.hits);
    const remindersById = Map().withMutations((mutableMap) => {
      remindersOnDate.forEach((reminder) => {
        const {
          [ENTITY_KEY_ID]: reminderEKID,
          [DATE_TIME]: reminderDateTime,
          [NOTIFIED]: wasNotified = false
        } = getEntityProperties(reminder, [ENTITY_KEY_ID, DATE_TIME, NOTIFIED]);
        const dateTime = DateTime.fromISO(reminderDateTime);
        if (reminderEKID && dateTime.isValid) {
          mutableMap.set(reminderEKID, reminder);
          if (wasNotified) {
            successfulRemindersIds = successfulRemindersIds.add(reminderEKID);
          }
          else {
            failedRemindersIds = failedRemindersIds.add(reminderEKID);
          }
        }
      });
    });

    yield put(loadRemindersforDate.success(action.id, {
      remindersById,
      successfulRemindersIds,
      failedRemindersIds,
    }));

    if (remindersById.size) {
      const reminderIds = remindersById.keySeq().toJS();
      yield put(loadReminderNeighborsById({ reminderIds }));
    }
  }
  catch (error) {
    LOG.error(error);
    yield put(loadRemindersforDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadRemindersforDate.finally(action.id));
  }
}

function* loadRemindersforDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REMINDERS_FOR_DATE, loadRemindersforDateWorker);
}

function* loadReminderNeighborsByIdWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadReminderNeighborsById.request(action.id));

    const { reminderIds } = action.value;

    let reminderNeighborsById = Map();
    let hearingIds = Set();
    let hearingsMap = Map();
    let hearingIdsToReminderIds = Map();
    let reminderIdsByCounty = Map();

    if (reminderIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
      const contactInformationESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
      const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
      const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
      const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
      const pretrialCasesESID = getEntitySetIdFromApp(app, PRETRIAL_CASES);
      const remindersESID = getEntitySetIdFromApp(app, REMINDERS);
      /*
      * Get Reminders Neighbors
      */
      const reminderNeighborResponse = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: remindersESID,
          filter: {
            entityKeyIds: reminderIds,
            sourceEntitySetIds: [],
            destinationEntitySetIds: [contactInformationESID, hearingsESID, peopleESID]
          }
        })
      );
      if (reminderNeighborResponse.error) throw reminderNeighborResponse.error;
      const neighborsById = fromJS(reminderNeighborResponse.data);

      neighborsById.entrySeq().forEach(([reminderId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const entityKeyId = getEntityKeyId(neighbor);
            if (appTypeFqn === HEARINGS) {
              hearingIdsToReminderIds = hearingIdsToReminderIds.set(entityKeyId, reminderId);
              hearingIds = hearingIds.add(entityKeyId);
              hearingsMap = hearingsMap.set(entityKeyId, neighborObj);
            }
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              appTypeFqn,
              fromJS(neighbor)
            );
          });
        }
        reminderNeighborsById = reminderNeighborsById.set(reminderId, neighborsByAppTypeFqn);
      });

      /*
      * Get Hearing Neighbors
      */
      const hearingNeighborResponse = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: hearingsESID,
          filter: {
            entityKeyIds: hearingIds.toJS(),
            sourceEntitySetIds: [],
            destinationEntitySetIds: [pretrialCasesESID, countiesESID]
          }
        })
      );
      if (hearingNeighborResponse.error) throw hearingNeighborResponse.error;
      const hearingNeighborsById = fromJS(hearingNeighborResponse.data);

      hearingNeighborsById.entrySeq().forEach(([hearingEKID, neighbors]) => {
        if (neighbors.size) {
          let neighborsByAppTypeFqn = Map();
          const reminderEKID = hearingIdsToReminderIds.get(hearingEKID);
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            if (appTypeFqn === PRETRIAL_CASES) {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                appTypeFqn,
                fromJS(neighbor)
              );
            }
            if (appTypeFqn === COUNTIES) {
              const countyEKID = getEntityKeyId(neighbor);
              reminderIdsByCounty = reminderIdsByCounty.set(
                countyEKID,
                reminderIdsByCounty.get(countyEKID, Set()).add(reminderEKID)
              );
            }
          });
          reminderNeighborsById = reminderNeighborsById.set(
            reminderEKID,
            reminderNeighborsById.get(reminderEKID, Map()).merge(neighborsByAppTypeFqn)
          );
        }
      });
    }

    yield put(loadReminderNeighborsById.success(action.id, {
      reminderNeighborsById,
      reminderIdsByCounty
    }));
  }
  catch (error) {
    LOG.error(error);
    yield put(loadReminderNeighborsById.failure(action.id, error));
  }
  finally {
    yield put(loadReminderNeighborsById.finally(action.id));
  }
}

function* loadReminderNeighborsByIdWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REMINDER_NEIGHBORS, loadReminderNeighborsByIdWorker);
}

function* getRemindersActionList(
  remindersActionListDate,
  hearingSearchOptions,
  manualRemindersSearchOptions,
  daysToCheck
) :Generator<*, *, *> {
  let hearingIds = Set();
  let peopleIds = Set();
  let peopleMap = Map();
  let remindersActionList = Map();

  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const inCustodyIds = yield select(getPeopleInCustody);
  const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');
  const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

  const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
  const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
  const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);

  /* Grab All Hearing Data */
  const allHearingDataforDate = yield call(
    searchEntitySetDataWorker,
    searchEntitySetData(hearingSearchOptions)
  );
  if (allHearingDataforDate.error) throw allHearingDataforDate.error;
  const hearingsOnDate = fromJS(allHearingDataforDate.data.hits);

  if (hearingsOnDate.size) {
    hearingsOnDate.forEach((hearing) => {
      const hearingDateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
      const hearingExists = !!hearingDateTime;
      const hearingOnDateSelected = daysToCheck.some((date) => (
        DateTime.fromISO(hearingDateTime).hasSame(DateTime.fromISO(date), 'day')));
      const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
      const hearingEntityKeyId = getEntityKeyId(hearing);
      const hearingIsInactive = hearingIsCancelled(hearing);
      if (hearingType
        && hearingExists
        && hearingOnDateSelected
        && !hearingIsInactive
      ) {
        hearingIds = hearingIds.add(hearingEntityKeyId);
      }
    });
  }

  /* Grab hearing people neighbors */
  if (hearingIds.size) {
    /* get hearing neighbors */
    const hearingNeighborsResponse = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: hearingsEntitySetId,
        filter: {
          entityKeyIds: hearingIds.toJS(),
          sourceEntitySetIds: [peopleEntitySetId],
          destinationEntitySetIds: [countiesESID]
        }
      })
    );
    if (hearingNeighborsResponse.error) throw hearingNeighborsResponse.error;
    const hearingNeighborsById = fromJS(hearingNeighborsResponse.data);

    hearingNeighborsById.valueSeq().forEach((neighbors) => {
      let personEKID;
      let person;
      let isPreferredCounty = false;
      neighbors.forEach((neighbor) => {
        const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(neighbor, [ENTITY_KEY_ID]);
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === PEOPLE) {
          personEKID = entityKeyId;
          person = neighborObj;
          peopleMap = peopleMap.set(entityKeyId, neighborObj);
        }
        if (appTypeFqn === COUNTIES) {
          if (entityKeyId === preferredCountyEKID) isPreferredCounty = true;
        }
      });
      if (personEKID && isPreferredCounty && !inCustodyIds.includes(personEKID)) {
        peopleIds = peopleIds.add(personEKID);
        remindersActionList = remindersActionList.set(personEKID, person);
      }
    });
  }
  if (peopleIds.size) {
    /* Grab people for all Hearings on Selected Date */
    const loadPeopleNeighbors = getPeopleNeighbors({
      dstEntitySets: [CONTACT_INFORMATION, SUBSCRIPTION, HEARINGS],
      peopleEKIDs: peopleIds.toJS(),
      srcEntitySets: [CONTACT_INFORMATION]
    });
    yield put(loadPeopleNeighbors);
  }

  const allManualRemindersforDate = yield call(
    searchEntitySetDataWorker,
    searchEntitySetData(manualRemindersSearchOptions)
  );
  if (allManualRemindersforDate.error) throw allManualRemindersforDate.error;
  const manualRemindersOnDates = fromJS(allManualRemindersforDate.data.hits);

  let manualReminderIds = Set();
  if (manualRemindersOnDates.size) {
    manualRemindersOnDates.forEach((manualReminder) => {
      const { [ENTITY_KEY_ID]: manualReminderEntityKeyId } = getEntityProperties(manualReminder, [ENTITY_KEY_ID]);
      manualReminderIds = manualReminderIds.add(manualReminderEntityKeyId);
    });

    /* Grab hearing people neighbors */
    if (manualReminderIds.size) {
      const manualReminderNeighborsResponse = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: manualRemindersEntitySetId,
          filter: {
            entityKeyIds: manualReminderIds.toJS(),
            sourceEntitySetIds: [],
            destinationEntitySetIds: [peopleEntitySetId]
          }
        })
      );
      if (manualReminderNeighborsResponse.error) throw manualReminderNeighborsResponse.error;
      const manualReminderNeighborsById = fromJS(manualReminderNeighborsResponse.data);

      manualReminderNeighborsById.valueSeq().forEach((neighbors) => {
        neighbors.forEach((neighbor) => {
          const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(neighbor, [ENTITY_KEY_ID]);
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
          if (appTypeFqn === PEOPLE) {
            remindersActionList = remindersActionList.delete(entityKeyId);
          }
        });
      });
    }
  }
  return remindersActionList;
}

function* loadRemindersActionListWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadRemindersActionList.request(action.id));
    const { remindersActionListDate } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const datePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.DATE_TIME);

    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const manualRemindersESID = getEntitySetIdFromApp(app, MANUAL_REMINDERS);

    const today = remindersActionListDate;
    const sixDaysAhead = addWeekdays(remindersActionListDate, 6);
    const todaySearchTerm = getUTCDateRangeSearchString(datePropertyTypeId, today);
    const sixDaysAheadSearchTerm = getUTCDateRangeSearchString(datePropertyTypeId, sixDaysAhead);
    const oneDayAhead = addWeekdays(remindersActionListDate, 1);
    const oneWeekAhead = addWeekdays(remindersActionListDate, 7);
    const oneDayAheadSearchTerm = getUTCDateRangeSearchString(datePropertyTypeId, oneDayAhead);
    const oneWeekAheadSearchTerm = getUTCDateRangeSearchString(datePropertyTypeId, oneWeekAhead);

    const hearingConstraints = getSimpleConstraintGroup(`${oneDayAheadSearchTerm} OR ${oneWeekAheadSearchTerm}`);
    const manualReminderConstraints = getSimpleConstraintGroup(`${todaySearchTerm} OR ${sixDaysAheadSearchTerm}`);

    const hearingSearchOptions = {
      entitySetIds: [hearingsESID],
      constraints: hearingConstraints,
      start: 0,
      maxHits: MAX_HITS
    };
    const manualRemindersOptions = {
      entitySetIds: [manualRemindersESID],
      constraints: manualReminderConstraints,
      start: 0,
      maxHits: MAX_HITS
    };

    const daysToCheck = List.of(oneDayAhead, oneWeekAhead);

    const remindersActionList = yield call(
      getRemindersActionList,
      remindersActionListDate,
      hearingSearchOptions,
      manualRemindersOptions,
      daysToCheck
    );

    yield put(loadRemindersActionList
      .success(action.id, { remindersActionList }));
  }
  catch (error) {
    LOG.error(error);
    yield put(loadRemindersActionList.failure(action.id, error));
  }
  finally {
    yield put(loadRemindersActionList.finally(action.id));
  }
}

function* loadRemindersActionListWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REMINDERS_ACTION_LIST, loadRemindersActionListWorker);
}

export {
  loadOptOutNeighborsWatcher,
  loadOptOutsForDateWatcher,
  loadRemindersActionListWatcher,
  loadRemindersforDateWatcher,
  loadReminderNeighborsByIdWatcher
};
