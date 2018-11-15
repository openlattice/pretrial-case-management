/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_PEOPLE = 'GET_PEOPLE';
const getPeople = newRequestSequence(GET_PEOPLE);

const GET_PERSON_DATA = 'GET_PERSON_DATA';
const getPersonData = newRequestSequence(GET_PERSON_DATA);

const REFRESH_PERSON_NEIGHBORS = 'REFRESH_PERSON_NEIGHBORS';
const refreshPersonNeighbors = newRequestSequence(REFRESH_PERSON_NEIGHBORS);

const GET_PERSON_NEIGHBORS = 'GET_PERSON_NEIGHBORS';
const getPersonNeighbors = newRequestSequence(GET_PERSON_NEIGHBORS);

export {
  GET_PEOPLE,
  GET_PERSON_DATA,
  GET_PERSON_NEIGHBORS,
  REFRESH_PERSON_NEIGHBORS,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  refreshPersonNeighbors
};
