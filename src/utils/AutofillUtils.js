/*
 * @flow
 */
import Immutable, { Map, List } from 'immutable';
import { DateTime } from 'luxon';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { NOTES, PSA } from './consts/Consts';
import { RCM_FIELDS } from './consts/RCMResultsConsts';
import { getEntityProperties } from './DataUtils';
import { getSentenceToIncarcerationCaseNums, getChargeIdToSentenceDate } from './SentenceUtils';
import {
  historicalChargeIsViolent,
  chargeIsFelony,
  chargeIsMisdemeanor,
  convictionAndGuilty,
  getChargeTitle,
  getChargeDetails,
  shouldIgnoreCharge
} from './HistoricalChargeUtils';
import {
  getViolentChargeLabels,
  getRCMStepChargeLabels,
  getBHEAndBREChargeLabels
} from './ArrestChargeUtils';
import { getRecentFTAs, getOldFTAs } from './FTAUtils';
import { formatAutofill } from './FormattingUtils';

const {
  ARREST_DATE,
  ARREST_DATE_TIME,
  CASE_ID,
  CASE_STATUS,
  CHARGE_DESCRIPTION,
  CHARGE_ID,
  CHARGE_STATUTE,
  DOB,
  FILE_DATE,
  LAST_UPDATED_DATE
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
} = RCM_FIELDS;

export const tryAutofillCurrentViolentCharge = (
  currCharges :List,
  violentChargeList :Map
) :string => (getViolentChargeLabels({ currCharges, violentChargeList }).size > 0 ? 'true' : 'false');

export const tryAutofillAge = (
  dateArrested :string,
  defaultValue :string,
  selectedPerson :Map
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
const mapToLabels = (
  arrestDate :string,
  allCharges :List,
  filterFn :(arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) => List,
  chargeIdsToSentenceDates :Map
) => (
  filterFn(arrestDate, allCharges.filter((charge) => !shouldIgnoreCharge(charge)), chargeIdsToSentenceDates)
    .map((charge) => getChargeTitle(charge))
);

const mapToDetails = (
  arrestDate :string,
  allCharges :List,
  filterFn :(arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) => List,
  chargeIdsToSentenceDates :Map
) => (
  filterFn(arrestDate, allCharges.filter((charge) => !shouldIgnoreCharge(charge)), chargeIdsToSentenceDates)
    .map((charge) => getChargeDetails(charge))
);
/* Filter charge lists */
const filterPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List,
  allCharges :List,
  allSentences :List
) :List => {
  if (!dateArrested || !dateArrested.length || !currCaseNum || !currCaseNum.length) return List();
  const arrestDate = DateTime.fromISO(dateArrested);
  // Set of case numbers with an arrest date before the current one
  let casesWithArrestBefore = Immutable.OrderedSet();
  // Map from case nums to charge list with pending sentences at time of arrest
  let casesWithPendingSentenceDatesAtTimeOfArrest = Map();
  const chargeIdsToSentenceDates = getChargeIdToSentenceDate(allSentences);

  // Map from case nums to charge list with date after current arrest

  if (arrestDate.isValid) {
    allCases.forEach((caseDetails) => {
      const {
        [ARREST_DATE]: currentArrestDate,
        [ARREST_DATE_TIME]: arrestDateTime,
        [FILE_DATE]: arrestFileDate
      } = getEntityProperties(
        caseDetails,
        [ARREST_DATE, ARREST_DATE_TIME, FILE_DATE]
      );
      const arrestDateString = arrestDateTime || currentArrestDate || arrestFileDate;
      const prevArrestDate = DateTime.fromISO(arrestDateString);
      if (prevArrestDate.isValid && prevArrestDate.valueOf() < arrestDate.valueOf()) {
        const {
          [CASE_ID]: caseNum,
          [CASE_STATUS]: caseStatus,
          [LAST_UPDATED_DATE]: caseStatusDate
        } = getEntityProperties(caseDetails, [CASE_ID, CASE_STATUS, LAST_UPDATED_DATE]);
        const caseStatusWasPendingAtTimeOfArrest = (
          caseStatus === 'Pending' && DateTime.fromISO(caseStatusDate).valueOf() < arrestDate.valueOf()
        ) || (caseStatus !== 'Pending' && DateTime.fromISO(caseStatusDate).valueOf() > arrestDate.valueOf());
        if (caseNum !== currCaseNum && caseStatusWasPendingAtTimeOfArrest) {
          casesWithArrestBefore = casesWithArrestBefore.add(caseNum);
        }
      }
    });
    allCharges.filter((charge) => !shouldIgnoreCharge(charge)).forEach((chargeDetails) => {
      let caseNum;
      let shouldInclude = false;
      const {
        [CHARGE_DESCRIPTION]: chargeDescription,
        [CHARGE_ID]: chargeId
      } = getEntityProperties(chargeDetails, [CHARGE_DESCRIPTION, CHARGE_ID]);

      const caseNums = chargeId.split('|');
      if (caseNums && caseNums.length) {
        [caseNum] = caseNums;
      }

      const sentenceDate = chargeIdsToSentenceDates.get(chargeId, '');
      if (!sentenceDate.length) {
        shouldInclude = true;
      }
      else {
        const sentenceDT = DateTime.fromISO(sentenceDate);
        if (sentenceDT.isValid && sentenceDT.valueOf() > arrestDate.valueOf()) {
          shouldInclude = true;
        }
      }

      if (
        chargeDescription === 'PROBATION VIOLATION'
        || chargeDescription === 'VIOLATION OF A VALID COURT ORDER'
      ) shouldInclude = false;

      if (shouldInclude && caseNum) {
        casesWithPendingSentenceDatesAtTimeOfArrest = casesWithPendingSentenceDatesAtTimeOfArrest.set(
          caseNum,
          casesWithPendingSentenceDatesAtTimeOfArrest.get(caseNum, List()).push(chargeDetails)
        );
      }
    });
    return casesWithArrestBefore.flatMap((caseNum) => casesWithPendingSentenceDatesAtTimeOfArrest.get(caseNum, List()));
  }
  return List();
};

