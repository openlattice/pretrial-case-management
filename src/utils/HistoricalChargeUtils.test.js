import Immutable from 'immutable';

import {
  getCaseNumFromCharge,
  shouldIgnoreCharge,
  chargeIsMostSerious,
  getUnique,

  chargeStatuteIsViolent,
  chargeFieldIsViolent,
  chargeIsViolent,
  getViolentChargeNums,

  degreeFieldIsMisdemeanor,
  chargeIsMisdemeanor,

  degreeFieldIsFelony,
  chargeIsFelony,

  dispositionIsGuilty,
  dispositionFieldIsGuilty,
  chargeIsGuilty
} from './HistoricalChargeUtils';

import {
  CASE_NUM,
  POA_CASE_NUM,
  MOCK_PRETRIAL_CASE
} from './consts/test/MockPretrialCases';

import {
  GUILTY_DISP_1,
  GUILTY_DISP_2,
  GUILTY_DISP_3,
  NOT_GUILTY_DISP_1,
  NOT_GUILTY_DISP_2,
  NOT_GUILTY_DISP_3,

  VIOLENT_F_STATUTE,
  VIOLENT_M_STATUTE,
  MISD_STATUTE,
  FEL_STATUTE
} from './consts/test/MockHistoricalChargeFields';

import {
  MOCK_GUILTY_MISDEMEANOR,
  MOCK_GUILTY_FELONY,
  MOCK_GUILTY_M_VIOLENT,
  MOCK_NOT_GUILTY_MISDEMEANOR,
  MOCK_NOT_GUILTY_FELONY,
  MOCK_NOT_GUILTY_F_VIOLENT,

  MOCK_GUILTY_BY_POA_MISDEMEANOR,

  MOCK_SHOULD_IGNORE_MO,
  MOCK_SHOULD_IGNORE_P,
  MOCK_SHOULD_IGNORE_PO,
  MOCK_SHOULD_IGNORE_POA
} from './consts/test/MockHistoricalCharges';

