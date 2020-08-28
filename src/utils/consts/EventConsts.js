/*
 * @flow
 */
import {
  faGavel,
  faMicrophoneAlt,
  faFolderOpen,
  faFolder,
  faFileEdit,
  faPaperPlane
} from '@fortawesome/pro-solid-svg-icons';

export const EVENT_TYPES = {
  HEARING: 'Hearing',
  CHECKIN_APPOINTMENTS: 'Check-In Appointment',
  PSA_CREATED: 'PSA Created',
  PSA_EDITED: 'PSA Edited',
  PSA_CLOSED: 'PSA Closed',
  REMINDER_SENT: 'Reminder Sent'
};

const HEARING_EVENT = {
  label: 'Hearing',
  icon: faGavel
};

const CHECKIN_APPOINTMENTS_EVENT = {
  label: 'Check-In',
  icon: faMicrophoneAlt
};

const PSA_CREATED_EVENT = {
  label: 'PSA Created',
  icon: faFolderOpen
};

const PSA_EDITED_EVENT = {
  label: 'PSA Edited',
  icon: faFileEdit
};

const PSA_CLOSED_EVENT = {
  label: 'PSA Closed',
  icon: faFolder
};

const REMINDER_EVENT = {
  label: 'Reminder Sent',
  icon: faPaperPlane
};

export const EVENT_LABELS = {
  [EVENT_TYPES.HEARING]: HEARING_EVENT,
  [EVENT_TYPES.CHECKIN_APPOINTMENTS]: CHECKIN_APPOINTMENTS_EVENT,
  [EVENT_TYPES.PSA_CREATED]: PSA_CREATED_EVENT,
  [EVENT_TYPES.PSA_EDITED]: PSA_EDITED_EVENT,
  [EVENT_TYPES.PSA_CLOSED]: PSA_CLOSED_EVENT,
  [EVENT_TYPES.REMINDER_SENT]: REMINDER_EVENT
};