const filterPreviousMisdemeanors = (arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) :List => {
  if (!allCharges.size) return List();
  return allCharges.filter((charge) => (
    convictionAndGuilty(arrestDate, charge, chargeIdsToSentenceDates)
      && chargeIsMisdemeanor(charge)
  ));
};

const filterPreviousFelonies = (arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) :List => {
  if (!allCharges.size) return List();
  return allCharges.filter((charge) => (
    convictionAndGuilty(arrestDate, charge, chargeIdsToSentenceDates)
      && chargeIsFelony(charge)
  ));
};

const filterPreviousViolentCharges = (
  arrestDate :string,
  allCharges :List,
  violentChargeList :Map,
  chargeIdsToSentenceDates :Map
) :List => {
  if (!allCharges.size) return List();

  return allCharges
    .filter((charge) => {
      const chargeNum = charge.getIn([CHARGE_STATUTE, 0], '');
      return chargeNum.length
        && convictionAndGuilty(arrestDate, charge, chargeIdsToSentenceDates)
        && historicalChargeIsViolent({ charge, violentChargeList });
    });
};

/* Transform filtered charge lists */

export const getPendingChargeLabels = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List,
  allCharges :List,
  allSentences :List
) => (
  filterPendingCharges(
    currCaseNum,
    dateArrested,
    allCases,
    allCharges,
    allSentences
  ).map((charge) => getChargeTitle(charge))
);

export const getPendingCharges = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List,
  allCharges :List,
  allSentences :List
) => (
  filterPendingCharges(
    currCaseNum,
    dateArrested,
    allCases,
    allCharges,
    allSentences
  ).map((charge) => getChargeDetails(charge))
);

export const getPreviousMisdemeanorLabels = (arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) => (
  mapToLabels(arrestDate, allCharges, filterPreviousMisdemeanors, chargeIdsToSentenceDates)
);

export const getPreviousMisdemeanors = (arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) => (
  mapToDetails(arrestDate, allCharges, filterPreviousMisdemeanors, chargeIdsToSentenceDates)
);
export const getPreviousFelonyLabels = (arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) => (
  mapToLabels(arrestDate, allCharges, filterPreviousFelonies, chargeIdsToSentenceDates)
);

