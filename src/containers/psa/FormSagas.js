/*
 * @flow
 */

import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, take, takeEvery, all } from 'redux-saga/effects';

import {
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  SUBMIT_DATA,
  UPDATE_RECOMMENDATION,
  loadDataModel,
  loadNeighbors,
  submitData,
  updateRecommendation
} from './FormActionFactory'
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
    releaseRecommendationEntity,
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
      releaseRecommendationSyncId,
      staffSyncId,
      calculatedForSyncId,
      assessedBySyncId
    ] = yield all([
      call(SyncApi.getCurrentSyncId, personEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, pretrialCaseEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, riskFactorsEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, psaEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, releaseRecommendationEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, staffEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, calculatedForEntity.key.entitySetId),
      call(SyncApi.getCurrentSyncId, assessedByEntity.key.entitySetId)
    ]);
    personEntity.key.syncId = personSyncId;
    pretrialCaseEntity.key.syncId = pretrialCaseSyncId;
    riskFactorsEntity.key.syncId = riskFactorsSyncId;
    psaEntity.key.syncId = psaSyncId;
    releaseRecommendationEntity.key.syncId = releaseRecommendationSyncId;
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
      { src: releaseRecommendationEntity.key },
      { dst: personEntity.key }
    );

    const recommendationToRiskFactorsAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: releaseRecommendationEntity.key },
      { dst: riskFactorsEntity.key }
    );

    const recommendationToScoresAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: releaseRecommendationEntity.key },
      { dst: psaEntity.key }
    );

    const recommendationToCaseAssociation = Object.assign(
      {},
      calculatedForEntity,
      { src: releaseRecommendationEntity.key },
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

    const releaseRecommendationToStaffAssociation = Object.assign(
      {},
      assessedByEntity,
      { src: releaseRecommendationEntity.key },
      { dst: staffEntity.key }
    );

    const entities = [
      personEntity,
      riskFactorsEntity,
      psaEntity,
      releaseRecommendationEntity,
      staffEntity
    ];

    const associations = [
      psaToPersonAssociation,
      psaToRiskFactorsAssociation,
      riskFactorsToPersonAssociation,
      recommendationToPersonAssociation,
      recommendationToRiskFactorsAssociation,
      recommendationToScoresAssociation,
      recommendationToCaseAssociation,
      psaToStaffAssociation,
      riskFactorsToStaffAssociation,
      releaseRecommendationToStaffAssociation
    ];

    if (Object.keys(pretrialCaseEntity.details).length) {
      entities.push(pretrialCaseEntity);
      associations.push(psaToPretrialCaseAssociation);
      associations.push(riskFactorsToPretrialCaseAssociation);
    }


    const syncTickets = yield all([
      call(DataApi.acquireSyncTicket, personEntity.key.entitySetId, personSyncId),
      call(DataApi.acquireSyncTicket, pretrialCaseEntity.key.entitySetId, pretrialCaseSyncId),
      call(DataApi.acquireSyncTicket, riskFactorsEntity.key.entitySetId, riskFactorsSyncId),
      call(DataApi.acquireSyncTicket, psaEntity.key.entitySetId, psaSyncId),
      call(DataApi.acquireSyncTicket, releaseRecommendationEntity.key.entitySetId, releaseRecommendationSyncId),
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

function* updateReleaseRecommendationWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    recommendation,
    entityId,
    entitySetId,
    propertyTypes
  } = action.value;

  try {
    yield put(updateRecommendation.request(action.id));
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
      entity[fqnToId[PROPERTY_TYPES.RELEASE_RECOMMENDATION]] = [recommendation];
      yield call(DataApi.replaceEntityInEntitySet, entitySetId, result.id[0], entity);
      yield put(updateRecommendation.success(action.id));
    }
  }
  catch (error) {
    console.error(error);
    yield put(updateRecommendation.failure(action.id));
  }
  finally {
    yield put(updateRecommendation.finally(action.id));
  }
}

function* updateReleaseRecommendationWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_RECOMMENDATION, updateReleaseRecommendationWorker);
}


export {
  loadDataModelWatcher,
  loadNeighborsWatcher,
  submitDataWatcher,
  updateReleaseRecommendationWatcher
};
