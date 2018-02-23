/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DOWNLOAD_PSA_FORMS = 'DOWNLOAD_PSA_FORMS';
const downloadPsaForms = newRequestSequence(DOWNLOAD_PSA_FORMS);

export {
  DOWNLOAD_PSA_FORMS,
  downloadPsaForms
};
