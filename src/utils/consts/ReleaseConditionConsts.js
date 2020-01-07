import { PROPERTY_TYPES } from './DataModelConsts';

export const OUTCOMES = {
  ACCEPTED: 'Judge accepted PSA recommendation',
  INCREASED: 'Judge increased PSA recommendation',
  DECREASED: 'Judge decreased PSA recommendation'
};

export const OTHER_OUTCOME = { OTHER_OUTCOME: 'Other' };

export const OTHER_OUTCOMES = {
  DECLINED: 'Declined',
  DISMISSED: 'Dismissed',
  FTA: 'Failure to Appear',
  RESERVE_BOND: 'Reserve Bond',
  PLEAD_GUILTY: 'Plead Guilty to All Charges'
};

export const RELEASES = {
  HELD: 'Defendant is to be held in custody',
  RELEASED: 'Defendant is to be released on bond'
};

export const WARRANTS = {
  NO_WARRANT: 'No warrant was issued',
  WARRANT: 'Warrant was issued'
};

export const BOND_TYPES = {
  PR: 'PR',
  CASH_ONLY: 'Cash Only',
  CASH_SURETY: 'Cash/Surety',
  REINSTATE: 'Reinstate',
  NO_BOND: 'No Bond'
};

export const CONDITION_LIST = {
  CONTACT_WITH_LAWYER: 'Stay in contact with your lawyer',
  MAKE_ALL_COURT_APPEARANCES: 'Make all court appearances',
  NO_WEAPONS: 'No weapons',
  NO_ALCOHOL: 'No alcohol',
  NO_DRUGS_WITHOUT_PERSCRIPTION: 'No drugs without a valid prescription',
  GOOD_BEHAVIOR: 'Good behavior',
  PRE_SENTENCE_EM: 'Pre-sentence EM',
  COMPLY: 'Comply with probation/parole',
  NO_CONTACT_WITH_MINORS: 'No contact with persons under 18 years of age',
  NO_DRIVING_WITHOUT_VALID_LICENSE: 'No driving without a valid license and insurance',
  NO_CONTACT: 'No contact order',
  CHECKINS: 'Check-in',
  C_247: '24/7 Project',
  OTHER: 'Other'
};

export const CHECKIN_FREQUENCIES = {
  ONCE_MONTH: '1/month',
  TWICE_MONTH: '2/month',
  WEEKLY: 'Weekly'
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

export const NO_CONTACT_TYPES = {
  VICTIM: 'Victim',
  VICTIM_FAMILY: 'Victim\'s family',
  WITNESS: 'Witness',
  CO_DEFENDANT: 'Co-defendant'
};
