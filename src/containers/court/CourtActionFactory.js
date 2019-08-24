/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CHANGE_HEARING_FILTERS :string = 'CHANGE_HEARING_FILTERS';
const changeHearingFilters :RequestSequence = newRequestSequence(CHANGE_HEARING_FILTERS);

const FILTER_PEOPLE_IDS_WITH_OPEN_PSAS :string = 'FILTER_PEOPLE_IDS_WITH_OPEN_PSAS';
const filterPeopleIdsWithOpenPSAs :RequestSequence = newRequestSequence(FILTER_PEOPLE_IDS_WITH_OPEN_PSAS);

export {
  CHANGE_HEARING_FILTERS,
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  changeHearingFilters,
  filterPeopleIdsWithOpenPSAs
};
