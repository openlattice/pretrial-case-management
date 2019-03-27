/*
 * @flow
 */

import Immutable, { List, Map, fromJS } from 'immutable';
import moment from 'moment';
import {
  AuthorizationApi,
  Constants,
  DataApi,
  SearchApi,
  Models
} from 'lattice';
import {
  all,
  call,
  put,
  take,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import exportPDF, { exportPDFList } from '../../utils/PDFUtils';
import { getMapByCaseId } from '../../utils/CaseUtils';
import { obfuscateEntityNeighbors, obfuscateBulkEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { formatDMFFromEntity } from '../../utils/DMFUtils';
import { getEntityKeyId, stripIdField } from '../../utils/DataUtils';
import {
  APP,
  CHARGES,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION,
  STATE
} from '../../utils/consts/FrontEndStateConsts';
import {
  BULK_DOWNLOAD_PSA_REVIEW_PDF,
  CHANGE_PSA_STATUS,
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSA_DATA,
  LOAD_PSAS_BY_DATE,
  REFRESH_PSA_NEIGHBORS,
  UPDATE_SCORES_AND_RISK_FACTORS,
  bulkDownloadPSAReviewPDF,
  changePSAStatus,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByDate,
  refreshPSANeighbors,
  updateScoresAndRiskFactors
} from './ReviewActionFactory';

const {
  ARREST_CHARGES,
  ASSESSED_BY,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  EDITED_BY,
  FTAS,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  SENTENCES,
  STAFF
} = APP_TYPES_FQNS;

const arrestChargesFqn :string = ARREST_CHARGES.toString();
const assessedByFqn :string = ASSESSED_BY.toString();
const chargesFqn :string = APP_TYPES_FQNS.CHARGES.toString();
const dmfResultsFqn :string = DMF_RESULTS.toString();
const dmfRiskFactorsFqn :string = DMF_RISK_FACTORS.toString();
const editedByFqn :string = EDITED_BY.toString();
const ftasFqn :string = FTAS.toString();
const hearingsFqn :string = HEARINGS.toString();
const manualChargesFqn :string = MANUAL_CHARGES.toString();
const manualCourtChargesFqn :string = MANUAL_COURT_CHARGES.toString();
const manualPretrialCasesFqn :string = MANUAL_PRETRIAL_CASES.toString();
const manualPretrialCourtCasesFqn :string = MANUAL_PRETRIAL_COURT_CASES.toString();
const peopleFqn :string = PEOPLE.toString();
const pretrialCasesFqn :string = PRETRIAL_CASES.toString();
const psaRiskFactorsFqn :string = PSA_RISK_FACTORS.toString();
const psaScoresFqn :string = PSA_SCORES.toString();
const releaseConditionsFqn :string = RELEASE_CONDITIONS.toString();
const releaseRecommendationsFqn :string = RELEASE_RECOMMENDATIONS.toString();
const sentencesFqn :string = SENTENCES.toString();
const staffFqn :string = STAFF.toString();

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getCharges = state => state.get(STATE.CHARGES, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

const LIST_ENTITY_SETS = Immutable.List.of(staffFqn, releaseConditionsFqn, hearingsFqn, pretrialCasesFqn, chargesFqn);

const orderCasesByArrestDate = (case1, case2) => {
  const date1 = moment(case1.getIn([PROPERTY_TYPES.ARREST_DATE, 0], case1.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));
  const date2 = moment(case2.getIn([PROPERTY_TYPES.ARREST_DATE, 0], case2.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));
  if (date1.isValid() && date2.isValid()) {
    if (date1.isBefore(date2)) return 1;
    if (date1.isAfter(date2)) return -1;
  }
  return 0;
};

function* getCasesAndCharges(neighbors) {
  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
  const personEntitySetId = getEntitySetIdFromApp(app, peopleFqn);
  const personEntityKeyId = getEntityKeyId(neighbors, peopleFqn);

  let personNeighbors = yield call(SearchApi.searchEntityNeighbors, personEntitySetId, personEntityKeyId);
  personNeighbors = obfuscateEntityNeighbors(personNeighbors);

  let pretrialCaseOptionsWithDate = Immutable.List();
  let pretrialCaseOptionsWithoutDate = Immutable.List();
  let allManualCases = Immutable.List();
  let allCharges = Immutable.List();
  let allManualCharges = Immutable.List();
  let allArrestCharges = Immutable.List();
  let allSentences = Immutable.List();
  let allFTAs = Immutable.List();
  let allHearings = Immutable.List();
  personNeighbors.forEach((neighbor) => {
    const neighborDetails = Immutable.fromJS(neighbor.neighborDetails);
    const entitySet = neighbor.neighborEntitySet;
    if (entitySet) {
      const { id } = entitySet;
      const appTypeFqn = entitySetIdsToAppType.get(id, '');
      if (appTypeFqn === pretrialCasesFqn) {
        const caseObj = neighborDetails;
        const arrList = caseObj.get(
          PROPERTY_TYPES.ARREST_DATE,
          caseObj.get(PROPERTY_TYPES.FILE_DATE, Immutable.List())
        );
        if (arrList.size) {
          pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.push(caseObj);
        }
        else {
          pretrialCaseOptionsWithoutDate = pretrialCaseOptionsWithoutDate.push(caseObj);
        }
      }
      else if (appTypeFqn === manualPretrialCasesFqn || appTypeFqn === manualPretrialCourtCasesFqn) {
        allManualCases = allManualCases.push(neighborDetails);
      }
      else if (appTypeFqn === chargesFqn) {
        allCharges = allCharges.push(neighborDetails);
      }
      else if (appTypeFqn === manualChargesFqn || appTypeFqn === manualCourtChargesFqn) {
        allManualCharges = allManualCharges.push(neighborDetails);
      }
      else if (appTypeFqn === arrestChargesFqn) {
        allArrestCharges = allArrestCharges.push(neighborDetails);
      }
      else if (appTypeFqn === sentencesFqn) {
        allSentences = allSentences.push(neighborDetails);
      }
      else if (appTypeFqn === ftasFqn) {
        allFTAs = allFTAs.push(Immutable.fromJS(neighborDetails));
      }
      else if (appTypeFqn === hearingsFqn) {
        const hearingIsInactive = neighborDetails.getIn([PROPERTY_TYPES.HEARING_INACTIVE, 0], false);
        const hearingHasBeenCancelled = neighborDetails.getIn([PROPERTY_TYPES.UPDATE_TYPE, 0], '')
          .toLowerCase().trim() === 'cancelled';
        const hearingIsGeneric = neighborDetails.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '')
          .toLowerCase().trim() === 'all other hearings';
        if (!hearingHasBeenCancelled && !hearingIsGeneric && !hearingIsInactive) {
          allHearings = allHearings.push(Immutable.fromJS(neighborDetails));
        }
      }
    }
  });
  pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.sort(orderCasesByArrestDate);
  const allCases = pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate);
  return {
    allCases,
    allManualCases,
    allCharges,
    allManualCharges,
    allArrestCharges,
    allSentences,
    allFTAs,
    allHearings
  };
}

function* checkPSAPermissionsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(checkPSAPermissions.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, psaRiskFactorsFqn);
    const permissions = yield call(AuthorizationApi.checkAuthorizations, [{
      aclKey: [psaRiskFactorsEntitySetId],
      permissions: ['WRITE']
    }]);
    yield put(checkPSAPermissions.success(action.id, { readOnly: !permissions[0].permissions.WRITE }));
  }
  catch (error) {
    console.error(error);
    yield put(checkPSAPermissions.failure(action.id, { error }));
  }
  finally {
    yield put(checkPSAPermissions.finally(action.id));
  }
}

