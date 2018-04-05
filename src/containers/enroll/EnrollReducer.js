/*
 * @flow
 */

import Immutable from 'immutable';

import * as ActionTypes from './EnrollActionTypes';

const INITIAL_STATE_FIELDS = {
  loadingProfile: false,
  profileId: '',
  pin: '',
  submittingAudio: false,
  numSubmissions: 0,
  errorMessage: ''
};

const INITIAL_STATE :Map<> = Immutable.fromJS(INITIAL_STATE_FIELDS);

function enrollReducer(state :Map<> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case ActionTypes.GET_PROFILE_REQUEST:
      return state
        .set('loadingProfile', true)
        .set('errorMessage', '')
        .set('profileId', '')
        .set('pin', '');

    case ActionTypes.GET_PROFILE_SUCCESS:
      return state
        .set('profileId', action.profileId)
        .set('pin', action.pin)
        .set('loadingProfile', false)
        .set('numSubmissions', action.numSubmissions)
        .set('errorMessage', '');

    case ActionTypes.GET_PROFILE_FAILURE:
      return state
        .set('profileId', '')
        .set('pin', '')
        .set('errorMessage', action.errorMessage)
        .set('loadingProfile', false);

    case ActionTypes.ENROLL_VOICE_REQUEST:
      return state
        .set('submittingAudio', true)
        .set('errorMessage', '');

    case ActionTypes.ENROLL_VOICE_SUCCESS:
      return state
        .set('numSubmissions', action.numSubmissions)
        .set('submittingAudio', false)
        .set('errorMessage', '');

    case ActionTypes.ENROLL_VOICE_FAILURE:
      return state
        .set('errorMessage', action.errorMessage)
        .set('submittingAudio', false);

    case ActionTypes.CLEAR_ERROR:
      return state.set('errorMessage', '');

    default:
      return state;
  }
}

export default enrollReducer;
