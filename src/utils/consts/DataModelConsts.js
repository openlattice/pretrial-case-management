export const ENTITY_SETS = {
  PEOPLE: 'southdakotapeople',
  ADDRESSES: 'southdakotaaddresses',
  CHARGES: 'southdakotacharges',
  PRETRIAL_CASES: 'southdakotapretrialcaseprocessings',
  PSA_RISK_FACTORS: 'southdakotapsariskfactors',
  PSA_SCORES: 'southdakotapsas',
  RELEASE_RECOMMENDATIONS: 'southdakotareleaserecommendations',

  // association entity sets
  APPEARS_IN: 'southdakotaappearsin',
  LIVES_AT: 'southdakotalivesat',
  GETS_MAIL_AT: 'southdakotagetsmailat',
  CALCULATED_FOR: 'southdakotacalculatedfor',
  CHARGED_WITH: 'southdakotachargedwith'
};

export const PROPERTY_TYPES = {
  STRING_ID: 'general.stringid',

  FIRST_NAME: 'nc.PersonGivenName',
  LAST_NAME: 'nc.PersonSurName',
  MIDDLE_NAME: 'nc.PersonMiddleName',
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
  CASE_ID_FQN: 'j.CaseNumberText',
  ARREST_DATE_FQN: 'publicsafety.ArrestDate',
  MOST_SERIOUS_CHARGE_NO: 'publicsafety.MostSeriousChargeStatuteNumber',
  MOST_SERIOUS_CHARGE_DESC: 'publicsafety.MostSeriousStatuteDescription',
  MOST_SERIOUS_CHARGE_DEG: 'publicsafety.MostSeriousChargeDegree',
  NUMBER_OF_CHARGES_FQN: 'publicsafety.NumberOfCharges',

  // Charge entity type consts
  CHARGE_ID_FQN: 'justice.ArrestTrackingNumber',
  CHARGE_NUM_FQN: 'event.OffenseLocalCodeSection',
  CHARGE_DESCRIPTION_FQN: 'event.OffenseLocalDescription',
  CHARGE_DEGREE_FQN: 'event.ChargeLevelState',
  DISPOSITION_DATE: 'justice.dispositiondate',

  // PSA form entity type consts
  AGE_AT_CURRENT_ARREST_FQN: 'psa.AgeAtCurrentArrest',
  CURRENT_VIOLENT_OFFENSE_FQN: 'psa.CurrentViolentOffense',
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN: 'psa.CurrentViolentOffenseAnd20OrYounger',
  PENDING_CHARGE_FQN: 'psa.PendingCharge',
  PRIOR_MISDEMEANOR_FQN: 'psa.PriorMisdemeanorConviction',
  PRIOR_FELONY_FQN: 'psa.PriorFelonyConviction',
  PRIOR_CONVICTION_FQN: 'psa.PriorConviction',
  PRIOR_VIOLENT_CONVICTION_FQN: 'psa.PriorViolentConviction',
  PRIOR_FAILURE_TO_APPEAR_RECENT_FQN: 'psa.PriorFailureToAppearWithinTwoYears',
  PRIOR_FAILURE_TO_APPEAR_OLD_FQN: 'psa.PriorFailureToAppearOlderThanTwoYears',
  PRIOR_SENTENCE_TO_INCARCERATION_FQN: 'psa.PriorSentenceToIncarceration',
  NVCA_FLAG_FQN: 'psa.nvcaFlag',
  NCA_SCALE_FQN: 'psa.ncaScale',
  FTA_SCALE_FQN: 'psa.ftaScale',
  TIMESTAMP_FQN: 'psa.GeneratedDate',

  // Release recommendation entity type consts
  GENERAL_ID_FQN: 'general.id',
  RELEASE_RECOMMENDATION_FQN: 'publicsafety.recommendation',

  // Entity set names
  PERSON_ENTITY_SET_NAME: 'southdakotapeople',
  PRETRIAL_CASE_ENTITY_SET_NAME: 'southdakotapretrialcaseprocessings',
  CHARGE_ENTITY_SET_NAME: 'southdakotacharges',
  PSA_ENTITY_SET_NAME: 'southdakotapsas',
  RISK_FACTORS_ENTITY_SET_NAME: 'southdakotapsariskfactors',
  CALCULATED_FOR_ENTITY_SET_NAME: 'southdakotacalculatedfor',
  RELEASE_RECOMMENDATION_ENTITY_SET_NAME: 'southdakotareleaserecommendations'
};
