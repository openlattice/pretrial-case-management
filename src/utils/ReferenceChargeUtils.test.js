import edm from './consts/test/MockEdm';
import { getValidRow } from './ReferenceChargeUtils';

import {
  CHARGE_IMPORT_1,
  CHARGE_IMPORT_1_PTID,
  CHARGE_IMPORT_2,
  CHARGE_IMPORT_2_PTID,
  CHARGE_IMPORT_3,
  CHARGE_IMPORT_4,
  CHARGE_IMPORT_5,
  CHARGE_IMPORT_6
} from './consts/test/MockChargeImports';

describe('ReferenceChargeUtils', () => {

  describe('getValidRow', () => {

    test('Should return valid charge', () => {

      expect(getValidRow(CHARGE_IMPORT_1, edm))
        .toEqual(CHARGE_IMPORT_1_PTID);

      expect(getValidRow(CHARGE_IMPORT_2, edm))
        .toEqual(CHARGE_IMPORT_2_PTID);
    });

    test('should return null if doesn\'t include statute', () => {

      expect(getValidRow(CHARGE_IMPORT_3, edm))
        .toEqual(null);

    });

    test('should return null if doesn\'t include description', () => {

      expect(getValidRow(CHARGE_IMPORT_4, edm))
        .toEqual(null);

    });

    test('should return null if a boolean typed value is a string', () => {

      expect(getValidRow(CHARGE_IMPORT_5, edm))
        .toEqual(null);

    });

    test('should return null if a string typed value is a boolean', () => {

      expect(getValidRow(CHARGE_IMPORT_6, edm))
        .toEqual(null);

    });

  });
});
