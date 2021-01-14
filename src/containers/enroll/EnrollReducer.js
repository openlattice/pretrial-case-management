/*
 * @flow
 */

import { fromJS, Map } from 'immutable';

import { ENROLL } from '../../utils/consts/FrontEndStateConsts';

import {
  enrollVoice,
  getProfile,
  CLEAR_ENROLL_ERROR,
  CLEAR_ENROLL_STATE
} from './EnrollActions';

const INITIAL_STATE_FIELDS = {
  [ENROLL.LOADING_PROFILE]: false,
  [ENROLL.ENTITY_KEY_ID]: '',
  [ENROLL.PIN]: '',
  [ENROLL.SUBMITTING_AUDIO]: false,
  [ENROLL.NUM_SUBMISSIONS]: 0,
  [ENROLL.ERROR]: ''
};

const INITIAL_STATE :Map = fromJS(INITIAL_STATE_FIELDS);

export default function enrollReducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getProfile.case(action.type): {
      return getProfile.reducer(state, action, {
        REQUEST: () => state
          .set(ENROLL.LOADING_PROFILE, true)
          .set(ENROLL.ERROR, '')
          .set(ENROLL.PIN, ''),
        SUCCESS: () => {
          const {
            numSubmissions,
            pin,
            profileEntityKeyId
          } = action.value;
          return state
            .set(ENROLL.ENTITY_KEY_ID, profileEntityKeyId)
            .set(ENROLL.PIN, pin)
            .set(ENROLL.NUM_SUBMISSIONS, numSubmissions)
            .set(ENROLL.ERROR, '');
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .set(ENROLL.PIN, '')
            .set(ENROLL.ERROR, error);
        },
        FINALLY: () => state
          .set(ENROLL.LOADING_PROFILE, false)
      });
    }

    case enrollVoice.case(action.type): {
      return enrollVoice.reducer(state, action, {
        REQUEST: () => state
          .set(ENROLL.SUBMITTING_AUDIO, true)
          .set(ENROLL.ERROR, ''),
        SUCCESS: () => {
          const { numSubmissions } = action.value;
          return state
            .set(ENROLL.NUM_SUBMISSIONS, numSubmissions)
            .set(ENROLL.ERROR, '');
        },
        FAILURE: () => {
          const { error } = action.value;
          return state.set(ENROLL.ERROR, error);
        },
        FINALLY: () => state.set(ENROLL.SUBMITTING_AUDIO, false)
      });
    }

    case CLEAR_ENROLL_ERROR:
      return state.set(ENROLL.ERROR, '');

    case CLEAR_ENROLL_STATE:
      return INITIAL_STATE;

    default:
      return state;
  }
}
