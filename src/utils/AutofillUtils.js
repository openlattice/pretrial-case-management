/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA } from './consts/Consts';
import {
  chargeFieldIsViolent,
  degreeFieldIsFelony,
  degreeFieldIsMisdemeanor,
  dispositionFieldIsGuilty,
  getViolentChargeNums,
  getChargeTitle
} from './consts/ChargeConsts';

const {
  DOB,
  ARREST_DATE,
  MOST_SERIOUS_CHARGE_NO,
  CHARGE_STATUTE,
  CASE_ID,
  CHARGE_ID,
  CHARGE_LEVEL,
  DISPOSITION,
  DISPOSITION_DATE,
  FILE_DATE
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

export const getViolentCharges = (charges :Immutable.List<*>, mostSeriousCharge :string) :Immutable.List<*> => {
  if (!charges.size) {
    if (!mostSeriousCharge) return Immutable.List();
    if (getViolentChargeNums(Immutable.List.of(mostSeriousCharge)).size) {
      return Immutable.List.of(mostSeriousCharge);
    }
  }

  const chargesNumsToConsider = charges
    .filter(charge => charge.get(CHARGE_STATUTE, Immutable.List()).size)
    .map(charge => charge.getIn([CHARGE_STATUTE, 0], ''));
  if (mostSeriousCharge && mostSeriousCharge.length) chargesNumsToConsider.push(mostSeriousCharge);
  const violentChargeNums = getViolentChargeNums(chargesNumsToConsider);

  return charges.filter((charge) => {
    if (!charge.get(CHARGE_STATUTE, Immutable.List()).size) return false;
    return violentChargeNums.includes(charge.getIn([CHARGE_STATUTE, 0], ''));
  }).map(charge => getChargeTitle(charge));
};

export const tryAutofillCurrentViolentCharge = (charges :Immutable.List<*>, mostSeriousCharge :string) :string =>
  `${getViolentCharges(charges, mostSeriousCharge).size > 0}`;

export const tryAutofillAge = (
  dateArrested :string,
  defaultValue :string,
  selectedPerson :Immutable.Map<*, *>
) :string => {
  const dob = moment.utc(selectedPerson.getIn([DOB, 0], ''));
  let arrest = moment.utc(dateArrested);
  if (!arrest.isValid()) arrest = moment();
  let ageAtCurrentArrestValue = defaultValue;
  if (dob.isValid() && arrest.isValid()) {
    const age = Math.floor(moment.duration(arrest.diff(dob)).asYears());
    if (!Number.isNaN(age)) {
      if (age <= 20) ageAtCurrentArrestValue = '0';
      if (age === 21 || age === 22) ageAtCurrentArrestValue = '1';
      if (age >= 23) ageAtCurrentArrestValue = '2';
    }
  }
  return ageAtCurrentArrestValue;
};

export const getPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>
) :Immutable.List<*> => {
  if (!dateArrested || !dateArrested.length || !currCaseNum || !currCaseNum.length) return Immutable.List();
  const arrest = moment.utc(dateArrested);
  let casesWithArrestBefore = Immutable.List();
  let casesWithDispositionAfter = Immutable.Set();
  if (arrest.isValid()) {
    allCases.forEach((caseDetails) => {
      const prevArrestDate = moment.utc(caseDetails.getIn([ARREST_DATE, 0], caseDetails.getIn([FILE_DATE, 0], '')));
      if (prevArrestDate.isValid() && prevArrestDate.isBefore(arrest)) {
        const caseNum = caseDetails.getIn([CASE_ID, 0]);
        if (caseNum !== currCaseNum) casesWithArrestBefore = casesWithArrestBefore.push(caseNum);
      }
    });
    allCharges.forEach((chargeDetails) => {
      let caseNum;
      let shouldInclude = false;

      const chargeId = chargeDetails.getIn([CHARGE_ID, 0], '');
      const caseNums = chargeId.split('|');
      if (caseNums && caseNums.length) {
        [caseNum] = caseNums;
      }

      const dispositionDateStr = chargeDetails.getIn([DISPOSITION_DATE, 0], '');
      if (!dispositionDateStr.length) {
        shouldInclude = true;
      }
      else {
        const dispositionDate = moment.utc(dispositionDateStr);
        if (dispositionDate.isValid() && dispositionDate.isAfter(arrest)) {
          shouldInclude = true;
        }
      }

      if (shouldInclude && caseNum) {
        casesWithDispositionAfter = casesWithDispositionAfter.add(caseNum);
      }
    });
    return casesWithArrestBefore
      .filter(caseNum => casesWithDispositionAfter.has(caseNum));
  }
  return Immutable.List();
};

