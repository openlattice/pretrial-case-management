import { ALIASES, PSA_CONFIG } from './ConfigConsts';
import { ID_FIELD_NAMES } from '../../utils/consts/Consts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const courtCaseForPSAConfig = {
  entitySets: [
    PSA_CONFIG,
    {
      name: APP_TYPES_FQNS.PRETRIAL_CASES,
      alias: ALIASES.CASE,
      entityId: ID_FIELD_NAMES.CASE_ID,
      fields: {
        [ID_FIELD_NAMES.CASE_ID]: PROPERTY_TYPES.CASE_ID
      }
    },
    {
      name: APP_TYPES_FQNS.CALCULATED_FOR,
      alias: ALIASES.CALCULATED_FOR,
      fields: {
        [PROPERTY_TYPES.TIMESTAMP]: PROPERTY_TYPES.TIMESTAMP
      }
    }
  ],
  associations: [
    {
      src: ALIASES.PSA,
      dst: ALIASES.CASE,
      association: ALIASES.CALCULATED_FOR
    }
  ]
};

export default courtCaseForPSAConfig;
