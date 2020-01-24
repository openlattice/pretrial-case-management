/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_CHARGE :string = 'CREATE_CHARGE';
const createCharge :RequestSequence = newRequestSequence(CREATE_CHARGE);

const DELETE_CHARGE :string = 'DELETE_CHARGE';
const deleteCharge :RequestSequence = newRequestSequence(DELETE_CHARGE);

const UPDATE_CHARGE :string = 'UPDATE_CHARGE';
const updateCharge :RequestSequence = newRequestSequence(UPDATE_CHARGE);

const LOAD_ARRESTING_AGENCIES :string = 'LOAD_ARRESTING_AGENCIES';
const loadArrestingAgencies :RequestSequence = newRequestSequence(LOAD_ARRESTING_AGENCIES);

const LOAD_CHARGES :string = 'LOAD_CHARGES';
const loadCharges :RequestSequence = newRequestSequence(LOAD_CHARGES);


export {
  CREATE_CHARGE,
  DELETE_CHARGE,
  LOAD_ARRESTING_AGENCIES,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  createCharge,
  deleteCharge,
  loadArrestingAgencies,
  loadCharges,
  updateCharge
};