describe('HistoricalChargeUtils', () => {

  describe('Generic util functions', () => {

    describe('getCaseNumFromCharge', () => {

      test('should correctly return case number', () => {
        expect(getCaseNumFromCharge(MOCK_GUILTY_MISDEMEANOR)).toEqual(CASE_NUM);
        expect(getCaseNumFromCharge(MOCK_SHOULD_IGNORE_POA)).toEqual(POA_CASE_NUM);
      });

    });

    describe('shouldIgnoreCharge', () => {

      test('should ignore MO, PO, P, and POA charges', () => {
        expect(shouldIgnoreCharge(MOCK_SHOULD_IGNORE_MO)).toEqual(true);
        expect(shouldIgnoreCharge(MOCK_SHOULD_IGNORE_PO)).toEqual(true);
        expect(shouldIgnoreCharge(MOCK_SHOULD_IGNORE_P)).toEqual(true);
        expect(shouldIgnoreCharge(MOCK_SHOULD_IGNORE_POA)).toEqual(true);
      });

      test('should ignore charges with Guilty by POA pleas', () => {
        expect(shouldIgnoreCharge(MOCK_GUILTY_BY_POA_MISDEMEANOR)).toEqual(true);
      });

      test('should not ignore charges that are not MO, PO, P, or POA', () => {
        expect(shouldIgnoreCharge(MOCK_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(shouldIgnoreCharge(MOCK_GUILTY_FELONY)).toEqual(false);
        expect(shouldIgnoreCharge(MOCK_GUILTY_M_VIOLENT)).toEqual(false);
        expect(shouldIgnoreCharge(MOCK_NOT_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(shouldIgnoreCharge(MOCK_NOT_GUILTY_FELONY)).toEqual(false);
        expect(shouldIgnoreCharge(MOCK_NOT_GUILTY_F_VIOLENT)).toEqual(false);
      });

    });

    describe('chargeIsMostSerious', () => {

      test('should correctly identify most serious charge as most serious', () => {
        expect(chargeIsMostSerious(MOCK_NOT_GUILTY_F_VIOLENT, MOCK_PRETRIAL_CASE)).toEqual(true);
      });

      test('should correctly identify not most serious charge as not most serious', () => {
        expect(chargeIsMostSerious(MOCK_GUILTY_MISDEMEANOR, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_GUILTY_FELONY, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_GUILTY_M_VIOLENT, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_NOT_GUILTY_MISDEMEANOR, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_NOT_GUILTY_FELONY, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_SHOULD_IGNORE_MO, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_SHOULD_IGNORE_PO, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_SHOULD_IGNORE_P, MOCK_PRETRIAL_CASE)).toEqual(false);
        expect(chargeIsMostSerious(MOCK_SHOULD_IGNORE_POA, MOCK_PRETRIAL_CASE)).toEqual(false);
      });

    });

    describe('getUnique', () => {

      test('should remove duplicates from list', () => {
        expect(getUnique(Immutable.List.of(
          VIOLENT_F_STATUTE,
          VIOLENT_M_STATUTE,
          MISD_STATUTE,
          FEL_STATUTE,
        ))).toEqual(Immutable.List.of(
          VIOLENT_F_STATUTE,
          VIOLENT_M_STATUTE,
          MISD_STATUTE,
          FEL_STATUTE,
        ));

        expect(getUnique(Immutable.List.of(
          VIOLENT_F_STATUTE,
          VIOLENT_F_STATUTE,
          VIOLENT_F_STATUTE,
          VIOLENT_M_STATUTE,
          MISD_STATUTE,
          MISD_STATUTE,
          MISD_STATUTE,
          FEL_STATUTE,
          FEL_STATUTE,
          FEL_STATUTE,
        ))).toEqual(Immutable.List.of(
          VIOLENT_F_STATUTE,
          VIOLENT_M_STATUTE,
          MISD_STATUTE,
          FEL_STATUTE,
        ));

        expect(getUnique(Immutable.List.of(
          VIOLENT_F_STATUTE,
          VIOLENT_F_STATUTE,
          VIOLENT_F_STATUTE,
          VIOLENT_M_STATUTE,
        ))).toEqual(Immutable.List.of(
          VIOLENT_F_STATUTE,
          VIOLENT_M_STATUTE,
        ));
      });

      expect(getUnique(Immutable.List.of())).toEqual(Immutable.List.of());

    });

  });

  describe('Violent charge utils', () => {

    describe('chargeStatuteIsViolent', () => {

      test('should correctly identify violent statutes as violent', () => {
        expect(chargeStatuteIsViolent(VIOLENT_F_STATUTE)).toEqual(true);
        expect(chargeStatuteIsViolent(VIOLENT_M_STATUTE)).toEqual(true);
      });

      test('should correctly identify nonviolent statutes as nonviolent', () => {
        expect(chargeStatuteIsViolent(MISD_STATUTE)).toEqual(false);
        expect(chargeStatuteIsViolent(FEL_STATUTE)).toEqual(false);
      });

    });

    describe('chargeFieldIsViolent', () => {

      test('should correctly identify violent statute fields as violent', () => {
        expect(chargeFieldIsViolent([VIOLENT_F_STATUTE])).toEqual(true);
        expect(chargeFieldIsViolent([VIOLENT_M_STATUTE])).toEqual(true);
      });

      test('should correctly identify nonviolent statute fields as nonviolent', () => {
        expect(chargeFieldIsViolent([MISD_STATUTE])).toEqual(false);
        expect(chargeFieldIsViolent([FEL_STATUTE])).toEqual(false);
      });

    });

    describe('chargeIsViolent', () => {

      test('should correctly identify violent charges as violent', () => {
        expect(chargeIsViolent(MOCK_GUILTY_M_VIOLENT)).toEqual(true);
        expect(chargeIsViolent(MOCK_NOT_GUILTY_F_VIOLENT)).toEqual(true);
      });

      test('should correctly identify nonviolent charges as nonviolent', () => {
        expect(chargeIsViolent(MOCK_NOT_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(chargeIsViolent(MOCK_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(chargeIsViolent(MOCK_NOT_GUILTY_FELONY)).toEqual(false);
        expect(chargeIsViolent(MOCK_GUILTY_FELONY)).toEqual(false);
        expect(chargeIsViolent(MOCK_SHOULD_IGNORE_P)).toEqual(false);
        expect(chargeIsViolent(MOCK_SHOULD_IGNORE_PO)).toEqual(false);
        expect(chargeIsViolent(MOCK_SHOULD_IGNORE_POA)).toEqual(false);
        expect(chargeIsViolent(MOCK_SHOULD_IGNORE_MO)).toEqual(false);
      });

    });

    describe('getViolentChargeNums', () => {

      test('should return violent charge statutes from a list', () => {
        expect(getViolentChargeNums([
          VIOLENT_M_STATUTE,
          VIOLENT_M_STATUTE
        ])).toEqual([VIOLENT_M_STATUTE]);
        expect(getViolentChargeNums([
          VIOLENT_M_STATUTE,
          VIOLENT_M_STATUTE,
          VIOLENT_F_STATUTE
        ])).toEqual([VIOLENT_M_STATUTE, VIOLENT_F_STATUTE]);
        expect(getViolentChargeNums([
          VIOLENT_M_STATUTE,
          MISD_STATUTE,
          VIOLENT_M_STATUTE,
          VIOLENT_F_STATUTE
        ])).toEqual([VIOLENT_M_STATUTE, VIOLENT_F_STATUTE]);
        expect(getViolentChargeNums([
          FEL_STATUTE,
          VIOLENT_M_STATUTE,
          VIOLENT_M_STATUTE,
          MISD_STATUTE,
          VIOLENT_F_STATUTE,
          FEL_STATUTE
        ])).toEqual([VIOLENT_M_STATUTE, VIOLENT_F_STATUTE]);
      });

    });

  });

  describe('Misdemeanor charge utils', () => {

    describe('degreeFieldIsMisdemeanor', () => {

      test('should correctly identify misdemeanor fields as misdemeanors', () => {
        expect(degreeFieldIsMisdemeanor(['M1'])).toEqual(true);
        expect(degreeFieldIsMisdemeanor(['M2'])).toEqual(true);
      });

      test('should correctly identify non-misdemeanor fields as non-misdemeanors', () => {
        expect(degreeFieldIsMisdemeanor(['MO'])).toEqual(false);
        expect(degreeFieldIsMisdemeanor(['F1'])).toEqual(false);
        expect(degreeFieldIsMisdemeanor(['F6'])).toEqual(false);
        expect(degreeFieldIsMisdemeanor(['FA'])).toEqual(false);
      });

    });

    describe('chargeIsMisdemeanor', () => {

      test('should correctly identify misdemeanor charges as misdemeanors', () => {
        expect(chargeIsMisdemeanor(MOCK_NOT_GUILTY_MISDEMEANOR)).toEqual(true);
        expect(chargeIsMisdemeanor(MOCK_GUILTY_MISDEMEANOR)).toEqual(true);
        expect(chargeIsMisdemeanor(MOCK_GUILTY_M_VIOLENT)).toEqual(true);
      });

      test('should correctly identify non-misdemeanor charges as non-misdemeanors', () => {
        expect(chargeIsMisdemeanor(MOCK_NOT_GUILTY_FELONY)).toEqual(false);
        expect(chargeIsMisdemeanor(MOCK_GUILTY_FELONY)).toEqual(false);
        expect(chargeIsMisdemeanor(MOCK_NOT_GUILTY_F_VIOLENT)).toEqual(false);
        expect(chargeIsMisdemeanor(MOCK_SHOULD_IGNORE_MO)).toEqual(false);
        expect(chargeIsMisdemeanor(MOCK_SHOULD_IGNORE_P)).toEqual(false);
        expect(chargeIsMisdemeanor(MOCK_SHOULD_IGNORE_PO)).toEqual(false);
        expect(chargeIsMisdemeanor(MOCK_SHOULD_IGNORE_POA)).toEqual(false);
      });

    });

  });

  describe('Felony charge utils', () => {

    describe('degreeFieldIsFelony', () => {

      test('should correctly identify felony fields as felonies', () => {
        expect(degreeFieldIsFelony(['F1'])).toEqual(true);
        expect(degreeFieldIsFelony(['F2'])).toEqual(true);
        expect(degreeFieldIsFelony(['F3'])).toEqual(true);
        expect(degreeFieldIsFelony(['F4'])).toEqual(true);
        expect(degreeFieldIsFelony(['F5'])).toEqual(true);
        expect(degreeFieldIsFelony(['F6'])).toEqual(true);
        expect(degreeFieldIsFelony(['FA'])).toEqual(true);
        expect(degreeFieldIsFelony(['FB'])).toEqual(true);
        expect(degreeFieldIsFelony(['FC'])).toEqual(true);
        expect(degreeFieldIsFelony(['F'])).toEqual(true);
      });

      test('should correctly identify non-felony fields as non-felonies', () => {
        expect(degreeFieldIsFelony(['MO'])).toEqual(false);
        expect(degreeFieldIsFelony(['M1'])).toEqual(false);
        expect(degreeFieldIsFelony(['M2'])).toEqual(false);
        expect(degreeFieldIsFelony(['P'])).toEqual(false);
      });

    });

    describe('chargeIsFelony', () => {

      test('should correctly identify felony charges as felonies', () => {
        expect(chargeIsFelony(MOCK_NOT_GUILTY_FELONY)).toEqual(true);
        expect(chargeIsFelony(MOCK_GUILTY_FELONY)).toEqual(true);
        expect(chargeIsFelony(MOCK_NOT_GUILTY_F_VIOLENT)).toEqual(true);
      });

      test('should correctly identify non-felony charges as non-felonies', () => {
        expect(chargeIsFelony(MOCK_NOT_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(chargeIsFelony(MOCK_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(chargeIsFelony(MOCK_GUILTY_M_VIOLENT)).toEqual(false);
        expect(chargeIsFelony(MOCK_SHOULD_IGNORE_MO)).toEqual(false);
        expect(chargeIsFelony(MOCK_SHOULD_IGNORE_P)).toEqual(false);
        expect(chargeIsFelony(MOCK_SHOULD_IGNORE_PO)).toEqual(false);
        expect(chargeIsFelony(MOCK_SHOULD_IGNORE_POA)).toEqual(false);
      });

    });

  });

  describe('Convicted charge utils', () => {

    describe('dispositionIsGuilty', () => {

      test('should correctly identify guilty dispositions as guilty', () => {
        expect(dispositionIsGuilty(GUILTY_DISP_1)).toEqual(true);
        expect(dispositionIsGuilty(GUILTY_DISP_2)).toEqual(true);
        expect(dispositionIsGuilty(GUILTY_DISP_3)).toEqual(true);
      });

      test('should correctly identify not guilty dispositions as not guilty', () => {
        expect(dispositionIsGuilty(NOT_GUILTY_DISP_1)).toEqual(false);
        expect(dispositionIsGuilty(NOT_GUILTY_DISP_2)).toEqual(false);
        expect(dispositionIsGuilty(NOT_GUILTY_DISP_3)).toEqual(false);
      });

    });

    describe('dispositionFieldIsGuilty', () => {

      test('should correctly identify guilty disposition fields as guilty', () => {
        expect(dispositionFieldIsGuilty([GUILTY_DISP_1])).toEqual(true);
        expect(dispositionFieldIsGuilty([GUILTY_DISP_2])).toEqual(true);
        expect(dispositionFieldIsGuilty([GUILTY_DISP_3])).toEqual(true);
      });

      test('should correctly identify not guilty disposition fields as not guilty', () => {
        expect(dispositionFieldIsGuilty([NOT_GUILTY_DISP_1])).toEqual(false);
        expect(dispositionFieldIsGuilty([NOT_GUILTY_DISP_2])).toEqual(false);
        expect(dispositionFieldIsGuilty([NOT_GUILTY_DISP_3])).toEqual(false);
      });

    });

    describe('chargeIsGuilty', () => {

      test('should correctly identify guilty charges as guilty', () => {
        expect(chargeIsGuilty(MOCK_GUILTY_MISDEMEANOR)).toEqual(true);
        expect(chargeIsGuilty(MOCK_GUILTY_FELONY)).toEqual(true);
        expect(chargeIsGuilty(MOCK_GUILTY_M_VIOLENT)).toEqual(true);
      });

      test('should correctly identify not guilty charges as not guilty', () => {
        expect(chargeIsGuilty(MOCK_NOT_GUILTY_MISDEMEANOR)).toEqual(false);
        expect(chargeIsGuilty(MOCK_NOT_GUILTY_FELONY)).toEqual(false);
        expect(chargeIsGuilty(MOCK_NOT_GUILTY_F_VIOLENT)).toEqual(false);
      });

      test('should identify charges with pleas of "Guilty by POA" as not guilty', () => {
        expect(chargeIsGuilty(MOCK_GUILTY_BY_POA_MISDEMEANOR)).toEqual(false);
      });

    });

  });

});
