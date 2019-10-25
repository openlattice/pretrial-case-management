/*
 * @flow
 */

import Immutable from 'immutable';

import {
  formatValue,

  formatDate,
  formatDateList,

  formatDateTime,
  formatDateTimeList
} from './FormattingUtils';

describe('FormattingUtils', () => {

  describe('Generic value formatting', () => {

    describe('formatValue', () => {

      test('should return an empty string on invalid inputs', () => {
        expect(formatValue()).toEqual('');
        expect(formatValue(undefined)).toEqual('');
        expect(formatValue(null)).toEqual('');
        expect(formatValue(() => {})).toEqual('');
        expect(formatValue(10)).toEqual('');
      });

      test('should return string inputs as they are passed in', () => {
        expect(formatValue('hello')).toEqual('hello');
        expect(formatValue('')).toEqual('');
      });

      test('should format array values as comma separated list', () => {
        expect(formatValue([])).toEqual('');
        expect(formatValue(['a', 'b', 'c'])).toEqual('a, b, c');
        expect(formatValue([1, 2, 3])).toEqual('1, 2, 3');
        expect(formatValue(['hi'])).toEqual('hi');
      });

      test('should format Immutable list values as comma separated list', () => {
        expect(formatValue(Immutable.List())).toEqual('');
        expect(formatValue(Immutable.List.of('a', 'b', 'c'))).toEqual('a, b, c');
        expect(formatValue(Immutable.List.of(1, 2, 3))).toEqual('1, 2, 3');
        expect(formatValue(Immutable.List.of('hi'))).toEqual('hi');
      });

    });

  });

  describe('Date formatting', () => {

    describe('formatDate', () => {

      test('should return an empty string on invalid date inputs', () => {
        expect(formatDate()).toEqual('');
        expect(formatDate('')).toEqual('');
        expect(formatDate(null)).toEqual('');
        expect(formatDate(undefined)).toEqual('');
      });

      test('should return input param if present but cannot be parsed as a date', () => {
        expect(formatDate('not a date')).toEqual('not a date');
      });

      test('should format dates in the default format', () => {
        expect(formatDate('1994-08-04')).toEqual('08/04/1994');
        expect(formatDate('1999-12-01')).toEqual('12/01/1999');
        expect(formatDate('1989-08-03')).toEqual('08/03/1989');
      });

    });

    describe('formatDateList', () => {

      test('should return empty string on invalid or empty input', () => {
        expect(formatDateList()).toEqual('');
        expect(formatDateList(null)).toEqual('');
        expect(formatDateList(undefined)).toEqual('');
        expect(formatDateList('')).toEqual('');
        expect(formatDateList([])).toEqual('');
        expect(formatDateList(Immutable.List())).toEqual('');
      });

      test('should return comma separated list of supplied date arrays', () => {
        expect(formatDateList(['1994-08-04'])).toEqual('08/04/1994');
        expect(formatDateList(['1994-08-04', '2018-01-01'])).toEqual('08/04/1994, 01/01/2018');
        expect(formatDateList([
          '1994-08-04',
          '2018-01-01',
          '1995-08-09'
        ])).toEqual('08/04/1994, 01/01/2018, 08/09/1995');
      });

      test('should return comma separated list of supplied Immutable date lists', () => {
        expect(formatDateList(Immutable.List.of('1994-08-04'))).toEqual('08/04/1994');
        expect(formatDateList(Immutable.List.of('1994-08-04', '2018-01-01'))).toEqual('08/04/1994, 01/01/2018');
        expect(formatDateList(Immutable.List.of(
          '1994-08-04',
          '2018-01-01',
          '1995-08-09'
        ))).toEqual('08/04/1994, 01/01/2018, 08/09/1995');
      });

    });

  });

  describe('DateTime formatting', () => {

    describe('formatDateTime', () => {

      test('should return an empty string on invalid datetime inputs', () => {
        expect(formatDateTime()).toEqual('');
        expect(formatDateTime('')).toEqual('');
        expect(formatDateTime(null)).toEqual('');
        expect(formatDateTime(undefined)).toEqual('');
      });

      test('should return input param if present but cannot be parsed as a datetime', () => {
        expect(formatDateTime('not a datetime')).toEqual('not a datetime');
      });

      test('should format datetimes in the default format', () => {
        expect(formatDateTime('1994-08-04T10:45:00.000')).toEqual('08/04/1994 10:45 AM');
        expect(formatDateTime('2011-09-10T10:45:00.000')).toEqual('09/10/2011 10:45 AM');
      });

    });

    describe('formatDateTimeList', () => {

      test('should return empty string on invalid or empty input', () => {
        expect(formatDateTimeList()).toEqual('');
        expect(formatDateTimeList(null)).toEqual('');
        expect(formatDateTimeList(undefined)).toEqual('');
        expect(formatDateTimeList('')).toEqual('');
        expect(formatDateTimeList([])).toEqual('');
        expect(formatDateTimeList(Immutable.List())).toEqual('');
      });

      test('should return comma separated list of supplied datetime arrays', () => {
        expect(formatDateTimeList(['1994-08-04T10:45:00.000'])).toEqual('08/04/1994 10:45 AM');
        expect(formatDateTimeList([
          '1994-08-04T13:00:00.000',
          '2018-01-01T01:00:00.000'
        ])).toEqual('08/04/1994 1:00 PM, 01/01/2018 2:00 AM');
        expect(formatDateTimeList([
          '1994-08-04T11:15:00.000',
          '2018-01-01T10:00:00.000',
          '1995-08-09T07:59:00.000'
        ])).toEqual('08/04/1994 11:15 AM, 01/01/2018 11:00 AM, 08/09/1995 7:59 AM');
      });

      test('should return comma separated list of supplied Immutable datetime lists', () => {
        expect(formatDateTimeList(Immutable.List.of('1994-08-04T10:45:00.000'))).toEqual('08/04/1994 10:45 AM');
        expect(formatDateTimeList(Immutable.List.of(
          '1994-08-04T13:00:00.000',
          '2018-01-01T01:00:00.000'
        ))).toEqual('08/04/1994 1:00 PM, 01/01/2018 2:00 AM');
        expect(formatDateTimeList(Immutable.List.of(
          '1994-08-04T11:15:00.000',
          '2018-01-01T10:00:00.000',
          '1995-08-09T07:59:00.000'
        ))).toEqual('08/04/1994 11:15 AM, 01/01/2018 11:00 AM, 08/09/1995 7:59 AM');
      });

    });

  });

});
