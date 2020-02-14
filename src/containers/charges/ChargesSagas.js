/*
 * @flow
 */
import type { SequenceAction } from 'redux-reqseq';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { Map, Set, fromJS } from 'immutable';
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

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { getPropertyIdToValueMap } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MAX_HITS } from '../../utils/consts/Consts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
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
} from './ChargeActions';

const LOG :Logger = new Logger('ChargesSagas');

const { DeleteTypes, UpdateTypes } = Types;

const { deleteEntity, getEntityData, updateEntityData } = DataApiActions;
const { deleteEntityWorker, getEntityDataWorker, updateEntityDataWorker } = DataApiSagas;

const { ARREST_CHARGE_LIST, ARRESTING_AGENCIES, COURT_CHARGE_LIST } = APP_TYPES;
const {
  BHE,
  BRE,
  CHARGE_IS_VIOLENT,
  CHARGE_DMF_STEP_2,
  CHARGE_DMF_STEP_4,
  ENTITY_KEY_ID,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION
} = PROPERTY_TYPES;

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

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
    LOG.error(error);
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
    LOG.error(error);
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

    /*
     * Submit Updates
     */
    const response = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: chargeESID,
        entities,
        updateType: UpdateTypes.PartialReplace
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
    LOG.error(error);
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
    LOG.error(error);
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

const setFieldInMap = (map, field, singleValue) => map
  .set(field, map.get(field, Set()).add(singleValue));

const getChargeFields = (charge) => {
  const {
    [BHE]: chargeIsBHE,
    [BRE]: chargeIsBRE,
    [CHARGE_IS_VIOLENT]: chargeIsViolent,
    [CHARGE_DMF_STEP_2]: chargeIsMaxLevelIncrease,
    [CHARGE_DMF_STEP_4]: chargeIsSingleLevelIncrease,
    [ENTITY_KEY_ID]: entityKeyId,
    [REFERENCE_CHARGE_DESCRIPTION]: description,
    [REFERENCE_CHARGE_STATUTE]: statute,
  } = getEntityProperties(charge,
    [
      BHE,
      BRE,
      CHARGE_IS_VIOLENT,
      CHARGE_DMF_STEP_2,
      CHARGE_DMF_STEP_4,
      ENTITY_KEY_ID,
      REFERENCE_CHARGE_STATUTE,
      REFERENCE_CHARGE_DESCRIPTION
    ]);
  return {
    chargeIsBHE,
    chargeIsBRE,
    chargeIsViolent,
    chargeIsMaxLevelIncrease,
    chargeIsSingleLevelIncrease,
    description,
    entityKeyId,
    statute,
  };
};