function* checkPSAPermissionsWatcher() :Generator<*, *, *> {
  yield takeEvery(CHECK_PSA_PERMISSIONS, checkPSAPermissionsWorker);
}


function* loadCaseHistoryWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    const { personId, neighbors } = action.value;
    yield put(loadCaseHistory.request(action.id, { personId }));

    const {
      allCases,
      allManualCases,
      allCharges,
      allManualCharges,
      allSentences,
      allFTAs,
      allHearings
    } = yield getCasesAndCharges(neighbors);

    const chargesByCaseId = getMapByCaseId(allCharges, PROPERTY_TYPES.CHARGE_ID);
    const manualChargesByCaseId = getMapByCaseId(allManualCharges, PROPERTY_TYPES.CHARGE_ID);
    const sentencesByCaseId = getMapByCaseId(allSentences, PROPERTY_TYPES.GENERAL_ID);

    yield put(loadCaseHistory.success(action.id, {
      personId,
      allCases,
      allManualCases,
      chargesByCaseId,
      manualChargesByCaseId,
      sentencesByCaseId,
      allFTAs,
      allHearings
    }));

  }
  catch (error) {
    console.error(error);
    yield put(loadCaseHistory.failure(action.id, { error }));
  }
  finally {
    yield put(loadCaseHistory.finally(action.id));
  }
}

function* loadCaseHistoryWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CASE_HISTORY, loadCaseHistoryWorker);
}

function* getAllSearchResults(entitySetId :string, searchTerm :string) :Generator<*, *, *> {
  const loadSizeRequest = {
    searchTerm,
    start: 0,
    maxHits: 1
  };
  const response = yield call(SearchApi.searchEntitySetData, entitySetId, loadSizeRequest);
  const { numHits } = response;

  const loadResultsRequest = {
    searchTerm,
    start: 0,
    maxHits: numHits
  };
  return yield call(SearchApi.searchEntitySetData, entitySetId, loadResultsRequest);
}

function* loadPSADataWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadPSAData.request(action.id));

    let allFilers = Immutable.Set();
    let psaNeighborsById = Immutable.Map();
    let psaNeighborsByDate = Immutable.Map();
    let hearingIds = Immutable.Set();

    if (action.value.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
      const dmfFqnEntitySetId = getEntitySetIdFromApp(app, dmfResultsFqn);
      const psaScoresEntitySetId = getEntitySetIdFromApp(app, psaScoresFqn);
      const peopleEntitySetId = getEntitySetIdFromApp(app, peopleFqn);
      const staffEntitySetId = getEntitySetIdFromApp(app, staffFqn);
      const manualPretrialCasesFqnEntitySetId = getEntitySetIdFromApp(app, manualPretrialCasesFqn);
      const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, releaseRecommendationsFqn);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, psaScoresEntitySetId, {
        entityKeyIds: action.value,
        sourceEntitySetIds: [psaScoresEntitySetId, releaseRecommendationsEntitySetId, dmfFqnEntitySetId],
        destinationEntitySetIds: [
          peopleEntitySetId,
          psaScoresEntitySetId,
          staffEntitySetId,
          manualPretrialCasesFqnEntitySetId
        ]
      });
      neighborsById = obfuscateBulkEntityNeighbors(neighborsById); // TODO just for demo
      neighborsById = Immutable.fromJS(neighborsById);

      neighborsById.entrySeq().forEach(([id, neighbors]) => {
        let allDatesEdited = Immutable.List();
        let neighborsByAppTypeFqn = Immutable.Map();
        neighbors.forEach((neighbor) => {
          neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.TIMESTAMP],
            neighbor.getIn([
              PSA_ASSOCIATION.DETAILS,
              PROPERTY_TYPES.DATE_TIME
            ], Immutable.List())).forEach((timestamp) => {
            const timestampMoment = moment(timestamp);
            if (timestampMoment.isValid()) {
              allDatesEdited = allDatesEdited.push(timestampMoment.format('MM/DD/YYYY'));
            }
          });

          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
          if (appTypeFqn) {
            if (appTypeFqn === staffFqn) {
              neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID], Immutable.List())
                .forEach((filer) => {
                  allFilers = allFilers.add(filer);
                });
            }
            if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
              if (appTypeFqn === hearingsFqn) {
                const neighborDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());
                const hearingEntityKeyId = neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]);
                if (hearingEntityKeyId) hearingIds = hearingIds.add(neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]));
                neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                  appTypeFqn,
                  neighborsByAppTypeFqn.get(appTypeFqn, Immutable.List()).push(fromJS(neighborDetails))
                );
              }
              else {
                neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                  appTypeFqn,
                  neighborsByAppTypeFqn.get(appTypeFqn, Immutable.List()).push(fromJS(neighbor))
                );
              }
            }
            else {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(appTypeFqn, fromJS(neighbor));
            }
          }
        });
        allDatesEdited.forEach((editDate) => {
          psaNeighborsById = psaNeighborsById.set(id, neighborsByAppTypeFqn);
          psaNeighborsByDate = psaNeighborsByDate.set(
            editDate,
            psaNeighborsByDate.get(editDate, Immutable.Map()).set(id, neighborsByAppTypeFqn)
          );
        });

      });
    }

    yield put(loadPSAData.success(action.id, {
      psaNeighborsByDate,
      psaNeighborsById,
      allFilers
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadPSAData.failure(action.id, error));
  }
  finally {
    yield put(loadPSAData.finally(action.id));
  }
}

function* loadPSADataWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PSA_DATA, loadPSADataWorker);
}

function takeReqSeqSuccessFailure(reqseq :RequestSequence, seqAction :SequenceAction) {
  return take(
    (anAction :Object) => (anAction.type === reqseq.SUCCESS && anAction.id === seqAction.id)
        || (anAction.type === reqseq.FAILURE && anAction.id === seqAction.id)
  );
}

function* loadPSAsByDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadPSAsByDate.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const statusfqn = new FullyQualifiedName(PROPERTY_TYPES.STATUS);

    const psaScoresEntitySetId = getEntitySetIdFromApp(app, psaScoresFqn);
    const statusPropertyTypeId = getPropertyTypeId(edm, statusfqn);
    const filter = action.value || PSA_STATUSES.OPEN;
    const searchTerm = action.value === '*' ? action.value : `${statusPropertyTypeId}:"${filter}"`;
    const allScoreData = yield call(getAllSearchResults, psaScoresEntitySetId, searchTerm);

    let scoresAsMap = Immutable.Map();
    allScoreData.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row[OPENLATTICE_ID_FQN][0], stripIdField(Immutable.fromJS(row)));
    });

    yield put(loadPSAsByDate.success(action.id, {
      scoresAsMap,
      psaScoresEntitySetId
    }));

    const psaIds = scoresAsMap.keySeq().toJS();
    if (psaIds.length) {
      const loadPSADataRequest = loadPSAData(psaIds);
      yield put(loadPSADataRequest);
      yield takeReqSeqSuccessFailure(loadPSAData, loadPSADataRequest);
    }
  }
  catch (error) {
    console.error(error);
    yield put(loadPSAsByDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadPSAsByDate.finally(action.id));
  }
}

const getPSADataFromNeighbors = (
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  allCharges :Immutable.List<*>,
  allManualCharges :Immutable.List<*>,
  staffEntitySetId :string,
  assessedByEntitySetId :string,
  editedByEntitySetId :string
) => {
  const recommendationText = neighbors.getIn([
    releaseRecommendationsFqn,
    PSA_NEIGHBOR.DETAILS,
    PROPERTY_TYPES.RELEASE_RECOMMENDATION
  ], Immutable.List()).join(', ');
  const dmf = neighbors.getIn([dmfResultsFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const formattedDMF = Immutable.fromJS(formatDMFFromEntity(dmf)).filter(val => !!val);

  const setMultimapToMap = (appTypeFqn) => {
    let map = Immutable.Map();
    neighbors.getIn([appTypeFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map()).keySeq().forEach((fqn) => {
      map = map.set(fqn, neighbors.getIn([appTypeFqn, PSA_NEIGHBOR.DETAILS, fqn, 0]));
    });
    return map;
  };

  const data = Immutable.Map()
    .set('scores', scores)
    .set('notes', recommendationText)
    .set('riskFactors', setMultimapToMap(psaRiskFactorsFqn))
    .set('psaRiskFactors', neighbors.getIn([psaRiskFactorsFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map()))
    .set('dmfRiskFactors', neighbors.getIn([dmfRiskFactorsFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map()))
    .set('dmf', formattedDMF);

  const selectedPretrialCase = neighbors.getIn([
    manualPretrialCasesFqn,
    PSA_NEIGHBOR.DETAILS
  ], Immutable.Map());
  const caseId = selectedPretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');

  const selectedCharges = allManualCharges
    .filter(chargeObj => chargeObj.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0] === caseId);
  let selectedCourtCharges = List();
  if (allCharges.size) {
    const associatedCaseIds = neighbors
      .get(pretrialCasesFqn, List())
      .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''));
    selectedCourtCharges = allCharges
      .filter((chargeObj) => {
        const chargeId = chargeObj.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0];
        return associatedCaseIds.includes(chargeId);
      });
  }

  const selectedPerson = neighbors.getIn([peopleFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map());

  let createData = {
    user: '',
    timestamp: ''
  };
  let updateData;

  neighbors.get(staffFqn, Immutable.List()).forEach((writerNeighbor) => {
    const id = writerNeighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
    const user = writerNeighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');

    if (id === assessedByEntitySetId) {
      createData = {
        timestamp: writerNeighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0], ''),
        user
      };
    }
    else if (id === editedByEntitySetId) {
      const timestamp = writerNeighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], '');
      const newUpdateData = { timestamp, user };
      if (!updateData) {
        updateData = newUpdateData;
      }
      else {
        const prevTime = moment(updateData.timestamp);
        const currTime = moment(timestamp);
        if (!prevTime.isValid() || currTime.isAfter(prevTime)) {
          updateData = newUpdateData;
        }
      }
    }
  });

  return {
    data,
    selectedCourtCharges,
    selectedPretrialCase,
    selectedCharges,
    selectedPerson,
    createData,
    updateData
  };
};

function* loadPSAsByDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PSAS_BY_DATE, loadPSAsByDateWorker);
}

function* bulkDownloadPSAReviewPDFWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(bulkDownloadPSAReviewPDF.request(action.id));
    const { peopleEntityKeyIds, fileName } = action.value;

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);

    const settings = app.get(APP.SELECTED_ORG_SETTINGS);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId], Map());
    const chargesEntitySetId = getEntitySetIdFromApp(app, chargesFqn);
    const assessedByEntitySetId = getEntitySetIdFromApp(app, assessedByFqn);
    const editedByEntitySetId = getEntitySetIdFromApp(app, editedByFqn);
    const manualChargesEntitySetId = getEntitySetIdFromApp(app, manualChargesFqn);
    const personEntitySetId = getEntitySetIdFromApp(app, peopleFqn);
    const psaEntitySetId = getEntitySetIdFromApp(app, psaScoresFqn);
    const staffEntitySetId = getEntitySetIdFromApp(app, staffFqn);

    let peopleNeighbors = yield call(SearchApi.searchEntityNeighborsBulk, personEntitySetId, peopleEntityKeyIds);
    peopleNeighbors = obfuscateBulkEntityNeighbors(peopleNeighbors); // TODO just for demo

    let manualChargesByPersonId = Immutable.Map();
    let courtChargesByPersonId = Immutable.Map();
    let psasById = Immutable.Map();

    Object.entries(peopleNeighbors).forEach(([personId, neighborList]) => {
      manualChargesByPersonId = manualChargesByPersonId.set(personId, Immutable.List());
      const psaNeighbors = [];

      neighborList.forEach((neighbor) => {
        const { neighborEntitySet, neighborDetails } = neighbor;

        if (neighborEntitySet && Object.keys(neighborDetails).length > 1) {
          const { id } = neighborEntitySet;
          if (id === psaEntitySetId) {
            psaNeighbors.push(neighbor);
          }
          else if (id === manualChargesEntitySetId) {
            manualChargesByPersonId = manualChargesByPersonId
              .set(personId, manualChargesByPersonId.get(personId).push(Immutable.fromJS(neighborDetails)));
          }
          else if (id === chargesEntitySetId) {
            courtChargesByPersonId = courtChargesByPersonId.set(
              personId,
              courtChargesByPersonId.get(personId, Immutable.List()).push(Immutable.fromJS(neighborDetails))
            );
          }
        }
      });

      if (psaNeighbors.length) {
        psaNeighbors.sort((n1, n2) => {
          let t1;
          let t2;

          const t1List = n1.associationDetails[PROPERTY_TYPES.TIMESTAMP];
          const t2List = n2.associationDetails[PROPERTY_TYPES.TIMESTAMP];

          if (t1List && t1List.length) {
            t1 = moment(t1List[0]);
          }

          if (t2List && t2List.length) {
            t2 = moment(t2List[0]);
          }

          if (!t1) return 1;
          if (!t2) return -1;
          return t1.isBefore(t2) ? 1 : -1;
        });

        psasById = psasById.set(psaNeighbors[0].neighborId, psaNeighbors[0].neighborDetails);
      }
    });

    let psaNeighborsById = yield call(SearchApi.searchEntityNeighborsBulk, psaEntitySetId, psasById.keySeq().toJS());
    psaNeighborsById = obfuscateBulkEntityNeighbors(psaNeighborsById); // TODO just for demo
    psaNeighborsById = Immutable.fromJS(psaNeighborsById);

    const pageDetailsList = [];
    psaNeighborsById.entrySeq().forEach(([psaId, neighborList]) => {
      let neighbors = Immutable.Map();
      neighborList.forEach((neighbor) => {
        const neighborEntitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
        const appTypeFqn = entitySetIdsToAppType.get(neighborEntitySetId, '');
        if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
          neighbors = neighbors.set(
            appTypeFqn,
            neighbors.get(appTypeFqn, Immutable.List()).push(neighbor)
          );
        }
        else {
          neighbors = neighbors.set(appTypeFqn, neighbor);
        }
      });
      const scores = Immutable.fromJS(psasById.get(psaId));
      const personId = neighbors.getIn([peopleFqn, PSA_NEIGHBOR.ID]);
      const allManualCharges = manualChargesByPersonId.get(personId, Immutable.List());
      const allCharges = courtChargesByPersonId.get(personId, Immutable.List());
      pageDetailsList.push(getPSADataFromNeighbors(
        scores,
        neighbors,
        allCharges,
        allManualCharges,
        staffEntitySetId,
        assessedByEntitySetId,
        editedByEntitySetId
      ));
    });
    exportPDFList(fileName, pageDetailsList, settings);
  }
  catch (error) {
    console.error(error);
    yield put(bulkDownloadPSAReviewPDF.failure(action.id, error));
  }
  finally {
    yield put(bulkDownloadPSAReviewPDF.finally(action.id));
  }
}

