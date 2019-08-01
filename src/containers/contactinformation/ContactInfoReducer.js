/*
 * @flow
 */
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import {
  CLEAR_SUBMITTED_CONTACT,
  submitContact,
  updateContact,
  updateContactsBulk
} from './ContactInfoActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { CONTACT_INFO_ACTIONS, CONTACT_INFO_DATA } from '../../utils/consts/redux/ContactInformationConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [CONTACT_INFO_ACTIONS.SUBMIT_CONTACT]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CONTACT_INFO_ACTIONS.UPDATE_CONTACT]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [CONTACT_INFO_ACTIONS.SUBMIT_CONTACT]: Map(),
    [CONTACT_INFO_ACTIONS.UPDATE_CONTACT]: Map(),
    [CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK]: Map()
  },
  [CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO]: Map(),
  [CONTACT_INFO_DATA.UPDATED_CONTACTS]: List()
});

export default function contactInfoReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_SUBMITTED_CONTACT: return state.set(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO, Map());

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { contactInfo } = action.value;
          return state
            .set(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO, contactInfo)
            .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO, Map())
            .setIn([REDUX.ERRORS, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT], error)
            .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT, action.id])
      });
    }

    case updateContact.case(action.type): {
      return updateContact.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACT, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACT, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { contactInfo } = action.value;
          return state
            .set(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO, contactInfo)
            .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACT, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO, Map())
            .setIn([REDUX.ERRORS, CONTACT_INFO_ACTIONS.UPDATE_CONTACT], error)
            .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACT, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACT, action.id])
      });
    }

    case updateContactsBulk.case(action.type): {
      return updateContactsBulk.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { contactInformation } = action.value;
          return state
            .set(CONTACT_INFO_DATA.UPDATED_CONTACTS, contactInformation)
            .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(CONTACT_INFO_DATA.UPDATED_CONTACTS, List())
            .setIn([REDUX.ERRORS, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK], error)
            .setIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK, action.id])
      });
    }

    default:
      return state;
  }
}
