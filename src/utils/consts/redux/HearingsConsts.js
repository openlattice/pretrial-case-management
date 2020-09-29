/*
 * @flow
 */

export const HEARINGS_ACTIONS = {
  LOAD_HEARINGS_FOR_DATE: 'loadHearingsForDate',
  LOAD_HEARING_NEIGHBORS: 'loadHearingNeighbors',
  REFRESH_HEARING_AND_NEIGHBORS: 'refreshHearingAndNeighbors',
  SUBMIT_EXISTING_HEARING: 'submitExistingHearing',
  SUBMIT_HEARING: 'submitHearing',
  UPDATE_HEARING: 'updateHearing'
};

export const HEARINGS_DATA = {
  COURT_DATE: 'courtDate',
  MANAGE_HEARINGS_DATE: 'manageHearingsDate',
  COUNTY_FILTER: 'countyFilter',
  COURTROOM: 'hearingCourtroom',
  COURTROOM_FILTER: 'courtroomFilter',
  COURTROOM_OPTIONS: 'courtroomOptions',
  COURTROOMS_BY_COUNTY: 'courtroomsByCounty',
  COURTROOMS_BY_DATE: 'courtroomsByDate',
  DATE_TIME: 'hearingDateTime',
  HEARINGS_BY_DATE_AND_TIME: 'hearingsByDate',
  HEARINGS_BY_ID: 'hearingsById',
  HEARINGS_BY_COUNTY: 'hearingsByCounty',
  HEARINGS_BY_COURTROOM: 'hearingsByCourtroom',
  HEARING_NEIGHBORS_BY_ID: 'hearingNeighborsById',
  JUDGE: 'hearingJudgeEKID',
  SETTINGS_MODAL_OPEN: 'hearingSettingsModalOpen',
  SUBMITTED_HEARING: 'submittedHearing',
  SUBMITTED_HEARING_NEIGHBORS: 'submittedHearingNeighbors',
  TIME: 'hearingTime',
  UPDATED_HEARING: 'updatedHearing',
  UPDATED_HEARING_NEIGHBORS: 'updatedHearingNeighbors',
};
