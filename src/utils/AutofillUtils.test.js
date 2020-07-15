import { DateTime } from 'luxon';
import {
  List,
  Map,
  OrderedSet,
  Set,
  fromJS
} from 'immutable';

import { PSA } from './consts/Consts';
import { RCM_FIELDS } from './consts/RCMResultsConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getChargeIdToSentenceDate } from './SentenceUtils';

import {
  DATE_1,
  DATE_2,
  DATE_3,
  CASE_NUM_2,
  MOCK_PRETRIAL_CASE,
  MOCK_PRETRIAL_CASE_DATE_2,
  MOCK_PRETRIAL_POA_CASE_DATE_2
} from './consts/test/MockPretrialCases';

import {
  MOCK_VIOLENT_CHARGE_1,
  MOCK_VIOLENT_CHARGE_2,
  MOCK_STEP_2_CHARGE_V_1,
  MOCK_STEP_2_CHARGE_V_2,
  MOCK_STEP_4_CHARGE_NV,
  MOCK_STEP_4_CHARGE_V,
  MOCK_BHE_CHARGE_1,
  MOCK_BHE_CHARGE_2,
  MOCK_BRE_CHARGE_1,
  MOCK_BRE_CHARGE_2,
  CHARGE_VALUES,
  PENN_BOOKING_HOLD_EXCEPTIONS,
  PENN_BOOKING_RELEASE_EXCEPTIONS
} from './consts/test/MockArrestCharges';

