import { ALIASES, PERSON_CONFIG } from './ConfigConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const SubscriptionConfig = {
  entitySets: [
    PERSON_CONFIG,
    {
      name: APP_TYPES_FQNS.SUBSCRIPTION,
      alias: ALIASES.SUBSCRIPTION,
      entityId: PROPERTY_TYPES.SUBSCRIPTION_ID,
      fields: {
        [PROPERTY_TYPES.SUBSCRIPTION_ID]: PROPERTY_TYPES.SUBSCRIPTION_ID,
        [PROPERTY_TYPES.IS_ACTIVE]: PROPERTY_TYPES.IS_ACTIVE,
        [PROPERTY_TYPES.DAY_INTERVAL]: PROPERTY_TYPES.DAY_INTERVAL,
        [PROPERTY_TYPES.WEEK_INTERVAL]: PROPERTY_TYPES.WEEK_INTERVAL
      }
    },
    {
      name: APP_TYPES_FQNS.REGISTERED_FOR,
      alias: ALIASES.REGISTERED_FOR,
      fields: {
        [PROPERTY_TYPES.COMPLETED_DATE_TIME]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    }
  ],
  associations: [
    {
      src: ALIASES.PERSON,
      dst: ALIASES.SUBSCRIPTION,
      association: ALIASES.REGISTERED_FOR
    }
  ]
};

export default SubscriptionConfig;
