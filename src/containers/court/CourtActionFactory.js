/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CHANGE_HEARING_FILTERS :string = 'CHANGE_HEARING_FILTERS';
const changeHearingFilters :RequestSequence = newRequestSequence(CHANGE_HEARING_FILTERS);

const FILTER_PEOPLE_IDS_WITH_OPEN_PSAS :string = 'FILTER_PEOPLE_IDS_WITH_OPEN_PSAS';
const filterPeopleIdsWithOpenPSAs :RequestSequence = newRequestSequence(FILTER_PEOPLE_IDS_WITH_OPEN_PSAS);

const LOAD_HEARINGS_FOR_DATE :string = 'LOAD_HEARINGS_FOR_DATE';
const loadHearingsForDate :RequestSequence = newRequestSequence(LOAD_HEARINGS_FOR_DATE);

const GET_OPEN_PSA_NEIGHBORS :string = 'GET_OPEN_PSA_NEIGHBORS';
const getOpenPsaNeighbors :RequestSequence = newRequestSequence(GET_OPEN_PSA_NEIGHBORS);

export {
  CHANGE_HEARING_FILTERS,
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  LOAD_HEARINGS_FOR_DATE,
  GET_OPEN_PSA_NEIGHBORS,
  changeHearingFilters,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate,
  getOpenPsaNeighbors
};
