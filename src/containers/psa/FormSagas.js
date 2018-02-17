/*
 * @flow
 */

import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, take, all } from 'redux-saga/effects';

import * as FormActionFactory from './FormActionFactory';
import * as FormActionTypes from './FormActionTypes';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

export function* loadDataModels() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_DATA_MODEL_REQUEST);
    try {
      const entitySetIds = yield all(Object.values(ENTITY_SETS).map(entitySetName =>
        call(EntityDataModelApi.getEntitySetId, entitySetName)));
      const selectors = entitySetIds.map(id => ({
        id,
        type: 'EntitySet',
        include: ['EntitySet', 'EntityType', 'PropertyTypeInEntitySet']
      }));
      const dataModel = yield call(EntityDataModelApi.getEntityDataModelProjection, selectors);
      yield put(FormActionFactory.loadDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadDataModelFailure(error));
    }
  }
}

export function* searchPeople() :Generator<*, *, *> {
  while (true) {
    const { entitySetId, searchOptions } = yield take(FormActionTypes.SEARCH_PEOPLE_REQUEST);
    try {
      const results = yield call(SearchApi.advancedSearchEntitySetData, entitySetId, searchOptions);
      yield put(FormActionFactory.searchPeopleSuccess(results.hits));
    }
    catch (error) {
      yield put(FormActionFactory.searchPeopleFailure());
    }
  }
}

export function* loadNeighbors() :Generator<*, *, *> {
  while (true) {
    const { entitySetId, rowId } = yield take(FormActionTypes.LOAD_NEIGHBORS_REQUEST);
    try {
      const neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, rowId);
      yield put(FormActionFactory.loadNeighborsSuccess(neighbors));
    }
    catch (error) {
      yield put(FormActionFactory.loadNeighborsFailure());
    }
  }
}

export function* submitData() :Generator<*, *, *> {

  while (true) {

    const {
      personEntity,
      pretrialCaseEntity,
      riskFactorsEntity,
      psaEntity,
      releaseRecommendationEntity,
      staffEntity,
      calculatedForEntity,
      assessedByEntity
    } = yield take(FormActionTypes.SUBMIT_DATA_REQUEST);

    try {
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
        pretrialCaseEntity,
        riskFactorsEntity,
        psaEntity,
        releaseRecommendationEntity,
        staffEntity
      ];
      const associations = [
        psaToPersonAssociation,
        psaToPretrialCaseAssociation,
        psaToRiskFactorsAssociation,
        riskFactorsToPersonAssociation,
        riskFactorsToPretrialCaseAssociation,
        recommendationToPersonAssociation,
        recommendationToRiskFactorsAssociation,
        recommendationToScoresAssociation,
        recommendationToCaseAssociation,
        psaToStaffAssociation,
        riskFactorsToStaffAssociation,
        releaseRecommendationToStaffAssociation
      ];

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
      yield put(FormActionFactory.submitDataSuccess());
    }
    catch (error) {
      yield put(FormActionFactory.submitDataFailure());
    }
  }
}

export function* updateReleaseRecommendation() :Generator<*, *, *> {
  while (true) {
    const {
      recommendation,
      entityId,
      entitySetId,
      propertyTypes
    } = yield take(FormActionTypes.UPDATE_RECOMMENDATION_REQUEST);

    try {
      const fqnToId = {};
      propertyTypes.forEach((propertyType) => {
        const fqn = `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`;
        fqnToId[fqn] = propertyType.get('id');
      });
      const searchOptions = {
        start: 0,
        maxHits: 1,
        searchTerm: `${fqnToId[PROPERTY_TYPES.GENERAL_ID_FQN]}:"${entityId}"`
      }
      const response = yield call(SearchApi.searchEntitySetData, entitySetId, searchOptions);
      const result = response.hits[0];
      if (result) {
        const entity = {};
        Object.keys(result).forEach((fqn) => {
          const propertyTypeId = fqnToId[fqn];
          if (propertyTypeId) entity[propertyTypeId] = result[fqn];
        })
        entity[fqnToId[PROPERTY_TYPES.RELEASE_RECOMMENDATION_FQN]] = [recommendation];
        yield call(DataApi.replaceEntityInEntitySet, entitySetId, result.id[0], entity);
        yield put(FormActionFactory.updateRecommendationSuccess());
      }
    }
    catch (error) {
      console.error(error);
      yield put(FormActionFactory.updateRecommendationFailure());
    }
  }
}
