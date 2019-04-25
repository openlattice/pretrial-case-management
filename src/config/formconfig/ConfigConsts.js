/*
 * @flow
 */

import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FORM_IDS, ID_FIELD_NAMES } from '../../utils/consts/Consts';

export const ALIASES = {
  CHARGE: 'charge',
  CHECKIN_APPOINTMENT: 'checkInAppointment',
  CONTACT_INFO: 'contactinfo',
  EMPLOYER: 'employer',
  PERSON: 'person',
  PERSON_ADDRESSES: 'personAddresses',
  STAFF: 'staff',
  PSA: 'psa',
  RISK_FACTORS: 'riskFactors',
  DMF_RISK_FACTORS: 'dmfRiskFactors',
  DMF: 'dmf',
  NOTES: 'notes',
  CASE: 'pretrialCase',
  MANUAL_CASE: 'manualPretrialCase',
  MANUAL_CHARGES: 'manualCharges',
  BOND: 'bond',
  RELEASE_CONDITION: 'releaseCondition',
  REMINDER: 'reminder',
  HEARING: 'hearing',
  OUTCOME: 'outcome',
  JUDGE: 'judge',
  SUBSCRIPTION: 'subscription',

  CONTACT_GIVEN_FOR: 'contactInfoGivenFor',
  CONTACTED_AT: 'contactedAt',
  EMPLOYED_BY: 'employedBy',
  HAS: 'has',
  INCLUDES: 'includes',
  LIVES_AT: 'livesAt',
  REPORTED: 'reported',
  TAKING: 'taking',
  USED: 'used',
  CALCULATED_FOR: 'calculatedFor',
  ASSESSED_BY: 'assessedBy',
  ASSESSED_BY_JUDGE: 'assessedByJudge',
  EDITED_BY: 'editedBy',
  CHARGED_WITH: 'chargedWith',
  APPEARS_IN: 'appearsIn',
  REGISTERED_FOR: 'registeredfor',
  REGISTERED_FOR_TWO: 'registeredfor2',
  REGISTERED_FOR_THREE: 'registeredfor3',
  APPOINTMENT_REGISTERED_FOR: 'appointmentregisteredfor'
};

export const PERSON_CONFIG = {
  alias: ALIASES.PERSON,
  name: APP_TYPES_FQNS.PEOPLE,
  fields: {
    [FORM_IDS.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
  }
};

export const STAFF_CONFIG = {
  alias: ALIASES.STAFF,
  name: APP_TYPES_FQNS.STAFF,
  fields: {
    [FORM_IDS.STAFF_ID]: PROPERTY_TYPES.PERSON_ID
  }
};

export const PSA_CONFIG = {
  alias: ALIASES.PSA,
  name: APP_TYPES_FQNS.PSA_SCORES,
  entityId: ID_FIELD_NAMES.PSA_ID,
  fields: {
    [ID_FIELD_NAMES.PSA_ID]: PROPERTY_TYPES.GENERAL_ID
  }
};

/* ASSOCIATION CONFIG */
