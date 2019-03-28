import { PROPERTY_TYPES } from './consts/DataModelConsts';

import { getFirstNeighborValue } from './DataUtils';

const PROPERTY_LABELS = {
  // Time Property types
  [PROPERTY_TYPES.COMPLETED_DATE_TIME]: 'completedDateTime',
  [PROPERTY_TYPES.DATE_TIME]: 'dateTime',
  [PROPERTY_TYPES.START_DATE]: 'startDate',
  [PROPERTY_TYPES.END_DATE]: 'endDate',
  [PROPERTY_TYPES.TIMESTAMP]: 'timestamp',

  // PSA Scores Property types
  [PROPERTY_TYPES.NVCA_FLAG]: 'nvcaFlag',
  [PROPERTY_TYPES.NCA_SCALE]: 'ncaScale',
  [PROPERTY_TYPES.FTA_SCALE]: 'ftaScale',
  [PROPERTY_TYPES.STATUS]: 'status',
  [PROPERTY_TYPES.STATUS_NOTES]: 'statusNotes',
  [PROPERTY_TYPES.FAILURE_REASON]: 'failureReason',

  // Pretrial Case Property Types
  [PROPERTY_TYPES.CASE_ID]: 'caseId',
  [PROPERTY_TYPES.CASE_NUMBER]: 'caseNumber',
  [PROPERTY_TYPES.ARREST_DATE]: 'arrestDate',
  [PROPERTY_TYPES.ARREST_DATE_TIME]: 'arrestDateTime',
  [PROPERTY_TYPES.FILE_DATE]: 'fileDate',
  [PROPERTY_TYPES.MOST_SERIOUS_CHARGE_NO]: 'mostSeriousChargeNumber',
  [PROPERTY_TYPES.MOST_SERIOUS_CHARGE_DESC]: 'mostSeriousChargeDescription',
  [PROPERTY_TYPES.MOST_SERIOUS_CHARGE_DEG]: 'mostSeriousChargeDegree',
  [PROPERTY_TYPES.NUMBER_OF_CHARGES]: 'numberOfCharges',
  [PROPERTY_TYPES.LAST_UPDATED_DATE]: 'lastUpdateDate',
  [PROPERTY_TYPES.CASE_DISPOSITION_DATE]: 'caseDispositionDate',
  [PROPERTY_TYPES.ARRESTING_AGENCY]: 'arrestingAgency',


  // Charge Property Types
  [PROPERTY_TYPES.CHARGE_ID]: 'chargeId',
  [PROPERTY_TYPES.CHARGE_STATUTE]: 'statute',
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: 'description',
  [PROPERTY_TYPES.CHARGE_DEGREE]: 'degreeShort',
  [PROPERTY_TYPES.CHARGE_LEVEL]: 'degree',
  [PROPERTY_TYPES.DISPOSITION_DATE]: 'dispositionDate',
  [PROPERTY_TYPES.DISPOSITION]: 'disposition',
  [PROPERTY_TYPES.PLEA]: 'plea',
  [PROPERTY_TYPES.PLEA_DATE]: 'pleaDate',
  [PROPERTY_TYPES.QUALIFIER]: 'qualifier',
  [PROPERTY_TYPES.NUMBER_OF_COUNTS]: 'numberOfCounts',

  // Person Property types
  [PROPERTY_TYPES.FIRST_NAME]: 'firstName',
  [PROPERTY_TYPES.LAST_NAME]: 'lastName',
  [PROPERTY_TYPES.MIDDLE_NAME]: 'middleName',
  [PROPERTY_TYPES.SUFFIX]: 'suffix',
  [PROPERTY_TYPES.DOB]: 'dob',
  [PROPERTY_TYPES.EX]: 'sex',
  [PROPERTY_TYPES.RACE]: 'race',
  [PROPERTY_TYPES.ETHNICITY]: 'ethnicity',
  [PROPERTY_TYPES.PERSON_ID]: 'personId',
  [PROPERTY_TYPES.PICTURE]: 'picture',
  [PROPERTY_TYPES.SN]: 'ssn',
  [PROPERTY_TYPES.AGE]: 'age',
  [PROPERTY_TYPES.MUGSHOT]: 'mugshot',
  [PROPERTY_TYPES.HEIGHT]: 'height',
  [PROPERTY_TYPES.WEIGHT]: 'weight',
  [PROPERTY_TYPES.EYE]: 'eyeColor',
  [PROPERTY_TYPES.JURISDICTION]: 'jurisdiction',

  // Contact Information Property Types
  [PROPERTY_TYPES.EMAIL]: 'email',
  [PROPERTY_TYPES.PHONE]: 'phone',
  [PROPERTY_TYPES.IS_MOBILE]: 'isMobile',
  [PROPERTY_TYPES.IS_PREFERRED]: 'isPreferred',

  // contact info given id
  [PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID]: 'contactInfoGivenId',

  // Reference Charge Property Types
  [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: 'statute',
  [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: 'description',
  [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: 'degree',
  [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: 'degreeShort',
  [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: 'isViolent',
  [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: 'isStep2',
  [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: 'isStep4',
  [PROPERTY_TYPES.BHE]: 'isBHE',
  [PROPERTY_TYPES.BRE]: 'isBRE',

  // Location-specific Property Types
  [PROPERTY_TYPES.ADDRESS]: 'address',
  [PROPERTY_TYPES.CITY]: 'city',
  [PROPERTY_TYPES.STATE]: 'state',
  [PROPERTY_TYPES.ZIP]: 'zipCode',

  // Sentence entity type consts
  [PROPERTY_TYPES.JAIL_DAYS_SERVED]: 'daysServed',
  [PROPERTY_TYPES.JAIL_MONTHS_SERVED]: 'monthsServed',
  [PROPERTY_TYPES.JAIL_YEARS_SERVED]: 'yearsServed',
  [PROPERTY_TYPES.JAIL_DAYS_SUSPENDED]: 'daysSuspened',
  [PROPERTY_TYPES.JAIL_MONTHS_SUSPENDED]: 'monthsSuspened',
  [PROPERTY_TYPES.JAIL_YEARS_SUSPENDED]: 'yearsSuspened',
  [PROPERTY_TYPES.JAIL_START_DATE]: 'startDate',
  [PROPERTY_TYPES.CONCURRENT_CONSECUTIVE]: 'concurrentConsecutive',

  // Hearing entity type consts
  [PROPERTY_TYPES.COURTROOM]: 'courtroom',
  [PROPERTY_TYPES.HEARING_TYPE]: 'hearingtime',
  [PROPERTY_TYPES.UPDATE_TYPE]: 'updateType',
  [PROPERTY_TYPES.HEARING_COMMENTS]: 'comments',
  [PROPERTY_TYPES.HEARING_INACTIVE]: 'inactive',

  // PSA Outcomes entity Type Consts
  [PROPERTY_TYPES.JUDGE_ACCEPTED]: 'judgeAccepted',
  [PROPERTY_TYPES.APPEARED]: 'appeared',

  // PSA form entity type consts
  [PROPERTY_TYPES.AGE_AT_CURRENT_ARREST]: 'ageAtCurrentArrest',
  [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE]: 'currentViolentOffense',
  [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG]: 'currentViolentOffenseAndYoung',
  [PROPERTY_TYPES.PENDING_CHARGE]: 'pendingCharge',
  [PROPERTY_TYPES.PRIOR_MISDEMEANOR]: 'priorMisdemeanor',
  [PROPERTY_TYPES.PRIOR_FELONY]: 'priorFelony',
  [PROPERTY_TYPES.PRIOR_CONVICTION]: 'priorConviction',
  [PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION]: 'priorViolentConviction',
  [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT]: 'priorFTARecent',
  [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD]: 'priorFTAOld',
  [PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION]: 'priorSentenceToIncarceration',

  // PSA form note entity type consts
  [PROPERTY_TYPES.AGE_AT_CURRENT_ARREST_NOTES]: 'ageAtCurrentArrestNotes',
  [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_NOTES]: 'currentViolentOffenseNotes',
  [PROPERTY_TYPES.PENDING_CHARGE_NOTES]: 'pendingChargeNotes',
  [PROPERTY_TYPES.PRIOR_MISDEMEANOR_NOTES]: 'priorMisdemeanorNotes',
  [PROPERTY_TYPES.PRIOR_FELONY_NOTES]: 'priorFelonyNotes',
  [PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_NOTES]: 'priorViolentConvictionNotes',
  [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES]: 'priorFTARecentNotes',
  [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES]: 'priorFTAOldNotes',
  [PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_NOTES]: 'priorSentenceToIncarcerationNotes',

  // DMF risk factors entity type consts
  [PROPERTY_TYPES.EXTRADITED]: 'extradited',
  [PROPERTY_TYPES.DMF_STEP_2_CHARGES]: 'step2Charges',
  [PROPERTY_TYPES.DMF_STEP_4_CHARGES]: 'step4Charges',
  [PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES]: 'currentBRECharges',
  [PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES]: 'currentBHECharges',
  [PROPERTY_TYPES.CONTEXT]: 'context',

  // DMF risk factor notes entity type consts
  [PROPERTY_TYPES.EXTRADITED_NOTES]: 'extraditedNotes',
  [PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES]: 'step2ChargesNotes',
  [PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES]: 'step4ChargesNotes',
  [PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES_NOTES]: 'currentBREChargesNotes',
  [PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES_NOTES]: 'currentBHEChargesNotes',

  // DMF result entity type consts
  [PROPERTY_TYPES.COLOR]: 'color',
  [PROPERTY_TYPES.RELEASE_TYPE]: 'releaseType',
  [PROPERTY_TYPES.CONDITIONS_LEVEL]: 'conditionsLevel',
  [PROPERTY_TYPES.CONDITION_1]: 'conditionOne',
  [PROPERTY_TYPES.CONDITION_2]: 'conditionTwo',
  [PROPERTY_TYPES.CONDITION_3]: 'conditionThree',
  [PROPERTY_TYPES.OUTCOME]: 'outcome',

  // Bond entity type consts
  [PROPERTY_TYPES.BOND_TYPE]: 'bondType',
  [PROPERTY_TYPES.BOND_AMOUNT]: 'bondAmount',
  [PROPERTY_TYPES.SURETY_AMOUNT]: 'suretyAmount',

  // Opt Out type Consts
  [PROPERTY_TYPES.REASON]: 'reason',

  // Release condition entity type consts
  [PROPERTY_TYPES.CONDITION_TYPE]: 'conditionType',
  [PROPERTY_TYPES.FREQUENCY]: 'frequency',
  [PROPERTY_TYPES.OTHER_TEXT]: 'otherText',
  [PROPERTY_TYPES.PERSON_NAME]: 'personName',
  [PROPERTY_TYPES.PERSON_TYPE]: 'personType',
  [PROPERTY_TYPES.PLAN_TYPE]: 'planType',

  // Release recommendation entity type consts
  [PROPERTY_TYPES.GENERAL_ID]: 'generalId',
  [PROPERTY_TYPES.RELEASE_RECOMMENDATION]: 'releaseRecommendation',

  // Voice recognition entity type consts
  [PROPERTY_TYPES.AUDIO_SAMPLE]: 'audioSample',
  [PROPERTY_TYPES.PIN]: 'pin',

  // Subscription
  [PROPERTY_TYPES.SUBSCRIPTION_ID]: 'subscriptionId',
  [PROPERTY_TYPES.IS_ACTIVE]: 'isActive',
  [PROPERTY_TYPES.DAY_INTERVAL]: 'dayInterval',
  [PROPERTY_TYPES.WEEK_INTERVAL]: 'weekInterval',

  // Reminders
  [PROPERTY_TYPES.REMINDER_ID]: 'reminderId',
  [PROPERTY_TYPES.REMINDER_STATUS]: 'reminderStatus',
  [PROPERTY_TYPES.REMINDER_TYPE]: 'reminderType',
  [PROPERTY_TYPES.NOTIFIED]: 'wasNotified',
  [PROPERTY_TYPES.REMINDER_NOTES]: 'reminderNotes',
  [PROPERTY_TYPES.CONTACT_METHOD]: 'contactMethod'
};

// Pass case object and list of property types and will return and object of labels
// mapped to properties.
const getEntityPropertyTypes = (entity, propertyList) => {
  let entityPropertyFields = Map();
  propertyList.forEach((propertyType) => {
    const label = PROPERTY_LABELS[propertyType];
    const property = getFirstNeighborValue(entity, propertyType);
    entityPropertyFields = entityPropertyFields.set(label, property);
  });
  return entityPropertyFields.toJS();
};

export default getEntityPropertyTypes;
