/*
 * @flow
 */

import { DataApi } from 'lattice';
import { call, put, take, select } from 'redux-saga/effects';

import * as ActionTypes from './DataActionTypes';

import {
  deleteEntityFailure,
  deleteEntitySuccess,
  replaceEntityFailure,
  replaceEntitySuccess
} from './DataActionFactory';

import {
  loadPersonDetailsRequest
} from '../../containers/person/PersonActionFactory';

export function* deleteEntity() :Generator<> {
  while (true) {
    const {
      entitySetId,
      entityKeyId
    } = yield take(ActionTypes.DELETE_ENTITY_REQUEST);

    const state = yield select();
    const personId = state.getIn(['search', 'selectedPersonId'], '');
    if (personId) yield put(loadPersonDetailsRequest(personId));

    try {
      yield call(DataApi.deleteEntityFromEntitySet, entitySetId, entityKeyId);
      yield put(deleteEntitySuccess(entityKeyId));

      const state = yield select();
      const personId = state.getIn(['search', 'selectedPersonId'], '');
      if (personId) yield put(loadPersonDetailsRequest(personId));
    }
    catch (error) {
      yield put(deleteEntityFailure(entityKeyId, error));
    }
  }
}

export function* replaceEntity() :Generator<> {
  while (true) {
    const {
      entitySetId,
      entityKeyId,
      entity
    } = yield take(ActionTypes.REPLACE_ENTITY_REQUEST);

    try {
      yield call(DataApi.replaceEntityInEntitySet, entitySetId, entityKeyId, entity);
      yield put(replaceEntitySuccess(entityKeyId));

      const state = yield select();
      const personId = state.getIn(['search', 'selectedPersonId'], '');
      if (personId) yield put(loadPersonDetailsRequest(personId));
    }
    catch (error) {
      yield put(replaceEntityFailure(entityKeyId, error));
    }
  }
}
