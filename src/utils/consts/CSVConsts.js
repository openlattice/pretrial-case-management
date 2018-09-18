export const HEADERS = {
  FIRST_NAME: 'nc.PersonGivenName|South Dakota People',
  MIDDLE_NAME: 'nc.PersonMiddleName|South Dakota People',
  LAST_NAME: 'nc.PersonSurName|South Dakota People',
  SUFFIX: 'nc.PersonSuffix|South Dakota People',
  SEX: 'nc.PersonSex|South Dakota People',
  DOB: 'nc.PersonBirthDate|South Dakota People',
  RACE: 'nc.PersonRace|South Dakota People',
  ETHNICITY: 'nc.PersonEthnicity|South Dakota People',
  HEIGHT: 'nc.PersonHeightMeasure|South Dakota People',
  WEIGHT: 'nc.PersonWeightMeasure|South Dakota People',
  EYE: 'nc.PersonEyeColorText|South Dakota People',
  SSN: 'nc.SSN|South Dakota People',
  ODY_ID: 'nc.SubjectIdentification|South Dakota People',
  REFERRED_BY: 'criminaljustice.arrestagency|Pennington Pretrial status case proceedings',
  NUM_CHGS: 'publicsafety.NumberOfCharges|South Dakota Manually Created Pretrial Cases',
  ARREST_CASE_NO: 'j.CaseNumberText|Pennington Pretrial status case proceedings',
  ARREST_DATE_Z: 'ol.arrestdatetime|Pennington Pretrial status case proceedings',
  ARREST_DATE: 'ol.arrestdatetime|South Dakota Manually Created Pretrial Cases',
  PSA_TYPE: 'general.context|South Dakota DMF Risk Factors',
  FILER: 'nc.SubjectIdentification|South Dakota Staff',
  DATE_COMPLETED: 'date.completeddatetime|Assessed By',
  AGE_AT_CURRENT_ARREST: 'psa.AgeAtCurrentArrest|South Dakota PSA Risk Factors',
  CURRENT_VIOLENT_OFFENSE: 'psa.CurrentViolentOffense|South Dakota PSA Risk Factors',
  CURRENT_VIOLENT_OFFENSE_NOTES: 'psa.CurrentViolentOffenseNotes|South Dakota PSA Risk Factors',
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG: 'psa.CurrentViolentOffenseAnd20OrYounger|South Dakota PSA Risk Factors',
  PENDING_CHARGE: 'psa.PendingCharge|South Dakota PSA Risk Factors',
  PENDING_CHARGE_NOTES: 'psa.PendingChargeNotes|South Dakota PSA Risk Factors',
  PRIOR_MISDEMEANOR: 'psa.PriorMisdemeanorConviction|South Dakota PSA Risk Factors',
  PRIOR_MISDEMEANOR_NOTES: 'psa.PriorMisdemeanorConvictionNotes|South Dakota PSA Risk Factors',
  PRIOR_FELONY: 'psa.PriorFelonyConviction|South Dakota PSA Risk Factors',
  PRIOR_FELONY_NOTES: 'psa.PriorFelonyConvictionNotes|South Dakota PSA Risk Factors',
  PRIOR_CONVICTION: 'psa.PriorConviction|South Dakota PSA Risk Factors',
  PRIOR_VIOLENT_CONVICTION: 'psa.PriorViolentConviction|South Dakota PSA Risk Factors',
  PRIOR_VIOLENT_CONVICTION_NOTES: 'psa.PriorViolentConvictionNotes|South Dakota PSA Risk Factors',
  PRIOR_FAILURE_TO_APPEAR_RECENT: 'psa.PriorFailureToAppearWithinTwoYears|South Dakota PSA Risk Factors',
  PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES: 'psa.PriorFailureToAppearWithinTwoYearsNotes|South Dakota PSA Risk Factors',
  PRIOR_FAILURE_TO_APPEAR_OLD: 'psa.PriorFailureToAppearOlderThanTwoYears|South Dakota PSA Risk Factors',
  PRIOR_FAILURE_TO_APPEAR_OLD_NOTES: 'psa.PriorFailureToAppearOlderThanTwoYearsNotes|South Dakota PSA Risk Factors',
  PRIOR_SENTENCE_TO_INCARCERATION: 'psa.PriorSentenceToIncarceration|South Dakota PSA Risk Factors',
  PRIOR_SENTENCE_TO_INCARCERATION_NOTES: 'psa.PriorSentenceToIncarcerationNotes|South Dakota PSA Risk Factors',
  NVCA_FLAG: 'psa.nvcaFlag|PSA Scores',
  FTA_SCALE: 'psa.ftaScale|PSA Scores',
  NCA_SCALE: 'psa.ncaScale|PSA Scores',
  RECOMMENDATION: 'publicsafety.recommendation|South Dakota Release Recommendations',
  EXTRADITED: 'justice.extradited|South Dakota DMF Risk Factors',
  EXTRADITED_NOTES: 'justice.extraditednotes|South Dakota DMF Risk Factors',
  DMF_STEP_2_CHARGES: 'justice.dmfstep2|South Dakota DMF Risk Factors',
  DMF_STEP_2_CHARGES_NOTES: 'justice.dmfstep2notes|South Dakota DMF Risk Factors',
  DMF_STEP_4_CHARGES: 'justice.dmfstep4|South Dakota DMF Risk Factors',
  DMF_STEP_4_CHARGES_NOTES: 'justice.dmfstep4notes|South Dakota DMF Risk Factors',
  DMF_SECONDARY_RELEASE_CHARGES: 'justice.dmfsecondaryreleasecharges|South Dakota DMF Risk Factors',
  DMF_SECONDARY_RELEASE_CHARGES_NOTES: 'justice.dmfsecondaryreleasechargesnotes|South Dakota DMF Risk Factors',
  COLOR: 'general.color|South Dakota DMF Decisions',
  RELEASE_TYPE: 'criminaljustice.releasetype|South Dakota DMF Decisions',
  CONDITIONS_LEVEL: 'justice.conditionslevel|South Dakota DMF Decisions',
  CONDITION_1: 'justice.condition1|South Dakota DMF Decisions',
  CONDITION_2: 'justice.condition2|South Dakota DMF Decisions',
  CONDITION_3: 'justice.condition3|South Dakota DMF Decisions',
  STATUS: 'general.status|PSA Scores',
  STATUS_NOTES: 'general.statusnotes|South Dakota PSA Scores',
  FAILURE_REASON: 'justice.failurereason|PSA Scores'
};

