/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SUBMITTED_CONTACT :'CLEAR_SUBMITTED_CONTACT' = 'CLEAR_SUBMITTED_CONTACT';
const clearSubmittedContact = () => ({
  type: CLEAR_SUBMITTED_CONTACT
});

const SUBMIT_CONTACT :string = 'SUBMIT_CONTACT';
const submitContact :RequestSequence = newRequestSequence(SUBMIT_CONTACT);

const UPDATE_CONTACT :string = 'UPDATE_CONTACT';
const updateContact :RequestSequence = newRequestSequence(UPDATE_CONTACT);

const UPDATE_CONTACTS_BULK = 'UPDATE_CONTACTS_BULK';
const updateContactsBulk = newRequestSequence(UPDATE_CONTACTS_BULK);

export {
  CLEAR_SUBMITTED_CONTACT,
  SUBMIT_CONTACT,
  UPDATE_CONTACT,
  UPDATE_CONTACTS_BULK,
  clearSubmittedContact,
  submitContact,
  updateContact,
  updateContactsBulk
};
