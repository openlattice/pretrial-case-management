/*
 * @flow
 */
import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;
const { OPENLATTICE_ID_FQN } = Constants;

export const SEARCH_PREFIX = 'entity';

export const APP_NAME = 'psa';

export const ORG_IDS = {
  DEMO_ORG: '1d5aa1f4-4d22-46a5-97cd-dcc6820e7ff8',
  LINCOLN_SD: 'ad76f03a-57ad-4aa9-8007-4adad5130ac7',
  PCM_DEMO_ORG: 'dd9fb3e7-7e70-45ae-8b43-ea479b067e68',
  PENNINGTON_SD: '67d555b4-7495-414e-a259-ef82ba71779a',
  MINNEHAHA_SD: 'e558ee21-8fec-4c65-aeda-039924ba9a92',
  SHELBY_TN: 'f61d005b-ff0d-4260-b42a-2a03854aa8e2'
};

/*
* App Types
*/

export const APP_TYPES = {
  ARREST_CHARGE_LIST: 'publicsafety.arrestchargelist',
  APP_SETTINGS: 'app.settings',
  ADDRESSES: 'app.address',
  APPEARS_IN: 'app.appearsin',
  APPEARS_IN_STATE: 'app.appearsinstate',
  ARREST_APPEARS_IN: 'app.appearsinarrest',
  ARREST_CHARGED_WITH: 'app.arrestchargedwith',
  ARREST_CHARGES: 'app.arrestcharges',
  ARREST_CASES: 'app.arrestpretrialcases',
  ARRESTED_IN: 'app.arrestedin',
  ASSESSED_BY: 'app.assessedby',
  ASSESSED_BY_STATE: 'app.assessedby_shared',
  ARRESTING_AGENCIES: 'app.agencies',
  BONDS: 'app.manualbonds',
  CALCULATED_FOR: 'app.calculatedfor',
  CALLED: 'app.called',
  CHARGED_WITH: 'app.chargedwith',
  CHARGES: 'app.courtcharges',
  CHECKIN_APPOINTMENTS: 'app.checkinAppointment',
  CHECKINS: 'app.checkin',
  CONTACT_INFO_GIVEN: 'app.contactinfogiven',
  CONTACT_INFORMATION: 'app.contactinformation',
  COUNTIES: 'app.counties',
  COURT_CHARGE_LIST: 'publicsafety.courtchargelist',
  COURTHOUSES: 'app.courthouses',
  COURTROOMS: 'app.courtrooms',
  DMF_RESULTS: 'app.rcm',
  DMF_RISK_FACTORS: 'app.rcmriskfactors',
  EDITED_BY: 'app.editedby',
  FTAS: 'app.ftas',
  HEARINGS: 'app.hearings',
  INCIDENT: 'app.incident',
  JUDGES: 'app.judges',
  LIVES_AT: 'app.livesat',
  LIVES_AT_ARREST: 'app.livesat_arrest',
  MANUAL_CHARGES: 'app.manualcharges',
  MANUAL_COURT_CHARGES: 'app.manualcourtcharges',
  MANUAL_PRETRIAL_CASES: 'app.manualpretrialcases',
  MANUAL_PRETRIAL_COURT_CASES: 'app.manualpretrialcourtcases',
  MANUAL_REMINDERS: 'app.manualreminders',
  OUTCOMES: 'app.psaoutcomes',
  OVERSAW: 'app.oversaw',
  PEOPLE: 'app.people',
  // TODO: Bring this back if we need to write to it
  // PRESIDES_OVER: 'presidesover.app',
  PRETRIAL_CASES: 'app.courtpretrialcases',
  PSA_RISK_FACTORS: 'app.psariskfactors',
  PSA_SCORES: 'app.psascores',
  REGISTERED_FOR: 'app.registeredfor',
  REGISTERED_FOR_SHARED: 'app.registeredfor_shared',
  RELEASE_CONDITIONS: 'app.releaseconditions',
  RELEASE_RECOMMENDATIONS: 'app.psanotes',
  REMINDER_OPT_OUTS: 'app.optout',
  REMINDERS: 'app.remindersent',
  REMINDER_TEMPLATES: 'app.remindertemplates',
  SENTENCES: 'app.sentences',
  SENTENCED_WITH: 'app.sentencedwith',
  SUBSCRIPTION: 'app.subscription',
  SPEAKER_RECOGNITION_PROFILES: 'app.speakerrecognitionprofiles',
  STAFF: 'app.staff',
  UJS_EMPLOYEES: 'app.employees'
};


