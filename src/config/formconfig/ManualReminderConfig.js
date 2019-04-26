import { ALIASES, PERSON_CONFIG } from './ConfigConsts';
import { FORM_IDS } from '../../utils/consts/Consts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const ManualReminderConfig = {
  entitySets: [
    PERSON_CONFIG,
    {
      name: APP_TYPES_FQNS.MANUAL_REMINDERS,
      alias: ALIASES.REMINDER,
      entityId: PROPERTY_TYPES.REMINDER_ID,
      fields: {
        [PROPERTY_TYPES.CONTACT_METHOD]: PROPERTY_TYPES.CONTACT_METHOD,
        [PROPERTY_TYPES.DATE_TIME]: PROPERTY_TYPES.DATE_TIME,
        [PROPERTY_TYPES.NOTIFIED]: PROPERTY_TYPES.NOTIFIED,
        [PROPERTY_TYPES.REMINDER_ID]: PROPERTY_TYPES.REMINDER_ID,
        [PROPERTY_TYPES.REMINDER_NOTES]: PROPERTY_TYPES.REMINDER_NOTES,
        [PROPERTY_TYPES.REMINDER_STATUS]: PROPERTY_TYPES.REMINDER_STATUS,
        [PROPERTY_TYPES.TYPE]: PROPERTY_TYPES.TYPE
      }
    },
    {
      name: APP_TYPES_FQNS.HEARINGS,
      alias: ALIASES.HEARING,
      entityId: FORM_IDS.HEARING_ID,
      fields: {
        [FORM_IDS.HEARING_ID]: PROPERTY_TYPES.CASE_ID
      }
    },
    {
      name: APP_TYPES_FQNS.CONTACT_INFORMATION,
      alias: ALIASES.CONTACT_INFO,
      fields: {
        [FORM_IDS.CONTACT_INFO_ID]: PROPERTY_TYPES.GENERAL_ID
      }
    },
    {
      name: APP_TYPES_FQNS.STAFF,
      alias: ALIASES.STAFF,
      fields: {
        [FORM_IDS.STAFF_ID]: PROPERTY_TYPES.PERSON_ID
      }
    },
    {
      name: APP_TYPES_FQNS.ASSESSED_BY,
      alias: ALIASES.ASSESSED_BY,
      fields: {
        [PROPERTY_TYPES.DATE_TIME]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    },
    {
      name: APP_TYPES_FQNS.REGISTERED_FOR,
      alias: ALIASES.REGISTERED_FOR,
      fields: {
        [PROPERTY_TYPES.DATE_TIME]: PROPERTY_TYPES.COMPLETED_DATE_TIME
      }
    }
  ],
  associations: [
    {
      src: ALIASES.REMINDER,
      dst: ALIASES.PERSON,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.REMINDER,
      dst: ALIASES.HEARING,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.REMINDER,
      dst: ALIASES.CONTACT_INFO,
      association: ALIASES.REGISTERED_FOR
    },
    {
      src: ALIASES.REMINDER,
      dst: ALIASES.STAFF,
      association: ALIASES.ASSESSED_BY
    }
  ]
};

export default ManualReminderConfig;
