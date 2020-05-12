/*
 * @flow
 */

import { DateTime } from 'luxon';
import randomUUID from 'uuid/v4';
import { Types } from 'lattice';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { formatTime } from '../../utils/FormattingUtils';
import { getUTCDateRangeSearchString } from '../../utils/consts/DateTimeConsts';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HEARING_TYPES, PSA_STATUSES, MAX_HITS } from '../../utils/consts/Consts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import {
  createIdObject,
  getEntityKeyId,
  getEntityProperties,
  isUUID
} from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import { filterPeopleIdsWithOpenPSAs } from '../court/CourtActionFactory';
import { getPeopleNeighbors } from '../people/PeopleActions';
import {
  LOAD_HEARINGS_FOR_DATE,
  LOAD_HEARING_NEIGHBORS,
  LOAD_JUDGES,
  REFRESH_HEARING_AND_NEIGHBORS,
  SUBMIT_EXISTING_HEARING,
  SUBMIT_HEARING,
  UPDATE_BULK_HEARINGS,
  UPDATE_HEARING,
  loadHearingsForDate,
  loadHearingNeighbors,
  loadJudges,
  refreshHearingAndNeighbors,
  submitExistingHearing,
  submitHearing,
  updateBulkHearings,
  updateHearing
} from './HearingsActions';

const LOG :Logger = new Logger('HearingsSagas');

const { DeleteTypes, UpdateTypes } = Types;

const {
  createAssociations,
  createEntityAndAssociationData,
  deleteEntity,
  deleteEntityData,
  getEntityData,
  updateEntityData
} = DataApiActions;
const {
  createAssociationsWorker,
  createEntityAndAssociationDataWorker,
  deleteEntityWorker,
  deleteEntityDataWorker,
  getEntityDataWorker,
  updateEntityDataWorker
} = DataApiSagas;
const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { PREFERRED_COUNTY } = SETTINGS;

const {
  APPEARS_IN,
  APPEARS_IN_STATE,
  ASSESSED_BY,
  BONDS,
  CHECKIN_APPOINTMENTS,
  CHARGES,
  CONTACT_INFORMATION,
  COUNTIES,
  HEARINGS,
  JUDGES,
  MANUAL_REMINDERS,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  REMINDERS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES;

const {
  CASE_ID,
  COMPLETED_DATE_TIME,
  DATE_TIME,
  ENTITY_KEY_ID,
  COURTROOM,
  HEARING_TYPE,
  HEARING_COMMENTS,
  STRING_ID
} = PROPERTY_TYPES;


/*
 * Selectors
 */
const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');
const getHearingsByEKID = (state) => state.getIn([STATE.HEARINGS, HEARINGS_DATA.HEARINGS_BY_ID], '');

const LIST_ENTITY_SETS = List.of(
  CHARGES,
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  HEARINGS,
  PRETRIAL_CASES,
  RELEASE_CONDITIONS,
  REMINDERS,
  STAFF
);

function* getHearingAndNeighbors(hearingEntityKeyId :string) :Generator<*, *, *> {
  let hearing = Map();
  let hearingNeighborsByAppTypeFqn = Map();

  if (hearingEntityKeyId) {
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
    * Get Entity Set Ids
    */
    const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
    const checkInAppointmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const judgesEntitySetId = getEntitySetIdFromApp(app, JUDGES);
    const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
    const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const pretrialCasesESID = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);

    /*
    * Get Hearing Info
    */
    const hearingIdObject = createIdObject(hearingEntityKeyId, hearingsEntitySetId);
    const hearingResponse = yield call(
      getEntityDataWorker,
      getEntityData(hearingIdObject)
    );
    if (hearingResponse.error) throw hearingResponse.error;
    hearing = fromJS(hearingResponse.data);

    /*
    * Get Neighbors
    */
    let hearingNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: hearingsEntitySetId,
        filter: {
          entityKeyIds: [hearingEntityKeyId],
          sourceEntitySetIds: [
            bondsEntitySetId,
            checkInAppointmentsEntitySetId,
            manualRemindersEntitySetId,
            outcomesEntitySetId,
            peopleEntitySetId,
            psaEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [judgesEntitySetId, pretrialCasesESID]
        }
      })
    );
    if (hearingNeighborsById.error) throw hearingNeighborsById.error;
    hearingNeighborsById = fromJS(hearingNeighborsById.data);
    const hearingNeighbors = hearingNeighborsById.get(hearingEntityKeyId, List());
    /*
    * Format Neighbors
    */

    hearingNeighbors.forEach((neighbor) => {

      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn) {

        if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
          hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn.set(
            appTypeFqn,
            hearingNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
          );
        }
        else {
          hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn.set(appTypeFqn, neighbor);
        }
      }
    });

  }

  return { hearing, hearingNeighborsByAppTypeFqn };
}


function* loadHearingsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadHearingsForDate.request(action.id));

    let courtrooms = Set();
    let hearingIds = Set();
    let hearingsByTime = Map();
    let hearingsById = Map();
    let hearingIdsByCourtroom = Map();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const hearingsESID :UUID = getEntitySetIdFromApp(app, HEARINGS);
    const datePropertyTypeId :UUID = getPropertyTypeId(edm, DATE_TIME);

    const { courtDate, manageHearingsDate } = action.value;

    const hearingDT = courtDate || manageHearingsDate;

    const searchTerm :string = getUTCDateRangeSearchString(datePropertyTypeId, hearingDT);

    const hearingOptions = {
      searchTerm,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    const allHearingData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: hearingsESID, searchOptions: hearingOptions })
    );
    if (allHearingData.error) throw allHearingData.error;
    const hearingsOnDate = fromJS(allHearingData.data.hits);

    if (hearingsOnDate.size) {
      hearingsOnDate.filter((hearing) => {
        const {
          [COURTROOM]: hearingCourtroom,
          [DATE_TIME]: hearingDateTime,
          [HEARING_TYPE]: hearingType,
          [ENTITY_KEY_ID]: hearingEKID
        } :Object = getEntityProperties(hearing, [COURTROOM, DATE_TIME, HEARING_TYPE, ENTITY_KEY_ID]);
        const hearingDateTimeDT = DateTime.fromISO(hearingDateTime);
        const formattedHearingTime = formatTime(hearingDateTime);
        const hearingExists = !!hearingDateTime;
        const hearingOnDateSelected = hearingDateTimeDT.hasSame(hearingDT, 'day');
        const hearingIsInactive = hearingIsCancelled(hearing);
        if (hearingType
          && hearingExists
          && hearingOnDateSelected
          && !hearingIsInactive
        ) hearingIds = hearingIds.add(hearingEKID);
        if (!hearingDateTimeDT.isValid || hearingIsInactive) return false;
        hearingsById = hearingsById.set(hearingEKID, hearing);
        hearingIdsByCourtroom = hearingIdsByCourtroom.set(
          hearingCourtroom,
          hearingIdsByCourtroom.get(hearingCourtroom, Set()).add(hearingEKID)
        );
        hearingsByTime = hearingsByTime.set(
          formattedHearingTime,
          hearingsByTime.get(formattedHearingTime, List()).push(hearing)
        );
        if (hearingCourtroom) courtrooms = courtrooms.add(hearingCourtroom);
        return true;
      });
    }

    hearingIds = hearingIds.toJS();
    const hearingNeighbors = loadHearingNeighbors({ hearingIds, courtDate, manageHearingsDate });

    yield put(loadHearingsForDate.success(action.id, {
      hearingsById,
      hearingDateTime: hearingDT,
      hearingsOnDate,
      hearingsByTime,
      hearingIdsByCourtroom,
      courtrooms
    }));
    yield put(hearingNeighbors);
  }
  catch (error) {
    LOG.error(error);
    yield put(loadHearingsForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadHearingsForDate.finally(action.id));
  }
}

function* loadHearingsForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARINGS_FOR_DATE, loadHearingsForDateWorker);
}


function* loadHearingNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadHearingNeighbors.request(action.id));

    const { hearingIds, courtDate, manageHearingsDate } = action.value;

    const hearingDateTime = courtDate || manageHearingsDate;

    let hearingNeighborsById = Map();
    let hearingIdsByCounty = Map();
    let courtroomsByCounty = Map();
    let personIdsToHearingIds = Map();
    let personIds = Set();
    let scoresAsMap = Map();

    if (hearingIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const hearingsByEKID = yield select(getHearingsByEKID);
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

      /*
       * Get Entity Set Ids
       */
      const bondsESID = getEntitySetIdFromApp(app, BONDS);
      const checkInAppointmentsESID = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
      const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
      const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
      const judgesESID = getEntitySetIdFromApp(app, JUDGES);
      const manualRemindersESID = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
      const outcomesESID = getEntitySetIdFromApp(app, OUTCOMES);
      const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
      const releaseConditionsESID = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
      const psaESID = getEntitySetIdFromApp(app, PSA_SCORES);
      const pretrialCases = getEntitySetIdFromApp(app, PRETRIAL_CASES);

      let neighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: hearingsESID,
          filter: {
            entityKeyIds: hearingIds,
            sourceEntitySetIds: [
              bondsESID,
              checkInAppointmentsESID,
              manualRemindersESID,
              outcomesESID,
              peopleESID,
              psaESID,
              releaseConditionsESID
            ],
            destinationEntitySetIds: [countiesESID, judgesESID, pretrialCases]
          }
        })
      );
      if (neighborsById.error) throw neighborsById.error;
      neighborsById = fromJS(neighborsById.data);

      neighborsById.entrySeq().forEach(([hearingId, neighbors]) => {
        if (neighbors) {
          let hasPerson = false;
          let hasPSA = false;
          let personId;
          let hearingNeighborsMap = Map();
          neighbors.forEach(((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, JUDGES);
            const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(neighbor, [ENTITY_KEY_ID]);
            if (appTypeFqn === PEOPLE) {
              hasPerson = true;
              personId = entityKeyId;
              personIds = personIds.add(personId);
            }
            if (appTypeFqn === PSA_SCORES
                && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
              hasPSA = true;
              scoresAsMap = scoresAsMap.set(
                entityKeyId,
                fromJS(neighbor.get(PSA_NEIGHBOR.DETAILS))
              );
            }
            if (appTypeFqn === COUNTIES) {
              const hearing = hearingsByEKID.get(hearingId, Map());
              hearingIdsByCounty = hearingIdsByCounty.set(
                entityKeyId,
                hearingIdsByCounty.get(entityKeyId, Set()).add(hearingId)
              );
              if (hearing.size) {
                const { [COURTROOM]: hearingCourtRoom } = getEntityProperties(hearing, [COURTROOM]);
                courtroomsByCounty = courtroomsByCounty.set(
                  entityKeyId,
                  courtroomsByCounty.get(entityKeyId, Set()).add(hearingCourtRoom)
                );
              }
            }
            if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
              hearingNeighborsMap = hearingNeighborsMap.set(
                appTypeFqn,
                hearingNeighborsMap.get(appTypeFqn, List()).push(neighbor)
              );
            }
            else {
              hearingNeighborsMap = hearingNeighborsMap.set(appTypeFqn, neighbor);
            }
          }));
          if (hasPerson && !hasPSA) {
            personIdsToHearingIds = personIdsToHearingIds.set(
              personId,
              hearingId
            );
          }
          hearingNeighborsById = hearingNeighborsById.set(hearingId, hearingNeighborsMap);
        }
      });
      if (manageHearingsDate && manageHearingsDate.isValid) {
        const destinationEntitySetIds = [HEARINGS, SUBSCRIPTION, CONTACT_INFORMATION];
        const sourceEntitySetIds = [PSA_SCORES, CONTACT_INFORMATION];
        const loadPeopleNeighbors = getPeopleNeighbors({
          destinationEntitySetIds,
          peopleEKIDS: personIds.toJS(),
          sourceEntitySetIds
        });
        yield put(loadPeopleNeighbors);
      }
      if (courtDate && courtDate.isValid) {
        const peopleIdsWithOpenPSAs = filterPeopleIdsWithOpenPSAs({
          personIds,
          hearingDateTime,
          scoresAsMap,
          personIdsToHearingIds,
          hearingNeighborsById
        });
        yield put(peopleIdsWithOpenPSAs);
      }
    }
    yield put(loadHearingNeighbors.success(action.id, {
      courtroomsByCounty,
      hearingIdsByCounty,
      hearingNeighborsById,
      hearingDateTime
    }));
  }
  catch (error) {
    LOG.error(error);
    yield put(loadHearingNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadHearingNeighbors.finally(action.id));
  }
}

function* loadHearingNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARING_NEIGHBORS, loadHearingNeighborsWorker);
}


function* loadJudgesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadJudges.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    let judgesById = Map();
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: MAX_HITS
    };
    /* get all judge data */
    const allJudgeData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: judgesESID, searchOptions: options })
    );
    if (allJudgeData.error) throw allJudgeData.error;
    const allJudges = fromJS(allJudgeData.data.hits);
    const allJudgeIds = allJudges.map((judge) => {
      const judgeEKID = getEntityKeyId(judge);
      judgesById = judgesById.set(judgeEKID, judge);
      return getEntityKeyId(judge);
    });

    /* get county neighbors */
    const judgeNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: judgesESID,
        filter: {
          entityKeyIds: allJudgeIds.toJS(),
          sourceEntitySetIds: [],
          destinationEntitySetIds: [countiesESID]
        }
      })
    );
    if (judgeNeighborsById.error) throw judgeNeighborsById.error;
    /* store judge ids by county id */
    const judgesByCounty = Map().withMutations((map) => {
      fromJS(judgeNeighborsById.data).entrySeq().forEach(([id, neighbors]) => {
        neighbors.forEach((neighbor) => {
          const neighborEKID = getEntityKeyId(neighbor);
          const neighborESID = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const appTypeFqn = entitySetIdsToAppType.get(neighborESID, '');
          if (appTypeFqn === COUNTIES) {
            map.set(
              neighborEKID,
              map.get(neighborEKID, Set()).add(id)
            );
          }
        });
      });
    });

    yield put(loadJudges.success(action.id, {
      allJudges,
      judgesByCounty,
      judgesById
    }));
  }
  catch (error) {
    LOG.error(error);
    yield put(loadJudges.failure(action.id, error));
  }
  finally {
    yield put(loadJudges.finally(action.id));
  }
}

function* loadJudgesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_JUDGES, loadJudgesWorker);
}


function* refreshHearingAndNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { hearingEntityKeyId } = action.value; // Deconstruct action argument
  try {
    yield put(refreshHearingAndNeighbors.request(action.id));

    /*
     * Get Hearing and Hearing Neighbors
     */

    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEntityKeyId);

    yield put(refreshHearingAndNeighbors.success(action.id, {
      hearingEntityKeyId,
      hearing,
      hearingNeighborsByAppTypeFqn
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(refreshHearingAndNeighbors.failure(action.id, error));
  }
  finally {
    yield put(refreshHearingAndNeighbors.finally(action.id));
  }
}

function* refreshHearingAndNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_HEARING_AND_NEIGHBORS, refreshHearingAndNeighborsWorker);
}

function* submitExistingHearingWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    caseId,
    hearingEKID,
    personEKID,
    psaEKID
  } = action.value;
  try {
    yield put(submitExistingHearing.request(action.id));
    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const stringIdPTID = getPropertyTypeId(edm, STRING_ID);

    /*
     * Get Entity Set Ids
     */
    const appearsInESID = getEntitySetIdFromApp(app, APPEARS_IN);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    /*
     * Assemble Assoociations
     */
    const associations = {
      [appearsInESID]: [
        {
          data: { [stringIdPTID]: [caseId] },
          dst: {
            entityKeyId: hearingEKID,
            entitySetId: hearingsESID
          },
          src: {
            entityKeyId: psaEKID,
            entitySetId: psaScoresESID
          }
        }
      ]
    };

    /*
     * Submit Associations
     */
    const response = yield call(
      createAssociationsWorker,
      createAssociations(associations)
    );

    if (response.error) throw response.error;

    /*
     * Get Hearing and Hearing Neighbors
     */

    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEKID);

    yield put(submitExistingHearing.success(action.id, {
      personEKID,
      psaEKID,
      hearingEntityKeyId: hearingEKID,
      hearing,
      hearingNeighborsByAppTypeFqn
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(submitExistingHearing.failure(action.id, error));
  }
  finally {
    yield put(submitExistingHearing.finally(action.id));
  }
}

function* submitExistingHearingWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_EXISTING_HEARING, submitExistingHearingWorker);
}

function* submitHearingWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitHearing.request(action.id));
    const {
      hearingDateTime,
      hearingCourtroom,
      hearingComments,
      judgeEKID,
      personEKID,
      psaEKID
    } = action.value;

    const hearingId = randomUUID();

    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const caseIdPTID = getPropertyTypeId(edm, CASE_ID);
    const completedDatetimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const dateTimePTID = getPropertyTypeId(edm, DATE_TIME);
    const courtroomPTID = getPropertyTypeId(edm, COURTROOM);
    const hearingTypePTID = getPropertyTypeId(edm, HEARING_TYPE);
    const hearingCommentsPTID = getPropertyTypeId(edm, HEARING_COMMENTS);
    const stringIdPTID = getPropertyTypeId(edm, STRING_ID);

    /*
     * Get Preferred County from app settings
     */
    const preferredCountyEntityKeyId = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');
    /*
     * Get Entity Set Ids
     */
    const appearsInESID = getEntitySetIdFromApp(app, APPEARS_IN);
    const appearsInStateESID = getEntitySetIdFromApp(app, APPEARS_IN_STATE);
    const assessedByESID = getEntitySetIdFromApp(app, ASSESSED_BY);
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);

    /*
     * Assemble Assoociations
     */
    const associations = {
      [appearsInStateESID]: [{
        data: {},
        srcEntityIndex: 0,
        srcEntitySetId: hearingsESID,
        dstEntityKeyId: preferredCountyEntityKeyId,
        dstEntitySetId: countiesESID
      }],
      [appearsInESID]: [
        {
          data: { [stringIdPTID]: [hearingId] },
          dstEntityIndex: 0,
          dstEntitySetId: hearingsESID,
          srcEntityKeyId: psaEKID,
          srcEntitySetId: psaScoresESID
        },
        {
          data: { [stringIdPTID]: [hearingId] },
          dstEntityIndex: 0,
          dstEntitySetId: hearingsESID,
          srcEntityKeyId: personEKID,
          srcEntitySetId: peopleESID
        }
      ]
    };

    if (isUUID(judgeEKID)) {
      associations[assessedByESID] = [];
      associations[assessedByESID] = associations[assessedByESID].concat(
        {
          data: { [completedDatetimePTID]: [DateTime.local().toISO()] },
          srcEntityIndex: 0,
          srcEntitySetId: hearingsESID,
          dstEntityKeyId: judgeEKID,
          dstEntitySetId: judgesESID
        }
      );
    }

    /*
     * Assemble Entities
     */
    const entities = {
      [hearingsESID]: [{
        [caseIdPTID]: [hearingId],
        [dateTimePTID]: [hearingDateTime],
        [courtroomPTID]: [hearingCourtroom],
        [hearingTypePTID]: [HEARING_TYPES.INITIAL_APPEARANCE],
        [hearingCommentsPTID]: [hearingComments]
      }]
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

    const hearingEntityKeyId = entityKeyIds.getIn([hearingsESID, 0], '');
    /*
     * Collect Hearing and Neighbors
     */
    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEntityKeyId);

    yield put(submitHearing.success(action.id, {
      hearing,
      hearingNeighborsByAppTypeFqn,
      psaEKID,
      personEKID
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(submitHearing.failure(action.id, error));
  }
  finally {
    yield put(submitHearing.finally(action.id));
  }
}

function* submitHearingWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_HEARING, submitHearingWorker);
}

function* updateBulkHearingsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateBulkHearings.request(action.id));
    const {
      associationEKIDs,
      hearingEKIDs,
      judgeEKID,
      newHearingData
    } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const shouldDeleteAssociations :boolean = newHearingData[HEARING_COMMENTS] || judgeEKID;

    /* Get Property Type Ids   */
    const completedDatetimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const updatedHearingObject = getPropertyIdToValueMap(newHearingData, edm);


    /* Get Entity Set Ids */
    const assessedByESID = getEntitySetIdFromApp(app, ASSESSED_BY);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);

    /* Delete old association to Judge */
    if (shouldDeleteAssociations) {
      const deleteResponse = yield call(
        deleteEntityDataWorker,
        deleteEntityData({
          entitySetId: assessedByESID,
          entityKeyIds: associationEKIDs.toJS(),
          deleteType: DeleteTypes.Soft
        })
      );
      if (deleteResponse.error) throw deleteResponse.error;
    }

    /* Assemble and Submit New Judge Association */
    if (judgeEKID) {
      const data = { [completedDatetimePTID]: [DateTime.local().toISO()] };
      const dst = createIdObject(judgeEKID, judgesESID);
      const newJudgeAssociations = [];
      hearingEKIDs.forEach((hearingEKID) => {
        const src = createIdObject(hearingEKID, hearingsESID);
        newJudgeAssociations.push({ data, src, dst });
      });
      const associations = { [assessedByESID]: newJudgeAssociations };
      const associationsResponse = yield call(
        createAssociationsWorker,
        createAssociations(associations)
      );
      if (associationsResponse.error) throw associationsResponse.error;
    }

    if (Object.values(newHearingData).length) {
      /* Map Hearing Updates */
      const entities = {};
      hearingEKIDs.forEach((ekid) => {
        entities[ekid] = updatedHearingObject;
      });

      /* Update Hearing Data */
      const updateResponse = yield call(
        updateEntityDataWorker,
        updateEntityData({
          entitySetId: hearingsESID,
          entities,
          updateType: UpdateTypes.PartialReplace
        })
      );
      if (updateResponse.error) throw updateResponse.error;
    }

    yield put(updateBulkHearings.success(action.id, {
      hearingEKIDs,
      newHearingData
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(updateBulkHearings.failure(action.id, error));
  }
  finally {
    yield put(updateBulkHearings.finally(action.id));
  }
}

function* updateBulkHearingsWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_BULK_HEARINGS, updateBulkHearingsWorker);
}

function* updateHearingWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateHearing.request(action.id));
    const {
      newHearing,
      oldHearing,
      judgeEKID,
      oldJudgeAssociationEKID,
      personEKID
    } = action.value;

    const {
      [DATE_TIME]: oldHearingDateTime,
      [ENTITY_KEY_ID]: hearingEKID
    } = getEntityProperties(oldHearing, [DATE_TIME, ENTITY_KEY_ID]);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
    * Get Property Type Ids
    */
    const completedDatetimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const updatedHearingObject = getPropertyIdToValueMap(newHearing, edm);

    /*
     * Get Entity Set Ids
     */
    const assessedByESID = getEntitySetIdFromApp(app, ASSESSED_BY);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);

    /*
     * Delete old association to Judge
     */
    if (oldJudgeAssociationEKID) {
      const deleteResponse = yield call(
        deleteEntityWorker,
        deleteEntity({
          entityKeyId: oldJudgeAssociationEKID,
          entitySetId: assessedByESID,
          deleteType: DeleteTypes.Soft
        })
      );
      if (deleteResponse.error) throw deleteResponse.error;
    }

    /*
     * Assemble and Submit New Judge Association
     */
    if (judgeEKID) {
      const data = { [completedDatetimePTID]: [DateTime.local().toISO()] };
      const src = createIdObject(hearingEKID, hearingsESID);
      const dst = createIdObject(judgeEKID, judgesESID);
      const associations = { [assessedByESID]: [{ data, src, dst }] };

      const associationsResponse = yield call(
        createAssociationsWorker,
        createAssociations(associations)
      );
      if (associationsResponse.error) throw associationsResponse.error;
    }

    /*
     * Update Hearing Data
     */

    const updateResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: hearingsESID,
        entities: { [hearingEKID]: updatedHearingObject },
        updateType: UpdateTypes.PartialReplace
      })
    );
    if (updateResponse.error) throw updateResponse.error;

    /*
     * Get updated hearing
     */
    const hearingIdObject = createIdObject(hearingEKID, hearingsESID);
    const hearingResponse = yield call(
      getEntityDataWorker,
      getEntityData(hearingIdObject)
    );
    if (hearingResponse.error) throw hearingResponse.error;
    const hearing = fromJS(hearingResponse.data);

    /*
     * Get hearing judge neighbors
     */
    let hearingNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: hearingsESID,
        filter: {
          entityKeyIds: [hearingEKID],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [judgesESID]
        }
      })
    );
    if (hearingNeighborsById.error) throw hearingNeighborsById.error;
    hearingNeighborsById = fromJS(hearingNeighborsById.data);
    const hearingNeighbors = hearingNeighborsById.get(hearingEKID, List());

    let hearingJudge = Map();
    if (hearingNeighbors) {
      hearingNeighbors.forEach(((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, JUDGES);
        if (appTypeFqn === JUDGES) {
          hearingJudge = neighbor;
        }
      }));
    }

    yield put(updateHearing.success(action.id, {
      hearingEKID,
      hearing,
      hearingJudge,
      oldHearingDateTime,
      personEKID
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(updateHearing.failure(action.id, error));
  }
  finally {
    yield put(updateHearing.finally(action.id));
  }
}

function* updateHearingWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_HEARING, updateHearingWorker);
}

export {
  loadHearingsForDateWatcher,
  loadHearingNeighborsWatcher,
  loadJudgesWatcher,
  refreshHearingAndNeighborsWatcher,
  submitExistingHearingWatcher,
  submitHearingWatcher,
  updateBulkHearingsWatcher,
  updateHearingWatcher
};
