/*
 * @flow
 */

import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';
import { Constants, SearchApi, Models } from 'lattice';
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

import exportPDFList from '../../utils/CourtRemindersPDFUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { MAX_HITS, PSA_STATUSES } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getUTCDateRangeSearchString} from '../../utils/consts/DateTimeConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  addWeekdays,
  getEntityProperties,
  getSearchTerm,
  getSearchTermNotExact
} from '../../utils/DataUtils';
import {
  BULK_DOWNLOAD_REMINDERS_PDF,
  LOAD_OPT_OUT_NEIGHBORS,
  LOAD_OPT_OUTS_FOR_DATE,
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_ACTION_LIST,
  LOAD_REMINDERS_FOR_DATE,
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadRemindersActionList,
  loadOptOutsForDate,
  loadReminderNeighborsById,
  loadRemindersforDate
} from './RemindersActionFactory';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const {
  CONTACT_INFORMATION,
  HEARINGS,
  MANUAL_REMINDERS,
  PEOPLE,
  PSA_SCORES,
  REMINDERS,
  REMINDER_OPT_OUTS,
  PRETRIAL_CASES,
  SUBSCRIPTION
} = APP_TYPES;

const {
  ENTITY_KEY_ID,
  IS_ACTIVE,
  IS_PREFERRED,
  STATUS
} = PROPERTY_TYPES;

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

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
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, optOutEntitySetId, {
        entityKeyIds: optOutIds,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId, peopleEntitySetId]
      });
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([optOutId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
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
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, contactInformationEntitySetId, {
        entityKeyIds: optOutContactInfoIds.toJS(),
        sourceEntitySetIds: [peopleEntitySetId],
        destinationEntitySetIds: [peopleEntitySetId]
      });
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([contactInfoId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors.size) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
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
    console.error(error);
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
    let optOutIds = Set();
    let optOutMap = Map();
    let optOutsWithReasons = Set();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const optOutEntitySetId = getEntitySetIdFromApp(app, REMINDER_OPT_OUTS);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);
    const searchTerm = getUTCDateRangeSearchString(datePropertyTypeId, date);

    const reminderOptions = {
      searchTerm,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    const allOptOutDataforDate = yield call(SearchApi.searchEntitySetData, optOutEntitySetId, reminderOptions);
    const optOutsOnDate = fromJS(allOptOutDataforDate.hits);
    optOutsOnDate.forEach((optOut) => {
      const entityKeyId = optOut.getIn([OPENLATTICE_ID_FQN, 0], '');
      const hasReason = !!optOut.getIn([PROPERTY_TYPES.REASON, 0], '');

      optOutIds = optOutIds.add(entityKeyId);
      optOutMap = optOutMap.set(entityKeyId, optOut);
      if (hasReason) optOutsWithReasons = optOutsWithReasons.add(entityKeyId);
    });

    yield put(loadOptOutsForDate.success(action.id, {
      optOutMap,
      optOutsWithReasons
    }));

    if (optOutIds.size) {
      optOutIds = optOutIds.toJS();
      yield put(loadOptOutNeighbors({ optOutIds }));
    }
  }
  catch (error) {
    console.error(error);
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
    let reminderIds = Set();
    let futureReminders = Map();
    let pastReminders = Map();
    let successfulRemindersIds = Set();
    let failedRemindersIds = Set();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const remindersEntitySetId = getEntitySetIdFromApp(app, REMINDERS);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);
    const searchTerm = getUTCDateRangeSearchString(datePropertyTypeId, date);

    const reminderOptions = {
      searchTerm,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    const allRemindersDataforDate = yield call(SearchApi.searchEntitySetData, remindersEntitySetId, reminderOptions);
    const remindersOnDate = fromJS(allRemindersDataforDate.hits);
    remindersOnDate.forEach((reminder) => {
      const entityKeyId = reminder.getIn([OPENLATTICE_ID_FQN, 0], '');
      const dateTime = DateTime.fromISO(reminder.getIn([PROPERTY_TYPES.DATE_TIME, 0]));
      const wasNotified = reminder.getIn([PROPERTY_TYPES.NOTIFIED, 0], false);

      const reminderIsPending = dateTime > DateTime.local();

      if (entityKeyId && dateTime.isValid) {
        reminderIds = reminderIds.add(entityKeyId);
        if (reminderIsPending) {
          futureReminders = futureReminders.set(entityKeyId, reminder);
        }
        else {
          pastReminders = pastReminders.set(entityKeyId, reminder);
          if (wasNotified) {
            successfulRemindersIds = successfulRemindersIds.add(entityKeyId);
          }
          else {
            failedRemindersIds = failedRemindersIds.add(entityKeyId);
          }
        }
      }
    });

    yield put(loadRemindersforDate.success(action.id, {
      reminderIds,
      futureReminders,
      pastReminders,
      successfulRemindersIds,
      failedRemindersIds,
    }));

    if (reminderIds.size) {
      reminderIds = reminderIds.toJS();
      yield put(loadReminderNeighborsById({ reminderIds }));
    }
  }
  catch (error) {
    console.error(error);
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

    if (reminderIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
      const remindersEntitySetId = getEntitySetIdFromApp(app, REMINDERS);
      const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, remindersEntitySetId, {
        entityKeyIds: reminderIds,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId, peopleEntitySetId]
      });
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([reminderId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
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
          const reminderId = hearingIdsToReminderIds.get(hearingId);
          reminderNeighborsById = reminderNeighborsById.set(
            reminderId,
            reminderNeighborsById.get(reminderId, Map()).merge(neighborsByAppTypeFqn)
          );
        }
      });
    }

    yield put(loadReminderNeighborsById.success(action.id, {
      reminderNeighborsById
    }));
  }
  catch (error) {
    console.error(error);
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

  const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
  const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
  const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
  const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
  const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
  const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

  /* Grab All Hearing Data */
  const allHearingDataforDate = yield call(
    searchEntitySetDataWorker,
    searchEntitySetData({ entitySetId: hearingsEntitySetId, searchOptions: hearingSearchOptions })
  );
  if (allHearingDataforDate.error) throw allHearingDataforDate.error;
  const hearingsOnDate = fromJS(allHearingDataforDate.data.hits);

  if (hearingsOnDate.size) {
    hearingsOnDate.forEach((hearing) => {
      const hearingDateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
      const hearingExists = !!hearingDateTime;
      const hearingOnDateSelected = daysToCheck.some(date => (
        DateTime.fromISO(hearingDateTime).hasSame(DateTime.fromISO(date), 'day')));
      const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
      const hearingEntityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
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
    let hearingNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, hearingsEntitySetId, {
      entityKeyIds: hearingIds.toJS(),
      sourceEntitySetIds: [peopleEntitySetId],
      destinationEntitySetIds: []
    });
    hearingNeighborsById = fromJS(hearingNeighborsById);

    hearingNeighborsById.entrySeq().forEach(([_, neighbors]) => {
      neighbors.forEach((neighbor) => {
        const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(neighbor, [ENTITY_KEY_ID]);
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === PEOPLE) {
          peopleIds = peopleIds.add(entityKeyId);
          peopleMap = peopleMap.set(entityKeyId, neighborObj);
        }
      });
    });
  }
  if (peopleIds.size) {
    /* Grab people for all Hearings on Selected Date */
    let peopleNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: peopleIds.toJS(),
      sourceEntitySetIds: [psaScoresEntitySetId, contactInformationEntitySetId],
      destinationEntitySetIds: [contactInformationEntitySetId, subscriptionEntitySetId]
    });
    peopleNeighbors = fromJS(peopleNeighbors);

    /* Filter for people with open PSAs and either not contact info or subscription */
    peopleNeighbors.entrySeq().forEach(([id, neighbors]) => {
      let hasAnOpenPSA = false;
      let hasPreferredContact = false;
      let hasASubscription = false;
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === SUBSCRIPTION) {
          const { [IS_ACTIVE]: isActive } = getEntityProperties(neighbor, [IS_ACTIVE]);
          if (isActive) hasASubscription = true;
        }
        if (appTypeFqn === CONTACT_INFORMATION) {
          const { [IS_PREFERRED]: isPreferred } = getEntityProperties(neighbor, [IS_PREFERRED]);
          if (isPreferred) hasPreferredContact = true;
        }
        if (appTypeFqn === PSA_SCORES) {
          const { [STATUS]: status } = getEntityProperties(neighbor, [STATUS]);
          const isOpen = (status === PSA_STATUSES.OPEN);
          if (isOpen) hasAnOpenPSA = true;
        }
      });
      const personIsReceivingReminders = hasPreferredContact && hasASubscription;
      if (hasAnOpenPSA && !personIsReceivingReminders) {
        const person = peopleMap.get(id, Map());
        remindersActionList = remindersActionList.set(id, person);
      }
    });
  }

  const allManualRemindersforDate = yield call(
    searchEntitySetDataWorker,
    searchEntitySetData({ entitySetId: manualRemindersEntitySetId, searchOptions: manualRemindersSearchOptions })
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
      let manualReminderNeighborsById = yield call(
        SearchApi.searchEntityNeighborsWithFilter,
        manualRemindersEntitySetId,
        {
          entityKeyIds: manualReminderIds.toJS(),
          sourceEntitySetIds: [],
          destinationEntitySetIds: [peopleEntitySetId]
        }
      );
      manualReminderNeighborsById = fromJS(manualReminderNeighborsById);

      manualReminderNeighborsById.entrySeq().forEach(([_, neighbors]) => {
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

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const edm = yield select(getEDM);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const oneDayAhead = addWeekdays(remindersActionListDate, 1).toISODate();
    const oneWeekAhead = addWeekdays(remindersActionListDate, 7).toISODate();

    const hearingSearchOptions = {
      searchTerm: `entity.${datePropertyTypeId}:"${oneDayAhead}" OR entity.${datePropertyTypeId}:"${oneWeekAhead}"`,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };

    const today = DateTime.local().toISO();
    const sixDaysAhead = addWeekdays(remindersActionListDate, 6).toISODate();

    const manualRemindersOptions = {
      searchTerm: `entity.${datePropertyTypeId}:"${today}" OR entity.${datePropertyTypeId}:"${sixDaysAhead}"`,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
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
    console.error(error);
    yield put(loadRemindersActionList.failure(action.id, error));
  }
  finally {
    yield put(loadRemindersActionList.finally(action.id));
  }
}

function* loadRemindersActionListWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REMINDERS_ACTION_LIST, loadRemindersActionListWorker);
}

function* bulkDownloadRemindersPDFWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(bulkDownloadRemindersPDF.request(action.id));
    const { date } = action.value;
    let {
      optOutPeopleIds,
      failedPeopleIds,
      remindersActionList
    } = action.value;

    if (!optOutPeopleIds) optOutPeopleIds = List();
    if (!failedPeopleIds) failedPeopleIds = List();
    if (!remindersActionList) remindersActionList = List();

    let hearingIds = Set();
    let hearingMap = Map();
    let hearingIdToPeopleNotContacted = Map();
    let pageDetailsList = List();
    const fileName = `Notices_To_Appear_In_Court_${date}`;

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    const oneWeekAhead = addWeekdays(date, 7).toISODate();

    const hearingOptions = {
      searchTerm: `${getSearchTerm(datePropertyTypeId, oneWeekAhead)}`,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };


    // const allHearingDataforDate = yield call(SearchApi.searchEntitySetData, hearingsEntitySetId, reminderOptions);
    const allHearingDataforDate = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: hearingsEntitySetId, searchOptions: hearingOptions })
    );
    if (allHearingDataforDate.error) throw allHearingDataforDate.error;
    const hearingsOnDate = fromJS(allHearingDataforDate.data.hits);
    if (hearingsOnDate.size) {
      hearingsOnDate.forEach((hearing) => {
        const entityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
        const hearingDateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const hearingExists = !!hearingDateTime;
        const hearingOnDateSelected = DateTime.fromISO(hearingDateTime).hasSame(DateTime.fromISO(oneWeekAhead), 'day');
        const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingIsInactive = hearingIsCancelled(hearing);
        if (hearingType
          && hearingExists
          && hearingOnDateSelected
          && !hearingIsInactive
        ) {
          hearingIds = hearingIds.add(hearingId);
          hearingMap = hearingMap.set(entityKeyId, hearing);
        }
      });
    }

    /* Grab hearing neighbors */
    let hearingNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, hearingsEntitySetId, {
      entityKeyIds: hearingIds.toJS(),
      sourceEntitySetIds: [peopleEntitySetId],
      destinationEntitySetIds: []
    });
    hearingNeighborsById = fromJS(hearingNeighborsById);

    hearingNeighborsById.entrySeq().forEach(([id, neighbors]) => {
      let hasNotBeenContacted = false;
      let person;
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === PEOPLE) {
          const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
          hasNotBeenContacted = optOutPeopleIds.includes(entityKeyId)
            || failedPeopleIds.includes(entityKeyId)
            || remindersActionList.includes(entityKeyId);
          if (hasNotBeenContacted) {
            hasNotBeenContacted = true;
            person = neighborObj;
          }
        }
      });
      if (person && hasNotBeenContacted) {
        hearingIdToPeopleNotContacted = hearingIdToPeopleNotContacted.set(id, person);
      }
    });

    hearingIdToPeopleNotContacted.entrySeq().forEach(([hearingId, selectedPerson]) => {
      const selectedHearing = hearingMap.get(hearingId, Map());
      pageDetailsList = pageDetailsList.push({ selectedPerson, selectedHearing });
    });
    pageDetailsList = pageDetailsList
      .groupBy(reminderObj => reminderObj.selectedPerson.getIn([OPENLATTICE_ID_FQN, 0], ''))
      .valueSeq()
      .map((personList) => {
        const selectPerson = personList.getIn([0, 'selectedPerson'], Map());
        const selectHearings = personList.map(personHearing => personHearing.selectedHearing || Map());
        return { selectedPerson: selectPerson, selectedHearing: selectHearings };
      });
    exportPDFList(fileName, pageDetailsList);
  }
  catch (error) {
    console.error(error);
    yield put(bulkDownloadRemindersPDF.failure(action.id, { error }));
  }
  finally {
    yield put(bulkDownloadRemindersPDF.finally(action.id));
  }
}

function* bulkDownloadRemindersPDFWatcher() :Generator<*, *, *> {
  yield takeEvery(BULK_DOWNLOAD_REMINDERS_PDF, bulkDownloadRemindersPDFWorker);
}


export {
  bulkDownloadRemindersPDFWatcher,
  loadOptOutNeighborsWatcher,
  loadOptOutsForDateWatcher,
  loadRemindersActionListWatcher,
  loadRemindersforDateWatcher,
  loadReminderNeighborsByIdWatcher
};
