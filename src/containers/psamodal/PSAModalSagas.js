/*
 * @flow
 */

import moment from 'moment';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import {
  AuthorizationApi,
  Constants,
  DataApi,
  SearchApi
} from 'lattice';
import {
  Map,
  List,
  Set,
  fromJS
} from 'immutable';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { getEntityProperties, getEntityKeyId } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

import { LOAD_PSA_MODAL, loadPSAModal } from './PSAModalActionFactory';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const { DATE_TIME, HEARING_TYPE } = PROPERTY_TYPES;

const {
  ARREST_CASES,
  BONDS,
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_PRETRIAL_CASES,
  OUTCOMES,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES;

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

const LIST_ENTITY_SETS = List.of(STAFF, RELEASE_CONDITIONS, HEARINGS, PRETRIAL_CASES, CHECKIN_APPOINTMENTS);

function* loadPSAModalWorker(action :SequenceAction) :Generator<*, *, *> {
  const { psaId, callback } = action.value; // Deconstruct action argument
  try {
    yield put(loadPSAModal.request(action.id));

    let allFilers = Set();
    let hearingIds = Set();
    let allDatesEdited = List();
    let neighborsByAppTypeFqn = Map();
    let psaPermissions = false;
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);

    /*
     * Get Entity Set Ids
     */
    const arrestCasesEntitySetId = getEntitySetIdFromApp(app, ARREST_CASES);
    const bondsEntitySetId = getEntitySetIdFromApp(app, BONDS);
    const checkInAppointmentEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const dmfResultsEntitySetId = getEntitySetIdFromApp(app, DMF_RESULTS);
    const dmfRiskFactorsEntitySetId = getEntitySetIdFromApp(app, DMF_RISK_FACTORS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const manualPretrialCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);
    const manualPretrialCourtCasesEntitySetId = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const outcomesEntitySetId = getEntitySetIdFromApp(app, OUTCOMES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const psaEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const pretrialCasesEntitySetId = getEntitySetIdFromApp(app, PRETRIAL_CASES);
    const psaRiskFactorsEntitySetId = getEntitySetIdFromApp(app, PSA_RISK_FACTORS);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const releaseConditionsEntitySetId = getEntitySetIdFromApp(app, RELEASE_CONDITIONS);
    const releaseRecommendationsEntitySetId = getEntitySetIdFromApp(app, RELEASE_RECOMMENDATIONS);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const staffEntitySetId = getEntitySetIdFromApp(app, STAFF);

    /*
     * Get PSA Info
     */

    let scores = yield call(DataApi.getEntityData, psaScoresEntitySetId, psaId);
    scores = fromJS(scores);

    /*
     * Get PSA Neighbors
     */
    const psaNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaEntitySetId,
        filter: {
          entityKeyIds: [psaId],
          sourceEntitySetIds: [
            dmfResultsEntitySetId,
            releaseRecommendationsEntitySetId,
            bondsEntitySetId,
            outcomesEntitySetId,
            releaseConditionsEntitySetId
          ],
          destinationEntitySetIds: [
            arrestCasesEntitySetId,
            dmfRiskFactorsEntitySetId,
            hearingsEntitySetId,
            manualPretrialCasesEntitySetId,
            manualPretrialCourtCasesEntitySetId,
            peopleEntitySetId,
            pretrialCasesEntitySetId,
            psaRiskFactorsEntitySetId,
            staffEntitySetId
          ]
        }
      })
    );
    if (psaNeighborsById.error) throw psaNeighborsById.error;
    let psaNeighbors = fromJS(psaNeighborsById.data);
    psaNeighbors = psaNeighbors.get(psaId, List());

    /*
     * Check PSA Permissions
     */

    psaPermissions = yield call(AuthorizationApi.checkAuthorizations, [
      { aclKey: [psaScoresEntitySetId], permissions: ['WRITE'] }
    ]);
    psaPermissions = psaPermissions[0].permissions.WRITE;

    /*
     * Format Neighbors
     */

    psaNeighbors.forEach((neighbor) => {

      neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.TIMESTAMP],
        neighbor.getIn([
          PSA_ASSOCIATION.DETAILS,
          PROPERTY_TYPES.DATE_TIME
        ], List.of(scores.getIn([PROPERTY_TYPES.DATE_TIME, 0])) || List())).forEach((timestamp) => {
        const timestampMoment = moment(timestamp);
        if (timestampMoment.isValid()) {
          allDatesEdited = allDatesEdited.push(timestampMoment.format('MM/DD/YYYY'));
        }
      });

      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const neighborDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn) {
        if (appTypeFqn === STAFF) {
          neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID], List())
            .forEach((filer) => {
              allFilers = allFilers.add(filer);
            });
        }

        if (LIST_ENTITY_SETS.includes(appTypeFqn)) {
          const hearingEntityKeyId = neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]);
          if (appTypeFqn === HEARINGS) {
            if (hearingEntityKeyId) hearingIds = hearingIds.add(neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]));
            const {
              [DATE_TIME]: hearingDateTime,
              [HEARING_TYPE]: hearingType
            } = getEntityProperties(neighbor, [
              DATE_TIME,
              HEARING_TYPE
            ]);
            const hearingIsInactive = hearingIsCancelled(neighbor);
            const hearingIsGeneric = hearingType.toLowerCase().trim() === 'all other hearings';
            if (hearingDateTime && !hearingIsGeneric && !hearingIsInactive) {
              neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
                appTypeFqn,
                neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighborDetails))
              );
            }
          }
          else {
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              appTypeFqn,
              neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighbor))
            );
          }
        }
        else if (appTypeFqn === MANUAL_PRETRIAL_CASES || appTypeFqn === MANUAL_PRETRIAL_COURT_CASES) {
          neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(MANUAL_PRETRIAL_CASES, neighbor);
        }
        else {
          neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(appTypeFqn, fromJS(neighbor));
        }
      }
    });

    const personEntitySetId = getEntityKeyId(neighborsByAppTypeFqn, PEOPLE);
    /*
     * Get PSA Neighbors
     */
    const personNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: peopleEntitySetId,
        filter: {
          entityKeyIds: [personEntitySetId],
          sourceEntitySetIds: [contactInformationEntitySetId, checkInAppointmentEntitySetId],
          destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId, hearingsEntitySetId]
        }
      })
    );
    if (personNeighborsById.error) throw personNeighborsById.error;
    let personNeighbors = fromJS(personNeighborsById.data);
    personNeighbors = personNeighbors.get(personEntitySetId, List());


    let personNeighborsByFqn = Map();
    personNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === CONTACT_INFORMATION) {
        personNeighborsByFqn = personNeighborsByFqn.set(
          appTypeFqn,
          personNeighborsByFqn.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else if (appTypeFqn === HEARINGS) {
        const neighborDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const hearingEntityKeyId = neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]);
        if (hearingEntityKeyId) hearingIds = hearingIds.add(hearingEntityKeyId);
        personNeighborsByFqn = personNeighborsByFqn.set(
          appTypeFqn,
          personNeighborsByFqn.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else if (appTypeFqn === SUBSCRIPTION) {
        personNeighborsByFqn = personNeighborsByFqn.set(
          appTypeFqn,
          neighbor
        );
      }
    });

    if (callback) callback(personEntitySetId, neighborsByAppTypeFqn);

    yield put(loadPSAModal.success(action.id, {
      psaId,
      scores,
      neighborsByAppTypeFqn,
      psaPermissions,
      personNeighborsByFqn,
      hearingIds,
      allFilers
    }));
  }

  catch (error) {
    console.error(error);
    yield put(loadPSAModal.failure(action.id, error));
  }
  finally {
    yield put(loadPSAModal.finally(action.id));
  }
}

export function* loadPSAModalWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PSA_MODAL, loadPSAModalWorker);
}