function* loadChargesWorker(action :SequenceAction) :Generator<*, *, *> {
  /* Arrest */
  let arrestChargesById = Map();
  let arrestChargesByFlag = Map();
  let arrestMaxLevelIncreaseCharges = Map();
  let arrestSingleLevelIncreaseCharges = Map();
  let violentArrestCharges = Map();
  let bookingHoldExceptionCharges = Map();
  let bookingReleaseExceptionCharges = Map();

  /* Court */
  let courtChargesById = Map();
  let courtChargesByFlag = Map();
  let courtMaxLevelIncreaseCharges = Map();
  let courtSingleLevelIncreaseCharges = Map();
  let violentCourtCharges = Map();

  const { id, value } = action;
  const { arrestChargesEntitySetId, courtChargesEntitySetId, selectedOrgId } = value;
  try {
    yield put(loadCharges.request(id));

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


    let [arrestCharges, courtCharges] = yield all([
      call(SearchApi.searchEntitySetData, arrestChargesEntitySetId, options),
      call(SearchApi.searchEntitySetData, courtChargesEntitySetId, options)
    ]);
    const chargeError = arrestCharges.error || courtCharges.error;
    if (chargeError) throw chargeError;

    // reset values to data
    arrestCharges = fromJS(arrestCharges.hits);
    courtCharges = fromJS(courtCharges.hits);

    courtCharges.forEach((charge) => {
      const entityKeyId = getEntityKeyId(charge);
      courtChargesById = courtChargesById.set(entityKeyId, charge);
    });

    // Collect violent, dmf, bhe and bre lists for arrest charges
    arrestCharges.forEach((charge) => {
      const {
        chargeIsBHE,
        chargeIsBRE,
        chargeIsViolent,
        chargeIsMaxLevelIncrease,
        chargeIsSingleLevelIncrease,
        description,
        entityKeyId,
        statute,
      } = getChargeFields(charge);
      arrestChargesById = arrestChargesById.set(entityKeyId, charge);

      if (chargeIsViolent) {
        violentArrestCharges = setFieldInMap(violentArrestCharges, statute, description);
        arrestChargesByFlag = setFieldInMap(arrestChargesByFlag, CHARGE_DATA.ARREST_VIOLENT, entityKeyId);
      }
      if (chargeIsMaxLevelIncrease) {
        arrestMaxLevelIncreaseCharges = setFieldInMap(arrestMaxLevelIncreaseCharges, statute, description);
        arrestChargesByFlag = setFieldInMap(arrestChargesByFlag, CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE, entityKeyId);
      }
      if (chargeIsSingleLevelIncrease) {
        arrestSingleLevelIncreaseCharges = setFieldInMap(arrestSingleLevelIncreaseCharges, statute, description);
        arrestChargesByFlag = setFieldInMap(arrestChargesByFlag, CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE, entityKeyId);
      }
      if (chargeIsBHE) {
        bookingHoldExceptionCharges = setFieldInMap(bookingHoldExceptionCharges, statute, description);
        arrestChargesByFlag = setFieldInMap(arrestChargesByFlag, CHARGE_DATA.BHE, entityKeyId);
      }
      if (chargeIsBRE) {
        bookingReleaseExceptionCharges = setFieldInMap(bookingReleaseExceptionCharges, statute, description);
        arrestChargesByFlag = setFieldInMap(arrestChargesByFlag, CHARGE_DATA.BRE, entityKeyId);
      }
    });

    // Collect violent list for court charges
    courtCharges.forEach((charge) => {
      const {
        chargeIsViolent,
        chargeIsMaxLevelIncrease,
        chargeIsSingleLevelIncrease,
        description,
        entityKeyId,
        statute,
      } = getChargeFields(charge);
      courtChargesById = courtChargesById.set(entityKeyId, charge);
      if (chargeIsViolent) {
        violentCourtCharges = setFieldInMap(violentCourtCharges, statute, description);
        courtChargesByFlag = setFieldInMap(courtChargesByFlag, CHARGE_DATA.COURT_VIOLENT, entityKeyId);
      }
      if (chargeIsMaxLevelIncrease) {
        courtMaxLevelIncreaseCharges = setFieldInMap(courtMaxLevelIncreaseCharges, statute, description);
        courtChargesByFlag = setFieldInMap(courtChargesByFlag, CHARGE_DATA.COURT_MAX_LEVEL_INCREASE, entityKeyId);
      }
      if (chargeIsSingleLevelIncrease) {
        courtSingleLevelIncreaseCharges = setFieldInMap(courtSingleLevelIncreaseCharges, statute, description);
        courtChargesByFlag = setFieldInMap(courtChargesByFlag, CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE, entityKeyId);
      }
    });

    yield put(loadCharges.success(id, {
      arrestCharges,
      arrestChargesById,
      arrestChargesByFlag,
      arrestChargePermissions,
      arrestMaxLevelIncreaseCharges,
      arrestSingleLevelIncreaseCharges,
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      courtCharges,
      courtChargesById,
      courtChargesByFlag,
      courtChargePermissions,
      courtMaxLevelIncreaseCharges,
      courtSingleLevelIncreaseCharges,
      violentArrestCharges,
      violentCourtCharges,
      selectedOrgId
    }));
  }
  catch (error) {
    LOG.error(error);
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
