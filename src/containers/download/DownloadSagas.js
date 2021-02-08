/*
 * @flow
 */
import Papa from 'papaparse';
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';
import { Constants } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_PSA_BY_HEARING_DATE,
  DOWNLOAD_PSA_FORMS,
  DOWNLOAD_REMINDER_DATA,
  GET_DOWNLOAD_FILTERS,
  downloadPSAsByHearingDate,
  downloadPsaForms,
  downloadReminderData,
  getDownloadFilters
} from './DownloadActions';

import DOWNLOAD_HEADERS from '../../utils/downloads/DownloadHeaders';
import FileSaver from '../../utils/FileSaver';
import Logger from '../../utils/Logger';
import REMINDERS_CONFIG from '../../utils/downloads/RemindersConfig';
import { getSimpleConstraintGroup } from '../../core/sagas/constants';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import {
  getEntityKeyId,
  getEntityProperties,
  getFilteredNeighbor,
  getNeighborsByAppType,
  getSearchTerm,
  getSearchTermNotExact,
  stripIdField
} from '../../utils/DataUtils';
import { getCombinedEntityObject, rowHasPersonEntity } from '../../utils/DownloadUtils';
import { formatTime } from '../../utils/FormattingUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { MAX_HITS, PSA_STATUSES } from '../../utils/consts/Consts';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getUTCDateRangeSearchString } from '../../utils/consts/DateTimeConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';

const REMINDER_STATUS = {
  SMS_SUCCESS: 'sms-success',
  SMS_FAILED: 'sms-failed',
  EMAIL_SUCCESS: 'email-success',
  EMAIL_FAILED: 'email-failed',
  PHONE_SUCCESS: 'phone-success',
  PHONE_FAILED: 'phone-failed'
};

const STATUSES = Object.values(REMINDER_STATUS);

const LOG :Logger = new Logger('DownloadSagas');

const {
  ARREST_CASES,
  BONDS,
  CHARGES,
  CONTACT_INFORMATION,
  COUNTIES,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_REMINDERS,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  REMINDERS,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  STAFF
} = APP_TYPES;

const {
  ENTITY_KEY_ID,
  NOTIFIED,
  CONTACT_METHOD,
  DATE_TIME,
  TYPE
} = PROPERTY_TYPES;

const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

const getStatusKey = (wasNotified, reminderType, contactMethod) => {
  let statusKey = '';
  if (reminderType === REMINDERS) {
    statusKey = (wasNotified) ? REMINDER_STATUS.SMS_SUCCESS : REMINDER_STATUS.SMS_FAILED;
  }
  if (reminderType === MANUAL_REMINDERS) {
    if (contactMethod === CONTACT_METHODS.EMAIL) {
      statusKey = wasNotified ? REMINDER_STATUS.EMAIL_SUCCESS : REMINDER_STATUS.EMAIL_FAILED;
    }
    else {
      statusKey = wasNotified ? REMINDER_STATUS.PHONE_SUCCESS : REMINDER_STATUS.PHONE_FAILED;
    }
  }
  return statusKey;
};

const sortByName = (psa1, psa2) => {
  const fName1 = psa1.get(DOWNLOAD_HEADERS.FIRST_NAME);
  const fName2 = psa2.get(DOWNLOAD_HEADERS.FIRST_NAME);
  const lName1 = psa1.get(DOWNLOAD_HEADERS.LAST_NAME);
  const lName2 = psa2.get(DOWNLOAD_HEADERS.LAST_NAME);

  if (lName1 !== lName2) return lName1 < lName2 ? -1 : 1;
  if (fName1 !== fName2) return fName1 < fName2 ? -1 : 1;
  return 0;
};

