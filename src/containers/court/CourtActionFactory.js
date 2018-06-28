/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CHANGE_HEARING_FILTERS = 'CHANGE_HEARING_FILTERS';
const changeHearingFilters :RequestSequence = newRequestSequence(CHANGE_HEARING_FILTERS);

const LOAD_HEARINGS_TODAY :string = 'LOAD_HEARINGS_TODAY';
const loadHearingsToday :RequestSequence = newRequestSequence(LOAD_HEARINGS_TODAY);

export {
  CHANGE_HEARING_FILTERS,
  LOAD_HEARINGS_TODAY,
  changeHearingFilters,
  loadHearingsToday
};