export const HEADERS_OBJ = {
  [HEADERS.FIRST_NAME]: {
    label: 'FIRST',
    value: HEADERS.FIRST_NAME
  },
  [HEADERS.MIDDLE_NAME]: {
    label: 'MIDDLE',
    value: HEADERS.MIDDLE_NAME
  },
  [HEADERS.LAST_NAME]: {
    label: 'LAST',
    value: HEADERS.LAST_NAME
  },
  [HEADERS.SUFFIX]: {
    label: 'SUFFIX',
    value: HEADERS.SUFFIX
  },
  [HEADERS.SEX]: {
    label: 'SEX',
    value: HEADERS.SEX
  },
  [HEADERS.DOB]: {
    label: 'DOB',
    value: HEADERS.DOB
  },
  [HEADERS.RACE]: {
    label: 'RACE',
    value: HEADERS.RACE
  },
  [HEADERS.ETHNICITY]: {
    label: 'ETHNICITY',
    value: HEADERS.ETHNICITY
  },
  [HEADERS.HEIGHT]: {
    label: 'HEIGHT',
    value: HEADERS.HEIGHT
  },
  [HEADERS.WEIGHT]: {
    label: 'WEIGHT',
    value: HEADERS.WEIGHT
  },
  [HEADERS.EYE]: {
    label: 'EYE',
    value: HEADERS.EYE
  },
  [HEADERS.SSN]: {
    label: 'SSN',
    value: HEADERS.SSN
  },
  [HEADERS.ODY_ID]: {
    label: 'ODY ID#',
    value: HEADERS.ODY_ID
  },
  [HEADERS.REFERRED_BY]: {
    label: 'REFERRED BY',
    value: HEADERS.REFERRED_BY
  },
  [HEADERS.NUM_CHGS]: {
    label: '# CHGS',
    value: HEADERS.NUM_CHGS
  },
  [HEADERS.ARREST_CASE_NO]: {
    label: 'ARREST CASE NO',
    value: HEADERS.ARREST_CASE_NO
  },
  [HEADERS.ARREST_DATE_Z]: {
    label: 'ARREST DATE_Z',
    value: HEADERS.ARREST_DATE_Z
  },
  [HEADERS.ARREST_DATE]: {
    label: 'ARREST_DATE',
    value: HEADERS.ARREST_DATE
  },
  [HEADERS.PSA_TYPE]: {
    label: 'PSA TYPE',
    value: HEADERS.PSA_TYPE
  },
  [HEADERS.FILER]: {
    label: 'FILER',
    value: HEADERS.FILER
  },
  [HEADERS.DATE_COMPLETED]: {
    label: 'DATE COMPLETED',
    value: HEADERS.DATE_COMPLETED
  },
  [HEADERS.AGE_AT_CURRENT_ARREST]: {
    label: 'Q1: AGE AT ARREST',
    value: HEADERS.AGE_AT_CURRENT_ARREST
  },
  [HEADERS.CURRENT_VIOLENT_OFFENSE]: {
    label: 'Q2: CUR VLNT',
    value: HEADERS.CURRENT_VIOLENT_OFFENSE
  },
  [HEADERS.CURRENT_VIOLENT_OFFENSE_NOTES]: {
    label: 'Q2 CUR VLNT NOTES',
    value: HEADERS.CURRENT_VIOLENT_OFFENSE_NOTES
  },
  [HEADERS.CURRENT_VIOLENT_OFFENSE_AND_YOUNG]: {
    label: 'Q2A: CUR VLNT + 20<',
    value: HEADERS.CURRENT_VIOLENT_OFFENSE_AND_YOUNG
  },
  [HEADERS.PENDING_CHARGE]: {
    label: 'Q3: PNDG CHG',
    value: HEADERS.PENDING_CHARGE
  },
  [HEADERS.PENDING_CHARGE_NOTES]: {
    label: 'Q3 PNDG CHG NOTES',
    value: HEADERS.PENDING_CHARGE_NOTES
  },
  [HEADERS.PRIOR_MISDEMEANOR]: {
    label: 'Q4: PRIOR MISD',
    value: HEADERS.PRIOR_MISDEMEANOR
  },
  [HEADERS.PRIOR_MISDEMEANOR_NOTES]: {
    label: 'Q4 PRIOR MISD NOTES',
    value: HEADERS.PRIOR_MISDEMEANOR_NOTES
  },
  [HEADERS.PRIOR_FELONY]: {
    label: 'Q5: PRIOR FEL',
    value: HEADERS.PRIOR_FELONY
  },
  [HEADERS.PRIOR_FELONY_NOTES]: {
    label: 'Q5 PRIOR FEL NOTES',
    value: HEADERS.PRIOR_FELONY_NOTES
  },
  [HEADERS.PRIOR_CONVICTION]: {
    label: 'Q5A:  PRIOR CONV',
    value: HEADERS.PRIOR_CONVICTION
  },
  [HEADERS.PRIOR_VIOLENT_CONVICTION]: {
    label: 'Q6: PRIOR VLT CONV',
    value: HEADERS.PRIOR_VIOLENT_CONVICTION
  },
  [HEADERS.PRIOR_VIOLENT_CONVICTION_NOTES]: {
    label: 'Q6 PRIOR VLNT CONV NOTES',
    value: HEADERS.PRIOR_VIOLENT_CONVICTION_NOTES
  },
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_RECENT]: {
    label: 'Q7: FTA < 2 YRS',
    value: HEADERS.PRIOR_FAILURE_TO_APPEAR_RECENT
  },
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES]: {
    label: 'Q7 FTA < 2 YRS NTOES',
    value: HEADERS.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES
  },
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_OLD]: {
    label: 'Q8: FTA > 2 YRS',
    value: HEADERS.PRIOR_FAILURE_TO_APPEAR_OLD
  },
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES]: {
    label: 'Q8 FTA > 2 YRS NOTES',
    value: HEADERS.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES
  },
  [HEADERS.PRIOR_SENTENCE_TO_INCARCERATION]: {
    label: 'Q9: INCARC',
    value: HEADERS.PRIOR_SENTENCE_TO_INCARCERATION
  },
  [HEADERS.PRIOR_SENTENCE_TO_INCARCERATION_NOTES]: {
    label: 'Q9 INCARC NOTES',
    value: HEADERS.PRIOR_SENTENCE_TO_INCARCERATION_NOTES
  },
  [HEADERS.NVCA_FLAG]: {
    label: 'NCVA FLAG',
    value: HEADERS.NVCA_FLAG
  },
  [HEADERS.FTA_SCALE]: {
    label: 'FTA',
    value: HEADERS.FTA_SCALE
  },
  [HEADERS.NCA_SCALE]: {
    label: 'NCA',
    value: HEADERS.NCA_SCALE
  },
  [HEADERS.RECOMMENDATION]: {
    label: 'NOTES',
    value: HEADERS.RECOMMENDATION
  },
  [HEADERS.EXTRADITED]: {
    label: 'EXTRADITED',
    value: HEADERS.EXTRADITED
  },
  [HEADERS.EXTRADITED_NOTES]: {
    label: 'EXTRADITED NOTES',
    value: HEADERS.EXTRADITED_NOTES
  },
  [HEADERS.DMF_STEP_2_CHARGES]: {
    label: 'STEP 2',
    value: HEADERS.DMF_STEP_2_CHARGES
  },
  [HEADERS.DMF_STEP_2_CHARGES_NOTES]: {
    label: 'STEP 2 NOTES',
    value: HEADERS.DMF_STEP_2_CHARGES_NOTES
  },
  [HEADERS.DMF_STEP_4_CHARGES]: {
    label: 'STEP 4',
    value: HEADERS.DMF_STEP_4_CHARGES
  },
  [HEADERS.DMF_STEP_4_CHARGES_NOTES]: {
    label: 'STEP 4 NOTES',
    value: HEADERS.DMF_STEP_4_CHARGES_NOTES
  },
  [HEADERS.DMF_SECONDARY_RELEASE_CHARGES]: {
    label: 'BHE',
    value: HEADERS.DMF_SECONDARY_RELEASE_CHARGES
  },
  [HEADERS.DMF_SECONDARY_RELEASE_CHARGES_NOTES]: {
    label: 'BHE NOTES',
    value: HEADERS.DMF_SECONDARY_RELEASE_CHARGES_NOTES
  },
  [HEADERS.COLOR]: {
    label: 'PSA COLOR',
    value: HEADERS.COLOR
  },
  [HEADERS.RELEASE_TYPE]: {
    label: 'RELEASE TYPE',
    value: HEADERS.RELEASE_TYPE
  },
  [HEADERS.CONDITIONS_LEVEL]: {
    label: 'COND LVL',
    value: HEADERS.CONDITIONS_LEVEL
  },
  [HEADERS.CONDITION_1]: {
    label: 'REL COND 1',
    value: HEADERS.CONDITION_1
  },
  [HEADERS.CONDITION_2]: {
    label: 'REL COND 2',
    value: HEADERS.CONDITION_2
  },
  [HEADERS.CONDITION_3]: {
    label: 'REL COND 3',
    value: HEADERS.CONDITION_3
  },
  [HEADERS.STATUS]: {
    label: 'PSA STATUS',
    value: HEADERS.STATUS
  },
  [HEADERS.STATUS_NOTES]: {
    label: 'PSA STATUS NOTES',
    value: HEADERS.STATUS_NOTES
  },
  [HEADERS.FAILURE_REASON]: {
    label: 'FAILURE REASON',
    value: HEADERS.FAILURE_REASON
  }
};

