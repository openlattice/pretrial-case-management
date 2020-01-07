/* eslint max-len: 0 */ // --> OFF
import { APP_TYPES, PROPERTY_TYPES } from './DataModelConsts';

export const HEADERS = {
  LAST_NAME: `${PROPERTY_TYPES.LAST_NAME}|${APP_TYPES.PEOPLE}`,
  FIRST_NAME: `${PROPERTY_TYPES.FIRST_NAME}|${APP_TYPES.PEOPLE}`,
  MIDDLE_NAME: `${PROPERTY_TYPES.MIDDLE_NAME}|${APP_TYPES.PEOPLE}`,
  SUFFIX: `${PROPERTY_TYPES.SUFFIX}|${APP_TYPES.PEOPLE}`,
  SEX: `${PROPERTY_TYPES.SEX}|${APP_TYPES.PEOPLE}`,
  DOB: `${PROPERTY_TYPES.DOB}|${APP_TYPES.PEOPLE}`,
  RACE: `${PROPERTY_TYPES.RACE}|${APP_TYPES.PEOPLE}`,
  ETHNICITY: `${PROPERTY_TYPES.ETHNICITY}|${APP_TYPES.PEOPLE}`,
  HEIGHT: `${PROPERTY_TYPES.HEIGHT}|${APP_TYPES.PEOPLE}`,
  WEIGHT: `${PROPERTY_TYPES.WEIGHT}|${APP_TYPES.PEOPLE}`,
  EYE: `${PROPERTY_TYPES.EYE}|${APP_TYPES.PEOPLE}`,
  SSN: `${PROPERTY_TYPES.SSN}|${APP_TYPES.PEOPLE}`,
  ODY_ID: `${PROPERTY_TYPES.PERSON_ID}|${APP_TYPES.PEOPLE}`,
  REFERRED_BY: `${PROPERTY_TYPES.ARRESTING_AGENCY}|${APP_TYPES.ARREST_CASES}`,
  NUM_CHGS_ARREST: `${PROPERTY_TYPES.NUMBER_OF_CHARGES}|${APP_TYPES.MANUAL_PRETRIAL_CASES}`,
  NUM_CHGS_COURT: `${PROPERTY_TYPES.NUMBER_OF_CHARGES}|${APP_TYPES.MANUAL_PRETRIAL_COURT_CASES}`,
  ARREST_CASE_NO: `${PROPERTY_TYPES.CASE_ID}|${APP_TYPES.ARREST_CASES}`,
  ARREST_DATE_ARREST: `${PROPERTY_TYPES.ARREST_DATE_TIME}|${APP_TYPES.MANUAL_PRETRIAL_CASES}`,
  ARREST_DATE_COURT: `${PROPERTY_TYPES.ARREST_DATE_TIME}|${APP_TYPES.MANUAL_PRETRIAL_COURT_CASES}`,
  PSA_TYPE: `${PROPERTY_TYPES.CONTEXT}|${APP_TYPES.DMF_RISK_FACTORS}`,
  FILER: `${PROPERTY_TYPES.PERSON_ID}|${APP_TYPES.STAFF}`,
  DATE_COMPLETED: `${PROPERTY_TYPES.DATE_TIME}|${APP_TYPES.PSA_SCORES}`,
  AGE_AT_CURRENT_ARREST: `${PROPERTY_TYPES.AGE_AT_CURRENT_ARREST}|${APP_TYPES.PSA_RISK_FACTORS}`,
  CURRENT_VIOLENT_OFFENSE: `${PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE}|${APP_TYPES.PSA_RISK_FACTORS}`,
  CURRENT_VIOLENT_OFFENSE_NOTES: `${PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG: `${PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PENDING_CHARGE: `${PROPERTY_TYPES.PENDING_CHARGE}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PENDING_CHARGE_NOTES: `${PROPERTY_TYPES.PENDING_CHARGE_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_MISDEMEANOR: `${PROPERTY_TYPES.PRIOR_MISDEMEANOR}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_MISDEMEANOR_NOTES: `${PROPERTY_TYPES.PRIOR_MISDEMEANOR_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_FELONY: `${PROPERTY_TYPES.PRIOR_FELONY}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_FELONY_NOTES: `${PROPERTY_TYPES.PRIOR_FELONY_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_CONVICTION: `${PROPERTY_TYPES.PRIOR_CONVICTION}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_VIOLENT_CONVICTION: `${PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_VIOLENT_CONVICTION_NOTES: `${PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_FAILURE_TO_APPEAR_RECENT: `${PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES: `${PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_FAILURE_TO_APPEAR_OLD: `${PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_FAILURE_TO_APPEAR_OLD_NOTES: `${PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_SENTENCE_TO_INCARCERATION: `${PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION}|${APP_TYPES.PSA_RISK_FACTORS}`,
  PRIOR_SENTENCE_TO_INCARCERATION_NOTES: `${PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_NOTES}|${APP_TYPES.PSA_RISK_FACTORS}`,
  NVCA_FLAG: `${PROPERTY_TYPES.NVCA_FLAG}|${APP_TYPES.PSA_SCORES}`,
  FTA_SCALE: `${PROPERTY_TYPES.FTA_SCALE}|${APP_TYPES.PSA_SCORES}`,
  NCA_SCALE: `${PROPERTY_TYPES.NCA_SCALE}|${APP_TYPES.PSA_SCORES}`,
  RECOMMENDATION: `${PROPERTY_TYPES.RELEASE_RECOMMENDATION}|${APP_TYPES.RELEASE_RECOMMENDATIONS}`,
  EXTRADITED: `${PROPERTY_TYPES.EXTRADITED}|${APP_TYPES.DMF_RISK_FACTORS}`,
  EXTRADITED_NOTES: `${PROPERTY_TYPES.EXTRADITED_NOTES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_STEP_2_CHARGES: `${PROPERTY_TYPES.DMF_STEP_2_CHARGES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_STEP_2_CHARGES_NOTES: `${PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_STEP_4_CHARGES: `${PROPERTY_TYPES.DMF_STEP_4_CHARGES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_STEP_4_CHARGES_NOTES: `${PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_SECONDARY_RELEASE_CHARGES: `${PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_SECONDARY_RELEASE_CHARGES_NOTES: `${PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES_NOTES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_SECONDARY_HOLD_CHARGES: `${PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  DMF_SECONDARY_HOLD_CHARGES_NOTES: `${PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES_NOTES}|${APP_TYPES.DMF_RISK_FACTORS}`,
  COLOR: `${PROPERTY_TYPES.COLOR}|${APP_TYPES.DMF_RESULTS}`,
  RELEASE_TYPE: `${PROPERTY_TYPES.RELEASE_TYPE}|${APP_TYPES.DMF_RESULTS}`,
  CONDITIONS_LEVEL: `${PROPERTY_TYPES.CONDITIONS_LEVEL}|${APP_TYPES.DMF_RESULTS}`,
  CONDITION_1: `${PROPERTY_TYPES.CONDITION_1}|${APP_TYPES.DMF_RESULTS}`,
  CONDITION_2: `${PROPERTY_TYPES.CONDITION_2}|${APP_TYPES.DMF_RESULTS}`,
  CONDITION_3: `${PROPERTY_TYPES.CONDITION_3}|${APP_TYPES.DMF_RESULTS}`,
  LEGACY_JUDGE_OUTCOME: `${PROPERTY_TYPES.OUTCOME}|${APP_TYPES.DMF_RESULTS}`,
  JUDGE_OUTCOME: `${PROPERTY_TYPES.OUTCOME}|${APP_TYPES.OUTCOMES}`,
  BOND: `${PROPERTY_TYPES.BOND_TYPE}|${APP_TYPES.BONDS}`,
  BOND_AMOUNT: `${PROPERTY_TYPES.BOND_AMOUNT}|${APP_TYPES.BONDS}`,
  SURETY_AMOUNT: `${PROPERTY_TYPES.SURETY_AMOUNT}|${APP_TYPES.BONDS}`,
  CONDITION_TYPE: `${PROPERTY_TYPES.TYPE}|${APP_TYPES.RELEASE_CONDITIONS}`,
  START_DATE: `${PROPERTY_TYPES.START_DATE}|${APP_TYPES.RELEASE_CONDITIONS}`,
  FREQUENCY: `${PROPERTY_TYPES.FREQUENCY}|${APP_TYPES.RELEASE_CONDITIONS}`,
  STATUS: `${PROPERTY_TYPES.STATUS}|${APP_TYPES.PSA_SCORES}`,
  STATUS_NOTES: `${PROPERTY_TYPES.STATUS_NOTES}|${APP_TYPES.PSA_SCORES}`,
  FAILURE_REASON: `${PROPERTY_TYPES.FAILURE_REASON}|${APP_TYPES.PSA_SCORES}`,
  COURT_CHARGES: APP_TYPES.CHARGES,
  MANUAL_ARREST_CHARGES: APP_TYPES.MANUAL_CHARGES,
  MANUAL_COURT_CHARGES: APP_TYPES.MANUAL_COURT_CHARGES,
  CHARGES: `${APP_TYPES.MANUAL_COURT_CHARGES}|${APP_TYPES.MANUAL_CHARGES}`
};

export const HEADERS_OBJ = {
  [HEADERS.LAST_NAME]: 'LAST',
  [HEADERS.FIRST_NAME]: 'FIRST',
  [HEADERS.MIDDLE_NAME]: 'MIDDLE',
  [HEADERS.SUFFIX]: 'SUFFIX',
  [HEADERS.SEX]: 'SEX',
  [HEADERS.DOB]: 'DOB',
  [HEADERS.RACE]: 'RACE',
  [HEADERS.ETHNICITY]: 'ETHNICITY',
  [HEADERS.HEIGHT]: 'HEIGHT',
  [HEADERS.WEIGHT]: 'WEIGHT',
  [HEADERS.EYE]: 'EYE',
  [HEADERS.SSN]: 'SSN',
  [HEADERS.ODY_ID]: 'ODY ID#',
  [HEADERS.REFERRED_BY]: 'REFERRED BY',
  [HEADERS.NUM_CHGS_ARREST]: '# CHGS',
  [HEADERS.NUM_CHGS_COURT]: '# CHGS',
  [HEADERS.ARREST_CASE_NO]: 'ARREST CASE NO',
  [HEADERS.ARREST_DATE_ARREST]: 'ARREST_DATE',
  [HEADERS.ARREST_DATE_COURT]: 'ARREST_DATE',
  [HEADERS.PSA_TYPE]: 'PSA TYPE',
  [HEADERS.FILER]: 'FILER',
  [HEADERS.DATE_COMPLETED]: 'DATE COMPLETED',
  [HEADERS.AGE_AT_CURRENT_ARREST]: 'Q1: AGE AT ARREST',
  [HEADERS.CURRENT_VIOLENT_OFFENSE]: 'Q2: CUR VLNT',
  [HEADERS.CURRENT_VIOLENT_OFFENSE_NOTES]: 'Q2 CUR VLNT NOTES',
  [HEADERS.CURRENT_VIOLENT_OFFENSE_AND_YOUNG]: 'Q2A: CUR VLNT + 20<',
  [HEADERS.PENDING_CHARGE]: 'Q3: PNDG CHG',
  [HEADERS.PENDING_CHARGE_NOTES]: 'Q3 PNDG CHG NOTES',
  [HEADERS.PRIOR_MISDEMEANOR]: 'Q4: PRIOR MISD',
  [HEADERS.PRIOR_MISDEMEANOR_NOTES]: 'Q4 PRIOR MISD NOTES',
  [HEADERS.PRIOR_FELONY]: 'Q5: PRIOR FEL',
  [HEADERS.PRIOR_FELONY_NOTES]: 'Q5 PRIOR FEL NOTES',
  [HEADERS.PRIOR_CONVICTION]: 'Q5A:  PRIOR CONV',
  [HEADERS.PRIOR_VIOLENT_CONVICTION]: 'Q6: PRIOR VLT CONV',
  [HEADERS.PRIOR_VIOLENT_CONVICTION_NOTES]: 'Q6 PRIOR VLNT CONV NOTES',
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_RECENT]: 'Q7: FTA < 2 YRS',
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES]: 'Q7 FTA < 2 YRS NTOES',
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_OLD]: 'Q8: FTA > 2 YRS',
  [HEADERS.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES]: 'Q8 FTA > 2 YRS NOTES',
  [HEADERS.PRIOR_SENTENCE_TO_INCARCERATION]: 'Q9: INCARC',
  [HEADERS.PRIOR_SENTENCE_TO_INCARCERATION_NOTES]: 'Q9 INCARC NOTES',
  [HEADERS.NVCA_FLAG]: 'NCVA FLAG',
  [HEADERS.FTA_SCALE]: 'FTA',
  [HEADERS.NCA_SCALE]: 'NCA',
  [HEADERS.RECOMMENDATION]: 'NOTES',
  [HEADERS.EXTRADITED]: 'EXTRADITED',
  [HEADERS.EXTRADITED_NOTES]: 'EXTRADITED NOTES',
  [HEADERS.DMF_STEP_2_CHARGES]: 'STEP 2 CHARGES',
  [HEADERS.DMF_STEP_2_CHARGES_NOTES]: 'STEP 2 NOTES',
  [HEADERS.DMF_STEP_4_CHARGES]: 'STEP 4 CHARGES',
  [HEADERS.DMF_STEP_4_CHARGES_NOTES]: 'STEP 4 NOTES',
  [HEADERS.DMF_SECONDARY_RELEASE_CHARGES]: 'BHE CHARGES',
  [HEADERS.DMF_SECONDARY_RELEASE_CHARGES_NOTES]: 'BHE NOTES',
  [HEADERS.DMF_SECONDARY_HOLD_CHARGES]: 'BRE CHARGES',
  [HEADERS.DMF_SECONDARY_HOLD_CHARGES_NOTES]: 'BRE NOTES',
  [HEADERS.COLOR]: 'PSA COLOR',
  [HEADERS.RELEASE_TYPE]: 'RELEASE TYPE',
  [HEADERS.CONDITIONS_LEVEL]: 'COND LVL',
  [HEADERS.CONDITION_1]: 'REL COND 1',
  [HEADERS.CONDITION_2]: 'REL COND 2',
  [HEADERS.CONDITION_3]: 'REL COND 3',
  [HEADERS.LEGACY_JUDGE_OUTCOME]: 'LEGACY JUDGE OUTCOME',
  [HEADERS.JUDGE_OUTCOME]: 'JUDGE OUTCOME',
  [HEADERS.BOND]: 'BOND TYPE',
  [HEADERS.BOND_AMOUNT]: 'BOND AMOUNT',
  [HEADERS.SURETY_AMOUNT]: 'SURETY AMOUNT',
  [HEADERS.CONDITION_TYPE]: 'JUDGE COND',
  [HEADERS.START_DATE]: 'START DATE',
  [HEADERS.FREQUENCY]: 'FREQUENCY',
  [HEADERS.STATUS]: 'PSA STATUS',
  [HEADERS.STATUS_NOTES]: 'PSA STATUS NOTES',
  [HEADERS.FAILURE_REASON]: 'FAILURE REASON',
  [HEADERS.COURT_CHARGES]: 'COURT CHARGES',
  [HEADERS.MANUAL_ARREST_CHARGES]: 'ARREST CHARGES',
  [HEADERS.MANUAL_COURT_CHARGES]: 'COURT CHARGES',
  [HEADERS.CHARGES]: 'CHARGES',
};

export const POSITIONS = Object.values(HEADERS_OBJ);
