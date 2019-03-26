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
import { getHearingFields } from '../../utils/consts/HearingConsts';
import { toISODate } from '../../utils/FormattingUtils';
import { hearingNeedsReminder } from '../../utils/RemindersUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
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
  MANUAL_REMINDERS,
  PRETRIAL_CASES,
  STAFF
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();
MANUAL_REMINDERS = MANUAL_REMINDERS.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();
STAFF = STAFF.toString();


const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

function* loadManualRemindersFormWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadManualRemindersForm.request(action.id));
    const { personEntityKeyId } = action.value;

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE, orgId);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS, orgId);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION, orgId);

    let personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
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
            if (hearingNeedsReminder(neighborObj)) {
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
    let manualReminderIds = Set();
    let manualReminders = Map();
    let successfulManualRemindersIds = Set();
    let failedManualRemindersIds = Set();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS, orgId);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const ceiling = yield call(DataApi.getEntitySetSize, manualRemindersEntitySetId);

    const reminderOptions = {
      searchTerm: `${datePropertyTypeId}:"${toISODate(date)}"`,
      start: 0,
      maxHits: ceiling,
      fuzzy: false
    };
    const allRemindersDataforDate = yield call(
      SearchApi.searchEntitySetData,
      manualRemindersEntitySetId,
      reminderOptions
    );
    const manualRemindersOnDate = fromJS(allRemindersDataforDate.hits);
    manualRemindersOnDate.forEach((reminder) => {
      const entityKeyId = reminder.getIn([OPENLATTICE_ID_FQN, 0], '');
      const dateTime = moment(reminder.getIn([PROPERTY_TYPES.DATE_TIME, 0]));
      const wasNotified = reminder.getIn([PROPERTY_TYPES.NOTIFIED, 0], false);

      if (entityKeyId && dateTime) {
        manualReminderIds = manualReminderIds.add(entityKeyId);
        manualReminders = manualReminders.set(entityKeyId, reminder);
        if (wasNotified) {
          successfulManualRemindersIds = successfulManualRemindersIds.add(entityKeyId);
        }
        else {
          failedManualRemindersIds = failedManualRemindersIds.add(entityKeyId);
        }
      }
    });

    yield put(loadManualRemindersForDate.success(action.id, {
      manualReminderIds,
      manualReminders,
      successfulManualRemindersIds,
      failedManualRemindersIds
    }));

    if (manualReminderIds.size) {
      manualReminderIds = manualReminderIds.toJS();
      yield put(loadManualRemindersNeighborsById({ manualReminderIds }));
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

    const { manualReminderIds } = action.value;

    let manualReminderNeighborsById = Map();
    let hearingIds = Set();
    let hearingsMap = Map();
    let hearingIdsToManualReminderIds = Map();
    let peopleReceivingManualReminders = Set();

    if (manualReminderIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
      const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS, orgId);
      const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION, orgId);
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS, orgId);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE, orgId);
      const staffEntitySetId = getEntitySetIdFromApp(app, STAFF, orgId);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES, orgId);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, manualRemindersEntitySetId, {
        entityKeyIds: manualReminderIds,
        sourceEntitySetIds: [],
        destinationEntitySetIds: [
          staffEntitySetId,
          contactInformationEntitySetId,
          hearingsEntitySetId,
          peopleEntitySetId
        ]
      });
      neighborsById = obfuscateBulkEntityNeighbors(neighborsById);
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([manualReminderEntityKeyId, neighbors]) => {
        let neighborsByAppTypeFqn = Map();
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
            if (appTypeFqn === HEARINGS) {
              hearingIdsToManualReminderIds = hearingIdsToManualReminderIds.set(entityKeyId, manualReminderEntityKeyId);
              hearingIds = hearingIds.add(entityKeyId);
              hearingsMap = hearingsMap.set(entityKeyId, neighborObj);
            }
            if (appTypeFqn === PEOPLE) {
              peopleReceivingManualReminders = peopleReceivingManualReminders.add(entityKeyId);
            }
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              appTypeFqn,
              fromJS(neighbor)
            );
          });
        }
        manualReminderNeighborsById = manualReminderNeighborsById.set(manualReminderEntityKeyId, neighborsByAppTypeFqn);
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
          const manualReminderEntityKeyId = hearingIdsToManualReminderIds.get(hearingId);
          manualReminderNeighborsById = manualReminderNeighborsById.set(
            manualReminderEntityKeyId,
            manualReminderNeighborsById.get(manualReminderEntityKeyId, Map()).merge(neighborsByAppTypeFqn)
          );
        }
      });
    }

    yield put(loadManualRemindersNeighborsById.success(action.id, {
      manualReminderNeighborsById,
      peopleReceivingManualReminders
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
