import {
  getCurrentPage,
  getNextPath,
  getPrevPath,
  getIsLastPage,
  formatDOB,
  isNotNumber,
  isNotInteger
} from './Helpers';

describe('Helpers', () => {

  describe('Path validation/utils', () => {

    describe('getCurrentPage', () => {

      test('should return current page when path ends with number', () => {

        expect(getCurrentPage({
          hash: '#/forms/psa/1'
        })).toEqual(1);

        expect(getCurrentPage({
          hash: '#/forms/psa/0'
        })).toEqual(0);

        expect(getCurrentPage({
          hash: '#/forms/psa/3'
        })).toEqual(3);

        expect(getCurrentPage({
          hash: '#/forms/psa/34?q=something'
        })).toEqual(34);

        expect(getCurrentPage({
          hash: '#/forms/psa/345?q=something&otherq=somethingElse'
        })).toEqual(345);

        expect(getCurrentPage({
          hash: '/forms/psa/1'
        })).toEqual(1);

        expect(getCurrentPage({
          hash: '/forms/psa/0'
        })).toEqual(0);

        expect(getCurrentPage({
          hash: '/forms/psa/3'
        })).toEqual(3);

        expect(getCurrentPage({
          hash: '/forms/psa/34?q=something'
        })).toEqual(34);

        expect(getCurrentPage({
          hash: '/forms/psa/345?q=something&otherq=somethingElse'
        })).toEqual(345);

      });

      test('should return NaN when no current page is found', () => {

        expect(getCurrentPage({
          hash: '#/forms/psa/'
        })).toEqual(Number.NaN);

        expect(getCurrentPage({
          hash: '#/forms/psa'
        })).toEqual(Number.NaN);

        expect(getCurrentPage({
          hash: '/forms/psa/'
        })).toEqual(Number.NaN);

        expect(getCurrentPage({
          hash: '/forms/psa'
        })).toEqual(Number.NaN);

        expect(getCurrentPage({
          hash: ''
        })).toEqual(Number.NaN);

      });

    });

    describe('getNextPath', () => {

      test('should return next path incrementing current page number', () => {

        expect(getNextPath({
          hash: '#/forms/psa/1'
        }, 500)).toEqual('/forms/psa/2');

        expect(getNextPath({
          hash: '#/forms/psa/0'
        }, 500)).toEqual('/forms/psa/1');

        expect(getNextPath({
          hash: '#/forms/psa/3'
        }, 500)).toEqual('/forms/psa/4');

        expect(getNextPath({
          hash: '#/forms/psa/34?q=something'
        }, 500)).toEqual('/forms/psa/35');

        expect(getNextPath({
          hash: '#/forms/psa/345?q=something&otherq=somethingElse'
        }, 500)).toEqual('/forms/psa/346');

        expect(getNextPath({
          hash: '/forms/psa/1'
        }, 500)).toEqual('/forms/psa/2');

        expect(getNextPath({
          hash: '/forms/psa/0'
        }, 500)).toEqual('/forms/psa/1');

        expect(getNextPath({
          hash: '/forms/psa/3'
        }, 500)).toEqual('/forms/psa/4');

        expect(getNextPath({
          hash: '/forms/psa/34?q=something'
        }, 500)).toEqual('/forms/psa/35');

        expect(getNextPath({
          hash: '/forms/psa/345?q=something&otherq=somethingElse'
        }, 346)).toEqual('/forms/psa/346');

      });

      test('should return null if next page number is greater than total pages', () => {
        expect(getNextPath({
          hash: '#/forms/psa/2'
        }, 1)).toEqual(null);

        expect(getNextPath({
          hash: '#/forms/psa/3'
        }, 2)).toEqual(null);

        expect(getNextPath({
          hash: '#/forms/psa/3234'
        }, 2)).toEqual(null);
      });

      test('should return null when no current page is found', () => {

        expect(getNextPath({
          hash: '#/forms/psa/'
        }, 2)).toEqual(null);

        expect(getNextPath({
          hash: '#/forms/psa'
        }, 2)).toEqual(null);

        expect(getNextPath({
          hash: '/forms/psa/'
        }, 2)).toEqual(null);

        expect(getNextPath({
          hash: '/forms/psa'
        }, 2)).toEqual(null);

        expect(getNextPath({
          hash: ''
        }, 2)).toEqual(null);

      });

    });

    describe('getPrevPath', () => {

      test('should return previous path decrementing current page number', () => {

        expect(getPrevPath({
          hash: '#/forms/psa/2'
        }, 500)).toEqual('/forms/psa/1');

        expect(getPrevPath({
          hash: '#/forms/psa/3'
        }, 500)).toEqual('/forms/psa/2');

        expect(getPrevPath({
          hash: '#/forms/psa/34?q=something'
        }, 500)).toEqual('/forms/psa/33');

        expect(getPrevPath({
          hash: '#/forms/psa/345?q=something&otherq=somethingElse'
        }, 500)).toEqual('/forms/psa/344');

        expect(getPrevPath({
          hash: '/forms/psa/2'
        }, 500)).toEqual('/forms/psa/1');

        expect(getPrevPath({
          hash: '/forms/psa/3'
        }, 500)).toEqual('/forms/psa/2');

        expect(getPrevPath({
          hash: '/forms/psa/34?q=something'
        }, 500)).toEqual('/forms/psa/33');

        expect(getPrevPath({
          hash: '/forms/psa/345?q=something&otherq=somethingElse'
        }, 346)).toEqual('/forms/psa/344');

      });

      test('should return null if previous page is less than 1', () => {
        expect(getPrevPath({
          hash: '#/forms/psa/1'
        }, 5)).toEqual(null);

        expect(getPrevPath({
          hash: '#/forms/psa/0'
        }, 2)).toEqual(null);

        expect(getPrevPath({
          hash: '#/forms/psa/-1'
        }, 2)).toEqual(null);
      });

      test('should return null when no current page is found', () => {

        expect(getPrevPath({
          hash: '#/forms/psa/'
        }, 2)).toEqual(null);

        expect(getPrevPath({
          hash: '#/forms/psa'
        }, 2)).toEqual(null);

        expect(getPrevPath({
          hash: '/forms/psa/'
        }, 2)).toEqual(null);

        expect(getPrevPath({
          hash: '/forms/psa'
        }, 2)).toEqual(null);

        expect(getPrevPath({
          hash: ''
        }, 2)).toEqual(null);

      });

    });

    describe('getIsLastPage', () => {

      test('should return true if current page is last page', () => {

        expect(getIsLastPage({
          hash: '#/forms/psa/1'
        }, 1)).toEqual(true);

        expect(getIsLastPage({
          hash: '/forms/psa/1'
        }, 1)).toEqual(true);

        expect(getIsLastPage({
          hash: '#/forms/psa/35'
        }, 35)).toEqual(true);

        expect(getIsLastPage({
          hash: '/forms/psa/35'
        }, 35)).toEqual(true);

      });

      test('should return false if current page is not last page', () => {

        expect(getIsLastPage({
          hash: '#/forms/psa/1'
        }, 2)).toEqual(false);

        expect(getIsLastPage({
          hash: '/forms/psa/1'
        }, 2)).toEqual(false);

        expect(getIsLastPage({
          hash: '#/forms/psa/35'
        }, 36)).toEqual(false);

        expect(getIsLastPage({
          hash: '/forms/psa/35'
        }, 36)).toEqual(false);

      });

      test('should return false when no current page found', () => {

        expect(getIsLastPage({
          hash: '#/forms/psa/'
        }, 1)).toEqual(false);

        expect(getIsLastPage({
          hash: '#/forms/psa'
        }, 0)).toEqual(false);

        expect(getIsLastPage({
          hash: '/forms/psa/'
        }, 36)).toEqual(false);

        expect(getIsLastPage({
          hash: '/forms/psa'
        }, 36)).toEqual(false);

        expect(getIsLastPage({
          hash: ''
        }, 0)).toEqual(false);

      });

    });

  });

  describe('Date formatting', () => {

    describe('formatDOB', () => {

      test('should format DOB in the expected format', () => {
        expect(formatDOB('1994-08-04')).toEqual('08/04/1994');
      });

      test('should return invalid dates as they were input', () => {
        expect(formatDOB('thisisnotadate')).toEqual('thisisnotadate');
        expect(formatDOB('august4 not 1994')).toEqual('august4 not 1994');
        expect(formatDOB(false)).toEqual(false);
      });

    });

  });

  describe('Number validation', () => {

    describe('isNotNumber', () => {

      test('should return false on valid number input', () => {
        expect(isNotNumber(5)).toEqual(false);
        expect(isNotNumber(5.00)).toEqual(false);
        expect(isNotNumber(5.0000000)).toEqual(false);
        expect(isNotNumber(5.00000004)).toEqual(false);
        expect(isNotNumber(0)).toEqual(false);
        expect(isNotNumber(100000)).toEqual(false);
        expect(isNotNumber(0.0)).toEqual(false);
        expect(isNotNumber(10.33)).toEqual(false);
        expect(isNotNumber('5')).toEqual(false);
        expect(isNotNumber('5.00')).toEqual(false);
        expect(isNotNumber('5.0000000')).toEqual(false);
        expect(isNotNumber('5.00000004')).toEqual(false);
        expect(isNotNumber('0')).toEqual(false);
        expect(isNotNumber('100000')).toEqual(false);
        expect(isNotNumber('0.0')).toEqual(false);
        expect(isNotNumber('10.33')).toEqual(false);
        expect(isNotNumber('3.')).toEqual(false);
      });

      test('should return true on invalid number input', () => {
        expect(isNotNumber('notanumber')).toEqual(true);
        expect(isNotNumber('345notanumber')).toEqual(true);
        expect(isNotNumber('notanumber789')).toEqual(true);
        expect(isNotNumber('00o0')).toEqual(true);
        expect(isNotNumber('3.6a2')).toEqual(true);
        expect(isNotNumber(true)).toEqual(true);
        expect(isNotNumber(false)).toEqual(true);
        expect(isNotNumber(null)).toEqual(true);
        expect(isNotNumber(undefined)).toEqual(true);
        expect(isNotNumber(() => {})).toEqual(true);
        expect(isNotNumber('')).toEqual(true);
      });

    });

    describe('isNotInteger', () => {

      test('should return false on valid integer input', () => {
        expect(isNotInteger(1)).toEqual(false);
        expect(isNotInteger(0)).toEqual(false);
        expect(isNotInteger(100)).toEqual(false);
        expect(isNotInteger(92834792384)).toEqual(false);
        expect(isNotInteger('1')).toEqual(false);
        expect(isNotInteger('0')).toEqual(false);
        expect(isNotInteger('100')).toEqual(false);
        expect(isNotInteger('92834792384')).toEqual(false);
      });

      test('should return true on invalid integer input', () => {
        expect(isNotInteger(3.5)).toEqual(true);
        expect(isNotInteger(5.00000004)).toEqual(true);
        expect(isNotInteger('3.0')).toEqual(true);
        expect(isNotInteger('3.5')).toEqual(true);
        expect(isNotInteger('5.00')).toEqual(true);
        expect(isNotInteger('5.0000000')).toEqual(true);
        expect(isNotInteger('5.00000004')).toEqual(true);
        expect(isNotInteger('notanumber')).toEqual(true);
        expect(isNotInteger('345notanumber')).toEqual(true);
        expect(isNotInteger('notanumber789')).toEqual(true);
        expect(isNotInteger('00o0')).toEqual(true);
        expect(isNotInteger('3.6a2')).toEqual(true);
        expect(isNotInteger(true)).toEqual(true);
        expect(isNotInteger(false)).toEqual(true);
        expect(isNotInteger(null)).toEqual(true);
        expect(isNotInteger(undefined)).toEqual(true);
        expect(isNotInteger(() => {})).toEqual(true);
        expect(isNotInteger('')).toEqual(true);
      });

    });

  });

});
