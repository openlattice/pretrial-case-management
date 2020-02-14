/*
 * @flow
 */
import {
  List,
  Map,
  OrderedMap,
  Set
} from 'immutable';

import DOWNLOAD_CONFIG from './consts/DownloadConfig';
import { formatDateTime, formatDate } from './FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { getEntityProperties } from './DataUtils';

const {
  CHARGES,
  RCM_RISK_FACTORS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  RELEASE_CONDITIONS
} = APP_TYPES;

const LIST_APP_TYPES = [
  CHARGES,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  RELEASE_CONDITIONS
];

const DATETIME_PROPERTY_TYPES = [
  PROPERTY_TYPES.ARREST_DATE_TIME,
  PROPERTY_TYPES.COMPLETED_DATE_TIME,
  PROPERTY_TYPES.DATE_TIME,
  PROPERTY_TYPES.TIMESTAMP,
];

const DATE_PROPERTY_TYPES = [
  PROPERTY_TYPES.DOB
];

const LIST_FQN_HEADERS = {
  [CHARGES]: 'COURT CHARGES',
  [MANUAL_CHARGES]: 'ARREST CHARGES',
  [MANUAL_COURT_CHARGES]: 'MANUAL COURT CHARGES',
  [RELEASE_CONDITIONS]: 'RELEASE_CONDITIONS'
};

const getFormattedProperty = (neighbor :Map, propertyType :string) => {
  let { [propertyType]: property } = getEntityProperties(neighbor, [propertyType]);
  if (DATETIME_PROPERTY_TYPES.includes(propertyType)) property = formatDateTime(property);
  if (DATE_PROPERTY_TYPES.includes(propertyType)) property = formatDate(property);
  return property;
};

const hasMaxLevelIncrease = (combinedEntity :Map) => {
  const nvca = combinedEntity.getIn(['NVCA', 0], false);
  const extradited = combinedEntity.getIn(['EXTRADITED', 0], false);
  const step2Charges = combinedEntity.getIn(['STEP 2 CHARGES', 0], false);
  const currentViolentOffense = combinedEntity.getIn(['Q2', 0], false);
  return [!!(extradited || step2Charges || (nvca && currentViolentOffense))];
};

const hasSingleLevelIncrease = (combinedEntity :Map) => {
  const nvca = combinedEntity.getIn(['NVCA', 0], false);
  const step4Charges = combinedEntity.getIn(['STEP 4 CHARGES', 0], false);
  const currentViolentOffense = combinedEntity.getIn(['Q2', 0], false);
  return [!!(step4Charges || (nvca && currentViolentOffense))];
};


export const getCombinedEntityObject :Map = (neighborsByAppType :Map, downloadConfig :Object) => {
  const combinedEntity = OrderedMap().withMutations((mutableMap) => {
    const config = downloadConfig || DOWNLOAD_CONFIG;
    const downloadEntries :any = Object.entries(config);
    downloadEntries.forEach(([appType, mappings]) => {
      if (LIST_APP_TYPES.includes(appType)) {
        const header = LIST_FQN_HEADERS[appType];
        const neighbors = neighborsByAppType.get(appType, List());
        if (neighbors.size) {
          neighbors.forEach((neighbor) => {
            const propertyMap = Map().withMutations((mutablePropertyMap) => {
              mappings.forEach((propertyType) => {
                const property = getFormattedProperty(neighbor, propertyType);
                mutablePropertyMap.set(propertyType, property);
              });
            });
            const propertyString = propertyMap.valueSeq().join('-');
            mutableMap.set(header, mutableMap.get(header, Set()).add(propertyString));
          });
        }
      }
      else {
        const mappingEntries :any = Object.entries(mappings);
        mappingEntries.forEach(([propertyType, header]) => {
          const neighbors :List = neighborsByAppType.get(appType, List());
          if (neighbors.size) {
            neighbors.forEach((neighbor) => {
              const property = getFormattedProperty(neighbor, propertyType);
              mutableMap.set(header, mutableMap.get(header, Set()).add(property));
            });
          }
        });
      }
    });

    if (config[RCM_RISK_FACTORS]) {
      const hasMaxIncrease = hasMaxLevelIncrease(mutableMap);
      mutableMap.set('STEP 2', hasMaxIncrease);
      const hasSingleIncrease = hasSingleLevelIncrease(mutableMap);
      mutableMap.set('STEP 4', hasSingleIncrease);
    }

    const psaType = mutableMap.get('PSA TYPE', Set()).first();
    if (psaType && psaType.toLowerCase() !== 'booking') {
      mutableMap.set('BOOKING RELEASE', Set());
      mutableMap.set('BOOKING RELEASE NOTES', Set());
      mutableMap.set('BOOKING HOLD', Set());
      mutableMap.set('BOOKING HOLD NOTES', Set());
    }
  });

  return combinedEntity;
};

export default getCombinedEntityObject;
