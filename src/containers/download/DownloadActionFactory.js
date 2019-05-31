/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_CHARGE_LISTS :string = 'DOWNLOAD_CHARGE_LISTS';
const downloadChargeLists :RequestSequence = newRequestSequence(DOWNLOAD_CHARGE_LISTS);

const DOWNLOAD_PSA_BY_HEARING_DATE :string = 'DOWNLOAD_PSA_BY_HEARING_DATE';
const downloadPSAsByHearingDate :RequestSequence = newRequestSequence(DOWNLOAD_PSA_BY_HEARING_DATE);

const DOWNLOAD_PSA_FORMS :string = 'DOWNLOAD_PSA_FORMS';
const downloadPsaForms :RequestSequence = newRequestSequence(DOWNLOAD_PSA_FORMS);

const GET_DOWNLOAD_FILTERS :string = 'GET_DOWNLOAD_FILTERS';
const getDownloadFilters :RequestSequence = newRequestSequence(GET_DOWNLOAD_FILTERS);

export {
  DOWNLOAD_CHARGE_LISTS,
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  GET_DOWNLOAD_FILTERS,
  downloadChargeLists,
  downloadPSAsByHearingDate,
  downloadPsaForms,
  getDownloadFilters
};
