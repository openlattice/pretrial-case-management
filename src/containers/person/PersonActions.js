/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const RESET_PERSON_ACTION :'RESET_PERSON_ACTION' = 'RESET_PERSON_ACTION';
const resetPersonAction = (value) => ({
  type: RESET_PERSON_ACTION,
  value
});

const CLEAR_CASE_LOADER = 'CLEAR_CASE_LOADER';
const clearCaseLoader = newRequestSequence('CLEAR_CASE_LOADER');

const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';
const clearSearchResults = newRequestSequence('CLEAR_SEARCH_RESULTS');

const LOAD_PERSON_DETAILS = 'LOAD_PERSON_DETAILS';
const loadPersonDetails = newRequestSequence('LOAD_PERSON_DETAILS');

const NEW_PERSON_SUBMIT = 'NEW_PERSON_SUBMIT';
const newPersonSubmit = newRequestSequence('NEW_PERSON_SUBMIT');

const SEARCH_PEOPLE = 'SEARCH_PEOPLE';
const searchPeople = newRequestSequence('SEARCH_PEOPLE');

const SEARCH_PEOPLE_BY_PHONE = 'SEARCH_PEOPLE_BY_PHONE';
const searchPeopleByPhoneNumber = newRequestSequence('SEARCH_PEOPLE_BY_PHONE');

const TRANSFER_NEIGHBORS = 'TRANSFER_NEIGHBORS';
const transferNeighbors = newRequestSequence('TRANSFER_NEIGHBORS');

const UPDATE_CASES = 'UPDATE_CASES';
const updateCases = newRequestSequence('UPDATE_CASES');

export {
  CLEAR_CASE_LOADER,
  CLEAR_SEARCH_RESULTS,
  LOAD_PERSON_DETAILS,
  NEW_PERSON_SUBMIT,
  RESET_PERSON_ACTION,
  SEARCH_PEOPLE,
  SEARCH_PEOPLE_BY_PHONE,
  TRANSFER_NEIGHBORS,
  UPDATE_CASES,
  clearCaseLoader,
  clearSearchResults,
  loadPersonDetails,
  newPersonSubmit,
  resetPersonAction,
  searchPeople,
  searchPeopleByPhoneNumber,
  transferNeighbors,
  updateCases
};
