import Immutable from 'immutable';

import {
  caseLedToIncarceration,
  getSentenceToIncarcerationCaseNums
} from './SentenceUtils';

import { CASE_NUM } from './consts/test/MockPretrialCases';

import {
  SENTENCE_1,
  SENTENCE_2,
  SENTENCE_3,
  SENTENCE_4,
  SENTENCE_5,
  SENTENCE_6,
  SENTENCE_7,
  S_NO_SENT_DATE,

  S_13_DAYS,
  S_14_DAYS,
  S_1_MONTH,
  S_1_YEAR,

  S_13_DAYS_SUSP,
  S_14_DAYS_SUSP,
  S_1_MONTH_SUSP,
  S_1_YEAR_SUSP,

  S_OVERLAP_1A,
  S_OVERLAP_1B,

  S_CONSEC_1A,
  S_CONSEC_1B,

  S_CONSEC_SHORT_1A,
  S_CONSEC_SHORT_1B
} from './consts/test/MockSentences';

describe('SentenceUtils', () => {

  describe('caseLedToIncarceration', () => {

    test('should correctly output whether or not there was an incarceration of >=14 days', () => {
      describe('S_13_DAYS', () => {
        expect(caseLedToIncarceration(Immutable.List.of(S_13_DAYS))).toEqual(false);
      });
      expect(caseLedToIncarceration(Immutable.List.of(S_13_DAYS))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(S_14_DAYS))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(S_1_MONTH))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(S_1_YEAR))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_1))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_2))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_3))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_4))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_5))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_6))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(SENTENCE_7))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(S_NO_SENT_DATE))).toEqual(false);
    });

    test('should discount suspended time from total time served', () => {
      expect(caseLedToIncarceration(Immutable.List.of(S_13_DAYS_SUSP))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(S_14_DAYS_SUSP))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(S_1_MONTH_SUSP))).toEqual(false);
      expect(caseLedToIncarceration(Immutable.List.of(S_1_YEAR_SUSP))).toEqual(false);
    });

    test('should not count overlapping sentences as double time', () => {
      expect(caseLedToIncarceration(Immutable.List.of(S_OVERLAP_1A, S_OVERLAP_1B))).toEqual(false);
    });

    test('should sum time from consecutive sentences', () => {
      expect(caseLedToIncarceration(Immutable.List.of(S_CONSEC_1A, S_CONSEC_1B))).toEqual(true);
      expect(caseLedToIncarceration(Immutable.List.of(S_CONSEC_SHORT_1A, S_CONSEC_SHORT_1B))).toEqual(false);
    });

  });

  describe(getSentenceToIncarcerationCaseNums, () => {

    test('should return case num for sentences >= 14 days', () => {
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_13_DAYS))).toEqual(Immutable.List());
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_14_DAYS))).toEqual(Immutable.List.of(CASE_NUM));
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_1_MONTH))).toEqual(Immutable.List.of(CASE_NUM));
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_1_YEAR))).toEqual(Immutable.List.of(CASE_NUM));
    });

    test('should return case num for time served taking into account suspended time', () => {
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_13_DAYS_SUSP))).toEqual(Immutable.List());
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_14_DAYS_SUSP))).toEqual(
        Immutable.List.of(CASE_NUM)
      );
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_1_MONTH_SUSP))).toEqual(Immutable.List());
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(S_1_YEAR_SUSP))).toEqual(Immutable.List());
    });

    test('should not return case nums for cases with overlapping sentences', () => {
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(
        S_OVERLAP_1A,
        S_OVERLAP_1B
      ))).toEqual(Immutable.List());
    });

    test('should return case nums with consecutive sentences where time sums to >= 14 days', () => {
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(
        S_CONSEC_1A,
        S_CONSEC_1B
      ))).toEqual(Immutable.List.of(CASE_NUM));
      expect(getSentenceToIncarcerationCaseNums(Immutable.List.of(
        S_CONSEC_SHORT_1A,
        S_CONSEC_SHORT_1B
      ))).toEqual(Immutable.List());
    });

  });

});
