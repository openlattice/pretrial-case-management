/*
 * @flow
 */

export const PEOPLE_ACTIONS = {
  GET_PEOPLE_NEIGHBORS: 'getPeopleNeighbors',
  GET_PERSON_DATA: 'getPersonData',
  GET_STAFF_EKIDS: 'getStaffEKIDs',
  LOAD_REQUIRES_ACTION_PEOPLE: 'loadRequiresActionPeople'
};

export const PEOPLE_DATA = {
  MULTIPLE_PSA_PEOPLE: 'peopleWithMultiplePSAs',
  NO_HEARINGS_PEOPLE: 'peopleWithPSAsWithNoHearings',
  NO_HEARINGS_PSA_SCORES: 'psaScoresWithNoHearings',
  NO_PENDING_CHARGES_PEOPLE: 'peopleWithNoPendingCharges',
  NO_PENDING_CHARGES_PSA_SCORES: 'psaScoresWithNoPendingCharges',
  PEOPLE_BY_ID: 'peopleById',
  PEOPLE_NEIGHBORS_BY_ID: 'peopleNeighborsById',
  PERSON_DATA: 'selectedPersonData',
  VOICE_ENROLLMENT_PROGRESS: 'voiceEnrollmentProgress',
  REQUIRES_ACTION_PEOPLE: 'requiresActionPeople',
  REQUIRES_ACTION_SCORES: 'requiresActionPSAScores',
  RECENT_FTA_PEOPLE: 'peopleWithRecentFTAs',
  RECENT_FTA_PSA_SCORES: 'psaScoresWithRecentFTAs',
  STAFF_IDS_TO_EKIDS: 'staffIdsToEntityKeyIds'
};
