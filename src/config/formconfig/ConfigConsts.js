/*
 * @flow
 */

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FORM_IDS } from '../../utils/consts/Consts';

export const ALIASES = {
  CONTACT_INFO: 'contactinfo',
  EMPLOYER: 'employer',
  PERSON: 'person',
  PERSON_ADDRESSES: 'personAddresses',
  STAFF: 'staff',
  PSA: 'psa',
  RISK_FACTORS: 'riskFactors',
  NOTES: 'notes',
  CASE: 'pretrialCase',

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
  EDITED_BY: 'editedBy'
};

export const PERSON_CONFIG = {
  alias: ALIASES.PERSON,
  name: ENTITY_SETS.PEOPLE,
  fields: {
    [FORM_IDS.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
  }
};

export const STAFF_CONFIG = {
  alias: ALIASES.STAFF,
  name: ENTITY_SETS.STAFF,
  fields: {
    [FORM_IDS.STAFF_ID]: PROPERTY_TYPES.PERSON_ID
  }
};

/* ASSOCIATION CONFIG */

export const REPORTED_CONFIG = {
  alias: ALIASES.REPORTED,
  name: ENTITY_SETS.REPORTED,
  fields: {
    [FORM_IDS.TIMESTAMP]: PROPERTY_TYPES.COMPLETED_DATE_TIME
  }
};

export const TAKING_CONFIG = {
  alias: ALIASES.TAKING,
  name: ENTITY_SETS.TAKING,
  fields: {
    [FORM_IDS.TIMESTAMP]: PROPERTY_TYPES.COMPLETED_DATE_TIME
  }
};

export const USED_CONFIG = {
  alias: ALIASES.USED,
  name: ENTITY_SETS.USED,
  fields: {
    [FORM_IDS.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
  }
};

export const HAS_CONFIG = {
  alias: ALIASES.HAS,
  name: ENTITY_SETS.HAS,
  fields: {
    [FORM_IDS.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
  }
};