/*
* App Type Fqns
*/

const getAppTypeFqns = () => {
  const appTypeFqns = {};
  Object.entries(APP_TYPES).forEach(([key, appType]) => {
    appTypeFqns[key] = new FullyQualifiedName(appType);
  });
  return appTypeFqns;
};

export const APP_TYPES_FQNS = getAppTypeFqns();

/*
 * Charge FQNs
 */

export const CHARGE_FQNS = {
  STATUTE: new FullyQualifiedName('ol.id'),
  LEVEL: new FullyQualifiedName('ol.level'),
  DEGREE: new FullyQualifiedName('ol.levelstate'),
  DESCRIPTION: new FullyQualifiedName('ol.name'),
  NO_COUNTS: new FullyQualifiedName('ol.numberofcounts'),
  SEX_CRIME: new FullyQualifiedName('ol.sexcrime'),
  INVOLVING_JUVENILES: new FullyQualifiedName('ol.juveniles'),
  PROTECTIVE_CUSTODY: new FullyQualifiedName('ol.protectivecustody'),
  ATTEMPTED_COMPLETED: new FullyQualifiedName('ol.attemptedcompleted'),
  VIOLENT: new FullyQualifiedName('ol.violent'),
  STEP_2: new FullyQualifiedName('ol.dmfstep2indicator'),
  STEP_4: new FullyQualifiedName('ol.dmfstep4indicator'),
  BHE: new FullyQualifiedName('ol.bheindicator'),
  BRE: new FullyQualifiedName('ol.breindicator'),
};

