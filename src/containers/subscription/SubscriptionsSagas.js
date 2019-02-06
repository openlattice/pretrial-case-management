/*
 * @flow
 */
import { fromJS, Map, List } from 'immutable';
import { SearchApi } from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from 'redux-saga/effects';

import { getEntitySetId } from '../../utils/AppUtils';
import { APP, PSA_NEIGHBOR, STATE } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';

import { LOAD_SUBSCRIPTION_MODAL, loadSubcriptionModal } from './SubscriptionsActionFactory';

let {
  CONTACT_INFORMATION,
  PEOPLE,
  SUBSCRIPTION
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
PEOPLE = PEOPLE.toString();
SUBSCRIPTION = SUBSCRIPTION.toString();

const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

function* loadSubcriptionModalWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadSubcriptionModal.request(action.id));
    const { personId } = action.value;
    let personNeighbors = Map();

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetId(app, PEOPLE, orgId);
    const contactInformationEntityKeyId = getEntitySetId(app, CONTACT_INFORMATION, orgId);
    const subscriptionEntityKeyId = getEntitySetId(app, SUBSCRIPTION, orgId);

    const personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personId],
      sourceEntitySetIds: [],
      destinationEntitySetIds: [subscriptionEntityKeyId, contactInformationEntityKeyId]
    });

    fromJS(Object.values(personNeighborsById)[0]).forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === SUBSCRIPTION) {
        personNeighbors = personNeighbors.set(SUBSCRIPTION, neighbor);
      }
      if (appTypeFqn === CONTACT_INFORMATION) {
        personNeighbors = personNeighbors.set(
          CONTACT_INFORMATION,
          personNeighbors.get(CONTACT_INFORMATION, List()).push(neighbor)
        );
      }
    });

    yield put(loadSubcriptionModal.success(action.id, { personNeighbors }));
  }

  catch (error) {
    console.error(error);
    yield put(loadSubcriptionModal.failure(action.id, { error }));
  }
  finally {
    yield put(loadSubcriptionModal.finally(action.id));
  }
}

function* loadSubcriptionModalWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_SUBSCRIPTION_MODAL, loadSubcriptionModalWorker);
}


export {
  loadSubcriptionModalWatcher
};
