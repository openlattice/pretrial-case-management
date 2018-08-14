import Immutable from 'immutable';

import { VIOLENT_F_STATUTE } from './MockHistoricalChargeFields';

export const CASE_NUM = '51CRI345-238492';
export const CASE_NUM_2 = '49CRI345-23429834';
export const POA_CASE_NUM = '49POA345-23984723';

export const DATE_1 = '2018-06-09';
export const DATE_2 = '2018-07-09';
export const DATE_3 = '2018-08-09';

export const MOCK_PRETRIAL_CASE = Immutable.fromJS({
  'j.CaseNumberText': [CASE_NUM],
  'publicsafety.FileDate': [DATE_1],
  'publicsafety.MostSeriousChargeStatuteNumber': [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_POA_CASE_DATE_2 = Immutable.fromJS({
  'j.CaseNumberText': [POA_CASE_NUM],
  'publicsafety.FileDate': [DATE_2],
  'publicsafety.MostSeriousChargeStatuteNumber': [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_CASE_DATE_2 = Immutable.fromJS({
  'j.CaseNumberText': [CASE_NUM],
  'publicsafety.FileDate': [DATE_2],
  'publicsafety.MostSeriousChargeStatuteNumber': [VIOLENT_F_STATUTE]
});

export const MOCK_PRETRIAL_CASE_DATE_3 = Immutable.fromJS({
  'j.CaseNumberText': [CASE_NUM],
  'publicsafety.FileDate': [DATE_3],
  'publicsafety.MostSeriousChargeStatuteNumber': [VIOLENT_F_STATUTE]
});
