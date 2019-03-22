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

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { getHearingFields } from '../../utils/consts/HearingConsts';
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
  LOAD_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS,
  LOAD_MANUAL_REMINDERS_NEIGHBORS,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
} from './ManualRemindersActionFactory';

let {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PSA_SCORES,
  REMINDERS,
  REMINDER_OPT_OUTS,
  PRETRIAL_CASES
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();
PSA_SCORES = PSA_SCORES.toString();
REMINDERS = REMINDERS.toString();
REMINDER_OPT_OUTS = REMINDER_OPT_OUTS.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();


const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

function* loadManualRemindersFormWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadManualRemindersForm.request(action.id));
    const { personId } = action.value;

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE, orgId);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS, orgId);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION, orgId);

    let personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personId],
      sourceEntitySetIds: [contactInformationEntitySetId],
      destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId]
    });
    personNeighborsById = obfuscateBulkEntityNeighbors(personNeighborsById);
    personNeighborsById = fromJS(personNeighborsById);
    let neighborsByAppTypeFqn = Map();
    personNeighborsById.entrySeq().forEach(([_, neighbors]) => {
      if (neighbors) {
        neighbors.forEach((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
          if (appTypeFqn === HEARINGS) {
            const { hearingDateTime } = getHearingFields(neighborObj);
            if (moment().isBefore(hearingDateTime)) {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                appTypeFqn,
                neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighborObj))
              );
            }
          }
          else {
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              appTypeFqn,
              neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighbor))
            );
          }
        });
      }
    });


    yield put(loadManualRemindersForm.success(action.id, {
      neighborsByAppTypeFqn
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadManualRemindersForm.failure(action.id, { error }));
  }
  finally {
    yield put(loadManualRemindersForm.finally(action.id));
  }
}

function* loadManualRemindersFormWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_MANUAL_REMINDERS_FORM, loadManualRemindersFormWorker);
}


function* loadManualRemindersForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadManualRemindersForDate.request(action.id));
    const { date } = action.value;
    let reminderIds = Set();
    let futureReminders = Map();
    let pastReminders = Map();
    let successfulRemindersIds = Set();
    let failedRemindersIds = Set();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const remindersEntitySetId = getEntitySetIdFromApp(app, REMINDERS, orgId);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const ceiling = yield call(DataApi.getEntitySetSize, remindersEntitySetId);

    const reminderOptions = {
      searchTerm: `${datePropertyTypeId}:"${toISODate(date)}"`,
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

    yield put(loadManualRemindersForDate.success(action.id, {
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
    yield put(loadManualRemindersForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadManualRemindersForDate.finally(action.id));
  }
}

function* loadManualRemindersForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_MANUAL_REMINDERS, loadManualRemindersForDateWorker);
}


function* loadManualRemindersNeighborsByIdWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadManualRemindersNeighborsById.request(action.id));

    const { reminderIds } = action.value;

    let reminderNeighborsById = Map();
    let hearingIds = Set();
    let hearingsMap = Map();
    let hearingIdsToReminderIds = Map();

    if (reminderIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
      const remindersEntitySetId = getEntitySetIdFromApp(app, REMINDERS, orgId);
      const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION, orgId);
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS, orgId);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE, orgId);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES, orgId);
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

    yield put(loadManualRemindersNeighborsById.success(action.id, {
      reminderNeighborsById
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadManualRemindersNeighborsById.failure(action.id, error));
  }
  finally {
    yield put(loadManualRemindersNeighborsById.finally(action.id));
  }
}

function* loadManualRemindersNeighborsByIdWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_MANUAL_REMINDERS_NEIGHBORS, loadManualRemindersNeighborsByIdWorker);
}


export {
  loadManualRemindersFormWatcher,
  loadManualRemindersForDateWatcher,
  loadManualRemindersNeighborsByIdWatcher
};
