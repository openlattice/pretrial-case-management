/*
 * @flow
 */
import { Map } from 'immutable';

import { EDM } from '../utils/consts/FrontEndStateConsts';

export const getPropertyTypeId :string = (edm :Map, fqn :string) => edm.getIn([
  EDM.FQN_TO_ID,
  fqn
]);


export const getMapFromEntityKeysToPropertyKeys = (entity :Object, entityKeyId :string, edm :Map) => {
  let entityObject = Map();
  Object.keys(entity).forEach((key) => {
    const propertyTypeKeyId = getPropertyTypeId(edm, key);
    const property = entity[key] ? [entity[key]] : [];
    if (property.length) entityObject = entityObject.setIn([entityKeyId, propertyTypeKeyId], property);
  });
  return entityObject;
};

export const getPropertyIdToValueMap = (entity :Object, edm :Map) => {
  const entityObject = {};
  Object.keys(entity).forEach((key) => {
    const propertyTypeKeyId = getPropertyTypeId(edm, key);
    if (entity[key]) {
      const isAnArray = Array.isArray(entity[key]);
      const value = entity[key];
      const property = isAnArray ? value : [value];
      entityObject[propertyTypeKeyId] = property;
    }
  });
  return entityObject;
};
