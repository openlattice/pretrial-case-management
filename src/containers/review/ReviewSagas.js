/*
 * @flow
 */

import Immutable, { List, Map, fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
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
import type { RequestSequence, SequenceAction } from 'redux-reqseq';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import exportPDF, { exportPDFList } from '../../utils/PDFUtils';
import { getMapByCaseId } from '../../utils/CaseUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { formatDMFFromEntity } from '../../utils/DMFUtils';
import { getEntityKeyId, stripIdField, getSearchTerm } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { CHARGES, PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

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

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  ARREST_CASES,
  ARREST_CHARGES,
  ASSESSED_BY,
  BONDS,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  EDITED_BY,
  FTAS,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  SENTENCES,
  STAFF
} = APP_TYPES;

const chargesFqn :string = APP_TYPES.CHARGES;

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getCharges = state => state.get(STATE.CHARGES, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

const LIST_ENTITY_SETS = Immutable.List.of(STAFF, RELEASE_CONDITIONS, HEARINGS, PRETRIAL_CASES, chargesFqn);

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
  const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
  const personEntityKeyId = getEntityKeyId(neighbors, PEOPLE);

  const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
  const chargesEntitySetId = getEntitySetIdFromApp(app, chargesFqn);
  const arrestChargesEntitySetId = getEntitySetIdFromApp(app, ARREST_CHARGES);
  const ftaEntitySetId = getEntitySetIdFromApp(app, FTAS);
  const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
  const manualChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_CHARGES);
  const manualCourtChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_COURT_CHARGES);
  const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
  const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
  const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
  const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
  const sentencesEntitySetId = getEntitySetIdFromApp(app, SENTENCES);

  let peopleNeighborsById = yield call(
    searchEntityNeighborsWithFilterWorker,
    searchEntityNeighborsWithFilter({
      entitySetId: peopleEntitySetId,
      filter: {
        entityKeyIds: [personEntityKeyId],
        sourceEntitySetIds: [ftaEntitySetId],
        destinationEntitySetIds: [
          arrestCasesEntitySetId,
          arrestChargesEntitySetId,
          chargesEntitySetId,
          hearingsEntitySetId,
          manualChargesEntitySetId,
          manualCourtChargesEntitySetId,
          manualPretrialCourtCasesEntitySetId,
          manualPretrialCasesEntitySetId,
          pretrialCasesEntitySetId,
          sentencesEntitySetId
        ]
      }
    })
  );

  if (peopleNeighborsById.error) throw peopleNeighborsById.error;
  peopleNeighborsById = peopleNeighborsById.data;
  const personNeighbors = peopleNeighborsById[personEntityKeyId];

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
      if (appTypeFqn === PRETRIAL_CASES) {
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
      else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
        allManualCases = allManualCases.push(neighborDetails);
      }
      else if (appTypeFqn === chargesFqn) {
        allCharges = allCharges.push(neighborDetails);
      }
      else if (appTypeFqn === MANUAL_CHARGES || appTypeFqn === MANUAL_COURT_CHARGES) {
        allManualCharges = allManualCharges.push(neighborDetails);
      }
      else if (appTypeFqn === ARREST_CHARGES) {
        allArrestCharges = allArrestCharges.push(neighborDetails);
      }
      else if (appTypeFqn === SENTENCES) {
        allSentences = allSentences.push(neighborDetails);
      }
      else if (appTypeFqn === FTAS) {
        allFTAs = allFTAs.push(Immutable.fromJS(neighborDetails));
      }
      else if (appTypeFqn === HEARINGS) {
        const hearingIsInactive = hearingIsCancelled(neighborDetails);
        const hearingIsGeneric = neighborDetails.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '')
          .toLowerCase().trim() === 'all other hearings';
        if (!hearingIsGeneric && !hearingIsInactive) {
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
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
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
    const { psaIds, scoresAsMap } = action.value;

    if (psaIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
      const dmfFqnEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
      const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
      const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
      const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
      const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
      const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);

      let neighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: psaScoresEntitySetId,
          filter: {
            entityKeyIds: psaIds,
            sourceEntitySetIds: [releaseRecommendationsEntitySetId, dmfFqnEntitySetId],
            destinationEntitySetIds: [
              peopleEntitySetId,
              pretrialCasesEntitySetId,
              psaRiskFactorsEntitySetId,
              staffEntitySetId,
              manualPretrialCourtCasesEntitySetId,
              manualPretrialCasesEntitySetId
            ]
          }
        })
      );
      if (neighborsById.error) throw neighborsById.error;
      neighborsById = fromJS(neighborsById.data);

      neighborsById.entrySeq().forEach(([id, neighbors]) => {
        let allDatesEdited = Immutable.List();
        let neighborsByAppTypeFqn = Immutable.Map();
        const psaCreationDate = moment(scoresAsMap.getIn([id, PROPERTY_TYPES.DATE_TIME, 0], ''));
        if (psaCreationDate.isValid()) {
          allDatesEdited = allDatesEdited.push(psaCreationDate.format('MM/DD/YYYY'));
        }

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
            if (appTypeFqn === STAFF) {
              neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID], Immutable.List())
                .forEach((filer) => {
                  allFilers = allFilers.add(filer);
                });
            }
            if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
              if (appTypeFqn === HEARINGS) {
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
            else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(MANUAL_PRETRIAL_CASES, fromJS(neighbor));
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
    const statusfqn = new FullyQualifiedName(PROPERTY_TYPES.STATUS);

    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const statusPropertyTypeId = getPropertyTypeId(edm, statusfqn);
    const filter = action.value || PSA_STATUSES.OPEN;
    const searchTerm = action.value === '*' ? action.value : getSearchTerm(statusPropertyTypeId, filter);
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
      const loadPSADataRequest = loadPSAData({ psaIds, scoresAsMap });
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
    RELEASE_RECOMMENDATIONS,
    PSA_NEIGHBOR.DETAILS,
    PROPERTY_TYPES.RELEASE_RECOMMENDATION
  ], Immutable.List()).join(', ');
  const dmf = neighbors.getIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
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
    .set('riskFactors', setMultimapToMap(PSA_RISK_FACTORS))
    .set('psaRiskFactors', neighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map()))
    .set('dmfRiskFactors', neighbors.getIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map()))
    .set('dmf', formattedDMF);

  const selectedPretrialCase = neighbors.getIn([
    MANUAL_PRETRIAL_CASES,
    PSA_NEIGHBOR.DETAILS
  ], Immutable.Map());
  const caseId = selectedPretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');

  const selectedCharges = allManualCharges
    .filter(chargeObj => chargeObj.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0] === caseId);
  let selectedCourtCharges = List();
  if (allCharges.size) {
    const associatedCaseIds = neighbors
      .get(PRETRIAL_CASES, List())
      .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''));
    selectedCourtCharges = allCharges
      .filter((chargeObj) => {
        const chargeId = chargeObj.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0];
        return associatedCaseIds.includes(chargeId);
      });
  }

  const selectedPerson = neighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());

  let createData = {
    user: '',
    timestamp: ''
  };
  let updateData;

  neighbors.get(STAFF, Immutable.List()).forEach((writerNeighbor) => {
    const id = writerNeighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
    const user = writerNeighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');

    if (id === assessedByEntitySetId) {
      createData = {
        timestamp: writerNeighbor.getIn(
          [PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
          scores.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')
        ),
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
    const settings = app.get(APP_DATA.SELECTED_ORG_SETTINGS);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map());

    /*
     * Get Entity Set Ids
     */
    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.ARREST_CASES);
    const assessedByEntitySetId = getEntitySetIdFromApp(app, ASSESSED_BY);
    const bondsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.BONDS);
    const chargesEntitySetId = getEntitySetIdFromApp(app, chargesFqn);
    const dmfResultsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const editedByEntitySetId = getEntitySetIdFromApp(app, EDITED_BY);
    const ftaEntitySetId = getEntitySetIdFromApp(app, FTAS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const manualChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_CHARGES);
    const manualCourtChargesEntitySetId = getEntitySetIdFromApp(app, MANUAL_COURT_CHARGES);
    const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const outcomesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.OUTCOMES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const sentencesEntitySetId = getEntitySetIdFromApp(app, SENTENCES);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);

    /*
     * Get Neighbors
     */
    const peopleNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: peopleEntityKeyIds,
          sourceEntitySetIds: [
            bondsEntitySetId,
            dmfResultsEntitySetId,
            dmfRiskFactorsEntitySetId,
            ftaEntitySetId,
            outcomesEntitySetId,
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            psaScoresEntitySetId,
            releaseConditionsEntitySetId,
            releaseRecommendationsEntitySetId
          ],
          destinationEntitySetIds: [
            arrestCasesEntitySetId,
            chargesEntitySetId,
            hearingsEntitySetId,
            manualChargesEntitySetId,
            manualCourtChargesEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            pretrialCasesEntitySetId,
            manualPretrialCasesEntitySetId,
            sentencesEntitySetId
          ]
        }
      })
    );
    if (peopleNeighborsById.error) throw peopleNeighborsById.error;
    const peopleNeighbors = peopleNeighborsById.data;

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
          if (id === psaScoresEntitySetId) {
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

    let psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresEntitySetId,
        filter: {
          entityKeyIds: psasById.keySeq().toJS(),
          sourceEntitySetIds: [
            dmfResultsEntitySetId,
            releaseRecommendationsEntitySetId,
            bondsEntitySetId,
            outcomesEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            dmfRiskFactorsEntitySetId,
            pretrialCasesEntitySetId,
            manualPretrialCasesEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            arrestCasesEntitySetId,
            staffEntitySetId
          ]
        }
      })
    );
    if (psaNeighborsById.error) throw psaNeighborsById.error;
    psaNeighborsById = fromJS(psaNeighborsById.data);

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
      const personId = neighbors.getIn([PEOPLE, PSA_NEIGHBOR.ID]);
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
    const settings = app.get(APP_DATA.SELECTED_ORG_SETTINGS);
    const charges = yield select(getCharges);
    const orgId = yield select(getOrgId);
    const assessedByEntitySetId = getEntitySetIdFromApp(app, ASSESSED_BY);
    const editedByEntitySetId = getEntitySetIdFromApp(app, EDITED_BY);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
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
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const dmfEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const notesEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);

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
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    /*
     * Get Entity Set Ids
     */
    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
    const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
    const dmfResultsEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);

    let psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresEntitySetId,
        filter: {
          entityKeyIds: [id],
          sourceEntitySetIds: [
            dmfResultsEntitySetId,
            releaseRecommendationsEntitySetId,
            bondsEntitySetId,
            outcomesEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [
            hearingsEntitySetId,
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            dmfRiskFactorsEntitySetId,
            pretrialCasesEntitySetId,
            manualPretrialCasesEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            arrestCasesEntitySetId,
            staffEntitySetId
          ]
        }
      })
    );

    if (psaNeighborsById.error) throw psaNeighborsById.error;
    psaNeighborsById = fromJS(psaNeighborsById.data);
    const neighborsList = psaNeighborsById.get(id, List());

    let neighbors = Immutable.Map();
    neighborsList.forEach((neighbor) => {
      const neighborEntitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const neighborDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
      const appTypeFqn = entitySetIdsToAppType.get(neighborEntitySetId, '');
      if (neighborEntitySetId && appTypeFqn) {
        if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
          if (appTypeFqn === HEARINGS) {
            neighbors = neighbors.set(
              appTypeFqn,
              neighbors.get(appTypeFqn, Immutable.List()).push(neighborDetails)
            );
          }
          else {
            neighbors = neighbors.set(
              appTypeFqn,
              neighbors.get(appTypeFqn, Immutable.List()).push(neighbor)
            );
          }
        }
        else {
          neighbors = neighbors.set(appTypeFqn, neighbor);
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
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);

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
