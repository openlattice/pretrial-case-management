/*
 * @flow
 */
import randomUUID from 'uuid/v4';
import { DateTime } from 'luxon';
import { fromJS, Map, List } from 'immutable';
import { SearchApi, Types } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { createIdObject } from '../../utils/DataUtils';
import { getPropertyIdToValueMap } from '../../edm/edmUtils';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import {
  LOAD_SUBSCRIPTION_MODAL,
  SUBSCRIBE,
  UNSUBSCRIBE,
  loadSubcriptionModal,
  subscribe,
  unsubscribe
} from './SubscriptionActions';

const { UpdateTypes } = Types;

const { createEntityAndAssociationData, getEntityData, updateEntityData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntityDataWorker, updateEntityDataWorker } = DataApiSagas;

const {
  COMPLETED_DATE_TIME,
  DAY_INTERVAL,
  IS_ACTIVE,
  SUBSCRIPTION_ID,
  WEEK_INTERVAL,
} = PROPERTY_TYPES;

const {
  CONTACT_INFORMATION,
  PEOPLE,
  REGISTERED_FOR,
  SUBSCRIPTION
} = APP_TYPES;

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

function* loadSubcriptionModalWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadSubcriptionModal.request(action.id));
    const { personEntityKeyId } = action.value;
    let personNeighbors = Map();

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);

    const personNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
      sourceEntitySetIds: [contactInformationEntitySetId],
      destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId]
    });

    const neighbors = fromJS(Object.values(personNeighborsById));

    neighbors.get(0, List()).forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === SUBSCRIPTION) {
        personNeighbors = personNeighbors.set(SUBSCRIPTION, neighbor.get(PSA_NEIGHBOR.DETAILS, Map()));
      }
      if (appTypeFqn === CONTACT_INFORMATION) {
        personNeighbors = personNeighbors.set(
          CONTACT_INFORMATION,
          personNeighbors.get(CONTACT_INFORMATION, List()).push(neighbor)
        );
      }
    });

    yield put(loadSubcriptionModal.success(action.id, { personEntityKeyId, personNeighbors }));
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

function* subscribeWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(subscribe.request(action.id));
    const { personEKID } = action.value;
    let { subscriptionEKID } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const subscriptionESID = getEntitySetIdFromApp(app, SUBSCRIPTION);

    if (subscriptionEKID) {
      const newSubscriptionEntity = { [IS_ACTIVE]: [true] };
      const subscriptionSubmitEntity = getPropertyIdToValueMap(newSubscriptionEntity, edm);
      const updateResponse = yield call(
        updateEntityDataWorker,
        updateEntityData({
          entitySetId: subscriptionESID,
          entities: { [subscriptionEKID]: subscriptionSubmitEntity },
          updateType: UpdateTypes.PartialReplace
        })
      );
      if (updateResponse.error) throw updateResponse.error;
    }
    else {
      /*
       * Assemble New Subscription Entity
       */
      const newSubscriptionEntity = {
        [SUBSCRIPTION_ID]: [randomUUID()],
        [IS_ACTIVE]: [true],
        [DAY_INTERVAL]: [true],
        [WEEK_INTERVAL]: [true]
      };
      const subscriptionSubmitEntity = getPropertyIdToValueMap(newSubscriptionEntity, edm);
      const entities = { [subscriptionESID]: [subscriptionSubmitEntity] };
      /*
       * Assemble Assoociations
       */
      const associationDataObject = { [COMPLETED_DATE_TIME]: [DateTime.local().toISO()] };
      const data = getPropertyIdToValueMap(associationDataObject, edm);
      const associations = {
        [registeredForESID]: [{
          data,
          dstEntityIndex: 0,
          dstEntitySetId: subscriptionESID,
          srcEntityKeyId: personEKID,
          srcEntitySetId: peopleESID
        }]
      };
      /*
       * Submit data and collect response
       */
      const subscriptionSubmitResponse = yield call(
        createEntityAndAssociationDataWorker,
        createEntityAndAssociationData({ associations, entities })
      );
      if (subscriptionSubmitResponse.error) throw subscriptionSubmitResponse.error;
      const entityKeyIds = fromJS(subscriptionSubmitResponse.data.entityKeyIds);

      subscriptionEKID = entityKeyIds.getIn([subscriptionESID, 0], '');
    }

    /*
    * Collect Subscription Entity
    */
    const subscriptionObject = createIdObject(subscriptionEKID, subscriptionESID);
    const subscriptionResponse = yield call(
      getEntityDataWorker,
      getEntityData(subscriptionObject)
    );
    if (subscriptionResponse.error) throw subscriptionResponse.error;
    const subscription = fromJS(subscriptionResponse.data);

    yield put(subscribe.success(action.id, {
      personEKID,
      subscriptionEKID,
      subscription
    }));
  }

  catch (error) {
    console.error(error);
    yield put(subscribe.failure(action.id, { error }));
  }
  finally {
    yield put(subscribe.finally(action.id));
  }
}

function* subscribeWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBSCRIBE, subscribeWorker);
}

function* unsubscribeWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(unsubscribe.request(action.id));
    const { subscriptionEKID } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const subscriptionESID = getEntitySetIdFromApp(app, SUBSCRIPTION);

    const newSubscriptionEntity = { [IS_ACTIVE]: [false] };
    const subscriptionSubmitEntity = getPropertyIdToValueMap(newSubscriptionEntity, edm);
    const updateResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: subscriptionESID,
        entities: { [subscriptionEKID]: subscriptionSubmitEntity },
        updateType: UpdateTypes.PartialReplace
      })
    );
    if (updateResponse.error) throw updateResponse.error;

    /*
    * Collect Subscription Entity
    */
    const subscriptionObject = createIdObject(subscriptionEKID, subscriptionESID);
    const subscriptionResponse = yield call(
      getEntityDataWorker,
      getEntityData(subscriptionObject)
    );
    if (subscriptionResponse.error) throw subscriptionResponse.error;
    const subscription = fromJS(subscriptionResponse.data);

    yield put(unsubscribe.success(action.id, {
      subscriptionEKID,
      subscription
    }));
  }

  catch (error) {
    console.error(error);
    yield put(unsubscribe.failure(action.id, { error }));
  }
  finally {
    yield put(unsubscribe.finally(action.id));
  }
}

function* unsubscribeWatcher() :Generator<*, *, *> {
  yield takeEvery(UNSUBSCRIBE, unsubscribeWorker);
}


export {
  loadSubcriptionModalWatcher,
  subscribeWatcher,
  unsubscribeWatcher
};
