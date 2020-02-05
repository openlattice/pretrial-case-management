/*
 * @flow
 */

export const ROOT :string = '/';
export const DASHBOARD :string = '/dashboard';
export const LOGIN :string = '/login';
export const NEW_PERSON :string = `${DASHBOARD}/new-person`;
export const PERSON_DETAILS_ROOT :string = `${DASHBOARD}/person-details`;
export const PERSON_DETAILS :string = `${PERSON_DETAILS_ROOT}/:personEKID`;

/* Reports */
export const FORMS :string = '/forms';

export const TERMS :string = '/terms';

const CREATE_CONTEXT :string = '/:context';
export const PSA :string = '/psa';
export const PSA_FORM_BASE :string = FORMS + PSA;
export const PSA_FORM :string = FORMS + PSA + CREATE_CONTEXT;

/* Create Report */
const CREATE :string = '/create';
export const CREATE_FORMS = DASHBOARD + CREATE;

/* Review Report */
const REVIEW :string = '/review';
export const REVIEW_FORMS = DASHBOARD + REVIEW;
export const REVIEW_REPORTS = `${REVIEW_FORMS}/reports`;
export const SEARCH_FORMS = `${REVIEW_FORMS}/search`;

/* Judge View */
const JUDGE :string = '/judges';
export const JUDGE_VIEW = DASHBOARD + JUDGE;

/* Download Reports */
const DOWNLOAD :string = '/download';
export const DOWNLOAD_FORMS = DASHBOARD + DOWNLOAD;

/* Visualize Stats */
export const VISUALIZE :string = '/visualize';
export const VISUALIZE_DASHBOARD = DASHBOARD + VISUALIZE;

/* Enroll voice profile */
const VOICE :string = '/voice';
export const VOICE_ENROLLMENT = DASHBOARD + VOICE;

/* CheckIns Container */
const CHECKINS :string = 'checkins';

/* Manage Charges */
export const MANAGE_HEARINGS :string = 'manage-hearings';

/* people */
export const REMINDERS :string = 'reminders';
export const PERSON = `${DASHBOARD}/person`;
export const PEOPLE = `${DASHBOARD}/people`;
export const SEARCH_PEOPLE = `${PEOPLE}/search`;
export const REQUIRES_ACTION_PEOPLE = `${PEOPLE}/requires_action`;
export const MANAGE_PEOPLE_HEARINGS = `${PEOPLE}/${MANAGE_HEARINGS}`;
export const MANAGE_PEOPLE_REMINDERS = `${PEOPLE}/${REMINDERS}`;
export const MANAGE_PEOPLE_CHECKINS = `${PEOPLE}/${CHECKINS}`;

/* query params */
export const FIRST_NAME = 'fname';
export const LAST_NAME = 'lname';
export const DOB = 'dob';

/* Person Details */
export const OVERVIEW = '/overview';
export const CASES = '/cases';
export const HEARINGS = '/hearings';
export const ABOUT_PERSON = `${PERSON_DETAILS}`;

/* Manage Charges */
export const MANAGE_CHARGES :string = `${DASHBOARD}/manage-charges`;
export const CHARGES :string = '/charges';
export const ARREST_CHARGES = '/arrest';
export const COURT_CHARGES = '/court';

/* Settings */
export const SETTINGS :string = `${DASHBOARD}/settings`;
export const CHARGE_SETTINGS :string = `${SETTINGS}${CHARGES}`;
export const SETTINGS_ARREST_CHARGES :string = `${CHARGE_SETTINGS}${ARREST_CHARGES}`;
export const SETTINGS_COURT_CHARGES :string = `${CHARGE_SETTINGS}${COURT_CHARGES}`;
