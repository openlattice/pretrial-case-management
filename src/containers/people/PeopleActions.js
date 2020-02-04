/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_PERSON :'CLEAR_PERSON' = 'CLEAR_PERSON';
const clearPerson = (value) => ({
  type: CLEAR_PERSON,
  value
});

const GET_PEOPLE_NEIGHBORS :'GET_PEOPLE_NEIGHBORS' = 'GET_PEOPLE_NEIGHBORS';
const getPeopleNeighbors :RequestSequence = newRequestSequence(GET_PEOPLE_NEIGHBORS);

const GET_PERSON_DATA :'GET_PERSON_DATA' = 'GET_PERSON_DATA';
const getPersonData :RequestSequence = newRequestSequence(GET_PERSON_DATA);

const LOAD_REQUIRES_ACTION_PEOPLE :'LOAD_REQUIRES_ACTION_PEOPLE' = 'LOAD_REQUIRES_ACTION_PEOPLE';
const loadRequiresActionPeople :RequestSequence = newRequestSequence(LOAD_REQUIRES_ACTION_PEOPLE);

const GET_STAFF_EKIDS :'GET_STAFF_EKIDS' = 'GET_STAFF_EKIDS';
const getStaffEKIDs :RequestSequence = newRequestSequence(GET_STAFF_EKIDS);


export {
  CLEAR_PERSON,
  GET_PEOPLE_NEIGHBORS,
  GET_PERSON_DATA,
  GET_STAFF_EKIDS,
  LOAD_REQUIRES_ACTION_PEOPLE,
  clearPerson,
  getPeopleNeighbors,
  getPersonData,
  getStaffEKIDs,
  loadRequiresActionPeople
};
