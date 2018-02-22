/*
 * @flow
 */

import { PROPERTY_TYPES } from './consts/DataModelConsts';

const {
  AGE_AT_CURRENT_ARREST_FQN,
  CURRENT_VIOLENT_OFFENSE_FQN,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN,
  PENDING_CHARGE_FQN,
  PRIOR_MISDEMEANOR_FQN,
  PRIOR_FELONY_FQN,
  PRIOR_CONVICTION_FQN,
  PRIOR_VIOLENT_CONVICTION_FQN,
  PRIOR_FAILURE_TO_APPEAR_RECENT_FQN,
  PRIOR_FAILURE_TO_APPEAR_OLD_FQN,
  PRIOR_SENTENCE_TO_INCARCERATION_FQN
} = PROPERTY_TYPES;

type PsaForm = {
  ageAtCurrentArrest :string,
  currentViolentOffense :string,
  pendingCharge :string,
  priorMisdemeanor :string,
  priorFelony :string,
  priorViolentConviction :string,
  priorFailureToAppearRecent :string,
  priorFailureToAppearOld :string,
  priorSentenceToIncarceration :string,
  priorConviction? :?string,
  currentViolentOffenseAndYoung? :?string
}

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

export function getScores(psaForm :PsaForm) :{} {
  const {
    ageAtCurrentArrest,
    currentViolentOffense,
    pendingCharge,
    priorMisdemeanor,
    priorFelony,
    priorViolentConviction,
    priorFailureToAppearRecent,
    priorFailureToAppearOld,
    priorSentenceToIncarceration
  } = psaForm;

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

  return {
    ftaTotal,
    ncaTotal,
    nvcaTotal,
    ftaScale,
    ncaScale,
    nvcaFlag
  };
}

export function getScoresAndRiskFactors(psaForm :PsaForm) :{} {
  const scores = getScores(psaForm);
  const {
    ageAtCurrentArrest,
    currentViolentOffense,
    pendingCharge,
    priorMisdemeanor,
    priorFelony,
    priorViolentConviction,
    priorFailureToAppearRecent,
    priorFailureToAppearOld,
    priorSentenceToIncarceration,
    // optional params
    priorConviction,
    currentViolentOffenseAndYoung
  } = psaForm;

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

  const riskFactors = {
    [AGE_AT_CURRENT_ARREST_FQN]: [ageAtCurrentArrestValue],
    [CURRENT_VIOLENT_OFFENSE_FQN]: [currentViolentOffenseValue],
    [CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN]: [currentViolentOffenseAndYoungValue],
    [PENDING_CHARGE_FQN]: [pendingChargeValue],
    [PRIOR_MISDEMEANOR_FQN]: [priorMisdemeanorValue],
    [PRIOR_FELONY_FQN]: [priorFelonyValue],
    [PRIOR_CONVICTION_FQN]: [priorConvictionValue],
    [PRIOR_VIOLENT_CONVICTION_FQN]: [priorViolentConvictionValue],
    [PRIOR_FAILURE_TO_APPEAR_RECENT_FQN]: [priorFailureToAppearRecentValue],
    [PRIOR_FAILURE_TO_APPEAR_OLD_FQN]: [priorFailureToAppearOldValue],
    [PRIOR_SENTENCE_TO_INCARCERATION_FQN]: [priorSentenceToIncarcerationValue]
  };

  return { riskFactors, scores };
}
