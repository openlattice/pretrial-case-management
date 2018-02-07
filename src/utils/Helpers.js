import moment from 'moment';
import { FORM_LENGTHS } from './consts/Consts';

const getSplitStr = (location) => {
  const splitStr = location ? location.hash.split('/') : [];
  if (splitStr[0] && splitStr[0] === '#') splitStr[0] = '';
  return splitStr;
};

const getPage = (splitStr) => {
  const page = splitStr[splitStr.length - 1];
  return parseInt(page, 10);
};

export const getCurrentPage = (location) => {
  return getPage(getSplitStr(location));
};

export const getNextPath = (location, numPages) => {
  const splitStr = getSplitStr(location);
  const page = getPage(splitStr);
  const nextPage = page + 1;
  splitStr[splitStr.length - 1] = nextPage;
  return nextPage <= numPages ? splitStr.join('/') : null;
};

export const getPrevPath = (location) => {
  const splitStr = getSplitStr(location);
  const page = getPage(splitStr);
  const prevPage = page - 1;
  splitStr[splitStr.length - 1] = prevPage;
  return prevPage >= 1 ? splitStr.join('/') : null;
};

export const getIsLastPage = (location, optionalNumPages) => {
  const splitStr = getSplitStr(location);
  const formName = splitStr[splitStr.length - 2];
  const numPages = optionalNumPages || FORM_LENGTHS[formName];
  return getPage(splitStr) === numPages;
};

export const getProgress = (location, numPages) => {
  const splitStr = getSplitStr(location);
  const page = getPage(splitStr);
  const num = Math.ceil(((page - 1) / (numPages - 1)) * 100);
  const percentage = `${num.toString()}%`;
  return num === 0 ? { num: 5, percentage } : { num, percentage };
};


export const formatDOB = (dob) => {
  return moment(dob).format('MM/DD/YYYY');
};

export const isNotNumber = (number) => {
  if (!number) return true;
  let formattedStr = number;
  if (formattedStr.endsWith('.')) formattedStr = formattedStr.substring(0, formattedStr.length - 1);
  const floatVal = parseFloat(formattedStr);
  return Number.isNaN(floatVal) || floatVal.toString() !== formattedStr;
};

export const isNotInteger = (number) => {
  if (!number) return true;
  const intVal = parseInt(number);
  return Number.isNaN(intVal) || intVal.toString() !== number;
}
