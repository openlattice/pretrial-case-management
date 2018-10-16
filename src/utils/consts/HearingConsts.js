import { Map, toOrderedMap } from 'immutable';

import { PROPERTY_TYPES } from './DataModelConsts';

export const COURTROOMS = [
  '1A',
  '6C ARRAIGNMENTS',
  'Courtroom C1',
  'Courtroom C4',
  'Courtroom M1',
  'Courtroom M2'
];

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
      const firstName = judge.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
      let middleName = judge.getIn([PROPERTY_TYPES.MIDDLE_NAME, 0]);
      let lastName = judge.getIn([PROPERTY_TYPES.LAST_NAME, 0]);
      middleName = middleName ? ` ${middleName}` : '';
      lastName = lastName ? ` ${lastName}` : '';
      const fullNameString = firstName + middleName + lastName;
      judgeOptions = judgeOptions.set(fullNameString, judge.set('fullName', fullNameString));
    }
  });
  judgeOptions = judgeOptions.set('Other', Map({ fullName: 'Other' }));
  return judgeOptions.toOrderedMap().sortBy((k, _) => k);
};
