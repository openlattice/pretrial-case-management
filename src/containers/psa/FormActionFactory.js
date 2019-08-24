/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_CASE_TO_PSA :string = 'ADD_CASE_TO_PSA';
const addCaseToPSA :RequestSequence = newRequestSequence(ADD_CASE_TO_PSA);

const EDIT_PSA :string = 'EDIT_PSA';
const editPSA :RequestSequence = newRequestSequence(EDIT_PSA);

const LOAD_NEIGHBORS :string = 'LOAD_NEIGHBORS';
const loadNeighbors :RequestSequence = newRequestSequence(LOAD_NEIGHBORS);

const SUBMIT_PSA :string = 'SUBMIT_PSA';
const submitPSA :RequestSequence = newRequestSequence(SUBMIT_PSA);

const REMOVE_CASE_FROM_PSA :string = 'REMOVE_CASE_FROM_PSA';
const removeCaseFromPSA :RequestSequence = newRequestSequence(REMOVE_CASE_FROM_PSA);

// reducer only

const ADD_CASE_AND_CHARGES :string = 'ADD_CASE_AND_CHARGES';
const addCaseAndCharges :RequestSequence = newRequestSequence(ADD_CASE_AND_CHARGES);

const CLEAR_FORM :string = 'CLEAR_FORM';
const clearForm :RequestSequence = newRequestSequence(CLEAR_FORM);

const SELECT_PERSON :string = 'SELECT_PERSON';
const selectPerson :RequestSequence = newRequestSequence(SELECT_PERSON);

const SELECT_PRETRIAL_CASE :string = 'SELECT_PRETRIAL_CASE';
const selectPretrialCase :RequestSequence = newRequestSequence(SELECT_PRETRIAL_CASE);

const SET_PSA_VALUES :string = 'SET_PSA_VALUES';
const setPSAValues :RequestSequence = newRequestSequence(SET_PSA_VALUES);

export {
  ADD_CASE_TO_PSA,
  EDIT_PSA,
  LOAD_NEIGHBORS,
  REMOVE_CASE_FROM_PSA,
  SUBMIT_PSA,
  addCaseToPSA,
  editPSA,
  loadNeighbors,
  removeCaseFromPSA,
  submitPSA,

  // reducer only

  ADD_CASE_AND_CHARGES,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  addCaseAndCharges,
  clearForm,
  selectPerson,
  selectPretrialCase,
  setPSAValues
};
