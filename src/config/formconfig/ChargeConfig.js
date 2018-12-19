import { ALIASES } from './ConfigConsts';
import { APP_TYPES_FQNS, CHARGE_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST
} = APP_TYPES_FQNS;

export const arrestChargeConfig = () => (
  {
    entitySets: [
      {
        name: ARREST_CHARGE_LIST,
        alias: ALIASES.CHARGE,
        fields: {
          [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: CHARGE_FQNS.STATUTE,
          [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: CHARGE_FQNS.DESCRIPTION,
          [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: CHARGE_FQNS.VIOLENT,
          [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: CHARGE_FQNS.DEGREE,
          [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: CHARGE_FQNS.LEVEL,
          [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: CHARGE_FQNS.STEP_2,
          [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: CHARGE_FQNS.STEP_4,
          [PROPERTY_TYPES.BHE]: CHARGE_FQNS.BHE,
          [PROPERTY_TYPES.BRE]: CHARGE_FQNS.BRE
        }
      }
    ],
    associations: []
  }
);

export const courtChargeConfig = () => (
  {
    entitySets: [
      {
        name: COURT_CHARGE_LIST,
        alias: ALIASES.CHARGE,
        fields: {
          [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: CHARGE_FQNS.STATUTE,
          [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: CHARGE_FQNS.DESCRIPTION,
          [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: CHARGE_FQNS.VIOLENT
        }
      }
    ],
    associations: []
  }
);
