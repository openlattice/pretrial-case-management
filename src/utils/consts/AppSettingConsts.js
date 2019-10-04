import { CONTEXT } from './Consts';

export const CASE_CONTEXTS = {
  ARREST: 'arrest',
  COURT: 'court'
};

export const CONTEXTS = {
  COURT: 'court',
  BOOKING: 'booking'
};

export const CONTEXT_OPTIONS = [
  {
    label: CONTEXT.COURT,
    value: CONTEXTS.COURT
  },
  {
    label: CONTEXT.BOOKING,
    value: CONTEXTS.BOOKING
  }
];

export const MODULE = {
  PSA: 'psa',
  PRETRIAL: 'pretrial',
};

export const RCM = {
  CONDITIONS: 'conditions',
  MATRIX: 'matrix',
  LEVELS: 'levels',
};

export const RCM_DATA = {
  ACTIVE: 'active',
  LEVEL: 'level',
  DESCRIPTION: 'description',
  COLOR: 'color',
  BOOKING_HOLD: 'bookingHold',
  BOOKING_HOLD_EXCEPTION: 'bookingHoldException',
  BOOKING_RELEASE_EXCEPTION: 'bookingReleaseException',
  RELEASE_TYPE: 'releaseType'
};

export const BOOKING_LABELS = {
  HOLD: 'Hold pending judicial review',
  RELEASE: 'PR - Release'
};

export const SETTINGS = {
  ARRESTS_INTEGRATED: 'arrestsIntegrated',
  COURT_CASES_INTEGRATED: 'courtCasesIntegrated',
  CASE_CONTEXTS: 'caseContexts',
  CONTEXTS: 'contexts',
  COURT_REMINDERS: 'courtRemindersEnabled',
  ENROLL_VOICE: 'enrollVoice',
  LOAD_CASES: 'loadCasesOnTheFly',
  MODULES: 'modules',
  PREFERRED_COUNTY: 'preferredCountyEntityKeyId',
  RCM: 'rcm',
  STEP_INCREASES: 'includeStepIncreases',
  SECONDARY_BOOKING_CHARGES: 'includeSecondaryBookingCharges'
};
