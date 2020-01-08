/*
 * @flow
 */

import { DateTime } from 'luxon';
import { fromJS, List, Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import { Types } from 'lattice';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { createIdObject } from '../../utils/DataUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  SUBMIT_CONTACT,
  UPDATE_CONTACT,
  UPDATE_CONTACTS_BULK,
  submitContact,
  updateContact,
  updateContactsBulk
} from './ContactInfoActions';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const { UpdateTypes } = Types;

const { createEntityAndAssociationData, getEntityData, updateEntityData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntityDataWorker, updateEntityDataWorker } = DataApiSagas;

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;


const { CONTACT_INFO_GIVEN, CONTACT_INFORMATION, PEOPLE } = APP_TYPES;
const { ID } = PROPERTY_TYPES;


/*
 * Selectors
 */
const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

function* submitContactWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitContact.request(action.id));
    const { contactEntity, personEKID } = action.value;

    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const olIDPTID = getPropertyTypeId(edm, ID);

    /*
     * Get Submission Entity
     */
    const contactSubmission = getPropertyIdToValueMap(contactEntity, edm);

    /*
     * Get Entity Set Ids
     */

    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const contactInfoGivenForESID = getEntitySetIdFromApp(app, CONTACT_INFO_GIVEN);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    /*
     * Assemble Assoociation to Person
     */

    const data = { [olIDPTID]: [DateTime.local().toISO()] };
    const associations = {
      [contactInfoGivenForESID]: [{
        data,
        srcEntityIndex: 0,
        srcEntitySetId: contactInfoESID,
        dstEntityKeyId: personEKID,
        dstEntitySetId: peopleESID
      }]
    };

    /*
     * Assemble contact info entity for submission
     */
    const entities = { [contactInfoESID]: [contactSubmission] };

    /*
     * Submit data and collect response
     */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;

    const entityKeyIds = fromJS(response.data.entityKeyIds);

    const contactInfoEKID = entityKeyIds.getIn([contactInfoESID, 0], '');

    /*
    * Get contact info
    */

    const contactInfoIdObject = createIdObject(contactInfoEKID, contactInfoESID);
    const contactInfoResponse = yield call(
      getEntityDataWorker,
      getEntityData(contactInfoIdObject)
    );
    if (contactInfoResponse.error) throw contactInfoResponse.error;
    const contactInfo = fromJS(contactInfoResponse.data);

    yield put(submitContact.success(action.id, {
      contactInfo,
      contactInfoEKID,
      personEKID
    }));
  }

  catch (error) {
    console.error(error);
    yield put(submitContact.failure(action.id, error));
  }
  finally {
    yield put(submitContact.finally(action.id));
  }
}

function* submitContactWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_CONTACT, submitContactWorker);
}

function* updateContactWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateContact.request(action.id));
    const {
      contactEntity,
      contactInfoEKID,
      personEKID
    } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);

    /*
     * Get Entity Set Ids
     */
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    /*
     * Get Submission Entity
     */
    const contactSubmission = getPropertyIdToValueMap(contactEntity, edm);

    /*
     * Update Contact Data
     */

    const updateResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: contactInfoESID,
        entities: { [contactInfoEKID]: contactSubmission },
        updateType: UpdateTypes.PartialReplace
      })
    );
    if (updateResponse.error) throw updateResponse.error;

    /*
     * Get updated contact
     */
    const contactInfoIdObject = createIdObject(contactInfoEKID, contactInfoESID);
    const contactInfoResponse = yield call(
      getEntityDataWorker,
      getEntityData(contactInfoIdObject)
    );
    if (contactInfoResponse.error) throw contactInfoResponse.error;
    const contactInfo = fromJS(contactInfoResponse.data);

    yield put(updateContact.success(action.id, {
      contactInfo,
      contactInfoEKID,
      personEKID
    }));
  }

  catch (error) {
    console.error(error);
    yield put(updateContact.failure(action.id, error));
  }
  finally {
    yield put(updateContact.finally(action.id));
  }
}

function* updateContactWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CONTACT, updateContactWorker);
}

function* updateContactsBulkWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { entities, personEKID } = action.value;

    yield put(updateContactsBulk.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    /* partially update contact info */
    const updateContactsResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: contactInfoESID,
        entities,
        updateType: UpdateTypes.PartialReplace
      })
    );
    if (updateContactsResponse.error) throw updateContactsResponse.error;

    /* get updated contact info for person */
    let peopleNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleESID,
        filter: {
          entityKeyIds: [personEKID],
          sourceEntitySetIds: [contactInfoESID],
          destinationEntitySetIds: [contactInfoESID]
        }
      })
    );
    if (peopleNeighborsById.error) throw peopleNeighborsById.error;
    peopleNeighborsById = fromJS(peopleNeighborsById.data);
    peopleNeighborsById = peopleNeighborsById.get(personEKID, List());

    /* filter neighbors for contact info */
    const contactInformation = peopleNeighborsById.filter((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      const isContactInfo = appTypeFqn === CONTACT_INFORMATION;
      return isContactInfo;
    });

    yield put(updateContactsBulk.success(action.id, { personEKID, contactInformation }));
  }
  catch (error) {
    yield put(updateContactsBulk.failure(action.id, { error }));
  }
  finally {
    yield put(updateContactsBulk.finally(action.id));
  }
}

function* updateContactsBulkWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_CONTACTS_BULK, updateContactsBulkWorker);
}

export {
  submitContactWatcher,
  updateContactWatcher,
  updateContactsBulkWatcher
};
