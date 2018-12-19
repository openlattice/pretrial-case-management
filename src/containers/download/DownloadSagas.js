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
import {
  all,
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import FileSaver from '../../utils/FileSaver';
import { toISODate, formatDateTime } from '../../utils/FormattingUtils';
import { getFilteredNeighbor, stripIdField } from '../../utils/DataUtils';
import { obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HEADERS_OBJ, POSITIONS } from '../../utils/consts/CSVConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import {
  DOWNLOAD_CHARGE_LISTS,
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  GET_DOWNLOAD_FILTERS,
  downloadChargeLists,
  downloadPSAsByHearingDate,
  downloadPsaForms,
  getDownloadFilters
} from './DownloadActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const DATETIME_FQNS = [PROPERTY_TYPES.TIMESTAMP, PROPERTY_TYPES.COMPLETED_DATE_TIME, PROPERTY_TYPES.DATE_TIME];

// TODO: Need to refactor to export from entity sets
function* downloadChargeListsWorker(action :SequenceAction) :Generator<*, *, *> {
//
//   try {
//     yield put(downloadChargeLists.request(action.id));
//
//     const { jurisdiction } = action.value;
//
//     const chargesList = jurisdiction === DOMAIN.MINNEHAHA ? MinnehahaChargesList : PenningtonChargesList;
//
//     let jsonResults = Immutable.List();
//     const chargeHeaders = Immutable.List(
//       ['statute', 'description', 'degree', 'degreeShort']
//     );
//
//     const chargeDMFHeaders = Immutable.List(
//       [
//         CHARGE_TYPES.STEP_TWO,
//         CHARGE_TYPES.STEP_FOUR,
//         CHARGE_TYPES.ALL_VIOLENT
//       ]
//     );
//     const exceptionHeaders = Immutable.List(
//       [
//         BHE_LABELS.RELEASE,
//         BRE_LABELS.LABEL
//       ]
//     );
//
//     const step2ChargeValues = getChargeValues(CHARGE_TYPES.STEP_TWO);
//     const step4ChargeValues = getChargeValues(CHARGE_TYPES.STEP_FOUR);
//     const violentChargeValues = getChargeValues(CHARGE_TYPES.ALL_VIOLENT);
//     const pennBookingHoldExceptions = getExceptions(PENN_BOOKING_HOLD_EXCEPTIONS);
//     const pennBookingReleaseExceptions = getExceptions(PENN_BOOKING_RELEASE_EXCEPTIONS);
//
//
//     chargesList.forEach((charge) => {
//       let row = Immutable.Map();
//       const { statute, description } = charge;
//       const chargeString = `${statute}|${description}`;
//       chargeHeaders.forEach((header) => {
//         row = row.set(header, charge[header]);
//       });
//       row = row
//         .set(
//           CHARGE_TYPES.STEP_TWO,
//           step2ChargeValues.includes(chargeString)
//         )
//         .set(
//           CHARGE_TYPES.STEP_FOUR,
//           step4ChargeValues.includes(chargeString)
//         )
//         .set(
//           CHARGE_TYPES.ALL_VIOLENT,
//           violentChargeValues.includes(chargeString)
//         )
//         .set(
//           BHE_LABELS.RELEASE,
//           pennBookingHoldExceptions.includes(chargeString)
//         )
//         .set(
//           BRE_LABELS.LABEL,
//           pennBookingReleaseExceptions.includes(chargeString)
//         );
//
//       jsonResults = jsonResults.push(row);
//     });
//
//     let allHeaders = chargeHeaders.concat(chargeDMFHeaders);
//     if (jurisdiction === DOMAIN.PENNINGTON) allHeaders = allHeaders.concat(exceptionHeaders);
//
//
//     const fields = allHeaders.toJS();
//     const csv = Papa.unparse({
//       fields,
//       data: jsonResults.toJS()
//     });
//
//     const name = `${jurisdiction}-Master Charge List`;
//
//     FileSaver.saveFile(csv, name, 'csv');
//
//     yield put(downloadChargeLists.success(action.id));
//   }
//   catch (error) {
//     console.error(error);
//     yield put(downloadChargeLists.failure(action.id, { error }));
//   }
//   finally {
//     yield put(downloadChargeLists.finally(action.id));
//   }
}
//
function* downloadChargeListsWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_CHARGE_LISTS, downloadChargeListsWorker);
}

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
    const {
      courtTime,
      enteredHearingDate,
      selectedHearingData,
      filters,
      domain
    } = action.value;
    let noResults = false;
    let usableNeighborsById = Immutable.Map();
    let hearingIds = Immutable.Set();
    let hearingIdsToPSAIds = Immutable.Map();
    let personIdsToHearingIds = Immutable.Map();
    let scoresAsMap = Immutable.Map();

    yield put(downloadPSAsByHearingDate.request(action.id, { noResults }));

    const [
      hearingEntitySetId,
      peopleEntitySetId,
      psaEntitySetId
    ] = yield all([
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS),
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE),
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PSA_SCORES)
    ]);

    if (selectedHearingData.size) {
      selectedHearingData.forEach((hearing) => {
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        if (hearingId) {
          hearingIds = hearingIds.add(hearingId);
        }
      });
    }

    let hearingNeighborsById = yield call(SearchApi.searchEntityNeighborsBulk, hearingEntitySetId, hearingIds.toJS());
    hearingNeighborsById = Immutable.fromJS(hearingNeighborsById);
    hearingNeighborsById.entrySeq().forEach(([hearingId, neighbors]) => {
      let hasPerson = false;
      let hasPSA = false;
      let personId;
      neighbors.forEach((neighbor) => {
        const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
        const neighborEntityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
        if (entitySetName === ENTITY_SETS.PSA_SCORES
            && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
          hasPSA = true;
          scoresAsMap = scoresAsMap.set(
            neighborEntityKeyId,
            neighbor.get(PSA_NEIGHBOR.DETAILS)
          );
          hearingIdsToPSAIds = hearingIdsToPSAIds.set(
            hearingId,
            neighborEntityKeyId
          );
        }
        if (entitySetName === ENTITY_SETS.PEOPLE) {
          hasPerson = true;
          personId = neighborEntityKeyId;
        }
      });
      if (hasPerson && !hasPSA) {
        personIdsToHearingIds = personIdsToHearingIds.set(
          personId,
          hearingId
        );
      }
    });

    if (personIdsToHearingIds.size) {
      let peopleNeighborsById = yield call(
        SearchApi.searchEntityNeighborsBulk,
        peopleEntitySetId,
        personIdsToHearingIds.keySeq().toJS()
      );

      peopleNeighborsById = Immutable.fromJS(peopleNeighborsById);
      peopleNeighborsById.entrySeq().forEach(([id, neighbors]) => {
        let hasValidHearing = false;
        let mostCurrentPSA;
        let currentPSADateTime;
        let mostCurrentPSAEntityKeyId;
        neighbors.forEach((neighbor) => {
          const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name']);
          const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
          const entityDateTime = moment(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));

          if (entitySetName === ENTITY_SETS.HEARINGS) {
            const hearingDate = entityDateTime;
            const hearingDateInRange = hearingDate.isSame(enteredHearingDate);
            if (hearingDateInRange) {
              hasValidHearing = true;
            }
          }

          if (entitySetName === ENTITY_SETS.PSA_SCORES
              && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
            if (!mostCurrentPSA || currentPSADateTime.isBefore(entityDateTime)) {
              mostCurrentPSA = neighbor;
              mostCurrentPSAEntityKeyId = entityKeyId;
              currentPSADateTime = entityDateTime;
            }
          }
        });

        if (hasValidHearing && mostCurrentPSAEntityKeyId) {
          scoresAsMap = scoresAsMap.set(
            mostCurrentPSAEntityKeyId,
            mostCurrentPSA.get(PSA_NEIGHBOR.DETAILS)
          );
          hearingIdsToPSAIds = hearingIdsToPSAIds.set(
            personIdsToHearingIds.get(id),
            mostCurrentPSAEntityKeyId
          );
        }
      });
    }

    if (hearingIdsToPSAIds.size) {
      const psaNeighborsById = yield call(
        SearchApi.searchEntityNeighborsBulk,
        psaEntitySetId,
        hearingIdsToPSAIds.valueSeq().toJS()
      );

      Object.entries(psaNeighborsById).forEach(([id, neighborList]) => {
        let domainMatch = true;
        neighborList.forEach((neighborObj) => {
          const neighbor = getFilteredNeighbor(neighborObj);
          if (domain && neighbor.neighborEntitySet && neighbor.neighborEntitySet.name === ENTITY_SETS.STAFF) {
            const filer = neighbor.neighborDetails[PROPERTY_TYPES.PERSON_ID][0];
            if (!filer || !filer.toLowerCase().endsWith(domain)) {
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
      if (usableNeighborsById.size) {
        const getUpdatedEntity = (combinedEntityInit, entitySetTitle, entitySetName, details) => {
          if (filters && !filters[entitySetName]) return combinedEntityInit;
          let combinedEntity = combinedEntityInit;
          details.entrySeq().forEach(([fqn, valueList]) => {
            const keyString = `${fqn}|${entitySetName}`;
            const headerString = HEADERS_OBJ[keyString];
            const header = filters ? filters[entitySetName][fqn] : headerString;
            if (header) {
              let newArrayValues = combinedEntity.get(header, Immutable.List());
              valueList.forEach((val) => {
                let newVal = val;
                if (DATETIME_FQNS.includes(fqn)) {
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

        const name = `psas_${courtTime}`;

        FileSaver.saveFile(csv, name, 'csv');

      }
      else {
        noResults = true;
      }


      yield put(downloadPSAsByHearingDate.success(action.id, { noResults }));
    }
    else {
      noResults = true;
      yield put(downloadPSAsByHearingDate.success(action.id, { noResults }));
    }
  }
  catch (error) {
    yield put(downloadPSAsByHearingDate.failure(action.id, { error }));
  }
  finally {
    yield put(downloadPSAsByHearingDate.finally(action.id));
  }
}

function* downloadPSAsByHearingDateWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_PSA_BY_HEARING_DATE, downloadPSAsByHearingDateWorker);
}

// TODO: repetative code, but could be made more robust upon client request
function* getDownloadFiltersWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getDownloadFilters.request(action.id));
    let courtrooms = Immutable.Map();
    let options = Immutable.Map();
    let courtTimeOptions = Immutable.Map();
    let noResults = false;
    const { hearingDate } = action.value;

    const start = toISODate(hearingDate);

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const [datePropertyTypeId, hearingEntitySetId] = yield all([
      call(EntityDataModelApi.getPropertyTypeId, DATE_TIME_FQN),
      call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.HEARINGS)
    ]);

    const ceiling = yield call(DataApi.getEntitySetSize, hearingEntitySetId);

    const hearingOptions = {
      searchTerm: `${datePropertyTypeId}: ${start}`,
      start: 0,
      maxHits: ceiling,
      fuzzy: false
    };

    let allHearingData = yield call(SearchApi.searchEntitySetData, hearingEntitySetId, hearingOptions);
    allHearingData = Immutable.fromJS(allHearingData.hits);
    if (allHearingData.size) {
      allHearingData.forEach((hearing) => {
        const courtTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const sameAshearingDate = (hearingDate.isSame(courtTime, 'day'));
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
        const hearingCourtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0]);
        const hearingHasBeenCancelled = hearing.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '')
          .toLowerCase().trim() === 'cancelled';
        if (hearingId && hearingType && !hearingHasBeenCancelled) {
          if (courtTime && sameAshearingDate) {
            const formattedTime = moment(courtTime).format(('HH:mm'));
            options = options.set(
              `${hearingCourtroom} - ${formattedTime}`,
              options.get(`${hearingCourtroom} - ${formattedTime}`, Immutable.List()).push(hearing)
            );
          }
          courtrooms = courtrooms.set(hearingCourtroom, hearingCourtroom);
        }
      });
    }

    courtTimeOptions = options
      .sortBy(hearings => hearings.getIn([0, PROPERTY_TYPES.DATE_TIME, 0]))
      .sortBy(hearings => hearings.getIn([0, PROPERTY_TYPES.COURTROOM, 0]));

    if (!allHearingData.size) noResults = true;
    yield put(getDownloadFilters.success(action.id, {
      courtrooms,
      courtTimeOptions,
      options,
      allHearingData,
      noResults
    }));
  }
  catch (error) {
    console.error(error);
    yield put(getDownloadFilters.failure(action.id, { error }));
  }
  finally {
    yield put(getDownloadFilters.finally(action.id));
  }
}


function* getDownloadFiltersWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_DOWNLOAD_FILTERS, getDownloadFiltersWorker);
}

export {
  downloadChargeListsWatcher,
  downloadPSAsWatcher,
  downloadPSAsByHearingDateWatcher,
  getDownloadFiltersWatcher
};
