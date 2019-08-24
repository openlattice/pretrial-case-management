/*
 * @flow
 */
import { Map, Set, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import {
  AuthorizationApi,
  DataApi,
  SearchApi,
  Types
} from 'lattice';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { getPropertyIdToValueMap } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MAX_HITS } from '../../utils/consts/Consts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import {
  CREATE_CHARGE,
  DELETE_CHARGE,
  LOAD_ARRESTING_AGENCIES,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  createCharge,
  deleteCharge,
  loadArrestingAgencies,
  loadCharges,
  updateCharge
} from './ChargesActionFactory';

const { DeleteTypes } = Types;

const { deleteEntity, getEntityData, updateEntityData } = DataApiActions;
const { deleteEntityWorker, getEntityDataWorker, updateEntityDataWorker } = DataApiSagas;

const { ARREST_CHARGE_LIST, ARRESTING_AGENCIES, COURT_CHARGE_LIST } = APP_TYPES;
const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

function* getChargeESID(chargeType :string) :Generator<*, *, *> {
  const app = yield select(getApp);
  let chargeESID;
  switch (chargeType) {
    case CHARGE_TYPES.ARREST:
      chargeESID = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
      break;
    case CHARGE_TYPES.COURT:
      chargeESID = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
      break;
    default:
      break;
  }
  return chargeESID;
}

/*
 * createArrestCharge()
 */

function* createChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(createCharge.request(action.id));
    let charge = Map();
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);

    const { chargeType, newChargeEntity } = action.value;

    const chargeESID = yield call(getChargeESID, chargeType);

    const chargeSubmitEntity = getPropertyIdToValueMap(newChargeEntity, edm);

    /*
    * Submit data and collect response
    */
    const [chargeEKID] = yield call(
      DataApi.createOrMergeEntityData,
      chargeESID,
      [chargeSubmitEntity]
    );

    /*
    * Get Charge Info
    */

    const chargeData = yield call(
      getEntityDataWorker,
      getEntityData({
        entitySetId: chargeESID,
        entityKeyId: chargeEKID
      })
    );
    if (chargeData.error) throw chargeData.error;
    charge = fromJS(chargeData.data);


    yield put(createCharge.success(action.id, {
      charge,
      chargeEKID,
      chargeType,
      orgId
    }));

  }
  catch (error) {
    console.error(error);
    yield put(createCharge.failure(action.id, error));
  }
  finally {
    yield put(createCharge.finally(action.id));
  }
}
function* createChargeWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_CHARGE, createChargeWorker);
}

/*
 * deleteCharge()
 */

function* deleteChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(deleteCharge.request(action.id));
    const orgId = yield select(getOrgId);

    const {
      charge,
      chargeEKID,
      chargeType
    } = action.value;

    const chargeESID = yield call(getChargeESID, chargeType);

    /*
    * Delete data and collect response
    */
    const deleteData = yield call(
      deleteEntityWorker,
      deleteEntity({
        entityKeyId: chargeEKID,
        entitySetId: chargeESID,
        deleteType: DeleteTypes.Soft
      })
    );
    if (deleteData.error) throw deleteData.error;


    yield put(deleteCharge.success(action.id, {
      charge,
      chargeEKID,
      chargeType,
      orgId
    }));

  }
  catch (error) {
    console.error(error);
    yield put(deleteCharge.failure(action.id, error));
  }
  finally {
    yield put(deleteCharge.finally(action.id));
  }
}
function* deleteChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(DELETE_CHARGE, deleteChargeWorker);
}

/*
 * updateCharge()
 */


function* updateChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateCharge.request(action.id));
    let charge = Map();
    const orgId = yield select(getOrgId);

    const { chargeType, chargeEKID, entities } = action.value;

    const chargeESID = yield call(getChargeESID, chargeType);

    const updateType = 'PartialReplace';

    /*
     * Submit Updates
     */
    const response = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: chargeESID,
        entities,
        updateType
      })
    );

    if (response.error) throw response.error;

    /*
    * Get Charge Info
    */

    const chargeData = yield call(
      getEntityDataWorker,
      getEntityData({
        entitySetId: chargeESID,
        entityKeyId: chargeEKID
      })
    );
    if (chargeData.error) throw chargeData.error;
    charge = fromJS(chargeData.data);


    yield put(updateCharge.success(action.id, {
      charge,
      chargeEKID,
      chargeType,
      orgId
    }));
  }
  catch (error) {
    console.error(error);
    yield put(updateCharge.failure(action.id, error));
  }
  finally {
    yield put(updateCharge.finally(action.id));
  }

}
function* updateChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CHARGE, updateChargeWorker);
}

/*
 * loadArrestingAgencies()
 */

function* loadArrestingAgenciesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadArrestingAgencies.request(action.id));
    const app = yield select(getApp);
    const arrestAgenciesEntitySetId = getEntitySetIdFromApp(app, ARRESTING_AGENCIES);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: MAX_HITS
    };

    const allAgencyData = yield call(SearchApi.searchEntitySetData, arrestAgenciesEntitySetId, options);
    let allAgencies = Map();
    fromJS(allAgencyData.hits).forEach((agency) => {
      const { [ENTITY_KEY_ID]: angencyEntityKeyId } = getEntityProperties(agency, [ENTITY_KEY_ID]);
      allAgencies = allAgencies.set(angencyEntityKeyId, agency);
    });
    yield put(loadArrestingAgencies.success(action.id, { allAgencies }));
  }
  catch (error) {
    console.error(error);
    yield put(loadArrestingAgencies.failure(action.id, error));
  }
  finally {
    yield put(loadArrestingAgencies.finally(action.id));
  }
}

function* loadArrestingAgenciesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ARRESTING_AGENCIES, loadArrestingAgenciesWorker);
}

/*
 * loadCharges()
 */

const permissionsSelector = (entitySetId, permissions) => {
  let hasPermission;
  permissions.forEach((perm) => {
    if (perm.aclKey[0] === entitySetId) {
      hasPermission = perm.permissions.WRITE;
    }
  });
  return hasPermission;
};

function* loadChargesWorker(action :SequenceAction) :Generator<*, *, *> {
  let violentArrestCharges = Map();
  let violentCourtCharges = Map();
  let dmfStep2Charges = Map();
  let dmfStep4Charges = Map();
  let bookingReleaseExceptionCharges = Map();
  let bookingHoldExceptionCharges = Map();
  const { id, value } = action;
  const { arrestChargesEntitySetId, courtChargesEntitySetId, selectedOrgId } = value;

  const options = {
    start: 0,
    maxHits: 10000,
    searchTerm: '*'
  };

  const chargePermissions = yield call(AuthorizationApi.checkAuthorizations, [
    { aclKey: [arrestChargesEntitySetId], permissions: ['WRITE'] },
    { aclKey: [courtChargesEntitySetId], permissions: ['WRITE'] }
  ]);
  const arrestChargePermissions = permissionsSelector(arrestChargesEntitySetId, chargePermissions);
  const courtChargePermissions = permissionsSelector(courtChargesEntitySetId, chargePermissions);

  try {
    yield put(loadCharges.request(id));
    let arrestChargesByEntityKeyId = Map();
    let courtChargesByEntityKeyId = Map();

    let [arrestCharges, courtCharges] = yield all([
      call(SearchApi.searchEntitySetData, arrestChargesEntitySetId, options),
      call(SearchApi.searchEntitySetData, courtChargesEntitySetId, options)
    ]);
    const chargeError = arrestCharges.error || courtCharges.error;
    if (chargeError) throw chargeError;

    // reset values to data
    arrestCharges = fromJS(arrestCharges.hits);
    courtCharges = fromJS(courtCharges.hits);

    // Map charges by EnityKeyId for easy state update
    arrestCharges.forEach((charge) => {
      const entityKeyId = getEntityKeyId(charge);
      arrestChargesByEntityKeyId = arrestChargesByEntityKeyId.set(entityKeyId, charge);
    });

    courtCharges.forEach((charge) => {
      const entityKeyId = getEntityKeyId(charge);
      courtChargesByEntityKeyId = courtChargesByEntityKeyId.set(entityKeyId, charge);
    });

    // Collect violent, dmf, bhe and bre lists for arrest charges
    arrestCharges.forEach((charge) => {
      const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
      const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
      if (charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false)) {
        violentArrestCharges = violentArrestCharges.set(
          statute,
          violentArrestCharges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_2, 0], false)) {
        dmfStep2Charges = dmfStep2Charges.set(
          statute,
          dmfStep2Charges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_4, 0], false)) {
        dmfStep4Charges = dmfStep4Charges.set(
          statute,
          dmfStep4Charges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.BRE, 0], false)) {
        bookingReleaseExceptionCharges = bookingReleaseExceptionCharges.set(
          statute,
          bookingReleaseExceptionCharges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.BHE, 0], false)) {
        bookingHoldExceptionCharges = bookingHoldExceptionCharges.set(
          statute,
          bookingHoldExceptionCharges.get(statute, Set()).add(description)
        );
      }
    });

    // Collect violent list for court charges
    courtCharges.forEach((charge) => {
      const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
      const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
      if (charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false)) {
        violentCourtCharges = violentCourtCharges.set(
          statute,
          violentCourtCharges.get(statute, Set()).add(description)
        );
      }
    });

    yield put(loadCharges.success(id, {
      arrestCharges,
      arrestChargesByEntityKeyId,
      arrestChargePermissions,
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      courtCharges,
      courtChargesByEntityKeyId,
      courtChargePermissions,
      dmfStep2Charges,
      dmfStep4Charges,
      selectedOrgId,
      violentArrestCharges,
      violentCourtCharges
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadCharges.failure(id, error));
  }
  finally {
    yield put(loadCharges.finally(id));
  }
}

function* loadChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CHARGES, loadChargesWorker);
}

export {
  createChargeWatcher,
  deleteChargesWatcher,
  loadArrestingAgenciesWatcher,
  loadChargesWatcher,
  updateChargesWatcher
};
