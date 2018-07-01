import { PROPERTY_TYPES } from './DataModelConsts';

export const OUTCOMES = {
  ACCEPTED: 'Judge accepted PSA recommendation',
  INCREASED: 'Judge increased PSA recommendation',
  DECREASED: 'Judge decreased PSA recommendation',
  OTHER: 'Other'
};

export const RELEASES = {
  HELD: 'Defendant is to be held in custody',
  RELEASED: 'Defendant is to be released on bond'
};

export const BOND_TYPES = {
  PR: 'PR',
  CASH_ONLY: 'Cash Only',
  CASH_SURETY: 'Cash/Surety',
  REINSTATE: 'Reinstate'
};

export const CONDITION_LIST = {
  C_247: '24/7 Project',
  CHECKINS: 'Check-in'
};

export const CHECKIN_FREQUENCIES = {
  ONCE_MONTH: '1/month',
  TWICE_MONTH: '2/month',
  WEEKLY: 'Weekly',
  AT_LEAST_WEEKLY: 'At least weekly'
};

export const C_247_TYPES = {
  SCRAM: 'SCRAM bracelet (if available)',
  PBT: 'PBTs twice daily',
  DRUG_PATCH: 'Drug Patch',
  UA_3X: 'UA 3x per week (Mon., Thurs. & Sat.)',
  UA_2X: 'UA 2x per week (Tues. & Fri.)',
  UA_1X: 'UA 1x per week (Wed.)'
};

export const C_247_LABEL = '24/7 Project (Must sign 24/7 Project agreement and comply with all terms and conditions)';

export const C_247_MAPPINGS = {
  [C_247_TYPES.SCRAM]: {
    [PROPERTY_TYPES.PLAN_TYPE]: 'SCRAM bracelet (if available)'
  },
  [C_247_TYPES.PBT]: {
    [PROPERTY_TYPES.PLAN_TYPE]: 'PBTs',
    [PROPERTY_TYPES.FREQUENCY]: 'twice daily'
  },
  [C_247_TYPES.DRUG_PATCH]: {
    [PROPERTY_TYPES.PLAN_TYPE]: 'Drug Patch'
  },
  [C_247_TYPES.UA_3X]: {
    [PROPERTY_TYPES.PLAN_TYPE]: 'UA',
    [PROPERTY_TYPES.FREQUENCY]: '3x per week (Mon., Thurs. & Sat.)'
  },
  [C_247_TYPES.UA_2X]: {
    [PROPERTY_TYPES.PLAN_TYPE]: 'UA',
    [PROPERTY_TYPES.FREQUENCY]: '2x per week (Tues. & Fri.)'
  },
  [C_247_TYPES.UA_1X]: {
    [PROPERTY_TYPES.PLAN_TYPE]: 'UA',
    [PROPERTY_TYPES.FREQUENCY]: '1x per week (Wed.)'
  }
};
