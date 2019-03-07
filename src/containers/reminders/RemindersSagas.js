/*
 * @flow
 */

import moment from 'moment';
import {
  fromJS,
  Map,
  Set,
  List
} from 'immutable';
import {
  Constants,
  SearchApi,
  DataApi,
  Models
} from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import { getEntitySetId } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import exportPDFList from '../../utils/CourtRemindersPDFUtils';
import { toISODate } from '../../utils/FormattingUtils';
import { addWeekdays } from '../../utils/DataUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  STATE
} from '../../utils/consts/FrontEndStateConsts';
import {
  BULK_DOWNLOAD_REMINDERS_PDF,
  LOAD_OPT_OUT_NEIGHBORS,
  LOAD_OPT_OUTS_FOR_DATE,
  LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS,
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_FOR_DATE,
  bulkDownloadRemindersPDF,
  loadOptOutNeighbors,
  loadOptOutsForDate,
  loadPeopleWithHearingsButNoContacts,
  loadReminderNeighborsById,
  loadRemindersforDate
} from './RemindersActionFactory';

let {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PSA_SCORES,
  REMINDERS,
  REMINDER_OPT_OUTS
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();
PSA_SCORES = PSA_SCORES.toString();
REMINDERS = REMINDERS.toString();
REMINDER_OPT_OUTS = REMINDER_OPT_OUTS.toString();


const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

function* getAllSearchResults(entitySetId :string, searchTerm :string) :Generator<*, *, *> {
  const loadSizeRequest = {
    searchTerm,
    start: 0,
    maxHits: 1
  };
  const response = yield call(SearchApi.searchEntitySetData, entitySetId, loadSizeRequest);
  const { numHits } = response;

  const loadResultsRequest = {
    searchTerm,
    start: 0,
    maxHits: numHits
  };
  return yield call(SearchApi.searchEntitySetData, entitySetId, loadResultsRequest);
}

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
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const optOutEntitySetId = getEntitySetId(app, REMINDER_OPT_OUTS, orgId);
    const contactInformationEntitySetId = getEntitySetId(app, CONTACT_INFORMATION, orgId);
    const hearingsEntitySetId = getEntitySetId(app, HEARINGS, orgId);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);

    if (optOutIds.length) {
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, optOutEntitySetId, {
        entityKeyIds: optOutIds,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId, peopleEntitySetId]
      });
      neighborsById = obfuscateBulkEntityNeighbors(neighborsById);
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
      neighborsById = obfuscateBulkEntityNeighbors(neighborsById);
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
    const orgId = yield select(getOrgId);
    const optOutEntitySetId = getEntitySetId(app, REMINDER_OPT_OUTS, orgId);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const ceiling = yield call(DataApi.getEntitySetSize, optOutEntitySetId);

    const reminderOptions = {
      searchTerm: `${datePropertyTypeId}: ${toISODate(date)}`,
      start: 0,
      maxHits: ceiling,
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
    let futureRemidners = Map();
    let pastReminders = Map();
    let successfulRemindersIds = Set();
    let failedRemindersIds = Set();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const remindersEntitySetId = getEntitySetId(app, REMINDERS, orgId);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const ceiling = yield call(DataApi.getEntitySetSize, remindersEntitySetId);

    const reminderOptions = {
      searchTerm: `${datePropertyTypeId}: ${toISODate(date)}`,
      start: 0,
      maxHits: ceiling,
      fuzzy: false
    };
    const allRemindersDataforDate = yield call(SearchApi.searchEntitySetData, remindersEntitySetId, reminderOptions);
    const remindersOnDate = fromJS(allRemindersDataforDate.hits);
    remindersOnDate.forEach((reminder) => {
      const entityKeyId = reminder.getIn([OPENLATTICE_ID_FQN, 0], '');
      const dateTime = moment(reminder.getIn([PROPERTY_TYPES.DATE_TIME, 0]));
      const wasNotified = reminder.getIn([PROPERTY_TYPES.NOTIFIED, 0], false);

      const reminderIsPending = dateTime.isAfter();

      if (entityKeyId && dateTime) {
        reminderIds = reminderIds.add(entityKeyId);
        if (reminderIsPending) {
          futureRemidners = futureRemidners.set(entityKeyId, reminder);
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
      futureRemidners,
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
    let reminderIdsWithOpenPSAs = List();
    let hearingIds = Set();
    let hearingsMap = Map();
    let hearingIdsToReminderIds = Map();

    if (reminderIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
      const remindersEntitySetId = getEntitySetId(app, REMINDERS, orgId);
      const contactInformationEntitySetId = getEntitySetId(app, CONTACT_INFORMATION, orgId);
      const hearingsEntitySetId = getEntitySetId(app, HEARINGS, orgId);
      const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);
      const psaScoresEntitySetId = getEntitySetId(app, PSA_SCORES, orgId);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, remindersEntitySetId, {
        entityKeyIds: reminderIds,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId, peopleEntitySetId]
      });
      neighborsById = obfuscateBulkEntityNeighbors(neighborsById);
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

      let psasByHearingId = yield call(SearchApi.searchEntityNeighborsWithFilter, hearingsEntitySetId, {
        entityKeyIds: hearingIds.toJS(),
        sourceEntitySetIds: [psaScoresEntitySetId],
        destinationEntitySetIds: []
      });
      psasByHearingId = fromJS(psasByHearingId);
      psasByHearingId = psasByHearingId.filter(neighborList => neighborList
        .some((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
          const isPSA = appTypeFqn === PSA_SCORES;
          const psaIsOpen = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN;
          return isPSA && psaIsOpen;
        }));
      psasByHearingId.entrySeq().forEach(([hearingId, psaList]) => {
        if (psaList.size) {
          const reminderId = hearingIdsToReminderIds.get(hearingId);
          reminderIdsWithOpenPSAs = reminderIdsWithOpenPSAs.concat(reminderIds);
          reminderNeighborsById = reminderNeighborsById.set(
            reminderId,
            reminderNeighborsById.get(reminderId, Map()).set(PSA_SCORES, psaList.get(0, Map()))
          );
        }
      });
    }

    yield put(loadReminderNeighborsById.success(action.id, {
      reminderNeighborsById,
      reminderIdsWithOpenPSAs
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

function* loadPeopleWithHearingsButNoContactsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadPeopleWithHearingsButNoContacts.request(action.id));

    let peopleWithOpenPSAsandHearingsButNoContactById = Map();
    let hearingsMap = Map();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const statusFqn = new FullyQualifiedName(PROPERTY_TYPES.STATUS);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresEntitySetId = getEntitySetId(app, PSA_SCORES, orgId);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);
    const hearingEntityKeyId = getEntitySetId(app, HEARINGS, orgId);
    const contactInformationEntityKeyId = getEntitySetId(app, CONTACT_INFORMATION, orgId);

    /* Grab Open PSAs */
    const statusPropertyTypeId = getPropertyTypeId(edm, statusFqn);
    const filter = PSA_STATUSES.OPEN;
    const searchTerm = `${statusPropertyTypeId}:"${filter}"`;
    const allScoreData = yield call(getAllSearchResults, psaScoresEntitySetId, searchTerm);
    const scoreIds = fromJS(allScoreData.hits).map(score => score.getIn([OPENLATTICE_ID_FQN, 0], ''));

    /* Grab people for all Open PSAs */
    let psaNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, psaScoresEntitySetId, {
      entityKeyIds: scoreIds.toJS(),
      sourceEntitySetIds: [],
      destinationEntitySetIds: [peopleEntitySetId, hearingEntityKeyId]
    });
    psaNeighborsById = fromJS(psaNeighborsById);

    /* Filter for people with hearings */
    psaNeighborsById.entrySeq().forEach(([_, neighbors]) => {
      let person;
      let hasFutureHearing = false;
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const entityKeyId = neighbor.getIn([PSA_ASSOCIATION.DETAILS, OPENLATTICE_ID_FQN, 0], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        const isHearing = appTypeFqn === HEARINGS;
        const isPerson = appTypeFqn === PEOPLE;
        if (isHearing) {
          const hearingDateTime = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]);
          const hearingExists = !!hearingDateTime;
          const hearingType = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.HEARING_TYPE, 0]);
          const hearingIsInactive = neighbor.getIn([PROPERTY_TYPES.HEARING_INACTIVE, 0], false);
          const hearingHasBeenCancelled = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.UPDATE_TYPE, 0], '')
            .toLowerCase().trim() === 'cancelled';
          const hearingInFuture = moment().startOf('day').isBefore(moment(hearingDateTime));
          if (hearingType
            && hearingExists
            && hearingInFuture
            && !hearingHasBeenCancelled
            && !hearingIsInactive
          ) {
            hasFutureHearing = true;
            hearingsMap = hearingsMap.set(entityKeyId, neighborObj);
          }
        }
        if (isPerson) person = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
      });
      if (hasFutureHearing && person) {
        const entityKeyId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
        peopleWithOpenPSAsandHearingsButNoContactById = peopleWithOpenPSAsandHearingsButNoContactById
          .set(entityKeyId, person);
      }
    });

    /* Grab people neighbors */
    let peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: peopleWithOpenPSAsandHearingsButNoContactById.keySeq().toJS(),
      sourceEntitySetIds: [contactInformationEntityKeyId],
      destinationEntitySetIds: [contactInformationEntityKeyId]
    });
    peopleNeighborsById = fromJS(peopleNeighborsById);

    peopleNeighborsById.entrySeq().forEach(([id, neighbors]) => {
      let hasPreferredContact = false;
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        const isContactInformation = appTypeFqn === CONTACT_INFORMATION;
        if (isContactInformation) {
          const isPreferred = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false);
          if (isPreferred) hasPreferredContact = true;
        }
      });
      if (hasPreferredContact) {
        peopleWithOpenPSAsandHearingsButNoContactById = peopleWithOpenPSAsandHearingsButNoContactById.delete(id);
      }
    });
    yield put(loadPeopleWithHearingsButNoContacts
      .success(action.id, { peopleWithOpenPSAsandHearingsButNoContactById }));
  }
  catch (error) {
    console.error(error);
    yield put(loadPeopleWithHearingsButNoContacts.failure(action.id, error));
  }
  finally {
    yield put(loadPeopleWithHearingsButNoContacts.finally(action.id));
  }
}

function* loadPeopleWithHearingsButNoContactsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS, loadPeopleWithHearingsButNoContactsWorker);
}

function* bulkDownloadRemindersPDFWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(bulkDownloadRemindersPDF.request(action.id));
    const { date } = action.value;
    let {
      optOutPeopleIds,
      failedPeopleIds,
      peopleWithHearingsButNoContacts
    } = action.value;

    if (!optOutPeopleIds) optOutPeopleIds = List();
    if (!failedPeopleIds) failedPeopleIds = List();
    if (!peopleWithHearingsButNoContacts) peopleWithHearingsButNoContacts = List();

    let hearingIds = Set();
    let hearingMap = Map();
    let hearingIdToPeopleNotContacted = Map();
    let pageDetailsList = List();
    const fileName = `Notices_To_Appear_In_Court_${date}`;

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const hearingsEntitySetId = getEntitySetId(app, HEARINGS, orgId);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);

    const ceiling = yield call(DataApi.getEntitySetSize, hearingsEntitySetId);

    const oneDayAhead = addWeekdays(date, 1);
    const oneWeekAhead = addWeekdays(date, 5);

    const reminderOptions = {
      searchTerm: `${datePropertyTypeId}: "${toISODate(oneDayAhead)}" OR ${datePropertyTypeId}: "${toISODate(oneWeekAhead)}"`,
      start: 0,
      maxHits: ceiling,
      fuzzy: false
    };


    const allHearingDataforDate = yield call(SearchApi.searchEntitySetData, hearingsEntitySetId, reminderOptions);
    const hearingsOnDate = fromJS(allHearingDataforDate.hits);
    if (hearingsOnDate.size) {
      hearingsOnDate.forEach((hearing) => {
        const entityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
        const hearingDateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const hearingExists = !!hearingDateTime;
        const hearingOnDateSelected = moment(hearingDateTime).isSame(oneDayAhead, 'day')
          || moment(hearingDateTime).isSame(oneWeekAhead, 'day');
        const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingIsInactive = hearing.getIn([PROPERTY_TYPES.HEARING_INACTIVE, 0], false);
        const hearingHasBeenCancelled = hearing.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '')
          .toLowerCase().trim() === 'cancelled';
        if (hearingType
          && hearingExists
          && hearingOnDateSelected
          && !hearingHasBeenCancelled
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
        const isPerson = appTypeFqn === PEOPLE;
        if (isPerson) {
          const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
          hasNotBeenContacted = optOutPeopleIds.includes(entityKeyId)
            || failedPeopleIds.includes(entityKeyId)
            || peopleWithHearingsButNoContacts.includes(entityKeyId);
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
  loadPeopleWithHearingsButNoContactsWatcher,
  loadRemindersforDateWatcher,
  loadReminderNeighborsByIdWatcher
};
