import Immutable from 'immutable';

import {
  getCaseNumFromFTA,
  getFTALabel,
  getRecentFTAs,
  getOldFTAs
} from './FTAUtils';

import {
  CASE_NUM,
  POA_CASE_NUM
} from './consts/test/MockPretrialCases';

import {
  MOCK_GUILTY_MISDEMEANOR,
  MOCK_GUILTY_M_VIOLENT,
  MOCK_SHOULD_IGNORE_MO,
  MOCK_SHOULD_IGNORE_P,
  MOCK_SHOULD_IGNORE_PO,
  MOCK_SHOULD_IGNORE_POA
} from './consts/test/MockHistoricalCharges';

import {
  MOCK_FTA_1_DAY_AGO,
  MOCK_FTA_2_WEEKS_AGO,
  MOCK_FTA_6_MONTHS_AGO,
  MOCK_FTA_1_YEAR_AGO,
  MOCK_FTA_3_YEARS_AGO,
  MOCK_FTA_4_YEARS_AGO,

  MOCK_POA_FTA_1_DAY_AGO,
  MOCK_POA_FTA_2_WEEKS_AGO,
  MOCK_POA_FTA_6_MONTHS_AGO,
  MOCK_POA_FTA_1_YEAR_AGO,
  MOCK_POA_FTA_3_YEARS_AGO,
  MOCK_POA_FTA_4_YEARS_AGO
} from './consts/test/MockFTAs';

describe('FTAUtils', () => {

  describe('Generic util functions', () => {

    describe('getCaseNumFromFTA', () => {

      test('should return case number', () => {
        expect(getCaseNumFromFTA(MOCK_FTA_1_DAY_AGO)).toEqual(CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_FTA_2_WEEKS_AGO)).toEqual(CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_FTA_6_MONTHS_AGO)).toEqual(CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_FTA_1_YEAR_AGO)).toEqual(CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_FTA_3_YEARS_AGO)).toEqual(CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_FTA_4_YEARS_AGO)).toEqual(CASE_NUM);

        expect(getCaseNumFromFTA(MOCK_POA_FTA_1_DAY_AGO)).toEqual(POA_CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_POA_FTA_2_WEEKS_AGO)).toEqual(POA_CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_POA_FTA_6_MONTHS_AGO)).toEqual(POA_CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_POA_FTA_1_YEAR_AGO)).toEqual(POA_CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_POA_FTA_3_YEARS_AGO)).toEqual(POA_CASE_NUM);
        expect(getCaseNumFromFTA(MOCK_POA_FTA_4_YEARS_AGO)).toEqual(POA_CASE_NUM);
      });

    });

  });

  describe('Load FTA list functions', () => {

    describe('getRecentFTAs', () => {

      test('should return list of FTAs from past two years', () => {
        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List.of(
          getFTALabel(MOCK_FTA_1_DAY_AGO),
          getFTALabel(MOCK_FTA_2_WEEKS_AGO),
          getFTALabel(MOCK_FTA_6_MONTHS_AGO),
          getFTALabel(MOCK_FTA_1_YEAR_AGO)
        ));

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List());

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List.of(
          getFTALabel(MOCK_FTA_1_DAY_AGO)
        ));

        expect(getRecentFTAs(Immutable.List(), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List());
      });

      test('should ignore FTAs from past two years associated with POAs/charges to ignore', () => {
        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_P
        ))).toEqual(Immutable.List.of());

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO
        ))).toEqual(Immutable.List());

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_PO
        ))).toEqual(Immutable.List());

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_POA_FTA_1_DAY_AGO,
          MOCK_POA_FTA_2_WEEKS_AGO,
          MOCK_POA_FTA_6_MONTHS_AGO,
          MOCK_POA_FTA_1_YEAR_AGO,
          MOCK_POA_FTA_3_YEARS_AGO,
          MOCK_POA_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual(Immutable.List());

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_POA_FTA_1_DAY_AGO,
          MOCK_POA_FTA_2_WEEKS_AGO,
          MOCK_POA_FTA_6_MONTHS_AGO,
          MOCK_POA_FTA_1_YEAR_AGO,
          MOCK_POA_FTA_3_YEARS_AGO,
          MOCK_POA_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual(Immutable.List());

        expect(getRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
          MOCK_POA_FTA_1_DAY_AGO,
          MOCK_POA_FTA_2_WEEKS_AGO,
          MOCK_POA_FTA_6_MONTHS_AGO,
          MOCK_POA_FTA_1_YEAR_AGO,
          MOCK_POA_FTA_3_YEARS_AGO,
          MOCK_POA_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual(Immutable.List.of(
          getFTALabel(MOCK_FTA_1_DAY_AGO),
          getFTALabel(MOCK_FTA_2_WEEKS_AGO),
          getFTALabel(MOCK_FTA_6_MONTHS_AGO),
          getFTALabel(MOCK_FTA_1_YEAR_AGO)
        ));

      });

    });

    describe('getOldFTAs', () => {

      test('should return list of FTAs over two years old', () => {
        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List.of(
          getFTALabel(MOCK_FTA_3_YEARS_AGO),
          getFTALabel(MOCK_FTA_4_YEARS_AGO)
        ));

        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List());

        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List.of(
          getFTALabel(MOCK_FTA_4_YEARS_AGO)
        ));

        expect(getOldFTAs(Immutable.List(), Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List());
      });

      test('should return list of FTAs over two years old associated with POAs/charges to ignore', () => {

        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_P
        ))).toEqual(Immutable.List.of());

        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO
        ))).toEqual(Immutable.List());

        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_PO
        ))).toEqual(Immutable.List());

        expect(getOldFTAs(Immutable.List.of(
          MOCK_POA_FTA_1_DAY_AGO,
          MOCK_POA_FTA_2_WEEKS_AGO,
          MOCK_POA_FTA_6_MONTHS_AGO,
          MOCK_POA_FTA_1_YEAR_AGO,
          MOCK_POA_FTA_3_YEARS_AGO,
          MOCK_POA_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual(Immutable.List());

        expect(getOldFTAs(Immutable.List.of(
          MOCK_POA_FTA_1_DAY_AGO,
          MOCK_POA_FTA_2_WEEKS_AGO,
          MOCK_POA_FTA_6_MONTHS_AGO,
          MOCK_POA_FTA_1_YEAR_AGO,
          MOCK_POA_FTA_3_YEARS_AGO,
          MOCK_POA_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual(Immutable.List());

        expect(getOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
          MOCK_POA_FTA_1_DAY_AGO,
          MOCK_POA_FTA_2_WEEKS_AGO,
          MOCK_POA_FTA_6_MONTHS_AGO,
          MOCK_POA_FTA_1_YEAR_AGO,
          MOCK_POA_FTA_3_YEARS_AGO,
          MOCK_POA_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual(Immutable.List.of(
          getFTALabel(MOCK_FTA_3_YEARS_AGO),
          getFTALabel(MOCK_FTA_4_YEARS_AGO)
        ));

      });

    });

  });

});
