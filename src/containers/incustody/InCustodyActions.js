/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_IN_CUSTODY_DATA :string = 'GET_IN_CUSTODY_DATA';
const getInCustodyData :RequestSequence = newRequestSequence(GET_IN_CUSTODY_DATA);

export {
  GET_IN_CUSTODY_DATA,
  getInCustodyData
};
