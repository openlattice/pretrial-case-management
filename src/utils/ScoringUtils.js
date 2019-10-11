/*
 * @flow
 */
import Immutable from 'immutable';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { SETTINGS } from './consts/AppSettingConsts';
import { RCM_FIELDS } from './consts/RCMResultsConsts';
import { PSA, NOTES } from './consts/Consts';
import {
  getRCMDecision,
  increaseRCMSeverity,
  shouldCheckForSecondaryRelease,
  updateRCMSecondaryRelease,
  shouldCheckForSecondaryHold,
  updateRCMSecondaryHold
} from './RCMUtils';

const {
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  COURT_OR_BOOKING,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES,
} = RCM_FIELDS;

const {
  AGE_AT_CURRENT_ARREST,
  CURRENT_VIOLENT_OFFENSE,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_CONVICTION,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION,
  AGE_AT_CURRENT_ARREST_NOTES,
  CURRENT_VIOLENT_OFFENSE_NOTES,
  PENDING_CHARGE_NOTES,
  PRIOR_MISDEMEANOR_NOTES,
  PRIOR_FELONY_NOTES,
  PRIOR_VIOLENT_CONVICTION_NOTES,
  PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES,
  PRIOR_FAILURE_TO_APPEAR_OLD_NOTES,
  PRIOR_SENTENCE_TO_INCARCERATION_NOTES
} = PROPERTY_TYPES;

function getFtaScaleFromScore(score :number) :number {
  switch (score) {
    case 0:
      return 1;

    case 1:
      return 2;

    case 2:
      return 3;

    case 3:
    case 4:
      return 4;

    case 5:
    case 6:
      return 5;

    case 7:
      return 6;

    default:
      return 0;
  }
}

function getNcaScaleFromScore(score :number) :number {
  switch (score) {
    case 0:
      return 1;

    case 1:
    case 2:
      return 2;

    case 3:
    case 4:
      return 3;

    case 5:
    case 6:
      return 4;

    case 7:
    case 8:
      return 5;

    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
      return 6;

    default:
      return 0;
  }
}

function getNvcaFlagFromScore(score :number) :boolean {
  if (score > 3) return true;
  return false;
}

export function getScores(psaForm :Immutable.Map<*, *>) :{} {

  const ageAtCurrentArrest = psaForm.get(PSA.AGE_AT_CURRENT_ARREST);
  const currentViolentOffense = psaForm.get(PSA.CURRENT_VIOLENT_OFFENSE);
  const pendingCharge = psaForm.get(PSA.PENDING_CHARGE);
  const priorMisdemeanor = psaForm.get(PSA.PRIOR_MISDEMEANOR);
  const priorFelony = psaForm.get(PSA.PRIOR_FELONY);
  const priorViolentConviction = psaForm.get(PSA.PRIOR_VIOLENT_CONVICTION);
  const priorFailureToAppearRecent = psaForm.get(PSA.PRIOR_FAILURE_TO_APPEAR_RECENT);
  const priorFailureToAppearOld = psaForm.get(PSA.PRIOR_FAILURE_TO_APPEAR_OLD);
  const priorSentenceToIncarceration = psaForm.get(PSA.PRIOR_SENTENCE_TO_INCARCERATION);

  let ftaTotal = 0;
  let ncaTotal = 0;
  let nvcaTotal = 0;

  if (ageAtCurrentArrest === '0' || ageAtCurrentArrest === '1') ncaTotal += 2;
  if (currentViolentOffense === 'true') nvcaTotal += 2;
  if (ageAtCurrentArrest === '0' && currentViolentOffense === 'true') nvcaTotal += 1;
  if (pendingCharge === 'true') {
    ftaTotal += 1;
    ncaTotal += 3;
    nvcaTotal += 1;
  }
  if (priorMisdemeanor === 'true') ncaTotal += 1;
  if (priorFelony === 'true') ncaTotal += 1;
  if (priorMisdemeanor === 'true' || priorFelony === 'true') {
    ftaTotal += 1;
    nvcaTotal += 1;
  }
  if (priorViolentConviction === '1' || priorViolentConviction === '2') {
    ncaTotal += 1;
    nvcaTotal += 1;
  }
  else if (priorViolentConviction === '3') {
    ncaTotal += 2;
    nvcaTotal += 2;
  }
  if (priorFailureToAppearRecent === '1') {
    ftaTotal += 2;
    ncaTotal += 1;
  }
  else if (priorFailureToAppearRecent === '2') {
    ftaTotal += 4;
    ncaTotal += 2;
  }
  if (priorFailureToAppearOld === 'true') ftaTotal += 1;
  if (priorSentenceToIncarceration === 'true') ncaTotal += 2;

  const ftaScale = getFtaScaleFromScore(ftaTotal);
  const ncaScale = getNcaScaleFromScore(ncaTotal);
  const nvcaFlag = getNvcaFlagFromScore(nvcaTotal);

  const scores = Immutable.fromJS({
    [PROPERTY_TYPES.FTA_SCALE]: [ftaScale],
    [PROPERTY_TYPES.NCA_SCALE]: [ncaScale],
    [PROPERTY_TYPES.NVCA_FLAG]: [nvcaFlag]
  });

  const scoreTotals = { ftaTotal, ncaTotal, nvcaTotal };

  return { scores, scoreTotals };
}

