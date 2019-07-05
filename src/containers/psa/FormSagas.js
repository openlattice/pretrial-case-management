/*
 * @flow
 */
import moment from 'moment';
import { fromJS, List, Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import { Constants, EntityDataModelApi } from 'lattice';
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
import { getEntityProperties } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId, getPropteryIdToValueMap } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, STATE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import {
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  SUBMIT_PSA,
  UPDATE_PSA,
  loadDataModel,
  loadNeighbors,
  submitPSA,
  updatePSA,
} from './FormActionFactory';

const {
  COMPLETED_DATE_TIME,
  ENTITY_KEY_ID,
  GENERAL_ID,
  TIMESTAMP,
  STRING_ID
} = PROPERTY_TYPES;

const {
  CALCULATED_FOR,
  ASSESSED_BY,
  CHARGED_WITH,
  APPEARS_IN,
  ARREST_CASES,
  BONDS,
  CHARGES,
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
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

const { createAssociations, createEntityAndAssociationData, getEntityData } = DataApiActions;
const { createAssociationsWorker, createEntityAndAssociationDataWorker, getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

const LIST_ENTITY_SETS = List.of(STAFF, RELEASE_CONDITIONS, HEARINGS, PRETRIAL_CASES, CHECKIN_APPOINTMENTS);


function* loadDataModelWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadDataModel.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIds = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId], Map()).keySeq().toJS();
    const selectors = entitySetIds.map(id => ({
      id,
      type: 'EntitySet',
      include: ['EntitySet', 'EntityType', 'PropertyTypeInEntitySet']
    }));
    const dataModel = yield call(EntityDataModelApi.getEntityDataModelProjection, selectors);
    yield put(loadDataModel.success(action.id, { dataModel }));
  }
  catch (error) {
    yield put(loadDataModel.failure(action.id, { error }));
  }
  finally {
    yield put(loadDataModel.finally(action.id));
  }
}

function* loadDataModelWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_DATA_MODEL, loadDataModelWorker);
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
  const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
  const dmfResultsEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
  const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
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
            dmfResultsEntitySetId,
            outcomesEntitySetId,
            releaseRecommendationsEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [
            arrestCasesEntitySetId,
            dmfRiskFactorsEntitySetId,
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
  const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId], Map());

  /*
   * Get Entity Set Ids
   */
  const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
  const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
  const chargesEntitySetId = getEntitySetIdFromApp(app, CHARGES);
  const checkInAppointmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
  const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
  const dmfResultsEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
  const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
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
            dmfResultsEntitySetId,
            dmfRiskFactorsEntitySetId,
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
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    /*
     * Get Entity Set Ids
     */
    const arrestCasesESID = getEntitySetIdFromApp(app, ARREST_CASES);
    const bondsESID = getEntitySetIdFromApp(app, BONDS);
    const dmfResultsESID = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsESID = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
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
    * Get Hearing Info
    */
    const psaResponse = yield call(
      getEntityDataWorker,
      getEntityData({ entitySetId: psaScoresESID, entityKeyId: psaScoresEKID })
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
            dmfResultsESID,
            releaseRecommendationsESID,
            bondsESID,
            outcomesESID,
            releaseConditionsESID
          ],
          destinationESIDs: [
            arrestCasesESID,
            dmfRiskFactorsESID,
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
      caseEntity,
      chargeEntities,
      dmfResultsEntity,
      dmfRiskFactorsEntity,
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
    const dmfResultsESID = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsESID = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
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
    const stringIdPTID = getPropertyTypeId(edm, STRING_ID);

    /*
     * Assemble Entities
     */
    const psaSubmitEntity = getPropteryIdToValueMap(psaEntity, edm);
    const psaRiskFactorsSubmitEntity = getPropteryIdToValueMap(psaRiskFactorsEntity, edm);
    const psaNotesSubmitEntity = getPropteryIdToValueMap(psaNotesEntity, edm);
    const dmfResultsSubmitEntity = getPropteryIdToValueMap(dmfResultsEntity, edm);
    const dmfRiskFactorsSubmitEntity = getPropteryIdToValueMap(dmfRiskFactorsEntity, edm);
    const caseSubmitEntity = getPropteryIdToValueMap(caseEntity, edm);

    const entities = {
      [psaScoresESID]: [psaSubmitEntity],
      [psaRiskFactorsESID]: [psaRiskFactorsSubmitEntity],
      [psaNotesESID]: [psaNotesSubmitEntity],
      [dmfResultsESID]: [dmfResultsSubmitEntity],
      [dmfRiskFactorsESID]: [dmfRiskFactorsSubmitEntity],
      [caseESID]: [caseSubmitEntity]
    };

    /*
     * Assemble Associations
     */

    // Association Data
    const caseNum = caseEntity[GENERAL_ID];
    const calculatedForData = { [timeStampPTID]: [moment().toISOString(true)] };
    const assessedByData = { [completedDateTimePTID]: [moment().toISOString(true)] };
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
          dstEntityKeyId: staffEKID,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: psaRiskFactorsESID,
          dstEntityKeyId: staffEKID,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfResultsESID,
          dstEntityKeyId: staffEKID,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfRiskFactorsESID,
          dstEntityKeyId: staffEKID,
          dstEntitySetId: staffESID
        },
        {
          data: assessedByData,
          srcEntityIndex: 0,
          srcEntitySetId: psaNotesESID,
          dstEntityKeyId: staffEKID,
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
          dstEntitySetId: dmfRiskFactorsESID
        },
        // DMF Risk Factors calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfRiskFactorsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfRiskFactorsESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        // DMF calculated for _____
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfResultsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfResultsESID,
          dstEntityIndex: 0,
          dstEntitySetId: dmfRiskFactorsESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfResultsESID,
          dstEntityIndex: 0,
          dstEntitySetId: caseESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfResultsESID,
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
          srcEntitySetId: dmfRiskFactorsESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        },
        {
          data: calculatedForData,
          srcEntityIndex: 0,
          srcEntitySetId: dmfResultsESID,
          dstEntityKeyId: arrestCaseEKID,
          dstEntitySetId: arrestCasesESID
        }]
      );
    }

    if (chargeEntities.length) {
      entities[chargeESID] = [];
      associations[chargedWithESID] = [];
      chargeEntities.forEach((charge, index) => {
        const chargeSubmitEntity = getPropteryIdToValueMap(charge, edm);
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
  loadDataModelWatcher,
  loadNeighborsWatcher,
  submitPSAWatcher
};
