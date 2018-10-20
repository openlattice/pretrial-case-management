import { ALIASES, PERSON_CONFIG, PSA_CONFIG } from './ConfigConsts';
import { ID_FIELD_NAMES, HEARING } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const psaHearingConfig = {
  entitySets: [
    PERSON_CONFIG,
    PSA_CONFIG,
    {
      name: ENTITY_SETS.HEARINGS,
      alias: ALIASES.HEARING,
      entityId: ID_FIELD_NAMES.HEARING_ID,
      fields: {
        [ID_FIELD_NAMES.HEARING_ID]: PROPERTY_TYPES.CASE_ID,
        [HEARING.DATE_TIME]: PROPERTY_TYPES.DATE_TIME,
        [HEARING.COURTROOM]: PROPERTY_TYPES.COURTROOM,
        [PROPERTY_TYPES.HEARING_TYPE]: PROPERTY_TYPES.HEARING_TYPE,
        [PROPERTY_TYPES.HEARING_COMMENTS]: PROPERTY_TYPES.HEARING_COMMENTS
      }
    },
    {
      name: ENTITY_SETS.MIN_PEN_PEOPLE,
      alias: ALIASES.JUDGE,
      fields: {
        [ID_FIELD_NAMES.JUDGE_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      name: ENTITY_SETS.APPEARS_IN,
      alias: ALIASES.APPEARS_IN,
      fields: {
        [ID_FIELD_NAMES.HEARING_ID]: PROPERTY_TYPES.STRING_ID
      }
    },
    {
      name: ENTITY_SETS.ASSESSED_BY,
      alias: ALIASES.ASSESSED_BY_JUDGE,
      fields: {
        [ID_FIELD_NAMES.TIMESTAMP]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    }
  ],
  associations: [
    {
      src: ALIASES.PERSON,
      dst: ALIASES.HEARING,
      association: ALIASES.APPEARS_IN
    },
    {
      src: ALIASES.PSA,
      dst: ALIASES.HEARING,
      association: ALIASES.APPEARS_IN
    },
    // _____ assessed by judge
    {
      src: ALIASES.JUDGE,
      dst: ALIASES.HEARING,
      association: ALIASES.ASSESSED_BY_JUDGE
    }
  ]
};

export default psaHearingConfig;