export function getScoresAndRiskFactors(psaForm :Immutable.Map<*, *>) :{} {
  const { scores, scoreTotals } = getScores(psaForm);

  const ageAtCurrentArrest = psaForm.get(PSA.AGE_AT_CURRENT_ARREST);
  const currentViolentOffense = psaForm.get(PSA.CURRENT_VIOLENT_OFFENSE);
  const pendingCharge = psaForm.get(PSA.PENDING_CHARGE);
  const priorMisdemeanor = psaForm.get(PSA.PRIOR_MISDEMEANOR);
  const priorFelony = psaForm.get(PSA.PRIOR_FELONY);
  const priorViolentConviction = psaForm.get(PSA.PRIOR_VIOLENT_CONVICTION);
  const priorFailureToAppearRecent = psaForm.get(PSA.PRIOR_FAILURE_TO_APPEAR_RECENT);
  const priorFailureToAppearOld = psaForm.get(PSA.PRIOR_FAILURE_TO_APPEAR_OLD);
  const priorSentenceToIncarceration = psaForm.get(PSA.PRIOR_SENTENCE_TO_INCARCERATION);

  // optional params
  const priorConviction = psaForm.get(PSA.PRIOR_CONVICTION);
  const currentViolentOffenseAndYoung = psaForm.get(PSA.CURRENT_VIOLENT_OFFENSE_AND_YOUNG);

  let ageAtCurrentArrestValue = '20 or Younger';
  if (ageAtCurrentArrest === '1') ageAtCurrentArrestValue = '21 or 22';
  else if (ageAtCurrentArrest === '2') ageAtCurrentArrestValue = '23 or Older';
  const currentViolentOffenseValue = currentViolentOffense === 'true';
  const currentViolentOffenseAndYoungValue = currentViolentOffenseAndYoung
    ? currentViolentOffenseAndYoung === 'true' : currentViolentOffense === 'true' && ageAtCurrentArrest === '0';
  const pendingChargeValue = pendingCharge === 'true';
  const priorMisdemeanorValue = priorMisdemeanor === 'true';
  const priorFelonyValue = priorFelony === 'true';
  const priorConvictionValue = priorConviction
    ? priorConviction === 'true' : priorMisdemeanor === 'true' || priorFelony === 'true';
  const priorViolentConvictionValue = (priorViolentConviction === '3') ? '3 or more' : priorViolentConviction;
  const priorFailureToAppearRecentValue = (priorFailureToAppearRecent === '2')
    ? '2 or more' : priorFailureToAppearRecent;
  const priorFailureToAppearOldValue = priorFailureToAppearOld === 'true';
  const priorSentenceToIncarcerationValue = priorSentenceToIncarceration === 'true';

  if (currentViolentOffenseAndYoungValue) {
    if (ageAtCurrentArrestValue !== '20 or Younger' || !currentViolentOffenseValue) {
      throw new Error('Illegal values are selected for current violent offense and 20 years or younger');
    }
  }

  if (!priorMisdemeanorValue && !priorFelonyValue) {
    if (priorConvictionValue || priorViolentConvictionValue !== '0' || priorSentenceToIncarcerationValue) {
      throw new Error('Illegal values are selected given no prior convictions');
    }
  }

  if (priorMisdemeanorValue || priorFelonyValue) {
    if (!priorConvictionValue) {
      throw new Error('Illegal values are selected given prior convictions');
    }
  }

  const ageAtCurrentArrestNotes = psaForm.get(NOTES[PSA.AGE_AT_CURRENT_ARREST]);
  const currentViolentOffenseNotes = psaForm.get(NOTES[PSA.CURRENT_VIOLENT_OFFENSE]);
  const pendingChargeNotes = psaForm.get(NOTES[PSA.PENDING_CHARGE]);
  const priorMisdemeanorNotes = psaForm.get(NOTES[PSA.PRIOR_MISDEMEANOR]);
  const priorFelonyNotes = psaForm.get(NOTES[PSA.PRIOR_FELONY]);
  const priorViolentConvictionNotes = psaForm.get(NOTES[PSA.PRIOR_VIOLENT_CONVICTION]);
  const priorFTARecentNotes = psaForm.get(NOTES[PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]);
  const priorFTAOldNotes = psaForm.get(NOTES[PSA.PRIOR_FAILURE_TO_APPEAR_OLD]);
  const priorSentenceToIncarcerationNotes = psaForm.get(NOTES[PSA.PRIOR_SENTENCE_TO_INCARCERATION]);

  const riskFactors = {
    [AGE_AT_CURRENT_ARREST]: [ageAtCurrentArrestValue],
    [CURRENT_VIOLENT_OFFENSE]: [currentViolentOffenseValue],
    [CURRENT_VIOLENT_OFFENSE_AND_YOUNG]: [currentViolentOffenseAndYoungValue],
    [PENDING_CHARGE]: [pendingChargeValue],
    [PRIOR_MISDEMEANOR]: [priorMisdemeanorValue],
    [PRIOR_FELONY]: [priorFelonyValue],
    [PRIOR_CONVICTION]: [priorConvictionValue],
    [PRIOR_VIOLENT_CONVICTION]: [priorViolentConvictionValue],
    [PRIOR_FAILURE_TO_APPEAR_RECENT]: [priorFailureToAppearRecentValue],
    [PRIOR_FAILURE_TO_APPEAR_OLD]: [priorFailureToAppearOldValue],
    [PRIOR_SENTENCE_TO_INCARCERATION]: [priorSentenceToIncarcerationValue]
  };
  if (ageAtCurrentArrestNotes && ageAtCurrentArrestNotes.length) {
    riskFactors[AGE_AT_CURRENT_ARREST_NOTES] = [ageAtCurrentArrestNotes];
  }
  if (currentViolentOffenseNotes && currentViolentOffenseNotes.length) {
    riskFactors[CURRENT_VIOLENT_OFFENSE_NOTES] = [currentViolentOffenseNotes];
  }
  if (pendingChargeNotes && pendingChargeNotes.length) {
    riskFactors[PENDING_CHARGE_NOTES] = [pendingChargeNotes];
  }
  if (priorMisdemeanorNotes && priorMisdemeanorNotes.length) {
    riskFactors[PRIOR_MISDEMEANOR_NOTES] = [priorMisdemeanorNotes];
  }
  if (priorFelonyNotes && priorFelonyNotes.length) {
    riskFactors[PRIOR_FELONY_NOTES] = [priorFelonyNotes];
  }
  if (priorViolentConvictionNotes && priorViolentConvictionNotes.length) {
    riskFactors[PRIOR_VIOLENT_CONVICTION_NOTES] = [priorViolentConvictionNotes];
  }
  if (priorFTARecentNotes && priorFTARecentNotes.length) {
    riskFactors[PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES] = [priorFTARecentNotes];
  }
  if (priorFTAOldNotes && priorFTAOldNotes.length) {
    riskFactors[PRIOR_FAILURE_TO_APPEAR_OLD_NOTES] = [priorFTAOldNotes];
  }
  if (priorSentenceToIncarcerationNotes && priorSentenceToIncarcerationNotes.length) {
    riskFactors[PRIOR_SENTENCE_TO_INCARCERATION_NOTES] = [priorSentenceToIncarcerationNotes];
  }

  return { riskFactors, scores, scoreTotals };
}

