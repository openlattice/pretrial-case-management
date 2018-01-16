import * as SubmitActionTypes from './SubmitActionTypes';

export function submit(config :Object, values :Object) :Object {
  return {
    type: SubmitActionTypes.SUBMIT_REQUEST,
    config,
    values
  };
}

export function submitSuccess() :Object {
  return {
    type: SubmitActionTypes.SUBMIT_SUCCESS
  };
}

export function submitFailure() {
  return {
    type: SubmitActionTypes.SUBMIT_FAILURE
  };
}
