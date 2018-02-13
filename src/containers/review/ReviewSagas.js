/*
 * @flow
 */
import Immutable from 'immutable';
import moment from 'moment';
import { DataApi, EntityDataModelApi, SearchApi} from 'lattice';
import { call, put, take } from 'redux-saga/effects';

import exportPDF from '../../utils/PDFUtils';
import * as ActionFactory from './ReviewActionFactory';
import * as ActionTypes from './ReviewActionTypes';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

export function* loadPSAsByDate() :Generator<*, *, *> {
  while (true) {
    yield take(ActionTypes.LOAD_PSAS_BY_DATE_REQUEST);

    try {
      const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);
      const options = {
        searchTerm: '*',
        start: 0,
        maxHits: 10000 // temporary hack to load all entity set data
      };

      const allScoreData = yield call(SearchApi.searchEntitySetData, entitySetId, options);
      let scoresAsMap = Immutable.Map();
      allScoreData.hits.forEach((row) => {
        scoresAsMap = scoresAsMap.set(row.id[0], Immutable.fromJS(row).delete('id'));
      });

      let neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, scoresAsMap.keySeq().toJS());
      neighborsById = Immutable.fromJS(neighborsById);
      let psaNeighborsByDate = Immutable.Map();

      neighborsById.keySeq().forEach((id) => {
        let allDatesEdited = Immutable.List();
        let neighborsByEntitySetName = Immutable.Map();

        neighborsById.get(id).forEach((neighbor) => {

          neighbor.getIn(['associationDetails', PROPERTY_TYPES.TIMESTAMP_FQN],
            Immutable.List()).forEach((timestamp) => {
            const timestampMoment = moment.parseZone(timestamp);
            if (timestampMoment.isValid()) {
              allDatesEdited = allDatesEdited.push(timestampMoment.format('MM/DD/YYYY'));
            }
          });

          const neighborName = neighbor.getIn(['neighborEntitySet', 'name']);
          if (neighborName) {
            neighborsByEntitySetName = neighborsByEntitySetName.set(neighborName, neighbor);
          }
        });

        allDatesEdited.forEach((editDate) => {
          psaNeighborsByDate = psaNeighborsByDate.set(
            editDate,
            psaNeighborsByDate.get(editDate, Immutable.Map()).set(id, neighborsByEntitySetName)
          );
        });
      });

      yield put(ActionFactory.loadPsasByDateSuccess(scoresAsMap, psaNeighborsByDate, entitySetId));
    }
    catch (error) {
      console.error(error);
      yield put(ActionFactory.loadPsasForIdsFailure(error));
    }
  }
}