export const stepTwoIncrease = (rcmRiskFactors, psaRiskFactors, psaScores) => {
  const extradited = rcmRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED, 0]);
  const chargeMatch = rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_2_CHARGES, 0]);
  const violent = psaRiskFactors.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE, 0])
    && psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
  return extradited || chargeMatch || violent;
};

export const stepFourIncrease = (rcmRiskFactors, psaRiskFactors, psaScores) => {
  const chargeMatch = rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_4_CHARGES, 0]);
  const violentRisk = !psaRiskFactors.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE, 0])
    && psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
  return chargeMatch || violentRisk;
};

export const rcmSecondaryReleaseDecrease = (rcm, rcmRiskFactors, settings) => {
  const conditionsLevel = rcm.getIn([PROPERTY_TYPES.CONDITIONS_LEVEL, 0]);
  const chargeMatch = rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES, 0], false);
  return shouldCheckForSecondaryRelease(conditionsLevel, settings) && chargeMatch;
};

export const rcmSecondaryHoldIncrease = (rcm, rcmRiskFactors, settings) => {
  const conditionsLevel = rcm.getIn([PROPERTY_TYPES.CONDITIONS_LEVEL, 0]);
  const chargeMatch = rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES, 0], false);
  return shouldCheckForSecondaryHold(conditionsLevel, settings) && chargeMatch;
};

