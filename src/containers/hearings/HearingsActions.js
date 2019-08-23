/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_HEARING_SETTINGS :'CLEAR_HEARING_SETTINGS' = 'CLEAR_HEARING_SETTINGS';
const clearHearingSettings = () => ({
  type: CLEAR_HEARING_SETTINGS
});

const CLEAR_SUBMITTED_HEARING :'CLEAR_SUBMITTED_HEARING' = 'CLEAR_SUBMITTED_HEARING';
const clearSubmittedHearing = () => ({
  type: CLEAR_SUBMITTED_HEARING
});

const CLOSE_HEARING_SETTINGS_MODAL :'CLOSE_HEARING_SETTINGS_MODAL' = 'CLOSE_HEARING_SETTINGS_MODAL';
const closeHearingSettingsModal = () => ({
  type: CLOSE_HEARING_SETTINGS_MODAL
});

const OPEN_HEARING_SETTINGS_MODAL :'OPEN_HEARING_SETTINGS_MODAL' = 'OPEN_HEARING_SETTINGS_MODAL';
const openHearingSettingsModal = () => ({
  type: OPEN_HEARING_SETTINGS_MODAL
});

const SET_COURT_DATE :'SET_COURT_DATE' = 'SET_COURT_DATE';
const setCourtDate = value => ({
  type: SET_COURT_DATE,
  value
});

const SET_HEARING_SETTINGS :'SET_HEARING_SETTINGS' = 'SET_HEARING_SETTINGS';
const setHearingSettings = value => ({
  type: SET_HEARING_SETTINGS,
  value
});

const LOAD_HEARINGS_FOR_DATE :string = 'LOAD_HEARINGS_FOR_DATE';
const loadHearingsForDate :RequestSequence = newRequestSequence(LOAD_HEARINGS_FOR_DATE);

const LOAD_HEARING_NEIGHBORS :string = 'LOAD_HEARING_NEIGHBORS';
const loadHearingNeighbors :RequestSequence = newRequestSequence(LOAD_HEARING_NEIGHBORS);

const LOAD_JUDGES :string = 'LOAD_JUDGES';
const loadJudges :RequestSequence = newRequestSequence(LOAD_JUDGES);

const REFRESH_HEARING_AND_NEIGHBORS :string = 'REFRESH_HEARING_AND_NEIGHBORS';
const refreshHearingAndNeighbors :RequestSequence = newRequestSequence(REFRESH_HEARING_AND_NEIGHBORS);

const SUBMIT_EXISTING_HEARING :string = 'SUBMIT_EXISTING_HEARING';
const submitExistingHearing :RequestSequence = newRequestSequence(SUBMIT_EXISTING_HEARING);

const SUBMIT_HEARING :string = 'SUBMIT_HEARING';
const submitHearing :RequestSequence = newRequestSequence(SUBMIT_HEARING);

const UPDATE_HEARING :string = 'UPDATE_HEARING';
const updateHearing :RequestSequence = newRequestSequence(UPDATE_HEARING);

export {
  CLEAR_HEARING_SETTINGS,
  CLEAR_SUBMITTED_HEARING,
  CLOSE_HEARING_SETTINGS_MODAL,
  LOAD_HEARINGS_FOR_DATE,
  LOAD_HEARING_NEIGHBORS,
  LOAD_JUDGES,
  REFRESH_HEARING_AND_NEIGHBORS,
  OPEN_HEARING_SETTINGS_MODAL,
  SET_COURT_DATE,
  SET_HEARING_SETTINGS,
  SUBMIT_EXISTING_HEARING,
  SUBMIT_HEARING,
  UPDATE_HEARING,
  clearHearingSettings,
  clearSubmittedHearing,
  closeHearingSettingsModal,
  loadHearingsForDate,
  loadHearingNeighbors,
  loadJudges,
  refreshHearingAndNeighbors,
  openHearingSettingsModal,
  setCourtDate,
  setHearingSettings,
  submitExistingHearing,
  submitHearing,
  updateHearing
};
