/*
 * @flow
 */

export const ROOT :string = '/';
export const DASHBOARD :string = '/dashboard';
export const LOGIN :string = '/login';
export const NEW_PERSON :string = `${DASHBOARD}/new-person`;
export const PERSON_DETAILS_ROOT :string = `${DASHBOARD}/person-details`;
export const PERSON_EKID :string = ':personEKID';
export const PERSON_DETAILS :string = `${PERSON_DETAILS_ROOT}/${PERSON_EKID}`;

/* Reports */
export const FORMS :string = '/forms';

export const TERMS :string = '/terms';

const CREATE_CONTEXT :string = '/:context';
export const PSA :string = '/psa';
export const PSA_FORM_BASE :string = FORMS + PSA;
export const PSA_FORM :string = PSA_FORM_BASE + CREATE_CONTEXT;
export const PSA_FORM_ARREST :string = `${PSA_FORM_BASE}/2`;
export const PSA_FORM_CHARGES :string = `${PSA_FORM_BASE}/3`;
export const PSA_FORM_INPUT :string = `${PSA_FORM_BASE}/4`;
export const PSA_FORM_SEARCH:string = `${PSA_FORM_BASE}/1`;
export const PSA_SUBMISSION_PAGE :string = `${PSA_FORM_BASE}/submission`;

/* Create Report */
const CREATE :string = '/create';
export const CREATE_FORMS = DASHBOARD + CREATE;

/* Requires Action */
export const REQUIRES_ACTION = `${DASHBOARD}/requires_action`;

/* Judge View */
const JUDGE :string = '/judges';
export const JUDGE_VIEW = DASHBOARD + JUDGE;

/* Download Reports */
const DOWNLOAD :string = '/download';
export const DOWNLOAD_FORMS = DASHBOARD + DOWNLOAD;

/* Visualize Stats */
export const VISUALIZE :string = '/visualize';
export const VISUALIZE_DASHBOARD = DASHBOARD + VISUALIZE;

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
export const psaContext = 'psactx';
export const caseContext = 'casectx';

/* Person Details */
export const OVERVIEW = '/overview';
export const CASES = '/cases';
export const HEARINGS = '/hearings';
export const ABOUT_PERSON = `${PERSON_DETAILS}`;
export const PROGRAMS = '/programs';

/* Manage Charges */
export const MANAGE_CHARGES :string = `${DASHBOARD}/manage-charges`;
export const CHARGES :string = '/charges';
export const ARREST_CHARGES = '/arrest';
export const COURT_CHARGES = '/court';

/* Settings */
export const SETTINGS :string = `${DASHBOARD}/settings`;

export const CHARGE_SETTINGS :string = `${SETTINGS}${CHARGES}`;
export const GENERAL_SETTINGS :string = `${SETTINGS}/general`;
export const RCM_SETTINGS :string = `${SETTINGS}/rcm`;
export const JUDGES_SETTINGS :string = `${SETTINGS}/judges`;
