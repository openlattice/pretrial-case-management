/*
 * @flow
 */

import { Types } from 'lattice';
import { fromJS, Map, Set } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  call,
  put,
  takeEvery,
  select
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MAX_HITS } from '../../utils/consts/Consts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { getEntityKeyId, isUUID } from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import {
  ASSOCIATE_JUDGE_WITH_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY,
  associateJudgeToCounty,
  loadJudges,
  removeJudgeFromCounty
} from './JudgeActions';

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

function* associateJudgeToCountyWorker(action :SequenceAction) :Generator<*, *, *> {
  const { countyEKID, countyNumber, judgeEKID } = action.value;
  try {
    yield put(associateJudgeToCounty.request(action.id, { judgeEKID }));
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

    yield put(associateJudgeToCounty.success(action.id, { judgeEKID, countyEKID }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(associateJudgeToCounty.failure(action.id, error));
  }
  finally {
    yield put(associateJudgeToCounty.finally(action.id, { judgeEKID }));
  }
}

function* associateJudgeToCountyWatcher() :Generator<*, *, *> {
  yield takeEvery(ASSOCIATE_JUDGE_WITH_COUNTY, associateJudgeToCountyWorker);
}

function* removeJudgeFromCountyWorker(action :SequenceAction) :Generator<*, *, *> {
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

function* removeJudgeFromCountyWatcher() :Generator<*, *, *> {
  yield takeEvery(REMOVE_JUDGE_FROM_COUNTY, removeJudgeFromCountyWorker);
}

function* loadJudgesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadJudges.request(action.id));
    const app = yield select(getApp);
    const orgId = yield select(getOrgId);
    const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
    let judgesById = Map();
    const countiesESID = getEntitySetIdFromApp(app, COUNTIES);
    const judgesESID = getEntitySetIdFromApp(app, JUDGES);
    const options = {
      searchTerm: '*',
      start: 0,
      maxHits: MAX_HITS
    };
    /* get all judge data */
    const allJudgeData = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({ entitySetId: judgesESID, searchOptions: options })
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

function* loadJudgesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_JUDGES, loadJudgesWorker);
}

export {
  associateJudgeToCountyWatcher,
  loadJudgesWatcher,
  removeJudgeFromCountyWatcher
};
