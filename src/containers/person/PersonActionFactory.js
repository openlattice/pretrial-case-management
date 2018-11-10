/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';
const clearSearchResults = newRequestSequence('CLEAR_SEARCH_RESULTS');

const LOAD_PERSON_DETAILS = 'LOAD_PERSON_DETAILS';
const loadPersonDetails = newRequestSequence('LOAD_PERSON_DETAILS');

const NEW_PERSON_SUBMIT = 'NEW_PERSON_SUBMIT';
const newPersonSubmit = newRequestSequence('NEW_PERSON_SUBMIT');

const SEARCH_PEOPLE = 'SEARCH_PEOPLE';
const searchPeople = newRequestSequence('SEARCH_PEOPLE');

const UPDATE_CASES = 'UPDATE_CASES';
const updateCases = newRequestSequence('UPDATE_CASES');

export {
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS,
  NEW_PERSON_SUBMIT,
  SEARCH_PEOPLE,
  UPDATE_CASES,
  clearSearchResults,
  loadPersonDetails,
  newPersonSubmit,
  searchPeople,
  updateCases
};
