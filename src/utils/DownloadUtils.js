/*
 * @flow
 */
import {
  fromJS,
  List,
  Map,
  OrderedMap,
  Set
} from 'immutable';

import PSA_CONFIG from './downloads/PSAConfig';
import { formatDateTime, formatDate } from './FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { getEntityProperties } from './DataUtils';
import DOWNLOAD_HEADERS from './downloads/DownloadHeaders';

const {
  CHARGES,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  PRETRIAL_CASES,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  RCM_RISK_FACTORS,
  RELEASE_CONDITIONS
} = APP_TYPES;

const LIST_APP_TYPES = [
  CHARGES,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  PRETRIAL_CASES,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
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
  [RCM_BOOKING_CONDITIONS]: 'BOOKING RELEASE CONDITIONS',
  [RCM_COURT_CONDITIONS]: 'COURT RELEASE CONDITIONS',
  [RELEASE_CONDITIONS]: 'RELEASE_CONDITIONS'
};

const getFormattedProperty = (neighbor :Map, propertyType :string) => {
  let { [propertyType]: property } = getEntityProperties(neighbor, [propertyType]);
  if (DATETIME_PROPERTY_TYPES.includes(propertyType)) property = formatDateTime(property);
  if (DATE_PROPERTY_TYPES.includes(propertyType)) property = formatDate(property);
  return property;
};

const hasMaxLevelIncrease = (combinedEntity :Map) => {
  const nvca = combinedEntity.get('NVCA', List()).first();
  const extradited = combinedEntity.get('EXTRADITED', List()).first();
  const step2Charges = combinedEntity.get('MAX INCREASE CHARGES', List()).first();
  const currentViolentOffense = combinedEntity.get('Q2', List()).first();
  return fromJS([!!(extradited || step2Charges || (nvca && currentViolentOffense))]);
};

const hasSingleLevelIncrease = (combinedEntity :Map) => {
  const nvca = combinedEntity.get('NVCA', List()).first();
  const step4Charges = combinedEntity.get('SINGLE INCREASE CHARGES', List()).first();
  const currentViolentOffense = combinedEntity.get('Q2', List()).first();
  return fromJS([!!(step4Charges || (nvca && currentViolentOffense))]);
};

export const rowHasPersonEntity = (row :Map) => !row.get(DOWNLOAD_HEADERS.FIRST_NAME, List()).isEmpty()
|| !row.get(DOWNLOAD_HEADERS.MIDDLE_NAME, List()).isEmpty()
|| !row.get(DOWNLOAD_HEADERS.LAST_NAME, List()).isEmpty();

export const getCombinedEntityObject :Map = (neighborsByAppType :Map, downloadConfig :Object) => {
  const combinedEntity = OrderedMap().withMutations((mutableMap) => {
    const config = downloadConfig || PSA_CONFIG;
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
            const propertyString = propertyMap.valueSeq().filter((value) => value.length).join('-');
            mutableMap.set(header, mutableMap.get(header, Set()).add(propertyString));
          });
        }
        else {
          mutableMap.set(header, mutableMap.get(header, Set()));
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
          else {
            mutableMap.set(header, mutableMap.get(header, Set()));
          }
        });
      }
    });

    if (config[RCM_RISK_FACTORS]) {
      const hasMaxIncrease = hasMaxLevelIncrease(mutableMap);
      mutableMap.set('MAX LEVEL INCREASE', hasMaxIncrease);
      const hasSingleIncrease = hasSingleLevelIncrease(mutableMap);
      mutableMap.set('SINGLE LEVEL INCREASE', hasSingleIncrease);
    }

    if (config[RCM_BOOKING_CONDITIONS] && mutableMap.get(LIST_FQN_HEADERS[RCM_BOOKING_CONDITIONS], Set()).isEmpty()) {
      mutableMap.set(LIST_FQN_HEADERS[RCM_BOOKING_CONDITIONS], Set());
    }

    if (config[RCM_COURT_CONDITIONS] && mutableMap.get(LIST_FQN_HEADERS[RCM_COURT_CONDITIONS], Set()).isEmpty()) {
      mutableMap.set(LIST_FQN_HEADERS[RCM_COURT_CONDITIONS], Set());
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
