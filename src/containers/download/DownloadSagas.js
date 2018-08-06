/*
 * @flow
 */
import Immutable from 'immutable';
import Papa from 'papaparse';
import moment from 'moment';
import { Constants, DataApi, EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import { formatDateTime } from '../../utils/Utils';
import { stripIdField } from '../../utils/DataUtils';
import {
  DOWNLOAD_PSA_FORMS,
  downloadPsaForms
} from './DownloadActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const getStepTwo = (neighborList, psaScores) => {
  const nvca = psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0], false);
  let extradited = false;
  let step2Charges = false;
  let currentViolentOffense = false;

  neighborList.forEach((neighbor) => {
    const name = neighbor.getIn(['neighborEntitySet', 'name'], '');
    const data = neighbor.get('neighborDetails', Immutable.Map());
    if (name === ENTITY_SETS.DMF_RISK_FACTORS) {
      extradited = data.getIn([PROPERTY_TYPES.EXTRADITED, 0], false);
      step2Charges = data.getIn([PROPERTY_TYPES.DMF_STEP_2_CHARGES, 0], false);
    }
    else if (name === ENTITY_SETS.PSA_RISK_FACTORS) {
      currentViolentOffense = data.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE, 0], false);
    }
  });

  return extradited || step2Charges || (nvca && currentViolentOffense);
};

const getStepFour = (neighborList, psaScores) => {
  const nvca = psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0], false);
  let step4Charges = false;
  let currentViolentOffense = false;

  neighborList.forEach((neighbor) => {
    const name = neighbor.getIn(['neighborEntitySet', 'name'], '');
    const data = neighbor.get('neighborDetails', Immutable.Map());
    if (name === ENTITY_SETS.DMF_RISK_FACTORS) {
      step4Charges = data.getIn([PROPERTY_TYPES.DMF_STEP_4_CHARGES, 0], false);
    }
    else if (name === ENTITY_SETS.PSA_RISK_FACTORS) {
      currentViolentOffense = data.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE, 0], false);
    }
  });

  return step4Charges || (nvca && !currentViolentOffense);
};

function* downloadPSAsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadPsaForms.request(action.id));
    const {
      startDate,
      endDate,
      filters,
      domain
    } = action.value;

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
      scoresAsMap = scoresAsMap.set(row[OPENLATTICE_ID_FQN][0], stripIdField(Immutable.fromJS(row)));
    });

    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, scoresAsMap.keySeq().toJS());

    let usableNeighborsById = Immutable.Map();

    Object.keys(neighborsById).forEach((id) => {
      let usableNeighbors = Immutable.List();
      const neighborList = neighborsById[id];
      let domainMatch = true;
      neighborList.forEach((neighbor) => {
        if (domain && neighbor.neighborEntitySet && neighbor.neighborEntitySet.name === ENTITY_SETS.STAFF) {
          const filer = neighbor.neighborDetails[PROPERTY_TYPES.PERSON_ID][0];
          if (!filer.toLowerCase().endsWith(domain)) {
            domainMatch = false;
          }
        }
        const timestampList = neighbor.associationDetails[PROPERTY_TYPES.TIMESTAMP]
          || neighbor.associationDetails[PROPERTY_TYPES.COMPLETED_DATE_TIME];
        if (timestampList && timestampList.length) {
          const timestamp = moment(timestampList[0]);
          if (timestamp.isSameOrAfter(start) && timestamp.isSameOrBefore(end)) {
            usableNeighbors = usableNeighbors.push(Immutable.fromJS(neighbor));
          }
        }
      });
      if (domainMatch && usableNeighbors.size > 0) {
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
            let newVal = val;
            if (fqn === PROPERTY_TYPES.TIMESTAMP
              || fqn === PROPERTY_TYPES.COMPLETED_DATE_TIME
              || fqn === PROPERTY_TYPES.DATE_TIME) {
              newVal = formatDateTime(val, 'YYYY-MM-DD hh:mma');
            }
            if (!newArrayValues.includes(val)) {
              newArrayValues = newArrayValues.push(newVal);
            }
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

      combinedEntity = combinedEntity.set('S2', getStepTwo(usableNeighborsById.get(id), scoresAsMap.get(id)));
      combinedEntity = combinedEntity.set('S4', getStepFour(usableNeighborsById.get(id), scoresAsMap.get(id)));
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
