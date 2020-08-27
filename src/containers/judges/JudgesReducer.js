/*
 * @flow
 */
import { DateTime } from 'luxon';
import { RequestStates } from 'redux-reqseq';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import {
  ASSOCIATE_JUDGE_WITH_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY,
  associateJudgeToCounty,
  loadJudges,
  removeJudgeFromCounty
} from './JudgeActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import JUDGES_DATA from '../../utils/consts/redux/JudgeConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [ASSOCIATE_JUDGE_WITH_COUNTY]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_JUDGES]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [REMOVE_JUDGE_FROM_COUNTY]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [ASSOCIATE_JUDGE_WITH_COUNTY]: Map(),
    [LOAD_JUDGES]: Map(),
    [REMOVE_JUDGE_FROM_COUNTY]: Map()
  },
  [JUDGES_DATA.ALL_JUDGES]: Map(),
  [JUDGES_DATA.JUDGES_BY_ID]: Map(),
  [JUDGES_DATA.JUDGES_BY_COUNTY]: Map(),
  [JUDGES_DATA.JUDGES_UPDATING]: Set()
});

export default function judgesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case associateJudgeToCounty.case(action.type): {
      return associateJudgeToCounty.reducer(state, action, {
        REQUEST: () => {
          const { judgeEKID } = action.value;
          const judgeIdsLoading = state.get(JUDGES_DATA.JUDGES_UPDATING, Set()).add(judgeEKID);
          return state
            .set(JUDGES_DATA.JUDGES_UPDATING, judgeIdsLoading)
            .setIn([REDUX.ACTIONS, ASSOCIATE_JUDGE_WITH_COUNTY, action.id], action)
            .setIn([REDUX.ACTIONS, ASSOCIATE_JUDGE_WITH_COUNTY, REDUX.REQUEST_STATE], PENDING);
        },
        SUCCESS: () => {
          const { judgeEKID, countyEKID } = action.value;
          const judgeIdsForCounty = state
            .getIn([JUDGES_DATA.JUDGES_BY_COUNTY, countyEKID], Set()).add(judgeEKID);
          return state
            .setIn([JUDGES_DATA.JUDGES_BY_COUNTY, countyEKID], judgeIdsForCounty)
            .setIn([REDUX.ACTIONS, ASSOCIATE_JUDGE_WITH_COUNTY, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, ASSOCIATE_JUDGE_WITH_COUNTY], error)
            .setIn([REDUX.ACTIONS, ASSOCIATE_JUDGE_WITH_COUNTY, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => {
          const { judgeEKID } = action.value;
          const judgeIdsLoading = state.get(JUDGES_DATA.JUDGES_UPDATING, Set()).delete(judgeEKID);
          return state
            .set(JUDGES_DATA.JUDGES_UPDATING, judgeIdsLoading)
            .deleteIn([REDUX.ACTIONS, ASSOCIATE_JUDGE_WITH_COUNTY, action.id]);
        }
      });
    }

    case loadJudges.case(action.type): {
      return loadJudges.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_JUDGES, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_JUDGES, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            allJudges,
            judgesByCounty,
            judgesById
          } = action.value;
          return state
            .set(JUDGES_DATA.ALL_JUDGES, allJudges)
            .set(JUDGES_DATA.JUDGES_BY_COUNTY, judgesByCounty)
            .set(JUDGES_DATA.JUDGES_BY_ID, judgesById)
            .setIn([REDUX.ACTIONS, LOAD_JUDGES, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_JUDGES], error)
            .setIn([REDUX.ACTIONS, LOAD_JUDGES, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_JUDGES, action.id])
      });
    }

    case removeJudgeFromCounty.case(action.type): {
      return removeJudgeFromCounty.reducer(state, action, {
        REQUEST: () => {
          const { judgeEKID } = action.value;
          const judgeIdsLoading = state.get(JUDGES_DATA.JUDGES_UPDATING, Set()).add(judgeEKID);
          return state
            .set(JUDGES_DATA.JUDGES_UPDATING, judgeIdsLoading)
            .setIn([REDUX.ACTIONS, REMOVE_JUDGE_FROM_COUNTY, action.id], action)
            .setIn([REDUX.ACTIONS, REMOVE_JUDGE_FROM_COUNTY, REDUX.REQUEST_STATE], PENDING);
        },
        SUCCESS: () => {
          const { judgeEKID, countyEKID } = action.value;
          const judgeIdsForCounty = state
            .getIn([JUDGES_DATA.JUDGES_BY_COUNTY, countyEKID], Set()).delete(judgeEKID);
          return state
            .setIn([JUDGES_DATA.JUDGES_BY_COUNTY, countyEKID], judgeIdsForCounty)
            .setIn([REDUX.ACTIONS, ASSOCIATE_JUDGE_WITH_COUNTY, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, REMOVE_JUDGE_FROM_COUNTY], error)
            .setIn([REDUX.ACTIONS, REMOVE_JUDGE_FROM_COUNTY, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => {
          const { judgeEKID } = action.value;
          const judgeIdsLoading = state.get(JUDGES_DATA.JUDGES_UPDATING, Set()).delete(judgeEKID);
          return state
            .set(JUDGES_DATA.JUDGES_UPDATING, judgeIdsLoading)
            .deleteIn([REDUX.ACTIONS, REMOVE_JUDGE_FROM_COUNTY, action.id]);
        }
      });
    }

    default:
      return state;
  }
}
