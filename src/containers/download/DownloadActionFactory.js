/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const DOWNLOAD_PSA_FORMS :string = 'DOWNLOAD_PSA_FORMS';
const downloadPsaForms :RequestSequence = newRequestSequence(DOWNLOAD_PSA_FORMS);

const DOWNLOAD_CHARGE_LISTS :string = 'DOWNLOAD_CHARGE_LISTS';
const downloadChargeLists :RequestSequence = newRequestSequence(DOWNLOAD_CHARGE_LISTS);

export {
  DOWNLOAD_PSA_FORMS,
  DOWNLOAD_CHARGE_LISTS,
  downloadPsaForms,
  downloadChargeLists
};
