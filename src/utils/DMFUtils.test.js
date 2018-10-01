import Immutable from 'immutable';

import { CONTEXT } from './consts/Consts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

import {
  COLORS,
  RELEASE_TYPES,
  CONDITION_TYPES,
  RESULT_CATEGORIES,
  HEADER_LABELS,
  CONDITION_LABELS
} from './consts/DMFResultConsts';

import {
  COURT_PENN_1_1,
  COURT_MINN_3_3,
  BOOKING_2_5,
  COURT_PENN_4_5,
  COURT_PENN_6_6
} from './consts/test/DMFTestConsts';

import {
  getHeaderText,
  getConditionText,
  getConditionsTextList,
  shouldCheckForSecondaryRelease,
  updateDMFSecondaryRelease,
  updateDMFSecondaryHold,
  formatDMFFromEntity,
  getDMFDecision,
  increaseDMFSeverity
} from './DMFUtils';

describe('DMFUtils', () => {

  describe('getHeaderText', () => {

    test('should return correct header text depending on DMF result', () => {

      expect(getHeaderText(COURT_PENN_1_1))
        .toEqual(HEADER_LABELS[RELEASE_TYPES.RELEASE]);

      expect(getHeaderText(COURT_MINN_3_3))
        .toEqual(`${HEADER_LABELS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 1)`);

      expect(getHeaderText(BOOKING_2_5))
        .toEqual(`${HEADER_LABELS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 2)`);

      expect(getHeaderText(COURT_PENN_4_5))
        .toEqual(`${HEADER_LABELS[RELEASE_TYPES.RELEASE_WITH_CONDITIONS]} (Level 3)`);

      expect(getHeaderText(COURT_PENN_6_6))
        .toEqual(HEADER_LABELS[RELEASE_TYPES.MAXIMUM_CONDITIONS]);

    });

    test('should return empty string on malformed input', () => {

      expect(getHeaderText({})).toEqual('');

    });

  });

  describe('getConditionText', () => {

    test('should return correct condition text for each condition', () => {

      expect(getConditionText(CONDITION_TYPES.PR))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.PR]);

      expect(getConditionText(CONDITION_TYPES.PR_RELEASE))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE]);

      expect(getConditionText(CONDITION_TYPES.EM_OR_BOND))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.EM_OR_BOND]);

      expect(getConditionText(CONDITION_TYPES.EM_AND_BOND))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.EM_AND_BOND]);

      expect(getConditionText(CONDITION_TYPES.CHECKIN_WEEKLY))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.CHECKIN_WEEKLY]);

      expect(getConditionText(CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST]);

      expect(getConditionText(CONDITION_TYPES.CHECKIN_MONTHLY))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.CHECKIN_MONTHLY]);

      expect(getConditionText(CONDITION_TYPES.CHECKIN_TWICE_MONTHLY))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.CHECKIN_TWICE_MONTHLY]);

      expect(getConditionText(CONDITION_TYPES.IF_APPLICABLE_247))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.IF_APPLICABLE_247]);

      expect(getConditionText(CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW))
        .toEqual(CONDITION_LABELS[CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW]);

    });

    test('should return empty string on malformed/nonexistent condition input', () => {

      expect(getConditionText('not a condition')).toEqual('');
      expect(getConditionText()).toEqual('');
    });

  });

  describe('getConditionsTextList', () => {

    test('should return formatted list of conditions text from dmf', () => {

      expect(getConditionsTextList({})).toEqual([]);

      expect(getConditionsTextList({
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE
      })).toEqual([
        CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE]
      ]);

      expect(getConditionsTextList({
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.EM_AND_BOND
      })).toEqual([
        CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE],
        CONDITION_LABELS[CONDITION_TYPES.EM_AND_BOND]
      ]);

      expect(getConditionsTextList({
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_AND_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.PR_RELEASE
      })).toEqual([
        CONDITION_LABELS[CONDITION_TYPES.EM_AND_BOND],
        CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE]
      ]);

      expect(getConditionsTextList({
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.PR_RELEASE,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.EM_AND_BOND
      })).toEqual([
        CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE],
        CONDITION_LABELS[CONDITION_TYPES.EM_AND_BOND]
      ]);

      expect(getConditionsTextList({
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.EM_AND_BOND
      })).toEqual([
        CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE],
        CONDITION_LABELS[CONDITION_TYPES.EM_AND_BOND]
      ]);

      expect(getConditionsTextList({
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.EM_AND_BOND,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      })).toEqual([
        CONDITION_LABELS[CONDITION_TYPES.PR_RELEASE],
        CONDITION_LABELS[CONDITION_TYPES.EM_AND_BOND],
        CONDITION_LABELS[CONDITION_TYPES.IF_APPLICABLE_247]
      ]);

    });

  });

  describe('shouldCheckForSecondaryRelease', () => {

    test('should return false if context is not booking', () => {
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_MINN, 1, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_MINN, 2, 5)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_MINN, 3, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_MINN, 4, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_MINN, 4, 6)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_MINN, 6, 6)).toEqual(false);

      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_PENN, 1, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_PENN, 2, 5)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_PENN, 3, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_PENN, 4, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_PENN, 4, 6)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.COURT_PENN, 6, 6)).toEqual(false);
    });

    test('should return false if scores are not within the required ranges', () => {
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 2, 6)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 4, 5)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 4, 6)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 5, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 5, 2)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 5, 3)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 5, 4)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 5, 5)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 5, 6)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 6, 1)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 6, 2)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 6, 3)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 6, 4)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 6, 5)).toEqual(false);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 6, 6)).toEqual(false);
    });

    test('should return true if context is booking and scores are within required ranges', () => {
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 2, 5)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 3, 1)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 3, 2)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 3, 3)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 3, 4)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 3, 5)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 3, 6)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 4, 1)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 4, 2)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 4, 3)).toEqual(true);
      expect(shouldCheckForSecondaryRelease(CONTEXT.BOOKING, 4, 4)).toEqual(true);
    });

  });

  describe('updateDMFSecondaryRelease', () => {

    test('should set condition 1 to PR Release', () => {

      expect(updateDMFSecondaryRelease({})).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.DARK_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE
      });

      expect(updateDMFSecondaryRelease({
        [RESULT_CATEGORIES.COLOR]: [COLORS.YELLOW]
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.DARK_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE
      });

      expect(updateDMFSecondaryRelease({
        [RESULT_CATEGORIES.COLOR]: [COLORS.YELLOW],
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_AND_BOND
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.DARK_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE
      });

    });

  });

  describe('updateDMFSecondaryHold', () => {

    test('should set condition 1 to PR Release', () => {

      expect(updateDMFSecondaryHold({})).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW
      });

      expect(updateDMFSecondaryHold({
        [RESULT_CATEGORIES.COLOR]: [COLORS.YELLOW]
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW
      });

      expect(updateDMFSecondaryHold({
        [RESULT_CATEGORIES.COLOR]: [COLORS.YELLOW],
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_AND_BOND
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW
      });

    });

  });

  describe('getDMFDecision', () => {

    test('should return correct DMF for scores and context', () => {
      expect(getDMFDecision(1, 1, CONTEXT.COURT_PENN)).toEqual(COURT_PENN_1_1);
      expect(getDMFDecision(3, 3, CONTEXT.COURT_MINN)).toEqual(COURT_MINN_3_3);
      expect(getDMFDecision(2, 5, CONTEXT.BOOKING)).toEqual(BOOKING_2_5);
      expect(getDMFDecision(4, 5, CONTEXT.COURT_PENN)).toEqual(COURT_PENN_4_5);
      expect(getDMFDecision(6, 6, CONTEXT.COURT_PENN)).toEqual(COURT_PENN_6_6);
    });

  });

  describe('formatDMFFromEntity', () => {

    test('should map DMF entities to a DMF object', () => {

      expect(formatDMFFromEntity(Immutable.fromJS({
        [PROPERTY_TYPES.COLOR]: [COLORS.ORANGE],
        [PROPERTY_TYPES.RELEASE_TYPE]: [RELEASE_TYPES.RELEASE_WITH_CONDITIONS],
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: [3],
        [PROPERTY_TYPES.CONDITION_1]: [CONDITION_TYPES.EM_OR_BOND],
        [PROPERTY_TYPES.CONDITION_2]: [CONDITION_TYPES.CHECKIN_WEEKLY],
        [PROPERTY_TYPES.CONDITION_3]: [CONDITION_TYPES.IF_APPLICABLE_247]
      }))).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.ORANGE,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 3,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      });

      expect(formatDMFFromEntity(Immutable.fromJS({
        [PROPERTY_TYPES.COLOR]: [COLORS.DARK_GREEN],
        [PROPERTY_TYPES.RELEASE_TYPE]: [RELEASE_TYPES.RELEASE],
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: [3],
        [PROPERTY_TYPES.CONDITION_1]: [CONDITION_TYPES.EM_OR_BOND],
        [PROPERTY_TYPES.CONDITION_2]: [CONDITION_TYPES.CHECKIN_WEEKLY]
      }))).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.DARK_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 3,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: undefined
      });

      expect(formatDMFFromEntity(Immutable.fromJS({
        [PROPERTY_TYPES.COLOR]: [COLORS.RED],
        [PROPERTY_TYPES.RELEASE_TYPE]: [RELEASE_TYPES.HOLD_PENDING_JUDICIAL_REVIEW],
        [PROPERTY_TYPES.CONDITION_1]: [CONDITION_TYPES.EM_OR_BOND]
      }))).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.HOLD_PENDING_JUDICIAL_REVIEW,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: undefined,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: undefined,
        [RESULT_CATEGORIES.CONDITION_3]: undefined
      });

      expect(formatDMFFromEntity(Immutable.Map())).toEqual({
        [RESULT_CATEGORIES.COLOR]: undefined,
        [RESULT_CATEGORIES.RELEASE_TYPE]: undefined,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: undefined,
        [RESULT_CATEGORIES.CONDITION_1]: undefined,
        [RESULT_CATEGORIES.CONDITION_2]: undefined,
        [RESULT_CATEGORIES.CONDITION_3]: undefined
      });

    });

  });

  describe('increaseDMFSeverity', () => {

    test('should increase color, release type, and conditions level for step 4 increase, if possible', () => {

      expect(increaseDMFSeverity({
        [RESULT_CATEGORIES.COLOR]: COLORS.DARK_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.LIGHT_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 1,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.PR_RELEASE
      });

      expect(increaseDMFSeverity({
        [RESULT_CATEGORIES.COLOR]: COLORS.LIGHT_GREEN,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 1,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.YELLOW,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 2,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY
      });

      expect(increaseDMFSeverity({
        [RESULT_CATEGORIES.COLOR]: COLORS.YELLOW,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 2,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.ORANGE,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 3,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      });

      expect(increaseDMFSeverity({
        [RESULT_CATEGORIES.COLOR]: COLORS.ORANGE,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: 3,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: undefined,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      });

      expect(increaseDMFSeverity({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      })).toEqual({
        [RESULT_CATEGORIES.COLOR]: COLORS.RED,
        [RESULT_CATEGORIES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [RESULT_CATEGORIES.CONDITION_1]: CONDITION_TYPES.EM_OR_BOND,
        [RESULT_CATEGORIES.CONDITION_2]: CONDITION_TYPES.CHECKIN_WEEKLY,
        [RESULT_CATEGORIES.CONDITION_3]: CONDITION_TYPES.IF_APPLICABLE_247
      });

    });

  });

});
