/*
 * @flow
 */
import { RCM_FIELDS } from './RCMResultsConsts';

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

export const SEXES = [
  'Male',
  'Female',
  'Unknown',
  'Decline to state',
  'Not asked'
];

export const GENDERS = [
  'Male',
  'Female',
  'Non-Binary',
  'Transgender (Male to Female)',
  'Transgender (Female to Male)',
  'Unknown',
  'Decline to state',
  'Not asked'
];

export const STATES = [
  'AK',
  'AL',
  'AR',
  'AZ',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
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
  'VA',
  'VT',
  'WA',
  'WI',
  'WV',
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

export const RCM = {
  CASE_CONTEXT: 'caseContext',
  EXTRADITED: 'personWasExtradited',
  STEP_2_CHARGES: 'rcmStepTwoCharges',
  STEP_4_CHARGES: 'rcmStepFourCharges',
  COURT_OR_BOOKING: 'courtOrBooking',
  SECONDARY_RELEASE_CHARGES: 'rcmSecondaryReleaseCharges',
  SECONDARY_HOLD_CHARGES: 'rcmSecondaryHoldCharges'
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
  [RCM_FIELDS.EXTRADITED]: 'extraditedNotes',
  [RCM_FIELDS.STEP_2_CHARGES]: 'rcmStep2ChargesNotes',
  [RCM_FIELDS.STEP_4_CHARGES]: 'rcmStep4ChargesNotes',
  [RCM_FIELDS.SECONDARY_RELEASE_CHARGES]: 'rcmSecondaryReleaseChargesNotes',
  [RCM_FIELDS.SECONDARY_HOLD_CHARGES]: 'rcmSecondaryHoldChargesNotes'
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
