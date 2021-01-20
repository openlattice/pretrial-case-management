/*
 * @flow
 */
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const LOAD_REQUIRES_ACTION :'LOAD_REQUIRES_ACTION' = 'LOAD_REQUIRES_ACTION';
const loadRequiresAction :RequestSequence = newRequestSequence(LOAD_REQUIRES_ACTION);

export const SET_VALUE :'SET_VALUE' = 'SET_VALUE';
export const setValue = (value :any) => ({
  type: SET_VALUE,
  value
});

export {
  LOAD_REQUIRES_ACTION,
  loadRequiresAction
}