export function* downloadPSAReviewPDF() :Generator<*, *, *> {
  while (true) {
    const { neighbors, scores } = yield take(ActionTypes.DOWNLOAD_PSA_REVIEW_PDF_REQUEST);

    try {
      const personEntitySetId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborEntitySet', 'id']);
      const personEntityKeyId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId']);
      const personNeighbors = yield call(SearchApi.searchEntityNeighbors, personEntitySetId, personEntityKeyId);

      const pretrialCaseOptionsWithDate = [];
      const pretrialCaseOptionsWithoutDate = [];
      const allCharges = []
      personNeighbors.forEach((neighbor) => {
        const entitySet = neighbor.neighborEntitySet;
        if (entitySet && entitySet.name === ENTITY_SETS.PRETRIAL_CASES) {
          const caseObj = Object.assign({}, neighbor.neighborDetails, { id: neighbor.neighborId });
          const arrList = caseObj[PROPERTY_TYPES.ARREST_DATE_FQN];
          if (arrList && arrList.length) {
            pretrialCaseOptionsWithDate.push(caseObj);
          }
          else {
            pretrialCaseOptionsWithoutDate.push(caseObj);
          }
        }
        else if (entitySet && entitySet.name === ENTITY_SETS.CHARGES) {
          allCharges.push(neighbor.neighborDetails);
        }
      });
      pretrialCaseOptionsWithDate.sort((case1, case2) => {
        const arr1 = moment(case1[PROPERTY_TYPES.ARREST_DATE_FQN][0]);
        const arr2 = moment(case2[PROPERTY_TYPES.ARREST_DATE_FQN][0]);
        if (arr1.isValid && arr2.isValid) {
          if (arr1.isBefore(arr2)) return 1;
          if (arr1.isAfter(arr2)) return -1;
          return 0;
        }
      });

      const allCases = pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate);

      const caseEntitySetId = neighbors.getIn([ENTITY_SETS.PRETRIAL_CASES, 'neighborEntitySet', 'id']);
      const caseEntityKeyId = neighbors.getIn([ENTITY_SETS.PRETRIAL_CASES, 'neighborId']);
      const caseNeighbors = yield call(SearchApi.searchEntityNeighbors, caseEntitySetId, caseEntityKeyId);
      let recommendations = Immutable.List();
      Immutable.fromJS(caseNeighbors).forEach((neighbor) => {
        const name = neighbor.getIn(['neighborEntitySet', 'name']);
        if (name === ENTITY_SETS.RELEASE_RECOMMENDATIONS) {
          recommendations = recommendations.push(neighbor);
        }
      });

      const recommendationText = recommendations.map(neighbor => neighbor.getIn([
        ENTITY_SETS.RELEASE_RECOMMENDATIONS,
        'neighborDetails',
        PROPERTY_TYPES.RELEASE_RECOMMENDATION_FQN
      ], Immutable.List()).join(', ')).join(', ');

      const formattedScores = Immutable.Map()
        .set('ftaScale', scores.getIn([PROPERTY_TYPES.FTA_SCALE_FQN, 0]))
        .set('ncaScale', scores.getIn([PROPERTY_TYPES.NCA_SCALE_FQN, 0]))
        .set('nvcaFlag', scores.getIn([PROPERTY_TYPES.NVCA_FLAG_FQN, 0]));

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
        .set('riskFactors', setMultimapToMap(ENTITY_SETS.PSA_RISK_FACTORS))
        .toJS();

      const selectedPretrialCase = neighbors.getIn(
        [ENTITY_SETS.PRETRIAL_CASES, 'neighborDetails'],
        Immutable.Map()
      ).toJS();
      const selectedPerson = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map()).toJS();

      exportPDF(data, selectedPretrialCase, selectedPerson, allCases, allCharges);

      yield put(ActionFactory.downloadPsaReviewPdfSuccess());
    }
    catch (error) {
      console.error(error);
      yield put(ActionFactory.downloadPsaReviewPdfFailure(error));
    }
  }
}

export function* updateScoresAndRiskFactors() :Generator<*, *, *> {
  while (true) {
    const {
      scoresEntitySetId,
      scoresId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsId,
      riskFactorsEntity
    } = yield take(ActionTypes.UPDATE_SCORES_AND_RISK_FACTORS_REQUEST);

    try {
      yield call(DataApi.replaceEntityInEntitySetUsingFqns, riskFactorsEntitySetId, riskFactorsId, riskFactorsEntity);
      yield call(DataApi.replaceEntityInEntitySetUsingFqns, scoresEntitySetId, scoresId, scoresEntity);

      const newScoreEntity = yield call(DataApi.getEntity, scoresEntitySetId, scoresId)
      const newRiskFactorsEntity = yield call(DataApi.getEntity, riskFactorsEntitySetId, riskFactorsId);

      yield put(ActionFactory.updateScoresAndRiskFactorsSuccess(
        scoresId,
        newScoreEntity,
        riskFactorsId,
        newRiskFactorsEntity
      ));
    }
    catch (error) {
      console.error(error);
      yield put(ActionFactory.updateScoresAndRiskFactorsFailure(error));
    }
  }
}
