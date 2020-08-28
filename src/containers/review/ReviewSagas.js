/*
 * @flow
 */

import { DateTime } from 'luxon';
import Immutable, {
  List,
  Map,
  fromJS,
  Set
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  AuthorizationApi,
  Constants,
  DataApi,
  SearchApi,
  Models,
  Types
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

import exportPDF, { exportPDFList } from '../../utils/PDFUtils';
import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { formatDate } from '../../utils/FormattingUtils';
import { getMapByCaseId } from '../../utils/CaseUtils';
import { getRCMReleaseConditions } from '../../utils/RCMUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HEARING_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import {
  getEntityProperties,
  getEntityKeyId,
  stripIdField,
  getSearchTerm
} from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';

import {
  BULK_DOWNLOAD_PSA_REVIEW_PDF,
  CHANGE_PSA_STATUS,
  CHECK_PSA_PERMISSIONS,
  DOWNLOAD_PSA_REVIEW_PDF,
  LOAD_CASE_HISTORY,
  LOAD_PSA_DATA,
  LOAD_PSAS_BY_STATUS,
  UPDATE_SCORES_AND_RISK_FACTORS,
  bulkDownloadPSAReviewPDF,
  changePSAStatus,
  checkPSAPermissions,
  downloadPSAReviewPDF,
  loadCaseHistory,
  loadPSAData,
  loadPSAsByStatus,
  updateScoresAndRiskFactors
} from './ReviewActions';

const LOG :Logger = new Logger('ReviewSagas');

