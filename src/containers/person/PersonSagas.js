/*
 * @flow
 */

import { EntityDataModelApi, SearchApi } from 'lattice';
import { push } from 'react-router-redux';
import { call, put, take } from 'redux-saga/effects';

import { SUBMIT_FAILURE, SUBMIT_SUCCESS } from '../../utils/submit/SubmitActionTypes';
import { submit } from '../../utils/submit/SubmitActionFactory';
import { ENTITY_SETS } from '../../utils/DataModelConsts';

import {
  LOAD_PERSON_DETAILS_REQUEST,
  loadPersonDetailsFailure,
  loadPersonDetailsSuccess,
  NEW_PERSON_SUBMIT_REQUEST,
  newPersonSubmitFailure,
  newPersonSubmitSuccess,
  SEARCH_PEOPLE_REQUEST,
  searchPeopleFailure,
  searchPeopleSuccess
} from './PersonActionFactory';

import type {
  NewPersonSubmitRequestAction,
  SearchPeopleRequestAction
} from './PersonActionFactory';

import * as Routes from '../../core/router/Routes';

export function* watchLoadPersonDetailsRequest() :Generator<*, *, *> {

  while (true) {
    const action :LoadPersonDetailsRequestAction = yield take(LOAD_PERSON_DETAILS_REQUEST);
    try {
      const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
      const response = yield call(SearchApi.searchEntityNeighbors, entitySetId, action.id);
      yield put(loadPersonDetailsSuccess(response));
    }
    catch (error) {
      yield put(loadPersonDetailsFailure(error));
    }
  }
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

export function* watchSearchPeopleRequest() :Generator<*, *, *> {

  while (true) {
    const action :SearchPeopleRequestAction = yield take(SEARCH_PEOPLE_REQUEST);
    // TODO: implement actual paging
    const searchOptions = {
      searchTerm: action.searchQuery,
      start: 0,
      maxHits: 100
    };
    try {
      const entitySetId :string = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
      const response = yield call(SearchApi.searchEntitySetData, entitySetId, searchOptions);
      yield put(searchPeopleSuccess(response));
    }
    catch (error) {
      yield put(searchPeopleFailure(error));
    }
  }
}
