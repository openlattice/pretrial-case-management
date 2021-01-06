/*
 * @flow
 */

import { DateTime } from 'luxon';

import { getSearchTermNotExact } from '../DataUtils';

export const DATE_FORMAT = 'MM/dd/yyyy';
export const TIME_FORMAT = 'h:mm a';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

export const getUTCDateRangeSearchString = (PTID :UUID, startDate :DateTime, endDate :?DateTime) => {
  let start = startDate.toUTC().toISO();
  let end;
  if (!endDate) {
    start = startDate.startOf('day').toUTC().toISO();
    end = startDate.endOf('day').toUTC().toISO();
  }
  else {
    end = endDate.toUTC().toISO();
  }
  const dateRangeString = `[${start} TO ${end}]`;
  return getSearchTermNotExact(PTID, dateRangeString);
};
