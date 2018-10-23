/*
 * @flow
 */
import Immutable from 'immutable';
import Papa from 'papaparse';
import moment from 'moment';
import {
  Constants,
  DataApi,
  EntityDataModelApi,
  SearchApi,
  Models
} from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import { formatDateTime } from '../../utils/FormattingUtils';
import { getFilteredNeighbor, stripIdField } from '../../utils/DataUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import {
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  downloadPSAsByHearingDate,
  downloadPsaForms
} from './DownloadActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HEADERS_OBJ, POSITIONS } from '../../utils/consts/CSVConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const getStepTwo = (neighborList, psaScores) => {
  const nvca = psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0], false);
  let extradited = false;
  let step2Charges = false;
  let currentViolentOffense = false;

  neighborList.forEach((neighbor) => {
    const name = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
    const data = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());
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
    const name = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
    const data = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());
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

    let neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, scoresAsMap.keySeq().toJS());
    neighborsById = obfuscateBulkEntityNeighbors(neighborsById); // TODO just for demo
    let usableNeighborsById = Immutable.Map();

    Object.keys(neighborsById).forEach((id) => {
      let usableNeighbors = Immutable.List();
      const neighborList = neighborsById[id];
      let domainMatch = true;
      neighborList.forEach((neighborObj) => {
        const neighbor = getFilteredNeighbor(neighborObj);
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
        const keyString = `${fqn}|${entitySetName}`;
        const headerString = HEADERS_OBJ[keyString];
        const header = filters ? filters[entitySetName][fqn] : headerString;
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
      let combinedEntity = getUpdatedEntity(
        Immutable.Map(),
        'South Dakota PSA Scores',
        ENTITY_SETS.PSA_SCORES,
        scoresAsMap.get(id)
      );

      usableNeighborsById.get(id).forEach((neighbor) => {
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'title']),
          neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']),
          neighbor.get(PSA_ASSOCIATION.DETAILS)
        );
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'title']),
          neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']),
          neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map())
        );
        allHeaders = allHeaders.union(combinedEntity.keys())
          .sort((header1, header2) => (POSITIONS.indexOf(header1) >= POSITIONS.indexOf(header2) ? 1 : -1));
      });

      combinedEntity = combinedEntity.set('S2', getStepTwo(usableNeighborsById.get(id), scoresAsMap.get(id)));
      combinedEntity = combinedEntity.set('S4', getStepFour(usableNeighborsById.get(id), scoresAsMap.get(id)));

      if (
        combinedEntity.get('FIRST')
        || combinedEntity.get('MIDDLE')
        || combinedEntity.get('LAST')
        || combinedEntity.get('Last Name')
        || combinedEntity.get('First Name')
      ) {
        jsonResults = jsonResults.push(combinedEntity);
      }
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

function* downloadPSAsByHearingDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadPSAsByHearingDate.request(action.id));
    const {
      startDate,
      endDate,
      filters,
      domain
    } = action.value;

    let usableNeighborsById = Immutable.Map();
    let hearingIds = Immutable.Set();
    let hearingIdsToPSAIds = Immutable.Map();
    let personIdsToHearingIds = Immutable.Map();
    let scoresAsMap = Immutable.Map();

    const start = startDate.toISOString(true);
    const end = endDate.toISOString(true);

    const hearingEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS);
    const psaEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES);
    const peopleEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);

    const ceiling = yield call(DataApi.getEntitySetSize, hearingEntitySetId);
    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);
    const datePropertyTypeId = yield call(EntityDataModelApi.getPropertyTypeId, DATE_TIME_FQN);

    const hearingOptions = {
      searchTerm: `${datePropertyTypeId}: [${start} TO ${end}]`,
      start: 0,
      maxHits: ceiling,
      fuzzy: false
    };

    const allHearingData = yield call(SearchApi.searchEntitySetData, hearingEntitySetId, hearingOptions);
    if (allHearingData.hits.length) {
      allHearingData.hits.forEach((hearing) => {
        const hearingType = hearing[PROPERTY_TYPES.HEARING_TYPE][0];
        if (hearingType === 'Initial Appearance') hearingIds = hearingIds.add(hearing[OPENLATTICE_ID_FQN][0]);
      });
    }

    let hearingNeighborsById = yield call(SearchApi.searchEntityNeighborsBulk, hearingEntitySetId, hearingIds.toJS());
    hearingNeighborsById = Immutable.fromJS(hearingNeighborsById);
    hearingIds.forEach((hearingId) => {
      let hasPerson = false;
      let hasPSA = false;
      let personId;
      hearingNeighborsById.get(hearingId).forEach((neighbor) => {
        const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
        if (entitySetName === ENTITY_SETS.PSA_SCORES) {
          hasPSA = true;
          scoresAsMap = scoresAsMap.set(
            neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]),
            neighbor.get(PSA_NEIGHBOR.DETAILS)
          );
          hearingIdsToPSAIds = hearingIdsToPSAIds.set(
            hearingId,
            neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0])
          );
        }
        if (entitySetName === ENTITY_SETS.PEOPLE) {
          hasPerson = true;
          personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
        }
      });
      if (hasPerson && !hasPSA) {
        personIdsToHearingIds = personIdsToHearingIds.set(
          personId,
          hearingId
        );
      }
    });

    let peopleNeighborsById = yield call(
      SearchApi.searchEntityNeighborsBulk,
      peopleEntitySetId,
      personIdsToHearingIds.keySeq().toJS()
    );

    peopleNeighborsById = Immutable.fromJS(peopleNeighborsById);
    peopleNeighborsById.keySeq().forEach((id) => {
      let hasValidHearing = false;
      let mostCurrentPSA;
      peopleNeighborsById.get(id).forEach((neighbor) => {
        const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);

        if (entitySetName === ENTITY_SETS.HEARINGS) {
          const hearingDate = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]);
          const hearingDateInRange = moment(hearingDate).isAfter(startDate)
            && moment(hearingDate).isBefore(endDate);
          if (hearingDateInRange) {
            hasValidHearing = true;
          }
        }

        if (entitySetName === ENTITY_SETS.PSA_SCORES) {
          if (!mostCurrentPSA) {
            mostCurrentPSA = neighbor;
          }
          else {
            const currentPSADateTime = moment(mostCurrentPSA
              .getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));
            const psaDateTime = moment(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));
            if (currentPSADateTime.isBefore(psaDateTime)) {
              mostCurrentPSA = neighbor;
            }
          }
        }
      });

      if (hasValidHearing && mostCurrentPSA) {
        scoresAsMap = scoresAsMap.set(
          mostCurrentPSA.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]),
          mostCurrentPSA.get(PSA_NEIGHBOR.DETAILS)
        );
        hearingIdsToPSAIds = hearingIdsToPSAIds.set(
          personIdsToHearingIds.get(id),
          mostCurrentPSA.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0])
        );
      }
    });

    const psaNeighborsById = yield call(
      SearchApi.searchEntityNeighborsBulk,
      psaEntitySetId,
      hearingIdsToPSAIds.valueSeq().toJS()
    );

    Object.keys(psaNeighborsById).forEach((id) => {
      const neighborList = psaNeighborsById[id];
      let domainMatch = true;
      neighborList.forEach((neighborObj) => {
        const neighbor = getFilteredNeighbor(neighborObj);
        if (domain && neighbor.neighborEntitySet && neighbor.neighborEntitySet.name === ENTITY_SETS.STAFF) {
          const filer = neighbor.neighborDetails[PROPERTY_TYPES.PERSON_ID][0];
          if (!filer.toLowerCase().endsWith(domain)) {
            domainMatch = false;
          }
        }
      });
      if (domainMatch) {
        usableNeighborsById = usableNeighborsById.set(
          id,
          Immutable.fromJS(neighborList)
        );
      }
    });

    const getUpdatedEntity = (combinedEntityInit, entitySetTitle, entitySetName, details) => {
      if (filters && !filters[entitySetName]) return combinedEntityInit;
      let combinedEntity = combinedEntityInit;
      details.keySeq().forEach((fqn) => {
        const keyString = `${fqn}|${entitySetName}`;
        const headerString = HEADERS_OBJ[keyString];
        const header = filters ? filters[entitySetName][fqn] : headerString;
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
      let combinedEntity = getUpdatedEntity(
        Immutable.Map(),
        'South Dakota PSA Scores',
        ENTITY_SETS.PSA_SCORES,
        scoresAsMap.get(id)
      );

      usableNeighborsById.get(id).forEach((neighbor) => {
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'title']),
          neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']),
          neighbor.get(PSA_ASSOCIATION.DETAILS)
        );
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'title']),
          neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']),
          neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map())
        );
        allHeaders = allHeaders.union(combinedEntity.keys())
          .sort((header1, header2) => (POSITIONS.indexOf(header1) >= POSITIONS.indexOf(header2) ? 1 : -1));
      });

      combinedEntity = combinedEntity.set('S2', getStepTwo(usableNeighborsById.get(id), scoresAsMap.get(id)));
      combinedEntity = combinedEntity.set('S4', getStepFour(usableNeighborsById.get(id), scoresAsMap.get(id)));

      if (
        combinedEntity.get('FIRST')
        || combinedEntity.get('MIDDLE')
        || combinedEntity.get('LAST')
        || combinedEntity.get('Last Name')
        || combinedEntity.get('First Name')
      ) {
        jsonResults = jsonResults.push(combinedEntity);
      }


    });

    if (filters) {
      jsonResults = yield jsonResults.sortBy(psa => psa.get('First Name')).sortBy(psa => psa.get('Last Name'));
    }

    const fields = filters
      ? Object.values(filters).reduce((es1, es2) => [...Object.values(es1), ...Object.values(es2)])
      : allHeaders.toJS();
    const csv = Papa.unparse({
      fields,
      data: jsonResults.toJS()
    });

    const name = `PSAs-With-Hearing-Dates-From-${startDate.format('MM-DD-YYYY')}-to-${endDate.format('MM-DD-YYYY')}`;

    FileSaver.saveFile(csv, name, 'csv');

    yield put(downloadPSAsByHearingDate.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(downloadPSAsByHearingDate.failure(action.id, { error }));
  }
  finally {
    yield put(downloadPSAsByHearingDate.finally(action.id));
  }
}

function* downloadPSAsByHearingDateWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_PSA_BY_HEARING_DATE, downloadPSAsByHearingDateWorker);
}

export {
  downloadPSAsWatcher,
  downloadPSAsByHearingDateWatcher
};
