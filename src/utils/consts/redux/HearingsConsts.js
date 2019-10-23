/*
 * @flow
 */

export const HEARINGS_ACTIONS = {
  LOAD_HEARINGS_FOR_DATE: 'loadHearingsForDate',
  LOAD_HEARING_NEIGHBORS: 'loadHearingNeighbors',
  LOAD_JUDGES: 'loadJudges',
  REFRESH_HEARING_AND_NEIGHBORS: 'refreshHearingAndNeighbors',
  SUBMIT_EXISTING_HEARING: 'submitExistingHearing',
  SUBMIT_HEARING: 'submitHearing',
  UPDATE_HEARING: 'updateHearing'
};

export const HEARINGS_DATA = {
  ALL_JUDGES: 'allJudges',
  COURT_DATE: 'courtDate',
  MANAGE_HEARINGS_DATE: 'manageHearingsDate',
  COURTROOM: 'hearingCourtroom',
  COURTROOMS_BY_DATE: 'courtroomsByDate',
  DATE: 'hearingDate',
  HEARINGS_BY_DATE_AND_TIME: 'hearingsByDate',
  HEARINGS_BY_ID: 'hearingsById',
  HEARINGS_BY_COUNTY: 'hearingsByCounty',
  HEARINGS_BY_COURTROOM: 'hearingsByCourtroom',
  HEARING_NEIGHBORS_BY_ID: 'hearingNeighborsById',
  JUDGE: 'hearingJudge',
  JUDGES_BY_ID: 'judgesById',
  JUDGES_BY_COUNTY: 'judgesByCounty',
  SETTINGS_MODAL_OPEN: 'hearingSettingsModalOpen',
  SUBMITTED_HEARING: 'submittedHearing',
  SUBMITTED_HEARING_NEIGHBORS: 'submittedHearingNeighbors',
  TIME: 'hearingTime',
  UPDATED_HEARING: 'updatedHearing',
  UPDATED_HEARING_NEIGHBORS: 'updatedHearingNeighbors',
};
