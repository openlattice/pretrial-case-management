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

const LOAD_HEARING_NEIGHBORS :string = 'LOAD_HEARING_NEIGHBORS';
const loadHearingNeighbors :RequestSequence = newRequestSequence(LOAD_HEARING_NEIGHBORS);

const REFRESH_HEARING_NEIGHBORS :string = 'REFRESH_HEARING_NEIGHBORS';
const refreshHearingNeighbors :RequestSequence = newRequestSequence(REFRESH_HEARING_NEIGHBORS);

export {
  CHANGE_HEARING_FILTERS,
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  LOAD_HEARINGS_FOR_DATE,
  LOAD_HEARING_NEIGHBORS,
  REFRESH_HEARING_NEIGHBORS,
  changeHearingFilters,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate,
  loadHearingNeighbors,
  refreshHearingNeighbors
};
