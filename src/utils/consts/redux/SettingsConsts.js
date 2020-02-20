/*
 * @flow
 */

import {
  defaultMatrix,
  defaultConditions,
  defaultLevels,
  THEMES
} from '../RCMResultsConsts';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  MODULE,
  RCM,
  SETTINGS,
} from '../AppSettingConsts';

export const SETTINGS_ACTIONS = {
  SUBMIT_SETTINGS: 'submitSettings'
};

export const SETTINGS_DATA = {
  APP_SETTINGS: 'appSettings'
};


export const defaultRCM = {
  [RCM.CONDITIONS]: defaultConditions,
  [RCM.LEVELS]: defaultLevels,
  [RCM.MATRIX]: defaultMatrix,
  [RCM.THEME]: THEMES.CLASSIC
};


export const DEFAULT_SETTINGS = {
  [SETTINGS.ARRESTS_INTEGRATED]: false,
  [SETTINGS.COURT_CASES_INTEGRATED]: false,
  [SETTINGS.COURT_REMINDERS]: false,
  [SETTINGS.ENROLL_VOICE]: false,
  [SETTINGS.STEP_INCREASES]: false,
  [SETTINGS.SECONDARY_BOOKING_CHARGES]: false,
  [SETTINGS.LOAD_CASES]: false,
  [SETTINGS.CASE_CONTEXTS]: {
    [CONTEXTS.BOOKING]: CASE_CONTEXTS.ARREST,
    [CONTEXTS.COURT]: CASE_CONTEXTS.COURT
  },
  [SETTINGS.CONTEXTS]: {
    [CONTEXTS.BOOKING]: false,
    [CONTEXTS.COURT]: true
  },
  [SETTINGS.MODULES]: {
    [MODULE.PSA]: true,
    [MODULE.PRETRIAL]: false
  },
  [SETTINGS.PREFERRED_COUNTY]: '',
  [SETTINGS.RCM]: defaultRCM
}
