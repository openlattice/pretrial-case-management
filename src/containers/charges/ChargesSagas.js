/*
 * @flow
 */
import type { SequenceAction } from 'redux-reqseq';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { Map, Set, fromJS } from 'immutable';
import {
  AuthorizationsApi,
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
import { getPropertyIdToValueMap, getPropertyTypeId } from '../../edm/edmUtils';
import { parseCsvToJson } from '../../utils/ReferenceChargeUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MAX_HITS } from '../../utils/consts/Consts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import {
  ADD_ARRESTING_AGENCY,
  CREATE_CHARGE,
  DELETE_CHARGE,
  IMPORT_BULK_CHARGES,
  LOAD_ARRESTING_AGENCIES,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  addArrestingAgency,
  createCharge,
  deleteCharge,
  importBulkCharges,
  loadArrestingAgencies,
  loadCharges,
  updateCharge
} from './ChargeActions';

const { ARREST, COURT } = CHARGE_TYPES;

const LOG :Logger = new Logger('ChargesSagas');

const { DeleteTypes, UpdateTypes } = Types;

const {
  createEntityAndAssociationData,
  deleteEntityData,
  getEntityData,
  updateEntityData
} = DataApiActions;
const {
  createEntityAndAssociationDataWorker,
  deleteEntityDataWorker,
  getEntityDataWorker,
  updateEntityDataWorker
} = DataApiSagas;

const {
  APPEARS_IN,
  ARREST_CHARGE_LIST,
  ARRESTING_AGENCIES,
  COUNTIES,
  COURT_CHARGE_LIST
} = APP_TYPES;
const {
  BHE,
  BRE,
  CHARGE_IS_VIOLENT,
  CHARGE_RCM_STEP_2,
  CHARGE_RCM_STEP_4,
  ENTITY_KEY_ID,
  ID,
  NAME,
  STRING_ID,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION
} = PROPERTY_TYPES;

const CHARGE_HEADERS = [
  'statute',
  'description',
  'degree',
  'short',
  'violent',
  'maxLevelIncrease',
  'singleLevelIncrease',
  'bhe',
  'bre'
];

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const getChargeESID = (chargeType :string, app :Map) => {
  let chargeESID = '';
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
};
/* addArrestingAgency() */

function* addArrestingAgencyWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(addArrestingAgency.request(action.id));
    const { agency, abbreviation, jurisdictions } = action.value;
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const stringIdPTID = getPropertyTypeId(edm, STRING_ID);
    const appearsInESID = getEntitySetIdFromApp(app, APPEARS_IN);
    const arrestAgenciesESID = getEntitySetIdFromApp(app, ARRESTING_AGENCIES);
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);

    const agencyObject = {
      [ID]: abbreviation,
      [NAME]: agency
    };

    const agencySubmitObject = getPropertyIdToValueMap(agencyObject, edm);

    const entities = {
      [arrestAgenciesESID]: [agencySubmitObject]
    };

    const associations = { [appearsInESID]: [] };
    jurisdictions.forEach((county) => {
      const { countyEKID, countyId } = county.value;
      const data = { [stringIdPTID]: [countyId] };
      associations[appearsInESID].push(
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: arrestAgenciesESID,
          dstEntityKeyId: countyEKID,
          dstEntitySetId: countiesESID
        }
      );
    });

    /*
    * Submit data and collect response
    */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;

    const { entityKeyIds } = response.data;
    const submittedAgencyEKID = entityKeyIds[arrestAgenciesESID][0];

    const checkInsResponse = yield call(
      getEntityDataWorker,
      getEntityData({
        entitySetId: arrestAgenciesESID,
        entityKeyId: submittedAgencyEKID
      })
    );
    if (checkInsResponse.error) throw checkInsResponse.error;
    const submittedAgency = fromJS(checkInsResponse.data);

    yield put(addArrestingAgency.success(action.id, {
      submittedAgency,
      submittedAgencyEKID
    }));

  }
  catch (error) {
    LOG.error(error);
    yield put(addArrestingAgency.failure(action.id, error));
  }
  finally {
    yield put(addArrestingAgency.finally(action.id));
  }
}
function* addArrestingAgencyWatcher() :Generator<*, *, *> {
  yield takeEvery(ADD_ARRESTING_AGENCY, addArrestingAgencyWorker);
}

/*
 * createArrestCharge()
 */

function* createChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(createCharge.request(action.id));
    let charge = Map();
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);

    const { chargeType, newChargeEntity } = action.value;

    const chargeESID = getChargeESID(chargeType, app);

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

function* importBulkChargesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const { value: { file, chargeType } } = action;
    if (!(chargeType === ARREST || chargeType === COURT)) {
      throw Error('Invalid chargeType');
    }
    yield put(importBulkCharges.request(action.id, { file, chargeType }));

    const chargeESID :string = getChargeESID(chargeType, app);
    const parseResponse = yield call(parseCsvToJson, { file, edm });
    const { data, headers } = parseResponse;
    const charges = data;

    if (
      headers.length !== 9
        || !headers.every((header) => CHARGE_HEADERS.includes(header))
    ) throw Error(`Incorrect headers in CSV. Headers must include only: ${CHARGE_HEADERS.join(', ')}`);

    const associations = {};
    const entities = { [chargeESID]: charges };

    /*
    * Submit data and collect response
    */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;

    /*
    * reload charges
    */
    yield put(loadCharges());

    yield put(importBulkCharges.success(action.id));
  }

  catch (error) {
    LOG.error(error);
    yield put(importBulkCharges.failure(action.id, { error }));
  }

  finally {
    yield put(importBulkCharges.finally(action.id));
  }
}
function* importBulkChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(IMPORT_BULK_CHARGES, importBulkChargesWorker);
}

