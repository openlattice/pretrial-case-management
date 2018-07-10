/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';
import { AuthorizationApi, DataApi, EntityDataModelApi, SearchApi } from 'lattice';
import { all, call, put, take, takeEvery } from 'redux-saga/effects';

import exportPDF from '../../utils/PDFUtils';
import { getMapByCaseId } from '../../utils/CaseUtils';
import {
  CHANGE_PSA_STATUS,
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSA_DATA,
  LOAD_PSAS_BY_DATE,
  REFRESH_PSA_NEIGHBORS,
  UPDATE_SCORES_AND_RISK_FACTORS,
  changePSAStatus,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  refreshPSANeighbors,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_CATEGORIES, formatDMFFromEntity } from '../../utils/consts/DMFResultConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { getFqnObj } from '../../utils/Utils';

const LIST_ENTITY_SETS = Immutable.List.of(ENTITY_SETS.STAFF, ENTITY_SETS.RELEASE_CONDITIONS);

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
  let allManualCases = Immutable.List();
  let allCharges = Immutable.List();
  let allManualCharges = Immutable.List();
  let allArrestCharges = Immutable.List();
  let allSentences = Immutable.List();
  let allFTAs = Immutable.List();
  let allHearings = Immutable.List();
  personNeighbors.forEach((neighbor) => {
    const neighborDetails = Immutable.fromJS(neighbor.neighborDetails);
    const entitySet = neighbor.neighborEntitySet;
    if (entitySet) {
      const { name } = entitySet;
      if (name === ENTITY_SETS.PRETRIAL_CASES) {
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
      else if (name === ENTITY_SETS.MANUAL_PRETRIAL_CASES) {
        allManualCases = allManualCases.push(neighborDetails);
      }
      else if (name === ENTITY_SETS.CHARGES) {
        allCharges = allCharges.push(neighborDetails);
      }
      else if (name === ENTITY_SETS.MANUAL_CHARGES) {
        allManualCharges = allManualCharges.push(neighborDetails);
      }
      else if (name === ENTITY_SETS.ARREST_CHARGES) {
        allArrestCharges = allArrestCharges.push(neighborDetails);
      }
      else if (name === ENTITY_SETS.SENTENCES) {
        allSentences = allSentences.push(neighborDetails);
      }
      else if (name === ENTITY_SETS.FTAS) {
        allFTAs = allFTAs.push(Immutable.fromJS(neighborDetails));
      }
      else if (name === ENTITY_SETS.HEARINGS) {
        allHearings = allHearings.push(Immutable.fromJS(neighborDetails));
      }
    }
  });
  pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.sort(orderCasesByArrestDate);
  const allCases = pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate);
  return {
    allCases,
    allManualCases,
    allCharges,
    allManualCharges,
    allArrestCharges,
    allSentences,
    allFTAs,
    allHearings
  };
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

    const {
      allCases,
      allManualCases,
      allCharges,
      allManualCharges,
      allSentences,
      allFTAs,
      allHearings
    } = yield getCasesAndCharges(neighbors);

    const chargesByCaseId = getMapByCaseId(allCharges, PROPERTY_TYPES.CHARGE_ID);
    const manualChargesByCaseId = getMapByCaseId(allManualCharges, PROPERTY_TYPES.CHARGE_ID);
    const sentencesByCaseId = getMapByCaseId(allSentences, PROPERTY_TYPES.GENERAL_ID);

    yield put(loadCaseHistory.success(action.id, {
      personId,
      allCases,
      allManualCases,
      chargesByCaseId,
      manualChargesByCaseId,
      sentencesByCaseId,
      allFTAs,
      allHearings
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

function* getAllSearchResults(entitySetId :string, searchTerm :string) :Generator<*, *, *> {
  const loadSizeRequest = {
    searchTerm,
    start: 0,
    maxHits: 1
  };
  const response = yield call(SearchApi.searchEntitySetData, entitySetId, loadSizeRequest);
  const { numHits } = response;

  const loadResultsRequest = {
    searchTerm,
    start: 0,
    maxHits: numHits
  };
  return yield call(SearchApi.searchEntitySetData, entitySetId, loadResultsRequest);
}

function* loadPSADataWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadPSAData.request(action.id))
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);
    let neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, action.value);
    neighborsById = Immutable.fromJS(neighborsById);

    let allFilers = Immutable.Set();
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
          }

          if (LIST_ENTITY_SETS.includes(neighborName)) {
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

    yield put(loadPSAData.success(action.id, {
      psaNeighborsByDate,
      psaNeighborsById,
      allFilers
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadPSAData.failure(action.id, error));
  }
  finally {
    yield put(loadPSAData.finally(action.id));
  }
}

function* loadPSADataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PSA_DATA, loadPSADataWorker);
}

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => {
      return (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id);
    }
  );
}

function* loadPSAsByDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadPSAsByDate.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);
    const statusPropertyTypeId = yield call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.STATUS));
    const filter = action.value || PSA_STATUSES.OPEN;
    const searchTerm = action.value === '*' ? action.value : `${statusPropertyTypeId}:"${filter}"`;
    const allScoreData = yield call(getAllSearchResults, entitySetId, searchTerm);

    let scoresAsMap = Immutable.Map();
    allScoreData.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row.id[0], Immutable.fromJS(row).delete('id'));
    });

    yield put(loadPSAsByDate.success(action.id, {
      scoresAsMap,
      entitySetId
    }));

    const psaIds = scoresAsMap.keySeq().toJS();
    if (psaIds.length) {
      const loadPSADataRequest = loadPSAData(psaIds);
      yield put(loadPSADataRequest);
      yield takeReqSeqSuccessFailure(loadPSAData, loadPSADataRequest);
    }
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
    const {
      allCases,
      allCharges,
      allManualCharges,
      allArrestCharges,
      allSentences,
      allFTAs
    } = yield getCasesAndCharges(neighbors);

    const recommendationText = neighbors.getIn([
      ENTITY_SETS.RELEASE_RECOMMENDATIONS,
      'neighborDetails',
      PROPERTY_TYPES.RELEASE_RECOMMENDATION
    ], Immutable.List()).join(', ');

    const dmf = neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map());
    const formattedDMF = Immutable.fromJS(formatDMFFromEntity(dmf)).filter(val => !!val);

    const setMultimapToMap = (entitySetName) => {
      let map = Immutable.Map();
      neighbors.getIn([entitySetName, 'neighborDetails'], Immutable.Map()).keySeq().forEach((fqn) => {
        map = map.set(fqn, neighbors.getIn([entitySetName, 'neighborDetails', fqn, 0]));
      });
      return map;
    };

    const data = Immutable.Map()
      .set('scores', scores)
      .set('notes', recommendationText)
      .set('riskFactors', setMultimapToMap(ENTITY_SETS.PSA_RISK_FACTORS))
      .set('psaRiskFactors', neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map()))
      .set('dmfRiskFactors', neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'], Immutable.Map()))
      .set('dmf', formattedDMF);

    const selectedCase = neighbors.getIn([ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails'], Immutable.Map());
    const caseId = selectedCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');

    const selectedCharges = allManualCharges
      .filter(chargeObj => chargeObj.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0] === caseId);

    const selectedPerson = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

    let createData;
    let updateData;

    neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((writerNeighbor) => {
      const name = writerNeighbor.getIn(['associationEntitySet', 'name']);
      const user = writerNeighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '');

      if (name === ENTITY_SETS.ASSESSED_BY) {
        createData = {
          timestamp: writerNeighbor.getIn(['associationDetails', PROPERTY_TYPES.COMPLETED_DATE_TIME, 0], ''),
          user
        };
      }
      else if (name === ENTITY_SETS.EDITED_BY) {
        const timestamp = writerNeighbor.getIn(['associationDetails', PROPERTY_TYPES.DATE_TIME, 0], '');
        const newUpdateData = { timestamp, user };
        if (!updateData) {
          updateData = newUpdateData;
        }
        else {
          const prevTime = moment(updateData.timestamp);
          const currTime = moment(timestamp);
          if (!prevTime.isValid() || currTime.isAfter(prevTime)) {
            updateData = newUpdateData;
          }
        }
      }
    });

    exportPDF(
      data,
      selectedCase,
      selectedCharges,
      selectedPerson,
      allCases,
      allCharges,
      allSentences,
      allFTAs,
      createData,
      updateData
    );

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
      dmfRiskFactorsEntity,
      notesEntitySetId,
      notesId,
      notesEntity
    } = action.value;
    const updates = [
      call(DataApi.replaceEntityInEntitySetUsingFqns, riskFactorsEntitySetId, riskFactorsId, riskFactorsEntity),
      call(DataApi.replaceEntityInEntitySetUsingFqns, scoresEntitySetId, scoresId, scoresEntity),
      call(DataApi.replaceEntityInEntitySetUsingFqns, dmfEntitySetId, dmfId, dmfEntity),
      call(DataApi.replaceEntityInEntitySetUsingFqns, dmfRiskFactorsEntitySetId, dmfRiskFactorsId, dmfRiskFactorsEntity)
    ];
    if (notesEntity && notesId && notesEntitySetId) {
      updates.push(call(DataApi.replaceEntityInEntitySetUsingFqns, notesEntitySetId, notesId, notesEntity));
    }
    yield all(updates);

    const [newScoreEntity, newRiskFactorsEntity, newDMFEntity, newDMFRiskFactorsEntity, newNotesEntity] = yield all([
      call(DataApi.getEntity, scoresEntitySetId, scoresId),
      call(DataApi.getEntity, riskFactorsEntitySetId, riskFactorsId),
      call(DataApi.getEntity, dmfEntitySetId, dmfId),
      call(DataApi.getEntity, dmfRiskFactorsEntitySetId, dmfRiskFactorsId),
      call(DataApi.getEntity, notesEntitySetId, notesId)
    ]);

    yield put(updateScoresAndRiskFactors.success(action.id, {
      scoresId,
      newScoreEntity,
      riskFactorsId,
      newRiskFactorsEntity,
      dmfId,
      newDMFEntity,
      newDMFRiskFactorsEntity,
      newNotesEntity
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

function* refreshPSANeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action.value;
  try {
    yield put(refreshPSANeighbors.request(action.id, { id }));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);
    const neighborsList = yield call(SearchApi.searchEntityNeighbors, entitySetId, id);
    let neighbors = Immutable.Map();
    neighborsList.forEach((neighbor) => {
      const { neighborEntitySet, neighborDetails } = neighbor;
      if (neighborEntitySet && neighborDetails) {
        if (LIST_ENTITY_SETS.includes(neighborEntitySet.name)) {
          neighbors = neighbors.set(
            neighborEntitySet.name,
            neighbors.get(neighborEntitySet.name, Immutable.List()).push(Immutable.fromJS(neighbor))
          );
        }
        else {
          neighbors = neighbors.set(neighborEntitySet.name, Immutable.fromJS(neighbor));
        }
      }
    });
    yield put(refreshPSANeighbors.success(action.id, { id, neighbors }));
  }
  catch (error) {
    yield put(refreshPSANeighbors.failure(action.id, error));
  }
  finally {
    yield put(refreshPSANeighbors.finally(action.id, { id }));
  }
}

function* refreshPSANeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_PSA_NEIGHBORS, refreshPSANeighborsWorker);
}

function* changePSAStatusWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    scoresEntity,
    scoresId,
    callback
  } = action.value;

  try {
    yield put(changePSAStatus.request(action.id));
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);

    yield call(DataApi.replaceEntityInEntitySetUsingFqns, entitySetId, scoresId, scoresEntity.toJS());
    const newScoresEntity = yield call(DataApi.getEntity, entitySetId, scoresId);

    yield put(changePSAStatus.success(action.id, {
      id: scoresId,
      entity: newScoresEntity
    }));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    yield put(changePSAStatus.failure(action.id, error));
  }
  finally {
    yield put(changePSAStatus.finally(action.id));
  }
}

function* changePSAStatusWatcher() :Generator<*, *, *> {
  yield takeEvery(CHANGE_PSA_STATUS, changePSAStatusWorker);
}

export {
  changePSAStatusWatcher,
  checkPSAPermissionsWatcher,
  downloadPSAReviewPDFWatcher,
  loadCaseHistoryWatcher,
  loadPSADataWatcher,
  loadPSAsByDateWatcher,
  refreshPSANeighborsWatcher,
  updateScoresAndRiskFactorsWatcher
};
