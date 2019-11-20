/*
 * @flow
 */

import { DateTime } from 'luxon';
import { Map, List, fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';
import { Types } from 'lattice';
import randomUUID from 'uuid/v4';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  all,
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId, getPropertyIdToValueMap } from '../../edm/edmUtils';
import { createIdObject, getEntityProperties, getEntityKeyId } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  LOAD_RELEASE_CONDTIONS,
  SUBMIT_RELEASE_CONDTIONS,
  UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS,
  loadReleaseConditions,
  submitReleaseConditions,
  updateOutcomesAndReleaseCondtions
} from './ReleaseConditionsActionFactory';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const {
  createEntityAndAssociationData,
  deleteEntity,
  getEntityData,
  updateEntityData
} = DataApiActions;
const {
  createEntityAndAssociationDataWorker,
  deleteEntityWorker,
  getEntityDataWorker,
  updateEntityDataWorker
} = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { DeleteTypes, UpdateTypes } = Types;

const {
  BONDS,
  CHECKIN_APPOINTMENTS,
  CHARGES,
  CONTACT_INFORMATION,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  HEARINGS,
  JUDGES,
  MANUAL_REMINDERS,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  REGISTERED_FOR,
  RELEASE_CONDITIONS,
  REMINDERS,
  STAFF,
  SUBSCRIPTION,
  SPEAKER_RECOGNITION_PROFILES
} = APP_TYPES;


const {
  BOND_AMOUNT,
  BOND_TYPE,
  COMPLETED_DATE_TIME,
  FREQUENCY,
  GENERAL_ID,
  JUDGE_ACCEPTED,
  OTHER_TEXT,
  OUTCOME,
  PERSON_NAME,
  PERSON_TYPE,
  PLAN_TYPE,
  RELEASE_TYPE,
  START_DATE,
  TYPE
} = PROPERTY_TYPES;

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

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
  let hearing = Map();
  let hearingNeighborsByAppTypeFqn = Map();

  if (hearingEntityKeyId) {
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
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

    /*
    * Get Hearing Info
    */

    const hearingIdObject = createIdObject(hearingEntityKeyId, hearingsEntitySetId);
    const hearingResponse = yield call(
      getEntityDataWorker,
      getEntityData(hearingIdObject)
    );
    if (hearingResponse.error) throw hearingResponse.error;
    hearing = fromJS(hearingResponse.data);

    /*
    * Get Neighbors
    */

    let hearingNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: hearingsEntitySetId,
        filter: {
          entityKeyIds: [hearingEntityKeyId],
          sourceEntitySetIds: [
            bondsEntitySetId,
            checkInAppointmentsEntitySetId,
            judgesEntitySetId,
            manualRemindersEntitySetId,
            outcomesEntitySetId,
            peopleEntitySetId,
            psaEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [judgesEntitySetId]
        }
      })
    );
    if (hearingNeighborsById.error) throw hearingNeighborsById.error;
    hearingNeighborsById = fromJS(hearingNeighborsById.data);
    const hearingNeighbors = hearingNeighborsById.get(hearingEntityKeyId, List());

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
  }

  return { hearing, hearingNeighborsByAppTypeFqn };
}


function* loadReleaseConditionsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { hearingId } = action.value; // Deconstruct action argument
  try {
    yield put(loadReleaseConditions.request(action.id));
    let psaNeighborsByAppTypeFqn = Map();

    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
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
    if (psaId) {
      let psaNeighborsById = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: psaScoresEntitySetId,
          filter: {
            entityKeyIds: [psaId],
            sourceEntitySetIds: [dmfEntitySetId],
            destinationEntitySetIds: [dmfRiskFactorsEntitySetId]
          }
        })
      );
      if (psaNeighborsById.error) throw psaNeighborsById.error;
      psaNeighborsById = fromJS(psaNeighborsById.data);
      const psaNeighbors = psaNeighborsById.get(psaId, List());
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
    }

    /*
    * Get Person Neighbors
    */

    const personId = getEntityKeyId(hearingNeighborsByAppTypeFqn, PEOPLE);

    let personNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: [personId],
          sourceEntitySetIds: [
            psaScoresEntitySetId,
            contactInformationEntitySetId,
            checkInAppointmentEntitySetId,
            voiceProfileEntitySetId
          ],
          destinationEntitySetIds: [
            psaScoresEntitySetId,
            subscriptionEntitySetId,
            contactInformationEntitySetId,
            chargesEntitySetId
          ]
        }
      })
    );
    if (personNeighborsById.error) throw personNeighborsById.error;
    personNeighborsById = fromJS(personNeighborsById.data);
    const personNeighbors = personNeighborsById.get(personId, List());

    let personNeighborsByAppTypeFqn = Map();
    personNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === CHECKIN_APPOINTMENTS) {
        const { [PROPERTY_TYPES.END_DATE]: checkInEndDate } = getEntityProperties(neighbor, [PROPERTY_TYPES.END_DATE]);
        if (DateTime.local() < DateTime.fromISO(checkInEndDate)) {
          personNeighborsByAppTypeFqn = personNeighborsByAppTypeFqn.set(
            appTypeFqn,
            personNeighborsByAppTypeFqn.get(appTypeFqn, List()).push(neighbor)
          );
        }
      }
      else if (LIST_ENTITY_SETS.includes(appTypeFqn) || appTypeFqn === PSA_SCORES) {
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

function* submitReleaseConditionsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitReleaseConditions.request(action.id));
    const {
      bondAmount,
      bondType,
      dmfResultsEKID,
      hearingEKID,
      judgeAccepted,
      outcomeSelection,
      outcomeText,
      personEKID,
      psaScoresEKID,
      releaseConditions,
      releaseType
    } = action.value;

    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const bondAmountPTID = getPropertyTypeId(edm, BOND_AMOUNT);
    const bondTypePTID = getPropertyTypeId(edm, BOND_TYPE);
    const completedDateTimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const frequencyPTID = getPropertyTypeId(edm, FREQUENCY);
    const generalIdPTID = getPropertyTypeId(edm, GENERAL_ID);
    const judgeAcceptedPTID = getPropertyTypeId(edm, JUDGE_ACCEPTED);
    const otherTextPTID = getPropertyTypeId(edm, OTHER_TEXT);
    const outcomePTID = getPropertyTypeId(edm, OUTCOME);
    const personNamePTID = getPropertyTypeId(edm, PERSON_NAME);
    const personTypePTID = getPropertyTypeId(edm, PERSON_TYPE);
    const planTypePTID = getPropertyTypeId(edm, PLAN_TYPE);
    const releaseTypePTID = getPropertyTypeId(edm, RELEASE_TYPE);
    const startDatePTID = getPropertyTypeId(edm, START_DATE);
    const typePTID = getPropertyTypeId(edm, TYPE);

    /*
     * Get Entity Set Ids
     */
    const bondsESID = getEntitySetIdFromApp(app, BONDS);
    const dmfResultsESID = getEntitySetIdFromApp(app, DMF_RESULTS);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const outcomesESID = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);
    const releaseConditionsESID = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);

    /*
     * Create id property values for new entities
     */
    const bondId = randomUUID();
    const outcomeId = randomUUID();

    /*
     * Assemble Assoociations
     */
    const data = { [completedDateTimePTID]: [DateTime.local().toISO()] };
    const associations = {
      [registeredForESID]: [
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: outcomesESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: outcomesESID,
          dstEntityKeyId: dmfResultsEKID,
          dstEntitySetId: dmfResultsESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: outcomesESID,
          dstEntityKeyId: psaScoresEKID,
          dstEntitySetId: psaScoresESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: outcomesESID,
          dstEntityKeyId: hearingEKID,
          dstEntitySetId: hearingsESID
        },
      ]
    };

    /*
     * Assemble Entities
     */
    const entities = {
      [outcomesESID]: [
        {
          [generalIdPTID]: [outcomeId],
          [judgeAcceptedPTID]: [judgeAccepted],
          [outcomePTID]: [outcomeSelection],
          [otherTextPTID]: [outcomeText],
          [releaseTypePTID]: [releaseType]
        }
      ]
    };

    if (bondType) {
      const bondEntity = {
        [generalIdPTID]: [bondId],
        [bondTypePTID]: [bondType]
      };
      if (bondAmount) bondEntity[bondAmountPTID] = [bondAmount];
      entities[bondsESID] = [bondEntity];
      associations[registeredForESID] = associations[registeredForESID].concat([
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: dmfResultsEKID,
          dstEntitySetId: dmfResultsESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: psaScoresEKID,
          dstEntitySetId: psaScoresESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: hearingEKID,
          dstEntitySetId: hearingsESID
        },
      ]);
    }

    /*
     * Add release condition entities and associations
     */
    if (releaseConditions.length) {
      entities[releaseConditionsESID] = [];
      releaseConditions.forEach((releaseCondtiion, index) => {
        const releaseConditionId = randomUUID();
        const {
          [START_DATE]: startDate,
          [TYPE]: releaseConditionType,
          [FREQUENCY]: frequency,
          [OTHER_TEXT]: otherText,
          [PLAN_TYPE]: planType,
          [PERSON_NAME]: personName,
          [PERSON_TYPE]: personType
        } = releaseCondtiion;

        const releaseConditionEntity = {
          [generalIdPTID]: [releaseConditionId],
          [typePTID]: [releaseConditionType],
          [startDatePTID]: [startDate]
        };
        if (frequency) {
          releaseConditionEntity[frequencyPTID] = [frequency];
        }
        if (otherText) {
          releaseConditionEntity[otherTextPTID] = [otherText];
        }
        if (planType) {
          releaseConditionEntity[planTypePTID] = [planType];
        }
        if (personName && personType) {
          releaseConditionEntity[personNamePTID] = [personName];
          releaseConditionEntity[personTypePTID] = [personType];
        }

        const associationData = [
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: personEKID,
            dstEntitySetId: peopleESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: dmfResultsEKID,
            dstEntitySetId: dmfResultsESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: psaScoresEKID,
            dstEntitySetId: psaScoresESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityIndex: 0,
            dstEntitySetId: outcomesESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: hearingEKID,
            dstEntitySetId: hearingsESID
          }
        ];

        if (bondType) {
          associations[registeredForESID] = associations[registeredForESID].concat(
            {
              data,
              srcEntityIndex: index,
              srcEntitySetId: releaseConditionsESID,
              dstEntityIndex: 0,
              dstEntitySetId: bondsESID
            }
          );
        }

        entities[releaseConditionsESID].push(releaseConditionEntity);
        associations[registeredForESID] = associations[registeredForESID].concat(associationData);
      });
    }

    /*
     * Submit data and collect response
     */
    const response = yield call(
      createEntityAndAssociationDataWorker,
      createEntityAndAssociationData({ associations, entities })
    );
    if (response.error) throw response.error;
    /*
     * Collect Hearing and Neighbors
     */
    const { hearing, hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEKID);

    yield put(submitReleaseConditions.success(action.id, {
      hearing,
      hearingNeighborsByAppTypeFqn,
      psaEKID: psaScoresEKID,
      personEKID
    }));
  }

  catch (error) {
    console.error(error);
    yield put(submitReleaseConditions.failure(action.id, error));
  }
  finally {
    yield put(submitReleaseConditions.finally(action.id));
  }
}

function* submitReleaseConditionsWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_RELEASE_CONDTIONS, submitReleaseConditionsWorker);
}


function* updateOutcomesAndReleaseCondtionsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateOutcomesAndReleaseCondtions.request(action.id));
    const {
      bondEntity,
      bondEntityKeyId,
      deleteConditions,
      dmfResultsEKID,
      hearingEKID,
      outcomeEntity,
      outcomeEntityKeyId,
      personEKID,
      psaScoresEKID,
      psaId,
      releaseConditions
    } = action.value;


    /*
     * Get Property Type Ids
     */
    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const completedDateTimePTID = getPropertyTypeId(edm, COMPLETED_DATE_TIME);
    const frequencyPTID = getPropertyTypeId(edm, FREQUENCY);
    const generalIdPTID = getPropertyTypeId(edm, GENERAL_ID);
    const otherTextPTID = getPropertyTypeId(edm, OTHER_TEXT);
    const personNamePTID = getPropertyTypeId(edm, PERSON_NAME);
    const personTypePTID = getPropertyTypeId(edm, PERSON_TYPE);
    const planTypePTID = getPropertyTypeId(edm, PLAN_TYPE);
    const startDatePTID = getPropertyTypeId(edm, START_DATE);
    const typePTID = getPropertyTypeId(edm, TYPE);

    /*
     * Get Entity Set Ids
     */
    const bondsESID = getEntitySetIdFromApp(app, BONDS);
    const dmfResultsESID = getEntitySetIdFromApp(app, DMF_RESULTS);
    const hearingsESID = getEntitySetIdFromApp(app, HEARINGS);
    const outcomesESID = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresESID = getEntitySetIdFromApp(app, PSA_SCORES);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);
    const releaseConditionsESID = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);

    const updates = [];
    const entities = {};
    const associations = {};
    let creatingBondOrReleaseConditions = false;
    entities[releaseConditionsESID] = [];
    associations[registeredForESID] = [];

    if (deleteConditions.size) {
      deleteConditions.toJS().forEach((entityKeyId) => {
        updates.push(
          call(
            deleteEntityWorker,
            deleteEntity({
              entityKeyId,
              entitySetId: releaseConditionsESID,
              deleteType: DeleteTypes.Soft
            })
          )
        );
      });
      yield all(updates);
    }


    if (bondEntityKeyId) {
      if (bondEntity) {
        // If bondEntity is present, Update Bond Entity
        const bondEntityOject = getPropertyIdToValueMap(bondEntity, edm);
        const updatedBondObject = { [bondEntityKeyId]: bondEntityOject };
        const bondUpdateResponse = yield call(
          updateEntityDataWorker,
          updateEntityData({
            entitySetId: bondsESID,
            entities: updatedBondObject,
            updateType: UpdateTypes.PartialReplace
          })
        );
        if (bondUpdateResponse.error) throw bondUpdateResponse.error;
      }
      else {
        // Delete Bond Entity
        const deleteBondResponse = yield call(
          deleteEntityWorker,
          deleteEntity({
            entityKeyId: bondEntityKeyId,
            entitySetId: bondsESID,
            deleteType: DeleteTypes.Soft
          })
        );
        if (deleteBondResponse.error) throw deleteBondResponse.error;
      }
    }
    else if (bondEntity) {
      // if bondEnitty is Present but no bondEKID, create new bond entity
      creatingBondOrReleaseConditions = true;
      const bondEntityOject = getPropertyIdToValueMap(bondEntity, edm);
      const data = { [completedDateTimePTID]: [DateTime.local().toISO()] };
      entities[bondsESID] = [bondEntityOject];
      associations[registeredForESID] = associations[registeredForESID].concat([
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: personEKID,
          dstEntitySetId: peopleESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: dmfResultsEKID,
          dstEntitySetId: dmfResultsESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: psaScoresEKID,
          dstEntitySetId: psaScoresESID
        },
        {
          data,
          srcEntityIndex: 0,
          srcEntitySetId: bondsESID,
          dstEntityKeyId: hearingEKID,
          dstEntitySetId: hearingsESID
        },
      ]);
    }

    if (outcomeEntityKeyId && fromJS(outcomeEntity).size) {
      /*
      * Update Bond Entity
      */
      const outcomeEntityOject = getPropertyIdToValueMap(outcomeEntity, edm);
      const updatedOutcomeObject = { [outcomeEntityKeyId]: outcomeEntityOject };
      const outcomeUpdateResponse = yield call(
        updateEntityDataWorker,
        updateEntityData({
          entitySetId: outcomesESID,
          entities: updatedOutcomeObject,
          updateType: UpdateTypes.PartialReplace
        })
      );
      if (outcomeUpdateResponse.error) throw outcomeUpdateResponse.error;
    }


    /*
     * Add release condition entities and associations
     */

    const data = { [completedDateTimePTID]: [DateTime.local().toISO()] };
    if (releaseConditions.length) {
      creatingBondOrReleaseConditions = true;
      releaseConditions.forEach((releaseCondtiion, index) => {
        const releaseConditionId = randomUUID();
        const {
          [START_DATE]: startDate,
          [TYPE]: releaseConditionType,
          [FREQUENCY]: frequency,
          [OTHER_TEXT]: otherText,
          [PLAN_TYPE]: planType,
          [PERSON_NAME]: personName,
          [PERSON_TYPE]: personType
        } = releaseCondtiion;

        const releaseConditionEntity = {
          [generalIdPTID]: [releaseConditionId],
          [typePTID]: [releaseConditionType],
          [startDatePTID]: [startDate]
        };
        if (frequency) {
          releaseConditionEntity[frequencyPTID] = [frequency];
        }
        if (otherText) {
          releaseConditionEntity[otherTextPTID] = [otherText];
        }
        if (planType) {
          releaseConditionEntity[planTypePTID] = [planType];
        }
        if (personName && personType) {
          releaseConditionEntity[personNamePTID] = [personName];
          releaseConditionEntity[personTypePTID] = [personType];
        }

        const associationData = [
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: personEKID,
            dstEntitySetId: peopleESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: dmfResultsEKID,
            dstEntitySetId: dmfResultsESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: psaScoresEKID,
            dstEntitySetId: psaScoresESID
          },
          {
            data,
            srcEntityIndex: index,
            srcEntitySetId: releaseConditionsESID,
            dstEntityKeyId: hearingEKID,
            dstEntitySetId: hearingsESID
          }
        ];

        if (bondEntityKeyId && bondEntity) {
          associations[registeredForESID] = associations[registeredForESID].concat(
            {
              data,
              srcEntityIndex: index,
              srcEntitySetId: releaseConditionsESID,
              dstEntityKeyId: bondEntityKeyId,
              dstEntitySetId: bondsESID
            }
          );
        }

        if (outcomeEntityKeyId && fromJS(outcomeEntity).size) {
          associations[registeredForESID] = associations[registeredForESID].concat(
            {
              data,
              srcEntityIndex: index,
              srcEntitySetId: releaseConditionsESID,
              dstEntityKeyId: outcomeEntityKeyId,
              dstEntitySetId: outcomesESID
            }
          );
        }

        entities[releaseConditionsESID].push(releaseConditionEntity);
        associations[registeredForESID] = associations[registeredForESID].concat(associationData);
      });

    }
    if (creatingBondOrReleaseConditions) {
      /*
      * Submit data and collect response
      */
      const response = yield call(
        createEntityAndAssociationDataWorker,
        createEntityAndAssociationData({ associations, entities })
      );
      if (response.error) throw response.error;
    }

    const { hearingNeighborsByAppTypeFqn } = yield call(getHearingAndNeighbors, hearingEKID);

    yield put(updateOutcomesAndReleaseCondtions.success(action.id, {
      psaId,
      hearingNeighborsByAppTypeFqn
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
  submitReleaseConditionsWatcher,
  updateOutcomesAndReleaseCondtionsWatcher
};
