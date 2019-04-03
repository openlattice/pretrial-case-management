/*
 * @flow
 */

import moment from 'moment';
import { fromJS, Map, List } from 'immutable';
import { SearchApi } from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { hearingNeedsReminder } from '../../utils/RemindersUtils';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { LOAD_CHECK_INS_FORM, loadCheckInsForm } from './CheckInsActionFactory';
import {
  APP,
  CHECK_IN,
  PSA_NEIGHBOR,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

const { HEARINGS, PEOPLE } = APP_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

function* loadCheckInsFormWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadCheckInsForm.request(action.id));
    const { personEntityKeyId } = action.value;

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);

    let personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
      sourceEntitySetIds: [],
      destinationEntitySetIds: [hearingsEntitySetId]
    });
    personNeighborsById = fromJS(personNeighborsById);
    let formNeighbors = Map();
    personNeighborsById.entrySeq().forEach(([_, neighbors]) => {
      if (neighbors) {
        neighbors.forEach((neighbor) => {
          const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
          const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
          if (appTypeFqn === HEARINGS) {
            if (hearingNeedsReminder(neighborObj)) {
              formNeighbors = formNeighbors.set(
                appTypeFqn,
                formNeighbors.get(appTypeFqn, List()).push(fromJS(neighborObj))
              );
            }
          }
        });
      }
    });


    yield put(loadCheckInsForm.success(action.id, {
      formNeighbors
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadCheckInsForm.failure(action.id, { error }));
  }
  finally {
    yield put(loadCheckInsForm.finally(action.id));
  }
}

function* loadCheckInsFormWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CHECK_INS_FORM, loadCheckInsFormWorker);
}

export {
  loadCheckInsFormWatcher
};
