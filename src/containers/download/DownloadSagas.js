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
  SearchApi
} from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import { formatDateTime } from '../../utils/FormattingUtils';
import { getFilteredNeighbor, stripIdField } from '../../utils/DataUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HEADERS_OBJ, POSITIONS } from '../../utils/consts/CSVConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { CHARGE } from '../../utils/consts/Consts';
import MinnehahaChargesList from '../../utils/consts/MinnehahaChargesList';
import PenningtonChargesList from '../../utils/consts/PenningtonChargesList';
import { PENN_BOOKING_EXCEPTIONS } from '../../utils/consts/DMFExceptionsList';
import { CHARGE_TYPES, BHE_LABELS, CHARGE_VALUES } from '../../utils/consts/ArrestChargeConsts';
import { VIOLENT_CHARGES } from '../../utils/consts/ChargeConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import {
  DOWNLOAD_PSA_FORMS,
  DOWNLOAD_CHARGE_LISTS,
  downloadPsaForms,
  downloadChargeLists
} from './DownloadActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

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

function* downloadChargeListsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadChargeLists.request(action.id));

    const { jurisdiction } = action.value;

    const chargesList = jurisdiction === DOMAIN.MINNEHAHA ? MinnehahaChargesList : PenningtonChargesList;

    let jsonResults = Immutable.List();
    const chargeHeaders = Immutable.List(
      ['statute', 'description', 'degree', 'degreeShort']
    );

    const chargeIsHeaders = Immutable.List(
      [
        CHARGE_TYPES.STEP_TWO,
        CHARGE_TYPES.STEP_FOUR,
        CHARGE_TYPES.ALL_VIOLENT,
        BHE_LABELS.RELEASE,
        'Zuercher Violent List'
      ]
    );
    const step2ChargeValues = CHARGE_VALUES[CHARGE_TYPES.STEP_TWO]
      .map(charge => `${charge.statute}|${charge.description}`);
    const step4ChargeValues = CHARGE_VALUES[CHARGE_TYPES.STEP_FOUR]
      .map(charge => `${charge.statute}|${charge.description}`);
    const violentChargeValues = CHARGE_VALUES[CHARGE_TYPES.ALL_VIOLENT]
      .map(charge => `${charge.statute}|${charge.description}`);
    const pennBookingExceptions = PENN_BOOKING_EXCEPTIONS
      .map(charge => `${charge.statute}|${charge.description}`);


    chargesList.forEach((charge) => {
      let row = Immutable.Map();
      const { statute, description } = charge;
      chargeHeaders.forEach((header) => {
        row = row.set(header, charge[header]);
      });
      row = row.set(
        CHARGE_TYPES.STEP_TWO,
        step2ChargeValues.includes(`${statute}|${description}`)
      )
        .set(
          CHARGE_TYPES.STEP_FOUR,
          step4ChargeValues.includes(`${statute}|${description}`)
        )
        .set(
          CHARGE_TYPES.ALL_VIOLENT,
          violentChargeValues.includes(`${statute}|${description}`)
        )
        .set(
          BHE_LABELS.RELEASE,
          pennBookingExceptions.includes(`${statute}|${description}`)
        )
        .set(
          'Odyssey Violent List',
          VIOLENT_CHARGES.includes(statute)
        );

      jsonResults = jsonResults.push(row);
    });

    const allHeaders = chargeHeaders.concat(chargeIsHeaders);


    const fields = allHeaders.toJS();
    const csv = Papa.unparse({
      fields,
      data: jsonResults.toJS()
    });

    const name = `${jurisdiction}-Master Charge List`;

    FileSaver.saveFile(csv, name, 'csv');

    yield put(downloadChargeLists.success(action.id));
  }
  catch (error) {
    console.error(error);
    yield put(downloadChargeLists.failure(action.id, { error }));
  }
  finally {
    yield put(downloadChargeLists.finally(action.id));
  }
}

function* downloadChargeListsWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_CHARGE_LISTS, downloadChargeListsWorker);
}

export {
  downloadPSAsWatcher,
  downloadChargeListsWatcher
};
