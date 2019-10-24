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

export function formatDate(dateString :string) :string {
  if (!dateString) return '';
  const todayIsInDST = DateTime.local().isInDST;
  let date = DateTime.fromISO(dateString);
  if (!todayIsInDST && date.isInDST) date = date.minus({ hours: 1 });
  if (todayIsInDST && !date.isInDST) date = date.plus({ hours: 1 });
  if (!date || !date.isValid) return dateString;
  return date.toFormat(DATE_FORMAT);
}

export function formatTime(dateString :string) :string {
  if (!dateString) return '';
  const todayIsInDST = DateTime.local().isInDST;
  let date = DateTime.fromISO(dateString);
  if (!todayIsInDST && date.isInDST) date = date.minus({ hours: 1 });
  if (todayIsInDST && !date.isInDST) date = date.plus({ hours: 1 });
  if (!date || !date.isValid) return dateString;
  return date.toFormat(TIME_FORMAT);
}

export function formatDateList(dateList :string[]) :string {
  if (!dateList || (!dateList.length && !dateList.size)) return '';
  return dateList.map(dateString => formatDate(dateString)).join(', ');
}

export function formatDateTime(dateString :string) :string {
  if (!dateString) return '';
  const todayIsInDST = DateTime.local().isInDST;
  let date = DateTime.fromISO(dateString);
  if (!todayIsInDST && date.isInDST) date = date.minus({ hours: 1 });
  if (todayIsInDST && !date.isInDST) date = date.plus({ hours: 1 });
  if (!date || !date.isValid) return dateString;
  return date.toFormat(DATETIME_FORMAT);
}

export function formatDateTimeList(dateTimeList :string[]) :string {
  if (!dateTimeList || (!dateTimeList.length && !dateTimeList.size)) return '';
  return dateTimeList.map(dateString => formatDateTime(dateString)).join(', ');
}
