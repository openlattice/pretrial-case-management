/*
 * @flow
 */
import { RequestStates } from 'redux-reqseq';

import { REDUX } from './SharedConsts';

// state helpers

export const getReqState = (slice, actionType) => slice.getIn([REDUX.ACTIONS, actionType, REDUX.REQUEST_STATE]);

export const getError = (slice, actionType) => slice.getIn([REDUX.ERRORS, actionType]);


// Rquest State Validation
export const requestIsFailure = request => request === RequestStates.FAILURE;
export const requestIsPending = request => request === RequestStates.PENDING;
export const requestIsStandby = request => request === RequestStates.STANDBY;
export const requestIsSuccess = request => request === RequestStates.SUCCESS;
