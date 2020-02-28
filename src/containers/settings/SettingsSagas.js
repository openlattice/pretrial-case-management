/*
 * @flow
 */

import type { SequenceAction } from 'redux-reqseq';
import { fromJS, Map } from 'immutable';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { AuthorizationApi, Types } from 'lattice';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';

import Logger from '../../utils/Logger';
import { getPropertyIdToValueMap } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { createIdObject } from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import {
  INITIALIZE_SETTINGS,
  initializeSettings,
  submitSettings,
  SUBMIT_SETTINGS
} from './SettingsActions';

const { getEntityData, updateEntityData } = DataApiActions;
const { getEntityDataWorker, updateEntityDataWorker } = DataApiSagas;

const {
  APP_SETTINGS
} = APP_TYPES;

const { APP_DETAILS, ENTITY_KEY_ID } = PROPERTY_TYPES;

const { UpdateTypes } = Types;

const LOG :Logger = new Logger('SettingsSagas');

/*
 * Selectors
 */
const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getSettingsState = (state) => state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');


function* initializeSettingsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(initializeSettings.request(action.id));
    const app = yield select(getApp);
    const selectedOrganizationSettings = app.get(APP_DATA.SELECTED_ORG_SETTINGS);

    /*
     * Get Entity Set Ids
     */
    const settingsESID = getEntitySetIdFromApp(app, APP_SETTINGS);
    /*
     * Check Settings Permissions
     */
    const permissionRequestBody :Object = { aclKey: [settingsESID], permissions: ['WRITE'] };
    const settingsPermissionsResponse = yield call(AuthorizationApi.checkAuthorizations, [permissionRequestBody]);
    const settingsPermissions = settingsPermissionsResponse[0].permissions.WRITE;
    yield put(initializeSettings.success(action.id, {
      settingsPermissions,
      selectedOrganizationSettings
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(initializeSettings.failure(action.id, error));
  }
  finally {
    yield put(initializeSettings.finally(action.id));
  }
}

function* initializeSettingsWatcher() :Generator<*, *, *> {
  yield takeEvery(INITIALIZE_SETTINGS, initializeSettingsWorker);
}


function* submitSettingsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitSettings.request(action.id));

    const settings = yield select(getSettingsState);

    const updatedSettings = { [APP_DETAILS]: [JSON.stringify(settings)] };

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);

    const updatedSettingsObject = getPropertyIdToValueMap(updatedSettings, edm);

    /*
     * Get Entity Set Ids
     */
    const settingsEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, ENTITY_KEY_ID], '');
    const settingsESID = getEntitySetIdFromApp(app, APP_SETTINGS);

    /*
     * Update Hearing Data
     */

    const updateResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: settingsESID,
        entities: { [settingsEKID]: updatedSettingsObject },
        updateType: UpdateTypes.PartialReplace
      })
    );
    if (updateResponse.error) throw updateResponse.error;

    /*
     * Get updated hearing
     */
    const settingsIdObject = createIdObject(settingsEKID, settingsESID);
    const settingsResponse = yield call(
      getEntityDataWorker,
      getEntityData(settingsIdObject)
    );
    if (settingsResponse.error) throw settingsResponse.error;
    const submittedSettings = fromJS(settingsResponse.data);

    yield put(submitSettings.success(action.id, {
      orgId,
      submittedSettings
    }));
  }

  catch (error) {
    LOG.error(error);
    yield put(submitSettings.failure(action.id, error));
  }
  finally {
    yield put(submitSettings.finally(action.id));
  }
}

function* submitSettingsWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_SETTINGS, submitSettingsWorker);
}

export { submitSettingsWatcher, initializeSettingsWatcher };
