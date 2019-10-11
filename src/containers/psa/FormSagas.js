/*
 * @flow
 */
import { DateTime } from 'luxon';
import { fromJS, List, Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import { AuthUtils } from 'lattice-auth';
import { Constants, Types } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { loadPSAData } from '../review/ReviewActionFactory';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { createIdObject, getEntityProperties, getEntityKeyId } from '../../utils/DataUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import {
  ADD_CASE_TO_PSA,
  EDIT_PSA,
  LOAD_NEIGHBORS,
  REMOVE_CASE_FROM_PSA,
  SUBMIT_PSA,
  addCaseToPSA,
  editPSA,
  loadNeighbors,
  removeCaseFromPSA,
  submitPSA,
} from './FormActionFactory';

const {
  COMPLETED_DATE_TIME,
  DATE_TIME,
  ENTITY_KEY_ID,
  GENERAL_ID,
  PERSON_ID,
  TIMESTAMP,
  STRING_ID
} = PROPERTY_TYPES;

const {
  APPEARS_IN,
  ARREST_CASES,
  ASSESSED_BY,
  ARREST_CHARGES,
  BONDS,
  CALCULATED_FOR,
  CHARGED_WITH,
  CHARGES,
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  EDITED_BY,
  FTAS,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_REMINDERS,
  MANUAL_PRETRIAL_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  SENTENCES,
  STAFF
} = APP_TYPES;

const {
  createAssociations,
  createEntityAndAssociationData,
  deleteEntity,
  getEntityData
} = DataApiActions;
const {
  createAssociationsWorker,
  createEntityAndAssociationDataWorker,
  deleteEntityWorker,
  getEntityDataWorker
} = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

const { DeleteTypes } = Types;

const LIST_ENTITY_SETS = List.of(
  STAFF,
  RELEASE_CONDITIONS,
  HEARINGS,
  PRETRIAL_CASES,
  CHECKIN_APPOINTMENTS,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
);

const getStaffId = () => {
  const staffInfo = AuthUtils.getUserInfo();
  let staffId = staffInfo.id;
  if (staffInfo.email && staffInfo.email.length > 0) {
    staffId = staffInfo.email;
  }
  return staffId;
};

function* addCaseToPSAWorker(action :SequenceAction) :Generator<*, *, *> {
  const { psaEKID, caseEKID } = action.value;
  try {
    yield put(addCaseToPSA.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Property Type Ids
     */
    const timestampPTID = getPropertyTypeId(edm, TIMESTAMP);

    /*
     * Get Entity Set Ids
     */
    const calculatedForESID = getEntitySetIdFromApp(app, CALCULATED_FOR);
    const pretrialCasesESID = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);

    /*
     * Assemble Assoociations
     */

    const data = { [timestampPTID]: [DateTime.local().toISO()] };
    const src = createIdObject(psaEKID, psaScoresESID);
    const dst = createIdObject(caseEKID, pretrialCasesESID);

    const associations = {
      [calculatedForESID]: [{ data, dst, src }]
    };

    /*
     * Submit Associations
     */
    const response = yield call(
      createAssociationsWorker,
      createAssociations(associations)
    );

    if (response.error) throw response.error;

    /*
     * Get updated staff data for psa
     */

    let psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: [psaEKID],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [pretrialCasesESID]
        }
      })
    );

    if (psaNeighborsById.error) throw psaNeighborsById.error;
    psaNeighborsById = fromJS(psaNeighborsById.data);
    const psaNeighbors = psaNeighborsById.get(psaEKID, List());

    /*
     * Format Neighbors
     */
    const pretrialCaseNeighbors = psaNeighbors.filter((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      return appTypeFqn && appTypeFqn === PRETRIAL_CASES;
    });

    yield put(addCaseToPSA.success(action.id, { psaEKID, pretrialCaseNeighbors }));
  }

  catch (error) {
    console.error(error);
    yield put(addCaseToPSA.failure(action.id, error));
  }
  finally {
    yield put(addCaseToPSA.finally(action.id));
  }
}

