/*
 * @flow
 */

import { APP_TYPES, PROPERTY_TYPES } from './DataModelConsts';

const {
  PEOPLE,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  RELEASE_RECOMMENDATIONS,
  STAFF
} = APP_TYPES;

export const SUMMARY_REPORT = {
  [PEOPLE]: {
    [PROPERTY_TYPES.LAST_NAME]: 'Last Name',
    [PROPERTY_TYPES.FIRST_NAME]: 'First Name',
    [PROPERTY_TYPES.DOB]: 'Date of Birth'
  },
  [STAFF]: {
    [PROPERTY_TYPES.PERSON_ID]: 'Completed By'
  },
  [PSA_SCORES]: {
    [PROPERTY_TYPES.DATE_TIME]: 'Creation Date',
    [PROPERTY_TYPES.NVCA_FLAG]: 'NVCA',
    [PROPERTY_TYPES.NCA_SCALE]: 'NCA',
    [PROPERTY_TYPES.FTA_SCALE]: 'FTA'
  },
  [RCM_RESULTS]: {
    [PROPERTY_TYPES.COLOR]: 'RCM Color',
    [PROPERTY_TYPES.CONDITION_1]: 'Condition 1',
    [PROPERTY_TYPES.CONDITION_2]: 'Condition 2',
    [PROPERTY_TYPES.CONDITION_3]: 'Condition 3'
  },
  [PSA_RISK_FACTORS]: {
    [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE]: 'Q2',
  },
  [RCM_RISK_FACTORS]: {
    [PROPERTY_TYPES.EXTRADITED]: 'EXTRADITED',
    [PROPERTY_TYPES.RCM_STEP_2_CHARGES]: 'STEP 2 CHARGES',
    [PROPERTY_TYPES.RCM_STEP_4_CHARGES]: 'STEP 4 CHARGES',
  }
};

export const PSA_RESPONSE_TABLE = {
  [PEOPLE]: {
    [PROPERTY_TYPES.LAST_NAME]: 'Last Name',
    [PROPERTY_TYPES.FIRST_NAME]: 'First Name',
    [PROPERTY_TYPES.DOB]: 'Date of Birth'
  },
  [PSA_RISK_FACTORS]: {
    [PROPERTY_TYPES.AGE_AT_CURRENT_ARREST]: 'Q1',
    [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE]: 'Q2',
    [PROPERTY_TYPES.PENDING_CHARGE]: 'Q3',
    [PROPERTY_TYPES.PRIOR_MISDEMEANOR]: 'Q4',
    [PROPERTY_TYPES.PRIOR_FELONY]: 'Q5',
    [PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION]: 'Q6',
    [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT]: 'Q7',
    [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD]: 'Q8',
    [PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION]: 'Q9'
  },
  [RELEASE_RECOMMENDATIONS]: {
    [PROPERTY_TYPES.RELEASE_RECOMMENDATION]: 'Additional Notes'
  }
};

export const DOMAIN = {
  MINNEHAHA: '@minnehahacounty.org',
  PENNINGTON: '@pennco.org'
};

export const REPORT_TYPES = {
  BY_PSA: 'psas',
  BY_HEARING: 'hearings'
};
