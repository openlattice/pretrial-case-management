/*
 * @flow
 */

import { APP_TYPES_FQNS, PROPERTY_TYPES } from './DataModelConsts';

const {
  ASSESSED_BY,
  DMF_RESULTS,
  PEOPLE,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS,
  STAFF
} = APP_TYPES_FQNS;


const assessedByFqn :string = ASSESSED_BY.toString();
const dmfResultsFqn :string = DMF_RESULTS.toString();
const releastRecommendationsFqn :string = RELEASE_RECOMMENDATIONS.toString();
const peopleFqn :string = PEOPLE.toString();
const psaRiskFactorsFqn :string = PSA_RISK_FACTORS.toString();
const psaScoresFqn :string = PSA_SCORES.toString();
const staffFqn :string = STAFF.toString();

export const SUMMARY_REPORT = {
  [peopleFqn]: {
    [PROPERTY_TYPES.LAST_NAME]: 'Last Name',
    [PROPERTY_TYPES.FIRST_NAME]: 'First Name',
    [PROPERTY_TYPES.DOB]: 'Date of Birth'
  },
  [staffFqn]: {
    [PROPERTY_TYPES.PERSON_ID]: 'Completed By'
  },
  [assessedByFqn]: {
    [PROPERTY_TYPES.COMPLETED_DATE_TIME]: 'Creation Date'
  },
  [psaScoresFqn]: {
    [PROPERTY_TYPES.NVCA_FLAG]: 'NVCA',
    [PROPERTY_TYPES.NCA_SCALE]: 'NCA',
    [PROPERTY_TYPES.FTA_SCALE]: 'FTA'
  },
  [dmfResultsFqn]: {
    S2: 'S2',
    S4: 'S4',
    [PROPERTY_TYPES.COLOR]: 'RCM Color',
    [PROPERTY_TYPES.CONDITION_1]: 'Condition 1',
    [PROPERTY_TYPES.CONDITION_2]: 'Condition 2',
    [PROPERTY_TYPES.CONDITION_3]: 'Condition 3'
  }
};

export const PSA_RESPONSE_TABLE = {
  [peopleFqn]: {
    [PROPERTY_TYPES.LAST_NAME]: 'Last Name',
    [PROPERTY_TYPES.FIRST_NAME]: 'First Name',
    [PROPERTY_TYPES.DOB]: 'Date of Birth'
  },
  [psaRiskFactorsFqn]: {
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
  [releastRecommendationsFqn]: {
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
