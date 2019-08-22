/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import LatticeAuth from 'lattice-auth';
import randomUUID from 'uuid/v4';
import { Constants, SearchApi } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import {
  all,
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { toISODate } from '../../utils/FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PERSON_INFO_DATA, PSA_STATUSES } from '../../utils/consts/Consts';
import { APP, STATE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { createIdObject, getSearchTerm } from '../../utils/DataUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import {
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS,
  NEW_PERSON_SUBMIT,
  SEARCH_PEOPLE,
  SEARCH_PEOPLE_BY_PHONE,
  UPDATE_CASES,
  clearSearchResults,
  loadPersonDetails,
  newPersonSubmit,
  searchPeople,
  searchPeopleByPhoneNumber,
  updateCases,
} from './PersonActions';

import * as Routes from '../../core/router/Routes';

const { createEntityAndAssociationData, createOrMergeEntityData, getEntityData } = DataApiActions;
const { createEntityAndAssociationDataWorker, createOrMergeEntityDataWorker, getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;

const { HAS_OPEN_PSA, HAS_MULTIPLE_OPEN_PSAS, IS_RECEIVING_REMINDERS } = PERSON_INFO_DATA;
const { OPENLATTICE_ID_FQN } = Constants;
const {
  ADDRESSES,
  CHARGES,
  CONTACT_INFO_GIVEN,
  CONTACT_INFORMATION,
  LIVES_AT,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  SUBSCRIPTION
} = APP_TYPES;

const { ID, STRING_ID } = PROPERTY_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

declare var __ENV_DEV__ :boolean;

const { AuthUtils } = LatticeAuth;

function* loadCaseHistory(entityKeyId :string) :Generator<*, *, *> {
  try {
    const loadRequest = {
      method: 'get',
      url: `https://api.openlattice.com/bifrost/caseloader/history/${entityKeyId}`,
      headers: {
        Authorization: `Bearer ${AuthUtils.getAuthToken()}`
      }
    };
    yield call(axios, loadRequest);
  }
  catch (error) {
    console.error(`Unable to load case history for person with entityKeyId: ${entityKeyId}`);
  }
}

function* loadPersonDetailsWorker(action) :Generator<*, *, *> {

  try {

    const { entityKeyId, shouldLoadCases } = action.value;
    const app = yield select(getApp);

    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.ARREST_CASES);
    const chargesEntitySetId = getEntitySetIdFromApp(app, CHARGES);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);

    yield put(loadPersonDetails.request(action.id, { entityKeyId }));

    // <HACK>
    if (shouldLoadCases && !__ENV_DEV__) {
      yield call(loadCaseHistory, entityKeyId);
      let peopleNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: peopleEntitySetId,
          filter: {
            entityKeyIds: [entityKeyId],
            sourceEntitySetIds: [psaScoresEntitySetId],
            destinationEntitySetIds: [
              arrestCasesEntitySetId,
              chargesEntitySetId,
              pretrialCasesEntitySetId
            ]
          }
        })
      );
      if (peopleNeighborsById.error) throw peopleNeighborsById.error;
      peopleNeighborsById = peopleNeighborsById.data;
      const response = peopleNeighborsById[entityKeyId];

      const caseNums = (response || []).filter((neighborObj) => {
        const { neighborEntitySet, neighborDetails } = neighborObj;
        return neighborEntitySet && neighborDetails && neighborEntitySet.id === pretrialCasesEntitySetId;
      });
      if (caseNums.length) {
        const caseNumRequests = caseNums
          .filter(neighborObj => neighborObj.neighborDetails[PROPERTY_TYPES.CASE_ID])
          .map(neighborObj => neighborObj.neighborDetails[PROPERTY_TYPES.CASE_ID])
          .reduce((c1, c2) => [...c1, ...c2])
          .filter((caseNum, index, arr) => arr.indexOf(caseNum) === index);

        let caseNumSearchBlocks = [];
        const MAX_PARALLEL_SEARCHES = 20;
        const searchSize = Math.ceil(caseNumRequests.length / MAX_PARALLEL_SEARCHES);
        let i = 0;
        for (i = 0; i < caseNumRequests.length; i += searchSize) {
          const subArr = caseNumRequests.slice(i, i + searchSize);
          caseNumSearchBlocks.push(subArr);
        }

        caseNumSearchBlocks = caseNumSearchBlocks.map(cases => put(updateCases({ cases })));
        yield all(caseNumSearchBlocks);
      }
      else {
        yield put(loadPersonDetails.success(action.id, { response }));
      }
    }
    // </HACK>

    else {
      let peopleNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: peopleEntitySetId,
          filter: {
            entityKeyIds: [entityKeyId],
            sourceEntitySetIds: [psaScoresEntitySetId],
            destinationEntitySetIds: [
              arrestCasesEntitySetId,
              chargesEntitySetId,
              pretrialCasesEntitySetId
            ]
          }
        })
      );
      if (peopleNeighborsById.error) throw peopleNeighborsById.error;
      peopleNeighborsById = fromJS(peopleNeighborsById.data);
      const response = peopleNeighborsById.get(entityKeyId);
      yield put(loadPersonDetails.success(action.id, { entityKeyId, response }));
    }
  }
  catch (error) {
    console.error(error);
    yield put(loadPersonDetails.failure(action.id, error));
  }

  finally {
    yield put(loadPersonDetails.finally(action.id));
  }

}

function* loadPersonDetailsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PERSON_DETAILS, loadPersonDetailsWorker);
}

function* updateCasesWorker(action) :Generator<*, *, *> {

  const { cases } = action.value;
  try {
    yield put(updateCases.request(action.id, { cases }));
    const loadRequest = {
      method: 'post',
      url: 'https://api.openlattice.com/bifrost/caseloader/cases',
      data: cases,
      headers: {
        Authorization: `Bearer ${AuthUtils.getAuthToken()}`
      }
    };
    yield call(axios, loadRequest);
    yield put(updateCases.success(action.id, { cases }));
  }
  catch (error) {
    console.error(error);
    yield put(updateCases.failure(action.id, { cases }));
  }
  finally {
    yield put(updateCases.finally(action.id, { cases }));
  }
}

function* updateCasesWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CASES, updateCasesWorker);
}

function* newPersonSubmitWorker(action) :Generator<*, *, *> {
  try {
    yield put(newPersonSubmit.request(action.id));
    const {
      addressEntity,
      contactEntity,
      newPersonEntity
    } = action.value;
    /*
    * Get App and Edm state
    */
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);

    let personEKID;
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const personSubmitEntity = getPropertyIdToValueMap(newPersonEntity, edm);

    /*
     * Check to see if contact or address are being submitted
     */

    const addressIncluded = !!Object.keys(addressEntity).length;
    const contactIncluded = !!Object.keys(contactEntity).length;

    const addressESID = getEntitySetIdFromApp(app, ADDRESSES);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    if (addressIncluded || contactIncluded) {
      const entities = { [peopleESID]: [personSubmitEntity] };
      const associations = {};
      /*
      * Add address if present
      */

      if (addressIncluded) {
        const stringIdPTID = getPropertyTypeId(edm, STRING_ID);
        const livesAtESID = getEntitySetIdFromApp(app, LIVES_AT);

        const addressSubmitEntity = getPropertyIdToValueMap(addressEntity, edm);
        entities[addressESID] = [addressSubmitEntity];
        associations[livesAtESID] = [{
          data: { [stringIdPTID]: [randomUUID()] },
          srcEntityIndex: 0,
          srcEntitySetId: peopleESID,
          dstEntityIndex: 0,
          dstEntitySetId: addressESID
        }];
      }
      if (contactIncluded) {
        const olIdPTID = getPropertyTypeId(edm, ID);
        const contactInfoGivenESID = getEntitySetIdFromApp(app, CONTACT_INFO_GIVEN);

        const contactSubmitEntity = getPropertyIdToValueMap(contactEntity, edm);
        entities[contactInfoESID] = [contactSubmitEntity];
        associations[contactInfoGivenESID] = [{
          data: { [olIdPTID]: [randomUUID()] },
          srcEntityIndex: 0,
          srcEntitySetId: peopleESID,
          dstEntityIndex: 0,
          dstEntitySetId: contactInfoESID
        }];
      }
      /*
      * Submit data and collect response
      */
      const response = yield call(
        createEntityAndAssociationDataWorker,
        createEntityAndAssociationData({ associations, entities })
      );
      if (response.error) throw response.error;
      /*
      * Collect Person and Neighbors
      */
      const entityKeyIds = fromJS(response.data.entityKeyIds);

      personEKID = entityKeyIds.getIn([peopleESID, 0], '');
    }
    else {
      const createPersonResponse = yield call(
        createOrMergeEntityDataWorker,
        createOrMergeEntityData({
          entitySetId: peopleESID,
          entityData: [personSubmitEntity]
        })
      );
      if (createPersonResponse.error) throw createPersonResponse.error;
      const { data: EKIDs } = createPersonResponse;
      personEKID = EKIDs[0];
    }

    /*
    * Get Hearing Info
    */
    const personIdObject = createIdObject(personEKID, peopleESID);
    const personResponse = yield call(
      getEntityDataWorker,
      getEntityData(personIdObject)
    );
    if (personResponse.error) throw personResponse.error;
    const person = fromJS(personResponse.data);
    let personNeighborsByAppTypeFqn = Map();
    if (addressIncluded || contactIncluded) {
      let peopleNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: peopleESID,
          filter: {
            entityKeyIds: [personEKID],
            sourceEntitySetIds: [],
            destinationEntitySetIds: [addressESID, contactInfoESID]
          }
        })
      );
      if (peopleNeighborsById.error) throw peopleNeighborsById.error;
      peopleNeighborsById = fromJS(peopleNeighborsById.data);
      const personNeighbors = peopleNeighborsById.get(personEKID);
      personNeighborsByAppTypeFqn = personNeighborsByAppTypeFqn.withMutations((map) => {
        if (personNeighbors.size) {
          personNeighbors.forEach((neighbor) => {
            const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            if (appTypeFqn === CONTACT_INFORMATION) {
              map.set(
                appTypeFqn,
                map.get(appTypeFqn, List()).push(neighborObj)
              );
            }
            else if (appTypeFqn === ADDRESSES) {
              map.set(
                appTypeFqn,
                map.get(appTypeFqn, List()).push(neighborObj)
              );
            }
          });
        }
      });
      // TODO: update create psa flow to route you to creating a psa for this person upon submit
    }
    yield put(newPersonSubmit.success(action.id, {
      person,
      personEKID,
      personNeighborsByAppTypeFqn
    }));
  }
  catch (error) {
    console.error(error);
    yield put(newPersonSubmit.failure(action.id, error));
  }
}

