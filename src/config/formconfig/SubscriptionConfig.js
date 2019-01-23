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
      name: APP_TYPES_FQNS.APPEARS_IN,
      alias: ALIASES.APPEARS_IN,
      fields: {
        [PROPERTY_TYPES.SUBSCRIPTION_ID]: PROPERTY_TYPES.SUBSCRIPTION_ID
      }
    }
  ],
  associations: [
    {
      src: ALIASES.SUBSCRIPTION,
      dst: ALIASES.PERSON,
      association: ALIASES.APPEARS_IN
    }
  ]
};

export default SubscriptionConfig;
