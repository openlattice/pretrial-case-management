/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DOWNLOAD_PSA_BY_HEARING_DATE :string = 'DOWNLOAD_PSA_BY_HEARING_DATE';
const downloadPSAsByHearingDate :RequestSequence = newRequestSequence(DOWNLOAD_PSA_BY_HEARING_DATE);

const DOWNLOAD_PSA_FORMS :string = 'DOWNLOAD_PSA_FORMS';
const downloadPsaForms :RequestSequence = newRequestSequence(DOWNLOAD_PSA_FORMS);

export {
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  downloadPSAsByHearingDate,
  downloadPsaForms
};
