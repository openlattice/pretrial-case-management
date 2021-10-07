import { PSA_STATUSES } from './Consts';

export const FILTER_TYPE = {
  VIEW_ALL: 'viewAll',
  SEARCH: 'search'
};

export const DATE_FORMAT = 'MM/DD/YYYY';

export const STATUS_OPTIONS = {
  OPEN: {
    value: PSA_STATUSES.OPEN,
    label: 'All Open'
  },
  SUCCESS: {
    value: PSA_STATUSES.SUCCESS,
    label: 'Successful'
  },
  FAILURE: {
    value: PSA_STATUSES.FAILURE,
    label: 'Failed'
  },
  CANCELLED: {
    value: PSA_STATUSES.CANCELLED,
    label: 'Cancelled'
  },
  DECLINED: {
    value: PSA_STATUSES.DECLINED,
    label: 'Declined'
  },
  DISMISSED: {
    value: PSA_STATUSES.DISMISSED,
    label: 'Dismissed'
  },
  ALL: {
    value: '*',
    label: 'All'
  }
};

export const STATUS_OPTIONS_FOR_PENDING_PSAS = {
  OPEN: {
    value: PSA_STATUSES.OPEN,
    label: 'Open'
  },
  ALL: {
    value: '*',
    label: 'All'
  }
};

export const openOptions = [
  {
    value: 'OPEN',
    label: 'All Open'
  },
  {
    value: 'REQUIRES_ACTION',
    label: 'Requires Action'
  }
];

export const closedOptions = [
  {
    value: 'SUCCESS',
    label: 'Successful'
  },
  {
    value: 'FAILURE',
    label: 'Failed'
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled'
  },
  {
    value: 'DECLINED',
    label: 'Declined'
  },
  {
    value: 'DISMISSED',
    label: 'Dismissed'
  }
];

export const STATUS_OPTION_CHECKBOXES = [
  {
    value: PSA_STATUSES.OPEN,
    label: 'Open'
  },
  {
    value: PSA_STATUSES.SUCCESS,
    label: 'Success'
  },
  {
    value: PSA_STATUSES.FAILURE,
    label: 'Failure'
  },
  {
    value: PSA_STATUSES.DECLINED,
    label: 'Declined'
  },
  {
    value: PSA_STATUSES.DISMISSED,
    label: 'Dismissed'
  },
  {
    value: PSA_STATUSES.CANCELLED,
    label: 'Cancelled'
  }
];
