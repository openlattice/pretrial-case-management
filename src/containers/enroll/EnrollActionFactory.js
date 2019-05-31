/*
 * @flow
 */
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PROFILE :string = 'GET_PROFILE';
const getProfile :RequestSequence = newRequestSequence(GET_PROFILE);

const ENROLL_VOICE :string = 'ENROLL_VOICE';
const enrollVoice :RequestSequence = newRequestSequence(ENROLL_VOICE);

const CLEAR_ENROLL_ERROR :string = 'CLEAR_ENROLL_ERROR';
const clearEnrollError :RequestSequence = newRequestSequence(CLEAR_ENROLL_ERROR);

const CLEAR_ENROLL_STATE :string = 'CLEAR_ENROLL_STATE';
const clearEnrollState :RequestSequence = newRequestSequence(CLEAR_ENROLL_STATE);

export {
  GET_PROFILE,
  ENROLL_VOICE,
  CLEAR_ENROLL_ERROR,
  CLEAR_ENROLL_STATE,
  getProfile,
  enrollVoice,
  clearEnrollError,
  clearEnrollState
};
