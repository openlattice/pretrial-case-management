import Immutable from 'immutable';

import { VIOLENT_F_STATUTE } from './MockHistoricalChargeFields';

export const CASE_NUM = '51CRI345-238492';
export const POA_CASE_NUM = '49POA345-23984723';

export const MOCK_PRETRIAL_CASE = Immutable.fromJS({
  'j.CaseNumberText': [CASE_NUM],
  'publicsafety.FileDate': ['2018-08-09'],
  'publicsafety.MostSeriousChargeStatuteNumber': [VIOLENT_F_STATUTE]
});