export const getRCMRiskFactors = (inputData) => {
  const extradited = inputData.get(EXTRADITED) === 'true';
  const stepTwo = inputData.get(STEP_2_CHARGES) === 'true';
  const stepFour = inputData.get(STEP_4_CHARGES) === 'true';
  const secondaryRelease = inputData.get(SECONDARY_RELEASE_CHARGES) === 'true';
  const secondaryHold = inputData.get(SECONDARY_HOLD_CHARGES) === 'true';
  const context = inputData.get(COURT_OR_BOOKING);

  return {
    [PROPERTY_TYPES.EXTRADITED]: [extradited],
    [PROPERTY_TYPES.RCM_STEP_2_CHARGES]: [stepTwo],
    [PROPERTY_TYPES.RCM_STEP_4_CHARGES]: [stepFour],
    [PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES]: [secondaryRelease],
    [PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES]: [secondaryHold],
    [PROPERTY_TYPES.CONTEXT]: [context]
  };
};

export const calculateRCM = (inputData, scores, settings) => {
  const context = inputData.get(COURT_OR_BOOKING);
  const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const extradited = inputData.get(EXTRADITED) === 'true';
  const stepTwo = inputData.get(STEP_2_CHARGES) === 'true';
  const currentViolentOffense = inputData.get(PSA.CURRENT_VIOLENT_OFFENSE) === 'true';
  const nvca = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
  const violent = currentViolentOffense && nvca;
  const violentRisk = !currentViolentOffense && nvca;
  const stepFour = inputData.get(STEP_4_CHARGES) === 'true' || violentRisk;

  let rcmResult = getRCMDecision(nca, fta, settings);

  const includeStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
  const includeSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

  if (includeStepIncreases) {

    if (extradited || stepTwo || violent) {
      rcmResult = getRCMDecision(6, 6, settings);
    }
    if (stepFour) {
      rcmResult = increaseRCMSeverity(rcmResult, settings);
    }
  }
  if (includeSecondaryBookingCharges) {
    const secondaryRelease = inputData.get(SECONDARY_RELEASE_CHARGES) === 'true';
    const secondaryHold = inputData.get(SECONDARY_HOLD_CHARGES) === 'true';
    const conditionLevel = rcmResult.rcm[PROPERTY_TYPES.CONDITIONS_LEVEL];
    if (!stepFour && shouldCheckForSecondaryRelease(conditionLevel, settings) && secondaryRelease) {
      rcmResult = updateRCMSecondaryRelease(rcmResult);
    }
    if (shouldCheckForSecondaryHold(conditionLevel, settings) && secondaryHold) {
      rcmResult = updateRCMSecondaryHold(rcmResult);
    }
  }
  return rcmResult;
};
