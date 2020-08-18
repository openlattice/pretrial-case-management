/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ARRESTING_AGENCY :string = 'ADD_ARRESTING_AGENCY';
const addArrestingAgency :RequestSequence = newRequestSequence(ADD_ARRESTING_AGENCY);

const CREATE_CHARGE :string = 'CREATE_CHARGE';
const createCharge :RequestSequence = newRequestSequence(CREATE_CHARGE);

const DELETE_CHARGE :string = 'DELETE_CHARGE';
const deleteCharge :RequestSequence = newRequestSequence(DELETE_CHARGE);

const IMPORT_BULK_CHARGES :string = 'IMPORT_BULK_CHARGES';
const importBulkCharges :RequestSequence = newRequestSequence(IMPORT_BULK_CHARGES);

const UPDATE_CHARGE :string = 'UPDATE_CHARGE';
const updateCharge :RequestSequence = newRequestSequence(UPDATE_CHARGE);

const LOAD_ARRESTING_AGENCIES :string = 'LOAD_ARRESTING_AGENCIES';
const loadArrestingAgencies :RequestSequence = newRequestSequence(LOAD_ARRESTING_AGENCIES);

const LOAD_CHARGES :string = 'LOAD_CHARGES';
const loadCharges :RequestSequence = newRequestSequence(LOAD_CHARGES);

export {
  ADD_ARRESTING_AGENCY,
  CREATE_CHARGE,
  DELETE_CHARGE,
  IMPORT_BULK_CHARGES,
  LOAD_ARRESTING_AGENCIES,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  addArrestingAgency,
  createCharge,
  deleteCharge,
  importBulkCharges,
  loadArrestingAgencies,
  loadCharges,
  updateCharge
};
