import Immutable from 'immutable';
import moment from 'moment';

import {
  CASE_NUM,
  POA_CASE_NUM
} from './MockPretrialCases';

export const MOCK_FTA_1_DAY_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|1`],
  'general.datetime': [moment().subtract(1, 'day').toISOString(true)]
});

export const MOCK_FTA_2_WEEKS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|2`],
  'general.datetime': [moment().subtract(2, 'weeks').toISOString(true)]
});

export const MOCK_FTA_6_MONTHS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|3`],
  'general.datetime': [moment().subtract(6, 'months').toISOString(true)]
});

export const MOCK_FTA_1_YEAR_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|4`],
  'general.datetime': [moment().subtract(1, 'year').toISOString(true)]
});

export const MOCK_FTA_3_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|5`],
  'general.datetime': [moment().subtract(3, 'years').toISOString(true)]
});

export const MOCK_FTA_4_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|6`],
  'general.datetime': [moment().subtract(4, 'years').toISOString(true)]
});

export const MOCK_POA_FTA_1_DAY_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|1`],
  'general.datetime': [moment().subtract(1, 'day').toISOString(true)]
});

export const MOCK_POA_FTA_2_WEEKS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|2`],
  'general.datetime': [moment().subtract(2, 'weeks').toISOString(true)]
});

export const MOCK_POA_FTA_6_MONTHS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|3`],
  'general.datetime': [moment().subtract(6, 'months').toISOString(true)]
});

export const MOCK_POA_FTA_1_YEAR_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|4`],
  'general.datetime': [moment().subtract(1, 'year').toISOString(true)]
});

export const MOCK_POA_FTA_3_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|5`],
  'general.datetime': [moment().subtract(3, 'years').toISOString(true)]
});

export const MOCK_POA_FTA_4_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|6`],
  'general.datetime': [moment().subtract(4, 'years').toISOString(true)]
});
