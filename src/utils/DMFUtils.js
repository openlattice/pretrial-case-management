
import { CONTEXT } from './consts/Consts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import {
  COLORS,
  RELEASE_TYPES,
  CONDITION_TYPES,
  RESULT_CATEGORIES,
  HEADER_LABELS,
  CONDITION_LABELS,
  DMF_RESULTS
} from './consts/DMFResultConsts';

export const getHeaderText = (dmf) => {
  const releaseType = dmf[RESULT_CATEGORIES.RELEASE_TYPE];
  const conditionsLevel = dmf[RESULT_CATEGORIES.CONDITIONS_LEVEL];
  switch (releaseType) {
    case RELEASE_TYPES.RELEASE:
      return HEADER_LABELS[RELEASE_TYPES.RELEASE];
    case RELEASE_TYPES.RELEASE_WITH_CONDITIONS:
      return `${HEADER_LABELS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level ${conditionsLevel})`;
    case RELEASE_TYPES.MAXIMUM_CONDITIONS:
      return HEADER_LABELS[RELEASE_TYPES.MAXIMUM_CONDITIONS];
    default:
      return '';
  }
};

export const getConditionText = (condition) => CONDITION_LABELS[condition] || '';

export const getConditionsTextList = (dmf) => {
  const condition1 = getConditionText(dmf[RESULT_CATEGORIES.CONDITION_1]);
  const condition2 = getConditionText(dmf[RESULT_CATEGORIES.CONDITION_2]);
  const condition3 = getConditionText(dmf[RESULT_CATEGORIES.CONDITION_3]);

  return [condition1, condition2, condition3].filter((val) => val.length);
};

export const increaseDMFSeverity = (dmfResult, context) => {
  const increasedValues = {};
  let newColor = dmfResult[RESULT_CATEGORIES.COLOR];
  let conditionsLevel;
  switch (newColor) {
    case COLORS.DARK_GREEN:
      newColor = COLORS.LIGHT_GREEN;
      conditionsLevel = 1;
      break;

    case COLORS.LIGHT_GREEN:
      newColor = COLORS.YELLOW;
      conditionsLevel = 2;
      break;

    case COLORS.YELLOW:
      newColor = COLORS.ORANGE;
      conditionsLevel = 3;
      break;

    case COLORS.ORANGE:
      newColor = COLORS.RED;
      break;

    default:
      break;
  }
  if (newColor) {
    increasedValues[RESULT_CATEGORIES.COLOR] = newColor;
  }
  increasedValues[RESULT_CATEGORIES.CONDITIONS_LEVEL] = conditionsLevel;

  let releaseType = dmfResult[RESULT_CATEGORIES.RELEASE_TYPE];
  switch (releaseType) {
    case RELEASE_TYPES.RELEASE:
      releaseType = RELEASE_TYPES.RELEASE_WITH_CONDITIONS;
      break;

    case RELEASE_TYPES.RELEASE_WITH_CONDITIONS:
      if (dmfResult[RESULT_CATEGORIES.CONDITIONS_LEVEL] === 3) {
        releaseType = RELEASE_TYPES.MAXIMUM_CONDITIONS;
      }
      break;

    default:
      break;
  }
  if (releaseType) {
    increasedValues[RESULT_CATEGORIES.RELEASE_TYPE] = releaseType;
  }

  if (context === CONTEXT.COURT_LINCOLN) {
    switch (newColor) {
      case COLORS.LIGHT_GREEN:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_MONTHLY;
        break;
      case COLORS.YELLOW:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_TWICE_MONTHLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.ORANGE:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_WEEKLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.RED:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      default:
        break;
    }
  }

  if (context === CONTEXT.COURT_PENN) {

    switch (newColor) {
      case COLORS.LIGHT_GREEN:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.PR;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.CHECKIN_MONTHLY;
        break;
      case COLORS.YELLOW:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.PR;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.CHECKIN_TWICE_MONTHLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_3] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.ORANGE:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.EM_OR_BOND;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.CHECKIN_WEEKLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_3] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.RED:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.EM_AND_BOND;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST;
        increasedValues[RESULT_CATEGORIES.CONDITION_3] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      default:
        break;
    }
  }

  if (context === CONTEXT.COURT_MINN) {

    switch (newColor) {
      case COLORS.LIGHT_GREEN:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_MONTHLY;
        break;
      case COLORS.YELLOW:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_TWICE_MONTHLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.ORANGE:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_WEEKLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.RED:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      default:
        break;
    }
  }

  if (context === CONTEXT.DEMO_ORG) {

    switch (newColor) {
      case COLORS.LIGHT_GREEN:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_MONTHLY;
        break;
      case COLORS.YELLOW:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_TWICE_MONTHLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.ORANGE:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_WEEKLY;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      case COLORS.RED:
        increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST;
        increasedValues[RESULT_CATEGORIES.CONDITION_2] = CONDITION_TYPES.IF_APPLICABLE_247;
        break;
      default:
        break;
    }
  }

  if (context === CONTEXT.BOOKING) {
    increasedValues[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW;
  }

  return { ...dmfResult, ...increasedValues };
};

