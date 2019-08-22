/*
 * @flow
 */
import { RequestStates } from 'redux-reqseq';

import { REDUX } from './SharedConsts';


// Error Helpers

export const actionValueIsInvalid = value => value === null || value === undefined;

// state helpers

export const getReqState = (slice, actionType) => slice.getIn([REDUX.ACTIONS, actionType, REDUX.REQUEST_STATE]);


// Rquest State Validation
export const requestIsFailure = request => request === RequestStates.FAILURE;
export const requestIsPending = request => request === RequestStates.PENDING;
export const requestIsSuccess = request => request === RequestStates.SUCCESS;
