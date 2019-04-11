/*
 * @flow
 */

import * as ActionTypes from './EnrollActionTypes';

export function getProfileRequest(personId :string, personEntityKeyId :string) {
  return {
    type: ActionTypes.GET_PROFILE_REQUEST,
    personId,
    personEntityKeyId
  };
}

export function getProfileSuccess(profileId :string, pin :string, numSubmissions :number, profileEntityKeyId :string) {
  return {
    type: ActionTypes.GET_PROFILE_SUCCESS,
    profileId,
    pin,
    numSubmissions,
    profileEntityKeyId
  };
}

export function getProfileFailure(errorMessage :string) {
  return {
    type: ActionTypes.GET_PROFILE_FAILURE,
    errorMessage
  };
}

export function enrollVoiceRequest(profileId :string, profileEntityKeyId :string, audio :Object) {
  return {
    type: ActionTypes.ENROLL_VOICE_REQUEST,
    profileId,
    profileEntityKeyId,
    audio
  };
}

export function enrollVoiceSuccess(numSubmissions :number) {
  return {
    type: ActionTypes.ENROLL_VOICE_SUCCESS,
    numSubmissions
  };
}

export function enrollVoiceFailure(errorMessage :string) {
  return {
    type: ActionTypes.ENROLL_VOICE_FAILURE,
    errorMessage
  };
}

export function clearError() {
  return {
    type: ActionTypes.CLEAR_ERROR
  };
}

export function clearEnrollVoice() {
  return {
    type: ActionTypes.CLEAR_ENROLL_VOICE
  };
}
