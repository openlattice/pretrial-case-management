import Immutable, { Map, Set, fromJS } from 'immutable';

import { CHARGE } from './consts/Consts';
import { CHARGE_VALUES, BHE_LABELS } from './consts/ArrestChargeConsts';
import {
  PENN_BOOKING_HOLD_EXCEPTIONS,
  PENN_BOOKING_RELEASE_EXCEPTIONS,
} from './consts/DMFExceptionsList';

import {
  getAllViolentChargeLabels,
  getAllViolentCharges,
  getAllStepTwoChargeLabels,
  getAllStepTwoCharges,
  getAllStepFourChargeLabels,
  getAllStepFourCharges,
  getAllSecondaryReleaseChargeLabels,
  getAllSecondaryReleaseCharges,
  getSecondaryReleaseChargeJustification,
  getViolentChargeLabels,
  getDMFStepChargeLabels,
  getBHEAndBREChargeLabels
} from './ArrestChargeUtils';

import {
  getChargeTitle,
  getChargeDetails
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
  MOCK_BRE_CHARGE_2
} from './consts/test/MockArrestCharges';

const { STATUTE, DESCRIPTION } = CHARGE;
const { STEP_TWO, STEP_FOUR, ALL_VIOLENT } = CHARGE_VALUES;
let violentChargeList = Map();
let dmfStep2ChargeList = Map();
let dmfStep4ChargeList = Map();
let bookingReleaseExceptionChargeList = Map();
let bookingHoldExceptionChargeList = Map();

fromJS(STEP_TWO).forEach((charge) => {
  const statute = charge.get(STATUTE);
  const description = charge.get(DESCRIPTION);
  dmfStep2ChargeList = dmfStep2ChargeList.set(
    statute,
    dmfStep2ChargeList.get(statute, Set()).add(description)
  );
});

fromJS(STEP_FOUR).forEach((charge) => {
  const statute = charge.get(STATUTE);
  const description = charge.get(DESCRIPTION);
  dmfStep4ChargeList = dmfStep4ChargeList.set(
    statute,
    dmfStep4ChargeList.get(statute, Set()).add(description)
  );
});

fromJS(ALL_VIOLENT).forEach((charge) => {
  const statute = charge.get(STATUTE);
  const description = charge.get(DESCRIPTION);
  violentChargeList = violentChargeList.set(
    statute,
    violentChargeList.get(statute, Set()).add(description)
  );
});

fromJS(PENN_BOOKING_HOLD_EXCEPTIONS).forEach((charge) => {
  const statute = charge.get(STATUTE);
  const description = charge.get(DESCRIPTION);
  bookingHoldExceptionChargeList = bookingHoldExceptionChargeList.set(
    statute,
    bookingHoldExceptionChargeList.get(statute, Set()).add(description)
  );
});

fromJS(PENN_BOOKING_RELEASE_EXCEPTIONS).forEach((charge) => {
  const statute = charge.get(STATUTE);
  const description = charge.get(DESCRIPTION);
  bookingReleaseExceptionChargeList = bookingReleaseExceptionChargeList.set(
    statute,
    bookingReleaseExceptionChargeList.get(statute, Set()).add(description)
  );
});

