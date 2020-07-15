/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from './DataUtils';
import { formatDate } from './FormattingUtils';
import { shouldIgnoreCharge, getCaseNumFromCharge } from './HistoricalChargeUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

const {
  DATE_TIME,
  GENERAL_ID
} = PROPERTY_TYPES;

const COMPARISON = {
  OLD: 'OLD',
  NEW: 'NEW',
  INVALID: 'INVALID'
};

export const getCaseNumFromFTA = (fta :Map<*, *>) => fta
  .getIn([PROPERTY_TYPES.GENERAL_ID, 0], '').split('|')[0];

const matchesValidCharges = (fta, allCharges) => {
  let validCaseNums = Set();
  allCharges.forEach((charge) => {
    if (!shouldIgnoreCharge(charge)) {
      validCaseNums = validCaseNums.add(getCaseNumFromCharge(charge));
    }
  });

  return validCaseNums.has(getCaseNumFromFTA(fta));
};

const getPastTwoYearsComparison = (dateStr, psaDate) => {
  const psaCompletedDate = psaDate ? DateTime.fromISO(psaDate) : DateTime.local();
  const twoYearsAgo = psaCompletedDate.minus({ years: 2 });
  const date = DateTime.fromISO(dateStr);
  if (!date.isValid) return COMPARISON.INVALID;
  return twoYearsAgo <= date ? COMPARISON.NEW : COMPARISON.OLD;
};

const ftaDateIsPriorToSentenceDate = (fta :Map, chargeIdsToSentenceDates :Map) => {
  const {
    [DATE_TIME]: ftaDate,
    [GENERAL_ID]: chargeId
  } = getEntityProperties(fta, [DATE_TIME, GENERAL_ID]);
  const sentenceDateTime = DateTime.fromISO(chargeIdsToSentenceDates.get(chargeId, ''));
  const ftaDateTime = DateTime.fromISO(ftaDate);
  return sentenceDateTime.isValid ? ftaDateTime < sentenceDateTime : true;
};

export const getFTALabel = (fta :Map) => {
  const caseNum = getCaseNumFromFTA(fta);
  const date = formatDate(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
  return date.length ? `${caseNum} (${date})` : caseNum;
};

export const getRecentFTAs = (
  allFTAs :List,
  allCharges :List,
  chargeIdsToSentenceDates :Map,
  psaDate :string
) :List<*> => (
  allFTAs
    .filter((fta) => ftaDateIsPriorToSentenceDate(fta, chargeIdsToSentenceDates))
    .filter((fta) => getPastTwoYearsComparison(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0]), psaDate) === COMPARISON.NEW)
    .filter((fta) => matchesValidCharges(fta, allCharges))
    .map((fta) => getFTALabel(fta))
);

export const getOldFTAs = (
  allFTAs :List,
  allCharges :List,
  chargeIdsToSentenceDates :Map,
  psaDate :string
) :List => (
  allFTAs
    .filter((fta) => ftaDateIsPriorToSentenceDate(fta, chargeIdsToSentenceDates))
    .filter((fta) => getPastTwoYearsComparison(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0]), psaDate) === COMPARISON.OLD)
    .filter((fta) => matchesValidCharges(fta, allCharges))
    .map((fta) => getFTALabel(fta))
);
