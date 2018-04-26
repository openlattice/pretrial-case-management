/*
 * @flow
 */

export const ENTITY_SETS = {
  PEOPLE: 'southdakotapeople',
  ADDRESSES: 'southdakotaaddresses',
  CHARGES: 'southdakotacharges',
  PRETRIAL_CASES: 'southdakotapretrialcaseprocessings',
  PSA_RISK_FACTORS: 'southdakotapsariskfactors',
  PSA_SCORES: 'southdakotapsas',
  RELEASE_RECOMMENDATIONS: 'southdakotareleaserecommendations',
  STAFF: 'southdakotastaff',
  SPEAKER_RECOGNITION_PROFILES: 'southdakotaspeakerverificationprofiles',

  // association entity sets
  APPEARS_IN: 'southdakotaappearsin',
  ASSESSED_BY: 'southdakotaassessedby',
  LIVES_AT: 'southdakotalivesat',
  CALCULATED_FOR: 'southdakotacalculatedfor',
  CHARGED_WITH: 'southdakotachargedwith',
  REGISTERED_FOR: 'southdakotaregisteredfor'
};

export const PROPERTY_TYPES = {
  STRING_ID: 'general.stringid',
  COMPLETED_DATE_TIME: 'date.completeddatetime',

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
  FILE_DATE: 'publicsafety.FileDate',
  MOST_SERIOUS_CHARGE_NO: 'publicsafety.MostSeriousChargeStatuteNumber',
  MOST_SERIOUS_CHARGE_DESC: 'publicsafety.MostSeriousStatuteDescription',
  MOST_SERIOUS_CHARGE_DEG: 'publicsafety.MostSeriousChargeDegree',
  NUMBER_OF_CHARGES: 'publicsafety.NumberOfCharges',

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
