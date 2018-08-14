/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import { formatDate } from './FormattingUtils';
import { shouldIgnoreCharge, getCaseNumFromCharge } from './HistoricalChargeUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

const COMPARISON = {
  OLD: 'OLD',
  NEW: 'NEW',
  INVALID: 'INVALID'
};

export const getCaseNumFromFTA = (fta :Immutable.Map<*, *>) => fta.getIn([PROPERTY_TYPES.GENERAL_ID, 0]).split('|')[0];

const matchesValidCharges = (fta, allCharges) => {
  let validCaseNums = Immutable.Set();
  allCharges.forEach((charge) => {
    if (!shouldIgnoreCharge(charge)) {
      validCaseNums = validCaseNums.add(getCaseNumFromCharge(charge));
    }
  });

  return validCaseNums.has(getCaseNumFromFTA(fta));
};

const getPastTwoYearsComparison = (dateStr) => {
  const twoYearsAgo = moment().subtract(2, 'years');
  const date = moment(dateStr);
  if (!date.isValid()) return COMPARISON.INVALID;
  return twoYearsAgo.isSameOrBefore(date) ? COMPARISON.NEW : COMPARISON.OLD;
};

export const getFTALabel = (fta) => {
  const caseNum = getCaseNumFromFTA(fta);
  const date = formatDate(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
  return date.length ? `${caseNum} (${date})` : caseNum;
};

export const getRecentFTAs = (allFTAs :Immutable.List<*>, allCharges :Immutable.List<*>) :Immutable.List<*> =>
  allFTAs
    .filter(fta => getPastTwoYearsComparison(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0])) === COMPARISON.NEW)
    .filter(fta => matchesValidCharges(fta, allCharges))
    .map(fta => getFTALabel(fta));

export const getOldFTAs = (allFTAs :Immutable.List<*>, allCharges :Immutable.List<*>) :Immutable.List<*> =>
  allFTAs
    .filter(fta => getPastTwoYearsComparison(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0])) === COMPARISON.OLD)
    .filter(fta => matchesValidCharges(fta, allCharges))
    .map(fta => getFTALabel(fta));
