/*
 * @flow
 */

/* eslint-disable import/prefer-default-export */

import Lattice from 'lattice';
import moment from 'moment';

export function formatValue(rawValue :string | string[]) :string {
  if (!rawValue || (!rawValue.length && !rawValue.size)) return '';
  if (typeof rawValue === 'string') {
    return rawValue || '';
  }
  return rawValue.join(', ');
}

export function formatDate(dateString :string, optionalFormat :?string) :string {
  if (!dateString) return '';
  const date = moment.utc(dateString);
  if (!date || !date.isValid()) return dateString;
  const format = optionalFormat || 'MM/DD/YYYY';
  return date.format(format);
}

export function formatDateList(dateList :string[], optionalFormat :?string) :string {
  if (!dateList || (!dateList.length && !dateList.size)) return '';
  return dateList.map(dateString => formatDate(dateString, optionalFormat)).join(', ');
}

export function toISODateTime(momentObj) {
  let momentStr;
  if (momentObj && momentObj.isValid()) {
    momentStr = momentObj.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }
  return momentStr;
}

export function toISODate(momentObj) {
  let momentStr;
  if (momentObj && momentObj.isValid()) {
    momentStr = momentObj.format('YYYY-MM-DD');
  }
  return momentStr;
}
