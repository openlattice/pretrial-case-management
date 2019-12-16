/*
 * @flow
 */

import Immutable, { Map, List } from 'immutable';
import { DateTime } from 'luxon';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA, DMF } from './consts/Consts';
import {
  historicalChargeIsViolent,
  chargeIsFelony,
  chargeIsMisdemeanor,
  chargeIsGuilty,
  getChargeTitle,
  getChargeDetails,
  shouldIgnoreCharge
} from './HistoricalChargeUtils';
import { getSentenceToIncarcerationCaseNums } from './SentenceUtils';
import {
  getViolentChargeLabels,
  getDMFStepChargeLabels,
  getBHEAndBREChargeLabels
} from './ArrestChargeUtils';
import { getRecentFTAs, getOldFTAs } from './FTAUtils';
import { formatAutofill } from './FormattingUtils';

const {
  DOB,
  ARREST_DATE,
  ARREST_DATE_TIME,
  CHARGE_STATUTE,
  CASE_ID,
  CHARGE_ID,
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
  currCharges :List<*>,
  violentChargeList :Map<*, *>
) :string => `${getViolentChargeLabels({ currCharges, violentChargeList }).size > 0}`;

export const tryAutofillAge = (
  dateArrested :string,
  defaultValue :string,
  selectedPerson :Map<*, *>
) :string => {
  const dob = DateTime.fromISO(selectedPerson.getIn([DOB, 0], ''));
  let arrest = DateTime.fromISO(dateArrested);
  if (!arrest.isValid) arrest = DateTime.local();
  let ageAtCurrentArrestValue = defaultValue;
  if (dob.isValid && arrest.isValid) {
    const age = Math.floor(arrest.diff(dob, 'years').years);
    if (!Number.isNaN(age)) {
      if (age <= 20) ageAtCurrentArrestValue = '0';
      if (age === 21 || age === 22) ageAtCurrentArrestValue = '1';
      if (age >= 23) ageAtCurrentArrestValue = '2';
    }
  }
  return ageAtCurrentArrestValue;
};

/* Mapping util functions */
const mapToLabels = (allCharges :List<*>, filterFn :(allCharges :List<*>) => List<*>) => (
  filterFn(allCharges.filter(charge => !shouldIgnoreCharge(charge))).map(charge => getChargeTitle(charge))
);

const mapToDetails = (allCharges :List<*>, filterFn :(allCharges :List<*>) => List<*>) => (
  filterFn(allCharges.filter(charge => !shouldIgnoreCharge(charge))).map(charge => getChargeDetails(charge))
);
/* Filter charge lists */
const filterPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List<*>,
  allCharges :List<*>
) :List<*> => {
  if (!dateArrested || !dateArrested.length || !currCaseNum || !currCaseNum.length) return List();
  const arrestDate = DateTime.fromISO(dateArrested);
  let casesWithArrestBefore = Immutable.OrderedSet(); // Set of case numbers with an arrest date before the current one
  let casesWithDispositionAfter = Map(); // Map from case nums to charge list with date after current arrest

  if (arrestDate.isValid) {
    allCases.forEach((caseDetails) => {
      const prevArrestDate = DateTime.fromISO(caseDetails.getIn([ARREST_DATE_TIME, 0],
        caseDetails.getIn([ARREST_DATE, 0],
          caseDetails.getIn([FILE_DATE, 0], ''))));
      if (prevArrestDate.isValid && prevArrestDate < arrestDate) {
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
        const dispositionDate = DateTime.fromISO(dispositionDateStr);
        if (dispositionDate.isValid && dispositionDate > arrestDate) {
          shouldInclude = true;
        }
      }

      if (
        chargeDescription === 'PROBATION VIOLATION'
        || chargeDescription === 'VIOLATION OF A VALID COURT ORDER'
      ) shouldInclude = false;

      if (shouldInclude && caseNum) {
        casesWithDispositionAfter = casesWithDispositionAfter.set(
          caseNum,
          casesWithDispositionAfter.get(caseNum, List()).push(chargeDetails)
        );
      }
    });
    return casesWithArrestBefore.flatMap(caseNum => casesWithDispositionAfter.get(caseNum, List()));
  }
  return List();
};

const filterPreviousMisdemeanors = (allCharges :List<*>) :List<*> => {
  if (!allCharges.size) return List();
  return allCharges.filter(charge => chargeIsGuilty(charge) && chargeIsMisdemeanor(charge));
};

const filterPreviousFelonies = (allCharges :List<*>) :List<*> => {
  if (!allCharges.size) return List();
  return allCharges.filter(charge => chargeIsGuilty(charge) && chargeIsFelony(charge));
};

const filterPreviousViolentCharges = (
  allCharges :List<*>,
  violentChargeList :Map<*, *>
) :List<*> => {
  if (!allCharges.size) return List();

  return allCharges
    .filter((charge) => {
      const chargeNum = charge.getIn([CHARGE_STATUTE, 0], '');
      return chargeNum.length && chargeIsGuilty(charge) && historicalChargeIsViolent({ charge, violentChargeList });
    });
};

/* Transform filtered charge lists */

export const getPendingChargeLabels = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List<*>,
  allCharges :List<*>
) => (
  filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges).map(charge => getChargeTitle(charge))
);

export const getPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List<*>,
  allCharges :List<*>
) => (
  filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges).map(charge => getChargeDetails(charge))
);

