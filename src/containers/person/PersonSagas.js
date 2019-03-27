/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import LatticeAuth from 'lattice-auth';
import { push } from 'connected-react-router';
import { fromJS, List, Map } from 'immutable';
import { Constants, SearchApi } from 'lattice';
import {
  all,
  call,
  put,
  take,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { toISODate, formatDate } from '../../utils/FormattingUtils';
import { submit } from '../../utils/submit/SubmitActionFactory';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HAS_OPEN_PSA, PSA_STATUSES } from '../../utils/consts/Consts';
import { APP, STATE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
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
} from './PersonActionFactory';

import * as Routes from '../../core/router/Routes';

const { OPENLATTICE_ID_FQN } = Constants;
let {
  CONTACT_INFORMATION,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES
} = APP_TYPES_FQNS;

PEOPLE = PEOPLE.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();
PSA_SCORES = PSA_SCORES.toString();
CONTACT_INFORMATION = CONTACT_INFORMATION.toString();

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

function* loadPersonId(person) :Generator<*, *, *> {
  const firstName = person.firstNameValue;
  const lastName = person.lastNameValue;
  const dob = formatDate(person.dobValue, 'MM/DD/YYYY');
  try {
    const loadRequest = {
      method: 'post',
      url: 'https://api.openlattice.com/bifrost/caseloader/id',
      data: { firstName, lastName, dob },
      headers: {
        Authorization: `Bearer ${AuthUtils.getAuthToken()}`
      }
    };
    const response = yield call(axios, loadRequest);
    return response.data ? response.data.toString() : '';
  }
  catch (error) {
    console.error('Unable to load person id from Odyssey.');
    return '';
  }
}

function* loadPersonDetailsWorker(action) :Generator<*, *, *> {

  try {
    const { entityKeyId, shouldLoadCases } = action.value;
    const app = yield select(getApp);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    yield put(loadPersonDetails.request(action.id, { entityKeyId }));

    // <HACK>
    if (shouldLoadCases && !__ENV_DEV__) {
      yield call(loadCaseHistory, entityKeyId);
      const response = yield call(SearchApi.searchEntityNeighbors, peopleEntitySetId, entityKeyId);
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
      let response = yield call(SearchApi.searchEntityNeighbors, peopleEntitySetId, entityKeyId);
      response = obfuscateEntityNeighbors(response, app);
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
    yield put(updateCases.failure(error, { cases }));
  }
  finally {
    yield put(updateCases.finally(action.id, { cases }));
  }
}

function* updateCasesWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CASES, updateCasesWorker);
}

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id)
  );
}

function* newPersonSubmitWorker(action) :Generator<*, *, *> {
  try {
    yield put(newPersonSubmit.request(action.id));
    const { app, config, values } = action.value;
    const personId = yield call(loadPersonId, values);
    if (personId && personId.length) {
      values.idValue = personId;
    }
    const submitAction :SequenceAction = submit({ app, config, values });
    yield put(submitAction);
    const submitRes :SequenceAction = yield takeReqSeqSuccessFailure(submit, submitAction);

    if (submitRes.type === submit.SUCCESS) {
      yield put(newPersonSubmit.success(action.id));
      // TODO: is routing the best way to handle a successful submit?
      yield put(push(Routes.ROOT));
    }
    else {
      yield put(newPersonSubmit.failure(action.id));
    }
  }
  catch (error) {
    console.error(error);
    yield put(newPersonSubmit.failure(error));
  }
}

function* newPersonSubmitWatcher() :Generator<*, *, *> {
  yield takeEvery(NEW_PERSON_SUBMIT, newPersonSubmitWorker);
}

function* searchPeopleWorker(action) :Generator<*, *, *> {
  try {
    yield put(searchPeople.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
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

    let response = yield call(SearchApi.advancedSearchEntitySetData, peopleEntitySetId, searchOptions);
    response = fromJS(response.hits);
    let personMap = Map();
    if (includePSAInfo) {
      response.forEach((person) => {
        const personEntityKeyId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
        personMap = personMap.set(personEntityKeyId, fromJS(person));
      });
      let peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
        entityKeyIds: personMap.keySeq().toJS(),
        sourceEntitySetIds: [psaScoresEntitySetId],
        destinationEntitySetIds: []
      });
      peopleNeighborsById = fromJS(peopleNeighborsById);

      peopleNeighborsById.entrySeq().forEach(([personEntityKeyId, neighbors]) => {
        const hasOpenPSA = neighbors.some(neighbor => (
          neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0], '') === PSA_STATUSES.OPEN
        ));

        if (hasOpenPSA) personMap = personMap.setIn([personEntityKeyId, HAS_OPEN_PSA], hasOpenPSA);
      });
      response = personMap.valueSeq();
    }

    yield put(searchPeople.success(action.id, response));
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
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
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
      nameConstraints.constraints.push({
        searchTerm: `${property}:"${search}"`,
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
        let contactsByPersonId = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
          entityKeyIds: peopleIds.toJS(),
          sourceEntitySetIds: [],
          destinationEntitySetIds: [contactInformationEntitySetId]
        });
        contactsByPersonId = fromJS(contactsByPersonId);
        contactsByPersonId.entrySeq().forEach(([id, contacts]) => {
          contacts
            .filter((contact => !!contact.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '')))
            .forEach((contact) => {
              const contactObj = contact.get(PSA_NEIGHBOR.DETAILS, Map());
              const contactId = contactObj.getIn([OPENLATTICE_ID_FQN, 0], '');
              const contactIsPreferred = contactObj.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], false);
              const personNeedsContact = !personIdsToContactIds.get(id);
              if (personNeedsContact && contactIsPreferred) {
                contactMap = contactMap.set(contactId, contactObj);
                personIdsToContactIds = personIdsToContactIds.set(
                  id, personIdsToContactIds.get(id, List()).push(contactId)
                );
              }
            });
        });
      }
    }
    let people = Map();
    allResults.forEach((person) => {
      const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
      people = people.set(personId, person);
    });

    yield put(searchPeopleByPhoneNumber.success(action.id, {
      people,
      contactMap,
      personIdsToContactIds
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
