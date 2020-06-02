/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { EntitySetsApi, Types } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_ASSOCIATIONS,
  DELETE_ENTITY,
  createAssociations,
  deleteEntity
} from './DataActions';

import Logger from '../Logger';
import { loadPersonDetails } from '../../containers/person/PersonActions';
import { SEARCH } from '../consts/FrontEndStateConsts';
import { STATE } from '../consts/redux/SharedConsts';

const { createAssociations: createAssociationsAction, deleteEntityData } = DataApiActions;
const { createAssociationsWorker, deleteEntityDataWorker } = DataApiSagas;

const LOG :Logger = new Logger('DataSagas');
const { DeleteTypes } = Types;

function* createNewAssociationsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    const { associations, callback } = action.value;
    yield put(createAssociations.request(action.id));
    const createAssociationsResponse = yield call(
      createAssociationsWorker,
      createAssociationsAction(associations)
    );

    if (createAssociationsResponse.error) throw createAssociationsResponse.error;

    yield put(createAssociations.success(action.id));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    LOG.error(error);
    yield put(createAssociations.failure(action.id, { error }));
  }
  finally {
    yield put(createAssociations.finally(action.id));
  }
}

function* createAssociationsWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_ASSOCIATIONS, createNewAssociationsWorker);
}

function* deleteEntityWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    entityKeyId,
    entityKeyIds,
    entitySetName,
    callback
  } = action.value;
  let { entitySetId } = action.value;

  try {
    yield put(deleteEntity.request(action.id));
    if (!entitySetId) entitySetId = yield call(EntitySetsApi.getEntitySetId, entitySetName);
    const deleteResponse = yield call(
      deleteEntityDataWorker,
      deleteEntityData({
        entityKeyIds: entityKeyIds || [entityKeyId],
        entitySetId,
        deleteType: DeleteTypes.Soft
      })
    );
    if (deleteResponse.error) throw deleteResponse.error;
    yield put(deleteEntity.success(action.id, { entityKeyId }));

    if (callback) callback();

    const state = yield select();
    const personId = state.getIn([STATE.SEARCH, SEARCH.SELECTED_PERSON_ID], '');
    if (personId) yield put(loadPersonDetails({ entityKeyId: personId, shouldLoadCases: false }));
  }
  catch (error) {
    LOG.error(error);
    yield put(deleteEntity.failure(action.id, { entityKeyId, error }));
  }
  finally {
    yield put(deleteEntity.finally(action.id));
  }
}

function* deleteEntityWatcher() :Generator<*, *, *> {
  yield takeEvery(DELETE_ENTITY, deleteEntityWorker);
}

export {
  createAssociationsWatcher,
  deleteEntityWatcher
};
