/*
 * @flow
 */
import Immutable from 'immutable';
import Papa from 'papaparse';
import moment from 'moment';
import { EntityDataModelApi, SearchApi, SyncApi, DataApi } from 'lattice';
import { call, put, take, all } from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import * as ActionFactory from './DownloadActionFactory';
import * as ActionTypes from './DownloadActionTypes';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

export function* downloadPSAs() :Generator<*, *, *> {
  while (true) {
    const { startDate, endDate } = yield take(ActionTypes.DOWNLOAD_PSA_FORMS_REQUEST);
    try {
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
          const timestampList = neighbor.associationDetails[PROPERTY_TYPES.TIMESTAMP_FQN];
          if (timestampList.length) {
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

      const getUpdatedEntity = (combinedEntity, details) => {
        details.keySeq().forEach((fqn) => {
          let newArrayValues = combinedEntity.get(fqn, Immutable.List());
          details.get(fqn).forEach((val) => {
            if (!newArrayValues.includes(val)) newArrayValues = newArrayValues.push(val);
          });
          combinedEntity = combinedEntity.set(fqn, newArrayValues);
        });
        return combinedEntity;
      };

      let jsonResults = Immutable.List();
      usableNeighborsById.keySeq().forEach((id) => {
        let combinedEntity = scoresAsMap.get(id);
        usableNeighborsById.get(id).forEach((neighbor) => {
          combinedEntity = getUpdatedEntity(combinedEntity, neighbor.get('associationDetails'));
          combinedEntity = getUpdatedEntity(combinedEntity, neighbor.get('neighborDetails', Immutable.Map()));
        });
        jsonResults = jsonResults.push(combinedEntity);
      });
      const csv = Papa.unparse(jsonResults.toJS());

      const name = `PSAs-${start.format('MM-DD-YYYY')}-to-${end.format('MM-DD-YYYY')}`;

      FileSaver.saveFile(csv, name, 'csv');

      yield put(ActionFactory.downloadSuccess());
    }
    catch (error) {
      console.error(error);
      yield put(ActionFactory.downloadFailure(error));
    }
  }
}
