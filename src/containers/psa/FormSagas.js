/*
 * @flow
 */

import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, takeEvery, all } from 'redux-saga/effects';

import {
  HARD_RESTART,
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  SUBMIT_DATA,
  UPDATE_NOTES,
  loadDataModel,
  loadNeighbors,
  submitData,
  updateNotes
} from './FormActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

function* loadDataModelWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadDataModel.request(action.id));
    const entitySetIds = yield all(Object.values(ENTITY_SETS).map(entitySetName =>
      call(EntityDataModelApi.getEntitySetId, entitySetName)));
    const selectors = entitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: ['EntitySet', 'EntityType', 'PropertyTypeInEntitySet']
    }));
    const dataModel = yield call(EntityDataModelApi.getEntityDataModelProjection, selectors);
    yield put(loadDataModel.success(action.id, { dataModel }));
  }
  catch (error) {
    yield put(loadDataModel.failure(action.id, { error }));
  }
  finally {
    yield put(loadDataModel.finally(action.id));
  }
}

function* loadDataModelWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DATA_MODEL, loadDataModelWorker);
}

function* loadNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entitySetId, entityKeyId } = action.value;

  try {
    yield put(loadNeighbors.request(action.id));
    const neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
    yield put(loadNeighbors.success(action.id, { neighbors }));
  }
  catch (error) {
    yield put(loadNeighbors.failure(action.id));
  }
  finally {
    yield put(loadNeighbors.finally(action.id));
  }
}

function* loadNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_NEIGHBORS, loadNeighborsWorker);
}

function* submitDataWorker(action :SequenceAction) :Generator<*, *, *> {

  const {
    personEntity,
    pretrialCaseEntity,
    riskFactorsEntity,
    psaEntity,
    notesEntity,
    staffEntity,
    calculatedForEntity,
    assessedByEntity
  } = action.value;

  try {
    yield put(submitData.request(action.id));
    const [
      personSyncId,
      pretrialCaseSyncId,
      riskFactorsSyncId,
      psaSyncId,
      notesSyncId,
      staffSyncId,
      calculatedForSyncId,
      assessedBySyncId
    ] = yield all([
      call(SyncApi.getCurrentSyncId, personEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, pretrialCaseEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, riskFactorsEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, psaEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, notesEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, staffEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, calculatedForEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, assessedByEntity.key.entitySetId)
    ]);
    personEntity.key.syncId = personSyncId;
    pretrialCaseEntity.key.syncId = pretrialCaseSyncId;
    riskFactorsEntity.key.syncId = riskFactorsSyncId;
    psaEntity.key.syncId = psaSyncId;
    notesEntity.key.syncId = notesSyncId;
    staffEntity.key.syncId = staffSyncId;
    calculatedForEntity.key.syncId = calculatedForSyncId;
    assessedByEntity.key.syncId = assessedBySyncId;

    const psaToPersonAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: psaEntity.key },
      { dst: personEntity.key }
    );

    const psaToPretrialCaseAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: psaEntity.key },
      { dst: pretrialCaseEntity.key }
    );

    const psaToRiskFactorsAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: psaEntity.key },
      { dst: riskFactorsEntity.key }
    );

    const riskFactorsToPersonAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: riskFactorsEntity.key },
      { dst: personEntity.key }
    );

    const riskFactorsToPretrialCaseAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: riskFactorsEntity.key },
      { dst: pretrialCaseEntity.key }
    );

    const recommendationToPersonAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: notesEntity.key },
      { dst: personEntity.key }
    );

    const recommendationToRiskFactorsAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: notesEntity.key },
      { dst: riskFactorsEntity.key }
    );

    const recommendationToScoresAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: notesEntity.key },
      { dst: psaEntity.key }
    );

    const recommendationToCaseAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: notesEntity.key },
      { dst: pretrialCaseEntity.key }
    );

    const psaToStaffAssociation = Object.assign(
      {},
      assessedByEntity,
      { src: psaEntity.key },
      { dst: staffEntity.key }
    );

    const riskFactorsToStaffAssociation = Object.assign(
      {},
      assessedByEntity,
      { src: riskFactorsEntity.key },
      { dst: staffEntity.key }
    );

    const notesToStaffAssociation = Object.assign(
      {},
      assessedByEntity,
      { src: notesEntity.key },
      { dst: staffEntity.key }
    );

    const entities = [
      personEntity,
      riskFactorsEntity,
      psaEntity,
      notesEntity,
      staffEntity
    ];

    const associations = [
      psaToPersonAssociation,
      psaToRiskFactorsAssociation,
      riskFactorsToPersonAssociation,
      recommendationToPersonAssociation,
      recommendationToRiskFactorsAssociation,
      recommendationToScoresAssociation,
      psaToStaffAssociation,
      riskFactorsToStaffAssociation,
      notesToStaffAssociation
    ];

    if (Object.keys(pretrialCaseEntity.details).length) {
      entities.push(pretrialCaseEntity);
      associations.push(psaToPretrialCaseAssociation);
      associations.push(riskFactorsToPretrialCaseAssociation);
      associations.push(recommendationToCaseAssociation);
    }


    const syncTickets = yield all([
      call(DataApi.acquireSyncTicket, personEntity.key.entitySetId, personSyncId),
      call(DataApi.acquireSyncTicket, pretrialCaseEntity.key.entitySetId, pretrialCaseSyncId),
      call(DataApi.acquireSyncTicket, riskFactorsEntity.key.entitySetId, riskFactorsSyncId),
      call(DataApi.acquireSyncTicket, psaEntity.key.entitySetId, psaSyncId),
      call(DataApi.acquireSyncTicket, notesEntity.key.entitySetId, notesSyncId),
      call(DataApi.acquireSyncTicket, staffEntity.key.entitySetId, staffSyncId),
      call(DataApi.acquireSyncTicket, calculatedForEntity.key.entitySetId, calculatedForSyncId),
      call(DataApi.acquireSyncTicket, assessedByEntity.key.entitySetId, assessedBySyncId)
    ]);

    yield call(DataApi.createEntityAndAssociationData, { syncTickets, entities, associations });
    yield put(submitData.success(action.id));
  }
  catch (error) {
    yield put(submitData.failure(action.id, { error }));
  }
  finally {
    yield put(submitData.finally(action.id));
  }
}

function* submitDataWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_DATA, submitDataWorker);
}

function* updateNotesWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    notes,
    entityId,
    entitySetId,
    propertyTypes
  } = action.value;

  try {
    yield put(updateNotes.request(action.id));
    const fqnToId = {};
    propertyTypes.forEach((propertyType) => {
      const fqn = `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`;
      fqnToId[fqn] = propertyType.get('id');
    });
    const searchOptions = {
      start: 0,
      maxHits: 1,
      searchTerm: `${fqnToId[PROPERTY_TYPES.GENERAL_ID]}:"${entityId}"`
    };
    const response = yield call(SearchApi.searchEntitySetData, entitySetId, searchOptions);
    const result = response.hits[0];
    if (result) {
      const entity = {};
      Object.keys(result).forEach((fqn) => {
        const propertyTypeId = fqnToId[fqn];
        if (propertyTypeId) entity[propertyTypeId] = result[fqn];
      });
      entity[fqnToId[PROPERTY_TYPES.RELEASE_RECOMMENDATION]] = [notes];
      yield call(DataApi.replaceEntityInEntitySet, entitySetId, result.id[0], entity);
      yield put(updateNotes.success(action.id));
    }
  }
  catch (error) {
    console.error(error);
    yield put(updateNotes.failure(action.id));
  }
  finally {
    yield put(updateNotes.finally(action.id));
  }
}

function* updateNotesWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_NOTES, updateNotesWorker);
}

function* hardRestartWorker() :Generator<*, *, *> {
  // hardRestartWorker and Watcher taken from BHR
  yield call(() => {
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  });
}

function* hardRestartWatcher() :Generator<*, *, *> {

  yield takeEvery(HARD_RESTART, hardRestartWorker);
}


export {
  hardRestartWatcher,
  loadDataModelWatcher,
  loadNeighborsWatcher,
  submitDataWatcher,
  updateNotesWatcher
};