function* getRemindersData(
  month,
  year,
  reminderType
) :Generator<*, *, *> {
  let reminderIdsToStatusKeys = Map();
  let reminderMap = Map();
  let neighborsById = Map();

  const app = yield select(getApp);
  const edm = yield select(getEDM);
  const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME);
  const remindersESID = getEntitySetIdFromApp(app, reminderType);

  const date1 = DateTime.fromObject({ day: 1, month, year });
  const date2 = date1.plus({ week: 1 });
  const date3 = date2.plus({ week: 1 });
  const date4 = date3.plus({ week: 1 });
  const date5 = date1.endOf('month');

  const week1 = getUTCDateRangeSearchString(datePropertyTypeId, date1.startOf('day'), date2.endOf('day'));
  const week2 = getUTCDateRangeSearchString(datePropertyTypeId, date2.startOf('day'), date3.endOf('day'));
  const week3 = getUTCDateRangeSearchString(datePropertyTypeId, date3.startOf('day'), date4.endOf('day'));
  const week4 = getUTCDateRangeSearchString(datePropertyTypeId, date4.startOf('day'), date5.endOf('day'));

  const searchTerms = [week1, week2, week3, week4];

  const reminderSearches = searchTerms.map((searchTerm) => {
    const constraints = getSimpleConstraintGroup(searchTerm);
    const searchOptions = {
      entitySetIds: [remindersESID],
      constraints,
      start: 0,
      maxHits: MAX_HITS
    };
    return (
      call(
        searchEntitySetDataWorker,
        searchEntitySetData(searchOptions)
      )
    );
  });

  const allRemindersData = yield all(reminderSearches);
  if (allRemindersData.error) throw allRemindersData.error;

  reminderMap = Map().withMutations((mutableMap) => {
    allRemindersData.forEach((request) => {
      fromJS(request.data.hits).forEach((reminder) => {
        const {
          [CONTACT_METHOD]: contactMethod,
          [ENTITY_KEY_ID]: reminderEKID,
          [NOTIFIED]: wasNotified
        } = getEntityProperties(reminder, [CONTACT_METHOD, ENTITY_KEY_ID, NOTIFIED]);
        const statusKey = getStatusKey(wasNotified, reminderType, contactMethod);
        reminderIdsToStatusKeys = reminderIdsToStatusKeys.set(reminderEKID, statusKey);
        mutableMap.set(reminderEKID, reminder);
      });
    });
  });

  if (!reminderMap.isEmpty()) {
    const contactInformationESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    /*
    * Get Reminders Neighbors
    */
    const reminderNeighborResponse = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: remindersESID,
        filter: {
          entityKeyIds: reminderMap.keySeq().toJS(),
          sourceEntitySetIds: [],
          destinationEntitySetIds: [
            contactInformationESID,
            countiesESID,
            hearingsESID,
            peopleESID
          ]
        }
      })
    );
    if (reminderNeighborResponse.error) throw reminderNeighborResponse.error;
    neighborsById = fromJS(reminderNeighborResponse.data);
  }

  return {
    reminderIdsToStatusKeys,
    reminderMap,
    neighborsById
  };
}

