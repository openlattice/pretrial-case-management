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

const LOAD_JUDGES :string = 'LOAD_JUDGES';
const loadJudges :RequestSequence = newRequestSequence(LOAD_JUDGES);

const SET_COURT_DATE :string = 'SET_COURT_DATE';
const setCourtDate :RequestSequence = newRequestSequence(SET_COURT_DATE);

export {
  CHANGE_HEARING_FILTERS,
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  LOAD_HEARINGS_FOR_DATE,
  LOAD_HEARING_NEIGHBORS,
  REFRESH_HEARING_NEIGHBORS,
  LOAD_JUDGES,
  SET_COURT_DATE,
  changeHearingFilters,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate,
  loadHearingNeighbors,
  refreshHearingNeighbors,
  loadJudges,
  setCourtDate
};
