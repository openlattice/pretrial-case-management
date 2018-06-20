/*
 * @flow
 */

import axios from 'axios';
import moment from 'moment';
import LatticeAuth from 'lattice-auth';

import { EntityDataModelApi, SearchApi } from 'lattice';
import { push } from 'react-router-redux';
import { all, call, put, take, takeEvery } from 'redux-saga/effects';

import { toISODate, formatDate } from '../../utils/Utils';
import { submit } from '../../utils/submit/SubmitActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import {
  LOAD_PERSON_DETAILS_REQUEST,
  loadPersonDetailsFailure,
  loadPersonDetailsSuccess,
  NEW_PERSON_SUBMIT_REQUEST,
  newPersonSubmitFailure,
  newPersonSubmitSuccess,
  SEARCH_PEOPLE_REQUEST,
  searchPeopleFailure,
  searchPeopleSuccess,
  UPDATE_CASE_REQUEST,
  updateCaseFailure,
  updateCaseRequest,
  updateCaseSuccess
} from './PersonActionFactory';

import type {
  LoadPersonDetailsRequestAction,
  NewPersonSubmitRequestAction,
  SearchPeopleRequestAction,
  UpdateCaseRequestAction
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

export function* watchLoadPersonDetailsRequest() :Generator<*, *, *> {

  while (true) {
    const action :LoadPersonDetailsRequestAction = yield take(LOAD_PERSON_DETAILS_REQUEST);

    try {
      const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
      const entityKeyId = action.id;

      // <HACK>
      if (action.shouldLoadCases && !__ENV_DEV__) {
        yield call(loadCaseHistory, entityKeyId);
        const response = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
        const caseNums = response.filter((neighborObj) => {
          const { neighborEntitySet, neighborDetails } = neighborObj;
          return neighborEntitySet && neighborDetails && neighborEntitySet.name === ENTITY_SETS.PRETRIAL_CASES;
        });

        if (caseNums.length) {
          const caseNumRequests = caseNums
            .filter(neighborObj => neighborObj.neighborDetails[PROPERTY_TYPES.CASE_ID])
            .map(neighborObj => neighborObj.neighborDetails[PROPERTY_TYPES.CASE_ID])
            .reduce((c1, c2) => [...c1, ...c2])
            .filter((caseNum, index, arr) => arr.indexOf(caseNum) === index)
            .map(caseNum => put(updateCaseRequest(caseNum)));
          yield all(caseNumRequests);
        }
        else {
          yield put(loadPersonDetailsSuccess(response));
        }
      }
      // </HACK>

      else {
        const response = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
        yield put(loadPersonDetailsSuccess(response));
      }
    }
    catch (error) {
      console.error(error);
      yield put(loadPersonDetailsFailure(error));
    }
  }
}

export function* watchUpdateCaseRequestWorker(action :UpdateCaseRequestAction) :Generator<*, *, *> {
  const { caseNum } = action;

  try {
    const loadRequest = {
      method: 'get',
      url: `https://api.openlattice.com/bifrost/caseloader/${caseNum}`,
      headers: {
        Authorization: `Bearer ${AuthUtils.getAuthToken()}`
      }
    };
    yield call(axios, loadRequest);
    yield put(updateCaseSuccess(caseNum));
  }
  catch (error) {
    yield put(updateCaseFailure(caseNum, error));
  }
}

export function* watchUpdateCaseRequest() :Generator<*, *, *> {

  yield takeEvery(UPDATE_CASE_REQUEST, watchUpdateCaseRequestWorker);
}

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => {
      return (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id);
    }
  );
}

export function* watchNewPersonSubmitRequest() :Generator<*, *, *> {

  while (true) {
    const action :NewPersonSubmitRequestAction = yield take(NEW_PERSON_SUBMIT_REQUEST);
    const { config, values } = action;
    try {
      const personId = yield call(loadPersonId, values);
      if (personId && personId.length) {
        values.idValue = personId;
      }
      const submitAction :SequenceAction = submit({ config, values });
      yield put(submitAction);
      const submitRes :SequenceAction = yield takeReqSeqSuccessFailure(submit, submitAction);

      if (submitRes.type === submit.SUCCESS) {
        yield put(newPersonSubmitSuccess());
        // TODO: is routing the best way to handle a successful submit?
        yield put(push(Routes.ROOT));
      }
      else {
        yield put(newPersonSubmitFailure());
      }
    }
    catch (error) {
      yield put(newPersonSubmitFailure(error));
    }
  }
}

function* getPropertyTypeId(propertyTypeFqn :string) :Generator<*, *, *> {
  const propertyTypeFqnArr = propertyTypeFqn.split('.');
  return yield call(EntityDataModelApi.getPropertyTypeId, {
    namespace: propertyTypeFqnArr[0],
    name: propertyTypeFqnArr[1]
  });
}

export function* watchSearchPeopleRequest() :Generator<*, *, *> {

  while (true) {
    const action :SearchPeopleRequestAction = yield take(SEARCH_PEOPLE_REQUEST);
    try {
      const {
        firstName,
        lastName,
        dob
      } = action;
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
      yield put(searchPeopleSuccess(response));
    }
    catch (error) {
      yield put(searchPeopleFailure(error));
    }
  }
}
