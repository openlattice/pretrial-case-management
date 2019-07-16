/*
 * @flow
 */
import { List, Map, fromJS } from 'immutable';

import {
  CLEAR_SUBMITTED_CONTACT,
  submitContact,
  updateContact,
  updateContactsBulk
} from './ContactInfoActionFactory';

import { CONTACT_INFO } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [CONTACT_INFO.SUBMITTED_CONTACT_INFO]: Map(),
  [CONTACT_INFO.UPDATED_CONTACTS]: List(),
  [CONTACT_INFO.SUBMITTING_CONTACT_INFO]: false,
  [CONTACT_INFO.SUBMISSION_COMPLETE]: false,
  [CONTACT_INFO.SUBMISSION_ERROR]: false,
  [CONTACT_INFO.UPDATING_CONTACT_INFO]: false,
});

export default function contactInfoReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_SUBMITTED_CONTACT: return INITIAL_STATE;

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        REQUEST: () => state
          .set(CONTACT_INFO.SUBMITTING_CONTACT_INFO, true)
          .set(CONTACT_INFO.SUBMISSION_COMPLETE, false),
        SUCCESS: () => {
          const { contactInfo } = action.value;
          return state.set(CONTACT_INFO.SUBMITTED_CONTACT_INFO, contactInfo);
        },
        FAILURE: () => state.set(CONTACT_INFO.SUBMISSION_ERROR, action.value),
        FINALLY: () => state
          .set(CONTACT_INFO.SUBMITTING_CONTACT_INFO, false)
          .set(CONTACT_INFO.SUBMISSION_COMPLETE, true),
      });
    }

    case updateContact.case(action.type): {
      return updateContact.reducer(state, action, {
        REQUEST: () => state.set(CONTACT_INFO.UPDATING_CONTACT_INFO, true),
        SUCCESS: () => {
          const { contactInfo } = action.value;
          return state.set(CONTACT_INFO.SUBMITTED_CONTACT_INFO, contactInfo);
        },
        FAILURE: () => state.set(CONTACT_INFO.SUBMISSION_ERROR, action.value),
        FINALLY: () => state.set(CONTACT_INFO.UPDATING_CONTACT_INFO, false),
      });
    }

    case updateContactsBulk.case(action.type): {
      return updateContactsBulk.reducer(state, action, {
        REQUEST: () => state.set(CONTACT_INFO.UPDATING_CONTACT_INFO, true),
        SUCCESS: () => {
          const { contactInformation } = action.value;
          return state.set(CONTACT_INFO.UPDATED_CONTACTS, contactInformation);
        },
        FAILURE: () => state.set(CONTACT_INFO.SUBMISSION_ERROR, action.value),
        FINALLY: () => state.set(CONTACT_INFO.UPDATING_CONTACT_INFO, false),
      });
    }

    default:
      return state;
  }
}
