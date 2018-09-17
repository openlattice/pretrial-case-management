/*
* @flow
*/

import Immutable, { isImmutable } from 'immutable';
import { Constants } from 'lattice';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';

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
  neighbors.getIn([name, PSA_NEIGHBOR.ENTITY_SET, 'id'], '');

export const getEntityKeyId = (neighbors :Immutable.Map<*, *>, name :string) :string =>
  neighbors.getIn([name, PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');

export const getIdValue = (neighbors :Immutable.Map<*, *>, name :string, optionalFQN :?string) :string => {
  const fqn = optionalFQN || PROPERTY_TYPES.GENERAL_ID;
  return neighbors.getIn([name, PSA_NEIGHBOR.DETAILS, fqn, 0], '');
};

export const getFilteredNeighbor = neighborObj => Object.assign({}, ...[
  'associationEntitySet',
  'associationDetails',
  'neighborEntitySet',
  'neighborDetails'
].map(key => ({ [key]: neighborObj[key] })));

export const getFilteredNeighborsById = (neighborValues) => {
  let neighborsById = Immutable.Map();
  Object.keys(neighborValues).forEach((id) => {
    neighborsById = neighborsById.set(id, Immutable.fromJS(neighborValues[id].map(getFilteredNeighbor)));
  });

  return neighborsById;
};
