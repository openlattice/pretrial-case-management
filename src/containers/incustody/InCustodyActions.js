/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_IN_CUSTODY_REPORT :string = 'DOWNLOAD_IN_CUSTODY_REPORT';
const downloadInCustodyReport :RequestSequence = newRequestSequence(DOWNLOAD_IN_CUSTODY_REPORT);

const GET_IN_CUSTODY_DATA :string = 'GET_IN_CUSTODY_DATA';
const getInCustodyData :RequestSequence = newRequestSequence(GET_IN_CUSTODY_DATA);

export {
  DOWNLOAD_IN_CUSTODY_REPORT,
  downloadInCustodyReport,
  GET_IN_CUSTODY_DATA,
  getInCustodyData
};