function* addCaseToPSAWatcher() :Generator<*, *, *> {
  yield takeEvery(ADD_CASE_TO_PSA, addCaseToPSAWorker);
}

function* removeCaseFromPSAWorker(action :SequenceAction) :Generator<*, *, *> {
  const { associationEKID, psaEKID } = action.value;
  try {
    yield put(removeCaseFromPSA.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Entity Set Ids
     */
    const calculatedForESID = getEntitySetIdFromApp(app, CALCULATED_FOR);
    const pretrialCasesESID = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);

    /*
     * Delete data and collect response
     */
    const deleteData = yield call(
      deleteEntityWorker,
      deleteEntity({
        entityKeyId: associationEKID,
        entitySetId: calculatedForESID,
        deleteType: DeleteTypes.Soft
      })
    );

    if (deleteData.error) throw deleteData.error;

    /*
     * Get updated staff data for psa
     */

    let psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: [psaEKID],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [pretrialCasesESID]
        }
      })
    );

    if (psaNeighborsById.error) throw psaNeighborsById.error;
    psaNeighborsById = fromJS(psaNeighborsById.data);
    const psaNeighbors = psaNeighborsById.get(psaEKID, List());

    /*
     * Format Neighbors
     */
    const pretrialCaseNeighbors = psaNeighbors.filter((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      return appTypeFqn && appTypeFqn === PRETRIAL_CASES;
    });

    yield put(removeCaseFromPSA.success(action.id, {
      psaEKID,
      pretrialCaseNeighbors
    }));
  }

  catch (error) {
    console.error(error);
    yield put(removeCaseFromPSA.failure(action.id, error));
  }
  finally {
    yield put(removeCaseFromPSA.finally(action.id));
  }
}

function* removeCaseFromPSAWatcher() :Generator<*, *, *> {
  yield takeEvery(REMOVE_CASE_FROM_PSA, removeCaseFromPSAWorker);
}

function* editPSAWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    includesPretrialModule,
    psaEKID,
    psaRiskFactorsEKID,
    rcmEKID,
    rcmRiskFactorsEKID
  } = action.value;
  try {
    yield put(editPSA.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Staff Entity Key Id
     */
    const staffIdsToEntityKeyIds = app.get(APP_DATA.STAFF_IDS_TO_EKIDS, Map());
    const staffId = getStaffId();
    const staffEKID = staffIdsToEntityKeyIds.get(staffId, '');

    /*
     * Get Property Type Ids
     */
    const datetimePTID = getPropertyTypeId(edm, DATE_TIME);

    /*
     * Get Entity Set Ids
     */
    const editedBynESID = getEntitySetIdFromApp(app, EDITED_BY);
    const rcmResultsESID = getEntitySetIdFromApp(app, RCM_RESULTS);
    const rcmRiskFactorsESID = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
    const psaRiskFactorsESID = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const staffESID = getEntitySetIdFromApp(app, STAFF);

    /*
     * Assemble Assoociations
     */

    const data = { [datetimePTID]: [DateTime.local().toISO()] };
    const dst = createIdObject(staffEKID, staffESID);
    const psaSource = createIdObject(psaEKID, psaScoresESID);
    const psaRiskFactorsSource = createIdObject(psaRiskFactorsEKID, psaRiskFactorsESID);
    const rcmResultsSource = createIdObject(rcmEKID, rcmResultsESID);
    const rcmRiskFactorsSource = createIdObject(rcmRiskFactorsEKID, rcmRiskFactorsESID);

    const associations = {
      [editedBynESID]: [{ data, dst, src: psaSource }]
    };

    if (psaRiskFactorsEKID) {
      associations[editedBynESID] = associations[editedBynESID].concat([{ data, dst, src: psaRiskFactorsSource }]);
    }

    if (includesPretrialModule) {
      associations[editedBynESID] = associations[editedBynESID].concat([
        { data, dst, src: rcmResultsSource },
        { data, dst, src: rcmRiskFactorsSource }
      ]);
    }

    /*
     * Submit Associations
     */
    const response = yield call(
      createAssociationsWorker,
      createAssociations(associations)
    );

    if (response.error) throw response.error;

    /*
     * Get updated staff data for psa
     */

    let psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: [psaEKID],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [staffESID]
        }
      })
    );

    if (psaNeighborsById.error) throw psaNeighborsById.error;
    psaNeighborsById = fromJS(psaNeighborsById.data);
    const psaNeighbors = psaNeighborsById.get(psaEKID, List());

    /*
     * Format Neighbors
     */
    const staffNeighbors = psaNeighbors.filter((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      return appTypeFqn && appTypeFqn === STAFF;
    });

    yield put(editPSA.success(action.id, {
      psaEKID,
      staffNeighbors
    }));
  }

  catch (error) {
    console.error(error);
    yield put(editPSA.failure(action.id, error));
  }
  finally {
    yield put(editPSA.finally(action.id));
  }
}

