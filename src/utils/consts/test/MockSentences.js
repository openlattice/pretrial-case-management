import Immutable from 'immutable';

import { PROPERTY_TYPES } from '../DataModelConsts';
import { CASE_NUM } from './MockPretrialCases';

const {
  DAYS_CREDIT_JAIL,
  DAYS_CREDIT_PEN,
  DAYS_JAIL,
  DAYS_PEN,
  DAYS_SUSPENDED_JAIL,
  DAYS_SUSPENDED_PEN,
  GENERAL_ID,
  JAIL_DAYS_SERVED,
  JAIL_MONTHS_SERVED,
  JAIL_YEARS_SERVED,
  JAIL_DAYS_SUSPENDED,
  JAIL_MONTHS_SUSPENDED,
  JAIL_YEARS_SUSPENDED,
  JAIL_START_DATE,
  MONTHS_CREDIT_JAIL,
  MONTHS_CREDIT_PEN,
  MONTHS_JAIL,
  MONTHS_PEN,
  MONTHS_SUSPENDED_JAIL,
  MONTHS_SUSPENDED_PEN,
  SENTENCE_DATE,
  START_DATE_JAIL,
  START_DATE_PEN,
  YEARS_CREDIT_JAIL,
  YEARS_CREDIT_PEN,
  YEARS_JAIL,
  YEARS_PEN,
  YEARS_SUSPENDED_JAIL,
  YEARS_SUSPENDED_PEN,
} = PROPERTY_TYPES;

const getSentenceObj = (
  caseNum,
  jailStartDate,
  jailTimeCredited,
  jailTimeSentenced,
  jailTimeSupsended,
  penStartDate,
  penTimeCredited,
  penTimeSentenced,
  penTimeSupsended,
  sentenceDate,
  startDate,
  timeSentenced,
  timeSuspended
) => Immutable.fromJS({
  [GENERAL_ID]: [caseNum],
  // legacy ujs data
  [JAIL_START_DATE]: [startDate],
  [JAIL_YEARS_SERVED]: [timeSentenced[0]],
  [JAIL_MONTHS_SERVED]: [timeSentenced[1]],
  [JAIL_DAYS_SERVED]: [timeSentenced[2]],
  [JAIL_YEARS_SUSPENDED]: [timeSuspended[0]],
  [JAIL_MONTHS_SUSPENDED]: [timeSuspended[1]],
  [JAIL_DAYS_SUSPENDED]: [timeSuspended[2]],
  // updated sentence data as of 7/13/2020
  [SENTENCE_DATE]: [sentenceDate],
  [START_DATE_JAIL]: [jailStartDate],
  [DAYS_JAIL]: [jailTimeSentenced[0]],
  [MONTHS_JAIL]: [jailTimeSentenced[1]],
  [YEARS_JAIL]: [jailTimeSentenced[2]],

  [DAYS_CREDIT_JAIL]: [jailTimeCredited[0]],
  [MONTHS_CREDIT_JAIL]: [jailTimeCredited[1]],
  [YEARS_CREDIT_JAIL]: [jailTimeCredited[2]],

  [DAYS_SUSPENDED_JAIL]: [jailTimeSupsended[0]],
  [MONTHS_SUSPENDED_JAIL]: [jailTimeSupsended[1]],
  [YEARS_SUSPENDED_JAIL]: [jailTimeSupsended[2]],

  [START_DATE_PEN]: [penStartDate],
  [DAYS_PEN]: [penTimeSentenced[0]],
  [MONTHS_PEN]: [penTimeSentenced[1]],
  [YEARS_PEN]: [penTimeSentenced[2]],

  [DAYS_CREDIT_PEN]: [penTimeCredited[0]],
  [MONTHS_CREDIT_PEN]: [penTimeCredited[1]],
  [YEARS_CREDIT_PEN]: [penTimeCredited[2]],

  [DAYS_SUSPENDED_PEN]: [penTimeSupsended[0]],
  [MONTHS_SUSPENDED_PEN]: [penTimeSupsended[1]],
  [YEARS_SUSPENDED_PEN]: [penTimeSupsended[2]],
});

