import { ALIASES, PERSON_CONFIG } from './ConfigConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { ID_FIELD_NAMES, LIST_FIELDS } from '../../utils/consts/Consts';

const releaseConditionsConfig = {
  entitySets: [
    PERSON_CONFIG,
    {
      name: APP_TYPES_FQNS.DMF_RESULTS,
      alias: ALIASES.DMF,
      entityId: ID_FIELD_NAMES.DMF_ID,
      fields: {
        [ID_FIELD_NAMES.DMF_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.OTHER_TEXT]: PROPERTY_TYPES.OTHER_TEXT
      }
    },
    {
      name: APP_TYPES_FQNS.PSA_SCORES,
      alias: ALIASES.PSA,
      entityId: ID_FIELD_NAMES.PSA_ID,
      fields: {
        [ID_FIELD_NAMES.PSA_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.HEARINGS,
      alias: ALIASES.HEARING,
      entityId: ID_FIELD_NAMES.HEARING_ID,
      fields: {
        [ID_FIELD_NAMES.HEARING_ID]: PROPERTY_TYPES.CASE_ID
      }
    },
    {
      name: APP_TYPES_FQNS.OUTCOMES,
      alias: ALIASES.OUTCOME,
      entityId: ID_FIELD_NAMES.OUTCOME_ID,
      fields: {
        [PROPERTY_TYPES.APPEARED]: PROPERTY_TYPES.APPEARED,
        [PROPERTY_TYPES.JUDGE_ACCEPTED]: PROPERTY_TYPES.JUDGE_ACCEPTED,
        [PROPERTY_TYPES.OUTCOME]: PROPERTY_TYPES.OUTCOME,
        [ID_FIELD_NAMES.OUTCOME_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.OTHER_TEXT]: PROPERTY_TYPES.OTHER_TEXT,
        [PROPERTY_TYPES.RELEASE_TYPE]: PROPERTY_TYPES.RELEASE_TYPE
      }
    },
    {
      name: APP_TYPES_FQNS.BONDS,
      alias: ALIASES.BOND,
      entityId: ID_FIELD_NAMES.BOND_ID,
      fields: {
        [ID_FIELD_NAMES.BOND_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.BOND_TYPE]: PROPERTY_TYPES.BOND_TYPE,
        [PROPERTY_TYPES.BOND_AMOUNT]: PROPERTY_TYPES.BOND_AMOUNT
      }
    },
    {
      name: APP_TYPES_FQNS.RELEASE_CONDITIONS,
      alias: ALIASES.RELEASE_CONDITION,
      entityId: PROPERTY_TYPES.GENERAL_ID,
      multipleValuesField: LIST_FIELDS.RELEASE_CONDITIONS_FIELD,
      fields: {
        [PROPERTY_TYPES.GENERAL_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.CONDITION_TYPE]: PROPERTY_TYPES.CONDITION_TYPE,
        [PROPERTY_TYPES.FREQUENCY]: PROPERTY_TYPES.FREQUENCY,
        [PROPERTY_TYPES.OTHER_TEXT]: PROPERTY_TYPES.OTHER_TEXT,
        [PROPERTY_TYPES.PLAN_TYPE]: PROPERTY_TYPES.PLAN_TYPE,
        [PROPERTY_TYPES.PERSON_NAME]: PROPERTY_TYPES.PERSON_NAME,
        [PROPERTY_TYPES.PERSON_TYPE]: PROPERTY_TYPES.PERSON_TYPE,
        [PROPERTY_TYPES.START_DATE]: PROPERTY_TYPES.START_DATE
      }
    },
    {
      name: APP_TYPES_FQNS.REGISTERED_FOR,
      alias: ALIASES.REGISTERED_FOR,
      fields: {
        [PROPERTY_TYPES.COMPLETED_DATE_TIME]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    },
    {
      name: APP_TYPES_FQNS.REGISTERED_FOR,
      alias: ALIASES.REGISTERED_FOR_THREE,
      fields: {
        outcomedate: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    },
    {
      name: APP_TYPES_FQNS.REGISTERED_FOR,
      alias: ALIASES.REGISTERED_FOR_TWO,
      fields: {
        bonddate: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    }
  ],
  associations: [
    // Bond registered for _____
    {
      src: ALIASES.BOND,
      dst: ALIASES.PERSON,
      association: ALIASES.REGISTERED_FOR_TWO
    },
    {
      src: ALIASES.BOND,
      dst: ALIASES.DMF,
      association: ALIASES.REGISTERED_FOR_TWO
    },
    {
      src: ALIASES.BOND,
      dst: ALIASES.PSA,
      association: ALIASES.REGISTERED_FOR_TWO
    },
    {
      src: ALIASES.BOND,
      dst: ALIASES.HEARING,
      association: ALIASES.REGISTERED_FOR_TWO
    },

    // Outcome registered for _____
    {
      src: ALIASES.OUTCOME,
      dst: ALIASES.PERSON,
      association: ALIASES.REGISTERED_FOR_THREE
    },
    {
      src: ALIASES.OUTCOME,
      dst: ALIASES.DMF,
      association: ALIASES.REGISTERED_FOR_THREE
    },
    {
      src: ALIASES.OUTCOME,
      dst: ALIASES.PSA,
      association: ALIASES.REGISTERED_FOR_THREE
    },
    {
      src: ALIASES.OUTCOME,
      dst: ALIASES.HEARING,
      association: ALIASES.REGISTERED_FOR_THREE
    },

    // Release conditions registered for _____
    {
      src: ALIASES.RELEASE_CONDITION,
      dst: ALIASES.PERSON,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.RELEASE_CONDITION,
      dst: ALIASES.DMF,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.RELEASE_CONDITION,
      dst: ALIASES.PSA,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.RELEASE_CONDITION,
      dst: ALIASES.OUTCOME,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.RELEASE_CONDITION,
      dst: ALIASES.BOND,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.RELEASE_CONDITION,
      dst: ALIASES.HEARING,
      association: ALIASES.REGISTERED_FOR
    }
  ]
};

export default releaseConditionsConfig;
