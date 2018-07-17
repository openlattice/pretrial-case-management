import Immutable from 'immutable';

export const COURTROOMS = [
  '1A',
  '6C ARRAIGNMENTS',
  'Courtroom C1',
  'Courtroom C4',
  'Courtroom M1',
  'Courtroom M2'
];

export const getCourtroomOptions = () => {
  let courtroomOptions = Immutable.Map();
  COURTROOMS.forEach((courtroom) => {
    courtroomOptions = courtroomOptions.set(courtroom, courtroom);
  });
  return courtroomOptions;
};
