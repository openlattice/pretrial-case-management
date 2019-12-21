import Immutable, { Map, Set, fromJS } from 'immutable';

import { PSA, DMF } from './consts/Consts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

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

  tryAutofillDMFStepTwo,

  tryAutofillDMFStepFour,

  tryAutofillDMFSecondaryReleaseCharges,

  tryAutofillDMFSecondaryHoldCharges,

  tryAutofillFields
} from './AutofillUtils';

const { STEP_TWO, STEP_FOUR, ALL_VIOLENT } = CHARGE_VALUES;
const violentCourtChargeList = fromJS(ODYSSEY_VIOLENT_CHARGES);
let violentChargeList = Map();
let dmfStep2ChargeList = Map();
let dmfStep4ChargeList = Map();
let bookingReleaseExceptionChargeList = Map();
let bookingHoldExceptionChargeList = Map();

fromJS(STEP_TWO).forEach((charge) => {
  const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
  dmfStep2ChargeList = dmfStep2ChargeList.set(
    statute,
    dmfStep2ChargeList.get(statute, Set()).add(description)
  );
});

fromJS(STEP_FOUR).forEach((charge) => {
  const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
  dmfStep4ChargeList = dmfStep4ChargeList.set(
    statute,
    dmfStep4ChargeList.get(statute, Set()).add(description)
  );
});

fromJS(ALL_VIOLENT).forEach((charge) => {
  const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
  violentChargeList = violentChargeList.set(
    statute,
    violentChargeList.get(statute, Set()).add(description)
  );
});

fromJS(PENN_BOOKING_HOLD_EXCEPTIONS).forEach((charge) => {
  const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
  bookingHoldExceptionChargeList = bookingHoldExceptionChargeList.set(
    statute,
    bookingHoldExceptionChargeList.get(statute, Set()).add(description)
  );
});