export const getPreviousFelonies = (arrestDate :string, allCharges :List, chargeIdsToSentenceDates :Map) => (
  mapToDetails(arrestDate, allCharges, filterPreviousFelonies, chargeIdsToSentenceDates)
);

export const getPreviousViolentChargeLabels = (
  arrestDate :string,
  allCharges :List,
  violentChargeList :Map,
  chargeIdsToSentenceDates :Map
) => (
  filterPreviousViolentCharges(
    arrestDate,
    allCharges.filter((charge) => !shouldIgnoreCharge(charge)),
    violentChargeList,
    chargeIdsToSentenceDates
  ).map((charge) => getChargeTitle(charge))
);

export const getPreviousViolentCharges = (
  arrestDate :string,
  allCharges :List,
  violentChargeList :Map,
  chargeIdsToSentenceDates :Map
) => (
  filterPreviousViolentCharges(
    arrestDate,
    allCharges.filter((charge) => !shouldIgnoreCharge(charge)),
    violentChargeList,
    chargeIdsToSentenceDates
  ).map((charge) => getChargeDetails(charge))
);

/* Autofill based on filtered charge list sizes */

export const tryAutofillPendingCharge = (
  currCaseNum :string,
  dateArrested :string,
  allCases :List,
  allCharges :List,
  allSentences :List,
  defaultValue :string
) => {
  if (!dateArrested.length || !currCaseNum.length) return defaultValue;
  // $FlowFixMe
  return `${filterPendingCharges(currCaseNum, dateArrested, allCases, allCharges, allSentences).size > 0}`;
};

export const tryAutofillPreviousMisdemeanors = (
  arrestDate :string,
  allCharges :List,
  chargeIdsToSentenceDates :Map
) :string => (
  // $FlowFixMe
  `${filterPreviousMisdemeanors(arrestDate, allCharges, chargeIdsToSentenceDates).size > 0}`
);
export const tryAutofillPreviousFelonies = (
  arrestDate :string,
  allCharges :List,
  chargeIdsToSentenceDates :Map
) :string => (
  // $FlowFixMe
  `${filterPreviousFelonies(arrestDate, allCharges, chargeIdsToSentenceDates).size > 0}`
);

export const tryAutofillPreviousViolentCharge = (
  arrestDate :string,
  allCharges :List, violentChargeList :Map,
  chargeIdsToSentenceDates :Map
) :string => {
  const numViolentCharges = filterPreviousViolentCharges(
    arrestDate,
    allCharges,
    violentChargeList,
    chargeIdsToSentenceDates
  ).size;
  if (numViolentCharges > 3) return '3';
  return `${numViolentCharges}`;
};

export const tryAutofillPriorSentenceToIncarceration = (allSentences :List) :string => (
  // $FlowFixMe
  `${getSentenceToIncarcerationCaseNums(allSentences).size > 0}`
);

export const tryAutofillRCMStepTwo = (currCharges :List, maxLevelIncreaseChargesList :Map) :string => {
  const { maxLevelIncreaseCharges } = getRCMStepChargeLabels({ currCharges, maxLevelIncreaseChargesList });
  return (maxLevelIncreaseCharges.size > 0).toString();
};

export const tryAutofillRCMStepFour = (currCharges :List, singleLevelIncreaseChargesList :Map) :string => {
  const { singleLevelIncreaseCharges } = getRCMStepChargeLabels({ currCharges, singleLevelIncreaseChargesList });
  return (singleLevelIncreaseCharges.size > 0).toString();
};

export const tryAutofillRCMSecondaryReleaseCharges = (
  currCharges :List,
  bookingHoldExceptionChargeList :Map
) :string => {
  const {
    currentBHECharges
  } = getBHEAndBREChargeLabels({
    currCharges,
    bookingHoldExceptionChargeList
  });
  // $FlowFixMe
  return `${!!currentBHECharges.size && currentBHECharges.size === currCharges.size}`;
};

