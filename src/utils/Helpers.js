/*
 * @flow
 */

import moment from 'moment';
import { FORM_LENGTHS } from './consts/Consts';

type Location = {
  hash :string
};

const getSplitStr = (location :Location) :string[] => {
  const splitStr = location ? location.hash.split('/') : [];
  if (splitStr[0] && splitStr[0] === '#') splitStr[0] = '';
  return splitStr;
};

const getPage = (splitStr :string[]) :number => {
  const page = splitStr[splitStr.length - 1];
  return parseInt(page, 10);
};

export const getCurrentPage = (location :Location) :number => getPage(getSplitStr(location));

export const getNextPath = (location :Location, numPages :number) :?string => {
  const splitStr = getSplitStr(location);
  const page = getPage(splitStr);
  const nextPage = page + 1;
  splitStr[splitStr.length - 1] = `${nextPage}`;
  return nextPage <= numPages ? splitStr.join('/') : null;
};

export const getPrevPath = (location :Location) :?string => {
  const splitStr = getSplitStr(location);
  const page = getPage(splitStr);
  const prevPage = page - 1;
  splitStr[splitStr.length - 1] = `${prevPage}`;
  return prevPage >= 1 ? splitStr.join('/') : null;
};

export const getIsLastPage = (location :Location, optionalNumPages :?number) :boolean => {
  const splitStr = getSplitStr(location);
  const formName = splitStr[splitStr.length - 2];
  const numPages = optionalNumPages || FORM_LENGTHS[formName];
  return getPage(splitStr) === numPages;
};

export const getProgress = (location :Location, numPages :number) :{} => {
  const splitStr = getSplitStr(location);
  const page = getPage(splitStr);
  const num = Math.ceil(((page - 1) / (numPages - 1)) * 100);
  const percentage = `${num.toString()}%`;
  return num === 0 ? { num: 5, percentage } : { num, percentage };
};

export const formatDOB = (dob :string) :string => moment(dob).format('MM/DD/YYYY');

export const isNotNumber = (number :number) :boolean => {
  if (!number) return true;
  let formattedStr = `${number}`;
  if (formattedStr.endsWith('.')) formattedStr = formattedStr.substring(0, formattedStr.length - 1);
  const floatVal = parseFloat(formattedStr);
  return Number.isNaN(floatVal) || floatVal.toString() !== formattedStr;
};

export const isNotInteger = (number :string) :boolean => {
  if (!number) return true;
  const intVal = parseInt(number, 10);
  return Number.isNaN(intVal) || intVal.toString() !== number;
};
