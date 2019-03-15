/*
* @flow
*/
import moment from 'moment';
import { isImmutable, Map, fromJS } from 'immutable';
import { Constants } from 'lattice';

import federalHolidays from './consts/FederalHolidays';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from './consts/FrontEndStateConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const LAST_WRITE_FQN = 'openlattice.@lastWrite';

export const stripIdField = (entity) => {
  if (isImmutable(entity)) {
    return entity.delete(OPENLATTICE_ID_FQN).delete('id');
  }

  const newEntity = Object.assign({}, entity);
  if (newEntity[OPENLATTICE_ID_FQN]) {
    delete newEntity[OPENLATTICE_ID_FQN];
  }
  if (newEntity[LAST_WRITE_FQN]) {
    delete newEntity[LAST_WRITE_FQN];
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

export const getEntitySetId = (neighbors :Map<*, *>, name :?string) :string => {
  const entity = name ? neighbors.getIn([name, PSA_NEIGHBOR.ENTITY_SET], Map()) : neighbors;
  return entity.get('id', '');
};

export const getEntityKeyId = (neighbors :Map<*, *>, name :?string) :string => {
  const entity = name ? neighbors.get(name, Map()) : neighbors;
  return entity.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], entity.getIn([OPENLATTICE_ID_FQN, 0], ''));
};

export const getIdOrValue = (neighbors :Map<*, *>, entitySetName :string, optionalFQN :?string) :string => {
  const fqn = optionalFQN || PROPERTY_TYPES.GENERAL_ID;
  return neighbors.getIn([entitySetName, PSA_NEIGHBOR.DETAILS, fqn, 0], '');
};
export const getTimeStamp = (neighbors :Map<*, *>, entitySetName :string) :string => (
  neighbors.getIn([entitySetName, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.TIMESTAMP], Map())
);
export const getNeighborDetailsForEntitySet = (neighbors :Map<*, *>, name :string) :string => (
  neighbors.getIn([name, PSA_NEIGHBOR.DETAILS], neighbors.get(PSA_NEIGHBOR.DETAILS, Map()))
);
export const getAssociationDetailsForEntitySet = (neighbors :Map<*, *>, name :string) :string => (
  neighbors.getIn([name, PSA_ASSOCIATION.DETAILS], neighbors.get(PSA_ASSOCIATION.DETAILS, Map()))
);

export const getFilteredNeighbor = neighborObj => Object.assign({}, ...[
  'associationEntitySet',
  'associationDetails',
  'neighborEntitySet',
  'neighborDetails'
].map(key => ({ [key]: neighborObj[key] })));

export const getFilteredNeighborsById = (neighborValues) => {
  let neighborsById = Map();
  Object.keys(neighborValues).forEach((id) => {
    neighborsById = neighborsById.set(id, fromJS(neighborValues[id].map(getFilteredNeighbor)));
  });

  return neighborsById;
};

export const sortByDate = (d1, d2, fqn) => (
  moment(d1.getIn([fqn, 0], '')).isBefore(moment(d2.getIn([fqn, 0], ''))) ? 1 : -1
);

export const isUUID = uuid => (/^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i).test(uuid);

export function addWeekdays(date, days) {
  let newDate = moment(date);
  let count = days;
  while (count > 0) {
    newDate = newDate.add(1, 'days');
    if (
      newDate.isoWeekday() !== 6
        && newDate.isoWeekday() !== 7
        && !federalHolidays.includes(newDate.format('YYYY-MM-DD'))) {
      count -= 1;
    }
  }
  return newDate;
}

export const getMapFromEntityKeysToPropertyKeys = (entity, entityKeyId, propertyTypesByFqn) => {
  let entityObject = Map();
  Object.keys(entity).forEach((key) => {
    const propertyTypeKeyId = propertyTypesByFqn[key].id;
    const property = entity[key] ? [entity[key]] : [];
    entityObject = entityObject.setIn([entityKeyId, propertyTypeKeyId], property);
  });
  return entityObject;
};

export const getFirstNeighborValue = (neighborObj, fqn, defaultValue = '') => neighborObj.getIn(
  [PSA_NEIGHBOR.DETAILS, fqn, 0],
  neighborObj.getIn([fqn, 0], defaultValue)
);
