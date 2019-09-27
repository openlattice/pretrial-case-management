/*
 * @flow
 */

import { OL } from './Colors';
import { RCM_DATA } from './AppSettingConsts';

export const RESULTS = {
  RCM: 'rcm',
  CONDITIONS: 'conditions',
  COURT_CONDITIONS: 'courtConditions',
  BOOKING_CONDITIONS: 'bookingCondition'
};

export const DEFAULT_CONDITIONS = {
  CONDITION_1: 'Condition 1',
  CONDITION_2: 'Condition 2',
  CONDITION_3: 'Condition 3',
  CONDITION_4: 'Condition 4',
  CONDITION_5: 'Condition 5',
  CONDITION_6: 'Condition 6',
};


export const RESULT_CATEGORIES = {
  COLOR: 'COLOR',
  RELEASE_TYPE: 'RELEASE_TYPE',
  CONDITIONS_LEVEL: 'CONDITIONS_LEVEL',
  CONDITION_1: 'CONDITION_1',
  CONDITION_2: 'CONDITION_2',
  CONDITION_3: 'CONDITION_3'
};

export const COLORS = {
  BLUE: 'BLUE',
  DARK_GREEN: 'DARK_GREEN',
  LIGHT_GREEN: 'LIGHT_GREEN',
  YELLOW: 'YELLOW',
  ORANGE: 'ORANGE',
  RED: 'RED'
};

export const COLOR_MAP = {
  [OL.BLUE02]: 'BLUE',
  [OL.GREEN01]: 'DARK_GREEN',
  [OL.GREEN02]: 'LIGHT_GREEN',
  [OL.YELLOW02]: 'YELLOW',
  [OL.ORANGE01]: 'ORANGE',
  [OL.RED01]: 'RED'
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

// NCA score -> FTA score
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
    5: { [RCM_DATA.LEVEL]: 3 }
  },
  3: {
    2: { [RCM_DATA.LEVEL]: 2 },
    3: { [RCM_DATA.LEVEL]: 2 },
    4: { [RCM_DATA.LEVEL]: 2 },
    5: { [RCM_DATA.LEVEL]: 3 }
  },
  4: {
    2: { [RCM_DATA.LEVEL]: 4 },
    3: { [RCM_DATA.LEVEL]: 4 },
    4: { [RCM_DATA.LEVEL]: 4 },
    5: { [RCM_DATA.LEVEL]: 5 },
    6: { [RCM_DATA.LEVEL]: 6 }
  },
  5: {
    2: { [RCM_DATA.LEVEL]: 5 },
    3: { [RCM_DATA.LEVEL]: 5 },
    4: { [RCM_DATA.LEVEL]: 5 },
    5: { [RCM_DATA.LEVEL]: 5 },
    6: { [RCM_DATA.LEVEL]: 6 }
  },
  6: {
    3: { [RCM_DATA.LEVEL]: 6 },
    4: { [RCM_DATA.LEVEL]: 6 },
    5: { [RCM_DATA.LEVEL]: 6 },
    6: { [RCM_DATA.LEVEL]: 6 }
  }
};

export const defaultConditions = {
  [DEFAULT_CONDITIONS.CONDITION_1]: {
    [RCM_DATA.DESCRIPTION]: DEFAULT_CONDITIONS.CONDITION_1, 1: true, 2: false, 3: false, 4: false, 5: false, 6: false
  },
  [DEFAULT_CONDITIONS.CONDITION_2]: {
    [RCM_DATA.DESCRIPTION]: DEFAULT_CONDITIONS.CONDITION_2, 1: false, 2: true, 3: false, 4: false, 5: false, 6: false
  },
  [DEFAULT_CONDITIONS.CONDITION_3]: {
    [RCM_DATA.DESCRIPTION]: DEFAULT_CONDITIONS.CONDITION_3, 1: false, 2: false, 3: true, 4: false, 5: false, 6: false
  },
  [DEFAULT_CONDITIONS.CONDITION_4]: {
    [RCM_DATA.DESCRIPTION]: DEFAULT_CONDITIONS.CONDITION_4, 1: false, 2: false, 3: false, 4: true, 5: false, 6: false
  },
  [DEFAULT_CONDITIONS.CONDITION_5]: {
    [RCM_DATA.DESCRIPTION]: DEFAULT_CONDITIONS.CONDITION_5, 1: false, 2: false, 3: false, 4: false, 5: true, 6: false
  },
  [DEFAULT_CONDITIONS.CONDITION_6]: {
    [RCM_DATA.DESCRIPTION]: DEFAULT_CONDITIONS.CONDITION_6, 1: false, 2: false, 3: false, 4: false, 5: false, 6: true
  },
};

export const defaultLevels = {
  1: {
    [RCM_DATA.COLOR]: OL.BLUE02,
    [RCM_DATA.ACTIVE]: true,
    [RCM_DATA.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
    [RCM_DATA.BOOKING_HOLD]: false,
    [RCM_DATA.BOOKING_RELEASE_EXCEPTION]: true,
    [RCM_DATA.BOOKING_HOLD_EXCEPTION]: false
  },
  2: {
    [RCM_DATA.COLOR]: OL.GREEN01,
    [RCM_DATA.ACTIVE]: true,
    [RCM_DATA.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
    [RCM_DATA.BOOKING_HOLD]: true,
    [RCM_DATA.BOOKING_RELEASE_EXCEPTION]: true,
    [RCM_DATA.BOOKING_HOLD_EXCEPTION]: true
  },
  3: {
    [RCM_DATA.COLOR]: OL.GREEN02,
    [RCM_DATA.ACTIVE]: true,
    [RCM_DATA.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
    [RCM_DATA.BOOKING_HOLD]: true,
    [RCM_DATA.BOOKING_RELEASE_EXCEPTION]: true,
    [RCM_DATA.BOOKING_HOLD_EXCEPTION]: true
  },
  4: {
    [RCM_DATA.COLOR]: OL.YELLOW02,
    [RCM_DATA.ACTIVE]: true,
    [RCM_DATA.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
    [RCM_DATA.BOOKING_HOLD]: true,
    [RCM_DATA.BOOKING_RELEASE_EXCEPTION]: true,
    [RCM_DATA.BOOKING_HOLD_EXCEPTION]: true
  },
  5: {
    [RCM_DATA.COLOR]: OL.ORANGE01,
    [RCM_DATA.ACTIVE]: true,
    [RCM_DATA.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
    [RCM_DATA.BOOKING_HOLD]: true,
    [RCM_DATA.BOOKING_RELEASE_EXCEPTION]: true,
    [RCM_DATA.BOOKING_HOLD_EXCEPTION]: false
  },
  6: {
    [RCM_DATA.COLOR]: OL.RED01,
    [RCM_DATA.ACTIVE]: true,
    [RCM_DATA.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
    [RCM_DATA.BOOKING_HOLD]: true,
    [RCM_DATA.BOOKING_RELEASE_EXCEPTION]: false,
    [RCM_DATA.BOOKING_HOLD_EXCEPTION]: false
  },
};

export const BOOKING_CONDITIONS = {
  HOLD: 'Hold pending judicial review',
  RELEASE: 'PR - Release'
};
