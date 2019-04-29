/*
 * @flow
 */

import { put, takeEvery } from '@redux-saga/core/effects';
import { push } from 'connected-react-router';

import {
  GO_TO_ROOT,
  GO_TO_ROUTE
} from './RoutingActionFactory';

import * as Routes from './Routes';


/*
 * goToRoute()
 */

function* goToRouteWorker(action :RoutingAction) :Generator<*, *, *> {

  const { route } = action;
  if (route === null || route === undefined || !route.startsWith('/', 0)) {
    throw new Error('Invalid Route Provided');
  }

  yield put(push({ pathname: route }));
}

function* goToRouteWatcher() :Generator<*, *, *> {

  yield takeEvery(GO_TO_ROUTE, goToRouteWorker);
}

/*
 * goToRoot()
 */

function* goToRootWorker() :Generator<*, *, *> {

  yield put(push({ pathname: Routes.CREATE_FORMS }));
}

function* goToRootWatcher() :Generator<*, *, *> {

  yield takeEvery(GO_TO_ROOT, goToRootWorker);
}

export {
  goToRootWatcher,
  goToRouteWatcher
};
