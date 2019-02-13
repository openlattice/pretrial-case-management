/*
 * @flow
 */

import { ALIASES, PERSON_CONFIG } from './ConfigConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const addPersonContactInfoConfig = {
  entitySets: [
    PERSON_CONFIG,
    {
      alias: ALIASES.CONTACT_INFO,
      name: APP_TYPES_FQNS.CONTACT_INFORMATION,
      fields: {
        [PROPERTY_TYPES.GENERAL_ID]: PROPERTY_TYPES.GENERAL_ID,
        [PROPERTY_TYPES.EMAIL]: PROPERTY_TYPES.EMAIL,
        [PROPERTY_TYPES.PHONE]: PROPERTY_TYPES.PHONE,
        [PROPERTY_TYPES.IS_MOBILE]: PROPERTY_TYPES.IS_MOBILE,
        [PROPERTY_TYPES.IS_PREFERRED]: PROPERTY_TYPES.IS_PREFERRED
      }
    },
    {
      alias: ALIASES.CONTACT_GIVEN_FOR,
      name: APP_TYPES_FQNS.CONTACT_INFO_GIVEN,
      fields: {
        [PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID]: PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID
      }
    }
  ],
  associations: [
    {
      src: ALIASES.CONTACT_INFO,
      dst: ALIASES.PERSON,
      association: ALIASES.CONTACT_GIVEN_FOR
    }
  ]
};

export default addPersonContactInfoConfig;
