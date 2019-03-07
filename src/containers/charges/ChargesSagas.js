/*
 * @flow
 */
import { AuthorizationApi, SearchApi } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { Map, Set, fromJS } from 'immutable';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import { getEntitySetId } from '../../utils/AppUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, STATE } from '../../utils/consts/FrontEndStateConsts';
import {
  DELETE_CHARGE,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  deleteCharge,
  loadCharges,
  updateCharge
} from './ChargesActionFactory';

const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST } = APP_TYPES_FQNS;

const arrestChargeListFqn :string = ARREST_CHARGE_LIST.toString();
const courtChargeListFqn :string = COURT_CHARGE_LIST.toString();

const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

/*
 * deleteCharge()
 */

function* deleteChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entityKeyId, chargePropertyType } = action.value;
  const selectedOrganizationId = yield select(getOrgId);
  yield put(deleteCharge.success(action.id, {
    entityKeyId,
    selectedOrganizationId,
    chargePropertyType
  }));
}
function* deleteChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(DELETE_CHARGE, deleteChargeWorker);
}

/*
 * updateCharge()
 */


function* updateChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  const selectedOrganizationId = yield select(getOrgId);
  const {
    entity,
    entityKeyId,
    chargePropertyType
  } = action.value;
  yield put(updateCharge.success(action.id, {
    entity,
    entityKeyId,
    selectedOrganizationId,
    chargePropertyType
  }));
}
function* updateChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CHARGE, updateChargeWorker);
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
      call(SearchApi.searchEntitySetData, arrestChargesEntitySetId, {
        searchTerm: '*',
        start: 0,
        maxHits: 10000
      }),
      call(SearchApi.searchEntitySetData, courtChargesEntitySetId, {
        searchTerm: '*',
        start: 0,
        maxHits: 10000
      })
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
  deleteChargesWatcher,
  loadChargesWatcher,
  updateChargesWatcher
};
