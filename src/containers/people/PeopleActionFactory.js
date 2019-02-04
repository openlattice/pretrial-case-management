/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_PERSON = 'CLEAR_PERSON';
const clearPerson = newRequestSequence(CLEAR_PERSON);

const GET_PEOPLE = 'GET_PEOPLE';
const getPeople = newRequestSequence(GET_PEOPLE);

const GET_PERSON_DATA = 'GET_PERSON_DATA';
const getPersonData = newRequestSequence(GET_PERSON_DATA);

const REFRESH_PERSON_NEIGHBORS = 'REFRESH_PERSON_NEIGHBORS';
const refreshPersonNeighbors = newRequestSequence(REFRESH_PERSON_NEIGHBORS);

const GET_PERSON_NEIGHBORS = 'GET_PERSON_NEIGHBORS';
const getPersonNeighbors = newRequestSequence(GET_PERSON_NEIGHBORS);

const UPDATE_CONTACT_INFORMATION = 'UPDATE_CONTACT_INFORMATION';
const updateContactInfo = newRequestSequence(UPDATE_CONTACT_INFORMATION);

export {
  CLEAR_PERSON,
  GET_PEOPLE,
  GET_PERSON_DATA,
  GET_PERSON_NEIGHBORS,
  REFRESH_PERSON_NEIGHBORS,
  UPDATE_CONTACT_INFORMATION,
  clearPerson,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  refreshPersonNeighbors,
  updateContactInfo
};
