/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_RELEASE_CONDITIONS :string = 'CLEAR_RELEASE_CONDITIONS';
const clearReleaseConditions :RequestSequence = newRequestSequence(CLEAR_RELEASE_CONDITIONS);

const LOAD_RELEASE_CONDTIONS :string = 'LOAD_RELEASE_CONDTIONS';
const loadReleaseConditions :RequestSequence = newRequestSequence(LOAD_RELEASE_CONDTIONS);

const UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS :string = 'UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS';
const updateOutcomesAndReleaseCondtions :RequestSequence = newRequestSequence(UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS);

export {
  CLEAR_RELEASE_CONDITIONS,
  LOAD_RELEASE_CONDTIONS,
  UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS,
  clearReleaseConditions,
  loadReleaseConditions,
  updateOutcomesAndReleaseCondtions
};
