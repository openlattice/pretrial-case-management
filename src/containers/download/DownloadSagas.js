/*
 * @flow
 */
import Immutable from 'immutable';
import Papa from 'papaparse';
import moment from 'moment';
import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, take, all, takeEvery } from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import {
  DOWNLOAD_PSA_FORMS,
  downloadPsaForms
} from './DownloadActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

function* downloadPSAsWorker(action) :Generator<*, *, *> {

  try {
    yield put(downloadPsaForms.request(action.id));
    const { startDate, endDate } = action.value;

    const start = moment.parseZone(startDate);
    const end = moment.parseZone(endDate);
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


    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, scoresAsMap.keySeq().toJS());

    let usableNeighborsById = Immutable.Map();

    Object.keys(neighborsById).forEach((id) => {
      let usableNeighbors = Immutable.List();
      const neighborList = neighborsById[id];
      neighborList.forEach((neighbor) => {
        const timestampList = neighbor.associationDetails[PROPERTY_TYPES.TIMESTAMP_FQN]
          || neighbor.associationDetails[PROPERTY_TYPES.COMPLETED_DATE_TIME];
        if (timestampList && timestampList.length) {
          const timestamp = moment.parseZone(timestampList[0]);
          const matchesStart = timestamp.diff(start, 'seconds') > 0 || timestamp.isSame(start, 'day');
          const matchesEnd = timestamp.diff(end, 'seconds') < 0 || timestamp.isSame(end, 'day');
          if (matchesStart && matchesEnd) {
            usableNeighbors = usableNeighbors.push(Immutable.fromJS(neighbor));
          }
        }
      });
      if (usableNeighbors.size > 0) {
        usableNeighborsById = usableNeighborsById.set(id, usableNeighbors);
      }
    });

    const getUpdatedEntity = (combinedEntityInit, entitySetName, details) => {
      let combinedEntity = combinedEntityInit;
      details.keySeq().forEach((fqn) => {
        const header = `${entitySetName}|${fqn}`;
        let newArrayValues = combinedEntity.get(header, Immutable.List());
        details.get(fqn).forEach((val) => {
          if (!newArrayValues.includes(val)) newArrayValues = newArrayValues.push(val);
        });
        combinedEntity = combinedEntity.set(header, newArrayValues);
      });
      return combinedEntity;
    };

    let jsonResults = Immutable.List();
    usableNeighborsById.keySeq().forEach((id) => {
      let combinedEntity = scoresAsMap.get(id);
      usableNeighborsById.get(id).forEach((neighbor) => {
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn(['associationEntitySet', 'title']),
          neighbor.get('associationDetails')
        );
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn(['neighborEntitySet', 'title']),
          neighbor.get('neighborDetails', Immutable.Map())
        );
      });
      jsonResults = jsonResults.push(combinedEntity);
    });
    const csv = Papa.unparse(jsonResults.toJS());

    const name = `PSAs-${start.format('MM-DD-YYYY')}-to-${end.format('MM-DD-YYYY')}`;

    FileSaver.saveFile(csv, name, 'csv');

    yield put(downloadPsaForms.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(downloadPsaForms.failure(action.id, error));
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
