/*
 * @flow
 */

import { DateTime } from 'luxon';
import { Constants, DataApi, SearchApi } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  Map,
  List,
  Set,
  fromJS
} from 'immutable';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties, getSearchTerm } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { getCasesForPSA, getChargeHistory, getCaseHistory } from '../../utils/CaseUtils';
import {
  GET_PEOPLE,
  GET_PERSON_DATA,
  GET_PERSON_NEIGHBORS,
  GET_STAFF_EKIDS,
  LOAD_REQUIRES_ACTION_PEOPLE,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  getStaffEKIDs,
  loadRequiresActionPeople
} from './PeopleActions';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  CHARGES,
  CHECKINS,
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  DMF_RISK_FACTORS,
  FTAS,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_REMINDERS,
  PEOPLE,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  PRETRIAL_CASES,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  SENTENCES,
  STAFF,
  SUBSCRIPTION,
  SPEAKER_RECOGNITION_PROFILES
} = APP_TYPES;

const {
  DATE_TIME,
  ENTITY_KEY_ID,
  HEARING_TYPE,
  PERSON_ID
} = PROPERTY_TYPES;

const LIST_FQNS = [CHECKINS, CHECKIN_APPOINTMENTS, CONTACT_INFORMATION, HEARINGS, PRETRIAL_CASES, STAFF, CHARGES];

const { OPENLATTICE_ID_FQN } = Constants;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

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

function* getPeopleWorker(action) :Generator<*, *, *> {

  try {
    yield put(getPeople.request(action.id));
    const app = yield select(getApp);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const response = yield call(DataApi.getEntitySetData, peopleEntitySetId);
    yield put(getPeople.success(action.id, response));
  }
  catch (error) {
    yield put(getPeople.failure(action.id, error));
  }
  finally {
    yield put(getPeople.finally(action.id));
  }
}

function* getPeopleWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PEOPLE, getPeopleWorker);
}

function* getEntityForPersonId(personId :string) :Generator<*, *, *> {
  const app = yield select(getApp);
  const edm = yield select(getEDM);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
  const personIdPropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.PERSON_ID);

  const searchOptions = {
    searchTerm: getSearchTerm(personIdPropertyTypeId, personId),
    start: 0,
    maxHits: 1
  };

  const response = yield call(SearchApi.searchEntitySetData, peopleEntitySetId, searchOptions);
  const person = response.hits[0];
  return person;
}

function* getPersonDataWorker(action) :Generator<*, *, *> {

  try {
    yield put(getPersonData.request(action.id));
    const person = yield getEntityForPersonId(action.value);
    yield put(getPersonData.success(action.id, { person, entityKeyId: person[OPENLATTICE_ID_FQN][0] }));
  }
  catch (error) {
    yield put(getPersonData.failure(action.id, error));
  }
  finally {
    yield put(getPersonData.finally(action.id));
  }
}

function* getPersonDataWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PERSON_DATA, getPersonDataWorker);
}

