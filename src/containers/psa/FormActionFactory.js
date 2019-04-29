/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const ADD_CASE_AND_CHARGES :string = 'ADD_CASE_AND_CHARGES';
const addCaseAndCharges :RequestSequence = newRequestSequence(ADD_CASE_AND_CHARGES);

const LOAD_DATA_MODEL :string = 'LOAD_DATA_MODEL';
const loadDataModel :RequestSequence = newRequestSequence(LOAD_DATA_MODEL);

const LOAD_NEIGHBORS :string = 'LOAD_NEIGHBORS';
const loadNeighbors :RequestSequence = newRequestSequence(LOAD_NEIGHBORS);

// reducer only

const CLEAR_FORM :string = 'CLEAR_FORM';
const clearForm :RequestSequence = newRequestSequence(CLEAR_FORM);

const SELECT_PERSON :string = 'SELECT_PERSON';
const selectPerson :RequestSequence = newRequestSequence(SELECT_PERSON);

const SELECT_PRETRIAL_CASE :string = 'SELECT_PRETRIAL_CASE';
const selectPretrialCase :RequestSequence = newRequestSequence(SELECT_PRETRIAL_CASE);

const SET_PSA_VALUES :string = 'SET_PSA_VALUES';
const setPSAValues :RequestSequence = newRequestSequence(SET_PSA_VALUES);

export {
  ADD_CASE_AND_CHARGES,
  HARD_RESTART,
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  addCaseAndCharges,
  loadDataModel,
  loadNeighbors,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  clearForm,
  selectPerson,
  selectPretrialCase,
  setPSAValues
};
