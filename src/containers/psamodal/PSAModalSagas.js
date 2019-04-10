/*
 * @flow
 */

import moment from 'moment';
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

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

import { LOAD_PSA_MODAL, loadPSAModal } from './PSAModalActionFactory';

const {
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_PRETRIAL_CASES,
  PSA_SCORES,
  RELEASE_CONDITIONS,
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
    const checkInAppointmentEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const hearingsEntitySetId = getEntitySetIdFromApp(app, HEARINGS);
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const peopleEntitySetId = getEntitySetIdFromApp(app, PEOPLE);
    const subscriptionEntitySetId = getEntitySetIdFromApp(app, SUBSCRIPTION);
    const contactInformationEntitySetId = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    /*
     * Get PSA Info
     */

    let scores = yield call(DataApi.getEntityData, psaScoresEntitySetId, psaId);
    scores = fromJS(scores);

    /*
     * Get Neighbors
     */

    let psaNeighbors = yield call(SearchApi.searchEntityNeighbors, psaScoresEntitySetId, psaId);
    psaNeighbors = fromJS(psaNeighbors);

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
        ], List())).forEach((timestamp) => {
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
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              appTypeFqn,
              neighborsByAppTypeFqn.get(appTypeFqn, List()).push(fromJS(neighborDetails))
            );
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

    const personId = getEntityKeyId(neighborsByAppTypeFqn, PEOPLE);

    let personNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personId],
      sourceEntitySetIds: [contactInformationEntitySetId, checkInAppointmentEntitySetId],
      destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId, hearingsEntitySetId]
    });

    personNeighbors = fromJS(Object.values(personNeighbors)[0] || []);
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
      }
      else if (appTypeFqn === SUBSCRIPTION) {
        personNeighborsByFqn = personNeighborsByFqn.set(
          appTypeFqn,
          neighbor
        );
      }
    });

    if (callback) callback(personId, neighborsByAppTypeFqn);

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
