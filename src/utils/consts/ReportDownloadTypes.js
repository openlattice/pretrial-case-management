import { ENTITY_SETS, PROPERTY_TYPES } from './DataModelConsts';

export const SUMMARY_REPORT = {
  [ENTITY_SETS.PEOPLE]: {
    [PROPERTY_TYPES.LAST_NAME]: 'Last Name',
    [PROPERTY_TYPES.FIRST_NAME]: 'First Name',
    [PROPERTY_TYPES.DOB]: 'Date of Birth'
  },
  [ENTITY_SETS.STAFF]: {
    [PROPERTY_TYPES.PERSON_ID]: 'Completed By'
  },
  [ENTITY_SETS.ASSESSED_BY]: {
    [PROPERTY_TYPES.COMPLETED_DATE_TIME]: 'Creation Date'
  },
  [ENTITY_SETS.PSA_SCORES]: {
    [PROPERTY_TYPES.NVCA_FLAG]: 'NVCA',
    [PROPERTY_TYPES.NCA_SCALE]: 'NCA',
    [PROPERTY_TYPES.FTA_SCALE]: 'FTA'
  },
  [ENTITY_SETS.DMF_RESULTS]: {
    S2: 'S2',
    S4: 'S4',
    [PROPERTY_TYPES.COLOR]: 'DMF Color'
  }
};

export const DOMAIN = {
  MINNEHAHA: '@minnehahacounty.org',
  PENNINGTON: '@pennco.org'
};
