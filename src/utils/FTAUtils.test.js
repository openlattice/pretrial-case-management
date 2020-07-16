import { List } from 'immutable';
import { DateTime } from 'luxon';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getChargeIdToSentenceDate } from './SentenceUtils';
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
  SENTENCE_1,
  SENTENCE_3,
} from './consts/test/MockSentences';

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

const { SENTENCE_DATE } = PROPERTY_TYPES;

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
        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_1_DAY_AGO),
            getFTALabel(MOCK_FTA_2_WEEKS_AGO),
            getFTALabel(MOCK_FTA_6_MONTHS_AGO),
            getFTALabel(MOCK_FTA_1_YEAR_AGO)
          )
        );

        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO
          ), List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_1_DAY_AGO)
          )
        );

        expect(getRecentFTAs(
          List(),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());
      });

      test('should return list of FTAs from past two years, but ignore ftas with dates after sentence date', () => {
        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(
            List.of(
              SENTENCE_1.setIn([SENTENCE_DATE, 0], DateTime.local().minus({ days: 2 }).toISO()),
              SENTENCE_3.setIn([SENTENCE_DATE, 0], DateTime.local().minus({ years: 1, days: 15 }).toISO())
            )
          )
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_2_WEEKS_AGO),
            getFTALabel(MOCK_FTA_1_YEAR_AGO)
          )
        );

        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO
          ), List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(
            List.of(
              SENTENCE_1.setIn([SENTENCE_DATE, 0], DateTime.local().minus({ hours: 10 }).toISO())
            )
          )
        )).toEqual(
          List.of(getFTALabel(MOCK_FTA_1_DAY_AGO))
        );
      });

      test('should ignore FTAs from past two years associated with POAs/charges to ignore', () => {
        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_P
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List.of());

        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ), List.of(
            MOCK_SHOULD_IGNORE_MO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_PO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getRecentFTAs(
          List.of(
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getRecentFTAs(
          List.of(
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getRecentFTAs(
          List.of(
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
          ),
          List.of(
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_1_DAY_AGO),
            getFTALabel(MOCK_FTA_2_WEEKS_AGO),
            getFTALabel(MOCK_FTA_6_MONTHS_AGO),
            getFTALabel(MOCK_FTA_1_YEAR_AGO)
          )
        );

      });

    });

    describe('getOldFTAs', () => {

      test('should return list of FTAs over two years old', () => {
        expect(getOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_3_YEARS_AGO),
            getFTALabel(MOCK_FTA_4_YEARS_AGO)
          )
        );

        expect(getOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO
          ),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getOldFTAs(
          List.of(
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_4_YEARS_AGO)
          )
        );

        expect(getOldFTAs(
          List(),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());
      });

      test('should return list of FTAs over two years old associated with POAs/charges to ignore', () => {

        expect(getOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_P
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of()
        );

        expect(getOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_MO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_PO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getOldFTAs(
          List.of(
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ), List.of(
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getOldFTAs(
          List.of(
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getOldFTAs(
          List.of(
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
          ),
          List.of(
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(
          List.of(
            getFTALabel(MOCK_FTA_3_YEARS_AGO),
            getFTALabel(MOCK_FTA_4_YEARS_AGO)
          )
        );

      });

    });

  });

});
