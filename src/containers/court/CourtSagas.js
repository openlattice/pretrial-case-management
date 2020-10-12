/*
 * @flow
 */

import { DateTime } from 'luxon';
import { Constants } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { fromJS, Map, Set } from 'immutable';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import {
  FILTER_PEOPLE_IDS_WITH_OPEN_PSAS,
  filterPeopleIdsWithOpenPSAs,
} from './CourtActionFactory';

const LOG :Logger = new Logger('CourtSagas');

const {
  CONTACT_INFORMATION,
  HEARINGS,
  JUDGES,
  PEOPLE,
  PSA_SCORES,
  SUBSCRIPTION,
  STAFF
} = APP_TYPES;

const {
  DATE_TIME
} = PROPERTY_TYPES;

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { OPENLATTICE_ID_FQN } = Constants;

const getApp = (state) => state.get(STATE.APP, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

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

    let filteredPersonIds = Set();
    let openPSAIds = Set();
    let personIdsToOpenPSAIds = Map();
    let personIdsWhoAreSubscribed = Set();
    let peopleWithMultiplePSAs = Set();

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);
    if (personIds.size) {
      let peopleNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: peopleEntitySetId,
          filter: {
            entityKeyIds: personIds.toJS(),
            sourceEntitySetIds: [psaEntitySetId, contactInformationEntitySetId],
            destinationEntitySetIds: [hearingsEntitySetId, subscriptionEntitySetId, contactInformationEntitySetId]
          }
        })
      );
      if (peopleNeighborsById.error) throw peopleNeighborsById.error;
      peopleNeighborsById = fromJS(peopleNeighborsById.data);

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
          let { [DATE_TIME]: entityDateTime } = getEntityProperties(neighbor, [DATE_TIME]);
          entityDateTime = DateTime.fromISO(entityDateTime);

          if (entitySetId === hearingsEntitySetId) {
            const hearingDateIsSame = hearingDateTime.hasSame(entityDateTime, 'day');
            if (entityDateTime.isValid && hearingDateIsSame) {
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
            if (!mostCurrentPSA || currentPSADateTime < entityDateTime) {
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
    if (openPSAIds.size) {
      let psaNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: psaEntitySetId,
          filter: {
            entityKeyIds: openPSAIds.toJS(),
            sourceEntitySetIds: [peopleEntitySetId],
            destinationEntitySetIds: [staffEntitySetId]
          }
        })
      );
      if (psaNeighborsById.error) throw psaNeighborsById.error;
      psaNeighborsById = fromJS(psaNeighborsById.data);
      psaNeighborsById.entrySeq().forEach(([id, neighbors]) => {
        const psaCreationDate = scoresAsMap.getIn([id, PROPERTY_TYPES.DATE_TIME, 0], '');
        let mostRecentEditDate = psaCreationDate;
        let mostRecentNeighbor = Map();
        neighbors.forEach((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, JUDGES);
          if (appTypeFqn === STAFF) {
            const neighborObj = neighbor.get(PSA_ASSOCIATION.DETAILS, Map());
            const editDate = neighborObj.getIn(
              [PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
              neighborObj.getIn([PROPERTY_TYPES.DATE_TIME], '')
            );
            const editDateTime = DateTime.fromISO(editDate);
            const isMostRecent = mostRecentEditDate
              ? DateTime.fromISO(mostRecentEditDate) < editDateTime
              : true;
            if (isMostRecent) {
              mostRecentEditDate = editDate;
              mostRecentNeighbor = neighbor;
            }
          }
        });
        if (mostRecentEditDate) {
          psaIdToMostRecentEditDate = psaIdToMostRecentEditDate.set(
            id,
            mostRecentNeighbor.set(PROPERTY_TYPES.DATE_TIME, mostRecentEditDate)
          );
        }
      });
    }
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
    LOG.error(error);
    yield put(filterPeopleIdsWithOpenPSAs.failure(action.id, error));
  }
  finally {
    yield put(filterPeopleIdsWithOpenPSAs.finally(action.id));
  }
}

function* filterPeopleIdsWithOpenPSAsWatcher() :Generator<*, *, *> {
  yield takeEvery(FILTER_PEOPLE_IDS_WITH_OPEN_PSAS, filterPeopleIdsWithOpenPSAsWorker);
}
export {
  // eslint-disable-next-line import/prefer-default-export
  filterPeopleIdsWithOpenPSAsWatcher
};
