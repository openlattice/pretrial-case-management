import Immutable from 'immutable';

import {
  getAllViolentChargeLabels,
  getAllViolentCharges,
  getAllStepTwoChargeLabels,
  getAllStepTwoCharges,
  getAllStepFourChargeLabels,
  getAllStepFourCharges,
  getAllSecondaryReleaseChargeLabels,
  getAllSecondaryReleaseCharges,
  getSecondaryReleaseChargeJustification
} from './ArrestChargeUtils';

import {
  getChargeTitle,
  getChargeDetails
} from './HistoricalChargeUtils';

import { BHE_LABELS } from './consts/ArrestChargeConsts';

import {
  MOCK_VIOLENT_CHARGE_1,
  MOCK_VIOLENT_CHARGE_2,
  MOCK_STEP_2_CHARGE_V_1,
  MOCK_STEP_2_CHARGE_V_2,
  MOCK_STEP_4_CHARGE_NV,
  MOCK_STEP_4_CHARGE_V,
  MOCK_BHE_CHARGE_1,
  MOCK_BHE_CHARGE_2
} from './consts/test/MockArrestCharges';

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

});