function* bulkDownloadPSAReviewPDFWatcher() :Generator<*, *, *> {
  yield takeEvery(BULK_DOWNLOAD_PSA_REVIEW_PDF, bulkDownloadPSAReviewPDFWorker);
}

function* downloadPSAReviewPDFWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(downloadPSAReviewPDF.request(action.id));
    const { neighbors, scores, isCompact } = action.value;
    const {
      allCases,
      allCharges,
      allManualCharges,
      allSentences,
      allFTAs
    } = yield getCasesAndCharges(neighbors);
    const app = yield select(getApp);
    const settings = app.get(APP.SELECTED_ORG_SETTINGS);
    const charges = yield select(getCharges);
    const orgId = yield select(getOrgId);
    const assessedByEntitySetId = getEntitySetIdFromApp(app, assessedByFqn);
    const editedByEntitySetId = getEntitySetIdFromApp(app, editedByFqn);
    const staffEntitySetId = getEntitySetIdFromApp(app, staffFqn);
    const violentArrestChargeList = charges.getIn([CHARGES.ARREST_VIOLENT, orgId], Map());
    const violentCourtChargeList = charges.getIn([CHARGES.COURT_VIOLENT, orgId], Map());

    const {
      data,
      selectedCourtCharges,
      selectedPretrialCase,
      selectedCharges,
      selectedPerson,
      createData,
      updateData
    } = getPSADataFromNeighbors(
      scores,
      neighbors,
      allCharges,
      allManualCharges,
      staffEntitySetId,
      assessedByEntitySetId,
      editedByEntitySetId
    );

    exportPDF(
      data,
      selectedPretrialCase,
      selectedCourtCharges,
      selectedCharges,
      selectedPerson,
      allCases,
      allCharges,
      allSentences,
      allFTAs,
      violentArrestChargeList,
      violentCourtChargeList,
      createData,
      updateData,
      isCompact,
      settings
    );

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
      scoresId,
      scoresEntity,
      riskFactorsId,
      riskFactorsEntity,
      dmfId,
      dmfEntity,
      dmfRiskFactorsId,
      dmfRiskFactorsEntity,
      notesId,
      notesEntity
    } = action.value;
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, psaScoresFqn);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, psaRiskFactorsFqn);
    const dmfEntitySetId = getEntitySetIdFromApp(app, dmfResultsFqn);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, dmfRiskFactorsFqn);
    const notesEntitySetId = getEntitySetIdFromApp(app, releaseRecommendationsFqn);

    const updates = [
      call(DataApi.replaceEntityInEntitySetUsingFqns,
        psaRiskFactorsEntitySetId,
        riskFactorsId,
        stripIdField(riskFactorsEntity)),
      call(DataApi.replaceEntityInEntitySetUsingFqns,
        psaScoresEntitySetId,
        scoresId,
        stripIdField(scoresEntity)),
    ];

    const reloads = [
      call(DataApi.getEntityData, psaScoresEntitySetId, scoresId),
      call(DataApi.getEntityData, psaRiskFactorsEntitySetId, riskFactorsId)
    ];

    if (dmfEntity && dmfId && dmfEntitySetId) {
      updates.push(
        call(DataApi.replaceEntityInEntitySetUsingFqns,
          dmfEntitySetId,
          dmfId,
          stripIdField(dmfEntity))
      );

      reloads.push(call(DataApi.getEntityData, dmfEntitySetId, dmfId));
    }

    if (dmfRiskFactorsEntity && dmfRiskFactorsId && dmfRiskFactorsEntitySetId) {
      updates.push(
        call(DataApi.replaceEntityInEntitySetUsingFqns,
          dmfRiskFactorsEntitySetId,
          dmfRiskFactorsId,
          stripIdField(dmfRiskFactorsEntity))
      );

      reloads.push(call(DataApi.getEntityData, dmfRiskFactorsEntitySetId, dmfRiskFactorsId));
    }

    if (notesEntity && notesId && notesEntitySetId) {
      updates.push(
        call(DataApi.replaceEntityInEntitySetUsingFqns,
          notesEntitySetId,
          notesId,
          stripIdField(notesEntity))
      );

      reloads.push(call(DataApi.getEntityData, notesEntitySetId, notesId));
    }

    yield all(updates);

    const [
      newScoreEntity,
      newRiskFactorsEntity,
      newDMFEntity,
      newDMFRiskFactorsEntity,
      newNotesEntity
    ] = yield all(reloads);

    yield put(updateScoresAndRiskFactors.success(action.id, {
      scoresId,
      newScoreEntity,
      riskFactorsId,
      newRiskFactorsEntity,
      dmfId,
      newDMFEntity,
      newDMFRiskFactorsEntity,
      newNotesEntity
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

function* refreshPSANeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action.value;
  try {
    yield put(refreshPSANeighbors.request(action.id, { id }));

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, psaScoresFqn);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, hearingsFqn);

    let neighborsList = yield call(SearchApi.searchEntityNeighbors, psaScoresEntitySetId, id);
    neighborsList = obfuscateEntityNeighbors(neighborsList); // TODO just for demo
    let neighbors = Immutable.Map();
    neighborsList.forEach((neighbor) => {
      const { neighborEntitySet, neighborDetails } = neighbor;
      const entitySetId = neighborEntitySet.id;
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId);
      if (neighborEntitySet && neighborDetails) {
        if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
          if (entitySetId === hearingsEntitySetId) {
            neighbors = neighbors.set(
              appTypeFqn,
              neighbors.get(appTypeFqn, Immutable.List()).push(Immutable.fromJS(neighborDetails))
            );
          }
          else {
            neighbors = neighbors.set(
              appTypeFqn,
              neighbors.get(appTypeFqn, Immutable.List()).push(Immutable.fromJS(neighbor))
            );
          }
        }
        else {
          neighbors = neighbors.set(appTypeFqn, Immutable.fromJS(neighbor));
        }
      }
    });
    yield put(refreshPSANeighbors.success(action.id, { id, neighbors }));
  }
  catch (error) {
    console.error(error);
    yield put(refreshPSANeighbors.failure(action.id, error));
  }
  finally {
    yield put(refreshPSANeighbors.finally(action.id, { id }));
  }
}

function* refreshPSANeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_PSA_NEIGHBORS, refreshPSANeighborsWorker);
}

function* changePSAStatusWorker(action :SequenceAction) :Generator<*, *, *> {
  const {
    scoresEntity,
    scoresId,
    callback
  } = action.value;

  try {
    yield put(changePSAStatus.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, psaScoresFqn);

    yield call(
      DataApi.replaceEntityInEntitySetUsingFqns,
      psaScoresEntitySetId,
      scoresId,
      stripIdField(scoresEntity.toJS())
    );
    const newScoresEntity = yield call(DataApi.getEntityData, psaScoresEntitySetId, scoresId);

    yield put(changePSAStatus.success(action.id, {
      id: scoresId,
      entity: newScoresEntity
    }));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    console.error(error);
    yield put(changePSAStatus.failure(action.id, error));
  }
  finally {
    yield put(changePSAStatus.finally(action.id));
  }
}

function* changePSAStatusWatcher() :Generator<*, *, *> {
  yield takeEvery(CHANGE_PSA_STATUS, changePSAStatusWorker);
}

export {
  bulkDownloadPSAReviewPDFWatcher,
  changePSAStatusWatcher,
  checkPSAPermissionsWatcher,
  downloadPSAReviewPDFWatcher,
  loadCaseHistoryWatcher,
  loadPSADataWatcher,
  loadPSAsByDateWatcher,
  refreshPSANeighborsWatcher,
  updateScoresAndRiskFactorsWatcher
};
