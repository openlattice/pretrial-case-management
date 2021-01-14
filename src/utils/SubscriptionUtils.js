import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { getEntityProperties } from './DataUtils';

const { CONTACT_INFORMATION, SUBSCRIPTION } = APP_TYPES;

const { IS_ACTIVE, IS_PREFERRED } = PROPERTY_TYPES;

// eslint-disable-next-line
export const personIsReceivingReminders = (personNeighbors) => {
  let hasPreferredContact = false;
  let hasASubscription = false;
  personNeighbors.entrySeq().forEach(([appTypeFqn, neighbors]) => {
    if (appTypeFqn === SUBSCRIPTION) {
      const subscription = neighbors;
      const { [IS_ACTIVE]: isActive } = getEntityProperties(subscription, [IS_ACTIVE]);
      if (isActive) hasASubscription = true;
    }
    if (appTypeFqn === CONTACT_INFORMATION) {
      const contacts = neighbors;
      contacts.forEach((contact) => {
        const { [IS_PREFERRED]: isPreferred } = getEntityProperties(contact, [IS_PREFERRED]);
        if (isPreferred) hasPreferredContact = true;
      });
    }
  });
  return hasPreferredContact && hasASubscription;
};
