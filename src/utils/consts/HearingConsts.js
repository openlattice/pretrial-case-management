import { Map } from 'immutable';

import { PROPERTY_TYPES } from './DataModelConsts';

export const COURTROOMS = [
  '1A',
  '6C ARRAIGNMENTS',
  'Courtroom C1',
  'Courtroom C4',
  'Courtroom M1',
  'Courtroom M2'
];

export const HEARING_CONSTS = {
  FIELD: 'field',
  FULL_NAME: 'fullName',
  JUDGE: 'judge',
  JUDGE_ID: 'judgeId',
  NEW_HEARING_TIME: 'newHearingTime',
  NEW_HEARING_DATE: 'newHearingDate',
  NEW_HEARING_COURTROOM: 'newHearingCourtroom',
  OTHER_JUDGE: 'Other'
};

export const formatJudgeName = (judge) => {
  if (judge) {
    const firstName = judge.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
    let middleName = judge.getIn([PROPERTY_TYPES.MIDDLE_NAME, 0]);
    let lastName = judge.getIn([PROPERTY_TYPES.LAST_NAME, 0]);
    middleName = middleName ? ` ${middleName}` : '';
    lastName = lastName ? ` ${lastName}` : '';
    const fullNameString = firstName + middleName + lastName;
    if (firstName && lastName) {
      return fullNameString;
    }
  }
  return 'NA';
};

export const getCourtroomOptions = () => {
  let courtroomOptions = Map();
  COURTROOMS.forEach((courtroom) => {
    courtroomOptions = courtroomOptions.set(courtroom, courtroom);
  });
  return courtroomOptions;
};

export const getJudgeOptions = (allJudges, jurisdiction) => {
  let judgeOptions = Map();

  allJudges.forEach((judge) => {
    if (judge.getIn([PROPERTY_TYPES.JURISDICTION, 0]) === jurisdiction) {
      const fullNameString = formatJudgeName(judge);
      judgeOptions = judgeOptions.set(
        fullNameString,
        judge
          .set(HEARING_CONSTS.FULL_NAME, fullNameString)
          .set(HEARING_CONSTS.FIELD, HEARING_CONSTS.JUDGE)
      );
    }
  });
  judgeOptions = judgeOptions.set(HEARING_CONSTS.OTHER_JUDGE, Map({
    [HEARING_CONSTS.FULL_NAME]: HEARING_CONSTS.OTHER_JUDGE,
    [HEARING_CONSTS.FIELD]: HEARING_CONSTS.JUDGE
  }));
  return judgeOptions.toOrderedMap().sortBy((k, _) => k);
};
