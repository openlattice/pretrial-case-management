/*
* @flow
*/

import { DateTime } from 'luxon';
import { isImmutable, Map, fromJS } from 'immutable';
import { Constants } from 'lattice';

import federalHolidays from './consts/FederalHolidays';
import { formatDate, formatTime } from './FormattingUtils';
import { PROPERTY_TYPES, SEARCH_PREFIX } from './consts/DataModelConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from './consts/FrontEndStateConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const LAST_WRITE_FQN = 'openlattice.@lastWrite';

export const getFirstNeighborValue = (neighborObj, fqn, defaultValue = '') => neighborObj.getIn(
  [PSA_NEIGHBOR.DETAILS, fqn, 0],
  neighborObj.getIn([fqn, 0], neighborObj.get(fqn, defaultValue))
);

// Pass entity object and list of property types and will return and object of labels
// mapped to properties.
export const getEntityProperties = (entityObj, propertyList) => {
  let returnPropertyFields = Map();
  if (propertyList.length) {
    propertyList.forEach((propertyType) => {
      const backUpValue = entityObj.get(propertyType, '');
      const property = getFirstNeighborValue(entityObj, propertyType, backUpValue);
      returnPropertyFields = returnPropertyFields.set(propertyType, property);
    });
  }
  return returnPropertyFields.toJS();
};

export const sortCourtrooms = (str1, str2) => {
  return str1 > str2 ? 1 : -1;
};

export const stripIdField = (entity) => {
  if (isImmutable(entity)) {
    return entity.get(PSA_NEIGHBOR.DETAILS, entity).delete(OPENLATTICE_ID_FQN).delete('id');
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
  const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(entity, [ENTITY_KEY_ID]);
  return entityKeyId;
};

export const getIdOrValue = (neighbors :Map<*, *>, entitySetName :string, optionalFQN :?string) :string => {
  const fqn = optionalFQN || PROPERTY_TYPES.GENERAL_ID;
  return neighbors.getIn([entitySetName, PSA_NEIGHBOR.DETAILS, fqn, 0], '');
};
export const getTimeStamp = (neighbors :Map<*, *>, entitySetName :string) :string => (
  neighbors.getIn([entitySetName, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.TIMESTAMP], Map())
);
export const getNeighborDetailsForEntitySet = (neighbors :Map<*, *>, name :string, defaultValue = Map()) :string => (
  neighbors.getIn([name, PSA_NEIGHBOR.DETAILS], neighbors.get(PSA_NEIGHBOR.DETAILS, defaultValue))
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
  DateTime.fromISO(d1.getIn([fqn, 0], '')) < (DateTime.fromISO(d2.getIn([fqn, 0], ''))) ? 1 : -1
);

const BASE_UUID_PATTERN :RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

export const isUUID = uuid => (BASE_UUID_PATTERN).test(uuid);

const dateOnWeekend = date => date.weekday === 6 || date.weekday === 7;
const dateOnHoliday = date => federalHolidays.includes(date.toISODate());

export function addWeekdays(date, days) {
  let newDate = DateTime.fromISO(date).plus({ days });
  let onWeekend = dateOnWeekend(newDate);
  let onHoliday = dateOnHoliday(newDate);

  while (onWeekend || onHoliday) {
    newDate = newDate.plus({ days: 1 });
    onWeekend = dateOnWeekend(newDate);
    onHoliday = dateOnHoliday(newDate);
  }
  return newDate;
}

export const getDateAndTime = (dateTime) => {
  const date = formatDate(dateTime);
  const time = formatTime(dateTime);

  return { date, time };
};

export const createIdObject = (entityKeyId, entitySetId) => ({ entityKeyId, entitySetId });

export const getCreateAssociationObject = ({
  associationEntity,
  srcEntitySetId,
  srcEntityKeyId,
  dstEntitySetId,
  dstEntityKeyId
}) => (
  {
    data: associationEntity,
    src: {
      entitySetId: srcEntitySetId,
      entityKeyId: srcEntityKeyId
    },
    dst: {
      entitySetId: dstEntitySetId,
      entityKeyId: dstEntityKeyId
    }
  }
);

export const getSearchTerm = (propertyTypeId, searchString) => `${SEARCH_PREFIX}.${propertyTypeId}:"${searchString}"`;

export const getSearchTermNotExact = (propertyTypeId, searchString) => `${SEARCH_PREFIX}.${propertyTypeId}:${searchString}`;
