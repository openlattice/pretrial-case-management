/*
 * @flow
 */
import Immutable, { fromJS, List, Map } from 'immutable';
import Papa from 'papaparse';
import { DateTime } from 'luxon';
import { Constants, SearchApi, Models } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import {
  all,
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import FileSaver from '../../utils/FileSaver';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { formatDateTime, formatDate, formatTime } from '../../utils/FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { HEADERS_OBJ, POSITIONS } from '../../utils/consts/CSVConsts';
import { PSA_STATUSES, MAX_HITS } from '../../utils/consts/Consts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import {
  getFilteredNeighbor,
  stripIdField,
  getSearchTerm,
  getSearchTermNotExact
} from '../../utils/DataUtils';
import {
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  GET_DOWNLOAD_FILTERS,
  downloadPSAsByHearingDate,
  downloadPsaForms,
  getDownloadFilters
} from './DownloadActionFactory';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const {
  ARREST_CASES,
  BONDS,
  CHARGES,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  STAFF
} = APP_TYPES;

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const DATETIME_FQNS = [
  PROPERTY_TYPES.TIMESTAMP,
  PROPERTY_TYPES.COMPLETED_DATE_TIME,
  PROPERTY_TYPES.DATE_TIME,
  PROPERTY_TYPES.ARREST_DATE_TIME
];

const getStepTwo = (
  neighborList,
  psaScores,
  dmfRiskFactorsEntitySetId,
  psaRiskFactorsEntitySetId
) => {
  const nvca = psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0], false);
  let extradited = false;
  let step2Charges = false;
  let currentViolentOffense = false;

  neighborList.forEach((neighbor) => {
    const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
    const data = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());
    if (entitySetId === dmfRiskFactorsEntitySetId) {
      extradited = data.getIn([PROPERTY_TYPES.EXTRADITED, 0], false);
      step2Charges = data.getIn([PROPERTY_TYPES.DMF_STEP_2_CHARGES, 0], false);
    }
    else if (entitySetId === psaRiskFactorsEntitySetId) {
      currentViolentOffense = data.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE, 0], false);
    }
  });

  return extradited || step2Charges || (nvca && currentViolentOffense);
};

