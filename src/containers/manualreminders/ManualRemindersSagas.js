/*
 * @flow
 */

import { DateTime } from 'luxon';
import { AuthUtils } from 'lattice-auth';
import { Constants, Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
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
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { createIdObject } from '../../utils/DataUtils';
import { getUTCDateRangeSearchString } from '../../utils/consts/DateTimeConsts';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { hearingNeedsReminder } from '../../utils/RemindersUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MAX_HITS } from '../../utils/consts/Consts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  LOAD_MANUAL_REMINDERS_FORM,
  LOAD_MANUAL_REMINDERS,
  LOAD_MANUAL_REMINDERS_NEIGHBORS,
  SUBMIT_MANUAL_REMINDER,
  loadManualRemindersForm,
  loadManualRemindersForDate,
  loadManualRemindersNeighborsById,
  submitManualReminder,
} from './ManualRemindersActions';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { REMINDERS_DATA } from '../../utils/consts/redux/RemindersConsts';

const LOG :Logger = new Logger('ManualRemindersSagas');

const { createEntityAndAssociationData, getEntityData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;

const {
  ASSESSED_BY,
  CONTACT_INFORMATION,
  HEARINGS,
  MANUAL_REMINDERS,
  PEOPLE,
  PRETRIAL_CASES,
  REGISTERED_FOR,
  STAFF
} = APP_TYPES;

const {
  COMPLETED_DATE_TIME,
} = PROPERTY_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getReminderActionListDate = (state) => (
  state.getIn([STATE.REMINDERS, REMINDERS_DATA.REMINDERS_ACTION_LIST_DATE], DateTime.local().toISO())
);
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const getStaffId = () => {
  const staffInfo = AuthUtils.getUserInfo();
  let staffId = staffInfo.email;
  if (!staffId.length) {
    staffId = staffInfo.id;
  }
  return staffId;
};

function* loadManualRemindersFormWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadManualRemindersForm.request(action.id));
    const { personEntityKeyId } = action.value;

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const remindersActionListDate = yield select(getReminderActionListDate);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    /*
    * Get Neighbors
    */
    const personNeighbors = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: [personEntityKeyId],
          sourceEntitySetIds: [contactInformationEntitySetId],
          destinationEntitySetIds: [contactInformationEntitySetId, hearingsEntitySetId]
        }
      })
    );
    if (personNeighbors.error) throw personNeighbors.error;
    const personNeighborsById = fromJS(personNeighbors.data);
    let neighborsByAppTypeFqn = Map();
    personNeighborsById.valueSeq().forEach((neighbors) => {
      if (neighbors) {
        neighbors.forEach((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
          if (appTypeFqn === HEARINGS) {
            if (hearingNeedsReminder(neighborObj, remindersActionListDate)) {
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
    LOG.error(error);
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
    const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);
    const searchTerm = getUTCDateRangeSearchString(datePropertyTypeId, date);

    const reminderOptions = {
      searchTerm,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };

    const allRemindersData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: manualRemindersEntitySetId, searchOptions: reminderOptions })
    );
    if (allRemindersData.error) throw allRemindersData.error;
    const manualRemindersOnDate = fromJS(allRemindersData.data.hits);
    manualRemindersOnDate.forEach((reminder) => {
      const entityKeyId = reminder.getIn([OPENLATTICE_ID_FQN, 0], '');
      const dateTime = DateTime.fromISO(reminder.getIn([PROPERTY_TYPES.DATE_TIME, 0]));
      const wasNotified = reminder.getIn([PROPERTY_TYPES.NOTIFIED, 0], false);

      if (entityKeyId && dateTime.isValid) {
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
    LOG.error(error);
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
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
      /*
       * Get Entity Set Ids
       */
      const contactInformationESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
      const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
      const manualRemindersESID = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
      const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
      const staffESID = getEntitySetIdFromApp(app, STAFF);
      /*
      * Get Neighbors
      */
      const manualReminderNeighborsResponse = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: manualRemindersESID,
          filter: {
            entityKeyIds: manualReminderIds,
            sourceEntitySetIds: [],
            destinationEntitySetIds: [contactInformationESID, hearingsESID, peopleESID, staffESID]
          }
        })
      );
      if (manualReminderNeighborsResponse.error) throw manualReminderNeighborsResponse.error;
      const neighborsById = fromJS(manualReminderNeighborsResponse.data);
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

      /*
      * Get Neighbors
      */
      const hearingNeighbors = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: hearingsESID,
          filter: {
            entityKeyIds: hearingIds.toJS(),
            sourceEntitySetIds: [],
            destinationEntitySetIds: [pretrialCasesEntitySetId]
          }
        })
      );
      if (hearingNeighbors.error) throw hearingNeighbors.error;
      const hearingNeighborsById = fromJS(hearingNeighbors.data);

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
    LOG.error(error);
    yield put(loadManualRemindersNeighborsById.failure(action.id, error));
  }
  finally {
    yield put(loadManualRemindersNeighborsById.finally(action.id));
  }
}

function* loadManualRemindersNeighborsByIdWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_MANUAL_REMINDERS_NEIGHBORS, loadManualRemindersNeighborsByIdWorker);
}


function* submitManualReminderWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitManualReminder.request(action.id));
    const {
      contactInformationEKID,
      hearingEKID,
      manualReminderEntity,
      personEKID
    } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);

    /*
     * Get Staff Entity Key Id
     */
    const staffIdsToEntityKeyIds = app.get(APP_DATA.STAFF_IDS_TO_EKIDS, Map());
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const staffId = getStaffId();
    const staffEKID = staffIdsToEntityKeyIds.get(staffId, '');

    /*
     * Get Prooperty Type Ids
     */
    const completedDateTimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);

    /*
     * Get Entity Submission
     */
    const manualReminderSubmitEntity = getPropertyIdToValueMap(manualReminderEntity, edm);

    /*
     * Get Entity Set Ids
     */
    const contactInformationESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const manualRemindersESID = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const staffESID = getEntitySetIdFromApp(app, STAFF);

    const assessedByESID = getEntitySetIdFromApp(app, ASSESSED_BY);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);

    /*
     * Assemble Assoociations
     */
    const data = { [completedDateTimePTID]: [DateTime.local().toISO()] };
    const associations = {
      [assessedByESID]: [{
        data,
        srcEntityIndex: 0,
        srcEntitySetId: manualRemindersESID,
        dstEntityKeyId: staffEKID,
        dstEntitySetId: staffESID
      }],
      [registeredForESID]: [
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: manualRemindersESID,
          dstEntityKeyId: hearingEKID,
          dstEntitySetId: hearingsESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: manualRemindersESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        }
      ]
    };

    if (contactInformationEKID) {
      associations[registeredForESID].push(
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: manualRemindersESID,
          dstEntityKeyId: contactInformationEKID,
          dstEntitySetId: contactInformationESID
        }
      );
    }

    /*
     * Assemble Entities
     */
    const entities = {
      [manualRemindersESID]: [manualReminderSubmitEntity]
    };
    /*
     * Submit data and collect response
     */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;

    const entityKeyIds = fromJS(response.data.entityKeyIds);

    const manualReminderEKID = entityKeyIds.getIn([manualRemindersESID, 0], '');
    /*
     * Collect Hearing and Neighbors
     */

    const manualReminderIdObject = createIdObject(manualReminderEKID, manualRemindersESID);
    const manualReminderResponse = yield call(
      getEntityDataWorker,
      getEntityData(manualReminderIdObject)
    );
    if (manualReminderResponse.error) throw manualReminderResponse.error;
    const manualReminder = fromJS(manualReminderResponse.data);

    /*
    * Get Neighbors
    */
    let manualReminderNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: manualRemindersESID,
        filter: {
          entityKeyIds: [manualReminderEKID],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [contactInformationESID, hearingsESID, peopleESID, staffESID]
        }
      })
    );
    if (manualReminderNeighborsById.error) throw manualReminderNeighborsById.error;
    manualReminderNeighborsById = fromJS(manualReminderNeighborsById.data);
    const manualReminderNeighborsList = manualReminderNeighborsById.get(manualReminderEKID, List());

    let peopleReceivingManualReminders = Set();
    const manualReminderNeighbors = Map().withMutations((map) => {
      manualReminderNeighborsList.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
        if (appTypeFqn === PEOPLE) {
          peopleReceivingManualReminders = peopleReceivingManualReminders.add(entityKeyId);
        }
        map.set(
          appTypeFqn,
          fromJS(neighbor)
        );
      });
    });

    yield put(submitManualReminder.success(action.id, {
      manualReminder,
      manualReminderEKID,
      manualReminderNeighbors,
      personEKID
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(submitManualReminder.failure(action.id, error));
  }
  finally {
    yield put(submitManualReminder.finally(action.id));
  }
}

function* submitManualReminderWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_MANUAL_REMINDER, submitManualReminderWorker);
}


export {
  loadManualRemindersFormWatcher,
  loadManualRemindersForDateWatcher,
  loadManualRemindersNeighborsByIdWatcher,
  submitManualReminderWatcher
};
