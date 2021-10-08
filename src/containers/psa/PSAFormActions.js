/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';
import { List, Map } from 'immutable';

const ADD_CASE_TO_PSA :string = 'ADD_CASE_TO_PSA';
const addCaseToPSA :RequestSequence = newRequestSequence(ADD_CASE_TO_PSA);

const EDIT_PSA :string = 'EDIT_PSA';
const editPSA :RequestSequence = newRequestSequence(EDIT_PSA);

const SUBMIT_PSA :string = 'SUBMIT_PSA';
const submitPSA :RequestSequence = newRequestSequence(SUBMIT_PSA);

const REMOVE_CASE_FROM_PSA :string = 'REMOVE_CASE_FROM_PSA';
const removeCaseFromPSA :RequestSequence = newRequestSequence(REMOVE_CASE_FROM_PSA);

// reducer only

const ADD_CASE_AND_CHARGES :'ADD_CASE_AND_CHARGES' = 'ADD_CASE_AND_CHARGES';
const addCaseAndCharges = (value :{ charge :List, pretrialCase :Map}) => ({
  type: ADD_CASE_AND_CHARGES,
  value
});

const CLEAR_FORM :'CLEAR_FORM' = 'CLEAR_FORM';
const clearForm = () => ({
  type: CLEAR_FORM
});

const SELECT_PERSON :'SELECT_PERSON' = 'SELECT_PERSON';
const selectPerson = (value :{ selectedPerson :Map }) => ({
  type: SELECT_PERSON,
  value
});

const SELECT_PRETRIAL_CASE :'SELECT_PRETRIAL_CASE' = 'SELECT_PRETRIAL_CASE';
const selectPretrialCase = (value :{ selectedPretrialCase :Map, arrestChargesForPerson :List}) => ({
  type: SELECT_PRETRIAL_CASE,
  value
});

const SET_PSA_VALUES :'SET_PSA_VALUES' = 'SET_PSA_VALUES';
const setPSAValues = (value :{ newValues :Map }) => ({
  type: SET_PSA_VALUES,
  value
});

export {
  ADD_CASE_TO_PSA,
  EDIT_PSA,
  REMOVE_CASE_FROM_PSA,
  SUBMIT_PSA,
  addCaseToPSA,
  editPSA,
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
