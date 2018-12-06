/*
 * @flow
 */

import Immutable, { Map } from 'immutable';
import moment from 'moment';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA, DMF } from './consts/Consts';
import {
  chargeIsViolent,
  historicalChargeIsViolent,
  chargeIsFelony,
  chargeIsMisdemeanor,
  chargeIsGuilty,
  getViolentChargeNums,
  getChargeTitle,
  getChargeDetails,
  shouldIgnoreCharge
} from './HistoricalChargeUtils';
import { getSentenceToIncarcerationCaseNums } from './SentenceUtils';
import {
  getAllViolentCharges,
  getAllStepTwoCharges,
  getAllStepFourCharges,
  getAllSecondaryReleaseCharges,
  getAllSecondaryHoldCharges,
  getViolentChargeLabels,
  getDMFStepChargeLabels,
  getBHEAndBREChargeLabels
} from './ArrestChargeUtils';
import { getRecentFTAs, getOldFTAs } from './FTAUtils';

const {
  DOB,
  ARREST_DATE,
  ARREST_DATE_TIME,
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
  PRIOR_SENTENCE_TO_INCARCERATION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD
} = PSA;

const {
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = DMF;

export const tryAutofillCurrentViolentCharge = (
  charges :Immutable.List<*>,
  violentArrestChargeList :Immutable.Map<*, *>
) :string => `${getAllViolentCharges(charges).size > 0}`;
// TODO: NEED TO UPDATE TO return value below when we release the manage charges UI.
// ) :string => `${getViolentChargeLabels({charges, violentArrestChargeList}).size > 0}`;

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

/* Mapping util functions */
const mapToLabels = (allCharges :Immutable.List<*>, filterFn :(allCharges :Immutable.List<*>) => Immutable.List<*>) => (
  filterFn(allCharges.filter(charge => !shouldIgnoreCharge(charge))).map(charge => getChargeTitle(charge))
);

const mapToDetails = (allCharges :Immutable.List<*>, filterFn :(allCharges :Immutable.List<*>) => Immutable.List<*>) => (
  filterFn(allCharges.filter(charge => !shouldIgnoreCharge(charge))).map(charge => getChargeDetails(charge))
);
/* Filter charge lists */
const filterPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>
) :Immutable.List<*> => {
  if (!dateArrested || !dateArrested.length || !currCaseNum || !currCaseNum.length) return Immutable.List();
  const arrestDate = moment(dateArrested);
  let casesWithArrestBefore = Immutable.OrderedSet(); // Set of case numbers with an arrest date before the current one
  let casesWithDispositionAfter = Immutable.Map(); // Map from case nums to charge list with date after current arrest

  if (arrestDate.isValid()) {
    allCases.forEach((caseDetails) => {
      const prevArrestDate = moment(caseDetails.getIn([ARREST_DATE_TIME, 0],
        caseDetails.getIn([ARREST_DATE, 0],
          caseDetails.getIn([FILE_DATE, 0], ''))));
      if (prevArrestDate.isValid() && prevArrestDate.isBefore(arrestDate)) {
        const caseNum = caseDetails.getIn([CASE_ID, 0]);
        if (caseNum !== currCaseNum) casesWithArrestBefore = casesWithArrestBefore.add(caseNum);
      }
    });
    allCharges.filter(charge => !shouldIgnoreCharge(charge)).forEach((chargeDetails) => {
      let caseNum;
      let shouldInclude = false;
      const chargeDescription = chargeDetails.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0]);

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
        const dispositionDate = moment(dispositionDateStr);
        if (dispositionDate.isValid() && dispositionDate.isAfter(arrestDate)) {
          shouldInclude = true;
        }
      }

      if (chargeDescription === 'PROBATION VIOLATION') shouldInclude = false;

      if (shouldInclude && caseNum) {
        casesWithDispositionAfter = casesWithDispositionAfter.set(
          caseNum,
          casesWithDispositionAfter.get(caseNum, Immutable.List()).push(chargeDetails)
        );
      }
    });
    return casesWithArrestBefore.flatMap(caseNum => casesWithDispositionAfter.get(caseNum, Immutable.List()));
  }
  return Immutable.List();
};

const filterPreviousMisdemeanors = (allCharges :Immutable.List<*>) :Immutable.List<*> => {
  if (!allCharges.size) return Immutable.List();
  return allCharges.filter(charge => chargeIsGuilty(charge) && chargeIsMisdemeanor(charge));
};

