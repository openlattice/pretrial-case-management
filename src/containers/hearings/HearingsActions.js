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

const SET_COURTROOM_FILTER :'SET_COURTROOM_FILTER' = 'SET_COURTROOM_FILTER';
const setCourtroomFilter = value => ({
  type: SET_COURTROOM_FILTER,
  value
});

const SET_COUNTY_FILTER :'SET_COUNTY_FILTER' = 'SET_COUNTY_FILTER';
const setCountyFilter = value => ({
  type: SET_COUNTY_FILTER,
  value
});

const SET_MANAGE_HEARINGS_DATE :'SET_MANAGE_HEARINGS_DATE' = 'SET_MANAGE_HEARINGS_DATE';
const setManageHearingsDate = value => ({
  type: SET_MANAGE_HEARINGS_DATE,
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
  clearHearingSettings,
  CLEAR_SUBMITTED_HEARING,
  clearSubmittedHearing,
  CLOSE_HEARING_SETTINGS_MODAL,
  closeHearingSettingsModal,
  LOAD_HEARINGS_FOR_DATE,
  loadHearingsForDate,
  LOAD_HEARING_NEIGHBORS,
  loadHearingNeighbors,
  LOAD_JUDGES,
  loadJudges,
  REFRESH_HEARING_AND_NEIGHBORS,
  refreshHearingAndNeighbors,
  OPEN_HEARING_SETTINGS_MODAL,
  openHearingSettingsModal,
  SET_COURT_DATE,
  setCourtDate,
  SET_COUNTY_FILTER,
  setCountyFilter,
  SET_COURTROOM_FILTER,
  setCourtroomFilter,
  SET_HEARING_SETTINGS,
  setHearingSettings,
  SET_MANAGE_HEARINGS_DATE,
  setManageHearingsDate,
  SUBMIT_EXISTING_HEARING,
  submitExistingHearing,
  SUBMIT_HEARING,
  submitHearing,
  UPDATE_HEARING,
  updateHearing
};
