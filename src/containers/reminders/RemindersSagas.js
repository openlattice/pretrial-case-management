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
} from 'redux-saga/effects';

import { getEntitySetId } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { APP, PSA_NEIGHBOR, STATE } from '../../utils/consts/FrontEndStateConsts';
import { toISODate } from '../../utils/FormattingUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  LOAD_PEOPLE_WITH_HEARINGS_BUT_NO_CONTACTS,
  LOAD_REMINDER_NEIGHBORS,
  LOAD_REMINDERS_FOR_DATE,
  loadPeopleWithHearingsButNoContacts,
  loadReminderNeighborsById,
  loadRemindersforDate
} from './RemindersActionFactory';

let {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PSA_SCORES,
  REMINDERS
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();
PSA_SCORES = PSA_SCORES.toString();
REMINDERS = REMINDERS.toString();

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
        // destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId, peopleEntitySetId]
      });
      neighborsById = obfuscateBulkEntityNeighbors(neighborsById);
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([reminderId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
            if (appTypeFqn === HEARINGS) {
              hearingIdsToReminderIds = hearingIdsToReminderIds.set(entityKeyId, reminderId);
              hearingIds = hearingIds.add(entityKeyId);
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
        // destinationEntitySetIds: []
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

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const statusfqn = new FullyQualifiedName(PROPERTY_TYPES.STATUS);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresEntitySetId = getEntitySetId(app, PSA_SCORES, orgId);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);
    const hearingEntityKeyId = getEntitySetId(app, HEARINGS, orgId);
    const contactInformationEntityKeyId = getEntitySetId(app, CONTACT_INFORMATION, orgId);

    /* Grab Open PSAs */
    const statusPropertyTypeId = getPropertyTypeId(edm, statusfqn);
    const filter = action.value || PSA_STATUSES.OPEN;
    const searchTerm = action.value === '*' ? action.value : `${statusPropertyTypeId}:"${filter}"`;
    const allScoreData = yield call(getAllSearchResults, psaScoresEntitySetId, searchTerm);
    const scoreIds = fromJS(allScoreData.hits).map(score => score.getIn([OPENLATTICE_ID_FQN, 0], ''));

    /* Grab people for all Open PSAs */
    let psaNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, psaScoresEntitySetId, {
      entityKeyIds: scoreIds.toJS(),
      sourceEntitySetIds: [psaScoresEntitySetId],
      destinationEntitySetIds: [peopleEntitySetId, hearingEntityKeyId]
    });
    psaNeighborsById = fromJS(psaNeighborsById);

    /* Filter for people with hearings */
    psaNeighborsById.entrySeq().forEach(([_, neighbors]) => {
      let person;
      let hasFutureHearing = false;
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        const isHearing = appTypeFqn === HEARINGS;
        const isPerson = appTypeFqn === PEOPLE;
        if (isHearing) {
          const hearingDateTime = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]);
          const hearingExists = !!hearingDateTime;
          const hearingType = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.HEARING_TYPE, 0]);
          const hearingHasBeenCancelled = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.UPDATE_TYPE, 0], '')
            .toLowerCase().trim() === 'cancelled';
          const hearingInFuture = moment().isBefore(moment(hearingDateTime));
          if (hearingType
            && hearingExists
            && hearingInFuture
            && !hearingHasBeenCancelled
          ) hasFutureHearing = true;
        }
        if (isPerson) person = neighbor;
      });
      if (hasFutureHearing && person) {
        const entityKeyId = person.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
        peopleWithOpenPSAsandHearingsButNoContactById = peopleWithOpenPSAsandHearingsButNoContactById
          .set(entityKeyId, person);
      }
    });

    /* Grab people neighbors */
    let peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: peopleWithOpenPSAsandHearingsButNoContactById.keySeq().toJS(),
      sourceEntitySetIds: [],
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
          const isPreferred = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PREFERRED, 0], false);
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


export {
  loadPeopleWithHearingsButNoContactsWatcher,
  loadRemindersforDateWatcher,
  loadReminderNeighborsByIdWatcher
};
