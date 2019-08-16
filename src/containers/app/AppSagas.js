/*
 * @flow
 */

import { push } from 'connected-react-router';
import { Constants, SearchApi, Types } from 'lattice';
import { AuthActions, AccountUtils } from 'lattice-auth';
import { OrderedMap, fromJS } from 'immutable';
import {
  AppApiActions,
  AppApiSagas,
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';

import { APP_TYPES, APP_NAME } from '../../utils/consts/DataModelConsts';
import { removeTermsToken } from '../../utils/AcceptTermsUtils';
import { defaultSettings } from '../../utils/AppUtils';
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

const { OPENLATTICE_ID_FQN } = Constants;

const { APP_SETTINGS } = APP_TYPES;

function* loadAppWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadApp.request(action.id));
    let appSettingsByOrgId :OrderedMap<*, *> = OrderedMap();
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
      include: [SecurableTypes.EntitySet, SecurableTypes.EntityType, SecurableTypes.PropertyTypeInEntitySet],
      type: SecurableTypes.EntityType,
    }));
    response = yield call(getEntityDataModelProjectionWorker, getEntityDataModelProjection(projection));
    if (response.error) {
      console.error(response.error);
      throw response.error;
    }

    const edm :Object = response.data;
    appConfigs.forEach((appConfig :Object) => {

      const { organization } :Object = appConfig;
      const orgId :string = organization.id;
      if (fromJS(appConfig.config).size) {
        const appSettingsConfig = appConfig.config[APP_SETTINGS];
        appSettingsByOrgId = appSettingsByOrgId.set(orgId, appSettingsConfig.entitySetId);
      }
    });
    const appSettingCalls = appSettingsByOrgId.valueSeq().map(entitySetId => (
      call(SearchApi.searchEntitySetData, entitySetId, {
        start: 0,
        maxHits: 10000,
        searchTerm: '*'
      })
    ));

    const orgIds = appSettingsByOrgId.keySeq().toJS();
    const appSettingResults = yield all(appSettingCalls.toJS());

    let i = 0;
    appSettingResults
      .filter(({ hits }) => !!hits.length)
      .map(({ hits }) => hits).forEach((setting) => {
        const entitySetId = orgIds[i];
        const settingsEntity = setting[0] || '{}';
        const settings = JSON.parse(settingsEntity['ol.appdetails']);
        settings[OPENLATTICE_ID_FQN] = settingsEntity[OPENLATTICE_ID_FQN][0];
        appSettingsByOrgId = appSettingsByOrgId.set(entitySetId, fromJS(settings));
        i += 1;
      });

    yield put(loadApp.success(action.id, {
      app,
      appConfigs,
      appSettingsByOrgId,
      appTypes,
      edm
    }));

  }
  catch (error) {
    console.error(error);
    yield put(loadApp.failure(action.id, { error, defaultSettings }));
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
  yield takeEvery(AuthActions.AUTH_EXPIRED, cleanupWorker);
}

function* authFailureCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActions.AUTH_FAILURE, cleanupWorker);
}

function* logoutCleanupWatcher() :Generator<*, *, *> {
  yield takeEvery(AuthActions.LOGOUT, cleanupWorker);
}

export {
  authExpirationCleanupWatcher,
  authFailureCleanupWatcher,
  loadAppWatcher,
  logoutCleanupWatcher,
  switchOrganizationWatcher
};
