/*
 * @flow
 */

import moment from 'moment';
import Immutable, { Map, List, fromJS } from 'immutable';
import { AuthorizationApi, Constants, SearchApi } from 'lattice';
import {
  call,
  put,
  takeEvery,
  select
} from 'redux-saga/effects';

import { getEntitySetId } from '../../utils/AppUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { obfuscateEntityNeighbors } from '../../utils/consts/DemoNames';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

import { LOAD_PSA_MODAL, loadPSAModal } from './PSAModalActionFactory';

const {
  CONTACT_INFORMATION,
  HEARINGS,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  RELEASE_CONDITIONS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES_FQNS;


const contactInformationFqn :string = CONTACT_INFORMATION.toString();
const hearingsFqn :string = HEARINGS.toString();
const peopleFqn :string = PEOPLE.toString();
const pretrialCasesFqn :string = PRETRIAL_CASES.toString();
const psaScoresFqn :string = PSA_SCORES.toString();
const releaseConditionsFqn :string = RELEASE_CONDITIONS.toString();
const staffFqn :string = STAFF.toString();
const subscriptionFqn :string = SUBSCRIPTION.toString();

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const { OPENLATTICE_ID_FQN } = Constants;

const LIST_ENTITY_SETS = Immutable.List.of(staffFqn, releaseConditionsFqn, hearingsFqn, pretrialCasesFqn);

function* loadPSAModalWorker(action :SequenceAction) :Generator<*, *, *> {
  const { psaId, callback } = action.value; // Deconstruct action argument
  try {
    yield put(loadPSAModal.request(action.id));

    let allFilers = Immutable.Set();
    let hearingIds = Immutable.Set();
    let allDatesEdited = Immutable.List();
    let neighborsByAppTypeFqn = Immutable.Map();
    let psaPermissions = false;
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const psaScoresEntitySetId = getEntitySetId(app, psaScoresFqn, orgId);
    const peopleEntitySetId = getEntitySetId(app, peopleFqn, orgId);
    const subscriptionEntitySetId = getEntitySetId(app, subscriptionFqn, orgId);
    const contactInformationEntitySetId = getEntitySetId(app, contactInformationFqn, orgId);

    /*
     * Get Neighbors
     */

    let psaNeighbors = yield call(SearchApi.searchEntityNeighbors, psaScoresEntitySetId, psaId);
    psaNeighbors = obfuscateEntityNeighbors(psaNeighbors); // TODO just for demo
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
        ], Immutable.List())).forEach((timestamp) => {
        const timestampMoment = moment(timestamp);
        if (timestampMoment.isValid()) {
          allDatesEdited = allDatesEdited.push(timestampMoment.format('MM/DD/YYYY'));
        }
      });

      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id']);
      const AppTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (AppTypeFqn) {
        if (AppTypeFqn === staffFqn) {
          neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID], Immutable.List())
            .forEach((filer) => {
              allFilers = allFilers.add(filer);
            });
        }

        if (LIST_ENTITY_SETS.includes(AppTypeFqn)) {
          if (AppTypeFqn === hearingsFqn) {
            const neighborDetails = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());
            const hearingEntityKeyId = neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]);
            if (hearingEntityKeyId) hearingIds = hearingIds.add(neighborDetails.getIn([OPENLATTICE_ID_FQN, 0]));
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              AppTypeFqn,
              neighborsByAppTypeFqn.get(AppTypeFqn, Immutable.List()).push(fromJS(neighborDetails))
            );
          }
          else {
            neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(
              AppTypeFqn,
              neighborsByAppTypeFqn.get(AppTypeFqn, Immutable.List()).push(fromJS(neighbor))
            );
          }
        }
        else {
          neighborsByAppTypeFqn = neighborsByAppTypeFqn.set(AppTypeFqn, fromJS(neighbor));
        }
      }
    });

    const personId = getEntityKeyId(neighborsByAppTypeFqn, peopleFqn);

    let personNeighbors = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personId],
      sourceEntitySetIds: [contactInformationEntitySetId],
      destinationEntitySetIds: [subscriptionEntitySetId, contactInformationEntitySetId]
    });

    personNeighbors = fromJS(Object.values(personNeighbors)[0]);
    let personNeighborsByFqn = Map();
    personNeighbors.forEach((neighbor) => {
      const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
      if (appTypeFqn === contactInformationFqn) {
        personNeighborsByFqn = personNeighborsByFqn.set(
          appTypeFqn,
          personNeighborsByFqn.get(appTypeFqn, List()).push(neighbor)
        );
      }
      else if (appTypeFqn === subscriptionFqn) {
        personNeighborsByFqn = personNeighborsByFqn.set(
          appTypeFqn,
          neighbor
        );
      }
    });

    if (callback) callback(personId, neighborsByAppTypeFqn);

    yield put(loadPSAModal.success(action.id, {
      psaId,
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
