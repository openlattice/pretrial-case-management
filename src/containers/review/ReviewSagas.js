/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';
import { AuthorizationApi, DataApi, EntityDataModelApi, SearchApi } from 'lattice';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import exportPDF from '../../utils/PDFUtils';
import {
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSAS_BY_DATE,
  UPDATE_SCORES_AND_RISK_FACTORS,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAsByDate,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const orderCasesByArrestDate = (case1, case2) => {
  const date1 = moment(case1.getIn([PROPERTY_TYPES.ARREST_DATE, 0], case1.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));
  const date2 = moment(case2.getIn([PROPERTY_TYPES.ARREST_DATE, 0], case2.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));
  if (date1.isValid() && date2.isValid()) {
    if (date1.isBefore(date2)) return 1;
    if (date1.isAfter(date2)) return -1;
  }
  return 0;
};

function* getCasesAndCharges(neighbors) {
  let personEntitySetId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborEntitySet', 'id']);
  if (!personEntitySetId) personEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
  const personEntityKeyId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId']);
  const personNeighbors = yield call(SearchApi.searchEntityNeighbors, personEntitySetId, personEntityKeyId);

  let pretrialCaseOptionsWithDate = Immutable.List();
  let pretrialCaseOptionsWithoutDate = Immutable.List();
  let allCharges = Immutable.List();
  let allSentences = Immutable.List();
  personNeighbors.forEach((neighbor) => {
    const neighborDetails = Immutable.fromJS(neighbor.neighborDetails);
    const entitySet = neighbor.neighborEntitySet;
    if (entitySet) {
      const { name } = entitySet;
      if (name === ENTITY_SETS.PRETRIAL_CASES || name === ENTITY_SETS.MANUAL_PRETRIAL_CASES) {
        const caseObj = neighborDetails.set('id', neighbor.neighborId);
        const arrList = caseObj.get(
          PROPERTY_TYPES.ARREST_DATE,
          caseObj.get(PROPERTY_TYPES.FILE_DATE, Immutable.List())
        );
        if (arrList.size) {
          pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.push(caseObj);
        }
        else {
          pretrialCaseOptionsWithoutDate = pretrialCaseOptionsWithoutDate.push(caseObj);
        }
      }
      else if (name === ENTITY_SETS.CHARGES || name === ENTITY_SETS.MANUAL_CHARGES) {
        allCharges = allCharges.push(neighborDetails);
      }
      else if (name === ENTITY_SETS.SENTENCES) {
        allSentences = allSentences.push(neighborDetails);
      }
    }
  });
  pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.sort(orderCasesByArrestDate);
  const allCases = pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate);
  return { allCases, allCharges, allSentences };
}

function* checkPSAPermissionsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(checkPSAPermissions.request(action.id));

    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_RISK_FACTORS);
    const permissions = yield call(AuthorizationApi.checkAuthorizations, [{
      aclKey: [entitySetId],
      permissions: ['WRITE']
    }]);
    yield put(checkPSAPermissions.success(action.id, { readOnly: !permissions[0].permissions.WRITE }))
  }
  catch (error) {
    console.error(error);
    yield put(checkPSAPermissions.failure(action.id, { error }));
  }
  finally {
    yield put(checkPSAPermissions.finally(action.id));
  }
}

function* checkPSAPermissionsWatcher() :Generator<*, *, *> {
  yield takeEvery(CHECK_PSA_PERMISSIONS, checkPSAPermissionsWorker);
}


function* loadCaseHistoryWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    const { personId, neighbors } = action.value;
    yield put(loadCaseHistory.request(action.id, { personId }));

    const getMapByCaseId = (list, fqn) => {
      let objMap = Immutable.Map();
      list.forEach((obj) => {
        const objIdArr = obj.getIn([fqn, 0], '').split('|');
        if (objIdArr.length > 1) {
          const caseId = objIdArr[0];
          objMap = objMap.set(caseId, objMap.get(caseId, Immutable.List()).push(obj));
        }
      });
      return objMap;
    }

    const { allCases, allCharges, allSentences } = yield getCasesAndCharges(neighbors);

    const chargesByCaseId = getMapByCaseId(allCharges, PROPERTY_TYPES.CHARGE_ID);
    const sentencesByCaseId = getMapByCaseId(allSentences, PROPERTY_TYPES.GENERAL_ID);

    yield put(loadCaseHistory.success(action.id, {
      personId,
      allCases,
      chargesByCaseId,
      sentencesByCaseId
    }));

  }
  catch (error) {
    console.error(error);
    yield put(loadCaseHistory.failure(action.id, { error }));
  }
  finally {
    yield put(loadCaseHistory.finally(action.id));
  }
}

function* loadCaseHistoryWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CASE_HISTORY, loadCaseHistoryWorker);
}

function* loadPSAsByDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadPSAsByDate.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);

    const size = yield call(DataApi.getEntitySetSize, entitySetId);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: size // temporary hack to load all entity set data
    };

    const allScoreData = yield call(SearchApi.searchEntitySetData, entitySetId, options);

    let allFilers = Immutable.Set();
    let scoresAsMap = Immutable.Map();
    allScoreData.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row.id[0], Immutable.fromJS(row).delete('id'));
    });

    let neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, scoresAsMap.keySeq().toJS());
    neighborsById = Immutable.fromJS(neighborsById);

    let psaNeighborsById = Immutable.Map();
    let psaNeighborsByDate = Immutable.Map();

    neighborsById.keySeq().forEach((id) => {
      let allDatesEdited = Immutable.List();
      let neighborsByEntitySetName = Immutable.Map();

      neighborsById.get(id).forEach((neighbor) => {

        neighbor.getIn(['associationDetails', PROPERTY_TYPES.TIMESTAMP],
          neighbor.getIn(['associationDetails', PROPERTY_TYPES.DATE_TIME], Immutable.List())).forEach((timestamp) => {
          const timestampMoment = moment(timestamp);
          if (timestampMoment.isValid()) {
            allDatesEdited = allDatesEdited.push(timestampMoment.format('MM/DD/YYYY'));
          }
        });

        const neighborName = neighbor.getIn(['neighborEntitySet', 'name']);
        if (neighborName) {
          if (neighborName === ENTITY_SETS.STAFF) {
            neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID], Immutable.List())
              .forEach((filer) => {
                allFilers = allFilers.add(filer);
              });

            neighborsByEntitySetName = neighborsByEntitySetName.set(
              neighborName,
              neighborsByEntitySetName.get(neighborName, Immutable.List()).push(neighbor)
            );
          }
          else {
            neighborsByEntitySetName = neighborsByEntitySetName.set(neighborName, neighbor);
          }
        }
      });

      allDatesEdited.forEach((editDate) => {
        psaNeighborsById = psaNeighborsById.set(id, neighborsByEntitySetName);
        psaNeighborsByDate = psaNeighborsByDate.set(
          editDate,
          psaNeighborsByDate.get(editDate, Immutable.Map()).set(id, neighborsByEntitySetName)
        );
      });
    });

    yield put(loadPSAsByDate.success(action.id, {
      scoresAsMap,
      psaNeighborsByDate,
      entitySetId,
      psaNeighborsById,
      allFilers
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadPSAsByDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadPSAsByDate.finally(action.id));
  }
}

function* loadPSAsByDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PSAS_BY_DATE, loadPSAsByDateWorker);
}

function* downloadPSAReviewPDFWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadPSAReviewPDF.request(action.id));
    const { neighbors, scores } = action.value;
    const { allCases, allCharges, allSentences } = yield getCasesAndCharges(neighbors);

    const recommendationText = neighbors.getIn([
      ENTITY_SETS.RELEASE_RECOMMENDATIONS,
      'neighborDetails',
      PROPERTY_TYPES.RELEASE_RECOMMENDATION
    ], Immutable.List()).join(', ');

    const formattedScores = Immutable.Map()
      .set('ftaScale', scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]))
      .set('ncaScale', scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]))
      .set('nvcaFlag', scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]));

    const setMultimapToMap = (entitySetName) => {
      let map = Immutable.Map();
      neighbors.getIn([entitySetName, 'neighborDetails'], Immutable.Map()).keySeq().forEach((fqn) => {
        map = map.set(fqn, neighbors.getIn([entitySetName, 'neighborDetails', fqn, 0]));
      });
      return map;
    };

    const data = Immutable.Map()
      .set('scores', formattedScores)
      .set('notes', recommendationText)
      .set('riskFactors', setMultimapToMap(ENTITY_SETS.PSA_RISK_FACTORS));

    const selectedPretrialCase = neighbors.getIn(
      [ENTITY_SETS.PRETRIAL_CASES, 'neighborDetails'],
      neighbors.getIn(
        [ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails'],
        Immutable.Map()
      )
    );
    const selectedPerson = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

    const submitDate = neighbors.getIn([
      ENTITY_SETS.PSA_RISK_FACTORS,
      'associationDetails',
      PROPERTY_TYPES.TIMESTAMP,
      0
    ], '');

    exportPDF(data, selectedPretrialCase, selectedPerson, allCases, allCharges, allSentences, submitDate);

    yield put(downloadPSAReviewPDF.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(downloadPSAReviewPDF.failure(action.id, { error }));
  }
  finally {
    yield put(downloadPSAReviewPDF.finally(action.id));
  }
}

function* downloadPSAReviewPDFWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_PSA_REVIEW_PDF, downloadPSAReviewPDFWorker);
}

function* updateScoresAndRiskFactorsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    const {
      scoresEntitySetId,
      scoresId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsId,
      riskFactorsEntity,
      dmfEntitySetId,
      dmfId,
      dmfEntity,
      dmfRiskFactorsEntitySetId,
      dmfRiskFactorsId,
      dmfRiskFactorsEntity
    } = action.value;
    yield all([
      call(DataApi.replaceEntityInEntitySetUsingFqns, riskFactorsEntitySetId, riskFactorsId, riskFactorsEntity),
      call(DataApi.replaceEntityInEntitySetUsingFqns, scoresEntitySetId, scoresId, scoresEntity),
      call(DataApi.replaceEntityInEntitySetUsingFqns, dmfEntitySetId, dmfId, dmfEntity),
      call(DataApi.replaceEntityInEntitySetUsingFqns, dmfRiskFactorsEntitySetId, dmfRiskFactorsId, dmfRiskFactorsEntity)
    ]);

    const [newScoreEntity, newRiskFactorsEntity, newDMFEntity, newDMFRiskFactorsEntity] = yield all([
      call(DataApi.getEntity, scoresEntitySetId, scoresId),
      call(DataApi.getEntity, riskFactorsEntitySetId, riskFactorsId),
      call(DataApi.getEntity, dmfEntitySetId, dmfId),
      call(DataApi.getEntity, dmfRiskFactorsEntitySetId, dmfRiskFactorsId)
    ]);

    yield put(updateScoresAndRiskFactors.success(action.id, {
      scoresId,
      newScoreEntity,
      riskFactorsId,
      newRiskFactorsEntity,
      dmfId,
      newDMFEntity,
      newDMFRiskFactorsEntity
    }));
  }
  catch (error) {
    console.error(error);
    yield put(updateScoresAndRiskFactors.failure(action.id, { error }));
  }
  finally {
    yield put(updateScoresAndRiskFactors.finally(action.id));
  }
}

function* updateScoresAndRiskFactorsWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_SCORES_AND_RISK_FACTORS, updateScoresAndRiskFactorsWorker);
}

export {
  checkPSAPermissionsWatcher,
  downloadPSAReviewPDFWatcher,
  loadCaseHistoryWatcher,
  loadPSAsByDateWatcher,
  updateScoresAndRiskFactorsWatcher
};
