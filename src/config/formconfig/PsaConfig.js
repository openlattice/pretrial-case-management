import { ALIASES } from './ConfigConsts';
import { PSA, NOTES, ID_FIELD_NAMES, ID_FIELDS } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

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
        [NOTES[PSA.AGE_AT_CURRENT_ARREST]]: PROPERTY_TYPES.AGE_AT_CURRENT_ARREST_NOTES,
        [NOTES[PSA.CURRENT_VIOLENT_OFFENSE]]: PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_NOTES,
        [NOTES[PSA.PENDING_CHARGE]]: PROPERTY_TYPES.PENDING_CHARGE_NOTES,
        [NOTES[PSA.PRIOR_MISDEMEANOR]]: PROPERTY_TYPES.PRIOR_MISDEMEANOR_NOTES,
        [NOTES[PSA.PRIOR_FELONY]]: PROPERTY_TYPES.PRIOR_FELONY_NOTES,
        [NOTES[PSA.PRIOR_VIOLENT_CONVICTION]]: PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_NOTES,
        [NOTES[PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]]: PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES,
        [NOTES[PSA.PRIOR_FAILURE_TO_APPEAR_OLD]]: PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES,
        [NOTES[PSA.PRIOR_SENTENCE_TO_INCARCERATION]]: PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_NOTES
      }
    },
    {
      name: ENTITY_SETS.RELEASE_RECOMMENDATIONS,
      alias: ALIASES.NOTES,
      entityId: PSA.NOTES,
      fields: {
        [ID_FIELD_NAMES.NOTES_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PSA.NOTES]: PROPERTY_TYPES.RELEASE_RECOMMENDATION
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
      name: ENTITY_SETS.PRETRIAL_CASES,
      alias: ALIASES.CASE,
      entityId: ID_FIELD_NAMES.CASE_ID,
      fields: {
        [ID_FIELD_NAMES.CASE_ID]: PROPERTY_TYPES.CASE_ID
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
      dst: ALIASES.CASE,
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
      src: ALIASES.NOTES,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    }
  ]
};

export default psaConfig;