export const tryAutofillRCMSecondaryHoldCharges = (
  currCharges :List,
  bookingReleaseExceptionChargeList :Map
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

export const tryAutofillRecentFTAs = (allFTAs :List, allCharges :List, chargeIdsToSentenceDates :Map) :string => {
  const numFTAs = getRecentFTAs(allFTAs, allCharges, chargeIdsToSentenceDates).size;
  return `${numFTAs > 2 ? 2 : numFTAs}`;
};

export const tryAutofillOldFTAs = (allFTAs :List, allCharges :List, chargeIdsToSentenceDates :Map) :string => (
  // $FlowFixMe
  `${getOldFTAs(allFTAs, allCharges, chargeIdsToSentenceDates).size > 0}`
);

export const tryAutofillFields = (
  nextCase :Map,
  nextCharges :List,
  allCases :List,
  allCharges :List,
  allSentences :List,
  allFTAs :List,
  selectedPerson :Map,
  psaFormValues :Map,
  violentArrestChargeList :Map,
  violentCourtChargeList :Map,
  maxLevelIncreaseChargesList :Map,
  singleLevelIncreaseChargesList :Map,
  bookingReleaseExceptionChargeList :Map,
  bookingHoldExceptionChargeList :Map
) :Map => {
  const chargeIdsToSentenceDates = getChargeIdToSentenceDate(allSentences);

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

    // RCM
    const { maxLevelIncreaseCharges, singleLevelIncreaseCharges } = getRCMStepChargeLabels({
      currCharges: nextCharges,
      maxLevelIncreaseChargesList,
      singleLevelIncreaseChargesList
    });
    psaForm = psaForm.set(STEP_2_CHARGES, (maxLevelIncreaseCharges.size > 0).toString());
    psaForm = psaForm.set(STEP_4_CHARGES, (singleLevelIncreaseCharges.size > 0).toString());

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
      // $FlowFixMe
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
      allSentences,
      psaForm.get(PENDING_CHARGE)
    )
  );

  const pendingChargeString = `${getPendingChargeLabels(
    nextCase.getIn([CASE_ID, 0], ''),
    nextArrestDate,
    allCases,
    allCharges,
    allSentences
  ).join('\n')}`;

  if (pendingChargeString.length) {
    const arrestDateTimeString = DateTime.fromISO(nextArrestDate).toHTTP();
    psaForm = psaForm.set(
      NOTES[PENDING_CHARGE],
      `Pending on ${arrestDateTimeString}:\n${pendingChargeString}`
    );
  }

  psaForm = psaForm.set(
    PRIOR_MISDEMEANOR,
    tryAutofillPreviousMisdemeanors(nextArrestDate, allCharges, chargeIdsToSentenceDates)
  );
  psaForm = psaForm.set(
    PRIOR_FELONY,
    tryAutofillPreviousFelonies(nextArrestDate, allCharges, chargeIdsToSentenceDates)
  );

  const priorMisdemeanor = psaForm.get(PRIOR_MISDEMEANOR);
  const priorFelony = psaForm.get(PRIOR_FELONY);
  if (priorMisdemeanor === 'false' && priorFelony === 'false') {
    psaForm = psaForm.set(PRIOR_VIOLENT_CONVICTION, '0');
    psaForm = psaForm.set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
  }
  else {
    psaForm = psaForm.set(
      PRIOR_VIOLENT_CONVICTION,
      tryAutofillPreviousViolentCharge(nextArrestDate, allCharges, violentCourtChargeList, chargeIdsToSentenceDates)
    );
    psaForm = psaForm.set(PRIOR_SENTENCE_TO_INCARCERATION, tryAutofillPriorSentenceToIncarceration(allSentences));
  }

  psaForm = psaForm.set(
    PRIOR_FAILURE_TO_APPEAR_RECENT,
    tryAutofillRecentFTAs(
      allFTAs,
      allCharges,
      chargeIdsToSentenceDates
    )
  );
  psaForm = psaForm.set(PRIOR_FAILURE_TO_APPEAR_OLD, tryAutofillOldFTAs(allFTAs, allCharges, chargeIdsToSentenceDates));

  return psaForm;
};

export const getJustificationText = (autofillJustifications :List, justificationHeader :?string) :string => {
  let justificationText = '';
  if (autofillJustifications) {
    justificationText = autofillJustifications.size
      ? formatAutofill(autofillJustifications)
      : 'No matching charges.';
    if (justificationHeader) {
      justificationText = `${justificationHeader}: ${justificationText}`;
    }
  }
  return justificationText;
};
