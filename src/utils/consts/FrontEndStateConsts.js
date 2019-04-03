// Redux Reducer

export const STATE = {
  APP: 'app',
  AUTH: 'auth',
  CHARGES: 'charges',
  CHECK_INS: 'checkIns',
  COURT: 'court',
  DASHBOARD: 'dashboard',
  DOWNLOAD: 'download',
  EDM: 'edm',
  ENROLL: 'enroll',
  MANUAL_REMINDERS: 'manualReminders',
  PSA_MODAL: 'psaModal',
  PSA: 'psa',
  PEOPLE: 'people',
  RELEASE_CONDITIONS: 'releaseConditions',
  REMINDERS: 'reminders',
  REVIEW: 'review',
  ROUTER: 'router',
  SEARCH: 'search',
  SUBMIT: 'submit',
  SUBSCRIPTIONS: 'subscriptions'
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
  FQN_TO_ID: 'fqnsToEntitySetIds',
  ERRORS: 'errors',
  JURISDICTION: 'jurisdiction',
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

// Check-Ins
export const CHECK_IN = {
  FORM_NEIGHBORS: 'checkInFormNeighbors',
  LOADING_FORM: 'loadingCheckInsForm',
  LOADING_CHECK_INS: 'loadingCheckIns',
  CHECK_INS_BY_ID: 'checkInsById',
  LOADING_CHECK_IN_NEIGHBORS: 'loadingCheckInNieghbors',
  CHECK_IN_NEIGHBORS_BY_ID: 'checkInNeighborsById',
};

// Court

export const COURT = {
  COURT_DATE: 'courtDate',
  HEARINGS_TODAY: 'hearingsToday',
  HEARINGS_BY_TIME: 'hearingsByTime',
  HEARINGS_NEIGHBORS_BY_ID: 'hearingNeighborsById',
  PEOPLE_WITH_OPEN_PSAS: 'peopleWithOpenPsas',
  PEOPLE_WITH_MULTIPLE_OPEN_PSAS: 'peopleWithMultipleOpenPsas',
  PEOPLE_RECEIVING_REMINDERS: 'peopleReceivingReminders',
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
  PSA_EDIT_DATES: 'psaEditDatesById',
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

// Manual Reminders

export const MANUAL_REMINDERS = {
  REMINDER_IDS: 'manualReminderIds',
  REMINDERS_BY_ID: 'manualRemindersById',
  SUCCESSFUL_REMINDER_IDS: 'successfulManualReminderIds',
  PEOPLE_RECEIVING_REMINDERS: 'peopleReceivingManualReminders',
  FAILED_REMINDER_IDS: 'failedManualReminderIds',
  LOADING_MANUAL_REMINDERS: 'loadingManualReminders',
  LOADED: 'manualRemindersLoaded',
  MANUAL_REMINDER_NEIGHBORS: 'manualReminderNeighborsById',
  LOADING_REMINDER_NEIGHBORS: 'loadingManualReminderNeighbors',
  LOADING_FORM: 'loadingManualReminderForm',
  PEOPLE_NEIGHBORS: 'peopleNeighborsForManualReminder'
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
  PERSON_HEARINGS: 'personHearings'
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
  ALL_CONTACTS: 'allContacts',
  SUBSCRIPTION: 'subscription',
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
  MOST_RECENT_PSA: 'mostRecentPSA',
  MOST_RECENT_PSA_NEIGHBORS: 'mostRecentPSANeighbors',
  REQUIRES_ACTION_PEOPLE: 'requiresActionPeople',
  REQUIRES_ACTION_SCORES: 'requiresActionPSAScores',
  NO_PENDING_CHARGES_PSA_SCORES: 'psaScoresWithNoPendingCharges',
  RECENT_FTA_PSA_SCORES: 'psaScoresWithRecentFTAs',
  REQUIRES_ACTION_NEIGHBORS: 'requiresActionPeopleNeighbors',
  PSA_NEIGHBORS_BY_ID: 'psaNeighborsById',
  MULTIPLE_PSA_PEOPLE: 'peopleWithMultiplePSAs',
  RECENT_FTA_PEOPLE: 'peopleWithRecentFTAs',
  NO_PENDING_CHARGES_PEOPLE: 'peopleWithNoPendingCharges',
  REQUIRES_ACTION_LOADING: 'loadingRequiresActionPeople'
};

// Release Conditions

export const RELEASE_COND = {
  SELECTED_HEARING: 'selectedHearing',
  HAS_OUTCOME: 'hasOutcome',
  HEARING_NEIGHBORS: 'hearingNeighbors',
  PERSON_NEIGHBORS: 'personNeighbors',
  PSA_NEIGHBORS: 'psaNeighbors',
  LOADING_RELEASE_CONDITIONS: 'loadingReleaseCondtions',
  REFRESHING_RELEASE_CONDITIONS: 'refreshingReleaseConditions',
  REFRESHING_SELECTED_HEARING: 'refreshingSelectedHearing'
};

// Reminders

export const REMINDERS = {
  REMINDER_IDS: 'reminderIds',
  FUTURE_REMINDERS: 'futureReminders',
  PAST_REMINDERS: 'pastReminders',
  SUCCESSFUL_REMINDER_IDS: 'successfulReminderIds',
  FAILED_REMINDER_IDS: 'failedReminderIds',
  LOADING_REMINDERS: 'loadingReminders',
  LOADED: 'remindersLoaded',
  REMINDER_NEIGHBORS: 'reminderNeighborsById',
  REMINDERS_WITH_OPEN_PSA_IDS: 'remindersWithOpenPSA',
  LOADING_REMINDER_NEIGHBORS: 'loadingReminderNeighbors',
  PEOPLE_WITH_HEARINGS_BUT_NO_CONTACT: 'peopleWithHearingsButNoContacts',
  LOADING_PEOPLE_NO_CONTACTS: 'loadingPeopleWithNoContacts',
  OPT_OUTS: 'optOutMap',
  OPT_OUT_NEIGHBORS: 'optOutNeighbors',
  OPT_OUT_PEOPLE_IDS: 'optOutPeopleIds',
  OPT_OUTS_WITH_REASON: 'optOutsWithReasons',
  REMINDER_IDS_TO_OPT_OUT_IDS: 'reminderIdsToOptOutIds',
  LOADING_OPT_OUTS: 'loadingOptOuts',
  LOADING_OPT_OUT_NEIGHBORS: 'loadingOptOutNeighbors',
  LOADING_REMINDER_PDF: 'loadingReminderPDF'
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
  REPLACING_ENTITY: 'replacingEntity',
  REPLACE_ENTITY_SUCCESS: 'replaceEntitySuccess',
  UPDATING_ENTITY: 'updatingEntity',
  UPDATE_ENTITY_SUCCESS: 'updateEntitySuccess',
  REPLACING_ASSOCIATION: 'replacingAssociation',
  REPLACE_ASSOCIATION_SUCCESS: 'replaceAssociationSuccess',
  SUBMITTING: 'submitting',
  SUCCESS: 'submitSuccess',
  SUBMITTED: 'submitted',
  ERROR: 'error'
};

// Subscriptions

export const SUBSCRIPTIONS = {
  LOADING_SUBSCRIPTION_MODAL: 'loadingSubscriptionInfo',
  CONTACT_INFO: 'contactInfo',
  PERSON_NEIGHBORS: 'personNeighbors',
  SUBSCRIPTION: 'subscription'
};
