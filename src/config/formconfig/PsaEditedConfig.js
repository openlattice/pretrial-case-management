import { ALIASES } from './ConfigConsts';
import { EDIT_FIELDS } from '../../utils/consts/Consts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const psaEditedConfig = {
  entitySets: [
    {
      name: APP_TYPES_FQNS.PSA_SCORES,
      alias: ALIASES.PSA,
      entityId: EDIT_FIELDS.PSA_ID,
      fields: {
        [EDIT_FIELDS.PSA_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.DMF_RESULTS,
      alias: ALIASES.DMF,
      entityId: EDIT_FIELDS.DMF_ID,
      fields: {
        [EDIT_FIELDS.DMF_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.DMF_RISK_FACTORS,
      alias: ALIASES.DMF_RISK_FACTORS,
      entityId: EDIT_FIELDS.DMF_RISK_FACTORS_ID,
      fields: {
        [EDIT_FIELDS.DMF_RISK_FACTORS_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.PSA_RISK_FACTORS,
      alias: ALIASES.RISK_FACTORS,
      entityId: EDIT_FIELDS.RISK_FACTORS_ID,
      fields: {
        [EDIT_FIELDS.RISK_FACTORS_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.RELEASE_RECOMMENDATIONS,
      alias: ALIASES.NOTES,
      entityId: EDIT_FIELDS.NOTES_ID,
      fields: {
        [EDIT_FIELDS.NOTES_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.STAFF,
      alias: ALIASES.STAFF,
      fields: {
        [EDIT_FIELDS.PERSON_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      name: APP_TYPES_FQNS.EDITED_BY,
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
    },
    {
      src: ALIASES.DMF,
      dst: ALIASES.STAFF,
      association: ALIASES.EDITED_BY
    },
    {
      src: ALIASES.DMF_RISK_FACTORS,
      dst: ALIASES.STAFF,
      association: ALIASES.EDITED_BY
    }
  ]
};

export default psaEditedConfig;