describe('ArrestChargeUtils', () => {

  describe('Violent charge functions', () => {

    describe('getAllViolentChargeLabels', () => {

      test('should return list of violent charge labels', () => {
        expect(getAllViolentChargeLabels(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_V,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
          getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
          getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
        ));

        expect(getAllViolentChargeLabels(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_1
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
          getChargeTitle(MOCK_VIOLENT_CHARGE_1, true)
        ));

        expect(getAllViolentChargeLabels(Immutable.List.of(
          MOCK_STEP_4_CHARGE_NV,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List());

        expect(getAllViolentChargeLabels(Immutable.List())).toEqual(Immutable.List());
      });

    });

    describe('getAllViolentCharges', () => {

      test('should return list of violent charge details', () => {
        expect(getAllViolentCharges(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_V,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_VIOLENT_CHARGE_1, true),
          getChargeDetails(MOCK_VIOLENT_CHARGE_2, true),
          getChargeDetails(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeDetails(MOCK_STEP_2_CHARGE_V_2, true),
          getChargeDetails(MOCK_STEP_4_CHARGE_V, true)
        ));

        expect(getAllViolentCharges(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_1
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_VIOLENT_CHARGE_1, true),
          getChargeDetails(MOCK_VIOLENT_CHARGE_1, true)
        ));

        expect(getAllViolentCharges(Immutable.List.of(
          MOCK_STEP_4_CHARGE_NV,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List());

        expect(getAllViolentCharges(Immutable.List())).toEqual(Immutable.List());
      });

    });

  });

  describe('Step two charge utils', () => {

    describe('getAllStepTwoChargeLabels', () => {

      test('should return list of step two charge labels', () => {
        expect(getAllStepTwoChargeLabels(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_V,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true)
        ));

        expect(getAllStepTwoChargeLabels(Immutable.List.of(
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_1
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true)
        ));

        expect(getAllStepTwoChargeLabels(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_4_CHARGE_V,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List());

        expect(getAllStepTwoChargeLabels(Immutable.List())).toEqual(Immutable.List());
      });

    });

    describe('getAllStepTwoCharges', () => {

      test('should return list of step two charge details', () => {
        expect(getAllStepTwoCharges(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_V,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeDetails(MOCK_STEP_2_CHARGE_V_2, true)
        ));

        expect(getAllStepTwoCharges(Immutable.List.of(
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_1
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_STEP_2_CHARGE_V_1, true),
          getChargeDetails(MOCK_STEP_2_CHARGE_V_1, true)
        ));

        expect(getAllStepTwoCharges(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_4_CHARGE_V,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List());

        expect(getAllStepTwoCharges(Immutable.List())).toEqual(Immutable.List());
      });

    });

  });

  describe('Step four charge utils', () => {

    describe('getAllStepFourChargeLabels', () => {

      test('should return list of step four charge labels', () => {
        expect(getAllStepFourChargeLabels(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_V,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
          getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
        ));

        expect(getAllStepFourChargeLabels(Immutable.List.of(
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_NV
        ))).toEqual(Immutable.List.of(
          getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
          getChargeTitle(MOCK_STEP_4_CHARGE_NV, true)
        ));

        expect(getAllStepFourChargeLabels(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List());

        expect(getAllStepFourChargeLabels(Immutable.List())).toEqual(Immutable.List());
      });

    });

    describe('getAllStepFourCharges', () => {

      test('should return list of step four charge details', () => {
        expect(getAllStepFourCharges(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_V,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_STEP_4_CHARGE_NV, true),
          getChargeDetails(MOCK_STEP_4_CHARGE_V, true)
        ));

        expect(getAllStepFourCharges(Immutable.List.of(
          MOCK_STEP_4_CHARGE_NV,
          MOCK_STEP_4_CHARGE_NV
        ))).toEqual(Immutable.List.of(
          getChargeDetails(MOCK_STEP_4_CHARGE_NV, true),
          getChargeDetails(MOCK_STEP_4_CHARGE_NV, true)
        ));

        expect(getAllStepFourCharges(Immutable.List.of(
          MOCK_VIOLENT_CHARGE_1,
          MOCK_VIOLENT_CHARGE_2,
          MOCK_STEP_2_CHARGE_V_1,
          MOCK_STEP_2_CHARGE_V_2,
          MOCK_BHE_CHARGE_1,
          MOCK_BHE_CHARGE_2
        ))).toEqual(Immutable.List());

        expect(getAllStepFourCharges(Immutable.List())).toEqual(Immutable.List());
      });

    });

    describe('BHE/Secondary release charge utils', () => {

      describe('getAllSecondaryReleaseChargeLabels', () => {

        test('should return list of BHE charge labels', () => {
          expect(getAllSecondaryReleaseChargeLabels(Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ))).toEqual(Immutable.List.of(
            getChargeTitle(MOCK_BHE_CHARGE_1, true),
            getChargeTitle(MOCK_BHE_CHARGE_2, true)
          ));

          expect(getAllSecondaryReleaseChargeLabels(Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_1
          ))).toEqual(Immutable.List.of(
            getChargeTitle(MOCK_BHE_CHARGE_1, true),
            getChargeTitle(MOCK_BHE_CHARGE_1, true)
          ));

          expect(getAllSecondaryReleaseChargeLabels(Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ))).toEqual(Immutable.List());

          expect(getAllSecondaryReleaseChargeLabels(Immutable.List())).toEqual(Immutable.List());
        });

      });

      describe('getAllSecondaryReleaseCharges', () => {

        test('should return list of BHE charge details', () => {
          expect(getAllSecondaryReleaseCharges(Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ))).toEqual(Immutable.List.of(
            getChargeDetails(MOCK_BHE_CHARGE_1, true),
            getChargeDetails(MOCK_BHE_CHARGE_2, true)
          ));

          expect(getAllSecondaryReleaseCharges(Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_1
          ))).toEqual(Immutable.List.of(
            getChargeDetails(MOCK_BHE_CHARGE_1, true),
            getChargeDetails(MOCK_BHE_CHARGE_1, true)
          ));

          expect(getAllSecondaryReleaseCharges(Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ))).toEqual(Immutable.List());

          expect(getAllSecondaryReleaseCharges(Immutable.List())).toEqual(Immutable.List());
        });

        test('should return appropriate BHE or non-BHE charges for justification', () => {
          expect(getSecondaryReleaseChargeJustification(Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V,
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ))).toEqual([
            Immutable.List.of(
              getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
              getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
            ),
            BHE_LABELS.HOLD
          ]);

          expect(getSecondaryReleaseChargeJustification(Immutable.List.of(
            MOCK_VIOLENT_CHARGE_1,
            MOCK_VIOLENT_CHARGE_2,
            MOCK_STEP_2_CHARGE_V_1,
            MOCK_STEP_2_CHARGE_V_2,
            MOCK_STEP_4_CHARGE_NV,
            MOCK_STEP_4_CHARGE_V
          ))).toEqual([
            Immutable.List.of(
              getChargeTitle(MOCK_VIOLENT_CHARGE_1, true),
              getChargeTitle(MOCK_VIOLENT_CHARGE_2, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_1, true),
              getChargeTitle(MOCK_STEP_2_CHARGE_V_2, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_NV, true),
              getChargeTitle(MOCK_STEP_4_CHARGE_V, true)
            ),
            BHE_LABELS.HOLD
          ]);

          expect(getSecondaryReleaseChargeJustification(Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_2
          ))).toEqual([
            Immutable.List.of(
              getChargeTitle(MOCK_BHE_CHARGE_1, true),
              getChargeTitle(MOCK_BHE_CHARGE_2, true)
            ),
            BHE_LABELS.RELEASE
          ]);

          expect(getSecondaryReleaseChargeJustification(Immutable.List.of(
            MOCK_BHE_CHARGE_1,
            MOCK_BHE_CHARGE_1
          ))).toEqual([
            Immutable.List.of(
              getChargeTitle(MOCK_BHE_CHARGE_1, true),
              getChargeTitle(MOCK_BHE_CHARGE_1, true)
            ),
            BHE_LABELS.RELEASE
          ]);

        });

      });

    });

  });
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
