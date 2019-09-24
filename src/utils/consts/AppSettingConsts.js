import { OL } from './Colors';

export const CASE_CONTEXTS = {
  ARREST: 'arrest',
  COURT: 'court'
};

export const CONTEXTS = {
  COURT: 'court',
  BOOKING: 'booking'
};

export const MODULE = {
  PSA: 'psa',
  PRETRIAL: 'pretrial',
};

export const RCM = {
  CONDITIONS: 'conditions',
  MATRIX: 'matrix',
  LEVELS: 'levels',
};

export const RELEASE_TYPES = {
  RELEASE: 'RELEASE',
  RELEASE_WITH_CONDITIONS: 'RELEASE_WITH_CONDITIONS',
  MAXIMUM_CONDITIONS: 'MAXIMUM_CONDITIONS'
};

export const RELEASE_TYPE_HEADERS = {
  [RELEASE_TYPES.RELEASE]: 'Release',
  [RELEASE_TYPES.RELEASE_WITH_CONDITIONS]: 'Release with Conditions',
  [RELEASE_TYPES.MAXIMUM_CONDITIONS]: 'Maximum conditions for any Release'
};

export const RCM_DATA = {
  ACTIVE: 'active',
  LEVEL: 'level',
  DESCRIPTION: 'description',
  COLOR: 'color',
  BOOKING_HOLD: 'bookingHold',
  RELEASE_TYPE: 'releaseType'
};

export const defaultMatrix = {
  1: {
    1: { [RCM_DATA.LEVEL]: 1 },
    2: { [RCM_DATA.LEVEL]: 1 }
  },
  2: {
    1: { [RCM_DATA.LEVEL]: 1 },
    2: { [RCM_DATA.LEVEL]: 1 },
    3: { [RCM_DATA.LEVEL]: 1 },
    4: { [RCM_DATA.LEVEL]: 1 },
    5: { [RCM_DATA.LEVEL]: 2 }
  },
  3: {
    2: { [RCM_DATA.LEVEL]: 1 },
    3: { [RCM_DATA.LEVEL]: 1 },
    4: { [RCM_DATA.LEVEL]: 1 },
    5: { [RCM_DATA.LEVEL]: 2 }
  },
  4: {
    2: { [RCM_DATA.LEVEL]: 1 },
    3: { [RCM_DATA.LEVEL]: 1 },
    4: { [RCM_DATA.LEVEL]: 1 },
    5: { [RCM_DATA.LEVEL]: 2 },
    6: { [RCM_DATA.LEVEL]: 3 }
  },
  5: {
    2: { [RCM_DATA.LEVEL]: 2 },
    3: { [RCM_DATA.LEVEL]: 2 },
    4: { [RCM_DATA.LEVEL]: 2 },
    5: { [RCM_DATA.LEVEL]: 2 },
    6: { [RCM_DATA.LEVEL]: 3 }
  },
  6: {
    3: { [RCM_DATA.LEVEL]: 3 },
    4: { [RCM_DATA.LEVEL]: 3 },
    5: { [RCM_DATA.LEVEL]: 3 },
    6: { [RCM_DATA.LEVEL]: 3 }
  }
};

export const defaultConditions = {
  'Condition 1': {
    [RCM_DATA.DESCRIPTION]: 'Condition 1', 1: true, 2: false, 3: false, 4: false, 5: false, 6: false
  },
  'Condition 2': {
    [RCM_DATA.DESCRIPTION]: 'Condition 2', 1: false, 2: true, 3: false, 4: false, 5: false, 6: false
  },
  'Condition 3': {
    [RCM_DATA.DESCRIPTION]: 'Condition 3', 1: false, 2: false, 3: true, 4: false, 5: false, 6: false
  }
};

export const defaultLevels = {
  1: { [RCM_DATA.COLOR]: OL.BLUE02, [RCM_DATA.ACTIVE]: true, [RCM_DATA.BOOKING_HOLD]: false },
  2: { [RCM_DATA.COLOR]: OL.GREEN01, [RCM_DATA.ACTIVE]: true, [RCM_DATA.BOOKING_HOLD]: false },
  3: { [RCM_DATA.COLOR]: OL.GREEN02, [RCM_DATA.ACTIVE]: true, [RCM_DATA.BOOKING_HOLD]: false },
  4: { [RCM_DATA.COLOR]: OL.YELLOW02, [RCM_DATA.ACTIVE]: false, [RCM_DATA.BOOKING_HOLD]: false },
  5: { [RCM_DATA.COLOR]: OL.ORANGE01, [RCM_DATA.ACTIVE]: false, [RCM_DATA.BOOKING_HOLD]: false },
  6: { [RCM_DATA.COLOR]: OL.RED01, [RCM_DATA.ACTIVE]: false, [RCM_DATA.BOOKING_HOLD]: false },
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
  RCM: 'rcm'
};
