/*
 * @flow
 */

import moment from 'moment';
import { Constants, SearchApi, Models } from 'lattice';
import {
  fromJS,
  Map,
  Set,
  List
} from 'immutable';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getSearchTerm } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { MAX_HITS, PSA_STATUSES } from '../../utils/consts/Consts';
import { toISODate, TIME_FORMAT } from '../../utils/FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  STATE
} from '../../utils/consts/FrontEndStateConsts';
import {
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  LOAD_HEARINGS_FOR_DATE,
  LOAD_HEARING_NEIGHBORS,
  LOAD_JUDGES,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate,
  loadHearingNeighbors,
  loadJudges
} from './CourtActionFactory';

const {
  BONDS,
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  HEARINGS,
  JUDGES,
  MANUAL_REMINDERS,
  OUTCOMES,
  PEOPLE,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  SUBSCRIPTION,
  STAFF
} = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

const LIST_APP_TYPES = [CHECKIN_APPOINTMENTS, CONTACT_INFORMATION, HEARINGS, RELEASE_CONDITIONS, STAFF];

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

function* filterPeopleIdsWithOpenPSAsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(filterPeopleIdsWithOpenPSAs.request(action.id));
    const {
      personIds,
      hearingDateTime,
      personIdsToHearingIds
    } = action.value;
    let { scoresAsMap, hearingNeighborsById } = action.value;
    if (!scoresAsMap) {
      scoresAsMap = Map();
    }

    const hearingDateTimeMoment = toISODate(moment(hearingDateTime));
    let filteredPersonIds = Set();
    let openPSAIds = Set();
    let personIdsToOpenPSAIds = Map();
    let personIdsWhoAreSubscribed = Set();
    let peopleWithMultiplePSAs = Set();

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
    if (personIds.size) {
      let peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
        entityKeyIds: personIds.toJS(),
        sourceEntitySetIds: [psaEntitySetId, contactInformationEntitySetId],
        destinationEntitySetIds: [hearingsEntitySetId, subscriptionEntitySetId, contactInformationEntitySetId]
      });
      peopleNeighborsById = fromJS(peopleNeighborsById);
      peopleNeighborsById.entrySeq().forEach(([id, neighbors]) => {

        let hasValidHearing = false;
        let hasActiveSubscription = false;
        let hasPreferredContact = false;
        let mostCurrentPSA;
        let currentPSADateTime;
        let mostCurrentPSAEntityKeyId;
        let psaCount = 0;
        neighbors.forEach((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
          const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
          const entityDateTime = moment(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0]));

          if (entitySetId === hearingsEntitySetId) {
            const hearingDate = toISODate(moment(entityDateTime));
            const hearingDateIsValid = hearingDate === hearingDateTimeMoment;
            if (hearingDateIsValid) {
              hasValidHearing = true;
            }
          }
          if (entitySetId === subscriptionEntitySetId) {
            const subscriptionIsActive = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_ACTIVE, 0], false);
            if (subscriptionIsActive) {
              hasActiveSubscription = true;
            }
          }
          if (entitySetId === contactInformationEntitySetId) {
            const contactIsPreferred = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false);
            if (contactIsPreferred) {
              hasPreferredContact = true;
            }
          }
          else if (entitySetId === psaEntitySetId
              && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
            if (!mostCurrentPSA || currentPSADateTime.isBefore(entityDateTime)) {
              mostCurrentPSA = neighbor;
              mostCurrentPSAEntityKeyId = entityKeyId;
              currentPSADateTime = entityDateTime;
            }
            psaCount += 1;
            openPSAIds = openPSAIds.add(entityKeyId);
          }
        });
        if (hasActiveSubscription && hasPreferredContact) {
          personIdsWhoAreSubscribed = personIdsWhoAreSubscribed.add(id);
        }

        if (psaCount > 1) peopleWithMultiplePSAs = peopleWithMultiplePSAs.add(id);

        if (hasValidHearing && mostCurrentPSAEntityKeyId) {
          const hearingId = personIdsToHearingIds.get(id);
          scoresAsMap = scoresAsMap.set(
            mostCurrentPSAEntityKeyId,
            mostCurrentPSA.get(PSA_NEIGHBOR.DETAILS)
          );
          if (hearingId) {
            hearingNeighborsById = hearingNeighborsById.setIn(
              [hearingId, PSA_SCORES],
              mostCurrentPSA
            );
          }
          filteredPersonIds = filteredPersonIds.add(id);
          personIdsToOpenPSAIds = personIdsToOpenPSAIds.set(id, mostCurrentPSAEntityKeyId);
        }
      });
    }
    let psaIdToMostRecentEditDate = Map();
    let psaNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, psaEntitySetId, {
      entityKeyIds: openPSAIds.toJS(),
      sourceEntitySetIds: [peopleEntitySetId],
      destinationEntitySetIds: [staffEntitySetId]
    });
    psaNeighborsById = fromJS(psaNeighborsById);
    psaNeighborsById.entrySeq().forEach(([id, neighbors]) => {
      let mostRecentEditDate;
      let mostRecentNeighbor;

      const psaCreationDate = scoresAsMap.get([id, PROPERTY_TYPES.DATE_TIME, 0], '');
      neighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, JUDGES);
        if (appTypeFqn === STAFF) {
          const neighborObj = neighbor.get(PSA_ASSOCIATION.DETAILS, Map());
          const editDate = neighborObj.getIn(
            [PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
            neighborObj.getIn([PROPERTY_TYPES.DATE_TIME], '')
          );
          const isMostRecent = mostRecentEditDate
            ? moment(mostRecentEditDate).isBefore(editDate)
            : true;
          if (isMostRecent) {
            mostRecentEditDate = editDate;
            mostRecentNeighbor = neighbor;
          }
        }
      });
      psaIdToMostRecentEditDate = psaIdToMostRecentEditDate.set(
        id,
        mostRecentNeighbor.set(PROPERTY_TYPES.DATE_TIME, psaCreationDate)
      );
    });
    yield put(filterPeopleIdsWithOpenPSAs.success(action.id, {
      filteredPersonIds,
      scoresAsMap,
      personIdsToOpenPSAIds,
      personIdsWhoAreSubscribed,
      openPSAIds,
      hearingNeighborsById,
      peopleWithMultiplePSAs,
      psaIdToMostRecentEditDate
    }));
  }
  catch (error) {
    console.error(error);
    yield put(filterPeopleIdsWithOpenPSAs.failure(action.id, error));
  }
  finally {
    yield put(filterPeopleIdsWithOpenPSAs.finally(action.id));
  }
}

