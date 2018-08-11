/*
* @flow
*/

import Immutable from 'immutable';

import { Constants } from 'lattice';
import { isImmutable } from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

export const stripIdField = (entity) => {
  if (isImmutable(entity)) {
    return entity.delete(OPENLATTICE_ID_FQN).delete('id');
  }

  const newEntity = Object.assign({}, entity);
  if (newEntity[OPENLATTICE_ID_FQN]) {
    delete newEntity[OPENLATTICE_ID_FQN];
  }
  if (newEntity.id) {
    delete newEntity.id;
  }
  return newEntity;
};

export const getFqnObj = (fqnStr) => {
  const splitStr = fqnStr.split('.');
  return {
    namespace: splitStr[0],
    name: splitStr[1]
  };
};

export const getEntitySetId = (neighbors :Immutable.Map<*, *>, name :string) :string =>
  neighbors.getIn([name, 'neighborEntitySet', 'id'], '');

export const getEntityKeyId = (neighbors :Immutable.Map<*, *>, name :string) :string =>
  neighbors.getIn([name, 'neighborDetails', OPENLATTICE_ID_FQN, 0], '');

export const getIdValue = (neighbors :Immutable.Map<*, *>, name :string, optionalFQN :?string) :string => {
  const fqn = optionalFQN || PROPERTY_TYPES.GENERAL_ID;
  return neighbors.getIn([name, 'neighborDetails', fqn, 0], '');
};
