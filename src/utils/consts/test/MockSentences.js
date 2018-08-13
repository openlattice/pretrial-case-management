import Immutable from 'immutable';

import { PROPERTY_TYPES } from '../DataModelConsts';
import { CASE_NUM } from './MockPretrialCases';

const {
  GENERAL_ID,
  JAIL_DAYS_SERVED,
  JAIL_MONTHS_SERVED,
  JAIL_YEARS_SERVED,
  JAIL_DAYS_SUSPENDED,
  JAIL_MONTHS_SUSPENDED,
  JAIL_YEARS_SUSPENDED,
  JAIL_START_DATE
} = PROPERTY_TYPES;

const getSentenceObj = (caseNum, startDate, timeSentenced, timeSuspended) => Immutable.fromJS({
  [GENERAL_ID]: [caseNum],
  [JAIL_START_DATE]: [startDate],
  [JAIL_YEARS_SERVED]: [timeSentenced[0]],
  [JAIL_MONTHS_SERVED]: [timeSentenced[1]],
  [JAIL_DAYS_SERVED]: [timeSentenced[2]],
  [JAIL_YEARS_SUSPENDED]: [timeSuspended[0]],
  [JAIL_MONTHS_SUSPENDED]: [timeSuspended[1]],
  [JAIL_DAYS_SUSPENDED]: [timeSuspended[2]]
});

export const S_13_DAYS = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 13],
  [0, 0, 0]
);

export const S_14_DAYS = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 14],
  [0, 0, 0]
);

export const S_1_MONTH = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 1, 0],
  [0, 0, 0]
);

export const S_1_YEAR = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [1, 0, 0],
  [0, 0, 0]
);

export const S_13_DAYS_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 14],
  [0, 0, 1]
);

export const S_14_DAYS_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 28],
  [0, 0, 14]
);

export const S_1_MONTH_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 1, 0],
  [0, 1, 0]
);

export const S_1_YEAR_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [1, 0, 0],
  [1, 0, 0]
);

export const S_OVERLAP_1A = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_OVERLAP_1B = getSentenceObj(
  `${CASE_NUM}|2`,
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_1A = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_1B = getSentenceObj(
  `${CASE_NUM}|2`,
  '2018-01-08',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_SHORT_1A = getSentenceObj(
  `${CASE_NUM}|1`,
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_SHORT_1B = getSentenceObj(
  `${CASE_NUM}|2`,
  '2018-01-08',
  [0, 0, 7],
  [0, 0, 1]
);
