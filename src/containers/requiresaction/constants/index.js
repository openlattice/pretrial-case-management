/*
 * @flow
 */
import { PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';

const { DATE_TIME, STATUS } = PROPERTY_TYPES;

export const SORT_OPTIONS = [
  { label: 'Date', value: DATE_TIME },
  { label: 'Status', value: STATUS }
];