function* getPersonNeighborsWorker(action) :Generator<*, *, *> {

  const { personId } = action.value;

  try {
    yield put(getPersonNeighbors.request(action.id));
    let caseNums = Set();
    let neighborsByEntitySet = Map();
    let mostRecentPSA = Map();
    let currentPSADateTime;

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Entity Set Ids
     */
    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.ARREST_CASES);
    const bondsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.BONDS);
    const chargesEntitySetId = getEntitySetIdFromApp(app, CHARGES);
    const checkInAppointmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const dmfResultsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const ftaEntitySetId = getEntitySetIdFromApp(app, FTAS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const manualChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_CHARGES);
    const manualCourtChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_COURT_CHARGES);
    const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
    const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const outcomesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.OUTCOMES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const sentencesEntitySetId = getEntitySetIdFromApp(app, SENTENCES);
    const speakerRecognitionProfilesEntitySetId = getEntitySetIdFromApp(app, SPEAKER_RECOGNITION_PROFILES);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);

    const person = yield getEntityForPersonId(personId);
    const personEntityKeyId = person[OPENLATTICE_ID_FQN][0];
    /*
     * Get Neighbors
     */
    let peopleNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: [personEntityKeyId],
          sourceEntitySetIds: [
            bondsEntitySetId,
            checkInAppointmentsEntitySetId,
            contactInformationEntitySetId,
            dmfResultsEntitySetId,
            dmfRiskFactorsEntitySetId,
            ftaEntitySetId,
            manualRemindersEntitySetId,
            outcomesEntitySetId,
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            psaScoresEntitySetId,
            releaseConditionsEntitySetId,
            releaseRecommendationsEntitySetId,
            speakerRecognitionProfilesEntitySetId
          ],
          destinationEntitySetIds: [
            arrestCasesEntitySetId,
            chargesEntitySetId,
            hearingsEntitySetId,
            manualChargesEntitySetId,
            manualCourtChargesEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            pretrialCasesEntitySetId,
            manualPretrialCasesEntitySetId,
            sentencesEntitySetId,
            subscriptionEntitySetId
          ]
        }
      })
    );
    if (peopleNeighborsById.error) throw peopleNeighborsById.error;
    peopleNeighborsById = fromJS(peopleNeighborsById.data);
    const neighbors = peopleNeighborsById.get(personEntityKeyId, List());

    let hearingEntityKeyId = Set();

    neighbors.forEach((neighborObj) => {
      const entitySetId = neighborObj.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      const neighborEntityKeyId = neighborObj.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
      const entityDateTime = DateTime.fromISO(
        neighborObj.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], '')
      );

      if (appTypeFqn === PSA_SCORES) {
        if (
          entityDateTime.isValid
          && (!mostRecentPSA.size || !currentPSADateTime || currentPSADateTime < entityDateTime)
        ) {
          mostRecentPSA = neighborObj;
          currentPSADateTime = entityDateTime;
        }
        neighborsByEntitySet = neighborsByEntitySet.set(
          appTypeFqn,
          neighborsByEntitySet.get(appTypeFqn, List()).push(neighborObj)
        );
      }
      else if (appTypeFqn === CONTACT_INFORMATION) {
        neighborsByEntitySet = neighborsByEntitySet.set(
          appTypeFqn,
          neighborsByEntitySet.get(appTypeFqn, List()).push(neighborObj)
        );
      }
      else if (appTypeFqn === SUBSCRIPTION) {
        neighborsByEntitySet = neighborsByEntitySet.set(
          appTypeFqn,
          neighborObj
        );
      }
      else if (appTypeFqn === SPEAKER_RECOGNITION_PROFILES) {
        neighborsByEntitySet = neighborsByEntitySet.set(
          appTypeFqn,
          neighborObj
        );
      }
      else if (appTypeFqn === HEARINGS) {
        const hearingDetails = neighborObj.get(PSA_NEIGHBOR.DETAILS, Map());
        const hearingId = hearingDetails.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingDateTime = hearingDetails.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const hearingExists = !!hearingDateTime && !!hearingId;
        const hearingIsInactive = hearingIsCancelled(hearingDetails);
        const hearingIsGeneric = hearingDetails.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '')
          .toLowerCase().trim() === 'all other hearings';
        const hearingIsADuplicate = hearingEntityKeyId.includes(neighborEntityKeyId);
        if (
          hearingExists
          && !hearingIsGeneric
          && !hearingIsInactive
          && !hearingIsADuplicate
        ) {
          neighborsByEntitySet = neighborsByEntitySet.set(
            appTypeFqn,
            neighborsByEntitySet.get(appTypeFqn, List()).push(hearingDetails)
          );
        }
        hearingEntityKeyId = hearingEntityKeyId.add(neighborEntityKeyId);
      }
      else {
        neighborsByEntitySet = neighborsByEntitySet.set(
          appTypeFqn,
          neighborsByEntitySet.get(appTypeFqn, List()).push(neighborObj)
        );
      }
    });

    const uniqNeighborsByEntitySet = neighborsByEntitySet.set(PRETRIAL_CASES,
      neighborsByEntitySet.get(PRETRIAL_CASES, List())
        .filter((neighbor) => {
          const caseNum = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0]);
          if (!caseNums.has(caseNum)) {
            caseNums = caseNums.add(caseNum);
            return true;
          }
          return false;
        }), neighborsByEntitySet);

    let mostRecentPSANeighborsByAppTypeFqn = Map();
    if (mostRecentPSA.size) {
      const psaEntityKeyId = mostRecentPSA.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
      let psaNeighbors = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: psaScoresEntitySetId,
          filter: {
            entityKeyIds: [psaEntityKeyId],
            sourceEntitySetIds: [
              bondsEntitySetId,
              dmfResultsEntitySetId,
              outcomesEntitySetId,
              releaseRecommendationsEntitySetId,
              releaseConditionsEntitySetId
            ],
            destinationEntitySetIds: [
              arrestCasesEntitySetId,
              dmfRiskFactorsEntitySetId,
              hearingsEntitySetId,
              manualPretrialCourtCasesEntitySetId,
              manualPretrialCasesEntitySetId,
              peopleEntitySetId,
              psaRiskFactorsEntitySetId,
              pretrialCasesEntitySetId,
              staffEntitySetId
            ]
          }
        })
      );
      if (psaNeighbors.error) throw psaNeighbors.error;
      psaNeighbors = fromJS(psaNeighbors.data).get(psaEntityKeyId, List());

      psaNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === HEARINGS) {
          const hearingDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
          const {
            [DATE_TIME]: hearingDateTime,
            [HEARING_TYPE]: hearingType
          } = getEntityProperties(neighbor, [
            DATE_TIME,
            HEARING_TYPE
          ]);
          const hearingIsInactive = hearingIsCancelled(neighbor);
          const hearingIsGeneric = hearingType.toLowerCase().trim() === 'all other hearings';
          if (hearingDateTime && !hearingIsGeneric && !hearingIsInactive) {
            mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn.set(
              appTypeFqn,
              mostRecentPSANeighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(hearingDetails))
            );
          }
        }
        else if (LIST_FQNS.includes(appTypeFqn)) {
          mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn.set(
            appTypeFqn,
            mostRecentPSANeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
          );
        }
        else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
          mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn
            .set(MANUAL_PRETRIAL_CASES, fromJS(neighbor));
        }
        else {
          mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn.set(
            appTypeFqn,
            fromJS(neighbor)
          );
        }
      });
    }

    yield put(getPersonNeighbors.success(action.id, {
      personId,
      neighbors: uniqNeighborsByEntitySet,
      psaScoresEntitySetId,
      mostRecentPSA,
      mostRecentPSANeighborsByAppTypeFqn
    }));
  }
  catch (error) {
    console.error(error);
    yield put(getPersonNeighbors.failure(action.id, { error, personId }));
  }
  finally {
    yield put(getPersonNeighbors.finally(action.id));
  }
}

function* getPersonNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PERSON_NEIGHBORS, getPersonNeighborsWorker);
}


function* getStaffEKIDsWorker(action) :Generator<*, *, *> {

  try {
    yield put(getStaffEKIDs.request(action.id));
    let staffIdsToEKIDS = Map();

    const app = yield select(getApp);
    const staffESID = getEntitySetIdFromApp(app, STAFF);
    const staffEntities = yield call(
      getEntitySetDataWorker,
      getEntitySetData({ entitySetId: staffESID })
    );
    if (staffEntities.error) throw staffEntities.error;

    fromJS(staffEntities.data).forEach((staffMember) => {
      const {
        [ENTITY_KEY_ID]: staffEKID,
        [PERSON_ID]: staffId
      } = getEntityProperties(staffMember, [ENTITY_KEY_ID, PERSON_ID]);
      staffIdsToEKIDS = staffIdsToEKIDS.set(staffId, staffEKID);
    });


    yield put(getStaffEKIDs.success(action.id, staffIdsToEKIDS));
  }
  catch (error) {
    yield put(getStaffEKIDs.failure(action.id, error));
  }
  finally {
    yield put(getStaffEKIDs.finally(action.id));
  }
}

function* getStaffEKIDsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STAFF_EKIDS, getStaffEKIDsWorker);
}