export const tryAutofillPendingCharge = (
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  defaultValue :string
) :string => {
  if (!dateArrested.length || !currCaseNum.length) return defaultValue;
  return `${getPendingCharges(currCaseNum, dateArrested, allCases, allCharges).size > 0}`;
};

export const getPreviousMisdemeanors = (allCharges :Immutable.List<*>) :Immutable.List<*> => {
  if (!allCharges.size) return Immutable.List();
  return allCharges.filter(charge =>
    dispositionFieldIsGuilty(charge.get(DISPOSITION, Immutable.List()))
    && degreeFieldIsMisdemeanor(charge.get(CHARGE_LEVEL, Immutable.List())))
    .map(charge => getChargeTitle(charge));
};

export const tryAutofillPreviousMisdemeanors = (allCharges :Immutable.List<*>) :string =>
  `${getPreviousMisdemeanors(allCharges).size > 0}`;

export const getPreviousFelonies = (allCharges :Immutable.List<*>) :Immutable.List<*> => {
  if (!allCharges.size) return Immutable.List();
  return allCharges.filter(charge =>
    dispositionFieldIsGuilty(charge.get(DISPOSITION, Immutable.List()))
    && degreeFieldIsFelony(charge.get(CHARGE_LEVEL, Immutable.List())))
    .map(charge => getChargeTitle(charge));
};

export const tryAutofillPreviousFelonies = (allCharges :Immutable.List<*>) :string =>
  `${getPreviousFelonies(allCharges).size > 0}`;

export const getPreviousViolentCharges = (allCharges :Immutable.List<*>) :Immutable.List<*> => {
  if (!allCharges.size) return Immutable.List();

  return allCharges
    .filter((charge) => {
      const chargeNum = charge.getIn([CHARGE_STATUTE, 0], '');
      return chargeNum.length
        && dispositionFieldIsGuilty(charge.get(DISPOSITION, Immutable.List()))
        && chargeFieldIsViolent(Immutable.List.of(chargeNum));
    })
    .map(charge => getChargeTitle(charge));
};

export const tryAutofillPreviousViolentCharge = (allCharges :Immutable.List<*>) :string => {
  const numViolentCharges = getPreviousViolentCharges(allCharges).size;
  if (numViolentCharges > 3) return '3';
  return `${numViolentCharges}`;
};

export const tryAutofillFields = (
  nextCase :Immutable.Map<*, *>,
  nextCharges :Immutable.List<*>,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  selectedPerson :Immutable.Map<*, *>,
  psaFormValues :Immutable.Map<*, *>
) :Immutable.Map<*, *> => {

  let psaForm = psaFormValues;

  const nextArrestDate = nextCase.getIn([ARREST_DATE, 0], nextCase.getIn([FILE_DATE, 0], ''));

  const ageAtCurrentArrest = psaForm.get(AGE_AT_CURRENT_ARREST);
  psaForm = psaForm.set(
    AGE_AT_CURRENT_ARREST,
    tryAutofillAge(
      nextArrestDate,
      ageAtCurrentArrest,
      selectedPerson
    )
  );

  // current violent offense
  const nextMostSeriousCharge = nextCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');
  if (nextCharges.size || nextMostSeriousCharge.length) {
    psaForm = psaForm.set(
      CURRENT_VIOLENT_OFFENSE,
      tryAutofillCurrentViolentCharge(nextCharges, nextMostSeriousCharge)
    );
  }

  // pending charge
  psaForm = psaForm.set(
    PENDING_CHARGE,
    tryAutofillPendingCharge(
      nextCase.getIn([CASE_ID, 0], ''),
      nextArrestDate,
      allCases,
      allCharges,
      psaForm.get(PENDING_CHARGE)
    )
  );

  if (allCharges.size) {
    psaForm = psaForm.set(PRIOR_MISDEMEANOR, tryAutofillPreviousMisdemeanors(allCharges));
    psaForm = psaForm.set(PRIOR_FELONY, tryAutofillPreviousFelonies(allCharges));

    const priorMisdemeanor = psaForm.get(PRIOR_MISDEMEANOR);
    const priorFelony = psaForm.get(PRIOR_FELONY);
    if (priorMisdemeanor === 'false' && priorFelony === 'false') {
      psaForm = psaForm.set(PRIOR_VIOLENT_CONVICTION, '0');
      psaForm = psaForm.set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
    }
    else {
      psaForm = psaForm.set(PRIOR_VIOLENT_CONVICTION, tryAutofillPreviousViolentCharge(allCharges));
    }
  }
  return psaForm;
};
