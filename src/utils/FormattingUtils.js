/*
 * @flow
 */

/* eslint-disable import/prefer-default-export */

import { DateTime } from 'luxon';

import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT } from './consts/DateTimeConsts';

export function formatValue(rawValue :string | string[]) :string {
  if (!rawValue || (!rawValue.length && !rawValue.size)) return '';
  if (typeof rawValue === 'string') {
    return rawValue || '';
  }
  return rawValue.join(', ');
}
export function formatAutofill(rawValue :string | string[]) :string {
  if (!rawValue || (!rawValue.length && !rawValue.size)) return '';
  if (typeof rawValue === 'string') {
    return rawValue || '';
  }
  return rawValue.join('\n');
}

export const formateDTtoDateString = (dateTime :DateTime) => dateTime.toFormat(DATE_FORMAT);
export const formateDTtoDateTimeString = (dateTime :DateTime) => dateTime.toFormat(DATETIME_FORMAT);
export const formateDTtoTimeString = (dateTime :DateTime) => dateTime.toFormat(TIME_FORMAT);

export function formatDate(dateString :string) :string {
  if (!dateString) return '';
  const date = DateTime.fromISO(dateString);
  if (!date || !date.isValid) return dateString;
  return formateDTtoDateString(date);
}

export function formatTime(dateString :string) :string {
  if (!dateString) return '';
  const date = DateTime.fromISO(dateString);
  if (!date || !date.isValid) return dateString;
  return formateDTtoTimeString(date);
}

export function formatDateList(dateList :string[]) :string {
  if (!dateList || (!dateList.length && !dateList.size)) return '';
  return dateList.map(dateString => formatDate(dateString)).join(', ');
}

export function formatDateTime(dateString :string) :string {
  if (!dateString) return '';
  const date = DateTime.fromISO(dateString);
  if (!date || !date.isValid) return dateString;
  return formateDTtoDateTimeString(date);
}
