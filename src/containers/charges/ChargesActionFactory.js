/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_CHARGES :string = 'LOAD_CHARGES';
const loadCharges :RequestSequence = newRequestSequence(LOAD_CHARGES);

export {
  LOAD_CHARGES,
  loadCharges
};
