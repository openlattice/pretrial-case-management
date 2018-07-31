/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CHANGE_HEARING_FILTERS = 'CHANGE_HEARING_FILTERS';
const changeHearingFilters :RequestSequence = newRequestSequence(CHANGE_HEARING_FILTERS);

const LOAD_HEARINGS_FOR_DATE :string = 'LOAD_HEARINGS_FOR_DATE';
const loadHearingsForDate :RequestSequence = newRequestSequence(LOAD_HEARINGS_FOR_DATE);

export {
  CHANGE_HEARING_FILTERS,
  LOAD_HEARINGS_FOR_DATE,
  changeHearingFilters,
  loadHearingsForDate
};
