/*
 * @flow
 */

import Immutable from 'immutable';
import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApi,
  DataIntegrationApi,
  EntityDataModelApi,
  EntitySetsApi,
  Models,
  Types
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { APP_DATA } from '../consts/redux/AppConsts';
import { stripIdField } from '../DataUtils';
import {
  CREATE_ASSOCIATIONS,
  REPLACE_ASSOCIATION,
  REPLACE_ENTITY,
  SUBMIT,
  createAssociations,
  replaceAssociation,
  replaceEntity,
  submit
} from './SubmitActionFactory';

const {
  FullyQualifiedName
} = Models;

const { DeleteTypes } = Types;

/*
 * Selectors
 */

function getEntityId(primaryKey, propertyTypesById, values, fields) {
  const fieldNamesByFqn = {};
  Object.keys(fields).forEach((field) => {
    const fqn = fields[field];
    fieldNamesByFqn[fqn] = field;
  });
  const pKeyVals = [];
  primaryKey.forEach((pKey) => {
    const propertyTypeFqn = new FullyQualifiedName(propertyTypesById[pKey].type).getFullyQualifiedName();
    const fieldName = fieldNamesByFqn[propertyTypeFqn];
    const value = values[fieldName];
    const rawValues = [value] || [];
    const encodedValues = [];
    rawValues.forEach((rawValue) => {
      encodedValues.push(btoa(rawValue));
    });
    pKeyVals.push(btoa(encodeURI(encodedValues.join(','))));
  });
  return pKeyVals.join(',');
}

function getFormattedValue(value) {
  const valueIsDefined = v => v !== null && v !== undefined && v !== '';

  /* Value is already formatted as an array -- we should filter for undefined values */
  if (value instanceof Array) {
    return value.filter(valueIsDefined);
  }

  /* Value must be converted to an array if it is defined */
  return valueIsDefined(value) ? [value] : [];
}

function getEntityDetails(entityDescription, propertyTypesByFqn, values) {
  const { fields } = entityDescription;
  const entityDetails = {};
  Object.keys(fields).forEach((field) => {
    const fqn = fields[field];
    const propertyTypeId = propertyTypesByFqn[fqn].id;
    const formattedArrayValue = getFormattedValue(values[field]);
    if (formattedArrayValue.length) {
      entityDetails[propertyTypeId] = formattedArrayValue;
    }
  });
  return entityDetails;
}

function shouldCreateEntity(entityDescription, values, details) {
  if (!Object.keys(details).length) return false;
  if (entityDescription.ignoreIfFalse) {
    let allFalse = true;
    entityDescription.ignoreIfFalse.forEach((field) => {
      if (values[field]) allFalse = false;
    });
    if (allFalse) return false;
  }
  return true;
}


function* createAssociationsWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    associationObjects,
    callback
  } = action.value;

  try {
    yield put(createAssociations.request(action.id));

    // Create new association
    const associationCalls = associationObjects.map(submitObject => (
      call(
        DataApi.createAssociations,
        submitObject
      )
    ));

    yield all(associationCalls);

    yield put(createAssociations.success(action.id));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    console.error(error);
    yield put(createAssociations.failure(action.id, { error }));
  }
  finally {
    yield put(createAssociations.finally(action.id));
  }
}

function* createAssociationsWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_ASSOCIATIONS, createAssociationsWorker);
}

function* replaceEntityWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(replaceEntity.request(action.id));
    const {
      entityKeyId,
      entitySetName,
      values,
      callback
    } = action.value;
    let { entitySetId } = action.value;

    if (!entitySetId) entitySetId = yield call(EntitySetsApi.getEntitySetId, entitySetName);
    yield call(DataApi.replaceEntityInEntitySetUsingFqns, entitySetId, entityKeyId, stripIdField(values));

    yield put(replaceEntity.success(action.id));
    if (callback) {
      callback();
    }
  }
  catch (error) {
    console.error(error);
    yield put(replaceEntity.failure(action.id, error));
  }
  finally {
    yield put(replaceEntity.finally(action.id));
  }
}

function* replaceEntityWatcher() :Generator<*, *, *> {
  yield takeEvery(REPLACE_ENTITY, replaceEntityWorker);
}

function* submitWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    app,
    config,
    values,
    callback
  } = action.value;
  try {
    yield put(submit.request(action.id));
    let allEntitySetIds;
    // TODO: Yuck! Will refactor how we collect entitySetIds once we have appTypes for each Entity Set
    if (app) {
      const selectedOrganizationId = app.get(APP_DATA.SELECTED_ORG_ID);
      allEntitySetIds = config.entitySets.map(({ name }) => app.getIn([
        name,
        'entitySetsByOrganization',
        selectedOrganizationId
      ]));
    }
    else {
      const allEntitySetIdsRequest = config.entitySets.map(entitySet => (
        call(EntitySetsApi.getEntitySetId, entitySet.name)
      ));
      allEntitySetIds = yield all(allEntitySetIdsRequest);
    }
    const edmDetailsRequest = allEntitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: [
        'EntitySet',
        'EntityType',
        'PropertyTypeInEntitySet'
      ]
    }));
    const edmDetails = yield call(EntityDataModelApi.getEntityDataModelProjection, edmDetailsRequest);

    const propertyTypesByFqn = {};
    Object.values(edmDetails.propertyTypes).forEach((propertyType) => {
      const fqn = new FullyQualifiedName(propertyType.type).getFullyQualifiedName();
      propertyTypesByFqn[fqn] = propertyType;
    });

    const mappedEntities = {};
    const multipleValuesMap = {};
    const multipleValueAssociationAliasNames = [];
    config.entitySets.forEach((entityDescription, index) => {
      const entitySetId = allEntitySetIds[index];
      const primaryKey = edmDetails.entityTypes[edmDetails.entitySets[entitySetId].entityTypeId].key;
      let entityList;
      const { multipleValuesEntity, multipleValuesField } = entityDescription;
      if (multipleValuesField) {
        entityList = values[entityDescription.multipleValuesField];
      }
      else if (multipleValuesEntity) {
        entityList = values[entityDescription.multipleValuesEntity];
        multipleValueAssociationAliasNames.push(entityDescription.alias);
      }
      else {
        entityList = [values];
      }
      if (entityList) {
        const entitiesForAlias = [];
        entityList.forEach((entityValues, idx) => {
          const details = getEntityDetails(entityDescription, propertyTypesByFqn, entityValues);
          if (shouldCreateEntity(entityDescription, entityValues, details)) {
            let entityId;
            if (entityDescription.entityId) {
              let entityIdVal = entityValues[entityDescription.entityId];
              if (entityIdVal instanceof Array && entityIdVal.length) {
                [entityIdVal] = entityIdVal;
              }
              entityId = entityIdVal;
            }
            else {
              entityId = getEntityId(primaryKey, edmDetails.propertyTypes, entityValues, entityDescription.fields);
            }
            if (entityId && entityId.length) {
              const key = {
                entitySetId,
                entityId
              };
              const entity = {
                key,
                details
              };
              entitiesForAlias.push(entity);
              if (multipleValuesEntity) {
                multipleValuesMap[multipleValuesEntity] = multipleValuesMap[multipleValuesEntity] || [];
                multipleValuesMap[multipleValuesEntity][idx] = multipleValuesMap[multipleValuesEntity][idx] || {};
                multipleValuesMap[multipleValuesEntity][idx][entityDescription.alias] = entity;
              }
              if (multipleValuesField) {
                multipleValuesMap[multipleValuesField] = multipleValuesMap[multipleValuesField] || [];
                multipleValuesMap[multipleValuesField][idx] = multipleValuesMap[multipleValuesField][idx] || {};
                multipleValuesMap[multipleValuesField][idx][entityDescription.alias] = entity;
              }
            }
          }
        });
        mappedEntities[entityDescription.alias] = entitiesForAlias;
      }
    });
    const associationAliases = {};
    const multipleValueAssociationAliases = {};
    config.associations.forEach((associationDescription) => {
      const { association } = associationDescription;
      if (multipleValueAssociationAliasNames.includes(association)) {
        const completeAssociation = multipleValueAssociationAliases[association] || [];
        completeAssociation.push(associationDescription);
        multipleValueAssociationAliases[association] = completeAssociation;
      }
      else {
        const completeAssociation = associationAliases[association] || [];
        completeAssociation.push(associationDescription);
        associationAliases[association] = completeAssociation;
      }
    });

    const entities = [];
    const associations = [];

    Object.entries(multipleValueAssociationAliases).forEach(([alias, associationList]) => {
      associationList.forEach((associationDescription) => {
        const { src, dst } = associationDescription;
        Object.values(multipleValuesMap).forEach((dataList) => {
          dataList.forEach((data) => {
            const associationEntity = data[alias];
            const sourceEntity = data[src];
            const destinationEntity = data[dst];
            if (associationEntity && sourceEntity) {
              const dstEntities = mappedEntities[dst];
              dstEntities.forEach((dstEntity) => {
                const srcKey = sourceEntity.key;
                const dstKey = dstEntity.key;
                if (srcKey && dstKey) {
                  const association = Object.assign({}, associationEntity, {
                    src: srcKey,
                    dst: dstKey
                  });
                  associations.push(association);
                }
              });
            }
            else if (associationEntity && destinationEntity) {
              const srcEntities = mappedEntities[dst];
              srcEntities.forEach((srcEntity) => {
                const srcKey = srcEntity.key;
                const dstKey = destinationEntity.key;
                if (srcKey && dstKey) {
                  const association = Object.assign({}, associationEntity, {
                    src: srcKey,
                    dst: dstKey
                  });
                  associations.push(association);
                }
              });
            }
          });
        });
      });
    });

    Object.keys(mappedEntities).forEach((alias) => {
      if (associationAliases[alias]) {
        mappedEntities[alias].forEach((associationEntityDescription) => {

          const associationDescriptions = associationAliases[alias];

          associationDescriptions.forEach((associationDescription) => {
            const { src, dst } = associationDescription;
            const srcEntities = mappedEntities[src];
            const dstEntities = mappedEntities[dst];

            srcEntities.forEach((srcEntity) => {
              dstEntities.forEach((dstEntity) => {

                const srcKey = srcEntity.key;
                const dstKey = dstEntity.key;
                if (srcKey && dstKey) {
                  const association = Object.assign({}, associationEntityDescription, {
                    src: srcKey,
                    dst: dstKey
                  });
                  associations.push(association);
                }
              });
            });
          });
        });
      }
      else if (!multipleValueAssociationAliases[alias]) {
        mappedEntities[alias].forEach((entity) => {
          entities.push(entity);
        });
      }
    });

    yield call(DataIntegrationApi.createEntityAndAssociationData, { entities, associations });
    yield put(submit.success(action.id));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    console.error(error);
    yield put(submit.failure(action.id, error));
  }
  finally {
    yield put(submit.finally(action.id));
  }
}

function* submitWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT, submitWorker);
}


const getMapFromPropertyIdsToValues = (entity, propertyTypesByFqn) => {
  let entityObject = Immutable.Map();
  Object.keys(entity).forEach((key) => {
    const propertyTypeKeyId = propertyTypesByFqn[key].id;
    const property = entity[key] ? [entity[key]] : [];
    entityObject = entityObject.set(propertyTypeKeyId, property);
  });
  return entityObject;
};

function* replaceAssociationWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    associationEntity,
    associationEntitySetName,
    associationEntityKeyId,
    srcEntitySetName,
    srcEntityKeyId,
    dstEntitySetName,
    dstEntityKeyId,
    callback
  } = action.value;

  let {
    associationEntitySetId,
    srcEntitySetId,
    dstEntitySetId
  } = action.value;

  try {
    yield put(replaceAssociation.request(action.id));

    // Collect Entity Set Ids for association, src, and dst
    if (!associationEntitySetId) associationEntitySetId = yield call(EntitySetsApi.getEntitySetId, associationEntitySetName);
    if (!srcEntitySetId) srcEntitySetId = yield call(EntitySetsApi.getEntitySetId, srcEntitySetName);
    if (!dstEntitySetId) dstEntitySetId = yield call(EntitySetsApi.getEntitySetId, dstEntitySetName);

    const allEntitySetIds = [associationEntitySetId, srcEntitySetId, dstEntitySetId];

    const edmDetailsRequest = allEntitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: ['PropertyTypeInEntitySet']
    }));
    const edmDetails = yield call(EntityDataModelApi.getEntityDataModelProjection, edmDetailsRequest);

    const propertyTypesByFqn = {};
    Object.values(edmDetails.propertyTypes).forEach((propertyType) => {
      const fqn = new FullyQualifiedName(propertyType.type).getFullyQualifiedName();
      propertyTypesByFqn[fqn] = propertyType;
    });

    const associationEntityOject = getMapFromPropertyIdsToValues(
      associationEntity,
      propertyTypesByFqn
    );

    // Delete existing association
    if (associationEntityKeyId) {
      yield call(DataApi.deleteEntity, associationEntitySetId, associationEntityKeyId, DeleteTypes.Soft);
    }

    // Create new association
    yield call(
      DataApi.createAssociations,
      {
        [associationEntitySetId]: [{
          dst: {
            entitySetId: dstEntitySetId,
            entityKeyId: dstEntityKeyId
          },
          data: associationEntityOject.toJS(),
          src: {
            entitySetId: srcEntitySetId,
            entityKeyId: srcEntityKeyId
          },
        }]
      }
    );

    yield put(replaceAssociation.success(action.id));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    console.error(error);
    yield put(replaceAssociation.failure(action.id, error));
  }
  finally {
    yield put(replaceAssociation.finally(action.id));
  }
}

function* replaceAssociationWatcher() :Generator<*, *, *> {
  yield takeEvery(REPLACE_ASSOCIATION, replaceAssociationWorker);
}

export {
  createAssociationsWatcher,
  replaceAssociationWatcher,
  replaceEntityWatcher,
  submitWatcher
};
