import Immutable from 'immutable';
import moment from 'moment';

import {
  formatValue,

  formatDate,
  formatDateList,
  toISODate,

  formatDateTime,
  formatDateTimeList,
  toISODateTime
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
        expect(formatDate('08/04/1994')).toEqual('08/04/1994');
        expect(formatDate('August 4, 1994')).toEqual('08/04/1994');
        expect(formatDate('Aug 4 1994')).toEqual('08/04/1994');
        expect(formatDate('08/04/94')).toEqual('08/04/1994');
        expect(formatDate('1994-08-04')).toEqual('08/04/1994');
        expect(formatDate('08-04-1994')).toEqual('08/04/1994');
      });

      test('should format dates in the requested format', () => {
        expect(formatDate('08/04/1994', 'DD-MM-YYYY')).toEqual('04-08-1994');
        expect(formatDate('08/04/94', 'YYYY-MM-DD')).toEqual('1994-08-04');
        expect(formatDate('1994-08-04', 'M/D/Y')).toEqual('8/4/1994');
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
        expect(formatDateList(['08/04/1994'])).toEqual('08/04/1994');
        expect(formatDateList(['08/04/1994', '2018-01-01'])).toEqual('08/04/1994, 01/01/2018');
        expect(formatDateList([
          '08/04/1994',
          '2018-01-01',
          'August 9, 1995'
        ])).toEqual('08/04/1994, 01/01/2018, 08/09/1995');
      });

      test('should return comma separated list of supplied Immutable date lists', () => {
        expect(formatDateList(Immutable.List.of('08/04/1994'))).toEqual('08/04/1994');
        expect(formatDateList(Immutable.List.of('08/04/1994', '2018-01-01'))).toEqual('08/04/1994, 01/01/2018');
        expect(formatDateList(Immutable.List.of(
          '08/04/1994',
          '2018-01-01',
          'August 9, 1995'
        ))).toEqual('08/04/1994, 01/01/2018, 08/09/1995');
      });

      test('should return dates formatted as requested', () => {
        expect(formatDateList(Immutable.List.of('08/04/1994'), 'MM DD YY')).toEqual('08 04 94');
        expect(formatDateList(['08/04/1994', '2018-01-01'], 'D-M-YYYY')).toEqual('4-8-1994, 1-1-2018');
        expect(formatDateList(Immutable.List.of(
          '08/04/1994',
          '2018-01-01',
          'August 9, 1995'
        ), 'YY/MM/DD')).toEqual('94/08/04, 18/01/01, 95/08/09');
      });

    });

    describe('toISODate', () => {

      test('should return undefined if the input param is not a valid moment object', () => {
        expect(toISODate()).toEqual(undefined);
        expect(toISODate(undefined)).toEqual(undefined);
        expect(toISODate(null)).toEqual(undefined);
        expect(toISODate('08/04/1994')).toEqual(undefined);
        expect(toISODate(['08/04/1994'])).toEqual(undefined);
      });

      test('should return properly formated ISO date on valid moment input', () => {
        expect(toISODate(moment('08/04/1994'))).toEqual('1994-08-04');
        expect(toISODate(moment('08-04-1994'))).toEqual('1994-08-04');
        expect(toISODate(moment('1994-08-04'))).toEqual('1994-08-04');
        expect(toISODate(moment('August 4 1994'))).toEqual('1994-08-04');
        expect(toISODate(moment('Aug 4, 1994'))).toEqual('1994-08-04');
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
        expect(formatDateTime('8/04/1994 10:45 AM')).toEqual('08/04/1994 10:45am');
        expect(formatDateTime('August 4 1994 10:45:00')).toEqual('08/04/1994 10:45am');
        expect(formatDateTime('Aug 4 1994 13:45:00')).toEqual('08/04/1994 1:45pm');
        expect(formatDateTime('10:45 pm 1994-08-04')).toEqual('08/04/1994 10:45pm');
        expect(formatDateTime('1994-08-04T10:45:00.000')).toEqual('08/04/1994 10:45am');
      });

      test('should format datetimes in the requested format', () => {
        expect(formatDateTime('8/4/1994 10:45 AM', 'YYYY-MM-DD hh:mm a')).toEqual('1994-08-04 10:45 am');
        expect(formatDateTime('Aug 4 1994 13:45:00', 'YYYY-MM-DD hh:mm a')).toEqual('1994-08-04 01:45 pm');
        expect(formatDateTime('August 4 1994 13:45', 'YYYY-MM-DD HH:mm')).toEqual('1994-08-04 13:45');
        expect(formatDateTime('1994-08-04T10:45:00.000', 'HH DD MM YY mm')).toEqual('10 04 08 94 45');
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
        expect(formatDateTimeList(['08/04/1994 10:45 am'])).toEqual('08/04/1994 10:45am');
        expect(formatDateTimeList([
          '08/04/1994 13:00',
          '2018-01-01 1:0 am'
        ])).toEqual('08/04/1994 1:00pm, 01/01/2018 1:00am');
        expect(formatDateTimeList([
          '11:15 08/04/1994',
          '2018-01-01 10:00:15',
          '1995-08-09T07:59:00.000'
        ])).toEqual('08/04/1994 11:15am, 01/01/2018 10:00am, 08/09/1995 7:59am');
      });

      test('should return comma separated list of supplied Immutable datetime lists', () => {
        expect(formatDateTimeList(Immutable.List.of('08/04/1994 10:45 am'))).toEqual('08/04/1994 10:45am');
        expect(formatDateTimeList(Immutable.List.of(
          '08/04/1994 13:00',
          '2018-01-01 1:0 am'
        ))).toEqual('08/04/1994 1:00pm, 01/01/2018 1:00am');
        expect(formatDateTimeList(Immutable.List.of(
          '11:15 08/04/1994',
          '2018-01-01 10:00:15',
          '1995-08-09T07:59:00.000'
        ))).toEqual('08/04/1994 11:15am, 01/01/2018 10:00am, 08/09/1995 7:59am');
      });

      test('should return datetime lists formatted as requested', () => {
        expect(formatDateTimeList(Immutable.List.of(
          '08/04/1994 10:45 am'
        ), 'YY-MM-DD HHmm')).toEqual('94-08-04 1045');
        expect(formatDateTimeList(Immutable.List.of(
          '08/04/1994 13:00',
          '2018-01-01 1:0 am'
        ), 'hh:mma MM DD YYYY')).toEqual('01:00pm 08 04 1994, 01:00am 01 01 2018');
        expect(formatDateTimeList(Immutable.List.of(
          '11:15 08/04/1994',
          '2018-01-01 10:00:15',
          '1995-08-09T07:59:00.000'
        ), 'mm:HH:DD:MM:YY')).toEqual('15:11:04:08:94, 00:10:01:01:18, 59:07:09:08:95');
      });

    });

    describe('toISODateTime', () => {

      test('should return undefined if the input param is not a valid moment object', () => {
        expect(toISODateTime()).toEqual(undefined);
        expect(toISODateTime(undefined)).toEqual(undefined);
        expect(toISODateTime(null)).toEqual(undefined);
        expect(toISODateTime('08/04/1994')).toEqual(undefined);
        expect(toISODateTime(['08/04/1994'])).toEqual(undefined);
      });

      test('should return properly formated ISO datetime on valid moment input', () => {
        const stripTimeZone = str => str.slice(0, str.length - 6);

        expect(stripTimeZone(toISODateTime(moment('08/04/1994 10:45 AM')))).toEqual('1994-08-04T10:45:00.000');
        expect(stripTimeZone(toISODateTime(moment('1994-08-04 10:45 PM')))).toEqual('1994-08-04T22:45:00.000');
        expect(stripTimeZone(toISODateTime(moment('8-4-94 22:45')))).toEqual('1994-08-04T22:45:00.000');
        expect(stripTimeZone(toISODateTime(moment('August 9 1995 7:59')))).toEqual('1995-08-09T07:59:00.000');
        expect(stripTimeZone(toISODateTime(moment('August 9 1995 7:59:00 PM')))).toEqual('1995-08-09T19:59:00.000');
      });

    });

  });

});
