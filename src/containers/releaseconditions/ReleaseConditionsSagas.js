/*
 * @flow
 */

import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import {
  DataApi,
  EntityDataModelApi,
  Models,
  SearchApi,
  Types
} from 'lattice';
import {
  all,
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import releaseConditionsConfig from '../../config/formconfig/ReleaseConditionsConfig';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties, getEntityKeyId, getMapFromEntityKeysToPropertyKeys } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP, PSA_NEIGHBOR, STATE } from '../../utils/consts/FrontEndStateConsts';

import {
  LOAD_RELEASE_CONDTIONS,
  UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS,
  loadReleaseConditions,
  updateOutcomesAndReleaseCondtions
} from './ReleaseConditionsActionFactory';

const { FullyQualifiedName } = Models;
const { DeleteTypes } = Types;

const {
  BONDS,
  CHECKIN_APPOINTMENTS,
  CHARGES,
  CONTACT_INFORMATION,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  HEARINGS,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  REMINDERS,
  STAFF,
  SUBSCRIPTION,
  SPEAKER_RECOGNITION_PROFILES
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
          hearingNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighbor))
        );
      }
      else {
        hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn.set(appTypeFqn, fromJS(neighbor));
      }
    }
  });

  return { hearing, hearingNeighborsByAppTypeFqn };
}


function* loadReleaseConditionsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { hearingId } = action.value; // Deconstruct action argument
  try {
    yield put(loadReleaseConditions.request(action.id));

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const checkInAppointmentEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const chargesEntitySetId = getEntitySetIdFromApp(app, CHARGES);
    const dmfEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const voiceProfileEntitySetId = getEntitySetIdFromApp(app, SPEAKER_RECOGNITION_PROFILES);

    /*
     * Get Hearing and Hearing Neighbors
     */

    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingId);

    /*
    * Get PSA Neighbors
    */

    const psaId = getEntityKeyId(hearingNeighborsByAppTypeFqn, PSA_SCORES);

    let psaNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, psaScoresEntitySetId, {
      entityKeyIds: [psaId],
      sourceEntitySetIds: [dmfEntitySetId],
      destinationEntitySetIds: [dmfRiskFactorsEntitySetId]
    });

    psaNeighbors = fromJS(Object.values(psaNeighbors)[0] || []);
    let psaNeighborsByAppTypeFqn = Map();
    psaNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === DMF_RESULTS || appTypeFqn === DMF_RISK_FACTORS) {
        psaNeighborsByAppTypeFqn = psaNeighborsByAppTypeFqn.set(
          appTypeFqn,
          neighbor
        );
      }
    });

    /*
    * Get Person Neighbors
    */

    const personId = getEntityKeyId(hearingNeighborsByAppTypeFqn, PEOPLE);

    let personNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personId],
      sourceEntitySetIds: [contactInformationEntitySetId, checkInAppointmentEntitySetId, voiceProfileEntitySetId],
      destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId, chargesEntitySetId]
    });

    personNeighbors = fromJS(Object.values(personNeighbors)[0] || []);
    let personNeighborsByAppTypeFqn = Map();
    personNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === CHECKIN_APPOINTMENTS) {
        const { [PROPERTY_TYPES.END_DATE]: checkInEndDate } = getEntityProperties(neighbor, [PROPERTY_TYPES.END_DATE]);
        if (moment().isBefore(checkInEndDate)) {
          personNeighborsByAppTypeFqn = personNeighborsByAppTypeFqn.set(
            appTypeFqn,
            personNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
          );
        }
      }
      else if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
        personNeighborsByAppTypeFqn = personNeighborsByAppTypeFqn.set(
          appTypeFqn,
          personNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else {
        personNeighborsByAppTypeFqn = personNeighborsByAppTypeFqn.set(
          appTypeFqn,
          neighbor
        );
      }
    });

    yield put(loadReleaseConditions.success(action.id, {
      hearingId,
      hearing,
      hearingNeighborsByAppTypeFqn,
      personNeighborsByAppTypeFqn,
      psaNeighborsByAppTypeFqn
    }));
  }

  catch (error) {
    console.error(error);
    yield put(loadReleaseConditions.failure(action.id, error));
  }
  finally {
    yield put(loadReleaseConditions.finally(action.id));
  }
}

function* loadReleaseConditionsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_RELEASE_CONDTIONS, loadReleaseConditionsWorker);
}


function* updateOutcomesAndReleaseCondtionsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const {
      psaId,
      conditionSubmit,
      conditionEntityKeyIds,
      bondEntity,
      bondEntityKeyId,
      hearingEntityKeyId,
      outcomeEntity,
      outcomeEntityKeyId,
      callback,
      refreshHearingsNeighborsCallback
    } = action.value;

    const app = yield select(getApp);
    const releaseConditionEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const bondEntitySetId = getEntitySetIdFromApp(app, BONDS);
    const outcomeEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);

    const allEntitySetIds = { releaseConditionEntitySetId, bondEntitySetId, outcomeEntitySetId };

    const edmDetailsRequest = Object.values(allEntitySetIds).map(id => (
      {
        id,
        type: 'EntitySet',
        include: [
          'EntitySet',
          'EntityType',
          'PropertyTypeInEntitySet'
        ]
      }
    ));

    const updates = [];
    const updatedEntities = [];

    conditionEntityKeyIds.toJS().forEach((entityKeyId) => {
      updates.push(call(
        DataApi.deleteEntity,
        allEntitySetIds.releaseConditionEntitySetId,
        entityKeyId,
        DeleteTypes.Soft
      ));
    });

    const edmDetails = yield call(EntityDataModelApi.getEntityDataModelProjection, edmDetailsRequest);

    const propertyTypesByFqn = {};
    Object.values(edmDetails.propertyTypes).forEach((propertyType) => {
      const fqn = new FullyQualifiedName(propertyType.type).getFullyQualifiedName();
      propertyTypesByFqn[fqn] = propertyType;
    });

    if (bondEntityKeyId && fromJS(bondEntity).size) {
      const bondEntityOject = getMapFromEntityKeysToPropertyKeys(
        bondEntity,
        bondEntityKeyId,
        propertyTypesByFqn
      );
      updates.push(
        call(DataApi.updateEntityData,
          allEntitySetIds.bondEntitySetId,
          bondEntityOject.toJS(),
          'PartialReplace')
      );

      updatedEntities.push(call(DataApi.getEntityData, allEntitySetIds.bondEntitySetId, bondEntityKeyId));
    }

    if (outcomeEntityKeyId && fromJS(outcomeEntity).size) {
      const outcomeEntityOject = getMapFromEntityKeysToPropertyKeys(
        outcomeEntity,
        outcomeEntityKeyId,
        propertyTypesByFqn
      );
      updates.push(
        call(DataApi.updateEntityData,
          allEntitySetIds.outcomeEntitySetId,
          outcomeEntityOject.toJS(),
          'PartialReplace')
      );

      updatedEntities.push(call(DataApi.getEntityData, allEntitySetIds.outcomeEntitySetId, outcomeEntityKeyId));
    }

    yield all(updates);

    let newBondEntity;
    let newOutcomeEntity;
    if (bondEntityKeyId && outcomeEntityKeyId) {
      [newBondEntity, newOutcomeEntity] = yield all(updatedEntities);
    }
    else if (bondEntityKeyId && !outcomeEntityKeyId) {
      newBondEntity = yield all(updatedEntities);
    }
    else if (!bondEntityKeyId && outcomeEntityKeyId) {
      newOutcomeEntity = yield all(updatedEntities);
    }

    const submitValues = {
      app,
      config: releaseConditionsConfig,
      values: conditionSubmit,
      callback: refreshHearingsNeighborsCallback
    };

    yield call(callback, submitValues);

    let { hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEntityKeyId);

    if (newBondEntity) {
      hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn
        .setIn([BONDS, PSA_NEIGHBOR.DETAILS], fromJS(newBondEntity));
    }
    if (newOutcomeEntity) {
      hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn
        .setIn([OUTCOMES, PSA_NEIGHBOR.DETAILS], fromJS(newOutcomeEntity));
    }

    yield put(updateOutcomesAndReleaseCondtions.success(action.id, {
      psaId,
      edmDetails,
      hearingNeighborsByAppTypeFqn,
      newBondEntity,
      newOutcomeEntity
    }));
  }
  catch (error) {
    console.error(error);
    yield put(updateOutcomesAndReleaseCondtions.failure(action.id, { error }));
  }
  finally {
    yield put(updateOutcomesAndReleaseCondtions.finally(action.id));
  }
}

function* updateOutcomesAndReleaseCondtionsWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS, updateOutcomesAndReleaseCondtionsWorker);
}

export {
  loadReleaseConditionsWatcher,
  updateOutcomesAndReleaseCondtionsWatcher
};
