// Redux Reducer

export const STATE = {
  APP: 'app',
  AUTH: 'auth',
  COURT: 'court',
  CHARGES: 'charges',
  DASHBOARD: 'dashboard',
  DOWNLOAD: 'download',
  EDM: 'edm',
  ENROLL: 'enroll',
  PSA: 'psa',
  PEOPLE: 'people',
  REVIEW: 'review',
  SEARCH: 'search',
  SUBMIT: 'submit'
};

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

// App
export const APP = {
  ACTIONS: 'actions',
  APP: 'app',
  APP_TYPES: 'appTypes',
  ENTITY_SETS_BY_ORG: 'entitySetsByOrganization',
  ERRORS: 'errors',
  LOADING: 'isLoadingApp',
  LOAD_APP: 'loadApp',
  ORGS: 'organizations',
  PRIMARY_KEYS: 'primaryKeys',
  PROPERTY_TYPES: 'propertyTypes',
  SELECTED_ORG_ID: 'selectedOrganizationId',
  SELECTED_ORG_TITLE: 'selectedOrganizationTitle',
  APP_SETTINGS_ID: 'appSettingsEntitySetId',
  SELECTED_ORG_SETTINGS: 'selectedOrganizationSettings',
  SETTINGS_BY_ORG_ID: 'appSettingsByOrgId'
};

// CHARGES
export const CHARGES = {
  ARREST: 'arrestCharges',
  ARREST_PERMISSIONS: 'arrestChargePermissions',
  COURT: 'courtCharges',
  COURT_PERMISSIONS: 'courtChargePermissions',
  ARREST_VIOLENT: 'violentArrestCharges',
  COURT_VIOLENT: 'violentCourtCharges',
  DMF_STEP_2: 'dmfStep2Charges',
  DMF_STEP_4: 'dmfStep4Charges',
  BRE: 'bookingReleaseExceptionCharges',
  BHE: 'bookingHoldExceptionCharges',
  LOADING: 'loadingCharges'
};

// Court

export const COURT = {
  HEARINGS_TODAY: 'hearingsToday',
  HEARINGS_BY_TIME: 'hearingsByTime',
  HEARINGS_NEIGHBORS_BY_ID: 'hearingNeighborsById',
  PEOPLE_WITH_OPEN_PSAS: 'peopleWithOpenPsas',
  LOADING_HEARINGS: 'isLoadingHearings',
  LOADING_HEARING_NEIGHBORS: 'isLoadingHearingsNeighbors',
  HEARING_IDS_REFRESHING: 'hearingIdsRefreshing',
  LOADING_PSAS: 'isLoadingPSAs',
  LOADING_ERROR: 'loadingError',
  LOADING_HEARINGS_ERROR: 'loadingHearingError',
  COUNTY: 'county',
  COURTROOM: 'courtroom',
  COURTROOMS: 'courtrooms',
  COURTROOM_OPTIONS: 'courtroomOptions',
  LOADING_COURTROOM_OPTIONS: 'loadingCoutrooms',
  OPEN_PSAS: 'openPSAs',
  SCORES_AS_MAP: 'scoresAsMap',
  OPEN_PSA_IDS: 'openPSAIds',
  PEOPLE_IDS_TO_OPEN_PSA_IDS: 'peopleIdsToOpenPSAIds',

  // JUDGES
  ALL_JUDGES: 'allJudges',
  PENNINGTON_JUDGES: 'penningtonJudges',
  MINNEHAHA_JUDGES: 'minnehahaJudges',
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
  PROFILE_ID: 'profileId',
  PIN: 'pin',
  SUBMITTING_AUDIO: 'submittingAudio',
  NUM_SUBMISSIONS: 'numSubmissions',
  ERROR: 'errorMessage'
};

// PSA

export const PSA_FORM = {
  ARREST_OPTIONS: 'arrestOptions',
  ALL_CASES: 'allCasesForPerson',
  ALL_CHARGES: 'allChargesForPerson',
  ALL_SENTENCES: 'allSentencesForPerson',
  ALL_ARREST_CHARGES: 'allArrestCharges',
  ALL_FTAS: 'allFTAs',
  ALL_PSAS: 'allPSAs',
  ALL_MANUAL_CASES: 'allManualCases',
  ALL_MANUAL_CHARGES: 'allManualCharges',
  ALL_HEARINGS: 'allHearings',
  CHARGES: 'charges',
  SELECT_PERSON: 'selectedPerson',
  OPEN_PSAS: 'openPSAs',
  ARREST_ID: 'arrestId',
  SELECT_PRETRIAL_CASE: 'selectedPretrialCase',
  PSA: 'psa',
  DATA_MODEL: 'dataModel',
  ENTITY_SET_LOOKUP: 'entitySetLookup',
  SUBMITTED: 'isSubmitted',
  SUBMITTING: 'isSubmitting',
  LOADING_NEIGHBORS: 'isLoadingNeighbors',
  SUBMIT_ERROR: 'submitError'
};

// People

export const PEOPLE = {
  SCORES_ENTITY_SET_ID: 'scoresEntitySetId',
  RESULTS: 'peopleResults',
  PERSON_DATA: 'selectedPersonData',
  PERSON_ENTITY_KEY_ID: 'selectedPersonEntityKeyId',
  FETCHING_PEOPLE: 'isFetchingPeople',
  FETCHING_PERSON_DATA: 'isFetchingPersonData',
  NEIGHBORS: 'neighbors',
  REFRESHING_PERSON_NEIGHBORS: 'refreshingPersonNeighbors',
  MOST_RECENT_PSA: 'mostRecentPSA'
};

// Review

export const REVIEW = {
  ENTITY_SET_ID: 'scoresEntitySetId',
  SCORES: 'scoresAsMap',
  NEIGHBORS_BY_ID: 'psaNeighborsById',
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
  SEARCH_ERROR: 'searchError',
  SELECTED_PERSON_ID: 'selectedPersonId',
  PERSON_DETAILS: 'personDetails',
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
  SUBMITTING: 'submitting',
  SUCCESS: 'submitSuccess',
  SUBMITTED: 'submitted',
  ERROR: 'error'
};
