/*
 * @flow
 */
import { fromJS, List, Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { Constants, EntityDataModelApi } from 'lattice';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { loadPSAData } from '../review/ReviewActionFactory';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, STATE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import {
  LOAD_DATA_MODEL,
  LOAD_NEIGHBORS,
  loadDataModel,
  loadNeighbors
} from './FormActionFactory';

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const {
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

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

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

const getAllPSAIds = (neighbors, psaScoresEntitySetId) => {
  if (!neighbors) return [];
  return neighbors.filter((neighbor) => {
    if (neighbor.neighborEntitySet && neighbor.neighborEntitySet.id === psaScoresEntitySetId) {
      const statusValues = neighbor.neighborDetails[PROPERTY_TYPES.STATUS];
      if (statusValues) {
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
  const openPSAIds = getOpenPSAIds(neighbors.toJS(), psaScoresEntitySetId);
  /*
   * Get PSA Neighbors
   */
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

    const openPSAs = yield call(getOpenPSANeighbors, neighbors);
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
    yield put(loadPSAData({ psaIds: getAllPSAIds(neighbors.toJS(), psaScoresEntitySetId), scoresAsMap }));
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


export {
  loadDataModelWatcher,
  loadNeighborsWatcher
};
