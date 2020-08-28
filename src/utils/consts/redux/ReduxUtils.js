/*
 * @flow
 */
import { RequestStates } from 'redux-reqseq';
import { Map } from 'immutable';

import { REDUX } from './SharedConsts';

// state helpers

export const getReqState = (slice :Map, actionType :string) => (
  slice.getIn([REDUX.ACTIONS, actionType, REDUX.REQUEST_STATE])
);

export const getError = (slice :Map, actionType :string) => (
  slice.getIn([REDUX.ERRORS, actionType])
);

// Rquest State Validation
export const requestIsFailure = (request :Object) => request === RequestStates.FAILURE;
export const requestIsPending = (request :Object) => request === RequestStates.PENDING;
export const requestIsStandby = (request :Object) => request === RequestStates.STANDBY;
export const requestIsSuccess = (request :Object) => request === RequestStates.SUCCESS;
