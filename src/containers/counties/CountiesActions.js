/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOAD_COUNTIES :string = 'LOAD_COUNTIES';
const loadCounties :RequestSequence = newRequestSequence(LOAD_COUNTIES);

export {
  LOAD_COUNTIES,
  loadCounties
};
