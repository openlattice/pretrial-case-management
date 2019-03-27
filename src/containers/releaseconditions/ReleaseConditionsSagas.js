/*
 * @flow
 */

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


import releaseConditionsConfig from '../../config/formconfig/ReleaseConditionsConfig';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityKeyId, getMapFromEntityKeysToPropertyKeys } from '../../utils/DataUtils';
import { obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
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
  SUBSCRIPTION
} = APP_TYPES_FQNS;

const bondsFqn :string = BONDS.toString();
const chargesFqn :string = CHARGES.toString();
const contactInformationFqn :string = CONTACT_INFORMATION.toString();
const dmfResultsFqn :string = DMF_RESULTS.toString();
const dmfRiskFactorsFqn :string = DMF_RISK_FACTORS.toString();
const hearingsFqn :string = HEARINGS.toString();
const outcomesFqn :string = OUTCOMES.toString();
const peopleFqn :string = PEOPLE.toString();
const pretrialCasesFqn :string = PRETRIAL_CASES.toString();
const psaScoresFqn :string = PSA_SCORES.toString();
const releaseConditionsFqn :string = RELEASE_CONDITIONS.toString();
const remindersFqn :string = REMINDERS.toString();
const staffFqn :string = STAFF.toString();
const subscriptionFqn :string = SUBSCRIPTION.toString();

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const LIST_ENTITY_SETS = List.of(staffFqn, releaseConditionsFqn, hearingsFqn, pretrialCasesFqn, remindersFqn);

function* getHearingAndNeighbors(hearingId :string) :Generator<*, *, *> {
  let hearingNeighborsByAppTypeFqn = Map();
  const app = yield select(getApp);
  const orgId = yield select(getOrgId);
  const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
  const hearingsEntitySetId = getEntitySetIdFromApp(app, hearingsFqn);

  /*
   * Get Hearing Info
   */

  let hearing = yield call(DataApi.getEntityData, hearingsEntitySetId, hearingId);
  hearing = fromJS(hearing);

  /*
   * Get Neighbors
   */

  let hearingNeighbors = yield call(SearchApi.searchEntityNeighbors, hearingsEntitySetId, hearingId);
  hearingNeighbors = obfuscateEntityNeighbors(hearingNeighbors, app); // TODO just for demo
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
    const chargesEntitySetId = getEntitySetIdFromApp(app, chargesFqn);
    const dmfEntitySetId = getEntitySetIdFromApp(app, dmfResultsFqn);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, dmfRiskFactorsFqn);
    const peopleEntitySetId = getEntitySetIdFromApp(app, peopleFqn);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, subscriptionFqn);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, contactInformationFqn);
    const psaScoresEntityKeyId = getEntitySetIdFromApp(app, psaScoresFqn);

    /*
     * Get Hearing and Hearing Neighbors
     */

    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingId);

    /*
    * Get PSA Neighbors
    */

    const psaId = getEntityKeyId(hearingNeighborsByAppTypeFqn, psaScoresFqn);

    let psaNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, psaScoresEntityKeyId, {
      entityKeyIds: [psaId],
      sourceEntitySetIds: [dmfEntitySetId],
      destinationEntitySetIds: [dmfRiskFactorsEntitySetId]
    });

    psaNeighbors = fromJS(Object.values(psaNeighbors)[0] || []);
    let psaNeighborsByAppTypeFqn = Map();
    psaNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === dmfResultsFqn || appTypeFqn === dmfRiskFactorsFqn) {
        psaNeighborsByAppTypeFqn = psaNeighborsByAppTypeFqn.set(
          appTypeFqn,
          neighbor
        );
      }
    });

    /*
    * Get Person Neighbors
    */

    const personId = getEntityKeyId(hearingNeighborsByAppTypeFqn, peopleFqn);

    let personNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personId],
      sourceEntitySetIds: [contactInformationEntitySetId],
      destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId, chargesEntitySetId]
    });

    personNeighbors = fromJS(Object.values(personNeighbors)[0] || []);
    let personNeighborsByAppTypeFqn = Map();
    personNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');

      if (appTypeFqn === contactInformationFqn || appTypeFqn === chargesFqn) {
        personNeighborsByAppTypeFqn = personNeighborsByAppTypeFqn.set(
          appTypeFqn,
          personNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else if (appTypeFqn === subscriptionFqn) {
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
    const releaseConditionEntitySetId = getEntitySetIdFromApp(app, releaseConditionsFqn);
    const bondEntitySetId = getEntitySetIdFromApp(app, bondsFqn);
    const outcomeEntitySetId = getEntitySetIdFromApp(app, outcomesFqn);

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
        .setIn([bondsFqn, PSA_NEIGHBOR.DETAILS], fromJS(newBondEntity));
    }
    if (newOutcomeEntity) {
      hearingNeighborsByAppTypeFqn = hearingNeighborsByAppTypeFqn
        .setIn([outcomesFqn, PSA_NEIGHBOR.DETAILS], fromJS(newOutcomeEntity));
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
