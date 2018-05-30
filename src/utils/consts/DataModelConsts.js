/*
 * @flow
 */

export const ENTITY_SETS = {
  PEOPLE: 'southdakotapeople',
  ADDRESSES: 'southdakotaaddresses',
  CHARGES: 'southdakotacharges',
  SENTENCES: 'southdakotasentences',
  PRETRIAL_CASES: 'southdakotapretrialcaseprocessings',
  MANUAL_PRETRIAL_CASES: 'southdakotamanualpretrialcaseprocessings',
  MANUAL_CHARGES: 'southdakotamanualcharges',
  PSA_RISK_FACTORS: 'southdakotapsariskfactors',
  PSA_SCORES: 'southdakotapsas',
  DMF_RISK_FACTORS: 'southdakotadmfriskfactors',
  DMF_RESULTS: 'southdakotadmfs',
  RELEASE_RECOMMENDATIONS: 'southdakotareleaserecommendations',
  STAFF: 'southdakotastaff',
  SPEAKER_RECOGNITION_PROFILES: 'southdakotaspeakerverificationprofiles',
  FTAS: 'southdakotaftas',

  // arrest entity sets
  ARREST_CASES: 'PenZuercherPretrialCase',
  ARREST_CHARGES: 'PenZuercherCharge',
  ARREST_APPEARS_IN: 'PenZuercherAppearsin',
  ARREST_CHARGED_WITH: 'PenZuercherchargedwith',

  // association entity sets
  APPEARS_IN: 'southdakotaappearsin',
  ASSESSED_BY: 'southdakotaassessedby',
  LIVES_AT: 'southdakotalivesat',
  CALCULATED_FOR: 'southdakotacalculatedfor',
  CHARGED_WITH: 'southdakotachargedwith',
  REGISTERED_FOR: 'southdakotaregisteredfor',
  EDITED_BY: 'southdakotaeditedby'
};

export const PROPERTY_TYPES = {
  STRING_ID: 'general.stringid',
  COMPLETED_DATE_TIME: 'date.completeddatetime',
  DATE_TIME: 'general.datetime',

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

  // location-specific fields
  ADDRESS: 'location.Address',
  CITY: 'location.city',
  STATE: 'location.state',
  ZIP: 'location.zip',

  // Pretrial case entity type consts
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

  // Sentence entity type consts
  JAIL_DAYS_SERVED: 'justice.incarcerationdays',
  JAIL_MONTHS_SERVED: 'justice.incarcerationmonths',
  JAIL_YEARS_SERVED: 'justice.incarcerationyears',
  JAIL_DAYS_SUSPENDED: 'justice.incarcerationsuspendeddays',
  JAIL_MONTHS_SUSPENDED: 'justice.incarcerationsuspendedmonths',
  JAIL_YEARS_SUSPENDED: 'justice.incarcerationsuspendedyears',
  JAIL_START_DATE: 'justice.incarcerationstartdate',
  CONCURRENT_CONSECUTIVE: 'justice.concurrentconsecutive',

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
  CONTEXT: 'general.context',

  // DMF risk factor notes entity type consts
  EXTRADITED_NOTES: 'justice.extraditednotes',
  DMF_STEP_2_CHARGES_NOTES: 'justice.dmfstep2notes',
  DMF_STEP_4_CHARGES_NOTES: 'justice.dmfstep4notes',

  // DMF result entity type consts
  COLOR: 'general.color',
  RELEASE_TYPE: 'criminaljustice.releasetype',
  CONDITIONS_LEVEL: 'justice.conditionslevel',
  CONDITION_1: 'justice.condition1',
  CONDITION_2: 'justice.condition2',
  CONDITION_3: 'justice.condition3',

  // PSA scores entity type consts
  NVCA_FLAG: 'psa.nvcaFlag',
  NCA_SCALE: 'psa.ncaScale',
  FTA_SCALE: 'psa.ftaScale',
  TIMESTAMP: 'psa.GeneratedDate',

  // Release recommendation entity type consts
  GENERAL_ID: 'general.id',
  RELEASE_RECOMMENDATION: 'publicsafety.recommendation',

  // Vocie recognition entity type consts
  AUDIO_SAMPLE: 'media.audio',
  PIN: 'general.pin'
};