function* loadRequiresActionPeopleWorker(action :SequenceAction) :Generator<*, *, *> {
  let psaScoreMap = Map();
  let psaScoresWithNoPendingCharges = Set();
  let psaScoresWithNoHearings = Set();
  let psaScoresWithRecentFTAs = Set();
  let psaNeighborsById = Map();
  let peopleIds = Set();
  let peopleMap = Map();
  let peopleWithMultipleOpenPSAs = Set();
  let peopleWithRecentFTAs = Set();
  let peopleWithNoPendingCharges = Set();
  let peopleWithPSAsWithNoHearings = Set();
  let peopleNeighborsById = Map();

  try {
    yield put(loadRequiresActionPeople.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const manualPretrialCasesFqnEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const chargesEntitySetId = getEntitySetIdFromApp(app, CHARGES);
    const ftaEntitySetId = getEntitySetIdFromApp(app, FTAS);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);

    /* load all open PSAs */
    const statusPropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.STATUS);
    const searchTerm = action.value === '*' ? action.value : getSearchTerm(statusPropertyTypeId, PSA_STATUSES.OPEN);
    const openPSAData = yield call(getAllSearchResults, psaScoresEntitySetId, searchTerm);
    fromJS(openPSAData.hits).forEach((psa) => {
      const psaId = psa.getIn([OPENLATTICE_ID_FQN, 0], '');
      if (psaId) psaScoreMap = psaScoreMap.set(psaId, psa);
    });
    /* all PSA Ids */
    const psaIds = psaScoreMap.keySeq().toJS();

    /* get people and cases for all open PSAs */
    let openPSAIdsToPeopleAndCases = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresEntitySetId,
        filter: {
          entityKeyIds: psaIds,
          sourceEntitySetIds: [releaseRecommendationsEntitySetId],
          destinationEntitySetIds: [
            hearingsESID,
            peopleEntitySetId,
            staffEntitySetId,
            manualPretrialCasesFqnEntitySetId
          ]
        }
      })
    );
    if (openPSAIdsToPeopleAndCases.error) throw openPSAIdsToPeopleAndCases.error;
    openPSAIdsToPeopleAndCases = fromJS(openPSAIdsToPeopleAndCases.data);

    /* all people Ids */
    openPSAIdsToPeopleAndCases.entrySeq().forEach(([psaId, neighbors]) => {
      let psaNeighbors = Map();
      neighbors.forEach((neighbor) => {
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        const neighborId = neighborObj.getIn([OPENLATTICE_ID_FQN, 0], '');
        if (appTypeFqn === PEOPLE) {
          peopleMap = peopleMap.set(neighborId, neighborObj);
          peopleIds = peopleIds.add(neighborId);
        }
        if (LIST_FQNS.includes(appTypeFqn)) {
          psaNeighbors = psaNeighbors.set(
            appTypeFqn,
            psaNeighbors.get(appTypeFqn, List()).push(neighbor)
          );
        }
        else {
          psaNeighbors = psaNeighbors.set(appTypeFqn, neighbor);
        }
      });
      if (!psaNeighbors.get(HEARINGS, List()).size) psaScoresWithNoHearings = psaScoresWithNoHearings.add(psaId);
      psaNeighborsById = psaNeighborsById.set(psaId, psaNeighbors);
    });

    /* get filtered neighbors for all people with open PSAs */
    let peopleWithOpenPSANeighbors = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: peopleIds.toJS(),
          sourceEntitySetIds: [psaScoresEntitySetId, ftaEntitySetId],
          destinationEntitySetIds: [chargesEntitySetId, pretrialCasesEntitySetId, ftaEntitySetId]
        }
      })
    );
    if (peopleWithOpenPSANeighbors.error) throw peopleWithOpenPSANeighbors.error;
    peopleWithOpenPSANeighbors = fromJS(peopleWithOpenPSANeighbors.data);

    /* map person neighbors by personId -> appTypeFqn -> neighbors */
    peopleWithOpenPSANeighbors.entrySeq().forEach(([personId, neighbors]) => {
      let personNeighbors = Map();
      neighbors.forEach((neighbor) => {
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === PSA_SCORES) {
          /* only open psas */
          const psaStatus = neighborObj.getIn([PROPERTY_TYPES.STATUS, 0], '');
          if (psaStatus === PSA_STATUSES.OPEN) {
            personNeighbors = personNeighbors.set(
              appTypeFqn,
              personNeighbors.get(appTypeFqn, List()).push(neighborObj)
            );
          }
        }
        else if (appTypeFqn === CHARGES) {
          personNeighbors = personNeighbors.set(
            appTypeFqn,
            personNeighbors.get(appTypeFqn, List()).push(neighborObj)
          );
        }
        else {
          personNeighbors = personNeighbors.set(
            appTypeFqn,
            personNeighbors.get(appTypeFqn, List()).push(neighborObj)
          );
        }
      });

      const personCaseHistory = getCaseHistory(personNeighbors);
      const personChargeHistory = getChargeHistory(personNeighbors);

      /* collect people Ids with multiple PSAs */
      const psaCount = personNeighbors.get(PSA_SCORES, List()).size;
      if (psaCount > 1) peopleWithMultipleOpenPSAs = peopleWithMultipleOpenPSAs.add(personId);

      /* collect people Ids with recent FTAs */

      /* collect people Ids with no pending charges */
      const personCharges = personNeighbors.get(CHARGES);
      if (personCharges) {
        personNeighbors.get(PSA_SCORES, List()).forEach((psa) => {
          const psaId = psa.getIn([OPENLATTICE_ID_FQN, 0], '');
          let hasPendingCharges = false;
          const psaDate = DateTime.fromISO(psa.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
          const hasFTASincePSA = personNeighbors.get(FTAS, List()).some((fta) => {
            const ftaDateTime = DateTime.fromISO(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
            if (psaDate.isValid) {
              return psaDate < ftaDateTime;
            }
            return false;
          });
          if (hasFTASincePSA) {
            peopleWithRecentFTAs = peopleWithRecentFTAs.add(personId);
            psaScoresWithRecentFTAs = psaScoresWithRecentFTAs.add(psaId);
          }
          if (psaScoresWithNoHearings.includes(psaId)) {
            peopleWithPSAsWithNoHearings = peopleWithPSAsWithNoHearings.add(personId);
          }
          const arrestDate = DateTime.fromISO(psaNeighborsById
            .getIn([psaId, MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0]));
          const { chargeHistoryForMostRecentPSA } = getCasesForPSA(
            personCaseHistory,
            personChargeHistory,
            psa,
            arrestDate,
            undefined
          );
          if (psaScoreMap.get(psaId)) {
            if (chargeHistoryForMostRecentPSA.size) {
              chargeHistoryForMostRecentPSA.entrySeq().forEach(([_, charges]) => {
                const pendingCharges = charges
                  .filter(charge => !charge.getIn([PROPERTY_TYPES.DISPOSITION_DATE, 0]));
                if (pendingCharges.size) hasPendingCharges = true;
              });
              if (!hasPendingCharges) {
                psaScoresWithNoPendingCharges = psaScoresWithNoPendingCharges.add(psaId);
                peopleWithNoPendingCharges = peopleWithNoPendingCharges.add(personId);
              }
            }
          }
        });
      }
      peopleNeighborsById = peopleNeighborsById.set(personId, personNeighbors);
    });

    yield put(loadRequiresActionPeople.success(action.id, {
      peopleNeighborsById,
      peopleWithMultipleOpenPSAs,
      peopleWithRecentFTAs,
      peopleWithNoPendingCharges,
      peopleWithPSAsWithNoHearings,
      peopleMap,
      psaScoreMap,
      psaNeighborsById,
      psaScoresWithNoPendingCharges,
      psaScoresWithNoHearings,
      psaScoresWithRecentFTAs
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadRequiresActionPeople.failure(action.id, { error }));
  }
  finally {
    yield put(loadRequiresActionPeople.finally(action.id));
  }
}

function* loadRequiresActionPeopleWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REQUIRES_ACTION_PEOPLE, loadRequiresActionPeopleWorker);
}

export {
  getPeopleWatcher,
  getPersonDataWatcher,
  getPersonNeighborsWatcher,
  getStaffEKIDsWatcher,
  loadRequiresActionPeopleWatcher
};
