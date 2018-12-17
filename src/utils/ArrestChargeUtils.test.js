import Immutable, { Map, Set, fromJS } from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';

import {
  getViolentChargeLabels,
  getDMFStepChargeLabels,
  getBHEAndBREChargeLabels
} from './ArrestChargeUtils';

import {
  getChargeTitle
} from './HistoricalChargeUtils';

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

const { STEP_TWO, STEP_FOUR, ALL_VIOLENT } = CHARGE_VALUES;
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

describe('ArrestChargeUtils', () => {
  describe('Charge Label Functions with Charge Lists as arguments', () => {

    describe('getViolentChargeLabels', () => {

      test('should return list of violent charge labels', () => {
        expect(getViolentChargeLabels({
          currCharges: Immutable.List.of(
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
        })).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
          getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
          getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
        ));

        expect(getViolentChargeLabels({
          currCharges: Immutable.List.of(
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_NV
          ),
          violentChargeList
        })).toEqual(Immutable.List());

        expect(getViolentChargeLabels({
          currCharges: Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          violentChargeList
        })).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
          getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
        ));

        expect(getViolentChargeLabels({
          currCharges: Immutable.List(),
          violentChargeList
        })).toEqual(Immutable.List());
      });

    });

    describe('getDMFStepChargeLabels', () => {

      test('should return object of DMF Step charge labels', () => {
        expect(getDMFStepChargeLabels({
          currCharges: Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          dmfStep2ChargeList,
          dmfStep4ChargeList
        })).toEqual({
          step2Charges: Immutable.List.of(
            getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
            getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true)
          ),
          step4Charges: Immutable.List.of(
            getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
            getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
          )
        });

        expect(getDMFStepChargeLabels({
          currCharges: Immutable.List.of(
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_NV
          ),
          dmfStep2ChargeList,
          dmfStep4ChargeList
        })).toEqual({
          step2Charges: Immutable.List(),
          step4Charges: Immutable.List.of(
            getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
            getChargeTitle(MOCK_STEP_4_CHARGE_NV, true)
          )
        });

        expect(getDMFStepChargeLabels({
          currCharges: Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ),
          dmfStep2ChargeList,
          dmfStep4ChargeList
        })).toEqual({
          step2Charges: Immutable.List.of(
            getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
            getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true)
          ),
          step4Charges: Immutable.List()
        });

        expect(getDMFStepChargeLabels({
          currCharges: Immutable.List(),
          dmfStep2ChargeList,
          dmfStep4ChargeList
        })).toEqual({
          step2Charges: Immutable.List(),
          step4Charges: Immutable.List()
        });
      });

    });

    describe('BHE/Secondary release charge labels', () => {

      describe('getBHEAndBREChargeLabels', () => {

        test('should return list of BHE, non-BHE, and BRE charge labels', () => {
          expect(getBHEAndBREChargeLabels({
            currCharges: Immutable.List.of(
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
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          })).toEqual({
            currentBHECharges: Immutable.List.of(
              getChargeTitle(MOCK_BHE_CHARGE_1, true),
              getChargeTitle(MOCK_BHE_CHARGE_2, true)
            ),
            currentNonBHECharges: Immutable.List.of(
              getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
              getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_V, true),
              getChargeTitle(MOCK_BRE_CHARGE_1, true),
              getChargeTitle(MOCK_BRE_CHARGE_2, true)
            ),
            currentBRECharges: Immutable.List.of(
              getChargeTitle(MOCK_BRE_CHARGE_1, true),
              getChargeTitle(MOCK_BRE_CHARGE_2, true)
            )
          });

          expect(getBHEAndBREChargeLabels({
            currCharges: Immutable.List.of(
              MOCK_BRE_CHARGE_1,
              MOCK_BRE_CHARGE_2
            ),
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          })).toEqual({
            currentBHECharges: Immutable.List(),
            currentNonBHECharges: Immutable.List.of(
              getChargeTitle(MOCK_BRE_CHARGE_1, true),
              getChargeTitle(MOCK_BRE_CHARGE_2, true)
            ),
            currentBRECharges: Immutable.List.of(
              getChargeTitle(MOCK_BRE_CHARGE_1, true),
              getChargeTitle(MOCK_BRE_CHARGE_2, true)
            ),
          });

          expect(getBHEAndBREChargeLabels({
            currCharges: Immutable.List.of(
              MOCK_BHE_CHARGE_1,
              MOCK_BHE_CHARGE_2
            ),
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          })).toEqual({
            currentBHECharges: Immutable.List.of(
              getChargeTitle(MOCK_BHE_CHARGE_1, true),
              getChargeTitle(MOCK_BHE_CHARGE_2, true)
            ),
            currentNonBHECharges: Immutable.List(),
            currentBRECharges: Immutable.List()
          });

          expect(getBHEAndBREChargeLabels({
            currCharges: Immutable.List.of(
              MOCK_VIOLENT_CHARGE_1,
              MOCK_VIOLENT_CHARGE_2,
              MOCK_STEP_2_CHARGE_V_1,
              MOCK_STEP_2_CHARGE_V_2,
              MOCK_STEP_4_CHARGE_NV,
              MOCK_STEP_4_CHARGE_V
            ),
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          })).toEqual({
            currentBHECharges: Immutable.List(),
            currentNonBHECharges: Immutable.List.of(
              getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
              getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
            ),
            currentBRECharges: Immutable.List()
          });

          expect(getBHEAndBREChargeLabels({
            currCharges: Immutable.List(),
            bookingReleaseExceptionChargeList,
            bookingHoldExceptionChargeList
          })).toEqual({
            currentBHECharges: Immutable.List(),
            currentNonBHECharges: Immutable.List(),
            currentBRECharges: Immutable.List()
          });
        });

      });

    });

  });

});
