/*
 * @flow
 */
import { Map } from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { SETTINGS, RCM, RCM_DATA } from './consts/AppSettingConsts';
import {
  RESULT_CATEGORIES,
  COLOR_MAP,
  BOOKING_CONDITIONS,
  RESULTS,
  RELEASE_TYPE_HEADERS,
  RELEASE_TYPES
} from './consts/RCMResultsConsts';

const bookingHoldConditions = [{ [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }];
const bookingReleaseConditions = [{ [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }];

export const getHeaderText = (rcm) => {
  const releaseType = rcm[RESULT_CATEGORIES.RELEASE_TYPE];
  const conditionsLevel = rcm[RESULT_CATEGORIES.CONDITIONS_LEVEL];
  switch (releaseType) {
    case RELEASE_TYPES.RELEASE:
      return `${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE]} (Level ${conditionsLevel})`;
    case RELEASE_TYPES.RELEASE_WITH_CONDITIONS:
      return `${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level ${conditionsLevel})`;
    case RELEASE_TYPES.MAXIMUM_CONDITIONS:
      return `${RELEASE_TYPE_HEADERS[RELEASE_TYPES.MAXIMUM_CONDITIONS]} (Level ${conditionsLevel})`;
    default:
      return '';
  }
};

export const getRCMSettings = (settings :Map) => settings.get(SETTINGS.RCM, Map());
export const getRCMConditions = (rcmSettings :Map) => rcmSettings.get(RCM.CONDITIONS, Map());
export const getRCMMatrix = (rcmSettings :Map) => rcmSettings.get(RCM.MATRIX, Map());
export const getRCMLevels = (rcmSettings :Map) => rcmSettings.get(RCM.LEVELS, Map());

export const getActiveRCMLevels = (rcmSettings :Map) => rcmSettings
  .get(RCM.LEVELS, Map())
  .filter(level => level.get(RCM_DATA.ACTIVE));

export const shouldCheckForSecondaryRelease = (level :number, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const activeLevels = getActiveRCMLevels(rcmSettings);
  return activeLevels.getIn([`${level}`, RCM_DATA.BOOKING_HOLD_EXCEPTION], false);
};

export const updateRCMSecondaryRelease = (rcmResult :Object) => {
  const updatedRCM = Object.assign({}, rcmResult);
  updatedRCM[RESULTS.BOOKING_CONDITIONS] = bookingReleaseConditions;
  return updatedRCM;
};

export const shouldCheckForSecondaryHold = (level :number, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const activeLevels = getActiveRCMLevels(rcmSettings);
  return activeLevels.getIn([`${level}`, RCM_DATA.BOOKING_RELEASE_EXCEPTION], false);
};

export const updateRCMSecondaryHold = (rcmResult :Objec) => {
  const updatedRCM = Object.assign({}, rcmResult);
  updatedRCM[RESULTS.BOOKING_CONDITIONS] = bookingHoldConditions;
  return updatedRCM;
};

export const getRCMDecision = (ncaScore :number, ftaScore :number, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const rcmMatrix = getRCMMatrix(rcmSettings);
  const rcmLevels = getRCMLevels(rcmSettings);
  const rcmConditions = getRCMConditions(rcmSettings);

  const level = rcmMatrix.getIn([`${ncaScore}`, `${ftaScore}`, RCM_DATA.LEVEL], null);
  const resultLevel = rcmLevels.get(`${level}`, Map());

  const resultConditions = rcmConditions.valueSeq()
    .filter(condition => condition.get(`${level}`));

  const resultReleastType = resultLevel.get(RCM_DATA.RELEASE_TYPE);
  const resultColor = COLOR_MAP[resultLevel.get(RCM_DATA.COLOR)];

  const rcm = {
    [PROPERTY_TYPES.COLOR]: resultColor,
    [PROPERTY_TYPES.RELEASE_TYPE]: resultReleastType,
    [PROPERTY_TYPES.CONDITIONS_LEVEL]: level,
  };

  const courtConditions = resultConditions
    .map(condition => ({ [PROPERTY_TYPES.TYPE]: condition.get(RCM_DATA.DESCRIPTION) })).toJS();

  const bookingConditions = resultLevel.get(RCM_DATA.BOOKING_HOLD, false)
    ? bookingHoldConditions : bookingReleaseConditions;
  if (resultLevel.size && resultReleastType && resultColor) {
    return {
      [RESULTS.RCM]: rcm,
      [RESULTS.COURT_CONDITIONS]: courtConditions,
      [RESULTS.BOOKING_CONDITIONS]: bookingConditions
    };
  }

  return null;
};

export const increaseRCMSeverity = (rcmResult :Object, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const rcmConditions = getRCMConditions(rcmSettings);
  const activeLevels = getActiveRCMLevels(rcmSettings);
  const currentLevel = rcmResult[PROPERTY_TYPES.CONDITIONS_LEVEL];
  const nextLevel = currentLevel < activeLevels.size
    ? currentLevel + 1
    : currentLevel;
  const resultLevel = activeLevels.get(`${nextLevel}`, Map());
  const resultConditions = rcmConditions.valueSeq()
    .filter(condition => condition.get(`${nextLevel}`));

  const resultReleastType = resultLevel.get(RCM_DATA.RELEASE_TYPE, null);
  const resultColor = COLOR_MAP[resultLevel.get(RCM_DATA.COLOR, null)];

  const rcm = {
    [PROPERTY_TYPES.COLOR]: resultColor,
    [PROPERTY_TYPES.RELEASE_TYPE]: resultReleastType,
    [PROPERTY_TYPES.CONDITIONS_LEVEL]: nextLevel,
  };

  const courtConditions = resultConditions
    .map(condition => ({ [PROPERTY_TYPES.TYPE]: condition.get(RCM_DATA.DESCRIPTION) })).toJS();

  const bookingConditions = resultLevel.get(RCM_DATA.BOOKING_HOLD, false)
    ? bookingHoldConditions : bookingReleaseConditions;

  if (resultLevel.size && resultReleastType && resultColor) {
    return {
      [RESULTS.RCM]: rcm,
      [RESULTS.COURT_CONDITIONS]: courtConditions,
      [RESULTS.BOOKING_CONDITIONS]: bookingConditions
    };
  }

  return null;
};
