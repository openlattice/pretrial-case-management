import { ALIASES } from './ConfigConsts';
import { RESULT_CATEGORIES } from '../../utils/consts/DMFResultConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  PSA,
  DMF,
  NOTES,
  ID_FIELD_NAMES
} from '../../utils/consts/Consts';

const psaConfig = {
  entitySets: [
    {
      name: ENTITY_SETS.PSA_SCORES,
      alias: ALIASES.PSA,
      entityId: ID_FIELD_NAMES.PSA_ID,
      fields: {
        [PROPERTY_TYPES.NVCA_FLAG]: PROPERTY_TYPES.NVCA_FLAG,
        [PROPERTY_TYPES.NCA_SCALE]: PROPERTY_TYPES.NCA_SCALE,
        [PROPERTY_TYPES.FTA_SCALE]: PROPERTY_TYPES.FTA_SCALE,
        [PROPERTY_TYPES.STATUS]: PROPERTY_TYPES.STATUS,
        [ID_FIELD_NAMES.TIMESTAMP]: PROPERTY_TYPES.DATE_TIME,
        [ID_FIELD_NAMES.PSA_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: ENTITY_SETS.PSA_RISK_FACTORS,
      alias: ALIASES.RISK_FACTORS,
      entityId: ID_FIELD_NAMES.RISK_FACTORS_ID,
      fields: {
        [ID_FIELD_NAMES.RISK_FACTORS_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.AGE_AT_CURRENT_ARREST]: PROPERTY_TYPES.AGE_AT_CURRENT_ARREST,
        [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE]: PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE,
        [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG]: PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG,
        [PROPERTY_TYPES.PENDING_CHARGE]: PROPERTY_TYPES.PENDING_CHARGE,
        [PROPERTY_TYPES.PRIOR_MISDEMEANOR]: PROPERTY_TYPES.PRIOR_MISDEMEANOR,
        [PROPERTY_TYPES.PRIOR_FELONY]: PROPERTY_TYPES.PRIOR_FELONY,
        [PROPERTY_TYPES.PRIOR_CONVICTION]: PROPERTY_TYPES.PRIOR_CONVICTION,
        [PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION]: PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION,
        [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT]: PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT,
        [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD]: PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD,
        [PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION]: PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION,

        // notes
        [PROPERTY_TYPES.AGE_AT_CURRENT_ARREST_NOTES]: PROPERTY_TYPES.AGE_AT_CURRENT_ARREST_NOTES,
        [PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_NOTES]: PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_NOTES,
        [PROPERTY_TYPES.PENDING_CHARGE_NOTES]: PROPERTY_TYPES.PENDING_CHARGE_NOTES,
        [PROPERTY_TYPES.PRIOR_MISDEMEANOR_NOTES]: PROPERTY_TYPES.PRIOR_MISDEMEANOR_NOTES,
        [PROPERTY_TYPES.PRIOR_FELONY_NOTES]: PROPERTY_TYPES.PRIOR_FELONY_NOTES,
        [PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_NOTES]: PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_NOTES,
        [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES]: PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES,
        [PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES]: PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES,
        [PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_NOTES]: PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_NOTES
      }
    },
    {
      name: ENTITY_SETS.RELEASE_RECOMMENDATIONS,
      alias: ALIASES.NOTES,
      entityId: ID_FIELD_NAMES.NOTES_ID,
      fields: {
        [ID_FIELD_NAMES.NOTES_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PSA.NOTES]: PROPERTY_TYPES.RELEASE_RECOMMENDATION
      }
    },
    {
      name: ENTITY_SETS.DMF_RISK_FACTORS,
      alias: ALIASES.DMF_RISK_FACTORS,
      entityId: ID_FIELD_NAMES.DMF_RISK_FACTORS_ID,
      fields: {
        [ID_FIELD_NAMES.DMF_RISK_FACTORS_ID]: PROPERTY_TYPES.GENERAL_ID,
        [DMF.EXTRADITED]: PROPERTY_TYPES.EXTRADITED,
        [NOTES[DMF.EXTRADITED]]: PROPERTY_TYPES.EXTRADITED_NOTES,
        [DMF.STEP_2_CHARGES]: PROPERTY_TYPES.DMF_STEP_2_CHARGES,
        [NOTES[DMF.STEP_2_CHARGES]]: PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES,
        [DMF.STEP_4_CHARGES]: PROPERTY_TYPES.DMF_STEP_4_CHARGES,
        [NOTES[DMF.STEP_4_CHARGES]]: PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES,
        [DMF.COURT_OR_BOOKING]: PROPERTY_TYPES.CONTEXT,
        [DMF.SECONDARY_RELEASE_CHARGES]: PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES,
        [NOTES[DMF.SECONDARY_RELEASE_CHARGES]]: PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES,
        [DMF.SECONDARY_HOLD_CHARGES]: PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES,
        [NOTES[DMF.SECONDARY_HOLD_CHARGES]]: PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES
      }
    },
    {
      name: ENTITY_SETS.DMF_RESULTS,
      alias: ALIASES.DMF,
      entityId: ID_FIELD_NAMES.DMF_ID,
      fields: {
        [ID_FIELD_NAMES.DMF_ID]: PROPERTY_TYPES.GENERAL_ID,
        [RESULT_CATEGORIES.COLOR]: PROPERTY_TYPES.COLOR,
        [RESULT_CATEGORIES.RELEASE_TYPE]: PROPERTY_TYPES.RELEASE_TYPE,
        [RESULT_CATEGORIES.CONDITIONS_LEVEL]: PROPERTY_TYPES.CONDITIONS_LEVEL,
        [RESULT_CATEGORIES.CONDITION_1]: PROPERTY_TYPES.CONDITION_1,
        [RESULT_CATEGORIES.CONDITION_2]: PROPERTY_TYPES.CONDITION_2,
        [RESULT_CATEGORIES.CONDITION_3]: PROPERTY_TYPES.CONDITION_3
      }
    },
    {
      name: ENTITY_SETS.STAFF,
      alias: ALIASES.STAFF,
      fields: {
        [ID_FIELD_NAMES.STAFF_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      name: ENTITY_SETS.PEOPLE,
      alias: ALIASES.PERSON,
      fields: {
        [ID_FIELD_NAMES.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      name: ENTITY_SETS.ARREST_CASES,
      alias: ALIASES.CASE,
      entityId: ID_FIELD_NAMES.ARREST_ID,
      fields: {
        [ID_FIELD_NAMES.ARREST_ID]: PROPERTY_TYPES.CASE_ID
      }
    },
    {
      name: ENTITY_SETS.CALCULATED_FOR,
      alias: ALIASES.CALCULATED_FOR,
      fields: {
        [ID_FIELD_NAMES.TIMESTAMP]: PROPERTY_TYPES.TIMESTAMP
      }
    },
    {
      name: ENTITY_SETS.ASSESSED_BY,
      alias: ALIASES.ASSESSED_BY,
      fields: {
        [ID_FIELD_NAMES.TIMESTAMP]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    },
    // manual entry setup
    {
      name: ENTITY_SETS.MANUAL_PRETRIAL_CASES,
      alias: ALIASES.MANUAL_CASE,
      entityId: PROPERTY_TYPES.CASE_ID,
      fields: {
        [PROPERTY_TYPES.CASE_ID]: PROPERTY_TYPES.CASE_ID,
        [PROPERTY_TYPES.CASE_DISPOSITION_DATE]: PROPERTY_TYPES.CASE_DISPOSITION_DATE,
        [PROPERTY_TYPES.ARREST_DATE_TIME]: PROPERTY_TYPES.ARREST_DATE_TIME,
        [PROPERTY_TYPES.FILE_DATE]: PROPERTY_TYPES.FILE_DATE,
        [PROPERTY_TYPES.NUMBER_OF_CHARGES]: PROPERTY_TYPES.NUMBER_OF_CHARGES
      }
    },
    {
      name: ENTITY_SETS.MANUAL_CHARGES,
      alias: ALIASES.MANUAL_CHARGES,
      multipleValuesField: 'charges',
      fields: {
        [PROPERTY_TYPES.CHARGE_ID]: PROPERTY_TYPES.CHARGE_ID,
        [PROPERTY_TYPES.CHARGE_LEVEL]: PROPERTY_TYPES.CHARGE_LEVEL,
        [PROPERTY_TYPES.CHARGE_DEGREE]: PROPERTY_TYPES.CHARGE_DEGREE,
        [PROPERTY_TYPES.CHARGE_STATUTE]: PROPERTY_TYPES.CHARGE_STATUTE,
        [PROPERTY_TYPES.CHARGE_DESCRIPTION]: PROPERTY_TYPES.CHARGE_DESCRIPTION,
        [PROPERTY_TYPES.QUALIFIER]: PROPERTY_TYPES.QUALIFIER,
        [PROPERTY_TYPES.NUMBER_OF_COUNTS]: PROPERTY_TYPES.NUMBER_OF_COUNTS
      }
    },
    {
      name: ENTITY_SETS.CHARGED_WITH,
      alias: ALIASES.CHARGED_WITH,
      fields: {
        [PROPERTY_TYPES.CASE_ID]: PROPERTY_TYPES.STRING_ID
      }
    },
    {
      name: ENTITY_SETS.APPEARS_IN,
      alias: ALIASES.APPEARS_IN,
      fields: {
        [PROPERTY_TYPES.CASE_ID]: PROPERTY_TYPES.STRING_ID
      }
    }
  ],
  associations: [
    // PSA Scores calculated for _____
    {
      src: ALIASES.PSA,
      dst: ALIASES.PERSON,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.PSA,
      dst: ALIASES.RISK_FACTORS,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.PSA,
      dst: ALIASES.DMF_RISK_FACTORS,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.PSA,
      dst: ALIASES.CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.PSA,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.CALCULATED_FOR
    },

    // Risk Factors calculated for _____
    {
      src: ALIASES.RISK_FACTORS,
      dst: ALIASES.PERSON,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.RISK_FACTORS,
      dst: ALIASES.CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.RISK_FACTORS,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.CALCULATED_FOR
    },

    // Notes calculated for _____
    {
      src: ALIASES.NOTES,
      dst: ALIASES.PERSON,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.NOTES,
      dst: ALIASES.RISK_FACTORS,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.NOTES,
      dst: ALIASES.CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.NOTES,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.NOTES,
      dst: ALIASES.PSA,
      association: ALIASES.CALCULATED_FOR
    },

    // DMF Risk Factors calculated for _____
    {
      src: ALIASES.DMF_RISK_FACTORS,
      dst: ALIASES.PERSON,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.DMF_RISK_FACTORS,
      dst: ALIASES.CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.DMF_RISK_FACTORS,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.CALCULATED_FOR
    },

    // DMF calculated for _____
    {
      src: ALIASES.DMF,
      dst: ALIASES.PERSON,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.DMF,
      dst: ALIASES.DMF_RISK_FACTORS,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.DMF,
      dst: ALIASES.CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.DMF,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.CALCULATED_FOR
    },
    {
      src: ALIASES.DMF,
      dst: ALIASES.PSA,
      association: ALIASES.CALCULATED_FOR
    },

    // _____ assessed by staff
    {
      src: ALIASES.PSA,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    },
    {
      src: ALIASES.RISK_FACTORS,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    },
    {
      src: ALIASES.DMF,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    },
    {
      src: ALIASES.DMF_RISK_FACTORS,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    },
    {
      src: ALIASES.NOTES,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    },

    // manual cases -> manual charges
    {
      src: ALIASES.MANUAL_CHARGES,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.APPEARS_IN
    },
    {
      src: ALIASES.PERSON,
      dst: ALIASES.MANUAL_CASE,
      association: ALIASES.APPEARS_IN
    },
    {
      src: ALIASES.PERSON,
      dst: ALIASES.MANUAL_CHARGES,
      association: ALIASES.CHARGED_WITH
    }
  ]
};

export default psaConfig;
