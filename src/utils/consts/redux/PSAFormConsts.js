/*
 * @flow
 */

import { fromJS } from 'immutable';

import { RCM, NOTES, PSA } from '../Consts';

const {
  AGE_AT_CURRENT_ARREST,
  CURRENT_VIOLENT_OFFENSE,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION
} = PSA;

const {
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  COURT_OR_BOOKING,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = RCM;

export const INITIAL_PSA_FORM = fromJS({
  [AGE_AT_CURRENT_ARREST]: null,
  [CURRENT_VIOLENT_OFFENSE]: null,
  [PENDING_CHARGE]: null,
  [PRIOR_MISDEMEANOR]: null,
  [PRIOR_FELONY]: null,
  [PRIOR_VIOLENT_CONVICTION]: null,
  [PRIOR_FAILURE_TO_APPEAR_RECENT]: null,
  [PRIOR_FAILURE_TO_APPEAR_OLD]: null,
  [PRIOR_SENTENCE_TO_INCARCERATION]: null,
  [EXTRADITED]: 'false',
  [STEP_2_CHARGES]: null,
  [STEP_4_CHARGES]: null,
  [COURT_OR_BOOKING]: null,
  [SECONDARY_RELEASE_CHARGES]: null,
  [SECONDARY_HOLD_CHARGES]: null,
  [PSA.NOTES]: '',

  [NOTES[AGE_AT_CURRENT_ARREST]]: '',
  [NOTES[CURRENT_VIOLENT_OFFENSE]]: '',
  [NOTES[PENDING_CHARGE]]: '',
  [NOTES[PRIOR_MISDEMEANOR]]: '',
  [NOTES[PRIOR_FELONY]]: '',
  [NOTES[PRIOR_VIOLENT_CONVICTION]]: '',
  [NOTES[PRIOR_FAILURE_TO_APPEAR_RECENT]]: '',
  [NOTES[PRIOR_FAILURE_TO_APPEAR_OLD]]: '',
  [NOTES[PRIOR_SENTENCE_TO_INCARCERATION]]: '',
  [NOTES[EXTRADITED]]: '',
  [NOTES[STEP_2_CHARGES]]: '',
  [NOTES[STEP_4_CHARGES]]: '',
  [NOTES[SECONDARY_RELEASE_CHARGES]]: '',
  [NOTES[SECONDARY_HOLD_CHARGES]]: ''
});

export const PSA_FORM_ACTIONS = {
  ADD_CASE_TO_PSA: 'addCaseToPSA',
  EDIT_PSA: 'editPSA',
  SUBMIT_PSA: 'submitPSA',
  REMOVE_CASE_FROM_PSA: 'removeCaseFromPSA'
};

export const PSA_FORM_DATA = {
  ARREST_ID: 'arrestId',
  ARREST_OPTIONS: 'arrestOptions',
  PSA_FORM: 'psaForm',
  SELECT_PERSON: 'selectedPerson',
  SELECT_PRETRIAL_CASE: 'selectedPretrialCase',
  SELECT_CASE_CHARGES: 'selectedPretrialCaseCharges',
  SUBMITTED_PSA: 'submittedPSA',
  SUBMITTED_PSA_NEIGHBORS: 'submittedPSANeighbors'
};
