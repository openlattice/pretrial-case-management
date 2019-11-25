/*
 * @flow
 */

export const ROOT :string = '/';
export const DASHBOARD :string = '/dashboard';
export const LOGIN :string = '/login';
export const NEW_PERSON :string = `${DASHBOARD}/new-person`;
export const PERSON_DETAILS_ROOT :string = `${DASHBOARD}/person-details`;
export const PERSON_DETAILS :string = `${PERSON_DETAILS_ROOT}/:personId`;

/* Reports */
export const FORMS :string = '/forms';

export const TERMS :string = '/terms';

export const PSA :string = '/psa';
export const PSA_FORM :string = FORMS + PSA;

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
export const MULTI_SEARCH_PEOPLE = `${PEOPLE}/multisearch`;
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
export const ARREST_CHARGES = '/arrest';
export const COURT_CHARGES = '/court';
export const SETTINGS = '/settings';

/* Staff Dashboard */
export const STAFF_DASHBOARD :string = `${DASHBOARD}/staff_dasboard`;
