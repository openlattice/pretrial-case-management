/*
 * @flow
 */

import { put, takeEvery } from '@redux-saga/core/effects';
import { push } from 'connected-react-router';

import { GO_TO_ROOT, GO_TO_PATH } from './RoutingActionFactory';

import type { RoutingAction } from './RoutingActionFactory';

/*
 * goToPath()
 */

function* goToPathWorker(action :RoutingAction) :Generator<*, *, *> {

  const { path } = action;
  if (path === null || path === undefined || !path.startsWith('/', 0)) {
    throw new Error('Invalid Path Provided');
  }

  yield put(push({ pathname: path }));

}

function* goToPathWatcher() :Generator<*, *, *> {

  yield takeEvery(GO_TO_PATH, goToPathWorker);
}

/*
 * goToRoot()
 */

function* goToRootWatcher() :Generator<*, *, *> {

  yield takeEvery(GO_TO_ROOT, goToPathWorker);
}

export {
  goToRootWatcher,
  goToPathWatcher
};