function* filterPeopleIdsWithOpenPSAsWatcher() :Generator<*, *, *> {
  yield takeEvery(FILTER_PEOPLE_IDS_WITH_OPEN_PSAS, filterPeopleIdsWithOpenPSAsWorker);
}

function* loadHearingsForDateWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadHearingsForDate.request(action.id));

    let courtrooms = Set();
    let hearingIds = Set();
    let hearingsByTime = Map();

    const DATE_TIME_FQN = new FullyQualifiedName(PROPERTY_TYPES.DATE_TIME);

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const hearingEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const datePropertyTypeId = getPropertyTypeId(edm, DATE_TIME_FQN);

    const hearingOptions = {
      searchTerm: getSearchTerm(datePropertyTypeId, toISODate(action.value)),
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    const allHearingData = yield call(SearchApi.searchEntitySetData, hearingEntitySetId, hearingOptions);
    const hearingsToday = fromJS(allHearingData.hits);
    if (hearingsToday.size) {
      hearingsToday.forEach((hearing) => {
        const hearingDateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]);
        const hearingExists = !!hearingDateTime;
        const hearingOnDateSelected = toISODate(moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0])))
          === toISODate(action.value);
        const hearingType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0]);
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        const hearingIsInactive = hearingIsCancelled(hearing);
        if (hearingType
          && hearingExists
          && hearingOnDateSelected
          && !hearingIsInactive
        ) hearingIds = hearingIds.add(hearingId);
      });
    }

    hearingsToday.filter((hearing) => {
      const hearingHasValidDateTime = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')).isValid();
      const hearingIsInactive = hearingIsCancelled(hearing);
      if (!hearingHasValidDateTime || hearingIsInactive) return false;
      return true;
    })
      .forEach((hearing) => {
        const hearingDateTime = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
        if (hearingDateTime.isValid()) {
          const time = hearingDateTime.format(TIME_FORMAT);
          hearingsByTime = hearingsByTime.set(
            time,
            hearingsByTime.get(time, List()).push(hearing)
          );
        }
        const courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
        if (courtroom) courtrooms = courtrooms.add(courtroom);
      });

    hearingIds = hearingIds.toJS();
    const hearingDateTime = action.value;
    const hearingNeighbors = loadHearingNeighbors({ hearingIds, hearingDateTime });

    yield put(loadHearingsForDate.success(action.id, { hearingsToday, hearingsByTime, courtrooms }));
    yield put(hearingNeighbors);
  }
  catch (error) {
    console.error(error);
    yield put(loadHearingsForDate.failure(action.id, { error }));
  }
  finally {
    yield put(loadHearingsForDate.finally(action.id));
  }
}

function* loadHearingsForDateWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARINGS_FOR_DATE, loadHearingsForDateWorker);
}

function* loadHearingNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadHearingNeighbors.request(action.id));

    const { hearingIds, hearingDateTime } = action.value;

    let hearingNeighborsById = Map();
    let personIdsToHearingIds = Map();
    let personIds = Set();
    let scoresAsMap = Map();

    if (hearingIds.length) {
      const app = yield select(getApp);
      const orgId = yield select(getOrgId);
      const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);

      /*
       * Get Entity Set Ids
       */
      const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
      const checkInAppointmentsEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
      const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
      const judgesEntitySetId = getEntitySetIdFromApp(app, JUDGES);
      const manualRemindersEntitySetId = getEntitySetIdFromApp(app, MANUAL_REMINDERS);
      const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
      const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
      const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
      const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
      let neighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, hearingsEntitySetId, {
        entityKeyIds: hearingIds,
        sourceEntitySetIds: [
          bondsEntitySetId,
          checkInAppointmentsEntitySetId,
          manualRemindersEntitySetId,
          outcomesEntitySetId,
          peopleEntitySetId,
          psaEntitySetId,
          releaseConditionsEntitySetId
        ],
        destinationEntitySetIds: [judgesEntitySetId]
      });
      neighborsById = fromJS(neighborsById);
      neighborsById.entrySeq().forEach(([hearingId, neighbors]) => {
        if (neighbors) {
          let hasPerson = false;
          let hasPSA = false;
          let personId;
          let hearingNeighborsMap = Map();
          neighbors.forEach(((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
            const entitySetName = entitySetIdsToAppType.get(entitySetId, JUDGES);
            const entityKeyId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
            if (entitySetId === peopleEntitySetId) {
              hasPerson = true;
              personId = entityKeyId;
              personIds = personIds.add(personId);
            }
            if (entitySetId === psaEntitySetId
                && neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0]) === PSA_STATUSES.OPEN) {
              hasPSA = true;
              scoresAsMap = scoresAsMap.set(
                entityKeyId,
                fromJS(neighbor.get(PSA_NEIGHBOR.DETAILS))
              );
            }
            hearingNeighborsMap = hearingNeighborsMap.set(
              entitySetName,
              fromJS(neighbor)
            );
          }));
          if (hasPerson && !hasPSA) {
            personIdsToHearingIds = personIdsToHearingIds.set(
              personId,
              hearingId
            );
          }
          hearingNeighborsById = hearingNeighborsById.set(hearingId, hearingNeighborsMap);
        }
      });
    }
    yield put(loadHearingNeighbors.success(action.id, { hearingNeighborsById, hearingDateTime }));

    if (hearingDateTime) {
      const peopleIdsWithOpenPSAs = filterPeopleIdsWithOpenPSAs({
        personIds,
        hearingDateTime,
        scoresAsMap,
        personIdsToHearingIds,
        hearingNeighborsById
      });
      yield put(peopleIdsWithOpenPSAs);
    }

  }
  catch (error) {
    console.error(error);
    yield put(loadHearingNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadHearingNeighbors.finally(action.id));
  }
}

function* loadHearingNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_HEARING_NEIGHBORS, loadHearingNeighborsWorker);
}

function* loadJudgesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadJudges.request(action.id));
    const app = yield select(getApp);
    const judgesEntitySetId = getEntitySetIdFromApp(app, JUDGES);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: MAX_HITS
    };

    const allJudgeData = yield call(SearchApi.searchEntitySetData, judgesEntitySetId, options);
    const allJudges = fromJS(allJudgeData.hits);
    yield put(loadJudges.success(action.id, { allJudges }));
  }
  catch (error) {
    console.error(error);
    yield put(loadJudges.failure(action.id, error));
  }
  finally {
    yield put(loadJudges.finally(action.id));
  }
}

function* loadJudgesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_JUDGES, loadJudgesWorker);
}

export {
  filterPeopleIdsWithOpenPSAsWatcher,
  loadHearingsForDateWatcher,
  loadHearingNeighborsWatcher,
  loadJudgesWatcher
};