function* getReminderStats(
  month,
  year,
  reminderType,
  initMap = Map().setIn(['total', 'date'], 'total')
) :Generator<*, *, *> {
  let hearingMap = Map();
  let masterMap = Map();
  let nextCountMap = initMap;

  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
  /*
   * Get Preferred County from app settings
   */
  const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, SETTINGS.PREFERRED_COUNTY], '');

  const {
    reminderIdsToStatusKeys,
    reminderMap,
    neighborsById
  } = yield call(getRemindersData, month, year, reminderType);

  neighborsById.forEach((neighbors, reminderId) => {
    let personEKID;
    let hearingEKID;
    let countyEKID;
    if (neighbors) {
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        const entityKeyId = getEntityKeyId(neighbor);
        if (appTypeFqn === COUNTIES) {
          countyEKID = getEntityKeyId(neighbor);
        }
        if (appTypeFqn === HEARINGS) {
          hearingEKID = entityKeyId;
          hearingMap = hearingMap.set(entityKeyId, neighbor);
        }
        if (appTypeFqn === PEOPLE) {
          personEKID = entityKeyId;
        }
      });
    }
    if (personEKID && hearingEKID) {
      const hearing = hearingMap.get(hearingEKID, Map());
      const {
        [PROPERTY_TYPES.COURTROOM]: courtroom,
        [PROPERTY_TYPES.DATE_TIME]: hearingDateTime
      } = getEntityProperties(hearing, [
        PROPERTY_TYPES.COURTROOM,
        PROPERTY_TYPES.DATE_TIME
      ]);
      const reminder = reminderMap.get(reminderId, Map());
      if (reminder.size) {
        const { [DATE_TIME]: reminderDateTime } = getEntityProperties(reminder, [DATE_TIME]);
        const reminderDate = DateTime.fromISO(reminderDateTime).toISODate();
        const hearingPlusPersonString = `${personEKID}-${courtroom}-${hearingDateTime}`;
        const statusKey = reminderIdsToStatusKeys.get(reminderId, '');
        let existingMap = nextCountMap.get(reminderDate, Map().set('date', reminderDate));
        const nextCount = nextCountMap.getIn([reminderDate, statusKey], 0);
        const nextStatusTotal = nextCountMap.getIn(['total', statusKey], 0);
        if (countyEKID === preferredCountyEKID && reminderType === REMINDERS) {
          const existingStatus = masterMap.getIn([reminderDate, hearingPlusPersonString]);
          const existingStatusTotal = nextCountMap.getIn(['total', existingStatus], 0);
          if (!existingStatus) {
            existingMap = existingMap.set(statusKey, nextCount + 1);
            nextCountMap = nextCountMap.set(reminderDate, existingMap);
            nextCountMap = nextCountMap.setIn(['total', statusKey], nextStatusTotal + 1);
            masterMap = masterMap.setIn(
              [reminderDate, hearingPlusPersonString],
              statusKey
            );
          }
          else if (existingStatus === REMINDER_STATUS.SMS_FAILED && statusKey === REMINDER_STATUS.SMS_SUCCESS) {
            const existingCount = nextCountMap.getIn([reminderDate, existingStatus]);
            if (existingCount) {
              nextCountMap = nextCountMap
                .setIn([reminderDate, statusKey], nextCount + 1)
                .setIn([reminderDate, existingStatus], existingCount - 1)
                .setIn(['total', statusKey], nextStatusTotal + 1)
                .setIn(['total', existingStatus], existingStatusTotal - 1);
            }
            masterMap = masterMap.setIn(
              [reminderDate, hearingPlusPersonString],
              statusKey
            );
          }
        }
        else if (reminderType === MANUAL_REMINDERS) {
          const existingCount = nextCountMap.getIn([reminderDate, statusKey], 0);
          existingMap = existingMap.set(statusKey, existingCount + 1);
          nextCountMap = nextCountMap.set(reminderDate, existingMap);
          nextCountMap = nextCountMap.setIn(['total', statusKey], nextStatusTotal + 1);
        }
      }
    }
  });
  return nextCountMap;
}

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
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Entity Set Ids
     */
    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
    const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
    const bookingReleaseConditions = getEntitySetIdFromApp(app, RCM_BOOKING_CONDITIONS);
    const courtReleaseConditions = getEntitySetIdFromApp(app, RCM_COURT_CONDITIONS);
    const rcmResultsEntitySetId = getEntitySetIdFromApp(app, RCM_RESULTS);
    const rcmRiskFactorsEntitySetId = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
    const hearingESID = getEntitySetIdFromApp(app, HEARINGS);
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
    const startSearchValue = start.toISO();
    const end = DateTime.fromISO(endDate);
    const endSearchValue = end.toISO();

    const searchString = `[${startSearchValue} TO ${endSearchValue}]`;

    const dateRangeSearchValue = getSearchTermNotExact(datePropertyTypeId, searchString);

    const constraints = getSimpleConstraintGroup(dateRangeSearchValue);

    const options = {
      entitySetIds: [psaEntitySetId],
      constraints,
      start: 0,
      maxHits: MAX_HITS,
    };
    const allScoreData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(options)
    );
    if (allScoreData.error) throw allScoreData.error;

    let scoresAsMap = Map();
    allScoreData.data.hits.forEach((row) => {
      scoresAsMap = scoresAsMap.set(row[OPENLATTICE_ID_FQN][0], stripIdField(fromJS(row)));
    });

    const neighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaEntitySetId,
        filter: {
          entityKeyIds: scoresAsMap.keySeq().toJS(),
          sourceEntitySetIds: [
            bookingReleaseConditions,
            courtReleaseConditions,
            rcmResultsEntitySetId,
            releaseRecommendationsEntitySetId,
            bondsEntitySetId,
            outcomesEntitySetId,
            releaseConditionsEntitySetId,
            releaseRecommendationsEntitySetId
          ],
          destinationEntitySetIds: [
            hearingESID,
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
    if (neighborsById.error) throw neighborsById.error;

    let usableNeighborsById = Map();
    let hearingEKIDToPSAEKID = Map();

    Object.keys(neighborsById.data).forEach((id) => {
      const psaCreationDate = DateTime.fromISO(scoresAsMap.getIn([id, PROPERTY_TYPES.DATE_TIME, 0]));
      const psaWasCreatedInTimeRange = psaCreationDate.isValid
                && psaCreationDate >= start
                && psaCreationDate <= end;
      let usableNeighbors = List();
      const neighborList = neighborsById.data[id];
      neighborList.forEach((neighborObj) => {
        const neighbor :Object = getFilteredNeighbor(neighborObj);
        const entitySetId = neighbor.neighborEntitySet.id;
        const entityKeyId = neighbor[PSA_NEIGHBOR.DETAILS][PROPERTY_TYPES.ENTITY_KEY_ID][0];
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');

        if (appTypeFqn === HEARINGS) {
          hearingEKIDToPSAEKID = hearingEKIDToPSAEKID.set(entityKeyId, id);
        }

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
          usableNeighbors = usableNeighbors.push(fromJS(neighbor));
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

    if (hearingEKIDToPSAEKID.size) {
      let hearingNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: hearingESID,
          filter: {
            entityKeyIds: hearingEKIDToPSAEKID.keySeq().toJS(),
            sourceEntitySetIds: [
              bondsEntitySetId,
              outcomesEntitySetId,
              releaseConditionsEntitySetId
            ],
            destinationEntitySetIds: []
          }
        })
      );
      if (hearingNeighborsById.error) throw hearingNeighborsById.error;
      hearingNeighborsById = fromJS(hearingNeighborsById.data);
      hearingNeighborsById.entrySeq().forEach(([hearingEKID, hearingNeighbors]) => {
        const psaEKID = hearingEKIDToPSAEKID.get(hearingEKID, '');
        if (psaEKID.length) {
          usableNeighborsById = usableNeighborsById.set(
            psaEKID,
            usableNeighborsById.get(psaEKID, List()).concat(hearingNeighbors)
          );
        }
      });
    }

    let jsonResults = List().withMutations((mutableList) => {
      usableNeighborsById.entrySeq().forEach(([psaEKID, neighbors]) => {
        const psaScores = scoresAsMap.get(psaEKID, Map());
        const neighborsByAppType = getNeighborsByAppType(app, neighbors);
        const neighborsWithScores = neighborsByAppType.set(PSA_SCORES, fromJS([psaScores]));
        const combinedEntityObject = getCombinedEntityObject(neighborsWithScores, filters);
        if (rowHasPersonEntity(combinedEntityObject)) {
          mutableList.push(combinedEntityObject);
        }
      });
    });

    jsonResults = jsonResults.sort(sortByName);

    const csv = Papa.unparse(jsonResults.toJS());

    const name = `PSAs-${start.toISODate()}-to-${end.toISODate()}`;

    FileSaver.saveFile(csv, name, 'csv');

    yield put(downloadPsaForms.success(action.id));
  }
  catch (error) {
    LOG.error(error);
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
      filters
    } = action.value;
    let noResults = false;
    let usableNeighborsById = Map();
    let hearingIds = Set();
    let hearingIdsToPSAIds = Map();
    let personIdsToHearingIds = Map();
    let scoresAsMap = Map();

    yield put(downloadPSAsByHearingDate.request(action.id, { noResults }));
    const app = yield select(getApp);

    const rcmRiskFactorsEntitySetId = getEntitySetIdFromApp(app, RCM_RISK_FACTORS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
    const rcmResultsEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.RCM_RESULTS);
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
    hearingNeighborsById = fromJS(hearingNeighborsById.data);
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
      peopleNeighborsById = fromJS(peopleNeighborsById.data);

      peopleNeighborsById.entrySeq().forEach(([id, neighbors]) => {
        let hasValidHearing = false;
        let mostCurrentPSA :Map = Map();
        let currentPSADateTime :DateTime;
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
            if (!mostCurrentPSA.size || currentPSADateTime < entityDateTime) {
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
              rcmResultsEntitySetId,
              releaseRecommendationsEntitySetId
            ],
            destinationEntitySetIds: [
              rcmRiskFactorsEntitySetId,
              peopleEntitySetId,
              psaRiskFactorsEntitySetId,
              staffEntitySetId
            ]
          }
        })
      );
      if (psaNeighborsById.error) throw psaNeighborsById.error;
      const neighborEntries :any = Object.entries(psaNeighborsById.data);
      neighborEntries.forEach(([id, neighborList]) => {
        usableNeighborsById = usableNeighborsById.set(
          id,
          fromJS(neighborList)
        );
      });
      if (usableNeighborsById.size) {
        let jsonResults = List().withMutations((mutableList) => {
          usableNeighborsById.entrySeq().forEach(([psaEKID, neighbors]) => {
            const psaScores = scoresAsMap.get(psaEKID, Map());
            const neighborsByAppType = getNeighborsByAppType(app, neighbors);
            const neighborsWithScores = neighborsByAppType.set(PSA_SCORES, fromJS([psaScores]));
            const combinedEntityObject = getCombinedEntityObject(neighborsWithScores, filters);
            if (rowHasPersonEntity(combinedEntityObject)) {
              mutableList.push(combinedEntityObject);
            }
          });
        });

        jsonResults = jsonResults.sort(sortByName);

        const csv = Papa.unparse(jsonResults.toJS());

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
    LOG.error(error);
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

function* downloadReminderDataWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(downloadReminderData.request(action.id));
    const { month, year, rawData } = action.value;

    if (rawData) {
      const app = yield select(getApp);
      const {
        reminderMap,
        neighborsById
      } = yield call(getRemindersData, month, year, REMINDERS);
      const {
        reminderMap: manualRemindersMap,
        neighborsById: manualRemindersNeighborsById
      } = yield call(getRemindersData, month, year, MANUAL_REMINDERS);

      const jsonResults = List().withMutations((mutableList) => {
        neighborsById.entrySeq().forEach(([reminderEKID, neighbors]) => {
          const reminder = reminderMap.get(reminderEKID, Map()).set(TYPE, List.of('SMS'));
          const neighborsByAppType = getNeighborsByAppType(app, neighbors);
          const neighborsWithReminders = neighborsByAppType.set(REMINDERS, fromJS([reminder]));
          const combinedEntityObject = getCombinedEntityObject(neighborsWithReminders, REMINDERS_CONFIG);
          if (rowHasPersonEntity(combinedEntityObject)) {
            mutableList.push(combinedEntityObject);
          }
        });
        manualRemindersNeighborsById.entrySeq().forEach(([reminderEKID, neighbors]) => {
          const reminder = manualRemindersMap.get(reminderEKID, Map()).set(TYPE, List.of('Manual'));
          const neighborsByAppType = getNeighborsByAppType(app, neighbors);
          const neighborsWithReminders = neighborsByAppType.set(MANUAL_REMINDERS, fromJS([reminder]));
          const combinedEntityObject = getCombinedEntityObject(neighborsWithReminders, REMINDERS_CONFIG);
          if (rowHasPersonEntity(combinedEntityObject)) {
            mutableList.push(combinedEntityObject);
          }
        });
      });

      const csv = Papa.unparse(jsonResults.toJS());
      const name = `REMINDERS_${month}_${year}_RAW`;

      FileSaver.saveFile(csv, name, 'csv');
    }
    else {
      const remindersData :Map = yield call(getReminderStats, month, year, REMINDERS);
      const jsonResults :Map = yield call(getReminderStats, month, year, MANUAL_REMINDERS, remindersData);

      const fields = ['date'].concat(STATUSES);
      const data = jsonResults.valueSeq().sortBy((row) => row.get('date')).toJS();

      const csv = Papa.unparse({ fields, data });

      const name = `REMINDERS_${month}_${year}`;

      FileSaver.saveFile(csv, name, 'csv');
    }

    yield put(downloadReminderData.success(action.id));
  }

  catch (error) {
    LOG.error(error);
    yield put(downloadReminderData.failure(action.id, { error }));
  }
  finally {
    yield put(downloadReminderData.finally(action.id));
  }
}

function* downloadReminderDataWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_REMINDER_DATA, downloadReminderDataWorker);
}

// TODO: repetative code, but could be made more robust upon client request
function* getDownloadFiltersWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getDownloadFilters.request(action.id));
    let courtrooms = Map();
    let options = Map();
    let courtTimeOptions = Map();
    let noResults = false;
    const { hearingDate } = action.value;

    const start = hearingDate;

    const DATE_TIME_FQN :string = PROPERTY_TYPES.DATE_TIME;

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const hearingEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);
    const searchTerm = getSearchTerm(datePropertyTypeId, start.toISODate());
    const constraints = getSimpleConstraintGroup(searchTerm);

    const hearingOptions = {
      entitySetIds: [hearingEntitySetId],
      constraints,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };

    let allHearingData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(hearingOptions)
    );
    if (allHearingData.error) throw allHearingData.error;

    allHearingData = fromJS(allHearingData.data.hits);
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
              options.get(`${hearingCourtroom} - ${formattedTime}`, List()).push(hearing)
            );
          }
          courtrooms = courtrooms.set(hearingCourtroom, hearingCourtroom);
        }
      });
    }

    courtTimeOptions = options
      .sortBy((hearings) => hearings.getIn([0, PROPERTY_TYPES.DATE_TIME, 0]))
      .sortBy((hearings) => hearings.getIn([0, PROPERTY_TYPES.COURTROOM, 0]));

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
    LOG.error(error);
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
  getDownloadFiltersWatcher,
  downloadReminderDataWatcher
};
