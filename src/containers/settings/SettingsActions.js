/*
 * @flow
 */
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DELETE_RCM_CONDITION:'DELETE_RCM_CONDITION' = 'DELETE_RCM_CONDITION';
const deleteRCMCondition = value => ({
  type: DELETE_RCM_CONDITION,
  value
});

const INITIALIZE_SETTINGS:'INITIALIZE_SETTINGS' = 'INITIALIZE_SETTINGS';
const initializeSettings = value => ({
  type: INITIALIZE_SETTINGS,
  value
});

const UPDATE_SETTING:'UPDATE_SETTING' = 'UPDATE_SETTING';
const updateSetting = value => ({
  type: UPDATE_SETTING,
  value
});

const SUBMIT_SETTINGS :string = 'SUBMIT_SETTINGS';
const submitSettings :RequestSequence = newRequestSequence(SUBMIT_SETTINGS);

export {
  deleteRCMCondition,
  DELETE_RCM_CONDITION,
  initializeSettings,
  INITIALIZE_SETTINGS,
  updateSetting,
  UPDATE_SETTING,
  submitSettings,
  SUBMIT_SETTINGS,
};
