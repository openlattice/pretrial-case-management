import Immutable from 'immutable';

import { PROPERTY_TYPES } from '../DataModelConsts';
import { VIOLENT_F_STATUTE } from './MockHistoricalChargeFields';

const {
  CASE_ID,
  CASE_STATUS,
  FILE_DATE,
  LAST_UPDATED_DATE,
  MOST_SERIOUS_CHARGE_NO
} = PROPERTY_TYPES;

export const CASE_NUM = '51CRI345-238492';
export const CASE_NUM_2 = '49CRI345-23429834';
export const POA_CASE_NUM = '49POA345-23984723';

export const DATE_1 = '2018-06-09';
export const DATE_2 = '2018-07-09';
export const DATE_3 = '2018-08-09';

export const MOCK_PRETRIAL_CASE = Immutable.fromJS({
  [CASE_ID]: [CASE_NUM],
  [CASE_STATUS]: ['Pending'],
  [LAST_UPDATED_DATE]: [DATE_1],
  [FILE_DATE]: [DATE_1],
  [MOST_SERIOUS_CHARGE_NO]: [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_POA_CASE_DATE_2 = Immutable.fromJS({
  [CASE_ID]: [POA_CASE_NUM],
  [CASE_STATUS]: ['Pending'],
  [LAST_UPDATED_DATE]: [DATE_2],
  [FILE_DATE]: [DATE_2],
  [MOST_SERIOUS_CHARGE_NO]: [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_CASE_DATE_2 = Immutable.fromJS({
  [CASE_ID]: [CASE_NUM],
  [CASE_STATUS]: ['Pending'],
  [LAST_UPDATED_DATE]: [DATE_2],
  [FILE_DATE]: [DATE_2],
  [MOST_SERIOUS_CHARGE_NO]: [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_CASE_TERMINATED = Immutable.fromJS({
  [CASE_ID]: [CASE_NUM],
  [CASE_STATUS]: ['Terminated'],
  [LAST_UPDATED_DATE]: [DATE_1],
  [FILE_DATE]: [DATE_1],
  [MOST_SERIOUS_CHARGE_NO]: [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_CASE_TERMINATED_UPDATED_ON_DATE_3 = Immutable.fromJS({
  [CASE_ID]: [CASE_NUM],
  [CASE_STATUS]: ['Terminated'],
  [LAST_UPDATED_DATE]: [DATE_3],
  [FILE_DATE]: [DATE_1],
  [MOST_SERIOUS_CHARGE_NO]: [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_CASE_DATE_3 = Immutable.fromJS({
  [CASE_ID]: [CASE_NUM],
  [CASE_STATUS]: ['Pending'],
  [LAST_UPDATED_DATE]: [DATE_3],
  [FILE_DATE]: [DATE_3],
  [MOST_SERIOUS_CHARGE_NO]: [VIOLENT_F_STATUTE]
});