export const PROPERTY_TYPES = {
  ENTITY_KEY_ID: OPENLATTICE_ID_FQN,

  APP_DETAILS: 'ol.appdetails',
  GENERAL_ID: 'general.id',
  ID: 'ol.id',
  STRING_ID: 'general.stringid',
  TYPE: 'ol.type',
  STATUS: 'general.status',
  RESULT: 'general.result',
  NAME: 'ol.name',

  COMPLETED_DATE_TIME: 'date.completeddatetime',
  DATE_TIME: 'general.datetime',
  START_DATE: 'ol.startdate',
  END_DATE: 'ol.enddate',

  FIRST_NAME: 'nc.PersonGivenName',
  LAST_NAME: 'nc.PersonSurName',
  MIDDLE_NAME: 'nc.PersonMiddleName',
  SUFFIX: 'nc.PersonSuffix',
  DOB: 'nc.PersonBirthDate',
  SEX: 'nc.PersonSex',
  RACE: 'nc.PersonRace',
  ETHNICITY: 'nc.PersonEthnicity',
  PERSON_ID: 'nc.SubjectIdentification',
  PICTURE: 'person.picture',
  SSN: 'nc.SSN',
  AGE: 'person.age',
  MUGSHOT: 'publicsafety.mugshot',
  HEIGHT: 'nc.PersonHeightMeasure',
  WEIGHT: 'nc.PersonWeightMeasure',
  EYE: 'nc.PersonEyeColorText',
  JURISDICTION: 'ol.idjurisdiction',

  // contact information fields
  EMAIL: 'staff.email',
  PHONE: 'contact.phonenumber',
  IS_MOBILE: 'contact.cellphone',
  IS_PREFERRED: 'ol.preferred',

  // contact info given id
  CONTACT_INFO_GIVEN_ID: 'ol.id',

  // Charges
  REFERENCE_CHARGE_STATUTE: 'ol.id',
  REFERENCE_CHARGE_DESCRIPTION: 'ol.name',
  REFERENCE_CHARGE_LEVEL: 'ol.level',
  REFERENCE_CHARGE_DEGREE: 'ol.levelstate',
  CHARGE_IS_VIOLENT: 'ol.violent',
  CHARGE_DMF_STEP_2: 'ol.dmfstep2indicator',
  CHARGE_DMF_STEP_4: 'ol.dmfstep4indicator',
  BHE: 'ol.bheindicator',
  BRE: 'ol.breindicator',

  // Check-ins
  CONFIDENCE: 'general.confidence',

  // location-specific fields
  ADDRESS: 'location.Address',
  CITY: 'location.city',
  STATE: 'location.state',
  ZIP: 'location.zip',

  // Pretrial case entity type consts
  CASE_NUMBER: 'ol.name',
  CASE_ID: 'j.CaseNumberText',
  ARREST_DATE: 'publicsafety.ArrestDate',
  ARREST_DATE_TIME: 'ol.arrestdatetime',
  FILE_DATE: 'publicsafety.FileDate',
  MOST_SERIOUS_CHARGE_NO: 'publicsafety.MostSeriousChargeStatuteNumber',
  MOST_SERIOUS_CHARGE_DESC: 'publicsafety.MostSeriousStatuteDescription',
  MOST_SERIOUS_CHARGE_DEG: 'publicsafety.MostSeriousChargeDegree',
  NUMBER_OF_CHARGES: 'publicsafety.NumberOfCharges',
  LAST_UPDATED_DATE: 'general.entryupdated',
  CASE_DISPOSITION_DATE: 'publicsafety.CaseDispositionDate',
  ARRESTING_AGENCY: 'criminaljustice.arrestagency',

  // Charge entity type consts
  CHARGE_ID: 'justice.ArrestTrackingNumber',
  CHARGE_STATUTE: 'event.OffenseLocalCodeSection',
  CHARGE_DESCRIPTION: 'event.OffenseLocalDescription',
  CHARGE_DEGREE: 'event.ChargeLevelState',
  CHARGE_LEVEL: 'event.ChargeLevel',
  DISPOSITION_DATE: 'justice.dispositiondate',
  DISPOSITION: 'justice.disposition',
  PLEA: 'justice.plea',
  PLEA_DATE: 'justice.pleadate',
  QUALIFIER: 'j.OffenseQualifierText',
  NUMBER_OF_COUNTS: 'ol.numberofcounts',

  // Sentence entity type consts
  JAIL_DAYS_SERVED: 'justice.incarcerationdays',
  JAIL_MONTHS_SERVED: 'justice.incarcerationmonths',
  JAIL_YEARS_SERVED: 'justice.incarcerationyears',
  JAIL_DAYS_SUSPENDED: 'justice.incarcerationsuspendeddays',
  JAIL_MONTHS_SUSPENDED: 'justice.incarcerationsuspendedmonths',
  JAIL_YEARS_SUSPENDED: 'justice.incarcerationsuspendedyears',
  JAIL_START_DATE: 'justice.incarcerationstartdate',
  CONCURRENT_CONSECUTIVE: 'ol.concurrentconsecutive',

  // Hearing entity type consts
  COURTROOM: 'justice.courtroom',
  HEARING_TYPE: 'justice.courtcasetype',
  UPDATE_TYPE: 'ol.update',
  HEARING_COMMENTS: 'event.comments',
  HEARING_INACTIVE: 'ol.inactive',

  // PSA Outcomes entity Type Consts
  JUDGE_ACCEPTED: 'justice.judgeacceptedrecommendation',
  APPEARED: 'ol.appeared',

  // PSA form entity type consts
  AGE_AT_CURRENT_ARREST: 'psa.AgeAtCurrentArrest',
  CURRENT_VIOLENT_OFFENSE: 'psa.CurrentViolentOffense',
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG: 'psa.CurrentViolentOffenseAnd20OrYounger',
  PENDING_CHARGE: 'psa.PendingCharge',
  PRIOR_MISDEMEANOR: 'psa.PriorMisdemeanorConviction',
  PRIOR_FELONY: 'psa.PriorFelonyConviction',
  PRIOR_CONVICTION: 'psa.PriorConviction',
  PRIOR_VIOLENT_CONVICTION: 'psa.PriorViolentConviction',
  PRIOR_FAILURE_TO_APPEAR_RECENT: 'psa.PriorFailureToAppearWithinTwoYears',
  PRIOR_FAILURE_TO_APPEAR_OLD: 'psa.PriorFailureToAppearOlderThanTwoYears',
  PRIOR_SENTENCE_TO_INCARCERATION: 'psa.PriorSentenceToIncarceration',

  // PSA form note entity type consts
  AGE_AT_CURRENT_ARREST_NOTES: 'psa.AgeAtCurrentArrestNotes',
  CURRENT_VIOLENT_OFFENSE_NOTES: 'psa.CurrentViolentOffenseNotes',
  PENDING_CHARGE_NOTES: 'psa.PendingChargeNotes',
  PRIOR_MISDEMEANOR_NOTES: 'psa.PriorMisdemeanorConvictionNotes',
  PRIOR_FELONY_NOTES: 'psa.PriorFelonyConvictionNotes',
  PRIOR_VIOLENT_CONVICTION_NOTES: 'psa.PriorViolentConvictionNotes',
  PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES: 'psa.PriorFailureToAppearWithinTwoYearsNotes',
  PRIOR_FAILURE_TO_APPEAR_OLD_NOTES: 'psa.PriorFailureToAppearOlderThanTwoYearsNotes',
  PRIOR_SENTENCE_TO_INCARCERATION_NOTES: 'psa.PriorSentenceToIncarcerationNotes',

  // DMF risk factors entity type consts
  EXTRADITED: 'justice.extradited',
  DMF_STEP_2_CHARGES: 'justice.dmfstep2',
  DMF_STEP_4_CHARGES: 'justice.dmfstep4',
  DMF_SECONDARY_RELEASE_CHARGES: 'justice.dmfsecondaryreleasecharges',
  DMF_SECONDARY_HOLD_CHARGES: 'justice.dmfsecondaryholdcharges',
  CONTEXT: 'general.context',

  // DMF risk factor notes entity type consts
  EXTRADITED_NOTES: 'justice.extraditednotes',
  DMF_STEP_2_CHARGES_NOTES: 'justice.dmfstep2notes',
  DMF_STEP_4_CHARGES_NOTES: 'justice.dmfstep4notes',
  DMF_SECONDARY_RELEASE_CHARGES_NOTES: 'justice.dmfsecondaryreleasechargesnotes',
  DMF_SECONDARY_HOLD_CHARGES_NOTES: 'justice.dmfsecondaryholdchargesnotes',

  // DMF result entity type consts
  COLOR: 'general.color',
  RELEASE_TYPE: 'criminaljustice.releasetype',
  CONDITIONS_LEVEL: 'justice.conditionslevel',
  CONDITION_1: 'justice.condition1',
  CONDITION_2: 'justice.condition2',
  CONDITION_3: 'justice.condition3',
  OUTCOME: 'ol.outcome',

  // Bond entity type consts
  BOND_TYPE: 'justice.bonddescription',
  BOND_AMOUNT: 'justice.bondamount',
  SURETY_AMOUNT: 'justice.suretyamount',

  // Opt Out type Consts
  REASON: 'ol.reason',

  // Release condition entity type consts
  FREQUENCY: 'general.frequency',
  OTHER_TEXT: 'ol.othertext',
  PERSON_NAME: 'general.fullname',
  PERSON_TYPE: 'criminaljustice.persontype',
  PLAN_TYPE: 'ol.plantype',

  // PSA scores entity type consts
  NVCA_FLAG: 'psa.nvcaFlag',
  NCA_SCALE: 'psa.ncaScale',
  FTA_SCALE: 'psa.ftaScale',
  TIMESTAMP: 'psa.GeneratedDate',
  STATUS_NOTES: 'general.statusnotes',
  FAILURE_REASON: 'justice.failurereason',

  // Release recommendation entity type consts
  RELEASE_RECOMMENDATION: 'publicsafety.recommendation',

  // Voice recognition entity type consts
  AUDIO_SAMPLE: 'ol.audio',
  PIN: 'ol.token',

  // Subscription
  SUBSCRIPTION_ID: 'ol.id',
  IS_ACTIVE: 'ol.active',
  DAY_INTERVAL: 'ol.dayinterval',
  WEEK_INTERVAL: 'ol.weekinterval',

  // Reminders
  REMINDER_ID: 'ol.id',
  REMINDER_STATUS: 'ol.status',
  NOTIFIED: 'ol.notified',
  REMINDER_NOTES: 'ol.notes',
  CONTACT_METHOD: 'ol.contactmethod'
};
