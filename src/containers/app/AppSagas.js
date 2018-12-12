/*
 * @flow
 */

import { Types } from 'lattice';
import { push } from 'react-router-redux';
import { AuthActionFactory, AccountUtils } from 'lattice-auth';
import {
  AppApiActions,
  AppApiSagas,
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
} from 'lattice-sagas';


import {
  all,
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import { APP_NAME } from '../../utils/consts/Consts';
import { removeTermsToken } from '../../utils/AcceptTermsUtils';
import * as Routes from '../../core/router/Routes';

import {
  LOAD_APP,
  SWITCH_ORGANIZATION,
  loadApp
} from './AppActionFactory';

const { SecurableTypes } = Types;
const { getEntityDataModelProjection } = EntityDataModelApiActions;
const { getEntityDataModelProjectionWorker } = EntityDataModelApiSagas;
const { getApp, getAppConfigs, getAppTypes } = AppApiActions;
const { getAppWorker, getAppConfigsWorker, getAppTypesWorker } = AppApiSagas;


function* loadAppWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadApp.request(action.id));

    /*
     * 1. load App
     */

    let response :any = {};
    response = yield call(getAppWorker, getApp(APP_NAME));
    if (response.error) throw response.error;

    /*
     * 2. load AppConfigs and AppTypes
     */

    const app = response.data;
    response = yield all([
      call(getAppConfigsWorker, getAppConfigs(app.id)),
      call(getAppTypesWorker, getAppTypes(app.appTypeIds)),
    ]);
    if (response[0].error) throw response[0].error;
    if (response[1].error) throw response[1].error;

    /*
     * 3. load EntityTypes and PropertyTypes
     */

    const appConfigs :Object[] = response[0].data;
    const appTypesMap :Object = response[1].data;
    const appTypes :Object[] = (Object.values(appTypesMap) :any);
    const projection :Object[] = appTypes.map((appType :Object) => ({
      id: appType.entityTypeId,
      include: [SecurableTypes.EntityType, SecurableTypes.PropertyTypeInEntitySet],
      type: SecurableTypes.EntityType,
    }));
    response = yield call(getEntityDataModelProjectionWorker, getEntityDataModelProjection(projection));
    if (response.error) throw response.error;

    const edm :Object = response.data;
    yield put(loadApp.success(action.id, {
      app,
      appConfigs,
      appTypes,
      edm
    }));
  }
  catch (error) {
    yield put(loadApp.failure(action.id, error));
  }
  finally {
    yield put(loadApp.finally(action.id));
  }
}

function* loadAppWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_APP, loadAppWorker);
}

function* switchOrganizationWorker(action :Object) :Generator<*, *, *> {
  AccountUtils.storeOrganizationId(action.org.orgId);
  yield put(push(Routes.CREATE_FORMS));
}

function* switchOrganizationWatcher() :Generator<*, *, *> {
  yield takeEvery(SWITCH_ORGANIZATION, switchOrganizationWorker);
}

function cleanupWorker() {
  removeTermsToken();
}

function* authExpirationCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActionFactory.AUTH_EXPIRED, cleanupWorker);
}

function* authFailureCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActionFactory.AUTH_FAILURE, cleanupWorker);
}

function* logoutCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActionFactory.LOGOUT, cleanupWorker);
}

export {
  authExpirationCleanupWatcher,
  authFailureCleanupWatcher,
  loadAppWatcher,
  logoutCleanupWatcher,
  switchOrganizationWatcher
};