/*
 * deleteCharge()
 */

function* deleteChargeWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(deleteCharge.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);

    const {
      charge,
      chargeEKID,
      chargeType
    } = action.value;

    const chargeESID = getChargeESID(chargeType, app);

    /*
    * Delete data and collect response
    */
    const deleteData = yield call(
      deleteEntityDataWorker,
      deleteEntityData({
        entityKeyIds: chargeEKID,
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
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);

    const { chargeType, chargeEKID, entities } = action.value;

    const chargeESID = getChargeESID(chargeType, app);

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
      entitySetIds: [arrestAgenciesEntitySetId],
      constraints: [{ constraints: [{ fuzzy: false, type: 'simple', searchTerm: '*' }]}],
      start: 0,
      maxHits: MAX_HITS
    };

    const allAgencyData = yield call(SearchApi.searchEntitySetData, options);
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

const setFlagsInMap = (map, field, ekid, singleValue) => map
  .set(field, map.get(field, Map()).set(ekid, singleValue));

const getChargeFields = (charge) => {
  const {
    [BHE]: chargeIsBHE,
    [BRE]: chargeIsBRE,
    [CHARGE_IS_VIOLENT]: chargeIsViolent,
    [CHARGE_RCM_STEP_2]: chargeIsMaxLevelIncrease,
    [CHARGE_RCM_STEP_4]: chargeIsSingleLevelIncrease,
    [ENTITY_KEY_ID]: entityKeyId,
    [REFERENCE_CHARGE_DESCRIPTION]: description,
    [REFERENCE_CHARGE_STATUTE]: statute,
  } = getEntityProperties(charge,
    [
      BHE,
      BRE,
      CHARGE_IS_VIOLENT,
      CHARGE_RCM_STEP_2,
      CHARGE_RCM_STEP_4,
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

  const { id } = action;
  try {
    yield put(loadCharges.request(id));
    const app = yield select(getApp);
    const selectedOrgId = yield select(getOrgId);
    const arrestChargesEntitySetId = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
    const courtChargesEntitySetId = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);

    const options = {
      entitySetIds: [],
      start: 0,
      maxHits: 10000,
      constraints: [{ constraints: [{ fuzzy: false, type: 'simple', searchTerm: '*' }]}]
    };
    const arrestOptions = options;
    const courtOptions = options;
    arrestOptions.entitySetIds = [arrestChargesEntitySetId]
    courtOptions.entitySetIds = [courtChargesEntitySetId]
    const persmissionsBody :Object[] = [
      { aclKey: [arrestChargesEntitySetId], permissions: ['WRITE'] },
      { aclKey: [courtChargesEntitySetId], permissions: ['WRITE'] }
    ];
    const chargePermissions = yield call(AuthorizationsApi.getAuthorizations, persmissionsBody);
    const arrestChargePermissions = permissionsSelector(arrestChargesEntitySetId, chargePermissions);
    const courtChargePermissions = permissionsSelector(courtChargesEntitySetId, chargePermissions);

    let [arrestCharges, courtCharges] = yield all([
      call(SearchApi.searchEntitySetData, arrestOptions),
      call(SearchApi.searchEntitySetData, courtOptions)
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

    // Collect violent, rcm, bhe and bre lists for arrest charges
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
        arrestChargesByFlag = setFlagsInMap(arrestChargesByFlag, CHARGE_DATA.ARREST_VIOLENT, entityKeyId, charge);
      }
      if (chargeIsMaxLevelIncrease) {
        arrestMaxLevelIncreaseCharges = setFieldInMap(arrestMaxLevelIncreaseCharges, statute, description);
        arrestChargesByFlag = setFlagsInMap(
          arrestChargesByFlag, CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE, entityKeyId, charge
        );
      }
      if (chargeIsSingleLevelIncrease) {
        arrestSingleLevelIncreaseCharges = setFieldInMap(arrestSingleLevelIncreaseCharges, statute, description);
        arrestChargesByFlag = setFlagsInMap(
          arrestChargesByFlag, CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE, entityKeyId, charge
        );
      }
      if (chargeIsBHE) {
        bookingHoldExceptionCharges = setFieldInMap(bookingHoldExceptionCharges, statute, description);
        arrestChargesByFlag = setFlagsInMap(arrestChargesByFlag, CHARGE_DATA.BHE, entityKeyId, charge);
      }
      if (chargeIsBRE) {
        bookingReleaseExceptionCharges = setFieldInMap(bookingReleaseExceptionCharges, statute, description);
        arrestChargesByFlag = setFlagsInMap(arrestChargesByFlag, CHARGE_DATA.BRE, entityKeyId, charge);
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
        courtChargesByFlag = setFlagsInMap(courtChargesByFlag, CHARGE_DATA.COURT_VIOLENT, entityKeyId, charge);
      }
      if (chargeIsMaxLevelIncrease) {
        courtMaxLevelIncreaseCharges = setFieldInMap(courtMaxLevelIncreaseCharges, statute, description);
        courtChargesByFlag = setFlagsInMap(
          courtChargesByFlag, CHARGE_DATA.COURT_MAX_LEVEL_INCREASE, entityKeyId, charge
        );
      }
      if (chargeIsSingleLevelIncrease) {
        courtSingleLevelIncreaseCharges = setFieldInMap(courtSingleLevelIncreaseCharges, statute, description);
        courtChargesByFlag = setFlagsInMap(
          courtChargesByFlag, CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE, entityKeyId, charge
        );
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
  addArrestingAgencyWatcher,
  createChargeWatcher,
  deleteChargesWatcher,
  importBulkChargesWatcher,
  loadArrestingAgenciesWatcher,
  loadChargesWatcher,
  updateChargesWatcher
};
