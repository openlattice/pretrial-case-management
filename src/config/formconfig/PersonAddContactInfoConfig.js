/*
 * @flow
 */

import { ALIASES, PERSON_CONFIG } from './ConfigConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const addPersonContactInfoConfig = {
  entitySets: [
    PERSON_CONFIG,
    {
      alias: ALIASES.CONTACT_INFO,
      name: ENTITY_SETS.CONTACT_INFORMATION,
      fields: {
        [PROPERTY_TYPES.GENERAL_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.EMAIL]: PROPERTY_TYPES.EMAIL,
        [PROPERTY_TYPES.PHONE]: PROPERTY_TYPES.PHONE,
        [PROPERTY_TYPES.IS_MOBILE]: PROPERTY_TYPES.IS_MOBILE
      }
    },
    {
      alias: ALIASES.CONTACT_GIVEN_FOR,
      name: ENTITY_SETS.CONTACT_INFO_GIVEN,
      fields: {
        [PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID]: PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID
      }
    }
  ],
  associations: [
    {
      src: ALIASES.PERSON,
      dst: ALIASES.CONTACT_INFO,
      association: ALIASES.CONTACT_GIVEN_FOR
    }
  ]
};

export default addPersonContactInfoConfig;
