/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GO_TO_ROOT :string = 'GO_TO_ROOT';
const goToRoot :RequestSequence = newRequestSequence(GO_TO_ROOT);

const GO_TO_ROUTE :string = 'GO_TO_ROUTE';
const goToRoute :RequestSequence = newRequestSequence(GO_TO_ROUTE);

export {
  GO_TO_ROOT,
  GO_TO_ROUTE,
  goToRoot,
  goToRoute
};
