/*
 * @flow
 */

import * as Routes from './Routes';

declare type RoutingAction = {
  type :string;
  path :string;
};

const GO_TO_ROOT :'GO_TO_ROOT' = 'GO_TO_ROOT';
function goToRoot() :RoutingAction {
  return {
    path: Routes.ROOT,
    type: GO_TO_ROOT,
  };
}

const GO_TO_PATH :'GO_TO_PATH' = 'GO_TO_PATH';
function goToPath(path :string) :RoutingAction {
  return {
    path,
    type: GO_TO_PATH,
  };
}

export {
  GO_TO_ROOT,
  GO_TO_PATH,
  goToRoot,
  goToPath
};

export type {
  RoutingAction,
};
