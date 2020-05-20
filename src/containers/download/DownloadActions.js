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

const DOWNLOAD_REMINDER_DATA :string = 'DOWNLOAD_REMINDER_DATA';
const downloadReminderData :RequestSequence = newRequestSequence(DOWNLOAD_REMINDER_DATA);

const GET_DOWNLOAD_FILTERS :string = 'GET_DOWNLOAD_FILTERS';
const getDownloadFilters :RequestSequence = newRequestSequence(GET_DOWNLOAD_FILTERS);

export {
  DOWNLOAD_CHARGE_LISTS,
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  DOWNLOAD_REMINDER_DATA,
  GET_DOWNLOAD_FILTERS,
  downloadChargeLists,
  downloadPSAsByHearingDate,
  downloadPsaForms,
  downloadReminderData,
  getDownloadFilters
};
