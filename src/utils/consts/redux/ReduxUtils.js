/*
 * @flow
 */
import isNumber from 'lodash/isNumber';
import { RequestStates } from 'redux-reqseq';

import { REDUX } from './SharedConsts';


// Error Helpers

export const actionValueIsInvalid = value => value === null || value === undefined;

export const getErrorStatus = (action) => {
  const error = {};
  const { value: axiosError } = action;
  if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
    error.status = axiosError.response.status;
  }
  return error;
};

// state helpers

export const getReqState = (slice, actionType) => slice.getIn([REDUX.ACTIONS, actionType, REDUX.REQUEST_STATE]);


// Rquest State Validation
export const requestIsFailure = request => request === RequestStates.FAILURE;
export const requestIsPending = request => request === RequestStates.PENDING;
export const requestIsSuccess = request => request === RequestStates.SUCCESS;
