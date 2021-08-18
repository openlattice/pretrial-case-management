/*
 * @flow
 */
import { fromJS, List, Map } from 'immutable';

import { getEntityProperties } from './DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { SETTINGS, RCM, RCM_DATA } from './consts/AppSettingConsts';
import { CONTEXT } from './consts/Consts';
import {
  COLOR_THEMES,
  BOOKING_CONDITIONS,
  RESULTS,
  RELEASE_TYPE_HEADERS,
  RELEASE_TYPES,
  THEMES
} from './consts/RCMResultsConsts';

const {
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS
} = APP_TYPES;

const {
  COLOR,
  CONDITION_1,
  CONDITION_2,
  CONDITION_3,
  CONDITIONS_LEVEL,
  TYPE,
  RELEASE_TYPE,
} = PROPERTY_TYPES;

const conditionProperties = [CONDITION_1, CONDITION_2, CONDITION_3];

const bookingHoldConditions = [{ [TYPE]: BOOKING_CONDITIONS.HOLD }];
const bookingReleaseConditions = [{ [TYPE]: BOOKING_CONDITIONS.RELEASE }];

export const getHeaderText = (rcm :Object) => {
  const releaseType = rcm[RELEASE_TYPE];
  const conditionsLevel = rcm[CONDITIONS_LEVEL];
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
  .filter((level) => level.get(RCM_DATA.ACTIVE));

export const shouldCheckForSecondaryRelease = (level :number, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const activeLevels = getActiveRCMLevels(rcmSettings);
  return activeLevels.getIn([`${level}`, RCM_DATA.BOOKING_HOLD_EXCEPTION], false);
};

export const updateRCMSecondaryRelease = (rcmResult :Object) => {
  const updatedRCM = { ...rcmResult };
  updatedRCM[RESULTS.BOOKING_CONDITIONS] = bookingReleaseConditions;
  return updatedRCM;
};

export const shouldCheckForSecondaryHold = (level :number, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const activeLevels = getActiveRCMLevels(rcmSettings);
  return activeLevels.getIn([`${level}`, RCM_DATA.BOOKING_RELEASE_EXCEPTION], false);
};

export const updateRCMSecondaryHold = (rcmResult :Objec) => {
  const updatedRCM = { ...rcmResult };
  updatedRCM[RESULTS.BOOKING_CONDITIONS] = bookingHoldConditions;
  return updatedRCM;
};

export const getRCMDecision = (ncaScore :number, ftaScore :number, settings :Map) => {
  const rcmSettings = getRCMSettings(settings);
  const rcmMatrix = getRCMMatrix(rcmSettings);
  const rcmLevels = getRCMLevels(rcmSettings);
  const rcmConditions = getRCMConditions(rcmSettings);
  const theme = settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.CLASSIC);

  const level = rcmMatrix.getIn([`${ncaScore}`, `${ftaScore}`, RCM_DATA.LEVEL], null);
  const resultLevel = rcmLevels.get(`${level}`, Map());

  const resultConditions = rcmConditions.valueSeq()
    .filter((condition) => condition.get(`${level}`));

  const resultReleastType = resultLevel.get(RCM_DATA.RELEASE_TYPE);
  const resultColor = COLOR_THEMES[theme][resultLevel.get(RCM_DATA.COLOR)];

  const rcm = {
    [COLOR]: resultColor,
    [RELEASE_TYPE]: resultReleastType,
    [CONDITIONS_LEVEL]: level,
  };

  const courtConditions = resultConditions
    .map((condition) => ({ [TYPE]: condition.get(RCM_DATA.DESCRIPTION) })).toJS();
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
  const currentLevel = rcmResult[RESULTS.RCM][CONDITIONS_LEVEL];
  const theme = settings.getIn([SETTINGS.RCM, RCM.THEME], THEMES.CLASSIC);
  const nextLevel = currentLevel < activeLevels.size
    ? currentLevel + 1
    : currentLevel;
  const resultLevel = activeLevels.get(`${nextLevel}`, Map());
  const resultConditions = rcmConditions.valueSeq()
    .filter((condition) => condition.get(`${nextLevel}`));

  const resultReleastType = resultLevel.get(RCM_DATA.RELEASE_TYPE, null);
  const resultColor = COLOR_THEMES[theme][resultLevel.get(RCM_DATA.COLOR, null)];

  const rcm = {
    [COLOR]: resultColor,
    [RELEASE_TYPE]: resultReleastType,
    [CONDITIONS_LEVEL]: nextLevel,
  };

  const courtConditions = resultConditions
    .map((condition) => ({ [TYPE]: condition.get(RCM_DATA.DESCRIPTION) })).toJS();

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

export const getRCMReleaseConditions = (neighbors :Map, isBooking :boolean) => {
  const rcm = neighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map());
  const bookingConditions = neighbors.get(RCM_BOOKING_CONDITIONS, List());
  const courtConditions = neighbors.get(RCM_COURT_CONDITIONS, List());
  let conditions = courtConditions;
  if (isBooking) {
    conditions = bookingConditions;
  }
  const legacyConditions = fromJS(conditionProperties.map((conditionField) => {
    const conditionFromRCM = rcm.getIn([conditionField, 0], '');
    return { [TYPE]: conditionFromRCM };
  }));
  if (!conditions.size) {
    conditions = legacyConditions;
  }
  return conditions.map((condition) => {
    const { [TYPE]: conditionType } = getEntityProperties(condition, [TYPE]);
    return conditionType;
  }).filter((condition) => condition.length);
};
