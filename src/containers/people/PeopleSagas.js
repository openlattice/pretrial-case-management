/*
 * @flow
 */
import moment from 'moment';
import { Constants, DataApi, SearchApi } from 'lattice';
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

import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, PSA_NEIGHBOR, STATE } from '../../utils/consts/FrontEndStateConsts';
import { obfuscateEntity, obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { getCasesForPSA, getChargeHistory, getCaseHistory } from '../../utils/CaseUtils';
import {
  GET_PEOPLE,
  GET_PERSON_DATA,
  GET_PERSON_NEIGHBORS,
  LOAD_REQUIRES_ACTION_PEOPLE,
  REFRESH_PERSON_NEIGHBORS,
  UPDATE_CONTACT_INFORMATION,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  loadRequiresActionPeople,
  refreshPersonNeighbors,
  updateContactInfo
} from './PeopleActionFactory';

let {
  CHARGES,
  CONTACT_INFORMATION,
  FTAS,
  HEARINGS,
  MANUAL_PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  PSA_SCORES,
  PRETRIAL_CASES,
  RELEASE_RECOMMENDATIONS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES_FQNS;

CHARGES = CHARGES.toString();
CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
FTAS = FTAS.toString();
HEARINGS = HEARINGS.toString();
MANUAL_PRETRIAL_CASES = MANUAL_PRETRIAL_CASES.toString();
MANUAL_PRETRIAL_COURT_CASES = MANUAL_PRETRIAL_COURT_CASES.toString();
PEOPLE = PEOPLE.toString();
PSA_SCORES = PSA_SCORES.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();
RELEASE_RECOMMENDATIONS = RELEASE_RECOMMENDATIONS.toString();
STAFF = STAFF.toString();
SUBSCRIPTION = SUBSCRIPTION.toString();

const LIST_FQNS = [CONTACT_INFORMATION, HEARINGS, PRETRIAL_CASES, STAFF, CHARGES];

const { OPENLATTICE_ID_FQN } = Constants;

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
    searchTerm: `${personIdPropertyTypeId}:"${personId}"`,
    start: 0,
    maxHits: 1
  };

  const response = yield call(SearchApi.searchEntitySetData, peopleEntitySetId, searchOptions);
  const person = obfuscateEntity(response.hits[0]); // TODO just for demo
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
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);

    const person = yield getEntityForPersonId(personId);
    const entityKeyId = person[OPENLATTICE_ID_FQN][0];
    let neighbors = yield call(SearchApi.searchEntityNeighbors, peopleEntitySetId, entityKeyId);

    neighbors = obfuscateEntityNeighbors(neighbors);
    neighbors = fromJS(neighbors);

    let hearingEntityKeyId = Set();

    neighbors.forEach((neighborObj) => {
      const entitySetId = neighborObj.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      const neighborEntityKeyId = neighborObj.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
      const entityDateTime = moment(neighborObj.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));

      if (appTypeFqn === PSA_SCORES) {
        if (!mostRecentPSA.size || !currentPSADateTime || currentPSADateTime.isBefore(entityDateTime)) {
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
      else if (appTypeFqn === HEARINGS) {
        const hearingDetails = neighborObj.get(PSA_NEIGHBOR.DETAILS, Map());
        const hearingId = hearingDetails.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingDateTime = hearingDetails.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const hearingExists = !!hearingDateTime && !!hearingId;
        const hearingIsInactive = hearingDetails.getIn([PROPERTY_TYPES.HEARING_INACTIVE, 0], false);
        const hearingHasBeenCancelled = hearingDetails.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '')
          .toLowerCase().trim() === 'cancelled';
        const hearingIsGeneric = hearingDetails.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '')
          .toLowerCase().trim() === 'all other hearings';
        const hearingIsADuplicate = hearingEntityKeyId.includes(neighborEntityKeyId);
        if (
          hearingExists
          && !hearingHasBeenCancelled
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

    neighbors = obfuscateEntityNeighbors(neighbors);

    let mostRecentPSANeighborsByAppTypeFqn = Map();
    if (mostRecentPSA.size) {
      const psaId = mostRecentPSA.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
      let psaNeighbors = yield call(SearchApi.searchEntityNeighbors, psaScoresEntitySetId, psaId);
      psaNeighbors = fromJS(psaNeighbors);
      psaNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (LIST_FQNS.includes(appTypeFqn)) {
          mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn.set(
            appTypeFqn,
            mostRecentPSANeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
          );
        }
        else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
          mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn.set(MANUAL_PRETRIAL_CASES, fromJS(neighbor));
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

function* refreshPersonNeighborsWorker(action) :Generator<*, *, *> {

  const { personId } = action.value;

  try {
    yield put(refreshPersonNeighbors.request(action.id));
    let caseNums = Set();
    let currentPSADateTime;
    let mostRecentPSA = Map();
    let neighbors = Map();
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);

    const person = yield getEntityForPersonId(personId);
    const entityKeyId = person[OPENLATTICE_ID_FQN][0];
    let neighborsList = yield call(SearchApi.searchEntityNeighbors, peopleEntitySetId, entityKeyId);
    neighborsList = obfuscateEntityNeighbors(neighborsList);
    neighborsList = fromJS(neighborsList);

    neighborsList.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      const entityDateTime = moment(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));
      if (appTypeFqn === PSA_SCORES) {
        if (!mostRecentPSA || !currentPSADateTime || currentPSADateTime.isBefore(entityDateTime)) {
          mostRecentPSA = neighbor;
          currentPSADateTime = entityDateTime;
        }
        neighbors = neighbors.set(
          appTypeFqn,
          neighbors.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else if (appTypeFqn === CONTACT_INFORMATION) {
        neighbors = neighbors.set(
          appTypeFqn,
          neighbors.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else if (appTypeFqn === SUBSCRIPTION) {
        neighbors = neighbors.set(
          appTypeFqn,
          neighbor
        );
      }
      else if (appTypeFqn === HEARINGS) {
        const hearingDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const hearingId = hearingDetails.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingDateTime = hearingDetails.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const hearingExists = !!hearingDateTime && !!hearingId;
        const hearingIsInactive = hearingDetails.getIn([PROPERTY_TYPES.HEARING_INACTIVE, 0], false);
        const hearingHasBeenCancelled = hearingDetails.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '')
          .toLowerCase().trim() === 'cancelled';
        const hearingIsGeneric = hearingDetails.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '')
          .toLowerCase().trim() === 'all other hearings';
        if (hearingExists && !hearingHasBeenCancelled && !hearingIsGeneric && !hearingIsInactive) {
          neighbors = neighbors.set(
            appTypeFqn,
            neighbors.get(appTypeFqn, List()).push(hearingDetails)
          );
        }
      }
      else {
        neighbors = neighbors.set(
          appTypeFqn,
          neighbors.get(appTypeFqn, List()).push(neighbor)
        );
      }
    });
    neighbors = neighbors.set(PRETRIAL_CASES,
      neighbors.get(PRETRIAL_CASES, List())
        .filter((neighbor) => {
          const caseNum = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0]);
          if (!caseNums.has(caseNum)) {
            caseNums = caseNums.add(caseNum);
            return true;
          }
          return false;
        }), neighbors);

    let mostRecentPSANeighborsByAppTypeFqn = Map();
    if (mostRecentPSA.size) {
      const psaId = mostRecentPSA.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
      let psaNeighbors = yield call(SearchApi.searchEntityNeighbors, psaScoresEntitySetId, psaId);
      psaNeighbors = fromJS(psaNeighbors);
      psaNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === STAFF) {
          neighbors = neighbors.set(
            appTypeFqn,
            neighbors.get(appTypeFqn, List()).push(neighbor)
          );
        }
        else {
          mostRecentPSANeighborsByAppTypeFqn = mostRecentPSANeighborsByAppTypeFqn.set(
            appTypeFqn,
            fromJS(neighbor)
          );
        }
      });
    }

    yield put(refreshPersonNeighbors.success(action.id, {
      personId,
      entityKeyId,
      mostRecentPSA,
      mostRecentPSANeighborsByAppTypeFqn,
      neighbors,
      scoresEntitySetId: psaScoresEntitySetId
    }));
  }
  catch (error) {
    console.error(error);
    yield put(refreshPersonNeighbors.failure(action.id, { error, personId }));
  }
  finally {
    yield put(refreshPersonNeighbors.finally(action.id));
  }
}

function* refreshPersonNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_PERSON_NEIGHBORS, refreshPersonNeighborsWorker);
}

function* updateContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    entities,
    personId,
    personEntityKeyId,
    callback
  } = action.value;

  try {
    yield put(updateContactInfo.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);

    /* partially update contact info */
    yield call(DataApi.updateEntityData, contactInformationEntitySetId, entities, 'PartialReplace');

    /* get updated contact info for person */
    const filteredNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
      sourceEntitySetIds: [contactInformationEntitySetId],
      destinationEntitySetIds: [contactInformationEntitySetId]
    });

    /* filter neighbors for contact info */
    const contactInformation = fromJS(Object.values(filteredNeighbors)).get(0, List()).filter((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      const isContactInfo = appTypeFqn === CONTACT_INFORMATION;
      return isContactInfo;
    });

    if (callback) callback();

    yield put(updateContactInfo.success(action.id, { personId, contactInformation }));
  }
  catch (error) {
    yield put(updateContactInfo.failure(action.id, { error }));
  }
  finally {
    yield put(updateContactInfo.finally(action.id));
  }
}

function* updateContactInfoWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CONTACT_INFORMATION, updateContactInfoWorker);
}

function* loadRequiresActionPeopleWorker(action :SequenceAction) :Generator<*, *, *> {
  let psaScoreMap = Map();
  let psaScoresWithNoPendingCharges = Set();
  let psaScoresWithRecentFTAs = Set();
  let psaNeighborsById = Map();
  let peopleIds = Set();
  let peopleMap = Map();
  let peopleWithMultipleOpenPSAs = Set();
  let peopleWithRecentFTAs = Set();
  let peopleWithNoPendingCharges = Set();
  let peopleNeighborsById = Map();

  try {
    yield put(loadRequiresActionPeople.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
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
    const searchTerm = action.value === '*' ? action.value : `${statusPropertyTypeId}:"${PSA_STATUSES.OPEN}"`;
    const openPSAData = yield call(getAllSearchResults, psaScoresEntitySetId, searchTerm);
    fromJS(openPSAData.hits).forEach((psa) => {
      const psaId = psa.getIn([OPENLATTICE_ID_FQN, 0], '');
      if (psaId) psaScoreMap = psaScoreMap.set(psaId, psa);
    });
    /* all PSA Ids */
    const psaIds = psaScoreMap.keySeq().toJS();

    /* get people and cases for all open PSAs */
    let openPSAIdsToPeopleAndCases = yield call(SearchApi.searchEntityNeighborsWithFilter, psaScoresEntitySetId, {
      entityKeyIds: psaIds,
      sourceEntitySetIds: [psaScoresEntitySetId, releaseRecommendationsEntitySetId],
      destinationEntitySetIds: [
        peopleEntitySetId,
        psaScoresEntitySetId,
        staffEntitySetId,
        manualPretrialCasesFqnEntitySetId
      ]
    });

    /* all people Ids */
    openPSAIdsToPeopleAndCases = fromJS(openPSAIdsToPeopleAndCases);
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
      psaNeighborsById = psaNeighborsById.set(psaId, psaNeighbors);
    });

    /* get filtered neighbors for all people with open PSAs */
    let peopleWithOpenPSANeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: peopleIds.toJS(),
      sourceEntitySetIds: [psaScoresEntitySetId, ftaEntitySetId],
      destinationEntitySetIds: [chargesEntitySetId, pretrialCasesEntitySetId, ftaEntitySetId]
    });
    peopleWithOpenPSANeighbors = fromJS(peopleWithOpenPSANeighbors);

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
          const psaDate = moment(psa.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
          const hasFTASincePSA = personNeighbors.get(FTAS, List()).some((fta) => {
            const ftaDateTime = fta.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
            if (psaDate.isValid()) {
              return psaDate.isBefore(ftaDateTime);
            }
            return false;
          });
          if (hasFTASincePSA) {
            peopleWithRecentFTAs = peopleWithRecentFTAs.add(personId);
            psaScoresWithRecentFTAs = psaScoresWithRecentFTAs.add(psaId);
          }
          const arrestDate = moment(psaNeighborsById
            .getIn([psaId, MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0]));
          const { chargeHistoryForMostRecentPSA } = getCasesForPSA(
            personCaseHistory,
            personChargeHistory,
            psa,
            arrestDate,
            undefined
          );
          if (psaScoreMap.get(psaId) && arrestDate.isValid()) {
            chargeHistoryForMostRecentPSA.entrySeq().forEach(([_, charges]) => {
              const psaHasPendingCharges = charges.some(charge => !charge.getIn([PROPERTY_TYPES.DISPOSITION_DATE, 0]));
              if (psaHasPendingCharges) hasPendingCharges = true;
            });
            if (chargeHistoryForMostRecentPSA.size && !hasPendingCharges) {
              psaScoresWithNoPendingCharges = psaScoresWithNoPendingCharges.add(psaId);
              peopleWithNoPendingCharges = peopleWithNoPendingCharges.add(personId);
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
      peopleMap,
      psaScoreMap,
      psaNeighborsById,
      psaScoresWithNoPendingCharges,
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
  loadRequiresActionPeopleWatcher,
  refreshPersonNeighborsWatcher,
  updateContactInfoWatcher
};