fromJS(PENN_BOOKING_RELEASE_EXCEPTIONS).forEach((charge) => {
  const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
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
          Immutable.fromJS({
            [PROPERTY_TYPES.DOB]: ['1998-01-01']
          })
        )).toEqual('0');
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          Immutable.fromJS({
            [PROPERTY_TYPES.DOB]: ['1997-01-01']
          })
        )).toEqual('1');
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          Immutable.fromJS({
            [PROPERTY_TYPES.DOB]: ['1996-01-01']
          })
        )).toEqual('1');
        expect(tryAutofillAge(
          '2018-06-01',
          false,
          Immutable.fromJS({
            [PROPERTY_TYPES.DOB]: ['1995-01-01']
          })
        )).toEqual('2');
      });

    });

  });

  describe('Q2 Current violent charge logic', () => {

    describe('tryAutofillCurrentViolentCharge', () => {

      test('should output true or false depending whether there is a current violent charge', () => {
        expect(tryAutofillCurrentViolentCharge(
          Immutable.List.of(
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
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_1
          ),
          violentChargeList
        )).toEqual('true');

        expect(tryAutofillCurrentViolentCharge(
          Immutable.List.of(
            MOCK_STEP_4_CHARGE_NV,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          violentChargeList
        )).toEqual('false');

        expect(tryAutofillCurrentViolentCharge(Immutable.List())).toEqual('false');
      });

    });

  });

  describe('Q3 Pending charge at time of arrest', () => {

    describe('getPendingChargeLabels', () => {

      test('should return labels for all pending charges', () => {
        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_1,
          Immutable.List.of(MOCK_PRETRIAL_CASE_DATE_2),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet());

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet.of(
          getChargeTitle(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_NOT_GUILTY_FELONY),
          getChargeTitle(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet.of(
          getChargeTitle(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_NOT_GUILTY_FELONY),
          getChargeTitle(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_3,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet.of(
          getChargeTitle(MOCK_M_NO_DISPOSITION)
        ));

      });

      test('should ignore non-applicable pending charge labels', () => {
        expect(getPendingChargeLabels(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_POA
          )
        )).toEqual(Immutable.OrderedSet());
      });

    });

    describe('getPendingCharges', () => {

      test('should return details for all pending charges', () => {

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_1,
          Immutable.List.of(MOCK_PRETRIAL_CASE_DATE_2),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet());

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet.of(
          getChargeDetails(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_NOT_GUILTY_FELONY),
          getChargeDetails(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeDetails(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet.of(
          getChargeDetails(MOCK_NOT_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_NOT_GUILTY_FELONY),
          getChargeDetails(MOCK_NOT_GUILTY_F_VIOLENT),
          getChargeDetails(MOCK_M_NO_DISPOSITION)
        ));

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_3,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          )
        )).toEqual(Immutable.OrderedSet.of(
          getChargeDetails(MOCK_M_NO_DISPOSITION)
        ));

      });

      test('should ignore non-applicable pending charges', () => {

        expect(getPendingCharges(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_POA
          )
        )).toEqual(Immutable.OrderedSet());

      });

    });

    describe('tryAutofillPendingCharge', () => {

      test('should return true or false depending whether there is a pending chage', () => {
        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_1,
          Immutable.List.of(MOCK_PRETRIAL_CASE_DATE_2),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          false
        )).toEqual('false');

        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          false
        )).toEqual('true');

        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          false
        )).toEqual('true');

        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_3,
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          false
        )).toEqual('true');
      });

      test('should ignore non-applicable pending charges from autofill', () => {
        expect(tryAutofillPendingCharge(
          CASE_NUM_2,
          DATE_2,
          Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_POA
          ),
          false
        )).toEqual('false');
      });

    });

  });

  describe('Q4 Prior misdemeanor logic', () => {

    describe('getPreviousMisdemeanorLabels', () => {

      test('should return labels from all prior misdemeanors', () => {

        expect(getPreviousMisdemeanorLabels(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousMisdemeanorLabels(Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_MISDEMEANOR),
          getChargeTitle(MOCK_GUILTY_MISDEMEANOR)
        ));

        expect(getPreviousMisdemeanorLabels(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List());

        expect(getPreviousMisdemeanorLabels(Immutable.List())).toEqual(Immutable.List());

      });

      test('should ignore non-applicable misdemeanor labels', () => {

        expect(getPreviousMisdemeanorLabels(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual(Immutable.List());

        expect(getPreviousMisdemeanorLabels(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('getPreviousMisdemeanors', () => {

      test('should return details from all prior misdemeanors', () => {
        expect(getPreviousMisdemeanors(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousMisdemeanors(Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_MISDEMEANOR),
          getChargeDetails(MOCK_GUILTY_MISDEMEANOR)
        ));

        expect(getPreviousMisdemeanors(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List());

        expect(getPreviousMisdemeanors(Immutable.List())).toEqual(Immutable.List());
      });

      test('should ignore non-applicable misdemeanors', () => {

        expect(getPreviousMisdemeanors(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual(Immutable.List());

        expect(getPreviousMisdemeanors(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('tryAutofillPreviousMisdemeanors', () => {

      test('should return true or false depending whether there are prior misdemeanors', () => {

        expect(tryAutofillPreviousMisdemeanors(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual('true');

        expect(tryAutofillPreviousMisdemeanors(Immutable.List.of(
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR
        ))).toEqual('true');

        expect(tryAutofillPreviousMisdemeanors(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual('false');

        expect(tryAutofillPreviousMisdemeanors(Immutable.List())).toEqual('false');

      });

      test('should ignore non-applicable misdemeanors from autofill', () => {

        expect(tryAutofillPreviousMisdemeanors(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual('false');

        expect(tryAutofillPreviousMisdemeanors(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_GUILTY_M_VIOLENT
        ))).toEqual('true');

      });

    });

  });

  describe('Q5 Prior felony logic', () => {

    describe('getPreviousFelonyLabels', () => {

      test('should return labels from all prior felonies', () => {

        expect(getPreviousFelonyLabels(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonyLabels(Immutable.List.of(
          MOCK_GUILTY_FELONY,
          MOCK_GUILTY_FELONY
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_FELONY),
          getChargeTitle(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonyLabels(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List());

        expect(getPreviousFelonyLabels(Immutable.List())).toEqual(Immutable.List());

      });

      test('should ignore non-applicable felony labels', () => {

        expect(getPreviousFelonyLabels(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual(Immutable.List());

        expect(getPreviousFelonyLabels(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_GUILTY_FELONY
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_FELONY)
        ));

      });

    });

    describe('getPreviousFelonies', () => {

      test('should return details from all prior felonies', () => {

        expect(getPreviousFelonies(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonies(Immutable.List.of(
          MOCK_GUILTY_FELONY,
          MOCK_GUILTY_FELONY
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_FELONY),
          getChargeDetails(MOCK_GUILTY_FELONY)
        ));

        expect(getPreviousFelonies(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual(Immutable.List());

        expect(getPreviousFelonies(Immutable.List())).toEqual(Immutable.List());

      });

      test('should ignore non-applicable felonies', () => {

        expect(getPreviousFelonies(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual(Immutable.List());

        expect(getPreviousFelonies(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_GUILTY_FELONY
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_FELONY)
        ));

      });

    });

    describe('tryAutofillPreviousFelonies', () => {

      test('should return true or false depending on whether there are prior felonies', () => {

        expect(tryAutofillPreviousFelonies(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual('true');

        expect(tryAutofillPreviousFelonies(Immutable.List.of(
          MOCK_GUILTY_FELONY,
          MOCK_GUILTY_FELONY
        ))).toEqual('true');

        expect(tryAutofillPreviousFelonies(Immutable.List.of(
          MOCK_NOT_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_MISDEMEANOR,
          MOCK_GUILTY_M_VIOLENT,
          MOCK_NOT_GUILTY_FELONY,
          MOCK_NOT_GUILTY_F_VIOLENT
        ))).toEqual('false');

        expect(tryAutofillPreviousFelonies(Immutable.List())).toEqual('false');

      });

      test('should ignore non-applicable felonies from autofill', () => {

        expect(tryAutofillPreviousFelonies(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual('false');

        expect(tryAutofillPreviousFelonies(Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO,
          MOCK_SHOULD_IGNORE_P,
          MOCK_SHOULD_IGNORE_PO,
          MOCK_SHOULD_IGNORE_POA,
          MOCK_GUILTY_FELONY
        ))).toEqual('true');

      });

    });

  });

  describe('Q6 Prior violent convictions logic', () => {

    describe('getPreviousViolentChargeLabels', () => {

      test('should return labels from all prior violent convictions', () => {

        expect(getPreviousViolentChargeLabels(
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentChargeLabels(
          Immutable.List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT),
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentChargeLabels(
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List());

        expect(getPreviousViolentChargeLabels(
          Immutable.List(),
          violentCourtChargeList
        )).toEqual(Immutable.List());

      });

      test('should ignore non-applicable charges labels', () => {

        expect(getPreviousViolentChargeLabels(
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List());

        expect(getPreviousViolentChargeLabels(
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('getPreviousViolentCharges', () => {

      test('should return details from all prior violent convictions', () => {

        expect(getPreviousViolentCharges(
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentCharges(
          Immutable.List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT),
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

        expect(getPreviousViolentCharges(
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List());

        expect(getPreviousViolentCharges(
          Immutable.List(),
          violentCourtChargeList
        )).toEqual(Immutable.List());

      });

      test('should ignore non-applicable charges details', () => {

        expect(getPreviousViolentCharges(
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List());

        expect(getPreviousViolentCharges(
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_GUILTY_M_VIOLENT)
        ));

      });

    });

    describe('tryAutofillPreviousViolentCharge', () => {

      test('should return 0, 1, 2, or 3, depending on number of violent convictions', () => {

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual('1');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual('2');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual('3');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual('3');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual('0');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List(),
          violentCourtChargeList
        )).toEqual('0');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA
          ),
          violentCourtChargeList
        )).toEqual('0');

        expect(tryAutofillPreviousViolentCharge(
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_MO,
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_GUILTY_M_VIOLENT
          ),
          violentCourtChargeList
        )).toEqual('1');

      });

    });

  });

  describe('Q7 FTAs within the past two years', () => {

    describe('tryAutofillRecentFTAs', () => {

      test('should return 0, 1, or 2, depending on the number of FTAs within two years', () => {

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('2');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('2');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_6_MONTHS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('2');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('1');

        expect(tryAutofillRecentFTAs(Immutable.List(), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('0');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO
        ), Immutable.List())).toEqual('0');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('0');

      });

      test('should ignore recent FTAs associated with non-applicable charges', () => {

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO
        ))).toEqual('0');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_P
        ))).toEqual('0');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_6_MONTHS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_PO
        ))).toEqual('0');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_POA_FTA_1_DAY_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual('0');

        expect(tryAutofillRecentFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual('0');

      });

    });

  });

  describe('Q8 FTAs older than two years', () => {

    describe('tryAutofillOldFTAs', () => {

      test('should return true or false depending whether there are any FTAs more than two years old', () => {

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('true');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('false');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_3_YEARS_AGO
        ), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('true');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_3_YEARS_AGO
        ), Immutable.List())).toEqual('false');

        expect(tryAutofillOldFTAs(Immutable.List(), Immutable.List.of(
          MOCK_GUILTY_FELONY
        ))).toEqual('false');

      });

      test('should ignore old FTAs associated with non-applicable charges', () => {

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_1_DAY_AGO,
          MOCK_FTA_2_WEEKS_AGO,
          MOCK_FTA_6_MONTHS_AGO,
          MOCK_FTA_1_YEAR_AGO,
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO,
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_MO
        ))).toEqual('false');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_3_YEARS_AGO,
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_P
        ))).toEqual('false');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_PO
        ))).toEqual('false');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_POA_FTA_3_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual('false');

        expect(tryAutofillOldFTAs(Immutable.List.of(
          MOCK_FTA_4_YEARS_AGO
        ), Immutable.List.of(
          MOCK_SHOULD_IGNORE_POA
        ))).toEqual('false');

      });

    });

  });

  describe('Q9 Prior sentence to incarceration', () => {

    describe('tryAutofillPriorSentenceToIncarceration', () => {

      test('should return true or false depending whether there is a prior incarceration', () => {

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List())).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_13_DAYS
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_14_DAYS
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_1_MONTH
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_1_YEAR
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_13_DAYS_SUSP
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_14_DAYS_SUSP
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_1_MONTH_SUSP
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_1_YEAR_SUSP
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_OVERLAP_1A,
          S_OVERLAP_1B
        ))).toEqual('false');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_CONSEC_1A,
          S_CONSEC_1B
        ))).toEqual('true');

        expect(tryAutofillPriorSentenceToIncarceration(Immutable.List.of(
          S_CONSEC_SHORT_1A,
          S_CONSEC_SHORT_1B
        ))).toEqual('false');

      });

    });

  });

  describe('Q11 DMF Step two charge logic', () => {

    describe('tryStepTwo', () => {

      test('should return true or false depending whether any charges match the step 2 list', () => {

        expect(tryAutofillDMFStepTwo(
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          dmfStep2ChargeList
        )).toEqual('true');

        expect(tryAutofillDMFStepTwo(
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          dmfStep2ChargeList
        )).toEqual('false');

        expect(tryAutofillDMFStepTwo(
          Immutable.List.of(
            MOCK_STEP_2_CHARGE_V_1
          ),
          dmfStep2ChargeList
        )).toEqual('true');

        expect(tryAutofillDMFStepTwo(
          Immutable.List.of(
            MOCK_STEP_2_CHARGE_V_2
          ),
          dmfStep2ChargeList
        )).toEqual('true');

        expect(tryAutofillDMFStepTwo(
          Immutable.List(),
          dmfStep2ChargeList
        )).toEqual('false');

      });

    });

  });

  describe('Q12 DMF Step four charge logic', () => {

    describe('tryAutofillDMFStepFour', () => {

      test('should return true or false depending whether any charges match the step 4 list', () => {

        expect(tryAutofillDMFStepFour(
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          dmfStep4ChargeList
        )).toEqual('true');

        expect(tryAutofillDMFStepFour(
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          dmfStep4ChargeList
        )).toEqual('false');

        expect(tryAutofillDMFStepFour(
          Immutable.List.of(
            MOCK_STEP_4_CHARGE_NV
          ),
          dmfStep4ChargeList
        )).toEqual('true');

        expect(tryAutofillDMFStepFour(
          Immutable.List.of(
            MOCK_STEP_4_CHARGE_V
          ),
          dmfStep4ChargeList
        )).toEqual('true');

        expect(tryAutofillDMFStepFour(
          Immutable.List(),
          dmfStep4ChargeList
        )).toEqual('false');

      });

    });

  });

  describe('Q13 BHE secondary release charge logic', () => {

    describe('tryAutofillDMFSecondaryReleaseCharges', () => {

      test('should return true or false depending whether all charges match the BHE list', () => {

        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List.of(
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

        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ),
          bookingHoldExceptionChargeList
        )).toEqual('false');

        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List.of(
            MOCK_BHE_CHARGE_1
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');


        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List.of(
            MOCK_BHE_CHARGE_2
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_1
          ),
          bookingHoldExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryReleaseCharges(
          Immutable.List(),
          bookingHoldExceptionChargeList
        )).toEqual('false');

      });
    });

  });

  describe('Q14 BHE secondary hold charge logic', () => {

    describe('tryAutofillDMFSecondaryHoldCharges', () => {

      test('should return true or false depending whether any charges match the BRE list', () => {

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List.of(
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

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('false');

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List.of(
            MOCK_BRE_CHARGE_1
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List.of(
            MOCK_BRE_CHARGE_2
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List.of(
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List.of(
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_1
          ),
          bookingReleaseExceptionChargeList
        )).toEqual('true');

        expect(tryAutofillDMFSecondaryHoldCharges(
          Immutable.List()
        )).toEqual('false');

      });
    });

  });

  describe('Full PSA autofill', () => {

    describe('tryAutofillFields', () => {

      const arrestCaseDate1 = Immutable.fromJS({
        [PROPERTY_TYPES.CASE_ID]: ['case_id'],
        [PROPERTY_TYPES.ARREST_DATE_TIME]: [DATE_1]
      });

      const arrestCaseDate2 = Immutable.fromJS({
        [PROPERTY_TYPES.CASE_ID]: ['case_id'],
        [PROPERTY_TYPES.ARREST_DATE_TIME]: [DATE_2]
      });

      const arrestCaseDate3 = Immutable.fromJS({
        [PROPERTY_TYPES.CASE_ID]: ['case_id'],
        [PROPERTY_TYPES.ARREST_DATE_TIME]: [DATE_3]
      });

      const person = Immutable.fromJS({
        [PROPERTY_TYPES.DOB]: ['1980-01-01']
      });

      test('(1) Step 2 Increase should apply', () => {
        expect(tryAutofillFields(
          arrestCaseDate2,
          Immutable.List.of(
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_4_CHARGE_V
          ),
          Immutable.List.of(MOCK_PRETRIAL_CASE),
          Immutable.List.of(
            MOCK_GUILTY_MISDEMEANOR,
            MOCK_GUILTY_FELONY,
            MOCK_GUILTY_M_VIOLENT,
            MOCK_NOT_GUILTY_MISDEMEANOR,
            MOCK_NOT_GUILTY_FELONY,
            MOCK_NOT_GUILTY_F_VIOLENT,
            MOCK_M_NO_DISPOSITION
          ),
          Immutable.List.of(S_14_DAYS),
          Immutable.List.of(
            MOCK_FTA_1_DAY_AGO,
            MOCK_FTA_2_WEEKS_AGO,
            MOCK_FTA_3_YEARS_AGO
          ),
          person,
          Immutable.Map(),
          violentChargeList,
          violentCourtChargeList,
          dmfStep2ChargeList,
          dmfStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(Immutable.fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'true',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '1',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '2',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [DMF.STEP_2_CHARGES]: 'false',
          [DMF.STEP_4_CHARGES]: 'true',
          [DMF.SECONDARY_RELEASE_CHARGES]: 'false',
          [DMF.SECONDARY_HOLD_CHARGES]: 'false'
        }));
      });

      test(
        '(2) Step 2 Increase should apply - Booking Exceptions should be false when other charges are present',
        () => {
          expect(tryAutofillFields(
            arrestCaseDate1,
            Immutable.List.of(
              MOCK_STEP_2_CHARGE_V_1,
              MOCK_BHE_CHARGE_1
            ),
            Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
            Immutable.List.of(
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
            Immutable.List.of(S_OVERLAP_1A, S_OVERLAP_1B),
            Immutable.List.of(
              MOCK_FTA_1_DAY_AGO,
              MOCK_POA_FTA_1_DAY_AGO
            ),
            person,
            Immutable.Map(),
            violentChargeList,
            violentCourtChargeList,
            dmfStep2ChargeList,
            dmfStep4ChargeList,
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          )).toEqual(Immutable.fromJS({
            [PSA.AGE_AT_CURRENT_ARREST]: '2',
            [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
            [PSA.PENDING_CHARGE]: 'false',
            [PSA.PRIOR_MISDEMEANOR]: 'true',
            [PSA.PRIOR_FELONY]: 'false',
            [PSA.PRIOR_VIOLENT_CONVICTION]: '3',
            [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '1',
            [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'false',
            [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'false',
            [DMF.STEP_2_CHARGES]: 'true',
            [DMF.STEP_4_CHARGES]: 'false',
            [DMF.SECONDARY_RELEASE_CHARGES]: 'false',
            [DMF.SECONDARY_HOLD_CHARGES]: 'false'
          }));
        }
      );

      test('Court PSA should be flagged for BHE or BRE charges', () => {
        expect(tryAutofillFields(
          arrestCaseDate1,
          Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2,
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          Immutable.List.of(
            MOCK_SHOULD_IGNORE_P,
            MOCK_SHOULD_IGNORE_PO,
            MOCK_SHOULD_IGNORE_POA,
            MOCK_SHOULD_IGNORE_MO,
          ),
          Immutable.List.of(S_CONSEC_SHORT_1A, S_CONSEC_SHORT_1B),
          Immutable.List.of(
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_3_YEARS_AGO
          ),
          person,
          Immutable.Map(),
          violentChargeList,
          violentCourtChargeList,
          dmfStep2ChargeList,
          dmfStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(Immutable.fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
          [PSA.PENDING_CHARGE]: 'false',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'false',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'false',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'false',
          [DMF.STEP_2_CHARGES]: 'false',
          [DMF.STEP_4_CHARGES]: 'false',
          [DMF.SECONDARY_RELEASE_CHARGES]: 'false',
          [DMF.SECONDARY_HOLD_CHARGES]: 'true'
        }));
      });

      test(
        'Step 2 and 4 increase should be applied - Booking Exceptions should be false when other charges are present',
        () => {
          expect(tryAutofillFields(
            arrestCaseDate3,
            Immutable.List.of(
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
            Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
            Immutable.List.of(
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
            Immutable.List.of(S_CONSEC_1A, S_CONSEC_1B),
            Immutable.List.of(
              MOCK_FTA_4_YEARS_AGO,
              MOCK_POA_FTA_1_DAY_AGO,
              MOCK_POA_FTA_2_WEEKS_AGO,
              MOCK_POA_FTA_6_MONTHS_AGO,
              MOCK_POA_FTA_1_YEAR_AGO,
              MOCK_POA_FTA_3_YEARS_AGO,
              MOCK_POA_FTA_4_YEARS_AGO
            ),
            person,
            Immutable.Map(),
            violentChargeList,
            violentCourtChargeList,
            dmfStep2ChargeList,
            dmfStep4ChargeList,
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          )).toEqual(Immutable.fromJS({
            [PSA.AGE_AT_CURRENT_ARREST]: '2',
            [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
            [PSA.PENDING_CHARGE]: 'true',
            [PSA.PRIOR_MISDEMEANOR]: 'false',
            [PSA.PRIOR_FELONY]: 'true',
            [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
            [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
            [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
            [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
            [DMF.STEP_2_CHARGES]: 'true',
            [DMF.STEP_4_CHARGES]: 'true',
            [DMF.SECONDARY_RELEASE_CHARGES]: 'false',
            [DMF.SECONDARY_HOLD_CHARGES]: 'true'
          }));
        }
      );

      test('Booking BHE should apply', () => {
        expect(tryAutofillFields(
          arrestCaseDate3,
          Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          Immutable.List.of(
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
          Immutable.List.of(S_CONSEC_1A, S_CONSEC_1B),
          Immutable.List.of(
            MOCK_FTA_4_YEARS_AGO,
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          person,
          Immutable.Map(),
          violentChargeList,
          violentCourtChargeList,
          dmfStep2ChargeList,
          dmfStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(Immutable.fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [DMF.STEP_2_CHARGES]: 'false',
          [DMF.STEP_4_CHARGES]: 'false',
          [DMF.SECONDARY_RELEASE_CHARGES]: 'true',
          [DMF.SECONDARY_HOLD_CHARGES]: 'false'
        }));
      });

      test('Booking BRE should apply', () => {
        expect(tryAutofillFields(
          arrestCaseDate3,
          Immutable.List.of(
            MOCK_BRE_CHARGE_1,
            MOCK_BRE_CHARGE_2
          ),
          Immutable.List.of(MOCK_PRETRIAL_CASE, MOCK_PRETRIAL_POA_CASE_DATE_2),
          Immutable.List.of(
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
          Immutable.List.of(S_CONSEC_1A, S_CONSEC_1B),
          Immutable.List.of(
            MOCK_FTA_4_YEARS_AGO,
            MOCK_POA_FTA_1_DAY_AGO,
            MOCK_POA_FTA_2_WEEKS_AGO,
            MOCK_POA_FTA_6_MONTHS_AGO,
            MOCK_POA_FTA_1_YEAR_AGO,
            MOCK_POA_FTA_3_YEARS_AGO,
            MOCK_POA_FTA_4_YEARS_AGO
          ),
          person,
          Immutable.Map(),
          violentChargeList,
          violentCourtChargeList,
          dmfStep2ChargeList,
          dmfStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )).toEqual(Immutable.fromJS({
          [PSA.AGE_AT_CURRENT_ARREST]: '2',
          [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
          [PSA.PENDING_CHARGE]: 'true',
          [PSA.PRIOR_MISDEMEANOR]: 'false',
          [PSA.PRIOR_FELONY]: 'true',
          [PSA.PRIOR_VIOLENT_CONVICTION]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: '0',
          [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'true',
          [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'true',
          [DMF.STEP_2_CHARGES]: 'false',
          [DMF.STEP_4_CHARGES]: 'false',
          [DMF.SECONDARY_RELEASE_CHARGES]: 'false',
          [DMF.SECONDARY_HOLD_CHARGES]: 'true'
        }));
      });

    });

  });

});
