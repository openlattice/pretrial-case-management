import moment from 'moment';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA } from './consts/Consts';
import {
  chargeFieldIsViolent,
  degreeFieldIsFelony,
  degreeFieldIsMisdemeanor,
  dispositionFieldIsGuilty,
  getViolentChargeNums,
  getChargeTitle,
  getUnique
} from './consts/ChargeConsts';

const {
  DOB,
  ARREST_DATE_FQN,
  MOST_SERIOUS_CHARGE_NO,
  CHARGE_NUM_FQN,
  CASE_ID_FQN,
  CHARGE_ID_FQN,
  CHARGE_DEGREE_FQN,
  DISPOSITION,
  DISPOSITION_DATE
} = PROPERTY_TYPES;

const {
  AGE_AT_CURRENT_ARREST,
  CURRENT_VIOLENT_OFFENSE,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_SENTENCE_TO_INCARCERATION
} = PSA;

export const getViolentCharges = (charges, mostSeriousCharge) => {
  if (!charges || !charges.length) {
    if (!mostSeriousCharge) return [];
    if (getViolentChargeNums([mostSeriousCharge]).length) {
      return [mostSeriousCharge];
    }
  }

  const chargesToConsider = charges
    .filter(charge => charge[CHARGE_NUM_FQN] && charge[CHARGE_NUM_FQN].length)
    .map(charge => charge[CHARGE_NUM_FQN][0]);
  if (mostSeriousCharge && mostSeriousCharge.length) chargesToConsider.push(mostSeriousCharge);
  const violentChargeNums = getViolentChargeNums(chargesToConsider);

  return charges.filter((charge) => {
    if (!charge[CHARGE_NUM_FQN] || !charge[CHARGE_NUM_FQN].length) return false;
    return violentChargeNums.includes(charge[CHARGE_NUM_FQN][0]);
  }).map(charge => getChargeTitle(charge));
};

export const tryAutofillCurrentViolentCharge = (charges, mostSeriousCharge) =>
  `${getViolentCharges(charges.toJS(), mostSeriousCharge).length > 0}`;

export const tryAutofillAge = (dateArrested, defaultValue, selectedPerson) => {
  const dob = moment.utc(selectedPerson.getIn([DOB, 0], ''));
  const arrest = moment.utc(dateArrested);
  let ageAtCurrentArrestValue = defaultValue;
  if (dob.isValid && arrest.isValid) {
    const age = Math.floor(moment.duration(arrest.diff(dob)).asYears());
    if (!Number.isNaN(age)) {
      if (age <= 20) ageAtCurrentArrestValue = '0';
      if (age === 21 || age === 22) ageAtCurrentArrestValue = '1';
      if (age >= 23) ageAtCurrentArrestValue = '2';
    }
  }
  return ageAtCurrentArrestValue;
};

export const getPendingCharges = (currCaseNum, dateArrested, allCases, allCharges) => {
  if (!dateArrested || !dateArrested.length || !currCaseNum || !currCaseNum.length) return [];
  const arrest = moment.utc(dateArrested);
  const casesWithArrestBefore = [];
  const casesWithDispositionAfter = new Set();
  if (arrest.isValid) {
    allCases.forEach((caseDetails) => {
      const prevArrestDate = moment.utc(caseDetails.getIn([ARREST_DATE_FQN, 0], ''));
      if (prevArrestDate.isValid && prevArrestDate.isBefore(arrest)) {
        const caseNum = caseDetails.getIn([CASE_ID_FQN, 0]);
        if (caseNum !== currCaseNum) casesWithArrestBefore.push(caseNum);
      }
    });
    allCharges.forEach((chargeDetails) => {
      let caseNum;
      let shouldInclude = false;

      const chargeId = chargeDetails.getIn([CHARGE_ID_FQN, 0], '');
      const caseNums = chargeId.split('|');
      if (caseNums && caseNums.length) {
        [caseNum] = caseNums;
      }

      const dispositionDate = moment.utc(chargeDetails.getIn([DISPOSITION_DATE, 0], ''));
      if (dispositionDate.isValid && dispositionDate.isAfter(arrest)) {
        shouldInclude = true;
      }
      else {
        shouldInclude = true;
      }

      if (shouldInclude && caseNum) {
        casesWithDispositionAfter.add(caseNum);
      }
    });
    return casesWithArrestBefore
      .filter(caseNum => casesWithDispositionAfter.has(caseNum));
  }
  return [];
};