function* editPSAWatcher() :Generator<*, *, *> {
  yield takeEvery(EDIT_PSA, editPSAWorker);
}

const getOpenPSAIds = (neighbors, psaScoresEntitySetId) => {
  if (!neighbors) return [];
  return neighbors.filter((neighbor) => {
    if (neighbor.neighborEntitySet && neighbor.neighborEntitySet.id === psaScoresEntitySetId) {
      const statusValues = neighbor.neighborDetails[PROPERTY_TYPES.STATUS];
      if (statusValues && statusValues.includes(PSA_STATUSES.OPEN)) {
        return true;
      }
    }
    return false;
  }).map(neighbor => neighbor.neighborDetails[OPENLATTICE_ID_FQN][0]);
};

function* getOpenPSANeighbors(neighbors) :Generator<*, *, *> {

  let openPSANeighbors = {};
  const app = yield select(getApp);
  /*
   * Get Entity Set Ids
   */
  const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
  const arrestChargesEntitySetId = getEntitySetIdFromApp(app, ARREST_CHARGES);
  const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
  const rcmResultsEntitySetId = getEntitySetIdFromApp(app, RCM_RESULTS);
  const rcmRiskFactorsEntitySetId = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
  const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
  const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
  const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
  const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
  const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
  const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
  const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
  const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
  const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
  const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
  /*
   * Get PSA Ids
   */
  const openPSAIds = getOpenPSAIds(neighbors, psaScoresEntitySetId);
  /*
   * Get PSA Neighbors
   */
  if (openPSAIds.length) {
    const psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresEntitySetId,
        filter: {
          entityKeyIds: openPSAIds,
          sourceEntitySetIds: [
            bondsEntitySetId,
            rcmResultsEntitySetId,
            outcomesEntitySetId,
            releaseRecommendationsEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [
            arrestCasesEntitySetId,
            arrestChargesEntitySetId,
            rcmRiskFactorsEntitySetId,
            hearingsEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            manualPretrialCasesEntitySetId,
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            pretrialCasesEntitySetId,
            staffEntitySetId
          ]
        }
      })
    );
    if (psaNeighborsById.error) throw psaNeighborsById.error;
    openPSANeighbors = psaNeighborsById.data;
  }
  return openPSANeighbors;
}

function* loadNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { entityKeyId } = action.value;

  let scoresAsMap = Map();

  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map());

  /*
   * Get Entity Set Ids
   */
  const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
  const arrestChargesEntitySetId = getEntitySetIdFromApp(app, ARREST_CHARGES);
  const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
  const chargesEntitySetId = getEntitySetIdFromApp(app, CHARGES);
  const checkInAppointmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
  const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
  const rcmResultsEntitySetId = getEntitySetIdFromApp(app, RCM_RESULTS);
  const rcmRiskFactorsEntitySetId = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
  const ftaEntitySetId = getEntitySetIdFromApp(app, FTAS);
  const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
  const manualChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_CHARGES);
  const manualCourtChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_COURT_CHARGES);
  const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
  const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
  const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
  const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
  const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
  const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
  const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
  const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
  const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
  const sentencesEntitySetId = getEntitySetIdFromApp(app, SENTENCES);

  try {
    yield put(loadNeighbors.request(action.id));
    /*
     * Get Neighbors
     */
    let peopleNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: [entityKeyId],
          sourceEntitySetIds: [
            bondsEntitySetId,
            checkInAppointmentsEntitySetId,
            contactInformationEntitySetId,
            rcmResultsEntitySetId,
            rcmRiskFactorsEntitySetId,
            ftaEntitySetId,
            manualRemindersEntitySetId,
            outcomesEntitySetId,
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            psaScoresEntitySetId,
            releaseConditionsEntitySetId,
            releaseRecommendationsEntitySetId
          ],
          destinationEntitySetIds: [
            arrestCasesEntitySetId,
            arrestChargesEntitySetId,
            chargesEntitySetId,
            hearingsEntitySetId,
            manualChargesEntitySetId,
            manualCourtChargesEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            pretrialCasesEntitySetId,
            manualPretrialCasesEntitySetId,
            sentencesEntitySetId
          ]
        }
      })
    );
    if (peopleNeighborsById.error) throw peopleNeighborsById.error;
    peopleNeighborsById = fromJS(peopleNeighborsById.data);
    const neighbors = peopleNeighborsById.get(entityKeyId, List());

    const openPSAs = yield call(getOpenPSANeighbors, neighbors.toJS());
    fromJS(neighbors).forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const { [ENTITY_KEY_ID]: neighborEntityKeyId } = getEntityProperties(neighbor, [ENTITY_KEY_ID]);
      const neighborDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === PSA_SCORES) {
        scoresAsMap = scoresAsMap.set(neighborEntityKeyId, neighborDetails);
      }
    });

    yield put(loadNeighbors.success(action.id, { neighbors, openPSAs, entitySetIdsToAppType }));
    if (scoresAsMap.size) {
      yield put(loadPSAData({ psaIds: scoresAsMap.keySeq().toJS(), scoresAsMap }));
    }
  }
  catch (error) {
    console.error(error);
    yield put(loadNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadNeighbors.finally(action.id));
  }
}

function* loadNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_NEIGHBORS, loadNeighborsWorker);
}

