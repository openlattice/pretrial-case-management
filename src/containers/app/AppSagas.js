/*
 * @flow
 */

import { AuthActionFactory } from 'lattice-auth';
import { takeEvery } from 'redux-saga/effects';

function cleanupWorker() {
  localStorage.removeItem('openlattice_psa_terms_accepted');
}

function* logoutCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActionFactory.LOGOUT, cleanupWorker);
}

export { logoutCleanupWatcher };
