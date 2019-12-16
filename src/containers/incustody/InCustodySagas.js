/*
 * @flow
 */

import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { MAX_HITS } from '../../utils/consts/Consts';
import { getEntityKeyId, getSearchTerm } from '../../utils/DataUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';

import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import { GET_IN_CUSTODY_DATA, getInCustodyData } from './InCustodyActions';

const { ARREST_BONDS, JAIL_STAYS, PEOPLE } = APP_TYPES;
const { START_DATE_TIME, RELEASE_DATE_TIME } = PROPERTY_TYPES;

const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

/*
 * Selectors
 */
const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

function* getInCustodyDataWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(getInCustodyData.request(action.id));
    let peopleInCustody = Map();
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);

    const arrestBondsESID :UUID = getEntitySetIdFromApp(app, ARREST_BONDS);
    const jailStaysESID :UUID = getEntitySetIdFromApp(app, JAIL_STAYS);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    const startDatePropertyTypeId :UUID = getPropertyTypeId(edm, START_DATE_TIME);
    const releaseDatePropertyTypeId :UUID = getPropertyTypeId(edm, RELEASE_DATE_TIME);

    const searchTerm = `_exists_:entity.${startDatePropertyTypeId} AND NOT _exists_:entity.${releaseDatePropertyTypeId}`;
    const options = {
      searchTerm,
      start: 0,
      maxHits: MAX_HITS,
      fuzzy: false
    };
    /* get all judge data */
    const jailStayResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: jailStaysESID, searchOptions: options })
    );
    if (jailStayResponse.error) throw jailStayResponse.error;
    const activeJailStays = fromJS(jailStayResponse.data.hits);
    const jailStaysById = Map().withMutations((mutableMap) => {
      activeJailStays.forEach((jailStay) => {
        const jailStayEKID = getEntityKeyId(jailStay);
        mutableMap.set(jailStayEKID, jailStay);
      });
    });

    let neighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: jailStaysESID,
        filter: {
          entityKeyIds: jailStaysById.keySeq().toJS(),
          sourceEntitySetIds: [peopleESID],
          destinationEntitySetIds: [arrestBondsESID]
        }
      })
    );
    if (neighborsById.error) throw neighborsById.error;
    neighborsById = fromJS(neighborsById.data);

    const neighborsByAppTypeFqn = Map().withMutations((mutableMap) => {
      neighborsById.entrySeq().forEach(([id, neighbors]) => {
        neighbors.forEach((neighbor) => {
          const entityKeyId = getEntityKeyId(neighbor);
          const neighborESID = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const appTypeFqn = entitySetIdsToAppType.get(neighborESID, '');
          if (appTypeFqn === PEOPLE) {
            mutableMap.setIn([id, PEOPLE], neighbor);
            peopleInCustody = peopleInCustody.set(entityKeyId, neighbor);
          }
          else if (appTypeFqn === ARREST_BONDS) {
            mutableMap.setIn(
              [id, ARREST_BONDS],
              mutableMap.getIn([id, ARREST_BONDS], List()).push(neighbor)
            );
          }
        });
      });
    });

    yield put(getInCustodyData.success(action.id, {
      jailStaysById,
      neighborsByAppTypeFqn,
      peopleInCustody
    }));
  }
  catch (error) {
    console.error(error);
    yield put(getInCustodyData.failure(action.id, { error }));
  }
  finally {
    yield put(getInCustodyData.finally(action.id));
  }
}

function* getInCustodyDataWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_IN_CUSTODY_DATA, getInCustodyDataWorker);
}


export {
  getInCustodyDataWatcher
};
