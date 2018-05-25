/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import { formatDate } from './Utils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

const COMPARISON = {
  OLD: 'OLD',
  NEW: 'NEW',
  INVALID: 'INVALID'
};

const getPastTwoYearsComparison = (dateStr) => {
  const twoYearsAgo = moment().subtract(2, 'years');
  const date = moment(dateStr);
  if (!date.isValid()) return COMPARISON.INVALID;
  return twoYearsAgo.isSameOrBefore(date) ? COMPARISON.NEW : COMPARISON.OLD;
};

const getFTALabel = (fta) => {
  const caseNum = fta.getIn([PROPERTY_TYPES.GENERAL_ID, 0]).split('|')[0];
  const date = formatDate(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
  return date.length ? `${caseNum} (${date})` : caseNum;
};

export const getRecentFTAs = (allFTAs :Immutable.List<*>) :Immutable.List<*> =>
  allFTAs
    .filter(fta => getPastTwoYearsComparison(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0])) === COMPARISON.NEW)
    .map(fta => getFTALabel(fta));

export const getOldFTAs = (allFTAs :Immutable.List<*>) :Immutable.List<*> =>
  allFTAs
    .filter(fta => getPastTwoYearsComparison(fta.getIn([PROPERTY_TYPES.DATE_TIME, 0])) === COMPARISON.OLD)
    .map(fta => getFTALabel(fta));