const { createEntityAndAssociationData, deleteEntity, updateEntityData } = DataApiActions;
const { createEntityAndAssociationDataWorker, deleteEntityWorker, updateEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { UpdateTypes } = Types;


const {
  ARREST_CASES,
  ARREST_CHARGES,
  ASSESSED_BY,
  CALCULATED_FOR,
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
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  SENTENCES,
  STAFF
} = APP_TYPES;

const { TIMESTAMP } = PROPERTY_TYPES;

const { DeleteTypes } = Types;

const chargesFqn :string = APP_TYPES.CHARGES;

const {
  ENTITY_KEY_ID,
  DATE_TIME,
  HEARING_TYPE
} = PROPERTY_TYPES;

/*
 * Selectors
 */
const getApp = (state) => state.get(STATE.APP, Map());
const getCharges = (state) => state.get(STATE.CHARGES, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

const LIST_ENTITY_SETS = Immutable.List.of(
  STAFF,
  RELEASE_CONDITIONS,
  HEARINGS,
  PRETRIAL_CASES,
  chargesFqn,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS
);

const orderCasesByArrestDate = (case1, case2) => {
  const date1 = DateTime.fromISO(
    case1.getIn([PROPERTY_TYPES.ARREST_DATE, 0], case1.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''))
  );
  const date2 = DateTime.fromISO(
    case2.getIn([PROPERTY_TYPES.ARREST_DATE, 0], case2.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''))
  );
  if (date1.isValid && date2.isValid) {
    return (date1 < date2) ? 1 : -1;
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
  let caseEKIDs = Set();
  let chargeEKIDs = Set();
  let ftaEKIDs = Set();
  personNeighbors.forEach((neighbor) => {
    const neighborDetails = Immutable.fromJS(neighbor.neighborDetails);
    const neighborEKID = getEntityKeyId(neighborDetails);
    const entitySet = neighbor.neighborEntitySet;
    if (entitySet) {
      const { id } = entitySet;
      const appTypeFqn = entitySetIdsToAppType.get(id, '');
      if (appTypeFqn === PRETRIAL_CASES && !caseEKIDs.includes(neighborEKID)) {
        caseEKIDs = caseEKIDs.add(neighborEKID);
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
      else if (appTypeFqn === chargesFqn && !chargeEKIDs.includes(neighborEKID)) {
        chargeEKIDs = chargeEKIDs.add(neighborEKID);
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
      else if (appTypeFqn === FTAS && !ftaEKIDs.includes(neighborEKID)) {
        ftaEKIDs = ftaEKIDs.add(neighborEKID);
        allFTAs = allFTAs.push(Immutable.fromJS(neighborDetails));
      }
      else if (appTypeFqn === HEARINGS) {
        const hearingIsInactive = hearingIsCancelled(neighborDetails);
        const hearingIsGeneric = neighborDetails.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '')
          .toLowerCase().trim() === HEARING_TYPES.ALL_OTHERS;
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
    LOG.error(error);
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
    const { personEKID, neighbors } = action.value;
    yield put(loadCaseHistory.request(action.id, { personEKID }));
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
      personEKID,
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
    LOG.error(error);
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
      const arrestCasesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.ARREST_CASES);
      const bondsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.BONDS);
      const bookingReleaseConditions = getEntitySetIdFromApp(app, RCM_BOOKING_CONDITIONS);
      const courtReleaseConditions = getEntitySetIdFromApp(app, RCM_COURT_CONDITIONS);
      const rcmResultsESID = getEntitySetIdFromApp(app, APP_TYPES.RCM_RESULTS);
      const rcmRiskFactorsEntitySetId = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
      const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
      const outcomesEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.OUTCOMES);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
      const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
      const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
      const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
      const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
      const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
      const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);

      let neighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: psaScoresEntitySetId,
          filter: {
            entityKeyIds: psaIds,
            sourceEntitySetIds: [
              bondsEntitySetId,
              bookingReleaseConditions,
              courtReleaseConditions,
              rcmResultsESID,
              outcomesEntitySetId,
              releaseRecommendationsEntitySetId,
              releaseConditionsEntitySetId
            ],
            destinationEntitySetIds: [
              arrestCasesEntitySetId,
              rcmRiskFactorsEntitySetId,
              hearingsEntitySetId,
              manualPretrialCourtCasesEntitySetId,
              manualPretrialCasesEntitySetId,
              peopleEntitySetId,
              psaRiskFactorsEntitySetId,
              pretrialCasesEntitySetId,
              staffEntitySetId
            ]
          }
        })
      );
      if (neighborsById.error) throw neighborsById.error;
      neighborsById = fromJS(neighborsById.data);

      neighborsById.entrySeq().forEach(([psaEKID, neighbors]) => {
        let allDatesEdited = Immutable.List();
        let neighborsByAppTypeFqn = Immutable.Map();
        const psaCreationDate = scoresAsMap.getIn([psaEKID, PROPERTY_TYPES.DATE_TIME, 0], '');
        const psaCreationDT = DateTime.fromISO(psaCreationDate);
        if (psaCreationDT.isValid) {
          allDatesEdited = allDatesEdited.push(formatDate(psaCreationDate));
        }

        neighbors.forEach((neighbor) => {

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
                const hearingDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
                const {
                  [ENTITY_KEY_ID]: hearingEKID,
                  [DATE_TIME]: hearingDateTime,
                  [HEARING_TYPE]: hearingType
                } = getEntityProperties(neighbor, [DATE_TIME, ENTITY_KEY_ID, HEARING_TYPE]);
                const hearingIsInactive = hearingIsCancelled(neighbor);
                const hearingIsGeneric = hearingType.toLowerCase().trim() === HEARING_TYPES.ALL_OTHERS;
                if (hearingDateTime && !hearingIsGeneric && !hearingIsInactive) {
                  if (hearingEKID) hearingIds = hearingIds.add(hearingEKID);
                  neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                    appTypeFqn,
                    neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(hearingDetails))
                  );
                }
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
          psaNeighborsByDate = psaNeighborsByDate.set(
            editDate,
            psaNeighborsByDate.get(editDate, Immutable.Map()).set(psaEKID, neighborsByAppTypeFqn)
          );
        });
        psaNeighborsById = psaNeighborsById.set(psaEKID, neighborsByAppTypeFqn);
      });
    }

    yield put(loadPSAData.success(action.id, {
      psaNeighborsByDate,
      psaNeighborsById,
      allFilers
    }));
  }
  catch (error) {
    LOG.error(error);
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

function* loadPSAsByStatusWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadPSAsByStatus.request(action.id));
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const statusPropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.STATUS);
    const filter = action.value || PSA_STATUSES.OPEN;
    const searchTerm = action.value === '*' ? action.value : getSearchTerm(statusPropertyTypeId, filter);
    const allScoreData = yield call(getAllSearchResults, psaScoresEntitySetId, searchTerm);

    let scoresAsMap = Map();
    allScoreData.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row[OPENLATTICE_ID_FQN][0], stripIdField(fromJS(row)));
    });

    yield put(loadPSAsByStatus.success(action.id, {
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
    LOG.error(error);
    yield put(loadPSAsByStatus.failure(action.id, { error }));
  }
  finally {
    yield put(loadPSAsByStatus.finally(action.id));
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
  const rcm = neighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const formattedRCM = Immutable.fromJS(rcm).filter((val) => !!val);


  const setMultimapToMap = (appTypeFqn) => {
    let map = Immutable.Map();
    neighbors.getIn([appTypeFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map()).keySeq().forEach((fqn) => {
      map = map.set(fqn, neighbors.getIn([appTypeFqn, PSA_NEIGHBOR.DETAILS, fqn, 0]));
    });
    return map;
  };

  const conditions = getRCMReleaseConditions(neighbors);
  const data = Immutable.Map()
    .set('scores', scores)
    .set('notes', recommendationText)
    .set('riskFactors', setMultimapToMap(PSA_RISK_FACTORS))
    .set('psaRiskFactors', neighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map()))
    .set('rcmRiskFactors', neighbors.getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map()))
    .set('rcmConditions', conditions)
    .set('rcm', formattedRCM);

  const selectedPretrialCase = neighbors.getIn([
    MANUAL_PRETRIAL_CASES,
    PSA_NEIGHBOR.DETAILS
  ], Immutable.Map());
  const caseId = selectedPretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');

  const selectedCharges = allManualCharges
    .filter((chargeObj) => chargeObj.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0] === caseId);
  let selectedCourtCharges = List();
  if (allCharges.size) {
    const associatedCaseIds = neighbors
      .get(PRETRIAL_CASES, List())
      .map((neighbor) => neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''));
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
        const prevTime = DateTime.fromISO(updateData.timestamp);
        const currTime = DateTime.fromISO(timestamp);
        if (!prevTime.isValid || currTime > prevTime) {
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

function* loadPSAsByStatusWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PSAS_BY_STATUS, loadPSAsByStatusWorker);
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
    const bookingReleaseConditions = getEntitySetIdFromApp(app, RCM_BOOKING_CONDITIONS);
    const chargesEntitySetId = getEntitySetIdFromApp(app, chargesFqn);
    const courtReleaseConditions = getEntitySetIdFromApp(app, RCM_COURT_CONDITIONS);
    const rcmResultsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.RCM_RESULTS);
    const rcmRiskFactorsEntitySetId = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
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
            rcmResultsEntitySetId,
            rcmRiskFactorsEntitySetId,
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
            t1 = DateTime.fromISO(t1List[0]);
          }

          if (t2List && t2List.length) {
            t2 = DateTime.fromISO(t2List[0]);
          }

          if (!t1) return 1;
          if (!t2) return -1;
          return t1 < t2 ? 1 : -1;
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
            bondsEntitySetId,
            bookingReleaseConditions,
            courtReleaseConditions,
            outcomesEntitySetId,
            rcmResultsEntitySetId,
            releaseConditionsEntitySetId,
            releaseRecommendationsEntitySetId,
          ],
          destinationEntitySetIds: [
            peopleEntitySetId,
            psaRiskFactorsEntitySetId,
            rcmRiskFactorsEntitySetId,
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
    LOG.error(error);
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
    const violentArrestChargeList = charges.getIn([CHARGE_DATA.ARREST_VIOLENT, orgId], Map());
    const violentCourtChargeList = charges.getIn([CHARGE_DATA.COURT_VIOLENT, orgId], Map());

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
    LOG.error(error);
    yield put(downloadPSAReviewPDF.failure(action.id, { error }));
  }
  finally {
    yield put(downloadPSAReviewPDF.finally(action.id));
  }
}

function* downloadPSAReviewPDFWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_PSA_REVIEW_PDF, downloadPSAReviewPDFWorker);
}

function* updateEntity(
  entitySetId :string,
  entityKeyId :string,
  entity :Object
) :Generator<*, *, *> {
  const updateResponse = yield call(
    updateEntityDataWorker,
    updateEntityData({
      entitySetId,
      entities: { [entityKeyId]: entity },
      updateType: 'PartialReplace'
    })
  );
  if (updateResponse.error) throw updateResponse.error;
}

function* updateScoresAndRiskFactorsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    const {
      bookingConditionsEKID,
      bookingConditionsEntity,
      courtConditionsEntities,
      deleteConditionEKIDS,
      personEKID,
      scoresEKID,
      scoresEntity,
      riskFactorsEKID,
      riskFactorsEntity,
      rcmEKID,
      rcmEntity,
      rcmRiskFactorsEKID,
      rcmRiskFactorsEntity,
      notesEKID,
      notesEntity
    } = action.value;
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /* Get Entity Set Ids */
    const bookingReleaseConditionsESID = getEntitySetIdFromApp(app, RCM_BOOKING_CONDITIONS);
    const calculatedForESID = getEntitySetIdFromApp(app, CALCULATED_FOR);
    const courtReleaseConditionsESID = getEntitySetIdFromApp(app, RCM_COURT_CONDITIONS);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const psaRiskFactorsESID = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const rcmESID = getEntitySetIdFromApp(app, RCM_RESULTS);
    const rcmRiskFactorsESID = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
    const notesESID = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);

    /* Assemble Entities */
    const bookingConditionSubmitEntity = getPropertyIdToValueMap(bookingConditionsEntity, edm);
    const psaScoresSubmitEntity = getPropertyIdToValueMap(scoresEntity, edm);
    const psaRiskFactorsSubmitEntity = getPropertyIdToValueMap(riskFactorsEntity, edm);
    const rcmSubmitEntity = getPropertyIdToValueMap(rcmEntity, edm);
    const rcmRiskFactorsSubmitEntity = getPropertyIdToValueMap(rcmRiskFactorsEntity, edm);
    const notesSubmitEntity = getPropertyIdToValueMap(notesEntity, edm);

    /* Get Prooperty Type Ids */
    const timeStampPTID = getPropertyTypeId(edm, TIMESTAMP);

    /* Update psaScores and psaRiskFactors Condition Data */
    yield call(updateEntity, psaScoresESID, scoresEKID, psaScoresSubmitEntity);
    yield call(updateEntity, psaRiskFactorsESID, riskFactorsEKID, psaRiskFactorsSubmitEntity);

    /* If rcm is present, update */
    if (rcmEntity && rcmEKID && rcmESID) {
      yield call(updateEntity, rcmESID, rcmEKID, rcmSubmitEntity);
    }

    /* If rcmRiskFactors is present, update */
    if (rcmRiskFactorsEntity && rcmRiskFactorsEKID && rcmRiskFactorsESID) {
      yield call(updateEntity, rcmRiskFactorsESID, rcmRiskFactorsEKID, rcmRiskFactorsSubmitEntity);
    }

    /* If notesEntity is present, update */
    if (notesEntity && notesEKID && notesESID) {
      yield call(updateEntity, notesESID, notesEKID, notesSubmitEntity);
    }

    /* if bookingConditions have chnages, update */
    if (bookingConditionsEntity && bookingConditionsEKID) {
      yield call(updateEntity, bookingReleaseConditionsESID, bookingConditionsEKID, bookingConditionSubmitEntity);
    }
    /* if courtConditions have chnaged, update */
    if (courtConditionsEntities && courtConditionsEntities.length) {
      const calculatedForData = { [timeStampPTID]: [DateTime.local().toISO()] };
      const entities = {};
      const associations = {};
      entities[courtReleaseConditionsESID] = [];
      associations[calculatedForESID] = [];
      courtConditionsEntities.forEach((condition, index) => {
        const conditionSubmitEntity = getPropertyIdToValueMap(condition, edm);
        const courtConditionsToRCMAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: courtReleaseConditionsESID,
          dstEntityKeyId: rcmEKID,
          dstEntitySetId: rcmESID
        };
        const courtConditionsToPersonAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: courtReleaseConditionsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        };
        const courtConditionsToPSAAssociation = {
          data: calculatedForData,
          srcEntityIndex: index,
          srcEntitySetId: courtReleaseConditionsESID,
          dstEntityKeyId: scoresEKID,
          dstEntitySetId: psaScoresESID,
        };
        entities[courtReleaseConditionsESID].push(conditionSubmitEntity);
        associations[calculatedForESID].push(courtConditionsToRCMAssociation);
        associations[calculatedForESID].push(courtConditionsToPersonAssociation);
        associations[calculatedForESID].push(courtConditionsToPSAAssociation);
      });

      /* Submit new courtConditions and collect response */
      const response = yield call(
        createEntityAndAssociationDataWorker,
        createEntityAndAssociationData({ associations, entities })
      );
      if (response.error) throw response.error;

      /* Delete old court conditions and collect response */
      const deletes = [];
      deleteConditionEKIDS.forEach((entityKeyId) => {
        const deleteCondition = call(
          deleteEntityWorker,
          deleteEntity({
            entityKeyId,
            entitySetId: courtReleaseConditionsESID,
            deleteType: DeleteTypes.Soft
          })
        );
        deletes.push(deleteCondition);
      });

      yield all(deletes);
    }

    let psaScoresNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: [scoresEKID],
          sourceEntitySetIds: [
            bookingReleaseConditionsESID,
            courtReleaseConditionsESID,
            notesESID,
            psaRiskFactorsESID,
            rcmESID,
            rcmRiskFactorsESID
          ],
          destinationESIDs: []
        }
      })
    );
    if (psaScoresNeighborsById.error) throw psaScoresNeighborsById.error;
    psaScoresNeighborsById = fromJS(psaScoresNeighborsById.data);

    const psaNeighbors = psaScoresNeighborsById.get(scoresEKID, List());

    /* Format Neighbors */
    const psaNeighborsByAppTypeFqn = Map().withMutations((mutable) => {
      psaNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn) {
          if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
            mutable.set(
              appTypeFqn,
              mutable.get(appTypeFqn, List()).push(fromJS(neighbor))
            );
          }
          else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
            mutable.set(MANUAL_PRETRIAL_CASES, neighbor);
          }
          else {
            mutable.set(appTypeFqn, fromJS(neighbor));
          }
        }
      });
    });
    const newBookingConditions = psaNeighborsByAppTypeFqn.get(RCM_BOOKING_CONDITIONS, Map());
    const newCourtConditions = psaNeighborsByAppTypeFqn.get(RCM_COURT_CONDITIONS, Map());
    const newRiskFactorsEntity = psaNeighborsByAppTypeFqn.get(PSA_RISK_FACTORS, Map());
    const newRCMEntity = psaNeighborsByAppTypeFqn.get(RCM_RESULTS, Map());
    const newRCMRiskFactorsEntity = psaNeighborsByAppTypeFqn.get(RCM_RISK_FACTORS, Map());
    const newNotesEntity = psaNeighborsByAppTypeFqn.get(RELEASE_RECOMMENDATIONS, Map());

    yield put(updateScoresAndRiskFactors.success(action.id, {
      newBookingConditions,
      newCourtConditions,
      scoresId: scoresEKID,
      newScoreEntity: scoresEntity,
      newRiskFactorsEntity,
      newRCMEntity,
      newRCMRiskFactorsEntity,
      newNotesEntity
    }));

  }
  catch (error) {
    LOG.error(error);
    yield put(updateScoresAndRiskFactors.failure(action.id, { error }));
  }
  finally {
    yield put(updateScoresAndRiskFactors.finally(action.id));
  }
}

function* updateScoresAndRiskFactorsWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_SCORES_AND_RISK_FACTORS, updateScoresAndRiskFactorsWorker);
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
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    const updatedScores = getPropertyIdToValueMap(scoresEntity.toJS(), edm);

    const psaNeighborsResponse = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: [scoresId],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [peopleESID]
        }
      })
    );
    if (psaNeighborsResponse.error) throw psaNeighborsResponse.error;
    const psaNeighborsById = fromJS(psaNeighborsResponse.data);
    const psaNeighbors = psaNeighborsById.get(scoresId, List());
    let personEKID;
    psaNeighbors.forEach((neighbor) => {
      const neighborEntitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const neighborEKID = getEntityKeyId(neighbor);
      const appTypeFqn = entitySetIdsToAppType.get(neighborEntitySetId, '');
      if (appTypeFqn === PEOPLE) personEKID = neighborEKID;
    });

    const updateResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: psaScoresESID,
        entities: { [scoresId]: updatedScores },
        updateType: UpdateTypes.PartialReplace
      })
    );
    if (updateResponse.error) throw updateResponse.error;

    const newScoresEntity = yield call(DataApi.getEntityData, psaScoresESID, scoresId);

    yield put(changePSAStatus.success(action.id, {
      id: scoresId,
      entity: newScoresEntity,
      personEKID
    }));

    if (callback) {
      callback();
    }
  }
  catch (error) {
    LOG.error(error);
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
  loadPSAsByStatusWatcher,
  updateScoresAndRiskFactorsWatcher
};
