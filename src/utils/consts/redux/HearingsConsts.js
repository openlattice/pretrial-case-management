/*
 * @flow
 */

export const HEARINGS_ACTIONS = {
  LOAD_HEARING_NEIGHBORS: 'updateContactsBulk',
  REFRESH_HEARING_AND_NEIGHBORS: 'refreshHearingAndNeighbors',
  SUBMIT_EXISTING_HEARING: 'submitExistingHearing',
  SUBMIT_HEARING: 'submitHearing',
  UPDATE_HEARING: 'updateHearing'
};

export const HEARINGS_DATA = {
  COURTROOM: 'hearingCourtroom',
  DATE: 'hearingDate',
  HEARINGS_BY_ID: 'hearingsById',
  HEARING_NEIGHBORS_BY_ID: 'hearingNeighborsById',
  JUDGE: 'hearingJudge',
  SETTINGS_MODAL_OPEN: 'hearingSettingsModalOpen',
  SUBMITTED_HEARING: 'submittedHearing',
  SUBMITTED_HEARING_NEIGHBORS: 'submittedHearingNeighbors',
  TIME: 'hearingTime',
  UPDATED_HEARING: 'updatedHearing',
  UPDATED_HEARING_NEIGHBORS: 'updatedHearingNeighbors',
};