function* newPersonSubmitWatcher() :Generator<*, *, *> {
  yield takeEvery(NEW_PERSON_SUBMIT, newPersonSubmitWorker);
}

function* searchPeopleWorker(action) :Generator<*, *, *> {
  try {
    yield put(searchPeople.request(action.id));
    const app = yield select(getApp);
    const orgId = app.get(APP.SELECTED_ORG_ID, '');
    const edm = yield select(getEDM);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const firstNamePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.FIRST_NAME);
    const lastNamePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.LAST_NAME);
    const dobPropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.DOB);

    const {
      firstName,
      lastName,
      dob,
      includePSAInfo
    } = action.value;
    const searchFields = [];
    const updateSearchField = (searchString :string, property :string, exact? :boolean) => {
      const searchTerm = exact ? `"${searchString}"` : searchString;
      searchFields.push({
        searchTerm,
        property,
        exact: true
      });
    };

    if (firstName.trim().length) {
      updateSearchField(firstName.trim(), firstNamePropertyTypeId);
    }
    if (lastName.trim().length) {
      updateSearchField(lastName.trim(), lastNamePropertyTypeId);
    }
    if (dob && dob.trim().length) {
      const dobMoment = moment(dob.trim());
      if (dobMoment.isValid()) {
        updateSearchField(toISODate(dobMoment), dobPropertyTypeId, true);
      }
    }
    const searchOptions = {
      searchFields,
      start: 0,
      maxHits: 100
    };

    const response = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: peopleEntitySetId, searchOptions })
    );
    if (response.error) throw response.error;

    let personMap = Map();
    if (response.data.hits.length > 0) {
      const searchResults = fromJS(response.data.hits);
      searchResults.forEach((person) => {
        const personEntityKeyId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
        personMap = personMap.set(personEntityKeyId, person);
      });
      if (includePSAInfo) {
        let peopleNeighborsById = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({
            entitySetId: peopleEntitySetId,
            filter: {
              entityKeyIds: personMap.keySeq().toJS(),
              sourceEntitySetIds: [psaScoresEntitySetId, contactInformationEntitySetId],
              destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId]
            }
          })
        );
        if (peopleNeighborsById.error) throw peopleNeighborsById.error;
        peopleNeighborsById = fromJS(peopleNeighborsById.data);

        peopleNeighborsById.entrySeq().forEach(([personEntityKeyId, neighbors]) => {
          let hasActiveSubscription = false;
          let hasPreferredContact = false;
          let psaCount = 0;
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId);
            if (appTypeFqn === PSA_SCORES
              && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0], '') === PSA_STATUSES.OPEN) {
              psaCount += 1;
            }
            if (appTypeFqn === SUBSCRIPTION) {
              const subscriptionIsActive = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_ACTIVE, 0], false);
              if (subscriptionIsActive) {
                hasActiveSubscription = true;
              }
            }
            if (appTypeFqn === CONTACT_INFORMATION) {
              const contactIsPreferred = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false);
              if (contactIsPreferred) {
                hasPreferredContact = true;
              }
            }
          });

          personMap = personMap
            .setIn([personEntityKeyId, HAS_OPEN_PSA], (psaCount > 0))
            .setIn([personEntityKeyId, HAS_MULTIPLE_OPEN_PSAS], (psaCount > 1))
            .setIn([personEntityKeyId, IS_RECEIVING_REMINDERS], (hasActiveSubscription && hasPreferredContact));
        });
      }
    }
    const personList = personMap.valueSeq();

    yield put(searchPeople.success(action.id, personList));
  }
  catch (error) {
    console.error(error);
    yield put(searchPeople.failure(action.id, error));
  }

  finally {
    yield put(searchPeople.finally(action.id));
  }
}

function* searchPeopleWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_PEOPLE, searchPeopleWorker);
}

function* searchPeopleByPhoneNumberWorker(action) :Generator<*, *, *> {

  try {
    yield put(searchPeopleByPhoneNumber.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = app.get(APP.SELECTED_ORG_ID, '');
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const phonePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.PHONE);
    const firstNamePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.FIRST_NAME);
    const lastNamePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.LAST_NAME);

    const { searchTerm } = action.value;
    const letters = (searchTerm).replace(/[^a-zA-Z]/g, ' ');
    const numbers = (searchTerm).replace(/[^0-9]/g, '');
    const phoneFields = [];
    const nameFields = [];
    const firstNameConstraints = { min: 1, constraints: [] };
    const lastNameConstraints = { min: 1, constraints: [] };
    const updateSearchField = (
      searchFields :Array,
      searchString :string,
      property :string,
      exact? :boolean
    ) => {
      const isExact = !!exact;
      searchFields.push({
        searchTerm: searchString,
        property,
        exact: isExact
      });
    };
    const updateConstraints = (
      nameConstraints :Array,
      search :string,
      property :string,
    ) => {
      const formattedSearchTerm = getSearchTerm(property, search);
      nameConstraints.constraints.push({
        searchTerm: formattedSearchTerm,
        fuzzy: true
      });
    };

    if (numbers.trim().length) {
      let searchString = numbers.trim();
      if (searchString.length > 9) {
        searchString = `"${searchString.slice(0, 3)} ${searchString.slice(3, 6)}-${searchString.slice(6)}"`;
      }
      updateSearchField(phoneFields, searchString, phonePropertyTypeId);
    }

    const names = letters.trim().split(' ');
    if (letters.trim().length) {
      if (names.length < 2) {
        updateSearchField(nameFields, letters.trim(), firstNamePropertyTypeId);
        updateSearchField(nameFields, letters.trim(), lastNamePropertyTypeId);
      }
      else {
        names.forEach((word) => {
          updateConstraints(firstNameConstraints, word, firstNamePropertyTypeId);
          updateConstraints(lastNameConstraints, word, lastNamePropertyTypeId);
        });
      }
    }

    const searchConstraints = {
      entitySetIds: [peopleEntitySetId],
      start: 0,
      maxHits: 100,
      constraints: [
        firstNameConstraints,
        lastNameConstraints
      ]
    };

    const phoneOptions = {
      searchFields: phoneFields,
      start: 0,
      maxHits: 100
    };
    const nameOptions = {
      searchFields: nameFields,
      start: 0,
      maxHits: 100
    };

    let allResults = List();
    let contactIds = List();
    let peopleIds = List();
    let personIdsToContactIds = Map();
    let subscribedPeopleIds = Set();
    let contactMap = Map();
    let peopleMap = Map();
    if (phoneFields.length) {
      const searchOptions = phoneOptions;
      let contacts = yield call(SearchApi.advancedSearchEntitySetData, contactInformationEntitySetId, searchOptions);
      contacts = fromJS(contacts.hits);
      contacts.forEach((contact) => {
        const contactId = contact.getIn([OPENLATTICE_ID_FQN, 0], '');
        contactIds = contactIds.push(contactId);
        contactMap = contactMap.set(contactId, contact);
      });
      if (contactIds.size) {
        let peopleByContactId = yield call(SearchApi.searchEntityNeighborsWithFilter, contactInformationEntitySetId, {
          entityKeyIds: contactIds.toJS(),
          sourceEntitySetIds: [peopleEntitySetId],
          destinationEntitySetIds: [contactInformationEntitySetId, peopleEntitySetId]
        });
        peopleByContactId = fromJS(peopleByContactId);
        peopleByContactId.entrySeq().forEach(([id, people]) => {
          const peopleList = people
            .filter((person => !!person.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '')))
            .map((person) => {
              const personObj = person.get(PSA_NEIGHBOR.DETAILS, Map());
              const personId = personObj.getIn([OPENLATTICE_ID_FQN, 0], '');
              personIdsToContactIds = personIdsToContactIds.set(
                personId, personIdsToContactIds.get(personId, List()).push(id)
              );
              return personObj;
            });
          allResults = allResults.concat(peopleList);
        });
      }
      if (personIdsToContactIds.size) {
        let personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
          entityKeyIds: personIdsToContactIds.keySeq().toJS(),
          sourceEntitySetIds: [subscriptionEntitySetId],
          destinationEntitySetIds: [subscriptionEntitySetId]
        });
        personNeighborsById = fromJS(personNeighborsById);
        personNeighborsById.entrySeq().forEach(([id, neighbors]) => {
          const personContactIds = personIdsToContactIds.get(id, List());
          const hasAPreferredContact = personContactIds.some((contactentityKeyId) => {
            const contactObj = contactMap.get(contactentityKeyId, Map());
            return contactObj.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], false);
          });
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId);
            if (appTypeFqn === SUBSCRIPTION) {
              const subscriptionIsActive = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_ACTIVE, 0], false);
              if (subscriptionIsActive && hasAPreferredContact) {
                subscribedPeopleIds = subscribedPeopleIds.add(id);
              }
            }
          });
        });
      }
    }
    if (letters.trim().length) {
      const searchOptions = nameOptions;
      let people;
      if (names.length < 2) {
        people = yield call(SearchApi.advancedSearchEntitySetData, peopleEntitySetId, searchOptions);
      }
      else {
        people = yield call(SearchApi.executeSearch, searchConstraints);
      }
      people = fromJS(people.hits);
      allResults = allResults.concat(people);
      people.forEach((person) => {
        const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
        peopleIds = peopleIds.push(personId);
        peopleMap = peopleMap.set(personId, person);
      });
      if (peopleIds.size) {
        let personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
          entityKeyIds: peopleIds.toJS(),
          sourceEntitySetIds: [contactInformationEntitySetId],
          destinationEntitySetIds: [contactInformationEntitySetId, subscriptionEntitySetId]
        });
        personNeighborsById = fromJS(personNeighborsById);
        personNeighborsById.entrySeq().forEach(([id, neighbors]) => {
          let hasAPreferredContact = false;
          neighbors
            .filter((neighbor => !!neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '')))
            .forEach((neighbor) => {
              const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
              const appTypeFqn = entitySetIdsToAppType.get(entitySetId);
              if (appTypeFqn === SUBSCRIPTION) {
                const subscriptionIsActive = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_ACTIVE, 0], false);
                if (subscriptionIsActive) {
                  subscribedPeopleIds = subscribedPeopleIds.add(id);
                }
              }
              const contactObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
              const contactId = contactObj.getIn([OPENLATTICE_ID_FQN, 0], '');
              const contactIsPreferred = contactObj.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], false);
              if (contactIsPreferred) hasAPreferredContact = true;
              const personNeedsContact = !personIdsToContactIds.get(id);
              if (personNeedsContact && contactIsPreferred) {
                contactMap = contactMap.set(contactId, contactObj);
                personIdsToContactIds = personIdsToContactIds.set(
                  id, personIdsToContactIds.get(id, List()).push(contactId)
                );
              }
            });
          if (!hasAPreferredContact) {
            subscribedPeopleIds = subscribedPeopleIds.delete(id);
          }
        });
      }
    }
    let people = Map();
    allResults.forEach((person) => {
      const personEntityKeyId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
      people = people.set(
        personEntityKeyId,
        person.set(IS_RECEIVING_REMINDERS, subscribedPeopleIds.includes(personEntityKeyId))
      );
    });

    yield put(searchPeopleByPhoneNumber.success(action.id, {
      people,
      contactMap,
      personIdsToContactIds,
      subscribedPeopleIds
    }));
  }
  catch (error) {
    console.error(error);
    yield put(searchPeopleByPhoneNumber.failure(error));
  }
}

function* searchPeopleByPhoneNumberWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_PEOPLE_BY_PHONE, searchPeopleByPhoneNumberWorker);
}

function* clearSearchResultsWorker(action) :Generator<*, *, *> {
  yield put(clearSearchResults.success(action.id));
}

function* clearSearchResultsWatcher() :Generator<*, *, *> {
  yield takeEvery(CLEAR_SEARCH_RESULTS, clearSearchResultsWorker);
}

export {
  clearSearchResultsWatcher,
  loadPersonDetailsWatcher,
  updateCasesWatcher,
  newPersonSubmitWatcher,
  searchPeopleWatcher,
  searchPeopleByPhoneNumberWatcher
};
