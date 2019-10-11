
import { PROPERTY_TYPES } from './consts/DataModelConsts';

import {
  BOOKING_CONDITIONS,
  DEFAULT_CONDITIONS,
  COLORS,
  RELEASE_TYPES,
  RELEASE_TYPE_HEADERS,
  RESULTS
} from './consts/RCMResultsConsts';

import {
  defaultSettings,
  RCM_LEVEL_1,
  RCM_LEVEL_2,
  RCM_LEVEL_3,
  RCM_LEVEL_4,
  RCM_LEVEL_5,
  RCM_LEVEL_6
} from './consts/test/RCMTestConsts';

import {
  getHeaderText,
  shouldCheckForSecondaryHold,
  shouldCheckForSecondaryRelease,
  updateRCMSecondaryRelease,
  updateRCMSecondaryHold,
  getRCMDecision,
  increaseRCMSeverity
} from './RCMUtils';

describe('RCMUtils', () => {

  describe('getHeaderText', () => {

    test('should return correct header text depending on RCM result', () => {

      expect(getHeaderText(RCM_LEVEL_1))
        .toEqual(`${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 1)`);

      expect(getHeaderText(RCM_LEVEL_2))
        .toEqual(`${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 2)`);

      expect(getHeaderText(RCM_LEVEL_3))
        .toEqual(`${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 3)`);

      expect(getHeaderText(RCM_LEVEL_4))
        .toEqual(`${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 4)`);

      expect(getHeaderText(RCM_LEVEL_5))
        .toEqual(`${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 5)`);

      expect(getHeaderText(RCM_LEVEL_6))
        .toEqual(`${RELEASE_TYPE_HEADERS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 6)`);

    });

    test('should return empty string on malformed input', () => {

      expect(getHeaderText({})).toEqual('');

    });

  });

  describe('shouldCheckForSecondaryRelease', () => {

    test('should return false if level provided is not a booking release level', () => {
      expect(shouldCheckForSecondaryRelease(6, defaultSettings)).toEqual(false);
    });

    test('should return true if level provided is a booking release level', () => {
      expect(shouldCheckForSecondaryRelease(1, defaultSettings)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(2, defaultSettings)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(3, defaultSettings)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(4, defaultSettings)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(4, defaultSettings)).toEqual(true);
    });
  });

  describe('updateRCMSecondaryRelease', () => {

    test('should set booking condition to PR Release', () => {

      expect(updateRCMSecondaryRelease(RCM_LEVEL_2)).toEqual({
        [RESULTS.RCM]: {
          [PROPERTY_TYPES.COLOR]: COLORS.DARK_GREEN,
          [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
          [PROPERTY_TYPES.CONDITIONS_LEVEL]: 2
        },
        [RESULTS.COURT_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_2 }
        ],
        [RESULTS.BOOKING_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
        ]
      });

      expect(updateRCMSecondaryRelease(RCM_LEVEL_3)).toEqual({
        [RESULTS.RCM]: {
          [PROPERTY_TYPES.COLOR]: COLORS.BLUE,
          [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
          [PROPERTY_TYPES.CONDITIONS_LEVEL]: 3
        },
        [RESULTS.COURT_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_3 }
        ],
        [RESULTS.BOOKING_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
        ]
      });

      expect(updateRCMSecondaryRelease(RCM_LEVEL_4)).toEqual({
        [RESULTS.RCM]: {
          [PROPERTY_TYPES.COLOR]: COLORS.YELLOW,
          [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
          [PROPERTY_TYPES.CONDITIONS_LEVEL]: 4
        },
        [RESULTS.COURT_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_4 }
        ],
        [RESULTS.BOOKING_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
        ]
      });

      expect(updateRCMSecondaryRelease(RCM_LEVEL_4)).toEqual({
        [RESULTS.RCM]: {
          [PROPERTY_TYPES.COLOR]: COLORS.ORANGE,
          [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
          [PROPERTY_TYPES.CONDITIONS_LEVEL]: 5
        },
        [RESULTS.COURT_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_5 }
        ],
        [RESULTS.BOOKING_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
        ]
      });

    });

  });

  describe('shouldCheckForSecondaryHold', () => {

    test('should return true if level provided is booking hold level', () => {
      expect(shouldCheckForSecondaryHold(1, defaultSettings)).toEqual(true);
    });

    test('should return false if level provided is not a booking hold level', () => {
      expect(shouldCheckForSecondaryHold(2, defaultSettings)).toEqual(false);
      expect(shouldCheckForSecondaryHold(3, defaultSettings)).toEqual(false);
      expect(shouldCheckForSecondaryHold(4, defaultSettings)).toEqual(false);
      expect(shouldCheckForSecondaryHold(4, defaultSettings)).toEqual(false);
      expect(shouldCheckForSecondaryHold(6, defaultSettings)).toEqual(false);
    });
  });

  describe('updateRCMSecondaryHold', () => {

    test('should set condition 1 to Hold Pending Judicial Review', () => {

      expect(updateRCMSecondaryHold(RCM_LEVEL_1)).toEqual({
        [RESULTS.RCM]: {
          [PROPERTY_TYPES.COLOR]: COLORS.BLUE,
          [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
          [PROPERTY_TYPES.CONDITIONS_LEVEL]: 1
        },
        [RESULTS.COURT_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_1 }
        ],
        [RESULTS.BOOKING_CONDITIONS]: [
          { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
        ]
      });
    });

  });

  describe('getRCMDecision', () => {

    test('should return correct RCM for scores and context', () => {
      expect(getRCMDecision(1, 1, defaultSettings)).toEqual(RCM_LEVEL_1);
      expect(getRCMDecision(3, 3, defaultSettings)).toEqual(RCM_LEVEL_2);
      expect(getRCMDecision(2, 5, defaultSettings)).toEqual(RCM_LEVEL_3);
      expect(getRCMDecision(4, 3, defaultSettings)).toEqual(RCM_LEVEL_4);
      expect(getRCMDecision(4, 5, defaultSettings)).toEqual(RCM_LEVEL_5);
      expect(getRCMDecision(6, 6, defaultSettings)).toEqual(RCM_LEVEL_6);
    });

  });

  describe('increaseRCMSeverity', () => {

    test('should increase color, release type, and conditions level for step 4 increase, if possible', () => {

      expect(increaseRCMSeverity(RCM_LEVEL_1)).toEqual(RCM_LEVEL_2);
      expect(increaseRCMSeverity(RCM_LEVEL_2)).toEqual(RCM_LEVEL_3);
      expect(increaseRCMSeverity(RCM_LEVEL_3)).toEqual(RCM_LEVEL_4);
      expect(increaseRCMSeverity(RCM_LEVEL_4)).toEqual(RCM_LEVEL_5);
      expect(increaseRCMSeverity(RCM_LEVEL_5)).toEqual(RCM_LEVEL_6);

    });

  });

});
