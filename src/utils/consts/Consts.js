/*
 * @flow
 */

export const MAX_PAGE = 5;

export const MAX_HITS = 10000;

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
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG: 'currentViolentOffenseAndYoung',

  // notes
  NOTES: 'psaNotes'
};

export const DMF = {
  CASE_CONTEXT: 'caseContext',
  EXTRADITED: 'personWasExtradited',
  STEP_2_CHARGES: 'dmfStepTwoCharges',
  STEP_4_CHARGES: 'dmfStepFourCharges',
  COURT_OR_BOOKING: 'courtOrBooking',
  SECONDARY_RELEASE_CHARGES: 'dmfSecondaryReleaseCharges',
  SECONDARY_HOLD_CHARGES: 'dmfSecondaryHoldCharges'
};

export const NOTES = {
  [PSA.AGE_AT_CURRENT_ARREST]: 'ageAtCurrentArrestNotes',
  [PSA.CURRENT_VIOLENT_OFFENSE]: 'currentViolentOffenseNotes',
  [PSA.PENDING_CHARGE]: 'pendingChargeNotes',
  [PSA.PRIOR_MISDEMEANOR]: 'priorMisdemeanorNotes',
  [PSA.PRIOR_FELONY]: 'priorFelonyNotes',
  [PSA.PRIOR_VIOLENT_CONVICTION]: 'priorViolentConvictionNotes',
  [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: 'priorFailureToAppearRecentNotes',
  [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: 'priorFailureToAppearOldNotes',
  [PSA.PRIOR_SENTENCE_TO_INCARCERATION]: 'priorSentenceToIncarcerationNotes',
  [DMF.EXTRADITED]: 'extraditedNotes',
  [DMF.STEP_2_CHARGES]: 'dmfStep2ChargesNotes',
  [DMF.STEP_4_CHARGES]: 'dmfStep4ChargesNotes',
  [DMF.SECONDARY_RELEASE_CHARGES]: 'dmfSecondaryReleaseChargesNotes',
  [DMF.SECONDARY_HOLD_CHARGES]: 'dmfSecondaryHoldChargesNotes'
};

export const CONTEXT = {
  COURT: 'Court',
  DEMO_ORG: 'Court (Demo)',
  COURT_MINN: 'Court (Minnehaha)',
  COURT_LINCOLN: 'Court (Lincoln)',
  COURT_PENN: 'Court (Pennington)',
  COURT_SHELBY: 'Court (Shelby)',
  BOOKING: 'Booking'
};

export type Charge = {
  statute :string,
  description :string,
  degree :string,
  degreeShort :string,
  dispositionDate :string,
  disposition :string,
  pleaDate :string,
  plea :string,
  qualifier :string
};

export const CHARGE = {
  ID: 'chargeId',
  STATUTE: 'statute',
  DESCRIPTION: 'description',
  DEGREE: 'degree',
  DEGREE_SHORT: 'degreeShort',
  DISPOSITION_DATE: 'dispositionDate',
  DISPOSITION: 'disposition',
  PLEA_DATE: 'pleaDate',
  PLEA: 'plea',
  QUALIFIER: 'qualifier',
  NUMBER_OF_COUNTS: 'counts'
};

export const FORM_IDS = {
  PERSON_ID: 'personId',
  STAFF_ID: 'staffId',
  CONTACT_ID: 'contactId',
  BOND_ID: 'bondId',
  TIMESTAMP: 'timestamp',
  CONTACT_INFO_ID: 'contactInfoId',
  HEARING_ID: 'hearingId'
};

export const EDIT_FIELDS = {
  PSA_ID: 'psaId',
  RISK_FACTORS_ID: 'psaRiskFactorsId',
  NOTES_ID: 'notesId',
  PERSON_ID: 'personId',
  TIMESTAMP: 'timestamp',
  DMF_ID: 'dmfId',
  DMF_RISK_FACTORS_ID: 'dmfRiskFactorsId'
};

export const LIST_FIELDS = {
  ENTITY_SET_ID: 'entitySetId',
  ID: 'entityKeyId',
  RELEASE_CONDITIONS_FIELD: 'releaseConditionField',
  CHECKIN_APPOINTMENTS_FIELD: 'checkInAppointmentField'
};

export const FORM_LENGTHS = {
  psa: 4
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

export const ID_FIELD_NAMES = {
  PSA_ID: 'psaId',
  RISK_FACTORS_ID: 'riskFactorsId',
  NOTES_ID: 'notesId',
  PERSON_ID: 'personId',
  CASE_ID: 'caseId',
  ARREST_ID: 'arrestId',
  ARREST_ID_FOR_COURT: 'arrestIdForCourt',
  STAFF_ID: 'staffId',
  TIMESTAMP: 'timestamp',
  DMF_RISK_FACTORS_ID: 'dmfRiskFactorsId',
  DMF_ID: 'dmfId',
  BOND_ID: 'bondId',
  HEARING_ID: 'hearingId',
  OUTCOME_ID: 'outcomeId',
  EMPLOYEE_ID: 'employeeId',
  JUDGE_ID: 'judgeId',
  CONTACT_INFO_ID: 'contactInfoId',
  CHARGE_ID: 'chargeId'
};

export const ID_FIELDS = {
  PSA: 'psaEntityKeyId',
  RISK_FACTORS: 'riskFactorsEntityKeyId',
  NOTES: 'notesEntityKeyId',
  PERSON: 'personEntityKeyId',
  STAFF: 'staffEntityKeyId',
  CASE: 'caseEntityKeyId',
  CHARGE: 'chargeEntityKeyId',
  SENTENCE: 'sentenceEntityKeyId'
};

export const HEARING = {
  DATE_TIME: 'hearingDateTime',
  COURTROOM: 'hearingCourtroom',
  JUDGE: 'hearingJudge',
  COMMENTS: 'hearingComments'
};

export const HEARING_TYPES = {
  INITIAL_APPEARANCE: 'Initial Appearance',
  ALL_OTHERS: 'all other hearings'
};

export const PSA_STATUSES = {
  OPEN: 'Open',
  SUCCESS: 'Success',
  FAILURE: 'Failure',
  CANCELLED: 'Cancelled',
  DECLINED: 'Declined',
  DISMISSED: 'Dismissed'
};

export const PSA_FAILURE_REASONS = {
  FTA: 'Failure to Appear',
  NONCOMPLIANCE: 'Non-compliance',
  REARREST: 'Rearrest',
  REARREST_VA: 'Rearrest (Violent Offense)',
  OTHER: 'Other'
};

export const SORT_TYPES = {
  DATE: 'DATE',
  NAME: 'NAME',
  CASE_NUM: 'CASE_NUM'
};

export const RELEASE_CONDITIONS = {
  OUTCOME: 'outcome',
  OTHER_OUTCOME_TEXT: 'otherOutcomeText',
  RELEASE: 'release',
  BOND_TYPE: 'bondType',
  BOND_AMOUNT: 'bondAmount',
  CONDITIONS: 'conditions',
  CHECKIN_FREQUENCY: 'checkinFrequency',
  C247_TYPES: 'c247Types',
  OTHER_CONDITION_TEXT: 'otherConditionText',
  NO_CONTACT_PEOPLE: 'noContactPeople',
  WARRANT: 'warrant'
};

export const JURISDICTION = {
  [CONTEXT.COURT_PENN]: 'Pennington County, South Dakota',
  [CONTEXT.COURT_LINCOLN]: 'Lincoln County, South Dakota',
  [CONTEXT.COURT_MINN]: 'Minnehaha County, South Dakota',
  [CONTEXT.DEMO_ORG]: 'San Mateo County, California',
  [CONTEXT.BOOKING]: 'Pennington County, South Dakota'
};

export const PERSON_INFO_DATA = {
  HAS_OPEN_PSA: 'hasOpenPsa',
  HAS_MULTIPLE_OPEN_PSAS: 'hasMultipleOpenPSAs',
  IS_RECEIVING_REMINDERS: 'isReceivingReminders'
};

export const CONFIRMATION_ACTION_TYPES = {
  DELETE: 'delete',
  CANCEL: 'cancel'
};

export const CONFIRMATION_OBJECT_TYPES = {
  CHARGE: 'charge',
  HEARING: 'hearing'
};


export const TABLE_WIDTH = 1000;
export const ROW_HEIGHT = 50;
export const TABLE_OFFSET = 2;
export const MAX_ROWS = 10;
