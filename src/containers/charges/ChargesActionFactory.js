/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DELETE_CHARGE :string = 'DELETE_CHARGE';
const deleteCharge :RequestSequence = newRequestSequence(DELETE_CHARGE);

const UPDATE_CHARGE :string = 'UPDATE_CHARGE';
const updateCharge :RequestSequence = newRequestSequence(UPDATE_CHARGE);

const LOAD_CHARGES :string = 'LOAD_CHARGES';
const loadCharges :RequestSequence = newRequestSequence(LOAD_CHARGES);


export {
  DELETE_CHARGE,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  deleteCharge,
  loadCharges,
  updateCharge
};
