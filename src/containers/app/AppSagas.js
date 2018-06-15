/*
 * @flow
 */

import { AuthActionFactory } from 'lattice-auth';
import { takeEvery } from 'redux-saga/effects';

import { removeTermsToken } from '../../utils/AcceptTermsUtils';

function cleanupWorker() {
  removeTermsToken();
}

function* logoutCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActionFactory.LOGOUT, cleanupWorker);
}

export { logoutCleanupWatcher };
