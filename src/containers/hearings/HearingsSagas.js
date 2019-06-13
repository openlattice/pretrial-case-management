/*
 * @flow
 */

import { Map, List, fromJS } from 'immutable';
import { DataApi, SearchApi } from 'lattice';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, PSA_NEIGHBOR, STATE } from '../../utils/consts/FrontEndStateConsts';

import {
  REFRESH_HEARING_AND_NEIGHBORS,
  refreshHearingAndNeighbors
} from './HearingsActionFactory';

const {
  CHECKIN_APPOINTMENTS,
  CHARGES,
  CONTACT_INFORMATION,
  HEARINGS,
  PRETRIAL_CASES,
  RELEASE_CONDITIONS,
  REMINDERS,
  STAFF
} = APP_TYPES;

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const LIST_ENTITY_SETS = List.of(
  CHECKIN_APPOINTMENTS,
  STAFF,
  RELEASE_CONDITIONS,
  HEARINGS,
  PRETRIAL_CASES,
  REMINDERS,
  CHARGES,
  CONTACT_INFORMATION
);

function* getHearingAndNeighbors(hearingEntityKeyId :string) :Generator<*, *, *> {
  let hearingNeighborsByAppTypeFqn = Map();
  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
  const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);

  /*
   * Get Hearing Info
   */

  let hearing = yield call(DataApi.getEntityData, hearingsEntitySetId, hearingEntityKeyId);
  hearing = fromJS(hearing);

  /*
   * Get Neighbors
   */

  let hearingNeighbors = yield call(SearchApi.searchEntityNeighbors, hearingsEntitySetId, hearingEntityKeyId);
  hearingNeighbors = fromJS(hearingNeighbors);
  /*
   * Format Neighbors
   */

  hearingNeighbors.forEach((neighbor) => {

    const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
    const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
    if (appTypeFqn) {

      if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
        hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn.set(
          appTypeFqn,
          hearingNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else {
        hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn.set(appTypeFqn, neighbor);
      }
    }
  });

  return { hearing, hearingNeighborsByAppTypeFqn };
}


function* refreshHearingAndNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { hearingEntityKeyId } = action.value; // Deconstruct action argument
  try {
    yield put(refreshHearingAndNeighbors.request(action.id));

    /*
     * Get Hearing and Hearing Neighbors
     */

    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEntityKeyId);

    yield put(refreshHearingAndNeighbors.success(action.id, {
      hearingEntityKeyId,
      hearing,
      hearingNeighborsByAppTypeFqn
    }));
  }

  catch (error) {
    console.error(error);
    yield put(refreshHearingAndNeighbors.failure(action.id, error));
  }
  finally {
    yield put(refreshHearingAndNeighbors.finally(action.id));
  }
}

function* refreshHearingAndNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(REFRESH_HEARING_AND_NEIGHBORS, refreshHearingAndNeighborsWorker);
}

export { refreshHearingAndNeighborsWatcher };
