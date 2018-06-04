import { ENTITY_SETS, PROPERTY_TYPES } from './DataModelConsts';

export const SUMMARY_REPORT = {
  [ENTITY_SETS.PEOPLE]: {
    [PROPERTY_TYPES.LAST_NAME]: 'Last Name',
    [PROPERTY_TYPES.FIRST_NAME]: 'First Name',
    [PROPERTY_TYPES.MIDDLE_NAME]: 'Middle Name',
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
    [PROPERTY_TYPES.RELEASE_TYPE]: 'Final PSA Recommendation',
    [PROPERTY_TYPES.CONDITION_1]: 'Condition 1',
    [PROPERTY_TYPES.CONDITION_2]: 'Condition 2',
    [PROPERTY_TYPES.CONDITION_3]: 'Condition 3'
  }
};

export const DOMAIN = {
  MINNEHAHA: '@minnehahacounty.org',
  PENNINGTON: '@pennco.org'
};
