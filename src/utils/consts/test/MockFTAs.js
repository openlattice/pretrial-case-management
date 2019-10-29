import Immutable from 'immutable';
import { DateTime } from 'luxon';

import {
  CASE_NUM,
  POA_CASE_NUM
} from './MockPretrialCases';

export const MOCK_FTA_1_DAY_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|1`],
  'general.datetime': [DateTime.local().minus({ day: 1 }).toISO()]
});

export const MOCK_FTA_2_WEEKS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|2`],
  'general.datetime': [DateTime.local().minus({ weeks: 2 }).toISO()]
});

export const MOCK_FTA_6_MONTHS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|3`],
  'general.datetime': [DateTime.local().minus({ months: 6 }).toISO()]
});

export const MOCK_FTA_1_YEAR_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|4`],
  'general.datetime': [DateTime.local().minus({ year: 1 }).toISO()]
});

export const MOCK_FTA_3_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|5`],
  'general.datetime': [DateTime.local().minus({ years: 3 }).toISO()]
});

export const MOCK_FTA_4_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${CASE_NUM}|6`],
  'general.datetime': [DateTime.local().minus({ years: 4 }).toISO()]
});

export const MOCK_POA_FTA_1_DAY_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|1`],
  'general.datetime': [DateTime.local().minus({ day: 1 }).toISO()]
});

export const MOCK_POA_FTA_2_WEEKS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|2`],
  'general.datetime': [DateTime.local().minus({ weeks: 2 }).toISO()]
});

export const MOCK_POA_FTA_6_MONTHS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|3`],
  'general.datetime': [DateTime.local().minus({ months: 6 }).toISO()]
});

export const MOCK_POA_FTA_1_YEAR_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|4`],
  'general.datetime': [DateTime.local().minus({ year: 1 }).toISO()]
});

export const MOCK_POA_FTA_3_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|5`],
  'general.datetime': [DateTime.local().minus({ years: 3 }).toISO()]
});

export const MOCK_POA_FTA_4_YEARS_AGO = Immutable.fromJS({
  'general.id': [`${POA_CASE_NUM}|6`],
  'general.datetime': [DateTime.local().minus({ years: 4 }).toISO()]
});