export const getBlankMockSentenceForChargeNum = (chargeNum) => (
  getSentenceObj(
    `${CASE_NUM}|${chargeNum}`,
    // jail
    '',
    [0, 0, 0], // credited
    [0, 0, 0], // sentenced
    [0, 0, 0], // suspended
    // pen
    '',
    [0, 0, 0], // credited
    [0, 0, 0], // sentenced
    [0, 0, 0], // suspended
    // sentence date
    '',
    // legacy sentence data
    '',
    [0, 0, 0],
    [0, 0, 0]
  )
);

// No Sentence to incarceration

// Jail Sentence of 13 days

export const SENTENCE_1 = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '2018-01-01',
  [0, 0, 0], // credited
  [13, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Jail Sentence of 15 days

export const SENTENCE_2 = getSentenceObj(
  `${CASE_NUM}|2`,
  // jail
  '2018-01-01',
  [0, 0, 0], // credited
  [15, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Jail Sentence of 15 days w/ 3 days credit for time served

export const SENTENCE_3 = getSentenceObj(
  `${CASE_NUM}|3`,
  // jail
  '2018-01-01',
  [3, 0, 0], // credited
  [15, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Jail Sentence of 15 days w/ 15 days suspended for time served

export const SENTENCE_4 = getSentenceObj(
  `${CASE_NUM}|4`,
  // jail
  '2018-01-01',
  [0, 0, 0], // credited
  [15, 0, 0], // sentenced
  [15, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Consec Jail and Pen Sentence of 7 days

export const SENTENCE_5 = getSentenceObj(
  `${CASE_NUM}|5`,
  // jail
  '2018-01-01',
  [0, 0, 0], // credited
  [7, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '2018-01-08',
  [0, 0, 0], // credited
  [7, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Consec Jail and Pen Sentence of 7 days w/ 5 days pen credit for time served

export const SENTENCE_6 = getSentenceObj(
  `${CASE_NUM}|6`,
  // jail
  '2018-01-01',
  [0, 0, 0], // credited
  [7, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '2018-01-08',
  [3, 0, 0], // credited
  [7, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Consec Jail time of 7 days w/ 7 days suspended and 5 years jail w/ 5 years supsended

export const SENTENCE_7 = getSentenceObj(
  `${CASE_NUM}|7`,
  // jail
  '2018-01-01',
  [0, 0, 0], // credited
  [7, 0, 0], // sentenced
  [7, 0, 0], // suspended
  // pen
  '2018-01-08',
  [0, 0, 0], // credited
  [0, 0, 5], // sentenced
  [0, 0, 5], // suspended
  // sentence date
  '2018-01-01',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// pending sentence with no sentence date

export const S_NO_SENT_DATE = getSentenceObj(
  `${CASE_NUM}|4`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '',
  [0, 0, 0],
  [0, 0, 0]
);

// Legacy Sentences
export const S_13_DAYS = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 13],
  [0, 0, 0]
);

export const S_14_DAYS = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 14],
  [0, 0, 0]
);

export const S_1_MONTH = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 1, 0],
  [0, 0, 0]
);

export const S_1_YEAR = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [1, 0, 0],
  [0, 0, 0]
);

export const S_13_DAYS_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 14],
  [0, 0, 1]
);

export const S_14_DAYS_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 28],
  [0, 0, 14]
);

export const S_1_MONTH_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 1, 0],
  [0, 1, 0]
);

export const S_1_YEAR_SUSP = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [1, 0, 0],
  [1, 0, 0]
);

export const S_OVERLAP_1A = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_OVERLAP_1B = getSentenceObj(
  `${CASE_NUM}|2`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_1A = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_1B = getSentenceObj(
  `${CASE_NUM}|2`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-08',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_SHORT_1A = getSentenceObj(
  `${CASE_NUM}|1`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-01',
  [0, 0, 7],
  [0, 0, 0]
);

export const S_CONSEC_SHORT_1B = getSentenceObj(
  `${CASE_NUM}|2`,
  // jail
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // pen
  '',
  [0, 0, 0], // credited
  [0, 0, 0], // sentenced
  [0, 0, 0], // suspended
  // sentence date
  '',
  // legacy sentence data
  '2018-01-08',
  [0, 0, 7],
  [0, 0, 1]
);
