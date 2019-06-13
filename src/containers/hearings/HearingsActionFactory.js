/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_HEARING_SETTINGS :string = 'CLEAR_HEARING_SETTINGS';
const clearHearingSettings :RequestSequence = newRequestSequence(CLEAR_HEARING_SETTINGS);

const CLOSE_HEARING_SETTINGS_MODAL :string = 'CLOSE_HEARING_SETTINGS_MODAL';
const closeHearingSettingsModal :RequestSequence = newRequestSequence(CLOSE_HEARING_SETTINGS_MODAL);

const REFRESH_HEARING_AND_NEIGHBORS :string = 'REFRESH_HEARING_AND_NEIGHBORS';
const refreshHearingAndNeighbors :RequestSequence = newRequestSequence(REFRESH_HEARING_AND_NEIGHBORS);

const OPEN_HEARING_SETTINGS_MODAL :string = 'OPEN_HEARING_SETTINGS_MODAL';
const openHearingSettingsModal :RequestSequence = newRequestSequence(OPEN_HEARING_SETTINGS_MODAL);

const SET_HEARING_SETTINGS :string = 'SET_HEARING_SETTINGS';
const setHearingSettings :RequestSequence = newRequestSequence(SET_HEARING_SETTINGS);

export {
  CLEAR_HEARING_SETTINGS,
  CLOSE_HEARING_SETTINGS_MODAL,
  REFRESH_HEARING_AND_NEIGHBORS,
  OPEN_HEARING_SETTINGS_MODAL,
  SET_HEARING_SETTINGS,
  clearHearingSettings,
  closeHearingSettingsModal,
  refreshHearingAndNeighbors,
  openHearingSettingsModal,
  setHearingSettings
};
