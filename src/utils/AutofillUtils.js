import moment from 'moment';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
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

export const getViolentCharges = (charges, mostSeriousCharge) => {
  if ((!charges || !charges.length) && !mostSeriousCharge) return [];
  const chargesToConsider = charges || [];
  if (mostSeriousCharge && mostSeriousCharge[CHARGE_NUM_FQN]) chargesToConsider.push(mostSeriousCharge[CHARGE_NUM_FQN]);
  return getViolentChargeNums(chargesToConsider).map(charge => getChargeTitle(charge));
};

export const tryAutofillCurrentViolentCharge = (charges, mostSeriousCharge) => {
  return `${getViolentCharges(charges, mostSeriousCharge).length > 0}`
};

export const tryAutofillAge = (dateArrested, defaultValue, selectedPerson) => {
  const dob = moment.utc(selectedPerson[DOB]);
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

export const getPendingCharges = (currCaseNums, dateArrested, allCases, allCharges) => {
  if (!dateArrested || !dateArrested.length || !currCaseNums || !currCaseNums.length) return [];
  const currCaseNum = currCaseNums[0];
  const arrest = moment.utc(dateArrested[0]);
  const casesWithArrestBefore = [];
  const casesWithDispositionAfter = new Set();
  if (arrest.isValid) {
    allCases.forEach((caseDetails) => {
      const prevArrestDates = caseDetails[ARREST_DATE_FQN];
      if (prevArrestDates && prevArrestDates.length) {
        const prevArrestDate = moment.utc(prevArrestDates[0]);
        if (prevArrestDate.isValid && prevArrestDate.isBefore(arrest)) {
          const caseNum = caseDetails[CASE_ID_FQN][0];
          if (caseNum !== currCaseNum) casesWithArrestBefore.push(caseNum);
        }
      }
    });
    allCharges.forEach((chargeDetails) => {
      let caseNum;
      let shouldInclude = false;

      const chargeId = chargeDetails[CHARGE_ID_FQN][0];
      const caseNums = chargeId.split('|');
      if (caseNums && caseNums.length) {
        [caseNum] = caseNums;
      }

      const dispositionDates = chargeDetails[DISPOSITION_DATE];
      if (dispositionDates && dispositionDates.length) {
        const dispositionDate = moment.utc(dispositionDates[0]);
        if (dispositionDate.isValid && dispositionDate.isAfter(arrest)) {
          shouldInclude = true;
        }
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

export const tryAutofillPendingCharge = (currCaseNums, dateArrested, allCases, allCharges, defaultValue) => {
  if (!dateArrested || !dateArrested.length || !currCaseNums || !currCaseNums.length) return defaultValue;
  return `${getPendingCharges(currCaseNums, dateArrested, allCases, allCharges).length > 0}`;
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
    .filter(charge => dispositionFieldIsGuilty(charge[DISPOSITION]) && chargeFieldIsViolent([charge]))
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

  let {
    ageAtCurrentArrest,
    currentViolentOffense,
    pendingCharge,
    priorMisdemeanor,
    priorFelony,
    priorViolentConviction,
    priorSentenceToIncarceration
  } = psaFormValues;

  if (ageAtCurrentArrest === null || nextCase[ARREST_DATE_FQN] !== currCase[ARREST_DATE_FQN]) {
    ageAtCurrentArrest = tryAutofillAge(nextCase[ARREST_DATE_FQN], ageAtCurrentArrest, selectedPerson);
  }
  if (nextCase[MOST_SERIOUS_CHARGE_NO] !== currCase[MOST_SERIOUS_CHARGE_NO] || (nextCharges && nextCharges.length)) {
    currentViolentOffense = tryAutofillCurrentViolentCharge(nextCharges, nextCase[MOST_SERIOUS_CHARGE_NO]);
  }
  if (pendingCharge === null || nextCase[ARREST_DATE_FQN] !== currCase[ARREST_DATE_FQN]) {
    pendingCharge = tryAutofillPendingCharge(
      nextCase[CASE_ID_FQN],
      nextCase[ARREST_DATE_FQN],
      allCases,
      allCharges,
      pendingCharge
    );
  }
  if (allCharges && allCharges.length) {
    if (priorMisdemeanor === null) {
      priorMisdemeanor = tryAutofillPreviousMisdemeanors(allCharges);
    }
    if (priorFelony === null) {
      priorFelony = tryAutofillPreviousFelonies(allCharges);
    }
    if (priorMisdemeanor === 'false' && priorFelony === 'false') {
      priorViolentConviction = '0';
      priorSentenceToIncarceration = 'false';
    }
    else if (priorViolentConviction === null) {
      priorViolentConviction = tryAutofillPreviousViolentCharge(allCharges);
    }
  }
  return {
    ageAtCurrentArrest,
    currentViolentOffense,
    pendingCharge,
    priorMisdemeanor,
    priorFelony,
    priorViolentConviction,
    priorSentenceToIncarceration
  };
};
