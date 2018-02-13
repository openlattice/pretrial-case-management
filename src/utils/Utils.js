/*
 * @flow
 */

/* eslint-disable import/prefer-default-export */

import Lattice from 'lattice';
import moment from 'moment';

// injected by Webpack.DefinePlugin
declare var __DEV__;

export function configureLattice(authToken :?string) :void {

  const host :string = window.location.host;
  const hostName :string = (host.startsWith('www.')) ? host.substring('www.'.length) : host;
  const baseUrl :string = (__DEV__) ? 'http://localhost:8080' : `https://api.${hostName}`;

  Lattice.configure({ authToken, baseUrl });
}

export function formatValue(rawValue :string|string[]) {
  if (rawValue instanceof Array) {
    return rawValue.join(', ');
  }
  return rawValue || '';
}

export function formatDate(dateString :string) {
  if (!dateString) return '';
  const date = moment.utc(dateString);
  if (!date || !date.isValid) return dateString;
  return date.format('MM/DD/YYYY');
}

export function formatDateList(dateList :string[]) {
  if (!dateList || !dateList.length) return '';
  return dateList.map((dateString) => {
    return formatDate(dateString);
  }).join(', ');
}