import {
  MOCK_GUILTY_MISDEMEANOR,
  MOCK_GUILTY_FELONY,
  MOCK_GUILTY_M_VIOLENT,
  MOCK_NOT_GUILTY_MISDEMEANOR,
  MOCK_NOT_GUILTY_FELONY,
  MOCK_NOT_GUILTY_F_VIOLENT,
  MOCK_M_NO_DISPOSITION,

  MOCK_SHOULD_IGNORE_MO,
  MOCK_SHOULD_IGNORE_P,
  MOCK_SHOULD_IGNORE_PO,
  MOCK_SHOULD_IGNORE_POA,

  ODYSSEY_VIOLENT_CHARGES
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

import {
  SENTENCE_1,
  SENTENCE_2,
  SENTENCE_3,
  SENTENCE_4,
  SENTENCE_5,
  SENTENCE_6,
  SENTENCE_7,

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

import {
  getChargeTitle,
  getChargeDetails
} from './HistoricalChargeUtils';

import {
  tryAutofillAge,

  tryAutofillCurrentViolentCharge,

  getPendingChargeLabels,
  getPendingCharges,
  tryAutofillPendingCharge,

  getPreviousMisdemeanorLabels,
  getPreviousMisdemeanors,
  tryAutofillPreviousMisdemeanors,

  getPreviousFelonyLabels,
  getPreviousFelonies,
  tryAutofillPreviousFelonies,

  getPreviousViolentChargeLabels,
  getPreviousViolentCharges,
  tryAutofillPreviousViolentCharge,

  tryAutofillRecentFTAs,

  tryAutofillOldFTAs,

  tryAutofillPriorSentenceToIncarceration,

  tryAutofillRCMStepTwo,

  tryAutofillRCMStepFour,

  tryAutofillRCMSecondaryReleaseCharges,

  tryAutofillRCMSecondaryHoldCharges,

  tryAutofillFields
} from './AutofillUtils';

const {
  ARREST_DATE_TIME,
  CASE_ID,
  CHARGE_DESCRIPTION,
  CHARGE_STATUTE,
  DOB,
  SENTENCE_DATE
} = PROPERTY_TYPES;

const { STEP_TWO, STEP_FOUR, ALL_VIOLENT } = CHARGE_VALUES;
const violentCourtChargeList = fromJS(ODYSSEY_VIOLENT_CHARGES);
let violentChargeList = Map();
let rcmStep2ChargeList = Map();
let rcmStep4ChargeList = Map();
let bookingReleaseExceptionChargeList = Map();
let bookingHoldExceptionChargeList = Map();

fromJS(STEP_TWO).forEach((charge) => {
  const statute = charge.getIn([CHARGE_STATUTE, 0], '');
  const description = charge.getIn([CHARGE_DESCRIPTION, 0], '');
  rcmStep2ChargeList = rcmStep2ChargeList.set(
    statute,
    rcmStep2ChargeList.get(statute, Set()).add(description)
  );
});

fromJS(STEP_FOUR).forEach((charge) => {
  const statute = charge.getIn([CHARGE_STATUTE, 0], '');
  const description = charge.getIn([CHARGE_DESCRIPTION, 0], '');
  rcmStep4ChargeList = rcmStep4ChargeList.set(
    statute,
    rcmStep4ChargeList.get(statute, Set()).add(description)
  );
});

fromJS(ALL_VIOLENT).forEach((charge) => {
  const statute = charge.getIn([CHARGE_STATUTE, 0], '');
  const description = charge.getIn([CHARGE_DESCRIPTION, 0], '');
  violentChargeList = violentChargeList.set(
    statute,
    violentChargeList.get(statute, Set()).add(description)
  );
});

fromJS(PENN_BOOKING_HOLD_EXCEPTIONS).forEach((charge) => {
  const statute = charge.getIn([CHARGE_STATUTE, 0], '');
  const description = charge.getIn([CHARGE_DESCRIPTION, 0], '');
  bookingHoldExceptionChargeList = bookingHoldExceptionChargeList.set(
    statute,
    bookingHoldExceptionChargeList.get(statute, Set()).add(description)
  );
});

fromJS(PENN_BOOKING_RELEASE_EXCEPTIONS).forEach((charge) => {
  const statute = charge.getIn([CHARGE_STATUTE, 0], '');
  const description = charge.getIn([CHARGE_DESCRIPTION, 0], '');
  bookingReleaseExceptionChargeList = bookingReleaseExceptionChargeList.set(
    statute,
    bookingReleaseExceptionChargeList.get(statute, Set()).add(description)
  );
});

describe('AutofillUtils', () => {

  describe('Q1 Age logic', () => {

    describe('tryAutofillAge', () => {

      test('should output 0, 1, or 2 depending on person\'s age', () => {
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          fromJS({
            [DOB]: ['1998-01-01']
          })
        )).toEqual('0');
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          fromJS({
            [DOB]: ['1997-01-01']
          })
        )).toEqual('1');
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          fromJS({
            [DOB]: ['1996-01-01']
          })
        )).toEqual('1');
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          fromJS({
            [DOB]: ['1995-01-01']
          })
        )).toEqual('2');
      });

    });

  });

  describe('Q2 Current violent charge logic', () => {

    describe('tryAutofillCurrentViolentCharge', () => {

      test('should output true or false depending whether there is a current violent charge', () => {
        expect(tryAutofillCurrentViolentCharge(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          violentChargeList
        )).toEqual('true');

        expect(tryAutofillCurrentViolentCharge(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_1
          ),
          violentChargeList
        )).toEqual('true');

        expect(tryAutofillCurrentViolentCharge(
          List.of(
            MOCK_STEP_4_CHARGE_NV,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          violentChargeList
        )).toEqual('false');

        expect(tryAutofillCurrentViolentCharge(List())).toEqual('false');
      });

    });

  });

  describe('Q3 Pending charge at time of arrest', () => {

    describe('getPendingChargeLabels', () => {

      test('should return labels for all pending charges', () => {

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_1,
          List.of(MOCK_PRETRIAL_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
          ),
          List.of(SENTENCE_1)
        )).toEqual(OrderedSet());

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_3,
          List.of(MOCK_PRETRIAL_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(SENTENCE_1, SENTENCE_2)
        )).toEqual(OrderedSet.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT),
          getChargeTitle(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_NOT_GUILTY_FELONY),
          getChargeTitle(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(SENTENCE_5, SENTENCE_6)
        )).toEqual(OrderedSet.of(
          getChargeTitle(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(SENTENCE_1, SENTENCE_2, SENTENCE_3)
        )).toEqual(OrderedSet.of(
          getChargeTitle(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_NOT_GUILTY_FELONY),
          getChargeTitle(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_3,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3,
            SENTENCE_5,
            SENTENCE_6,
            SENTENCE_7
          )
        )).toEqual(OrderedSet.of(
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

      });

      test('should ignore non-applicable pending charge labels', () => {
        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_POA
          ),
          List()
        )).toEqual(OrderedSet());
      });

    });

    describe('getPendingCharges', () => {

      test('should return details for all pending charges', () => {

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_1,
          List.of(MOCK_PRETRIAL_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(SENTENCE_1)
        )).toEqual(OrderedSet());

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(SENTENCE_5, SENTENCE_6)
        )).toEqual(OrderedSet.of(
          getChargeDetails(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeDetails(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(SENTENCE_1, SENTENCE_2, SENTENCE_3)
        )).toEqual(OrderedSet.of(
          getChargeDetails(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_NOT_GUILTY_FELONY),
          getChargeDetails(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeDetails(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_3,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3,
            SENTENCE_5,
            SENTENCE_6,
            SENTENCE_7
          )
        )).toEqual(OrderedSet.of(
          getChargeDetails(MOCK_M_NO_DISPOSITION)
        ));

      });

      test('should ignore non-applicable pending charges', () => {

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_POA
          ),
          List()
        )).toEqual(OrderedSet());

      });

    });

    describe('tryAutofillPendingCharge', () => {

      test('should return true or false depending whether there is a pending chage', () => {
        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_1,
          List.of(MOCK_PRETRIAL_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3,
            SENTENCE_4,
            SENTENCE_5,
            SENTENCE_6,
            SENTENCE_7
          ),
          false
        )).toEqual('false');

        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_5,
            SENTENCE_6,
            SENTENCE_7
          ),
          false
        )).toEqual('true');

        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3
          ),
          false
        )).toEqual('true');

        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3,
            SENTENCE_5,
            SENTENCE_6,
            SENTENCE_7
          ),
          false
        )).toEqual('true');
      });

      test('should ignore non-applicable pending charges from autofill', () => {
        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_POA
          ),
          List(),
          false
        )).toEqual('false');
      });

    });

  });

  describe('Q4 Prior misdemeanor logic', () => {

    describe('getPreviousMisdemeanorLabels', () => {

      test('should return labels from all prior misdemeanors', () => {

        expect(getPreviousMisdemeanorLabels(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_1, SENTENCE_3))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousMisdemeanorLabels(
          DATE_1,
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_1))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_GUILTY_MISDEMEANOR)
        ));

        expect(getPreviousMisdemeanorLabels(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          Map()
        )).toEqual(List());

        expect(getPreviousMisdemeanorLabels(DATE_1, List(), Map())).toEqual(List());

      });

      test('should ignore non-applicable misdemeanor labels', () => {

        expect(getPreviousMisdemeanorLabels(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          Map()
        )).toEqual(List());

        expect(getPreviousMisdemeanorLabels(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('getPreviousMisdemeanors', () => {

      test('should return details from all prior misdemeanors', () => {
        expect(getPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_1, SENTENCE_3))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_1))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_GUILTY_MISDEMEANOR)
        ));

        expect(getPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousMisdemeanors(DATE_1, List(), Map())).toEqual(List());
      });

      test('should ignore non-applicable misdemeanors', () => {

        expect(getPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          Map()
        )).toEqual(List());

        expect(getPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('tryAutofillPreviousMisdemeanors', () => {

      test('should return true or false depending whether there are prior misdemeanors', () => {

        expect(tryAutofillPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_1, SENTENCE_3))
        )).toEqual('true');

        expect(tryAutofillPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_1))
        )).toEqual('true');

        expect(tryAutofillPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillPreviousMisdemeanors(DATE_1, List(), Map())).toEqual('false');

      });

      test('should ignore non-applicable misdemeanors from autofill', () => {

        expect(tryAutofillPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          Map()
        )).toEqual('false');

        expect(tryAutofillPreviousMisdemeanors(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual('true');

      });

    });

  });

  describe('Q5 Prior felony logic', () => {

    describe('getPreviousFelonyLabels', () => {

      test('should return labels from all prior felonies', () => {

        expect(getPreviousFelonyLabels(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonyLabels(
          DATE_1,
          List.of(
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_FELONY),
          getChargeTitle(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonyLabels(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousFelonyLabels(DATE_1, List(), Map())).toEqual(List());

      });

      test('should ignore non-applicable felony labels', () => {

        expect(getPreviousFelonyLabels(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousFelonyLabels(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_FELONY)
        ));

      });

    });

    describe('getPreviousFelonies', () => {

      test('should return details from all prior felonies', () => {

        expect(getPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_FELONY),
          getChargeDetails(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousFelonies(DATE_1, List(), Map())).toEqual(List());

      });

      test('should ignore non-applicable felonies', () => {

        expect(getPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_FELONY)
        ));

      });

    });

    describe('tryAutofillPreviousFelonies', () => {

      test('should return true or false depending on whether there are prior felonies', () => {

        expect(tryAutofillPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual('true');

        expect(tryAutofillPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual('true');

        expect(tryAutofillPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual('false');

        expect(tryAutofillPreviousFelonies(
          DATE_1,
          List(),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');
      });

      test('should ignore non-applicable felonies from autofill', () => {

        expect(tryAutofillPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillPreviousFelonies(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(SENTENCE_2))
        )).toEqual('true');

      });

    });

  });

  describe('Q6 Prior violent convictions logic', () => {

    describe('getPreviousViolentChargeLabels', () => {

      test('should return labels from all prior violent convictions', () => {

        expect(getPreviousViolentChargeLabels(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentChargeLabels(
          DATE_1,
          List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT),
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentChargeLabels(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousViolentChargeLabels(
          DATE_1,
          List(),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

      });

      test('should ignore non-applicable charges labels', () => {

        expect(getPreviousViolentChargeLabels(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousViolentChargeLabels(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('getPreviousViolentCharges', () => {

      test('should return details from all prior violent convictions', () => {

        expect(getPreviousViolentCharges(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentCharges(
          DATE_1,
          List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT),
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentCharges(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousViolentCharges(
          DATE_1,
          List(),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

      });

      test('should ignore non-applicable charges details', () => {

        expect(getPreviousViolentCharges(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual(List());

        expect(getPreviousViolentCharges(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual(List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('tryAutofillPreviousViolentCharge', () => {

      test('should return 0, 1, 2, or 3, depending on number of violent convictions', () => {

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual('1');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual('2');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual('3');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual('3');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List(),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillPreviousViolentCharge(
          DATE_1,
          List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList,
          getChargeIdToSentenceDate(List.of(SENTENCE_3))
        )).toEqual('1');

      });

    });

  });

  describe('Q7 FTAs within the past two years', () => {

    describe('tryAutofillRecentFTAs', () => {

      test('should return 0, 1, or 2, depending on the number of FTAs within two years', () => {

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO,
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('2');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO,
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List.of(
            SENTENCE_1.setIn([SENTENCE_DATE, 0], DateTime.local().minus({ days: 2 }).toISO()),
            SENTENCE_3.setIn([SENTENCE_DATE, 0], DateTime.local().minus({ months: 7 }).toISO()),
            SENTENCE_4.setIn([SENTENCE_DATE, 0], DateTime.local().minus({ year: 1, months: 2 }).toISO())
          ))
        )).toEqual('1');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('2');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_6_MONTHS_AGO
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('2');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('1');

        expect(tryAutofillRecentFTAs(
          List(),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO
          ),
          List(),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO,
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

      });

      test('should ignore recent FTAs associated with non-applicable charges', () => {

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO,
          ),
          List.of(
            MOCK_SHOULD_IGNORE_MO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_P
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_6_MONTHS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_PO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_POA_FTA_1_DAY_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

        expect(tryAutofillRecentFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('0');

      });

    });

  });

  describe('Q8 FTAs older than two years', () => {

    describe('tryAutofillOldFTAs', () => {

      test('should return true or false depending whether there are any FTAs more than two years old', () => {

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO,
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('true');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_3_YEARS_AGO
          ),
          List.of(
            MOCK_GUILTY_FELONY
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('true');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_3_YEARS_AGO
          ),
          List(),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillOldFTAs(List(), List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('false');

      });

      test('should ignore old FTAs associated with non-applicable charges', () => {

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_6_MONTHS_AGO,
            MOCK_FTA_1_YEAR_AGO,
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO,
          ),
          List.of(
            MOCK_SHOULD_IGNORE_MO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_3_YEARS_AGO,
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_P
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_PO
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_POA_FTA_3_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

        expect(tryAutofillOldFTAs(
          List.of(
            MOCK_FTA_4_YEARS_AGO
          ),
          List.of(
            MOCK_SHOULD_IGNORE_POA
          ),
          getChargeIdToSentenceDate(List())
        )).toEqual('false');

      });

    });

  });

  describe('Q9 Prior sentence to incarceration', () => {

    describe('tryAutofillPriorSentenceToIncarceration', () => {

      test('should return true or false depending whether there is a prior incarceration', () => {

        expect(tryAutofillPriorSentenceToIncarceration(List())).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_1))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_2))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_3))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_4))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_5))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_6))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(SENTENCE_7))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_13_DAYS
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_14_DAYS
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_1_MONTH
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_1_YEAR
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_13_DAYS_SUSP
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_14_DAYS_SUSP
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_1_MONTH_SUSP
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_1_YEAR_SUSP
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_OVERLAP_1A,
          S_OVERLAP_1B
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_CONSEC_1A,
          S_CONSEC_1B
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(List.of(
          S_CONSEC_SHORT_1A,
          S_CONSEC_SHORT_1B
        ))).toEqual('false');

      });

    });

  });

  describe('Q11 RCM Step two charge logic', () => {

    describe('tryStepTwo', () => {

      test('should return true or false depending whether any charges match the step 2 list', () => {

        expect(tryAutofillRCMStepTwo(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          rcmStep2ChargeList
        )).toEqual('true');

        expect(tryAutofillRCMStepTwo(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          rcmStep2ChargeList
        )).toEqual('false');

        expect(tryAutofillRCMStepTwo(
          List.of(
            MOCK_STEP_2_CHARGE_V_1
          ),
          rcmStep2ChargeList
        )).toEqual('true');

        expect(tryAutofillRCMStepTwo(
          List.of(
            MOCK_STEP_2_CHARGE_V_2
          ),
          rcmStep2ChargeList
        )).toEqual('true');

        expect(tryAutofillRCMStepTwo(
          List(),
          rcmStep2ChargeList
        )).toEqual('false');

      });

    });

  });

  describe('Q12 RCM Step four charge logic', () => {

    describe('tryAutofillRCMStepFour', () => {

      test('should return true or false depending whether any charges match the step 4 list', () => {

        expect(tryAutofillRCMStepFour(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          rcmStep4ChargeList
        )).toEqual('true');

        expect(tryAutofillRCMStepFour(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          rcmStep4ChargeList
        )).toEqual('false');

        expect(tryAutofillRCMStepFour(
          List.of(
            MOCK_STEP_4_CHARGE_NV
          ),
          rcmStep4ChargeList
        )).toEqual('true');

        expect(tryAutofillRCMStepFour(
          List.of(
            MOCK_STEP_4_CHARGE_V
          ),
          rcmStep4ChargeList
        )).toEqual('true');

        expect(tryAutofillRCMStepFour(
          List(),
          rcmStep4ChargeList
        )).toEqual('false');

      });

    });

  });

  describe('Q13 BHE secondary release charge logic', () => {

    describe('tryAutofillRCMSecondaryReleaseCharges', () => {

      test('should return true or false depending whether all charges match the BHE list', () => {

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          bookingHoldExceptionChargeList
        )).toEqual('false');

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ),
          bookingHoldExceptionChargeList
        )).toEqual('false');

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List.of(
            MOCK_BHE_CHARGE_1
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List.of(
            MOCK_BHE_CHARGE_2
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_1
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryReleaseCharges(
          List(),
          bookingHoldExceptionChargeList
        )).toEqual('false');

      });
    });

  });

  describe('Q14 BHE secondary hold charge logic', () => {

    describe('tryAutofillRCMSecondaryHoldCharges', () => {

      test('should return true or false depending whether any charges match the BRE list', () => {

        expect(tryAutofillRCMSecondaryHoldCharges(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryHoldCharges(
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('false');

        expect(tryAutofillRCMSecondaryHoldCharges(
          List.of(
            MOCK_BRE_CHARGE_1
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryHoldCharges(
          List.of(
            MOCK_BRE_CHARGE_2
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryHoldCharges(
          List.of(
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryHoldCharges(
          List.of(
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_1
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillRCMSecondaryHoldCharges(
          List()
        )).toEqual('false');

      });
    });

  });

  describe('Full PSA autofill', () => {

    describe('tryAutofillFields', () => {

      const arrestCaseDate1 = fromJS({
        [CASE_ID]: ['case_id'],
        [ARREST_DATE_TIME]: [DATE_1]
      });

      const arrestCaseDate2 = fromJS({
        [CASE_ID]: ['case_id'],
        [ARREST_DATE_TIME]: [DATE_2]
      });

      const arrestCaseDate3 = fromJS({
        [CASE_ID]: ['case_id'],
        [ARREST_DATE_TIME]: [DATE_3]
      });

      const person = fromJS({
        [DOB]: ['1980-01-01']
      });

      test('(1) Step 2 Increase should apply', () => {
        expect(tryAutofillFields(
          arrestCaseDate2,
          List.of(
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_4_CHARGE_V
          ),
          List.of(MOCK_PRETRIAL_CASE),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3
          ),
          List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_3_YEARS_AGO
          ),
          person,
          Map(),
          violentChargeList,
          violentCourtChargeList,
          rcmStep2ChargeList,
          rcmStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'true',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '1',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [RCM_FIELDS.STEP_2_CHARGES]: 'false',
          [RCM_FIELDS.STEP_4_CHARGES]: 'true',
          [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'false'
        }));
      });

      test('(2) Step 2 Increase should apply - Booking Exceptions should be false when other charges are present', () => {
        expect(tryAutofillFields(
          arrestCaseDate1,
          List.of(
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_BHE_CHARGE_1
          ),
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
          ),
          List.of(
            SENTENCE_1,
            SENTENCE_2,
            SENTENCE_3,
            SENTENCE_4,
            SENTENCE_7
          ),
          List.of(
            MOCK_FTA_4_YEARS_AGO,
            MOCK_POA_FTA_1_DAY_AGO
          ),
          person,
          Map(),
          violentChargeList,
          violentCourtChargeList,
          rcmStep2ChargeList,
          rcmStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
          [PSA.PENDING_CHARGE]: 'false',
          [PSA.PRIOR_MISDEMEANOR]: 'true',
          [PSA.PRIOR_FELONY]: 'false',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '3',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [RCM_FIELDS.STEP_2_CHARGES]: 'true',
          [RCM_FIELDS.STEP_4_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'false'
        }));
      });

      test('Court PSA should be flagged for BHE or BRE charges', () => {
        expect(tryAutofillFields(
          arrestCaseDate1,
          List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2,
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
          ),
          List(),
          List.of(
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_3_YEARS_AGO
          ),
          person,
          Map(),
          violentChargeList,
          violentCourtChargeList,
          rcmStep2ChargeList,
          rcmStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
          [PSA.PENDING_CHARGE]: 'false',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'false',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'false',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'false',
          [RCM_FIELDS.STEP_2_CHARGES]: 'false',
          [RCM_FIELDS.STEP_4_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'true'
        }));
      });

      test('Step 2 and 4 increase should be applied - Booking Exceptions should be false when other charges are present', () => {
        expect(tryAutofillFields(
          arrestCaseDate3,
          List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2,
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
          ),
          List.of(
            SENTENCE_2
          ),
          List.of(
            MOCK_FTA_4_YEARS_AGO,
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          person,
          Map(),
          violentChargeList,
          violentCourtChargeList,
          rcmStep2ChargeList,
          rcmStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [RCM_FIELDS.STEP_2_CHARGES]: 'true',
          [RCM_FIELDS.STEP_4_CHARGES]: 'true',
          [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'true'
        }));
      });

      test('Booking BHE should apply', () => {
        expect(tryAutofillFields(
          arrestCaseDate3,
          List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
          ),
          List.of(SENTENCE_2),
          List.of(
            MOCK_FTA_4_YEARS_AGO,
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          person,
          Map(),
          violentChargeList,
          violentCourtChargeList,
          rcmStep2ChargeList,
          rcmStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [RCM_FIELDS.STEP_2_CHARGES]: 'false',
          [RCM_FIELDS.STEP_4_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'true',
          [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'false'
        }));
      });

      test('Booking BRE should apply', () => {
        expect(tryAutofillFields(
          arrestCaseDate3,
          List.of(
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          List.of(
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
          ),
          List.of(SENTENCE_2),
          List.of(
            MOCK_FTA_4_YEARS_AGO,
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          person,
          Map(),
          violentChargeList,
          violentCourtChargeList,
          rcmStep2ChargeList,
          rcmStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [RCM_FIELDS.STEP_2_CHARGES]: 'false',
          [RCM_FIELDS.STEP_4_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'false',
          [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'true'
        }));
      });

    });

  });

});
