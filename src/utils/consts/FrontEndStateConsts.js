// Redux Reducer

export const STATE = {
  AUTH: 'auth',
  COURT: 'court',
  DASHBOARD: 'dashboard',
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

// People

export const PEOPLE = {
  RESULTS: 'peopleResults',
  PERSON_DATA: 'selectedPersonData',
  PERSON_ENTITY_KEY_ID: 'selectedPersonEntityKeyId',
  FETCHING_PEOPLE: 'isFetchingPeople',
  FETCHING_PERSON_DATA: 'isFetchingPersonData',
  NEIGHBORS: 'peopleNeighbors'
};

// ReviewPSA

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

// Form

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
  CREATE_PERSON_ERROR: 'createPersonError'
};
