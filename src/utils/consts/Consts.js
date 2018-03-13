/*
 * @flow
 */

export const MAX_PAGE = 5;

export const FORM_PATHS = {
  1: '/1',
  2: '/2',
  3: '/3',
  4: '/4',
  5: '/5'
};

export const PERSONAL_INFO_SECTION = 'personalInfo';

export const PERSONAL_INFO_NAMES = {
  IDENTIFICATION: 'identification',
  FIRST_NAME: 'firstName',
  MIDDLE_NAME: 'middleName',
  LAST_NAME: 'lastName',
  DOB: 'dob',
  AGE: 'age',
  GENDER: 'gender',
  SSN: 'ssn',
  PHONE: 'phone',
  EMAIL: 'email',
  PREVIOUS_ADMISSION: 'previousAdmission',
  STREET: 'street',
  APARTMENT: 'apartment',
  CITY: 'city',
  STATE: 'state',
  COUNTRY: 'country',
  ZIP: 'zip',
  RESIDENT_OF_STATE: 'residentOfState',
  HOMELESS: 'homeless',
  ADDRESS_SAME_AS_MAILING: 'addressSameAsMailing',
  PHYSICAL_STREET: 'physicalStreet',
  PHYSICAL_APARTMENT: 'physicalApartment',
  PHYSICAL_CITY: 'physicalCity',
  PHYSICAL_STATE: 'physicalState',
  PHYSICAL_COUNTRY: 'physicalCountry',
  PHYSICAL_ZIP: 'physicalZip'
};

export const GENDERS = [
  'male',
  'female',
  'non-binary'
];

export const STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
];

export const RADIO_YES_VALUE = 'yes';
export const RADIO_NO_VALUE = 'no';

export const PSA = {
  AGE_AT_CURRENT_ARREST: 'ageAtCurrentArrest',
  CURRENT_VIOLENT_OFFENSE: 'currentViolentOffense',
  PENDING_CHARGE: 'pendingCharge',
  PRIOR_MISDEMEANOR: 'priorMisdemeanor',
  PRIOR_FELONY: 'priorFelony',
  PRIOR_VIOLENT_CONVICTION: 'priorViolentConviction',
  PRIOR_FAILURE_TO_APPEAR_RECENT: 'priorFailureToAppearRecent',
  PRIOR_FAILURE_TO_APPEAR_OLD: 'priorFailureToAppearOld',
  PRIOR_SENTENCE_TO_INCARCERATION: 'priorSentenceToIncarceration',

  // optional values
  PRIOR_CONVICTION: 'priorConviction',
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG: 'currentViolentOffenseAndYoung'
};

export const FORM_IDS = {
  PERSON_ID: 'personId',
  STAFF_ID: 'staffId',
  CONTACT_ID: 'contactId',
  TIMESTAMP: 'timestamp'
};

export const LIST_FIELDS = {
  ENTITY_SET_ID: 'entitySetId',
  ID: 'entityKeyId'
};

export const FORM_LENGTHS = {
  psa: 4
};

export const PERSON_FQNS = {
  ID: 'id',
  SUBJECT_ID: 'nc.SubjectIdentification',
  FIRST_NAME: 'nc.PersonGivenName',
  LAST_NAME: 'nc.PersonSurName',
  DOB: 'nc.PersonBirthDate',
  PHOTO: 'person.picture',
  SEX: 'nc.PersonSex',
  SSN: 'nc.SSN'
};

export const FLEX = {
  COL_1_3: '0 0 520px',
  COL_2_3: '0 0 1040px',
  COL_1_2: '0 0 780px',
  COL_1_4: '0 0 390px',
  COL_1_5: '0 0 312px',
  COL_1_6: '0 0 260px',
  COL_100: '100%'
};

export const TABLE_WIDTH = 1000;
export const ROW_HEIGHT = 50;
export const TABLE_OFFSET = 2;
export const MAX_ROWS = 10;
