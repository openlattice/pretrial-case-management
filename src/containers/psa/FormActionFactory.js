/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_CASE_AND_CHARGES :string = 'ADD_CASE_AND_CHARGES';
const addCaseAndCharges :RequestSequence = newRequestSequence(ADD_CASE_AND_CHARGES);

const LOAD_DATA_MODEL :string = 'LOAD_DATA_MODEL';
const loadDataModel :RequestSequence = newRequestSequence(LOAD_DATA_MODEL);

const LOAD_NEIGHBORS :string = 'LOAD_NEIGHBORS';
const loadNeighbors :RequestSequence = newRequestSequence(LOAD_NEIGHBORS);

const SUBMIT_PSA :string = 'SUBMIT_PSA';
const submitPSA :RequestSequence = newRequestSequence(SUBMIT_PSA);

const UPDATE_PSA :string = 'UPDATE_PSA';
const updatePSA :RequestSequence = newRequestSequence(UPDATE_PSA);

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
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  SUBMIT_PSA,
  UPDATE_PSA,
  addCaseAndCharges,
  loadDataModel,
  loadNeighbors,
  submitPSA,
  updatePSA,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  clearForm,
  selectPerson,
  selectPretrialCase,
  setPSAValues
};