const getStepFour = (
  neighborList,
  psaScores,
  dmfRiskFactorsEntitySetId,
  psaRiskFactorsEntitySetId
) => {
  const nvca = psaScores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0], false);
  let step4Charges = false;
  let currentViolentOffense = false;

  neighborList.forEach((neighbor) => {
    const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
    const data = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());
    if (entitySetId === dmfRiskFactorsEntitySetId) {
      step4Charges = data.getIn([PROPERTY_TYPES.DMF_STEP_4_CHARGES, 0], false);
    }
    else if (entitySetId === psaRiskFactorsEntitySetId) {
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
      filters
    } = action.value;

    const caseToChargeTypes = {
      [MANUAL_PRETRIAL_CASES]: MANUAL_CHARGES,
      [MANUAL_PRETRIAL_COURT_CASES]: MANUAL_COURT_CHARGES,
      [PRETRIAL_CASES]: CHARGES
    };

    let caseIdsToScoreIds = Map();

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const includesPretrialModule = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Entity Set Ids
     */
    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
    const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
    const dmfResultsEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);

    const datePropertyTypeId = getPropertyTypeId(edm, PROPERTY_TYPES.DATE_TIME);

    const start = DateTime.fromISO(startDate);
    const startSearchValue = start.toISODate();
    const end = DateTime.fromISO(endDate);
    const endSearchValue = end.toISODate();

    const searchString = `[${startSearchValue} TO ${endSearchValue}]`;

    const dateRangeSearchValue = getSearchTermNotExact(datePropertyTypeId, searchString);

    const options = {
      searchTerm: dateRangeSearchValue,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };

    const allScoreData = yield call(SearchApi.searchEntitySetData, psaEntitySetId, options);

    let scoresAsMap = Immutable.Map();
    allScoreData.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row[OPENLATTICE_ID_FQN][0], stripIdField(Immutable.fromJS(row)));
    });

    const neighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaEntitySetId,
        filter: {
          entityKeyIds: scoresAsMap.keySeq().toJS(),
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
    if (neighborsById.error) throw neighborsById.error;
    let usableNeighborsById = Immutable.Map();

    Object.keys(neighborsById.data).forEach((id) => {
      const psaCreationDate = DateTime.fromISO(scoresAsMap.getIn([id, PROPERTY_TYPES.DATE_TIME, 0]));
      const psaWasCreatedInTimeRange = psaCreationDate.isValid
                && psaCreationDate >= start
                && psaCreationDate <= end;
      let usableNeighbors = Immutable.List();
      const neighborList = neighborsById.data[id];
      neighborList.forEach((neighborObj) => {
        const neighbor = getFilteredNeighbor(neighborObj);
        const entitySetId = neighbor.neighborEntitySet.id;
        const entityKeyId = neighbor[PSA_NEIGHBOR.DETAILS][PROPERTY_TYPES.ENTITY_KEY_ID][0];
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');

        if (Object.keys(caseToChargeTypes).includes(appTypeFqn)) {
          caseIdsToScoreIds = caseIdsToScoreIds.setIn([appTypeFqn, entityKeyId], id);
        }

        let timestamp = neighbor.associationDetails[PROPERTY_TYPES.TIMESTAMP]
          || neighbor.associationDetails[PROPERTY_TYPES.COMPLETED_DATE_TIME]
          || neighbor.neighborDetails[PROPERTY_TYPES.START_DATE];
        timestamp = timestamp ? timestamp[0] : '';
        const timestampDT = DateTime.fromISO(timestamp);
        const neighborsWereEditedInTimeRange = timestampDT.isValid
          && timestampDT >= start
          && timestampDT <= end;
        if (psaWasCreatedInTimeRange || neighborsWereEditedInTimeRange) {
          usableNeighbors = usableNeighbors.push(Immutable.fromJS(neighbor));
        }
      });
      if (usableNeighbors.size > 0) {
        usableNeighborsById = usableNeighborsById.set(id, usableNeighbors);
      }
    });
    const chargeCalls = [];
    const getChargeCall = (entitySetId, entityKeyIds, chargeEntitySetId) => (
      call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId,
          filter: {
            entityKeyIds,
            sourceEntitySetIds: [chargeEntitySetId],
            destinationEntitySetIds: []
          }
        })
      )
    );
    Object.keys(caseToChargeTypes).forEach((appTypeFqn) => {
      if (caseIdsToScoreIds.get(appTypeFqn, Map()).size) {
        const caseEntitySetId = getEntitySetIdFromApp(app, appTypeFqn);
        const chargeEntitySetId = getEntitySetIdFromApp(app, caseToChargeTypes[appTypeFqn]);
        chargeCalls.push(
          getChargeCall(caseEntitySetId, caseIdsToScoreIds.get(appTypeFqn, Map()).keySeq().toJS(), chargeEntitySetId)
        );
      }
    });

    const chargesByIdList = yield all(chargeCalls);
    let chargesById = Map();

    chargesByIdList.forEach((chargeList) => {
      chargesById = chargesById.merge(fromJS(chargeList.data));
    });

    Object.keys(caseToChargeTypes).forEach((appTypeFqn) => {
      if (caseIdsToScoreIds.get(appTypeFqn, Map()).size) {
        const caseIdsToScoreIdsForAppType = caseIdsToScoreIds.get(appTypeFqn);
        chargesById.entrySeq().forEach(([id, charges]) => {
          const psaEntityKeyId = caseIdsToScoreIdsForAppType.get(id, '');
          if (psaEntityKeyId) {
            charges.forEach((charge) => {
              usableNeighborsById = usableNeighborsById.set(
                psaEntityKeyId,
                usableNeighborsById.get(psaEntityKeyId, List()).push(charge)
              );
            });
          }
        });
      }
    });

    const getUpdatedEntity = (combinedEntityInit, appTypeFqn, details) => {
      if (filters && !filters[appTypeFqn]) return combinedEntityInit;
      let combinedEntity = combinedEntityInit;
      if (Object.values(caseToChargeTypes).includes(appTypeFqn)) {
        let keyString = appTypeFqn;
        if (!includesPretrialModule) {
          keyString = `${MANUAL_COURT_CHARGES}|${MANUAL_CHARGES}`;
        }
        const headerString = HEADERS_OBJ[keyString];
        let newArrayValues = combinedEntity.get(headerString, Immutable.List());
        let statute = '';
        let description = '';
        details.keySeq().forEach((fqn) => {
          if (headerString) {
            details.get(fqn).forEach((val) => {
              if (fqn === PROPERTY_TYPES.CHARGE_STATUTE) {
                statute = val;
              }
              else if (fqn === PROPERTY_TYPES.CHARGE_DESCRIPTION) {
                description = val;
              }
            });
          }
        });
        if (statute.length && description.length) {
          const chargeString = `${statute}|${description}`;
          newArrayValues = newArrayValues.push(chargeString);
          combinedEntity = combinedEntity.set(headerString, newArrayValues);
        }
      }
      else {
        details.keySeq().forEach((fqn) => {
          const keyString = `${fqn}|${appTypeFqn}`;
          const headerString = HEADERS_OBJ[keyString];
          const header = filters ? filters[appTypeFqn][fqn] : headerString;
          if (header) {
            let newArrayValues = combinedEntity.get(header, Immutable.List());
            details.get(fqn).forEach((val) => {
              let newVal = val;
              if (DATETIME_FQNS.includes(fqn)) {
                newVal = formatDateTime(val);
              }
              if (fqn === PROPERTY_TYPES.DOB) {
                newVal = formatDate(val);
              }
              if (!newArrayValues.includes(val)) {
                newArrayValues = newArrayValues.push(newVal);
              }
            });
            combinedEntity = combinedEntity.set(header, newArrayValues);
          }
        });
      }

      return combinedEntity;
    };
    let jsonResults = Immutable.List();
    let allHeaders = Immutable.Set();
    usableNeighborsById.keySeq().forEach((id) => {
      let combinedEntity = getUpdatedEntity(
        Immutable.Map(),
        PSA_SCORES,
        scoresAsMap.get(id)
      );

      usableNeighborsById.get(id).forEach((neighbor) => {
        const associationEntitySetId = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id'], '');
        const neighborEntitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const associationAppTypeFqn = entitySetIdsToAppType.get(associationEntitySetId, '');
        const neighborAppTypeFqn = entitySetIdsToAppType.get(neighborEntitySetId, '');
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          associationAppTypeFqn,
          neighbor.get(PSA_ASSOCIATION.DETAILS)
        );
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          neighborAppTypeFqn,
          neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map())
        );
        allHeaders = allHeaders.union(combinedEntity.keys())
          .sort((header1, header2) => (POSITIONS.indexOf(header1) >= POSITIONS.indexOf(header2) ? 1 : -1));
      });

      combinedEntity = combinedEntity.set('S2', getStepTwo(
        usableNeighborsById.get(id),
        scoresAsMap.get(id),
        dmfRiskFactorsEntitySetId,
        psaRiskFactorsEntitySetId
      ));
      combinedEntity = combinedEntity.set('S4', getStepFour(
        usableNeighborsById.get(id),
        scoresAsMap.get(id),
        dmfRiskFactorsEntitySetId,
        psaRiskFactorsEntitySetId
      ));

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
      jsonResults = jsonResults.sortBy(psa => psa.get('First Name')).sortBy(psa => psa.get('Last Name'));
    }
    else {
      jsonResults = jsonResults.sortBy(psa => psa.get('FIRST')).sortBy(psa => psa.get('LAST'));
    }

    const fields = filters
      ? Object.values(filters).reduce((es1, es2) => [...Object.values(es1), ...Object.values(es2)])
      : allHeaders.toJS();
    const csv = Papa.unparse({
      fields,
      data: jsonResults.toJS()
    });

    const name = `PSAs-${start.toISODate()}-to-${end.toISODate()}`;

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
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const dmfResultsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.DMF_RESULTS);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);

    if (selectedHearingData.size) {
      selectedHearingData.forEach((hearing) => {
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        if (hearingId) {
          hearingIds = hearingIds.add(hearingId);
        }
      });
    }

    let hearingNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: hearingsEntitySetId,
        filter: {
          entityKeyIds: hearingIds.toJS(),
          sourceEntitySetIds: [
            peopleEntitySetId,
            psaEntitySetId
          ],
          destinationEntitySetIds: []
        }
      })
    );
    if (hearingNeighborsById.error) throw hearingNeighborsById.error;
    hearingNeighborsById = Immutable.fromJS(hearingNeighborsById.data);
    hearingNeighborsById.entrySeq().forEach(([hearingId, neighbors]) => {
      let hasPerson = false;
      let hasPSA = false;
      let personId;
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
        const neighborEntityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
        if (entitySetId === psaEntitySetId
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
        if (entitySetId === peopleEntitySetId) {
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
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: peopleEntitySetId,
          filter: {
            entityKeyIds: personIdsToHearingIds.keySeq().toJS(),
            sourceEntitySetIds: [psaEntitySetId],
            destinationEntitySetIds: [hearingsEntitySetId]
          }
        })
      );
      if (peopleNeighborsById.error) throw peopleNeighborsById.error;
      peopleNeighborsById = Immutable.fromJS(peopleNeighborsById.data);

      peopleNeighborsById.entrySeq().forEach(([id, neighbors]) => {
        let hasValidHearing = false;
        let mostCurrentPSA;
        let currentPSADateTime;
        let mostCurrentPSAEntityKeyId;
        neighbors.forEach((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
          const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
          const entityDateTime = DateTime.fromISO(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));

          if (entitySetId === hearingsEntitySetId) {
            const hearingDate = entityDateTime;
            const hearingDateInRange = hearingDate.hasSame(DateTime.fromISO(enteredHearingDate), 'day');
            if (hearingDateInRange) {
              hasValidHearing = true;
            }
          }

          if (entitySetId === psaEntitySetId
              && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
            if (!mostCurrentPSA || currentPSADateTime < entityDateTime) {
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
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: psaEntitySetId,
          filter: {
            entityKeyIds: hearingIdsToPSAIds.valueSeq().toJS(),
            sourceEntitySetIds: [
              dmfResultsEntitySetId,
              releaseRecommendationsEntitySetId
            ],
            destinationEntitySetIds: [
              dmfRiskFactorsEntitySetId,
              peopleEntitySetId,
              psaRiskFactorsEntitySetId,
              staffEntitySetId
            ]
          }
        })
      );
      if (psaNeighborsById.error) throw psaNeighborsById.error;
      Object.entries(psaNeighborsById.data).forEach(([id, neighborList]) => {
        let domainMatch = true;
        neighborList.forEach((neighborObj) => {
          const neighbor = getFilteredNeighbor(neighborObj);
          const entitySetId = neighbor.neighborEntitySet.id;
          if (domain && neighbor.neighborEntitySet && entitySetId === staffEntitySetId) {
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
        const getUpdatedEntity = (combinedEntityInit, appTypeFqn, details) => {
          if (filters && !filters[appTypeFqn]) return combinedEntityInit;
          let combinedEntity = combinedEntityInit;
          details.keySeq().forEach((fqn) => {
            const keyString = `${fqn}|${appTypeFqn}`;
            const headerString = HEADERS_OBJ[keyString];
            const header = filters ? filters[appTypeFqn][fqn] : headerString;
            if (header) {
              let newArrayValues = combinedEntity.get(header, Immutable.List());
              details.get(fqn).forEach((val) => {
                let newVal = val;
                if (DATETIME_FQNS.includes(fqn)) {
                  newVal = formatDateTime(val);
                }
                if (fqn === PROPERTY_TYPES.DOB) {
                  newVal = formatDate(val);
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
            PSA_SCORES,
            scoresAsMap.get(id)
          );

          usableNeighborsById.get(id).forEach((neighbor) => {
            const associationEntitySetId = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id'], '');
            const neighborEntitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const associationAppTypeFqn = entitySetIdsToAppType.get(associationEntitySetId, '');
            const neighborAppTypeFqn = entitySetIdsToAppType.get(neighborEntitySetId, '');
            combinedEntity = getUpdatedEntity(
              combinedEntity,
              associationAppTypeFqn,
              neighbor.get(PSA_ASSOCIATION.DETAILS)
            );
            combinedEntity = getUpdatedEntity(
              combinedEntity,
              neighborAppTypeFqn,
              neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map())
            );
            allHeaders = allHeaders.union(combinedEntity.keys())
              .sort((header1, header2) => (POSITIONS.indexOf(header1) >= POSITIONS.indexOf(header2) ? 1 : -1));
          });

          combinedEntity = combinedEntity.set('S2', getStepTwo(
            usableNeighborsById.get(id),
            scoresAsMap.get(id),
            dmfRiskFactorsEntitySetId,
            psaRiskFactorsEntitySetId
          ));
          combinedEntity = combinedEntity.set('S4', getStepFour(
            usableNeighborsById.get(id),
            scoresAsMap.get(id),
            dmfRiskFactorsEntitySetId,
            psaRiskFactorsEntitySetId
          ));

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
          jsonResults = jsonResults.sortBy(psa => psa.get('First Name')).sortBy(psa => psa.get('Last Name'));
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

    const start = hearingDate;

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const hearingEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const hearingOptions = {
      searchTerm: getSearchTerm(datePropertyTypeId, start.toISODate()),
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    console.log(hearingOptions);

    let allHearingData = yield call(SearchApi.searchEntitySetData, hearingEntitySetId, hearingOptions);
    allHearingData = Immutable.fromJS(allHearingData.hits);
    if (allHearingData.size) {
      allHearingData.forEach((hearing) => {
        const courtTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const courtDT = DateTime.fromISO(courtTime);
        const formattedTime = formatTime(courtTime);
        const sameAshearingDate = (hearingDate.hasSame(courtDT, 'day'));
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
        const hearingCourtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0]);
        const hearingIsInactive = hearingIsCancelled(hearing);
        if (hearingId && hearingType && !hearingIsInactive) {
          if (courtDT.isValid && sameAshearingDate) {
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
  downloadPSAsWatcher,
  downloadPSAsByHearingDateWatcher,
  getDownloadFiltersWatcher
};