const filterPreviousFelonies = (allCharges :Immutable.List<*>) :Immutable.List<*> => {
  if (!allCharges.size) return Immutable.List();
  return allCharges.filter(charge => chargeIsGuilty(charge) && chargeIsFelony(charge));
};

const filterPreviousViolentCharges = (
  allCharges :Immutable.List<*>,
  violentChargeList :Map<*, *>
) :Immutable.List<*> => {
  if (!allCharges.size) return Immutable.List();

  return allCharges
    .filter((charge) => {
      const chargeNum = charge.getIn([CHARGE_STATUTE, 0], '');
      return chargeNum.length && chargeIsGuilty(charge) && chargeIsViolent(charge);
      // TODO: NEED TO UPDATE TO return value below when we release the manage charges UI.
      // return chargeNum.length && chargeIsGuilty(charge) && historicalChargeIsViolent({charge, violentChargeList});
    });
};

/* Transform filtered charge lists */

export const getPendingChargeLabels = (
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>
) => (
  filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges).map(charge => getChargeTitle(charge))
);

export const getPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>
) => (
  filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges).map(charge => getChargeDetails(charge))
);

export const getPreviousMisdemeanorLabels = (allCharges :Immutable.List<*, *>) => (
  mapToLabels(allCharges, filterPreviousMisdemeanors)
);

export const getPreviousMisdemeanors = (allCharges :Immutable.List<*, *>) => (
  mapToDetails(allCharges, filterPreviousMisdemeanors)
);
export const getPreviousFelonyLabels = (allCharges :Immutable.List<*, *>) => (
  mapToLabels(allCharges, filterPreviousFelonies)
);

export const getPreviousFelonies = (allCharges :Immutable.List<*, *>) => (
  mapToDetails(allCharges, filterPreviousFelonies)
);

export const getPreviousViolentChargeLabels = (allCharges :Immutable.List<*>) => (
  mapToLabels(allCharges, filterPreviousViolentCharges)
);

export const getPreviousViolentCharges = (allCharges :Immutable.List<*>) => (
  mapToDetails(allCharges, filterPreviousViolentCharges)
);

/* Autofill based on filtered charge list sizes */

export const tryAutofillPendingCharge = (
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  defaultValue :string
) => {
  if (!dateArrested.length || !currCaseNum.length) return defaultValue;
  return `${filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges).size > 0}`;
};

export const tryAutofillPreviousMisdemeanors = (allCharges :Immutable.List<*>) :string => (
  `${filterPreviousMisdemeanors(allCharges).size > 0}`
);
export const tryAutofillPreviousFelonies = (allCharges :Immutable.List<*>) :string => (
  `${filterPreviousFelonies(allCharges).size > 0}`
);

export const tryAutofillPreviousViolentCharge = (allCharges :Immutable.List<*>) :string => {
  const numViolentCharges = filterPreviousViolentCharges(allCharges).size;
  if (numViolentCharges > 3) return '3';
  return `${numViolentCharges}`;
};

export const tryAutofillPriorSentenceToIncarceration = (allSentences :Immutable.List<*>) :string => (
  `${getSentenceToIncarcerationCaseNums(allSentences).size > 0}`
);

export const tryAutofillDMFStepTwo = (currCharges :Immutable.List<*>) :string => (
  `${getAllStepTwoCharges(currCharges).size > 0}`
);

export const tryAutofillDMFStepFour = (currCharges :Immutable.List<*>) :string => (
  `${getAllStepFourCharges(currCharges).size > 0}`
);

export const tryAutofillDMFSecondaryReleaseCharges = (currCharges :Immutable.List<*>) :string => {
  const bheCharges = getAllSecondaryReleaseCharges(currCharges);
  return `${!!bheCharges.size && bheCharges.size === currCharges.size}`;
};

export const tryAutofillDMFSecondaryHoldCharges = (currCharges :Immutable.List<*>) :string => (
  `${!!getAllSecondaryHoldCharges(currCharges).size}`
);

export const tryAutofillRecentFTAs = (allFTAs :Immutable.List<*>, allCharges :Immutable.List<*>) :string => {
  const numFTAs = getRecentFTAs(allFTAs, allCharges).size;
  return `${numFTAs > 2 ? 2 : numFTAs}`;
};