export const shouldCheckForSecondaryRelease = (context, ncaScore, ftaScore) => {
  if (context === CONTEXT.BOOKING) {
    if (ncaScore === 2 && ftaScore === 5) return true;
    if (ncaScore === 3) return true;
    if (ncaScore === 4 && ftaScore <= 4) return true;
  }
  return false;
};

export const updateDMFSecondaryRelease = (dmfResult) => {
  const newDmf = { ...dmfResult };
  newDmf[RESULT_CATEGORIES.COLOR] = COLORS.DARK_GREEN;
  newDmf[RESULT_CATEGORIES.RELEASE_TYPE] = RELEASE_TYPES.RELEASE;
  newDmf[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.PR_RELEASE;
  return newDmf;
};

export const shouldCheckForSecondaryHold = (context, ncaScore, ftaScore) => {
  if (context === CONTEXT.BOOKING) {
    return (ncaScore < 6 && ftaScore < 6);
  }
  return false;
};

export const updateDMFSecondaryHold = (dmfResult) => {
  const newDmf = { ...dmfResult };
  newDmf[RESULT_CATEGORIES.COLOR] = COLORS.RED;
  newDmf[RESULT_CATEGORIES.RELEASE_TYPE] = RELEASE_TYPES.MAXIMUM_CONDITIONS;
  newDmf[RESULT_CATEGORIES.CONDITION_1] = CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW;
  return newDmf;
};

export const formatDMFFromEntity = (dmfEntity) => ({
  [RESULT_CATEGORIES.COLOR]: dmfEntity.getIn([PROPERTY_TYPES.COLOR, 0]),
  [RESULT_CATEGORIES.RELEASE_TYPE]: dmfEntity.getIn([PROPERTY_TYPES.RELEASE_TYPE, 0]),
  [RESULT_CATEGORIES.CONDITIONS_LEVEL]: dmfEntity.getIn([PROPERTY_TYPES.CONDITIONS_LEVEL, 0]),
  [RESULT_CATEGORIES.CONDITION_1]: dmfEntity.getIn([PROPERTY_TYPES.CONDITION_1, 0]),
  [RESULT_CATEGORIES.CONDITION_2]: dmfEntity.getIn([PROPERTY_TYPES.CONDITION_2, 0]),
  [RESULT_CATEGORIES.CONDITION_3]: dmfEntity.getIn([PROPERTY_TYPES.CONDITION_3, 0])
});

export const getDMFDecision = (ncaScore, ftaScore, context) => {
  if (!DMF_RESULTS[ncaScore] || !DMF_RESULTS[ncaScore][ftaScore]) return null;
  return DMF_RESULTS[ncaScore][ftaScore][context];
};