export const POSITIONS = {
  FIRST: 1,
  MIDDLE: 2,
  LAST: 3,
  SUFFIX: 4,
  SEX: 5,
  DOB: 6,
  RACE: 7,
  ETHNICITY: 8,
  HEIGHT: 9,
  WEIGHT: 10,
  EYE: 11,
  SSN: 12,
  'ODY ID#': 13,
  'REFERRED BY': 14,
  '# CHGS': 15,
  'ARREST CASE NO': 16,
  'ARREST DATE_Z': 17,
  ARREST_DATE: 18,
  'PSA TYPE': 19,
  FILER: 20,
  'DATE COMPLETED': 21,
  'Q1: AGE AT ARREST': 22,
  'Q2: CUR VLNT': 23,
  'Q2 CUR VLNT NOTES': 24,
  'Q2A: CUR VLNT + 20<': 25,
  'Q3: PNDG CHG': 26,
  'Q3 PNDG CHG NOTES': 27,
  'Q4: PRIOR MISD': 28,
  'Q4 PRIOR MISD NOTES': 29,
  'Q5: PRIOR FEL': 30,
  'Q5 PRIOR FEL NOTES': 31,
  'Q5A:  PRIOR CONV': 32,
  'Q6: PRIOR VLT CONV': 33,
  'Q6 PRIOR VLNT CONV NOTES': 34,
  'Q7: FTA < 2 YRS': 35,
  'Q7 FTA < 2 YRS NTOES': 36,
  'Q8: FTA > 2 YRS': 37,
  'Q8 FTA > 2 YRS NOTES': 38,
  'Q9: INCARC': 39,
  'Q9 INCARC NOTES': 40,
  'NCVA FLAG': 41,
  FTA: 42,
  NCA: 43,
  NOTES: 44,
  EXTRADITED: 45,
  'EXTRADITED NOTES': 46,
  'STEP 2': 47,
  'STEP 2 NOTES': 48,
  'STEP 4': 49,
  'STEP 4 NOTES': 50,
  BHE: 51,
  'BHE NOTES': 52,
  'PSA COLOR': 53,
  'RELEASE TYPE': 54,
  'COND LVL': 55,
  'REL COND 1': 56,
  'REL COND 2': 57,
  'REL COND 3': 58,
  'PSA STATUS': 59,
  'PSA STATUS NOTES': 60,
  'FAILURE REASON': 61
};