export const tryAutofillPendingCharge = (currCaseNum, dateArrested, allCases, allCharges, defaultValue) => {
  if (!dateArrested.length || !currCaseNum.length) return defaultValue;
  return `${getPendingCharges(currCaseNum, dateArrested, allCases, allCharges).length > 0}`;
};

export const getPreviousMisdemeanors = (allCharges) => {
  if (!allCharges || !allCharges.length) return [];
  return getUnique(allCharges.filter(charge =>
    dispositionFieldIsGuilty(charge[DISPOSITION]) && degreeFieldIsMisdemeanor(charge[CHARGE_DEGREE_FQN]))
    .map(charge => getChargeTitle(charge)));
};

export const tryAutofillPreviousMisdemeanors = allCharges => `${getPreviousMisdemeanors(allCharges).length > 0}`;

export const getPreviousFelonies = (allCharges) => {
  if (!allCharges || !allCharges.length) return [];
  return getUnique(allCharges.filter(charge =>
    dispositionFieldIsGuilty(charge[DISPOSITION]) && degreeFieldIsFelony(charge[CHARGE_DEGREE_FQN]))
    .map(charge => getChargeTitle(charge)));
};

export const tryAutofillPreviousFelonies = allCharges => `${getPreviousFelonies(allCharges).length > 0}`;

export const getPreviousViolentCharges = (allCharges) => {
  if (!allCharges || !allCharges.length) return [];

  return getUnique(allCharges
    .filter((charge) => {
      const chargeNumArr = charge[CHARGE_NUM_FQN];
      return chargeNumArr && chargeNumArr.length
        && dispositionFieldIsGuilty(charge[DISPOSITION]) && chargeFieldIsViolent([chargeNumArr[0]]);
    })
    .map(charge => getChargeTitle(charge)));
};

export const tryAutofillPreviousViolentCharge = (allCharges) => {
  const numViolentCharges = getPreviousViolentCharges(allCharges).length;
  if (numViolentCharges > 3) return '3';
  return `${numViolentCharges}`;
};

export const tryAutofillFields = (
  nextCase,
  nextCharges,
  allCases,
  allCharges,
  currCase,
  selectedPerson,
  psaFormValues
) => {

  let psaForm = psaFormValues;

  const nextArrestDate = nextCase.getIn([ARREST_DATE_FQN, 0], '');
  const currArrestDate = currCase.getIn([ARREST_DATE_FQN, 0], '');

  const nextMostSeriousCharge = nextCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');
  const currMostSeriousCharge = currCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');

  const ageAtCurrentArrest = psaForm.get(AGE_AT_CURRENT_ARREST);
  if (ageAtCurrentArrest === null || nextArrestDate !== currArrestDate) {
    psaForm = psaForm.set(
      AGE_AT_CURRENT_ARREST,
      tryAutofillAge(nextCase.get(ARREST_DATE_FQN), ageAtCurrentArrest, selectedPerson)
    );
  }

  if (nextMostSeriousCharge !== currMostSeriousCharge || nextCharges.size) {
    psaForm = psaForm.set(
      CURRENT_VIOLENT_OFFENSE,
      tryAutofillCurrentViolentCharge(nextCharges, nextMostSeriousCharge)
    );
  }

  const pendingCharge = psaForm.get(PENDING_CHARGE);
  if (pendingCharge === null || nextArrestDate !== currArrestDate) {
    psaForm = psaForm.set(
      PENDING_CHARGE,
      tryAutofillPendingCharge(
        nextCase.getIn([CASE_ID_FQN, 0], ''),
        nextArrestDate,
        allCases,
        allCharges,
        pendingCharge
      )
    );
  }

  if (allCharges.size) {
    const priorMisdemeanor = psaForm.get(PRIOR_MISDEMEANOR);
    if (priorMisdemeanor === null) {
      psaForm = psaForm.set(PRIOR_MISDEMEANOR, tryAutofillPreviousMisdemeanors(allCharges.toJS()));
    }
    const priorFelony = psaForm.get(PRIOR_FELONY);
    if (priorFelony === null) {
      psaForm = psaForm.set(PRIOR_FELONY, tryAutofillPreviousFelonies(allCharges.toJS()));
    }
    if (priorMisdemeanor === 'false' && priorFelony === 'false') {
      psaForm = psaForm.set(PRIOR_VIOLENT_CONVICTION, '0');
      psaForm = psaForm.set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
    }
    else if (psaForm.get(PRIOR_VIOLENT_CONVICTION) === null) {
      psaForm = psaForm.set(PRIOR_VIOLENT_CONVICTION, tryAutofillPreviousViolentCharge(allCharges.toJS()));
    }
  }
  return psaForm.toJS();
};
