/*
 * @flow
 */

import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, take, all } from 'redux-saga/effects';

import * as FormActionFactory from './FormActionFactory';
import * as FormActionTypes from './FormActionTypes';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

function* loadDataModel(entitySetName) {
  const entitySetId = yield call(EntityDataModelApi.getEntitySetId, entitySetName);
  const entitySet = yield call(EntityDataModelApi.getEntitySet, entitySetId);
  const entityType = yield call(EntityDataModelApi.getEntityType, entitySet.entityTypeId);
  const propertyTypes = yield all(entityType.properties.map((propertyTypeId) => {
    return call(EntityDataModelApi.getPropertyType, propertyTypeId);
  }));
  return { entitySet, entityType, propertyTypes };
}

export function* loadPersonDataModel() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_PERSON_DATA_MODEL_REQUEST);
    try {
      const dataModel = yield* loadDataModel(ENTITY_SETS.PEOPLE);
      yield put(FormActionFactory.loadPersonDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadPersonDataModelFailure());
    }
  }
}

export function* loadPretrialCaseDataModel() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_PRETRIAL_DATA_MODEL_REQUEST);
    try {
      const dataModel = yield* loadDataModel(ENTITY_SETS.PRETRIAL_CASES);
      yield put(FormActionFactory.loadPretrialCaseDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadPretrialCaseDataModelFailure());
    }
  }
}

export function* loadRiskFactorsDataModel() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_RISK_FACTORS_DATA_MODEL_REQUEST);
    try {
      const dataModel = yield* loadDataModel(ENTITY_SETS.PSA_RISK_FACTORS);
      yield put(FormActionFactory.loadRiskFactorsDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadRiskFactorsDataModelFailure());
    }
  }
}

export function* loadPsaDataModel() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_PSA_DATA_MODEL_REQUEST);
    try {
      const dataModel = yield* loadDataModel(ENTITY_SETS.PSA_SCORES);
      yield put(FormActionFactory.loadPsaDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadPsaDataModelFailure());
    }
  }
}

export function* loadReleaseRecommendationDataModel() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_RELEASE_RECOMMENDATION_DATA_MODEL_REQUEST);
    try {
      const dataModel = yield* loadDataModel(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      yield put(FormActionFactory.loadReleaseRecommendationDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadReleaseRecommendationDataModelFailure());
    }
  }
}

export function* loadCalculatedForDataModel() :Generator<*, *, *> {
  while (true) {
    yield take(FormActionTypes.LOAD_CALCULATED_FOR_DATA_MODEL_REQUEST);
    try {
      const dataModel = yield* loadDataModel(ENTITY_SETS.CALCULATED_FOR);
      yield put(FormActionFactory.loadCalculatedForDataModelSuccess(dataModel));
    }
    catch (error) {
      yield put(FormActionFactory.loadCalculatedForDataModelFailure());
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
      calculatedForEntity
    } = yield take(FormActionTypes.SUBMIT_DATA_REQUEST);

    try {
      const [
        personSyncId,
        pretrialCaseSyncId,
        riskFactorsSyncId,
        psaSyncId,
        releaseRecommendationSyncId,
        calculatedForSyncId
      ] = yield all([
        call(SyncApi.getCurrentSyncId, personEntity.key.entitySetId),
        call(SyncApi.getCurrentSyncId, pretrialCaseEntity.key.entitySetId),
        call(SyncApi.getCurrentSyncId, riskFactorsEntity.key.entitySetId),
        call(SyncApi.getCurrentSyncId, psaEntity.key.entitySetId),
        call(SyncApi.getCurrentSyncId, releaseRecommendationEntity.key.entitySetId),
        call(SyncApi.getCurrentSyncId, calculatedForEntity.key.entitySetId)
      ]);
      personEntity.key.syncId = personSyncId;
      pretrialCaseEntity.key.syncId = pretrialCaseSyncId;
      riskFactorsEntity.key.syncId = riskFactorsSyncId;
      psaEntity.key.syncId = psaSyncId;
      releaseRecommendationEntity.key.syncId = releaseRecommendationSyncId;
      calculatedForEntity.key.syncId = calculatedForSyncId;

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

      const entities = [personEntity, pretrialCaseEntity, riskFactorsEntity, psaEntity, releaseRecommendationEntity];
      const associations = [
        psaToPersonAssociation,
        psaToPretrialCaseAssociation,
        psaToRiskFactorsAssociation,
        riskFactorsToPersonAssociation,
        riskFactorsToPretrialCaseAssociation,
        recommendationToPersonAssociation,
        recommendationToRiskFactorsAssociation,
        recommendationToScoresAssociation,
        recommendationToCaseAssociation
      ];

      const syncTickets = yield all([
        call(DataApi.acquireSyncTicket, personEntity.key.entitySetId, personSyncId),
        call(DataApi.acquireSyncTicket, pretrialCaseEntity.key.entitySetId, pretrialCaseSyncId),
        call(DataApi.acquireSyncTicket, riskFactorsEntity.key.entitySetId, riskFactorsSyncId),
        call(DataApi.acquireSyncTicket, psaEntity.key.entitySetId, psaSyncId),
        call(DataApi.acquireSyncTicket, releaseRecommendationEntity.key.entitySetId, releaseRecommendationSyncId),
        call(DataApi.acquireSyncTicket, calculatedForEntity.key.entitySetId, calculatedForSyncId)
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
    const { recommendation, entityId, dataModel } = yield take(FormActionTypes.UPDATE_RECOMMENDATION_REQUEST);

    try {
      const entitySetId = dataModel.entitySet.id;
      const fqnToId = {};
      dataModel.propertyTypes.forEach((propertyType) => {
        fqnToId[`${propertyType.type.namespace}.${propertyType.type.name}`] = propertyType.id;
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
