/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import LatticeAuth from 'lattice-auth';

import { EntityDataModelApi, SearchApi } from 'lattice';
import { push } from 'react-router-redux';
import {
  all,
  call,
  put,
  take,
  takeEvery
} from 'redux-saga/effects';

import { toISODate, formatDate } from '../../utils/FormattingUtils';
import { submit } from '../../utils/submit/SubmitActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';

import {
  LOAD_PERSON_DETAILS,
  NEW_PERSON_SUBMIT,
  SEARCH_PEOPLE,
  UPDATE_CASES,
  loadPersonDetails,
  newPersonSubmit,
  searchPeople,
  updateCases,
} from './PersonActionFactory';

import * as Routes from '../../core/router/Routes';

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
    yield put(loadPersonDetails.request(action.id, { entityKeyId }));
    const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);

    // <HACK>
    if (shouldLoadCases && !__ENV_DEV__) {
      yield call(loadCaseHistory, entityKeyId);
      const response = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
      const caseNums = (response || []).filter((neighborObj) => {
        const { neighborEntitySet, neighborDetails } = neighborObj;
        return neighborEntitySet && neighborDetails && neighborEntitySet.name === ENTITY_SETS.PRETRIAL_CASES;
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
      let response = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
      response = obfuscateEntityNeighbors(response);
      yield put(loadPersonDetails.success(action.id, { entityKeyId, response }));
    }
  }
  catch (error) {
    console.error(error);
    yield put(loadPersonDetails.failure(action.id, error));
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
    const { config, values } = action.value;
    const personId = yield call(loadPersonId, values);
    if (personId && personId.length) {
      values.idValue = personId;
    }
    const submitAction :SequenceAction = submit({ config, values });
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
    yield put(newPersonSubmit.failure(error));
  }
}

function* newPersonSubmitWatcher() :Generator<*, *, *> {
  yield takeEvery(NEW_PERSON_SUBMIT, newPersonSubmitWorker);
}

function* getPropertyTypeId(propertyTypeFqn :string) :Generator<*, *, *> {
  const propertyTypeFqnArr = propertyTypeFqn.split('.');
  return yield call(EntityDataModelApi.getPropertyTypeId, {
    namespace: propertyTypeFqnArr[0],
    name: propertyTypeFqnArr[1]
  });
}

function* searchPeopleWorker(action) :Generator<*, *, *> {

  try {
    yield put(searchPeople.request(action.id));
    const {
      firstName,
      lastName,
      dob
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
      const firstNameId = yield call(getPropertyTypeId, PROPERTY_TYPES.FIRST_NAME);
      updateSearchField(firstName.trim(), firstNameId);
    }
    if (lastName.trim().length) {
      const lastNameId = yield call(getPropertyTypeId, PROPERTY_TYPES.LAST_NAME);
      updateSearchField(lastName.trim(), lastNameId);
    }
    if (dob && dob.trim().length) {
      const dobMoment = moment(dob.trim());
      if (dobMoment.isValid()) {
        const dobId = yield call(getPropertyTypeId, PROPERTY_TYPES.DOB);
        updateSearchField(toISODate(dobMoment), dobId, true);
      }
    }
    const searchOptions = {
      searchFields,
      start: 0,
      maxHits: 100
    };

    const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
    const response = yield call(SearchApi.advancedSearchEntitySetData, entitySetId, searchOptions);
    yield put(searchPeople.success(action.id, response));
  }
  catch (error) {
    yield put(searchPeople.success(error));
  }
}

function* searchPeopleWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_PEOPLE, searchPeopleWorker);
}

export {
  loadPersonDetailsWatcher,
  updateCasesWatcher,
  newPersonSubmitWatcher,
  searchPeopleWatcher
};
