import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, Set, fromJS } from 'immutable';
/*
 * @flow
 */
import { Types } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  ASSOCIATE_JUDGE_WITH_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY,
  associateJudgeWithCounty,
  loadJudges,
  removeJudgeFromCounty
} from './JudgeActions';

import Logger from '../../utils/Logger';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityKeyId, isUUID } from '../../utils/DataUtils';
import { MAX_HITS } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';

const LOG :Logger = new Logger('HearingsSagas');

const { DeleteTypes } = Types;

const {
  createAssociations,
  deleteEntityData
} = DataApiActions;
const {
  createAssociationsWorker,
  deleteEntityDataWorker
} = DataApiSagas;
const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  PRESIDES_OVER,
  COUNTIES,
  JUDGES
} = APP_TYPES;

const { ENTITY_KEY_ID, ID } = PROPERTY_TYPES;

/*
 * Selectors
 */
const getApp = (state) => state.get(STATE.APP, Map());
const getEDM = (state) => state.get(STATE.EDM, Map());
const getOrgId = (state) => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

function* associateJudgeToCountyWorker(action :SequenceAction) :Saga<*> {
  const { countyEKID, countyNumber, judgeEKID } = action.value;
  try {
    yield put(associateJudgeWithCounty.request(action.id, { judgeEKID }));
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const idPTID = getPropertyTypeId(edm, ID);
    const presidesOverESID = getEntitySetIdFromApp(app, PRESIDES_OVER);
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);
    /*
     * Assemble Assoociations
     */
    const associations = {
      [presidesOverESID]: [
        {
          data: { [idPTID]: [countyNumber] },
          dst: {
            entityKeyId: countyEKID,
            entitySetId: countiesESID
          },
          src: {
            entityKeyId: judgeEKID,
            entitySetId: judgesESID
          }
        }
      ]
    };

    /*
     * Submit Associations
     */
    const response = yield call(
      createAssociationsWorker,
      createAssociations(associations)
    );

    if (response.error) throw response.error;

    yield put(associateJudgeWithCounty.success(action.id, { judgeEKID, countyEKID }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(associateJudgeWithCounty.failure(action.id, error));
  }
  finally {
    yield put(associateJudgeWithCounty.finally(action.id, { judgeEKID }));
  }
}

function* associateJudgeToCountyWatcher() :Saga<*> {
  yield takeEvery(ASSOCIATE_JUDGE_WITH_COUNTY, associateJudgeToCountyWorker);
}

function* removeJudgeFromCountyWorker(action :SequenceAction) :Saga<*> {
  const { judgeEKID, countyEKID } = action.value;
  try {
    yield put(removeJudgeFromCounty.request(action.id, { judgeEKID }));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    const presidesOverESID = getEntitySetIdFromApp(app, PRESIDES_OVER);
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);

    /* get county neighbors */
    const judgeNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: judgesESID,
        filter: {
          entityKeyIds: [judgeEKID],
          sourceEntitySetIds: [],
          destinationEntitySetIds: [countiesESID]
        }
      })
    );
    if (judgeNeighborsById.error) throw judgeNeighborsById.error;

    /* get association ekids to delete */
    const deleteEKIDs = Set().withMutations((mutableSet) => {
      fromJS(judgeNeighborsById.data).valueSeq().forEach((neighbors) => {
        neighbors.forEach((neighbor) => {
          const neighborEKID :UUID = getEntityKeyId(neighbor);
          const neighborESID :UUID = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const associationEKID :UUID = neighbor.getIn([PSA_ASSOCIATION.DETAILS, ENTITY_KEY_ID, 0], '');
          const appTypeFqn = entitySetIdsToAppType.get(neighborESID, '');
          if (
            appTypeFqn === COUNTIES
              && neighborEKID === countyEKID
              && isUUID(associationEKID)
          ) {
            mutableSet.add(associationEKID);
          }
        });
      });
    });

    /*
     * Delete Associations
     */

    const deleteResponse = yield call(
      deleteEntityDataWorker,
      deleteEntityData({
        entitySetId: presidesOverESID,
        entityKeyIds: deleteEKIDs.toJS(),
        deleteType: DeleteTypes.Soft
      })
    );
    if (deleteResponse.error) throw deleteResponse.error;

    yield put(removeJudgeFromCounty.success(action.id, { judgeEKID, countyEKID }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(removeJudgeFromCounty.failure(action.id, error));
  }
  finally {
    yield put(removeJudgeFromCounty.finally(action.id, { judgeEKID }));
  }
}

function* removeJudgeFromCountyWatcher() :Saga<*> {
  yield takeEvery(REMOVE_JUDGE_FROM_COUNTY, removeJudgeFromCountyWorker);
}

function* loadJudgesWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(loadJudges.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    let judgesById = Map();
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);
    const searchConstraints = {
      entitySetIds: [judgesESID],
      constraints: [{ constraints: [{ type: 'simple', searchTerm: '*' }] }],
      start: 0,
      maxHits: MAX_HITS
    };
    /* get all judge data */
    const allJudgeData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints)
    );

    if (allJudgeData.error) throw allJudgeData.error;
    const allJudges = fromJS(allJudgeData.data.hits);
    const allJudgeIds = allJudges.map((judge) => {
      const judgeEKID = getEntityKeyId(judge);
      judgesById = judgesById.set(judgeEKID, judge);
      return getEntityKeyId(judge);
    });

    /* get county neighbors */
    const judgeNeighborsById = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: judgesESID,
        filter: {
          entityKeyIds: allJudgeIds.toJS(),
          sourceEntitySetIds: [],
          destinationEntitySetIds: [countiesESID]
        }
      })
    );
    if (judgeNeighborsById.error) throw judgeNeighborsById.error;
    /* store judge ids by county id */
    const judgesByCounty = Map().withMutations((map) => {
      fromJS(judgeNeighborsById.data).entrySeq().forEach(([id, neighbors]) => {
        neighbors.forEach((neighbor) => {
          const neighborEKID = getEntityKeyId(neighbor);
          const neighborESID = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
          const appTypeFqn = entitySetIdsToAppType.get(neighborESID, '');
          if (appTypeFqn === COUNTIES) {
            map.set(
              neighborEKID,
              map.get(neighborEKID, Set()).add(id)
            );
          }
        });
      });
    });

    yield put(loadJudges.success(action.id, {
      allJudges,
      judgesByCounty,
      judgesById
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadJudges.failure(action.id, error));
  }
  finally {
    yield put(loadJudges.finally(action.id));
  }
}

function* loadJudgesWatcher() :Saga<*> {
  yield takeEvery(LOAD_JUDGES, loadJudgesWorker);
}

export {
  associateJudgeToCountyWatcher,
  loadJudgesWatcher,
  removeJudgeFromCountyWatcher
};
