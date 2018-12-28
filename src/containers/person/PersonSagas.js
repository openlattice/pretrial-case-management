/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import LatticeAuth from 'lattice-auth';
import { Map } from 'immutable';
import { EntityDataModelApi, SearchApi } from 'lattice';
import { push } from 'react-router-redux';
import {
  all,
  call,
  put,
  take,
  takeEvery,
  select
} from 'redux-saga/effects';

import { toISODate, formatDate } from '../../utils/FormattingUtils';
import { submit } from '../../utils/submit/SubmitActionFactory';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, STATE } from '../../utils/consts/FrontEndStateConsts';
import { obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';
import { getEntitySetId } from '../../utils/AppUtils';
import {
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS,
  NEW_PERSON_SUBMIT,
  SEARCH_PEOPLE,
  UPDATE_CASES,
  clearSearchResults,
  loadPersonDetails,
  newPersonSubmit,
  searchPeople,
  updateCases,
} from './PersonActionFactory';

import * as Routes from '../../core/router/Routes';


let { PEOPLE, PRETRIAL_CASES } = APP_TYPES_FQNS;

PEOPLE = PEOPLE.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();

const getApp = state => state.get(STATE.APP, Map());
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
    const orgId = yield select(getOrgId);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);
    yield put(loadPersonDetails.request(action.id, { entityKeyId }));

    // <HACK>
    if (shouldLoadCases && !__ENV_DEV__) {
      yield call(loadCaseHistory, entityKeyId);
      const response = yield call(SearchApi.searchEntityNeighbors, peopleEntitySetId, entityKeyId);
      const caseNums = (response || []).filter((neighborObj) => {
        const { neighborEntitySet, neighborDetails } = neighborObj;
        return neighborEntitySet && neighborDetails && neighborEntitySet.name === PRETRIAL_CASES;
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
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);

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

    const response = yield call(SearchApi.advancedSearchEntitySetData, peopleEntitySetId, searchOptions);
    yield put(searchPeople.success(action.id, response));
  }
  catch (error) {
    console.error(error);
    yield put(searchPeople.failure(error));
  }
}

function* searchPeopleWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_PEOPLE, searchPeopleWorker);
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
  searchPeopleWatcher
};
