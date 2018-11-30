/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_APP :string = 'LOAD_APP';
const loadApp :RequestSequence = newRequestSequence(LOAD_APP);

const SWITCH_ORGANIZATION :string = 'SWITCH_ORGANIZATION';
const switchOrganization = (org :Object) :Object => ({
  org,
  type: SWITCH_ORGANIZATION
});

export {
  LOAD_APP,
  SWITCH_ORGANIZATION,
  loadApp,
  switchOrganization
};
