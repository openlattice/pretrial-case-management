/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DataUtils } from 'lattice-utils';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { getPropertyTypeId } from '../../../edm/edmUtils';
import { getEntitySetIdFromApp } from '../../../utils/AppUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../../utils/consts/FrontEndStateConsts';
import { STATE } from '../../../utils/consts/redux/SharedConsts';
import { getPeopleNeighbors } from '../../people/PeopleActions';
import { loadPSAData } from '../../review/ReviewActions';
import {
  LOAD_REQUIRES_ACTION,
  loadRequiresAction
} from '../actions';

const LOG :Logger = new Logger('Load Requires Action Saga');

const { getEntityKeyId } = DataUtils;

const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  CHARGES,
  FTAS,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  SENTENCES,
  STAFF,
} = APP_TYPES;

const { DATE_TIME, STATUS } = PROPERTY_TYPES;

const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());

const PAGE_SIZE = 20;

function* loadRequiresActionWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadRequiresAction.request(action.id));
    const { statusFilter, start = 0 } = action.value;

    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const psaScoresESID :UUID = getEntitySetIdFromApp(app, PSA_SCORES);

    const sortPTID :UUID = getPropertyTypeId(edm, DATE_TIME);
    const statusPTID :UUID = getPropertyTypeId(edm, STATUS);

    const constraints = [{
      constraints: [{
        type: 'simple',
        searchTerm: `entity.${statusPTID}:"${statusFilter}"`,
        fuzzy: false
      }]
    }];

    const sort = {
      type: 'field',
      descending: false,
      propertyTypeId: sortPTID
    };

    const searchConstraints = {
      start: (start - 1) * PAGE_SIZE,
      entitySetIds: [psaScoresESID],
      maxHits: PAGE_SIZE,
      constraints,
      sort
    };

    const psaResponse :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints),
    );
    if (psaResponse.error) throw psaResponse.error;
    const { hits, numHits } = psaResponse.data;

    const psaEKIDs = [];
    const psaMap :Map = Map().withMutations((mutableMap) => {
      fromJS(hits).forEach((hit) => {
        const hitEKID = getEntityKeyId(hit);
        psaEKIDs.push(hitEKID);
        mutableMap.set(hitEKID, hit);
      });
    });

    const loadPSADataRequest = loadPSAData({
      dstEntitySets: [OUTCOMES],
      psaIds: psaEKIDs,
      scoresAsMap: psaMap,
      srcEntitySets: [PEOPLE, STAFF]
    });
    yield put(loadPSADataRequest);

    const psaNeighborResponse = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: psaScoresESID,
        filter: {
          entityKeyIds: psaEKIDs,
          sourceEntitySetIds: [],
          destinationEntitySetIds: [peopleESID]
        }
      })
    );
    if (psaNeighborResponse.error) throw psaNeighborResponse.error;

    const peopleEKIDs = Set().withMutations((mutableSet) => {
      psaEKIDs.forEach((psaEKID) => {
        const person = fromJS(psaNeighborResponse.data[psaEKID]) || List();
        if (!person.isEmpty()) {
          const personEKID = getEntityKeyId(person.getIn([0, PSA_NEIGHBOR.DETAILS], Map()));
          mutableSet.add(personEKID);
        }
      });
    }).toJS();

    const loadPeopleNeighbors = getPeopleNeighbors({
      dstEntitySets: [PRETRIAL_CASES, CHARGES, SENTENCES],
      peopleEKIDs,
      srcEntitySets: [FTAS, PSA_SCORES]
    });
    yield put(loadPeopleNeighbors);

    yield put(loadRequiresAction.success(action.id, { numHits, psaMap }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadRequiresAction.failure(action.id, { error }));
  }
  finally {
    yield put(loadRequiresAction.finally(action.id));
  }
}

function* loadRequiresActionWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_REQUIRES_ACTION, loadRequiresActionWorker);
}

export {
  loadRequiresActionWatcher,
  loadRequiresActionWorker
};
