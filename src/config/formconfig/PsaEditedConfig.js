import { ALIASES } from './ConfigConsts';
import { EDIT_FIELDS } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const psaEditedConfig = {
  entitySets: [
    {
      name: ENTITY_SETS.PSA_SCORES,
      alias: ALIASES.PSA,
      entityId: EDIT_FIELDS.PSA_ID,
      fields: {
        [EDIT_FIELDS.PSA_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: ENTITY_SETS.PSA_RISK_FACTORS,
      alias: ALIASES.RISK_FACTORS,
      entityId: EDIT_FIELDS.RISK_FACTORS_ID,
      fields: {
        [EDIT_FIELDS.RISK_FACTORS_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: ENTITY_SETS.STAFF,
      alias: ALIASES.STAFF,
      fields: {
        [EDIT_FIELDS.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      name: ENTITY_SETS.EDITED_BY,
      alias: ALIASES.EDITED_BY,
      fields: {
        [EDIT_FIELDS.TIMESTAMP]: PROPERTY_TYPES.DATE_TIME
      }
    }
  ],
  associations: [
    {
      src: ALIASES.PSA,
      dst: ALIASES.STAFF,
      association: ALIASES.EDITED_BY
    },
    {
      src: ALIASES.RISK_FACTORS,
      dst: ALIASES.STAFF,
      association: ALIASES.EDITED_BY
    }
  ]
};

export default psaEditedConfig;
