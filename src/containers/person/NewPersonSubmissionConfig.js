/*
 * @flow
 */

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { ALIASES } from '../../config/formconfig/ConfigConsts';

export const ADDRESS_VALUE :'addressValue' = 'addressValue';
export const CITY_VALUE :'cityValue' = 'cityValue';
export const COUNTRY_VALUE :'countryValue' = 'countryValue';
export const DOB_VALUE :'dobValue' = 'dobValue';
export const FIRST_NAME_VALUE :'firstNameValue' = 'firstNameValue';
export const GENDER_VALUE :'genderValue' = 'genderValue';
export const ID_VALUE :'idValue' = 'idValue';
export const LAST_NAME_VALUE :'lastNameValue' = 'lastNameValue';
export const LIVES_AT_ID_VALUE :'livesAtId' = 'livesAtId';
export const MIDDLE_NAME_VALUE :'middleNameValue' = 'middleNameValue';
export const PICTURE_VALUE :'pictureValue' = 'pictureValue';
export const SSN_VALUE :'ssnValue' = 'ssnValue';
export const STATE_VALUE :'stateValue' = 'stateValue';
export const ZIP_VALUE :'zipValue' = 'zipValue';

export const newPersonSubmissionConfig = {
  entitySets: [
    {
      alias: ALIASES.PERSON,
      name: ENTITY_SETS.PEOPLE,
      fields: {
        [DOB_VALUE]: PROPERTY_TYPES.DOB,
        [FIRST_NAME_VALUE]: PROPERTY_TYPES.FIRST_NAME,
        [GENDER_VALUE]: PROPERTY_TYPES.SEX,
        [ID_VALUE]: PROPERTY_TYPES.PERSON_ID,
        [LAST_NAME_VALUE]: PROPERTY_TYPES.LAST_NAME,
        [MIDDLE_NAME_VALUE]: PROPERTY_TYPES.MIDDLE_NAME,
        [PICTURE_VALUE]: PROPERTY_TYPES.PICTURE,
        [SSN_VALUE]: PROPERTY_TYPES.SSN
      }
    },
    {
      alias: ALIASES.PERSON_ADDRESSES,
      name: ENTITY_SETS.ADDRESSES,
      fields: {
        [ADDRESS_VALUE]: PROPERTY_TYPES.ADDRESS,
        [CITY_VALUE]: PROPERTY_TYPES.CITY,
        [STATE_VALUE]: PROPERTY_TYPES.STATE,
        [ZIP_VALUE]: PROPERTY_TYPES.ZIP
      }
    },
    {
      alias: ALIASES.LIVES_AT,
      name: ENTITY_SETS.LIVES_AT,
      fields: {
        [LIVES_AT_ID_VALUE]: PROPERTY_TYPES.STRING_ID
      }
    },
    {
      alias: ALIASES.GETS_MAIL_AT,
      name: ENTITY_SETS.GETS_MAIL_AT,
      fields: {
        [ID_VALUE]: PROPERTY_TYPES.PERSON_ID,
        [LIVES_AT_ID_VALUE]: PROPERTY_TYPES.STRING_ID
      }
    }
  ],
  associations: [
    {
      src: ALIASES.PERSON,
      dst: ALIASES.PERSON_ADDRESSES,
      association: ALIASES.LIVES_AT
    },
    {
      src: ALIASES.PERSON,
      dst: ALIASES.PERSON_ADDRESSES,
      association: ALIASES.GETS_MAIL_AT
    }
  ]
};
