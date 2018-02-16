/*
 * @flow
 */
import axios from 'axios';
import moment from 'moment';
import LatticeAuth from 'lattice-auth';

import { EntityDataModelApi, SearchApi } from 'lattice';
import { push } from 'react-router-redux';
import { all, call, put, take, takeEvery } from 'redux-saga/effects';

import { SUBMIT_FAILURE, SUBMIT_SUCCESS } from '../../utils/submit/SubmitActionTypes';
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

const { AuthUtils } = LatticeAuth;

export function* watchLoadPersonDetailsRequest() :Generator<*, *, *> {

  while (true) {
    const action :LoadPersonDetailsRequestAction = yield take(LOAD_PERSON_DETAILS_REQUEST);
    try {
      const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
      const response = yield call(SearchApi.searchEntityNeighbors, entitySetId, action.id);

      // <HACK>
      if (action.shouldLoadCases) {
        const caseNumRequests = response.filter((neighborObj) => {
          const { neighborEntitySet, neighborDetails } = neighborObj;
          if (neighborEntitySet && neighborDetails && neighborEntitySet.name === ENTITY_SETS.PRETRIAL_CASES) {
            const arrestDate = neighborDetails[PROPERTY_TYPES.ARREST_DATE_FQN];
            return !arrestDate || !arrestDate.length;
          }
          return false;
        }).map(neighborObj => neighborObj.neighborDetails[PROPERTY_TYPES.CASE_ID_FQN])
          .reduce((c1, c2) => [...c1, ...c2])
          .filter((caseNum, index, arr) => arr.indexOf(caseNum) === index)
          .map(caseNum => put(updateCaseRequest(caseNum)));

        if (caseNumRequests.length) {
          yield all(caseNumRequests);
        }
        else {
          yield put(loadPersonDetailsSuccess(response));
        }
      }
      // </HACK>

      else {
        yield put(loadPersonDetailsSuccess(response));
      }
    }
    catch (error) {
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

export function* watchNewPersonSubmitRequest() :Generator<*, *, *> {

  while (true) {
    const action :NewPersonSubmitRequestAction = yield take(NEW_PERSON_SUBMIT_REQUEST);
    try {
      yield put(submit(action.config, action.values));
      // TODO: need a way to guarantee these next actions are the result of the above dispatch
      const failureOrSuccess = yield take([SUBMIT_FAILURE, SUBMIT_SUCCESS]);
      if (failureOrSuccess.type === SUBMIT_SUCCESS) {
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

function* getPropertyTypeId(propertyTypeFqn :string) :string {
  const propertyTypeFqnArr = propertyTypeFqn.split('.');
  return yield call(EntityDataModelApi.getPropertyTypeId, {
    namespace: propertyTypeFqnArr[0],
    name: propertyTypeFqnArr[1]
  });
}

export function* watchSearchPeopleRequest() :Generator<*, *, *> {

  while (true) {
    const action :SearchPeopleRequestAction = yield take(SEARCH_PEOPLE_REQUEST);
    const {
      firstName,
      lastName,
      dob
    } = action;
    const searchFields = [];
    const updateSearchField = (searchTerm, property) => {
      searchFields.push({
        searchTerm,
        property,
        exact: true
      });
    };
    if (firstName.length) {
      const firstNameId = yield call(getPropertyTypeId, PROPERTY_TYPES.FIRST_NAME);
      updateSearchField(firstName, firstNameId);
    }
    if (lastName.length) {
      const lastNameId = yield call(getPropertyTypeId, PROPERTY_TYPES.LAST_NAME);
      updateSearchField(lastName, lastNameId);
    }
    if (dob && dob.length) {
      const dobMoment = moment(dob);
      if (dobMoment.isValid) {
        const dobId = yield call(getPropertyTypeId, PROPERTY_TYPES.DOB);
        updateSearchField(`"${dobMoment.format('YYYY-MM-DD')}"`, dobId);
      }
    }
    const searchOptions = {
      searchFields,
      start: 0,
      maxHits: 100
    };
    try {
      const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
      const response = yield call(SearchApi.advancedSearchEntitySetData, entitySetId, searchOptions);
      yield put(searchPeopleSuccess(response));
    }
    catch (error) {
      yield put(searchPeopleFailure(error));
    }
  }
}
