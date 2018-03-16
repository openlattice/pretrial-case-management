/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';
import { DataApi, EntityDataModelApi, SearchApi} from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import exportPDF from '../../utils/PDFUtils';
import {
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_PSAS_BY_DATE,
  UPDATE_SCORES_AND_RISK_FACTORS,
  downloadPSAReviewPDF,
  loadPSAsByDate,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

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
          Immutable.List()).forEach((timestamp) => {
          const timestampMoment = moment.parseZone(timestamp);
          if (timestampMoment.isValid()) {
            allDatesEdited = allDatesEdited.push(timestampMoment.format('MM/DD/YYYY'));
          }
        });

        const neighborName = neighbor.getIn(['neighborEntitySet', 'name']);
        if (neighborName) {
          neighborsByEntitySetName = neighborsByEntitySetName.set(neighborName, neighbor);

          if (neighborName === ENTITY_SETS.STAFF) {
            neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID], Immutable.List())
              .forEach((filer) => {
                allFilers = allFilers.add(filer);
              });
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

const orderCasesByArrestDate = (case1, case2) => {
  const date1 = moment(case1.getIn([PROPERTY_TYPES.ARREST_DATE, 0], ''));
  const date2 = moment(case2.getIn([PROPERTY_TYPES.ARREST_DATE, 0], ''));
  if (date1.isValid() && date2.isValid()) {
    if (date1.isBefore(date2)) return 1;
    if (date1.isAfter(date2)) return -1;
  }
  return 0;
};

function* downloadPSAReviewPDFWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadPSAReviewPDF.request(action.id));
    const { neighbors, scores } = action.value;
    const personEntitySetId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborEntitySet', 'id']);
    const personEntityKeyId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId']);
    const personNeighbors = yield call(SearchApi.searchEntityNeighbors, personEntitySetId, personEntityKeyId);

    let pretrialCaseOptionsWithDate = Immutable.List();
    let pretrialCaseOptionsWithoutDate = Immutable.List();
    let allCharges = Immutable.List();
    personNeighbors.forEach((neighbor) => {
      const neighborDetails = Immutable.fromJS(neighbor.neighborDetails);
      const entitySet = neighbor.neighborEntitySet;
      if (entitySet && entitySet.name === ENTITY_SETS.PRETRIAL_CASES) {
        const caseObj = neighborDetails.set('id', neighbor.neighborId);
        const arrList = caseObj.get(PROPERTY_TYPES.ARREST_DATE, Immutable.List());
        if (arrList.size) {
          pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.push(caseObj);
        }
        else {
          pretrialCaseOptionsWithoutDate = pretrialCaseOptionsWithoutDate.push(caseObj);
        }
      }
      else if (entitySet && entitySet.name === ENTITY_SETS.CHARGES) {
        allCharges = allCharges.push(neighborDetails);
      }
    });

    pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.sort(orderCasesByArrestDate);
    const allCases = pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate);

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
      .set('releaseRecommendation', recommendationText)
      .set('riskFactors', setMultimapToMap(ENTITY_SETS.PSA_RISK_FACTORS));

    const selectedPretrialCase = neighbors.getIn(
      [ENTITY_SETS.PRETRIAL_CASES, 'neighborDetails'],
      Immutable.Map()
    );
    const selectedPerson = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

    exportPDF(data, selectedPretrialCase, selectedPerson, allCases, allCharges);

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
      riskFactorsEntity
    } = action.value;
    yield call(DataApi.replaceEntityInEntitySetUsingFqns, riskFactorsEntitySetId, riskFactorsId, riskFactorsEntity);
    yield call(DataApi.replaceEntityInEntitySetUsingFqns, scoresEntitySetId, scoresId, scoresEntity);

    const newScoreEntity = yield call(DataApi.getEntity, scoresEntitySetId, scoresId);
    const newRiskFactorsEntity = yield call(DataApi.getEntity, riskFactorsEntitySetId, riskFactorsId);

    yield put(updateScoresAndRiskFactors.success(action.id, {
      scoresId,
      newScoreEntity,
      riskFactorsId,
      newRiskFactorsEntity
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
  downloadPSAReviewPDFWatcher,
  loadPSAsByDateWatcher,
  updateScoresAndRiskFactorsWatcher
};
