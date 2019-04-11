/*
 * @flow
 */

import Immutable from 'immutable';

import { ENROLL } from '../../utils/consts/FrontEndStateConsts';

import * as ActionTypes from './EnrollActionTypes';

const INITIAL_STATE_FIELDS = {
  [ENROLL.LOADING_PROFILE]: false,
  [ENROLL.ENTITY_KEY_ID]: '',
  [ENROLL.PROFILE_ID]: '',
  [ENROLL.PIN]: '',
  [ENROLL.SUBMITTING_AUDIO]: false,
  [ENROLL.NUM_SUBMISSIONS]: 0,
  [ENROLL.ERROR]: ''
};

const INITIAL_STATE :Map<> = Immutable.fromJS(INITIAL_STATE_FIELDS);

function enrollReducer(state :Map<> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case ActionTypes.GET_PROFILE_REQUEST:
      return state
        .set(ENROLL.LOADING_PROFILE, true)
        .set(ENROLL.ERROR, '')
        .set(ENROLL.PROFILE_ID, '')
        .set(ENROLL.PIN, '');

    case ActionTypes.GET_PROFILE_SUCCESS:
      return state
        .set(ENROLL.PROFILE_ID, action.profileId)
        .set(ENROLL.ENTITY_KEY_ID, action.profileEntityKeyId)
        .set(ENROLL.PIN, action.pin)
        .set(ENROLL.LOADING_PROFILE, false)
        .set(ENROLL.NUM_SUBMISSIONS, action.numSubmissions)
        .set(ENROLL.ERROR, '');

    case ActionTypes.GET_PROFILE_FAILURE:
      return state
        .set(ENROLL.PROFILE_ID, '')
        .set(ENROLL.PIN, '')
        .set(ENROLL.ERROR, action.errorMessage)
        .set(ENROLL.LOADING_PROFILE, false);

    case ActionTypes.ENROLL_VOICE_REQUEST:
      return state
        .set(ENROLL.SUBMITTING_AUDIO, true)
        .set(ENROLL.ERROR, '');

    case ActionTypes.ENROLL_VOICE_SUCCESS:
      return state
        .set(ENROLL.NUM_SUBMISSIONS, action.numSubmissions)
        .set(ENROLL.SUBMITTING_AUDIO, false)
        .set(ENROLL.ERROR, '');

    case ActionTypes.ENROLL_VOICE_FAILURE:
      return state
        .set(ENROLL.ERROR, action.errorMessage)
        .set(ENROLL.SUBMITTING_AUDIO, false);

    case ActionTypes.CLEAR_ERROR:
      return state.set(ENROLL.ERROR, '');

    case ActionTypes.CLEAR_ENROLL_VOICE:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default enrollReducer;