export const getPreviousMisdemeanorLabels = (allCharges :List<*, *>) => (
  mapToLabels(allCharges, filterPreviousMisdemeanors)
);

export const getPreviousMisdemeanors = (allCharges :List<*, *>) => (
  mapToDetails(allCharges, filterPreviousMisdemeanors)
);
export const getPreviousFelonyLabels = (allCharges :List<*, *>) => (
  mapToLabels(allCharges, filterPreviousFelonies)
);

export const getPreviousFelonies = (allCharges :List<*, *>) => (
  mapToDetails(allCharges, filterPreviousFelonies)
);

export const getPreviousViolentChargeLabels = (allCharges :List<*>, violentChargeList :Map<*, *>) => (
  filterPreviousViolentCharges(
    allCharges.filter(charge => !shouldIgnoreCharge(charge)),
    violentChargeList
  ).map(charge => getChargeTitle(charge))
);

export const getPreviousViolentCharges = (allCharges :List<*>, violentChargeList :Map<*, *>) => (
  filterPreviousViolentCharges(
    allCharges.filter(charge => !shouldIgnoreCharge(charge)),
    violentChargeList
  ).map(charge => getChargeDetails(charge))
);

/* Autofill based on filtered charge list sizes */

export const tryAutofillPendingCharge = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List<*>,
  allCharges :List<*>,
  defaultValue :string
) => {
  if (!dateArrested.length || !currCaseNum.length) return defaultValue;
  return `${filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges).size > 0}`;
};

export const tryAutofillPreviousMisdemeanors = (allCharges :List<*>) :string => (
  `${filterPreviousMisdemeanors(allCharges).size > 0}`
);
export const tryAutofillPreviousFelonies = (allCharges :List<*>) :string => (
  `${filterPreviousFelonies(allCharges).size > 0}`
);

export const tryAutofillPreviousViolentCharge = (allCharges :List<*>, violentChargeList :Map<*, *>) :string => {
  const numViolentCharges = filterPreviousViolentCharges(allCharges, violentChargeList).size;
  if (numViolentCharges > 3) return '3';
  return `${numViolentCharges}`;
};

export const tryAutofillPriorSentenceToIncarceration = (allSentences :List<*>) :string => (
  `${getSentenceToIncarcerationCaseNums(allSentences).size > 0}`
);

export const tryAutofillDMFStepTwo = (currCharges :List<*>, dmfStep2ChargeList :Map<*, *>) :string => {
  const { step2Charges } = getDMFStepChargeLabels({ currCharges, dmfStep2ChargeList });
  return (
    `${step2Charges.size > 0}`
  );
};

export const tryAutofillDMFStepFour = (currCharges :List<*>, dmfStep4ChargeList :Map<*, *>) :string => {
  const { step4Charges } = getDMFStepChargeLabels({ currCharges, dmfStep4ChargeList });
  return (
    `${step4Charges.size > 0}`
  );
};

export const tryAutofillDMFSecondaryReleaseCharges = (
  currCharges :List<*>,
  bookingHoldExceptionChargeList :Map<*, *>
) :string => {
  const {
    currentBHECharges
  } = getBHEAndBREChargeLabels({
    currCharges,
    bookingHoldExceptionChargeList
  });
  return `${!!currentBHECharges.size && currentBHECharges.size === currCharges.size}`;
};

export const tryAutofillDMFSecondaryHoldCharges = (
  currCharges :List<*>,
  bookingReleaseExceptionChargeList :Map<*, *>
) :string => {
  const {
    currentBRECharges
  } = getBHEAndBREChargeLabels({
    currCharges,
    bookingReleaseExceptionChargeList
  });
  return (
    `${!!currentBRECharges.size}`
  );
};

export const tryAutofillRecentFTAs = (allFTAs :List<*>, allCharges :List<*>) :string => {
  const numFTAs = getRecentFTAs(allFTAs, allCharges).size;
  return `${numFTAs > 2 ? 2 : numFTAs}`;
};

export const tryAutofillOldFTAs = (allFTAs :List<*>, allCharges :List<*>) :string => (
  `${getOldFTAs(allFTAs, allCharges).size > 0}`
);

export const tryAutofillFields = (
  nextCase :Map<*, *>,
  nextCharges :List<*>,
  allCases :List<*>,
  allCharges :List<*>,
  allSentences :List<*>,
  allFTAs :List<*>,
  selectedPerson :Map<*, *>,
  psaFormValues :Map<*, *>,
  violentArrestChargeList :Map<*, *>,
  violentCourtChargeList :Map<*, *>,
  dmfStep2ChargeList :Map<*, *>,
  dmfStep4ChargeList :Map<*, *>,
  bookingReleaseExceptionChargeList :Map<*, *>,
  bookingHoldExceptionChargeList :Map<*, *>
) :Map<*, *> => {

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
    psaForm = psaForm.set(
      SECONDARY_RELEASE_CHARGES,
      `${(!!currentBHECharges.size && (currentBHECharges.size === nextCharges.size))}`
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

export const getJustificationText = (autofillJustifications :List, justificationHeader :string) :string => {
  let justificationText = '';
  if (autofillJustifications) {
    justificationText = !autofillJustifications.isEmpty()
      ? formatAutofill(autofillJustifications)
      : 'No matching charges.';
    if (justificationHeader) {
      justificationText = `${justificationHeader}: ${justificationText}`;
    }
  }
  return justificationText;
};
