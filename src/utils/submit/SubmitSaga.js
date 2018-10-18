/*
 * @flow
 */
import Immutable from 'immutable';
import {
  DataApi,
  DataIntegrationApi,
  EntityDataModelApi,
  Models
} from 'lattice';

import {
  call,
  put,
  takeEvery,
  all
} from 'redux-saga/effects';

import { stripIdField } from '../DataUtils';
import {
  REPLACE_ASSOCIATION,
  REPLACE_ENTITY,
  SUBMIT,
  replaceAssociation,
  replaceEntity,
  submit
} from './SubmitActionFactory';

const {
  FullyQualifiedName
} = Models;

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

function* replaceEntityWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(replaceEntity.request(action.id));
    const {
      entityKeyId,
      entitySetName,
      values,
      callback
    } = action.value;

    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, entitySetName);
    yield call(DataApi.replaceEntityInEntitySetUsingFqns, entitySetId, entityKeyId, stripIdField(values));

    yield put(replaceEntity.success(action.id));
    if (callback) {
      callback();
    }
  }
  catch (error) {
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
  const { config, values, callback } = action.value;

  try {
    yield put(submit.request(action.id));
    const allEntitySetIdsRequest = config
      .entitySets.map(entitySet => call(EntityDataModelApi.getEntitySetId, entitySet.name));
    const allEntitySetIds = yield all(allEntitySetIdsRequest);
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

    const mappedEntities = {};
    config.entitySets.forEach((entityDescription, index) => {
      const entitySetId = allEntitySetIds[index];
      const primaryKey = edmDetails.entityTypes[edmDetails.entitySets[entitySetId].entityTypeId].key;
      const entityList = (entityDescription.multipleValuesField)
        ? values[entityDescription.multipleValuesField] : [values];
      if (entityList) {
        const entitiesForAlias = [];
        entityList.forEach((entityValues) => {
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
              const entity = { key, details };
              entitiesForAlias.push(entity);
            }
          }
        });
        mappedEntities[entityDescription.alias] = entitiesForAlias;
      }
    });
    const associationAliases = {};
    config.associations.forEach((associationDescription) => {
      const { association } = associationDescription;
      const completeAssociation = associationAliases[association] || [];
      completeAssociation.push(associationDescription);
      associationAliases[association] = completeAssociation;
    });

    const entities = [];
    const associations = [];

    Object.keys(mappedEntities).forEach((alias) => {
      if (associationAliases[alias]) {
        mappedEntities[alias].forEach((associationEntityDescription) => {
          const associationDescriptions = associationAliases[alias];

          associationDescriptions.forEach((associationDescription) => {
            const { src, dst } = associationDescription;

            mappedEntities[src].forEach((srcEntity) => {
              mappedEntities[dst].forEach((dstEntity) => {

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
      else {
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

  try {
    yield put(replaceAssociation.request(action.id));

    // Collect Entity Set Ids for association, src, and dst
    const associationEntitySetId = yield call(EntityDataModelApi.getEntitySetId, associationEntitySetName);
    const srcEntitySetId = yield call(EntityDataModelApi.getEntitySetId, srcEntitySetName);
    const dstEntitySetId = yield call(EntityDataModelApi.getEntitySetId, dstEntitySetName);

    const allEntitySetIds = [associationEntitySetId, srcEntitySetId, dstEntitySetId];

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

    const associationEntityOject = getMapFromPropertyIdsToValues(
      associationEntity,
      propertyTypesByFqn
    );

    // Delete existing association
    if (associationEntityKeyId) {
      yield call(DataApi.clearEntityFromEntitySet, associationEntitySetId, associationEntityKeyId);
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
  replaceAssociationWatcher,
  replaceEntityWatcher,
  submitWatcher
};
