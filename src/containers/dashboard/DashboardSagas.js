/*
 * @flow
 */

import axios from 'axios';
import LatticeAuth from 'lattice-auth';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import {
  LOAD_DASHBOARD_DATA,
  loadDashboardData
} from './DashboardActionFactory';

const { AuthUtils } = LatticeAuth;

function* loadDashboardDataWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadDashboardData.request(action.id));

    const jwtToken = AuthUtils.getAuthToken();
    const loadRequest = {
      method: 'get',
      url: `https://api.openlattice.com/bifrost/caseloader/dashboard?jwtToken=${jwtToken}`,
      headers: {
        Authorization: `Bearer ${jwtToken}`
      }
    };
    const dashboardDataResponse = yield call(axios, loadRequest);
    const dashboardData = dashboardDataResponse.data;

    yield put(loadDashboardData.success(action.id, dashboardData));
  }
  catch (error) {
    yield put(loadDashboardData.failure(action.id, error));
  }
  finally {
    yield put(loadDashboardData.finally(action.id));
  }
}

function* loadDashboardDataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DASHBOARD_DATA, loadDashboardDataWorker);
}

// eslint-disable-next-line import/prefer-default-export
export { loadDashboardDataWatcher };
