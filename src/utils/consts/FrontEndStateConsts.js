// General PSA
export const PSA_NEIGHBOR = {
  ID: 'neighborId',
  DETAILS: 'neighborDetails',
  ENTITY_SET: 'neighborEntitySet'
};
export const PSA_ASSOCIATION = {
  DETAILS: 'associationDetails',
  ENTITY_SET: 'associationEntitySet'
};

// Court
export const COURT = {
  COURT_DATE: 'courtDate',
  PEOPLE_WITH_OPEN_PSAS: 'peopleWithOpenPsas',
  PEOPLE_WITH_MULTIPLE_OPEN_PSAS: 'peopleWithMultipleOpenPsas',
  PEOPLE_RECEIVING_REMINDERS: 'peopleReceivingReminders',
  LOADING_PSAS: 'isLoadingPSAs',
  COUNTY: 'county',
  COURTROOM: 'courtroom',
  OPEN_PSAS: 'openPSAs',
  SCORES_AS_MAP: 'scoresAsMap',
  PSA_EDIT_DATES: 'psaEditDatesById',
  OPEN_PSA_IDS: 'openPSAIds',
  PEOPLE_IDS_TO_OPEN_PSA_IDS: 'peopleIdsToOpenPSAIds',

  // JUDGES
  ALL_JUDGES: 'allJudges',
  LOADING_JUDGES: 'isLoadingJudges',
  LOADING_JUDGES_ERROR: 'loadingJudgesError'
};

// Dashboard
export const DASHBOARD = {
  DATA: 'dashboardData',
  LOADING: 'isLoading',
  ERROR: 'error'
};

// Download
export const DOWNLOAD = {
  NO_RESULTS: 'noHearingResults',
  DOWNLOADING_REPORTS: 'downloadingReports',
  COURTROOM_OPTIONS: 'courtroomOptions',
  COURTROOM_TIMES: 'courtroomTimes',
  ALL_HEARING_DATA: 'allHearingData',
  ERROR: 'downloadError',
  HEARING_IDS: 'hearingIds'
};

// EDM
export const EDM = {
  FQN_TO_ID: 'fqnToIdMap',
  IS_FETCHING_PROPERTY_TYPES: 'isFetchingAllPropertyTypes',
  PROPERTY_TYPES_BY_ID: 'propertyTypesById'
};

// Enroll
export const ENROLL = {
  LOADING_PROFILE: 'loadingProfile',
  ENTITY_KEY_ID: 'profileEntityKeyId',
  PIN: 'pin',
  SUBMITTING_AUDIO: 'submittingAudio',
  NUM_SUBMISSIONS: 'numSubmissions',
  ERROR: 'errorMessage'
};

// PSA Modal
export const PSA_MODAL = {
  LOADING_PSA_MODAL: 'loadingPSAModal',

  // PSA
  PSA_ID: 'psaId',
  SCORES: 'scores',
  PSA_NEIGHBORS: 'psaNeighbors',
  PSA_PERMISSIONS: 'psaPermissions',

  // HEARINGS
  HEARINGS: 'hearings',
  HEARING_IDS: 'hearingIds',
  LOADING_HEARING_NEIGHBORS: 'loadingHearingNeighbors',
  HEARINGS_NEIGHBORS_BY_ID: 'hearingNeighborsById',

  // Person
  PERSON_ID: 'personId',
  PERSON_NEIGHBORS: 'personNeighbors',
  LOADING_CASES: 'loadingCaseHistory',
  CASE_HISTORY: 'caseHistory',
  MANUAL_CASE_HISTORY: 'manualCaseHistory',
  CHARGE_HISTORY: 'chargeHistory',
  MANUAL_CHARGE_HISTORY: 'manualChargeHistory',
  SENTENCE_HISTORY: 'sentenceHistory',
  FTA_HISTORY: 'ftaHistory',
  PERSON_HEARINGS: 'personHearings',
  ERROR: 'errorMessage'
};

// Review
export const REVIEW = {
  SCORES: 'scoresAsMap',
  PSA_NEIGHBORS_BY_ID: 'psaNeighborsById',
  NEIGHBORS_BY_DATE: 'psaNeighborsByDate',
  LOADING_DATA: 'loadingPSAData',
  LOADING_RESULTS: 'loadingResults',
  ERROR: 'errorMessage',
  ALL_FILERS: 'allFilers',
  CASE_HISTORY: 'caseHistory',
  MANUAL_CASE_HISTORY: 'manualCaseHistory',
  CHARGE_HISTORY: 'chargeHistory',
  MANUAL_CHARGE_HISTORY: 'manualChargeHistory',
  SENTENCE_HISTORY: 'sentenceHistory',
  FTA_HISTORY: 'ftaHistory',
  HEARINGS: 'hearings',
  READ_ONLY: 'readOnly',
  PSA_IDS_REFRESHING: 'psaIdsRefreshing'
};

// Search
export const SEARCH = {
  LOADING: 'isLoadingPeople',
  SEARCH_RESULTS: 'searchResults',
  CONTACTS: 'contactResults',
  RESULTS_TO_CONTACTS: 'peopleIdsToContactIds',
  SEARCH_ERROR: 'searchError',
  SELECTED_PERSON_ID: 'selectedPersonId',
  PERSON_DETAILS: 'personDetails',
  LOADING_PERSON_DETAILS: 'loadingPersonDetails',
  PERSON_DETAILS_LOADED: 'personDetailsLoaded',
  LOADING_CASES: 'loadingCases',
  NUM_CASES_TO_LOAD: 'numCasesToLoad',
  NUM_CASES_LOADED: 'numCasesLoaded',
  SEARCH_HAS_RUN: 'searchHasRun',
  CREATING_PERSON: 'isCreatingPerson',
  CREATE_PERSON_ERROR: 'createPersonError',
  CASE_LOADS_COMPLETE: 'caseLoadsComplete'
};

// Submit
export const SUBMIT = {
  CREATING_ASSOCIATIONS: 'creatingAssociations',
  CREATE_ASSOCIATIONS_COMPLETE: 'createAssociationComplete',
  REPLACING_ENTITY: 'replacingEntity',
  REPLACE_ENTITY_SUCCESS: 'replaceEntitySuccess',
  UPDATING_ENTITY: 'updatingEntity',
  UPDATE_ENTITY_SUCCESS: 'updateEntitySuccess',
  REPLACING_ASSOCIATION: 'replacingAssociation',
  REPLACE_ASSOCIATION_SUCCESS: 'replaceAssociationSuccess',
  SUBMITTING: 'submitting',
  SUCCESS: 'submitSuccess',
  SUBMITTED: 'submitted',
  ERROR: 'errorMessage'
};
