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
      const caseEntitySetId = neighbors.getIn([ENTITY_SETS.PRETRIAL_CASES, 'neighborEntitySet', 'id']);
      const caseEntityKeyId = neighbors.getIn([ENTITY_SETS.PRETRIAL_CASES, 'neighborId']);
      const caseNeighbors = yield call(SearchApi.searchEntityNeighbors, caseEntitySetId, caseEntityKeyId);
      let charges = Immutable.List();
      let recommendations = Immutable.List();
      Immutable.fromJS(caseNeighbors).forEach((neighbor) => {
        const name = neighbor.getIn(['neighborEntitySet', 'name']);
        if (name === ENTITY_SETS.CHARGES) {
          charges = charges.push(neighbor);
        }
        else if (name === ENTITY_SETS.RELEASE_RECOMMENDATIONS) {
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
      const selectedCharges = charges.map(neighbor => setMultimapToMap(ENTITY_SETS.CHARGES)).toJS();

      exportPDF(data, selectedPretrialCase, selectedPerson, selectedCharges);

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