function* getPSAScoresAndNeighbors(psaScoresEKID :string) :Generator<*, *, *> {
  let psaScoresEntity = Map();
  let psaNeighborsByAppTypeFqn = Map();

  if (psaScoresEKID) {
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    /*
     * Get Entity Set Ids
     */
    const arrestCasesESID = getEntitySetIdFromApp(app, ARREST_CASES);
    const bondsESID = getEntitySetIdFromApp(app, BONDS);
    const bookingReleaseConditionsESID = getEntitySetIdFromApp(app, RCM_BOOKING_CONDITIONS);
    const courtReleaseConditionsESID = getEntitySetIdFromApp(app, RCM_COURT_CONDITIONS);
    const rcmResultsESID = getEntitySetIdFromApp(app, RCM_RESULTS);
    const rcmRiskFactorsESID = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const manualPretrialCasesESID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const manualPretrialCourtCasesESID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const outcomesESID = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const pretrialCasesESID = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaRiskFactorsESID = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const releaseConditionsESID = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const releaseRecommendationsESID = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const staffESID = getEntitySetIdFromApp(app, STAFF);


    /*
    * Get PSA Score Info
    */
    const psaIdObject = createIdObject(psaScoresEKID, psaScoresESID);
    const psaResponse = yield call(
      getEntityDataWorker,
      getEntityData(psaIdObject)
    );
    if (psaResponse.error) throw psaResponse.error;
    psaScoresEntity = fromJS(psaResponse.data);

    /*
    * Get Neighbors
    */
    let psaScoresNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: [psaScoresEKID],
          sourceEntitySetIds: [
            bookingReleaseConditionsESID,
            courtReleaseConditionsESID,
            rcmResultsESID,
            releaseRecommendationsESID,
            bondsESID,
            outcomesESID,
            releaseConditionsESID
          ],
          destinationESIDs: [
            arrestCasesESID,
            rcmRiskFactorsESID,
            hearingsESID,
            manualPretrialCasesESID,
            manualPretrialCourtCasesESID,
            peopleESID,
            pretrialCasesESID,
            psaRiskFactorsESID,
            staffESID
          ]
        }
      })
    );
    if (psaScoresNeighborsById.error) throw psaScoresNeighborsById.error;
    psaScoresNeighborsById = fromJS(psaScoresNeighborsById.data);

    const psaNeighbors = psaScoresNeighborsById.get(psaScoresEKID, List());

    /*
     * Format Neighbors
     */

    psaNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn) {
        if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
          psaNeighborsByAppTypeFqn = psaNeighborsByAppTypeFqn.set(
            appTypeFqn,
            psaNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighbor))
          );
        }
        else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
          psaNeighborsByAppTypeFqn = psaNeighborsByAppTypeFqn.set(MANUAL_PRETRIAL_CASES, neighbor);
        }
        else {
          psaNeighborsByAppTypeFqn = psaNeighborsByAppTypeFqn.set(appTypeFqn, fromJS(neighbor));
        }
      }
    });
  }

  return { psaScoresEntity, psaNeighborsByAppTypeFqn };
}


function* submitPSAWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitPSA.request(action.id));
    const {
      arrestCaseEKID,
      bookingConditionsWithIds,
      caseEntity,
      chargeEntities,
      courtConditionsWithIds,
      rcmResultsEntity,
      rcmRiskFactorsEntity,
      includesPretrialModule,
      manualCourtCasesAndCharges,
      personEKID,
      staffEKID,
      psaEntity,
      psaRiskFactorsEntity,
      psaNotesEntity
    } = action.value;

    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    /*
     * Get Entity Set Ids
     */
    const arrestCasesESID = getEntitySetIdFromApp(app, ARREST_CASES);
    const appearsInESID = getEntitySetIdFromApp(app, APPEARS_IN);
    const assessedByESID = getEntitySetIdFromApp(app, ASSESSED_BY);
    const calculatedForESID = getEntitySetIdFromApp(app, CALCULATED_FOR);
    const chargedWithESID = getEntitySetIdFromApp(app, CHARGED_WITH);
    const rcmResultsESID = getEntitySetIdFromApp(app, RCM_RESULTS);
    const rcmRiskFactorsESID = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
    const bookingReleaseConditionsESID = getEntitySetIdFromApp(app, RCM_BOOKING_CONDITIONS);
    const courtReleaseConditionsESID = getEntitySetIdFromApp(app, RCM_COURT_CONDITIONS);
    const psaRiskFactorsESID = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const psaNotesESID = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const staffESID = getEntitySetIdFromApp(app, STAFF);

    const caseESID = manualCourtCasesAndCharges
      ? getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES)
      : getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);

    const chargeESID = manualCourtCasesAndCharges
      ? getEntitySetIdFromApp(app, MANUAL_COURT_CHARGES)
      : getEntitySetIdFromApp(app, MANUAL_CHARGES);

    /*
     * Get Prooperty Type Ids
     */
    const completedDateTimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const timeStampPTID = getPropertyTypeId(edm, TIMESTAMP);
    const dateTimePTID = getPropertyTypeId(edm, DATE_TIME);
    const stringIdPTID = getPropertyTypeId(edm, STRING_ID);

    /*
     * Assemble Entities
     */
    const psaSubmitEntity = getPropertyIdToValueMap(psaEntity, edm);
    psaSubmitEntity[dateTimePTID] = [DateTime.local().toISO()];
    const psaRiskFactorsSubmitEntity = getPropertyIdToValueMap(psaRiskFactorsEntity, edm);
    const psaNotesSubmitEntity = getPropertyIdToValueMap(psaNotesEntity, edm);
    const rcmResultsSubmitEntity = getPropertyIdToValueMap(rcmResultsEntity, edm);
    const rcmRiskFactorsSubmitEntity = getPropertyIdToValueMap(rcmRiskFactorsEntity, edm);
    const caseSubmitEntity = getPropertyIdToValueMap(caseEntity, edm);

    const entities = {
      [psaScoresESID]: [psaSubmitEntity],
      [psaRiskFactorsESID]: [psaRiskFactorsSubmitEntity],
      [psaNotesESID]: [psaNotesSubmitEntity],
      [rcmResultsESID]: [rcmResultsSubmitEntity],
      [rcmRiskFactorsESID]: [rcmRiskFactorsSubmitEntity],
      [caseESID]: [caseSubmitEntity]
    };

    let staffDstKey = 'dstEntityKeyId';
    let staffDstVal = staffEKID;
    if (!staffDstVal) {
      const staffId = getStaffId();
      const staffEntity = { [PERSON_ID]: [staffId] };
      const staffSubmitEntity = getPropertyIdToValueMap(staffEntity, edm);
      entities[staffESID] = [staffSubmitEntity];
      staffDstKey = 'dstEntityIndex';
      staffDstVal = 0;
    }

    /*
     * Assemble Associations
     */

    // Association Data
    const caseNum = caseEntity[GENERAL_ID];
    const calculatedForData = { [timeStampPTID]: [DateTime.local().toISO()] };
    const assessedByData = { [completedDateTimePTID]: [DateTime.local().toISO()] };
    const appearsInData = { [stringIdPTID]: [caseNum] };
    const chargedWithData = { [stringIdPTID]: [caseNum] };

    const associations = {
      [calculatedForESID]: [
        // PSA Scores calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaScoresESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaScoresESID,
          dstEntityIndex: 0,
          dstEntitySetId: psaRiskFactorsESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaScoresESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        // Risk Factors calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaRiskFactorsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaRiskFactorsESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        // Notes calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          dstEntityIndex: 0,
          dstEntitySetId: psaRiskFactorsESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          dstEntityIndex: 0,
          dstEntitySetId: psaScoresESID
        }
      ],
      [assessedByESID]: [
        // _____ assessed by staff
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: psaScoresESID,
          [staffDstKey]: staffDstVal,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: psaRiskFactorsESID,
          [staffDstKey]: staffDstVal,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmResultsESID,
          [staffDstKey]: staffDstVal,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmRiskFactorsESID,
          [staffDstKey]: staffDstVal,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          [staffDstKey]: staffDstVal,
          dstEntitySetId: staffESID
        }
      ],
      [appearsInESID]: [
        // person appears in manual case
        {
          data: appearsInData,
          srcEntityKeyId: personEKID,
          srcEntitySetId: peopleESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        }
      ]
    };

    if (includesPretrialModule) {
      associations[calculatedForESID] = associations[calculatedForESID].concat([
        // PSA Scores calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaScoresESID,
          dstEntityIndex: 0,
          dstEntitySetId: rcmRiskFactorsESID
        },
        // RCM Risk Factors calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmRiskFactorsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmRiskFactorsESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        // RCM calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmResultsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmResultsESID,
          dstEntityIndex: 0,
          dstEntitySetId: rcmRiskFactorsESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmResultsESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmResultsESID,
          dstEntityIndex: 0,
          dstEntitySetId: psaScoresESID
        }
      ]);
    }

    if (arrestCaseEKID) {
      associations[calculatedForESID] = associations[calculatedForESID].concat(
        [{
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaScoresESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaRiskFactorsESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmRiskFactorsESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: rcmResultsESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        }]
      );
    }

    if (chargeEntities.length) {
      entities[chargeESID] = [];
      associations[chargedWithESID] = [];
      chargeEntities.forEach((charge, index) => {
        const chargeSubmitEntity = getPropertyIdToValueMap(charge, edm);
        const chargeToCaseAssociation = {
          data: appearsInData,
          srcEntityIndex: index,
          srcEntitySetId: chargeESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        };
        const personToChargeAssociation = {
          data: chargedWithData,
          srcEntityKeyId: personEKID,
          srcEntitySetId: peopleESID,
          dstEntityIndex: index,
          dstEntitySetId: chargeESID
        };
        entities[chargeESID].push(chargeSubmitEntity);
        associations[appearsInESID].push(chargeToCaseAssociation);
        associations[chargedWithESID].push(personToChargeAssociation);
      });
    }
    if (bookingConditionsWithIds.length) {
      entities[bookingReleaseConditionsESID] = [];
      bookingConditionsWithIds.forEach((condition, index) => {
        const conditionSubmitEntity = getPropertyIdToValueMap(condition, edm);
        const bookingConditionsToRCMAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: bookingReleaseConditionsESID,
          dstEntityIndex: 0,
          dstEntitySetId: rcmResultsESID
        };
        const bookingConditionsToPersonAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: bookingReleaseConditionsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        };
        const bookingConditionsToPSAAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: bookingReleaseConditionsESID,
          dstEntityIndex: 0,
          dstEntitySetId: psaScoresESID,
        };
        entities[bookingReleaseConditionsESID].push(conditionSubmitEntity);
        associations[calculatedForESID].push(bookingConditionsToRCMAssociation);
        associations[calculatedForESID].push(bookingConditionsToPersonAssociation);
        associations[calculatedForESID].push(bookingConditionsToPSAAssociation);
      });
    }
    if (courtConditionsWithIds.length) {
      entities[courtReleaseConditionsESID] = [];
      courtConditionsWithIds.forEach((condition, index) => {
        const conditionSubmitEntity = getPropertyIdToValueMap(condition, edm);
        const courtConditionsToRCMAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: courtReleaseConditionsESID,
          dstEntityIndex: 0,
          dstEntitySetId: rcmResultsESID
        };
        const courtConditionsToPersonAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: courtReleaseConditionsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        };
        const courtConditionsToPSAAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: courtReleaseConditionsESID,
          dstEntityIndex: 0,
          dstEntitySetId: psaScoresESID,
        };
        entities[courtReleaseConditionsESID].push(conditionSubmitEntity);
        associations[calculatedForESID].push(courtConditionsToRCMAssociation);
        associations[calculatedForESID].push(courtConditionsToPersonAssociation);
        associations[calculatedForESID].push(courtConditionsToPSAAssociation);
      });
    }

    /*
     * Submit data and collect response
     */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;

    /*
     * Collect PSA and Neighbors
     */
    const entityKeyIds = fromJS(response.data.entityKeyIds);

    const psaScoresEKID = entityKeyIds.getIn([psaScoresESID, 0], '');

    const { psaScoresEntity, psaNeighborsByAppTypeFqn } = yield call(getPSAScoresAndNeighbors, psaScoresEKID);

    yield put(submitPSA.success(action.id, {
      psaScoresEntity,
      psaNeighborsByAppTypeFqn,
      psaScoresEKID,
      personEKID
    }));
  }

  catch (error) {
    console.error(error);
    yield put(submitPSA.failure(action.id, error));
  }
  finally {
    yield put(submitPSA.finally(action.id));
  }
}

function* submitPSAWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_PSA, submitPSAWorker);
}

export {
  addCaseToPSAWatcher,
  editPSAWatcher,
  loadNeighborsWatcher,
  removeCaseFromPSAWatcher,
  submitPSAWatcher
};