export const tryAutofillOldFTAs = (allFTAs :Immutable.List<*>, allCharges :Immutable.List<*>) :string => (
  `${getOldFTAs(allFTAs, allCharges).size > 0}`
);

export const tryAutofillFields = (
  nextCase :Immutable.Map<*, *>,
  nextCharges :Immutable.List<*>,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  allFTAs :Immutable.List<*>,
  selectedPerson :Immutable.Map<*, *>,
  psaFormValues :Immutable.Map<*, *>,
  violentArrestChargeList :Immutable.Map<*, *>,
  violentCourtChargeList :Immutable.Map<*, *>,
  dmfStep2ChargeList :Immutable.Map<*, *>,
  dmfStep4ChargeList :Immutable.Map<*, *>,
  bookingReleaseExceptionChargeList :Immutable.Map<*, *>,
  bookingHoldExceptionChargeList :Immutable.Map<*, *>
) :Immutable.Map<*, *> => {

  let psaForm = psaFormValues;

  const nextArrestDate = nextCase.getIn([ARREST_DATE_TIME, 0],
    nextCase.getIn([ARREST_DATE, 0],
      nextCase.getIn([FILE_DATE, 0], '')));

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
  if (nextCharges.size) {
    psaForm = psaForm.set(
      CURRENT_VIOLENT_OFFENSE,
      tryAutofillCurrentViolentCharge(nextCharges, violentArrestChargeList)
    );

    // DMF
    const { step2Charges, step4Charges } = getDMFStepChargeLabels({
      currCharges: nextCharges,
      dmfStep2ChargeList,
      dmfStep4ChargeList
    });
    // psaForm = psaForm.set(STEP_2_CHARGES, tryAutofillDMFStepTwo(nextCharges, dmfStep2ChargeList));
    // psaForm = psaForm.set(STEP_4_CHARGES, tryAutofillDMFStepFour(nextCharges, dmfStep4ChargeList));
    psaForm = psaForm.set(STEP_2_CHARGES, `${step2Charges.size > 0}`);
    psaForm = psaForm.set(STEP_4_CHARGES, `${step4Charges.size > 0}`);

    // Booking
    const {
      currentBHECharges,
      currentBRECharges
    } = getBHEAndBREChargeLabels({
      currCharges: nextCharges,
      bookingReleaseExceptionChargeList,
      bookingHoldExceptionChargeList
    });
    // psaForm = psaForm.set(
    //   SECONDARY_RELEASE_CHARGES,
    //   tryAutofillDMFSecondaryReleaseCharges(nextCharges, bookingReleaseExceptionChargeList)
    // );
    // psaForm = psaForm.set(
    //   SECONDARY_HOLD_CHARGES,
    //   tryAutofillDMFSecondaryHoldCharges(nextCharges, bookingHoldExceptionChargeList)
    // );
    psaForm = psaForm.set(
      SECONDARY_RELEASE_CHARGES,
      `${!!currentBHECharges.size && (currentBHECharges.size === nextCharges.size)}`
    );
    psaForm = psaForm.set(
      SECONDARY_HOLD_CHARGES,
      `${!!currentBRECharges.size}`
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

  psaForm = psaForm.set(PRIOR_MISDEMEANOR, tryAutofillPreviousMisdemeanors(allCharges));
  psaForm = psaForm.set(PRIOR_FELONY, tryAutofillPreviousFelonies(allCharges));

  const priorMisdemeanor = psaForm.get(PRIOR_MISDEMEANOR);
  const priorFelony = psaForm.get(PRIOR_FELONY);
  if (priorMisdemeanor === 'false' && priorFelony === 'false') {
    psaForm = psaForm.set(PRIOR_VIOLENT_CONVICTION, '0');
    psaForm = psaForm.set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
  }
  else {
    psaForm = psaForm.set(
      PRIOR_VIOLENT_CONVICTION,
      tryAutofillPreviousViolentCharge(allCharges, violentCourtChargeList)
    );
    psaForm = psaForm.set(PRIOR_SENTENCE_TO_INCARCERATION, tryAutofillPriorSentenceToIncarceration(allSentences));
  }

  psaForm = psaForm.set(PRIOR_FAILURE_TO_APPEAR_RECENT, tryAutofillRecentFTAs(allFTAs, allCharges));
  psaForm = psaForm.set(PRIOR_FAILURE_TO_APPEAR_OLD, tryAutofillOldFTAs(allFTAs, allCharges));

  return psaForm;
};
