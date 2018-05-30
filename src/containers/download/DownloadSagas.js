/*
 * @flow
 */
import Immutable from 'immutable';
import Papa from 'papaparse';
import moment from 'moment';
import { DataApi, EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import {
  DOWNLOAD_PSA_FORMS,
  downloadPsaForms
} from './DownloadActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

function* downloadPSAsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadPsaForms.request(action.id));
    const { startDate, endDate, filters } = action.value;

    const start = moment(startDate);
    const end = moment(endDate);
    const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);
    const entitySetSize = yield call(DataApi.getEntitySetSize, entitySetId);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: entitySetSize
    };

    const allScoreData = yield call(SearchApi.searchEntitySetData, entitySetId, options);

    let scoresAsMap = Immutable.Map();
    allScoreData.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row.id[0], Immutable.fromJS(row).delete('id'));
    });


    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, scoresAsMap.keySeq().toJS());

    let usableNeighborsById = Immutable.Map();

    Object.keys(neighborsById).forEach((id) => {
      let usableNeighbors = Immutable.List();
      const neighborList = neighborsById[id];
      neighborList.forEach((neighbor) => {
        const timestampList = neighbor.associationDetails[PROPERTY_TYPES.TIMESTAMP]
          || neighbor.associationDetails[PROPERTY_TYPES.COMPLETED_DATE_TIME];
        if (timestampList && timestampList.length) {
          const timestamp = moment(timestampList[0]);
          if (timestamp.isSameOrAfter(start) && timestamp.isSameOrBefore(end)) {
            usableNeighbors = usableNeighbors.push(Immutable.fromJS(neighbor));
          }
        }
      });
      if (usableNeighbors.size > 0) {
        usableNeighborsById = usableNeighborsById.set(id, usableNeighbors);
      }
    });

    const getUpdatedEntity = (combinedEntityInit, entitySetTitle, entitySetName, details) => {
      if (filters && !filters[entitySetName]) return combinedEntityInit;

      let combinedEntity = combinedEntityInit;
      details.keySeq().forEach((fqn) => {
        const header = filters ? filters[entitySetName][fqn] : `${fqn}|${entitySetTitle}`;
        if (header) {
          let newArrayValues = combinedEntity.get(header, Immutable.List());
          details.get(fqn).forEach((val) => {
            if (!newArrayValues.includes(val)) newArrayValues = newArrayValues.push(val);
          });
          combinedEntity = combinedEntity.set(header, newArrayValues);
        }
      });
      return combinedEntity;
    };

    let jsonResults = Immutable.List();
    let allHeaders = Immutable.Set();
    usableNeighborsById.keySeq().forEach((id) => {
      let combinedEntity = getUpdatedEntity(Immutable.Map(), 'PSA Scores', ENTITY_SETS.PSA_SCORES, scoresAsMap.get(id));

      usableNeighborsById.get(id).forEach((neighbor) => {
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn(['associationEntitySet', 'title']),
          neighbor.getIn(['associationEntitySet', 'name']),
          neighbor.get('associationDetails')
        );
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn(['neighborEntitySet', 'title']),
          neighbor.getIn(['neighborEntitySet', 'name']),
          neighbor.get('neighborDetails', Immutable.Map())
        );
        allHeaders = allHeaders.union(combinedEntity.keys());
      });
      jsonResults = jsonResults.push(combinedEntity);
    });

    const fields = filters
      ? Object.values(filters).reduce((es1, es2) => [...Object.values(es1), ...Object.values(es2)])
      : allHeaders.toJS();
    const csv = Papa.unparse({
      fields,
      data: jsonResults.toJS()
    });

    const name = `PSAs-${start.format('MM-DD-YYYY')}-to-${end.format('MM-DD-YYYY')}`;

    FileSaver.saveFile(csv, name, 'csv');

    yield put(downloadPsaForms.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(downloadPsaForms.failure(action.id, { error }));
  }
  finally {
    yield put(downloadPsaForms.finally(action.id));
  }
}

function* downloadPSAsWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_PSA_FORMS, downloadPSAsWorker);
}

export {
  downloadPSAsWatcher
};
