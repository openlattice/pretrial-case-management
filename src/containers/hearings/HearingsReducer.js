/*
 * @flow
 */
import moment from 'moment';
import { DateTime } from 'luxon';
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { filterPeopleIdsWithOpenPSAs } from '../court/CourtActionFactory';
import {
  CLEAR_HEARING_SETTINGS,
  CLEAR_SUBMITTED_HEARING,
  CLOSE_HEARING_SETTINGS_MODAL,
  loadHearingNeighbors,
  OPEN_HEARING_SETTINGS_MODAL,
  refreshHearingAndNeighbors,
  SET_HEARING_SETTINGS,
  submitExistingHearing,
  submitHearing,
  updateHearing
} from './HearingsActions';

import { TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';


import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

const { JUDGES } = APP_TYPES;
const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;


const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [HEARINGS_ACTIONS.SUBMIT_HEARING]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [HEARINGS_ACTIONS.UPDATE_HEARING]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS]: Map(),
    [HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS]: Map(),
    [HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING]: Map(),
    [HEARINGS_ACTIONS.SUBMIT_HEARING]: Map(),
    [HEARINGS_ACTIONS.UPDATE_HEARING]: Map()
  },
  [HEARINGS_DATA.COURTROOM]: '',
  [HEARINGS_DATA.DATE]: DateTime.local().toISODate(),
  [HEARINGS_DATA.HEARINGS_BY_ID]: Map(),
  [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: Map(),
  [HEARINGS_DATA.JUDGE]: '',
  [HEARINGS_DATA.SETTINGS_MODAL_OPEN]: false,
  [HEARINGS_DATA.SUBMITTED_HEARING]: Map(),
  [HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS]: Map(),
  [HEARINGS_DATA.TIME]: DateTime.local().toFormat(TIME_FORMAT),
  [HEARINGS_DATA.UPDATED_HEARING]: Map(),
  [HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS]: Map()
});

export default function hearingsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_HEARING_SETTINGS: return state
      .set(HEARINGS_DATA.DATE, moment().format('MM/DD/YYYY'))
      .set(HEARINGS_DATA.COURTROOM, '')
      .set(HEARINGS_DATA.JUDGE, '')
      .set(HEARINGS_DATA.TIME, '');

    case CLEAR_SUBMITTED_HEARING: return state
      .set(HEARINGS_DATA.SUBMITTED_HEARING, Map())
      .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, Map());

    case CLOSE_HEARING_SETTINGS_MODAL: return state.set(HEARINGS_DATA.SETTINGS_MODAL_OPEN, false);

    case OPEN_HEARING_SETTINGS_MODAL: return state.set(HEARINGS_DATA.SETTINGS_MODAL_OPEN, true);

    case filterPeopleIdsWithOpenPSAs.case(action.type): {
      return filterPeopleIdsWithOpenPSAs.reducer(state, action, {
        SUCCESS: () => {
          const { hearingNeighborsById } = action.value;
          const currentHearingNeighborsState = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID);
          const newHearingNeighborsState = currentHearingNeighborsState.merge(hearingNeighborsById);
          return state.set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, newHearingNeighborsState);
        }
      });
    }

    case loadHearingNeighbors.case(action.type): {
      return loadHearingNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearingNeighborsById } = action.value;
          const currentState = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID);
          const newState = currentState.merge(hearingNeighborsById);
          return state
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, newState)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, action.id])
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const { [ENTITY_KEY_ID]: hearingEntityKeyId } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          return state
            .setIn([HEARINGS_DATA.HEARINGS_BY_ID, hearingEntityKeyId], hearing)
            .setIn([HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingEntityKeyId], hearingNeighborsByAppTypeFqn)
            .set(HEARINGS_DATA.UPDATED_HEARING, hearing)
            .set(HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(HEARINGS_DATA.UPDATED_HEARING, Map())
            .set(HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS, action.id])
      });
    }

    case SET_HEARING_SETTINGS: {
      const {
        date,
        time,
        courtroom,
        judge
      } = action.value;
      return state
        .set(HEARINGS_DATA.DATE, date)
        .set(HEARINGS_DATA.TIME, time)
        .set(HEARINGS_DATA.COURTROOM, courtroom)
        .set(HEARINGS_DATA.JUDGE, judge);
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const { [ENTITY_KEY_ID]: hearingEntityKeyId } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).set(hearingEntityKeyId, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .set(hearingEntityKeyId, hearingNeighborsByAppTypeFqn);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS_DATA.SUBMITTED_HEARING, hearing)
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(HEARINGS_DATA.SUBMITTED_HEARING, Map())
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, action.id])
      });
    }

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const { [ENTITY_KEY_ID]: hearingEntityKeyId } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).set(hearingEntityKeyId, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .set(hearingEntityKeyId, hearingNeighborsByAppTypeFqn);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS_DATA.SUBMITTED_HEARING, hearing)
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(HEARINGS_DATA.SUBMITTED_HEARING, Map())
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.SUBMIT_HEARING], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, action.id])
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearingEKID, hearing, hearingJudge } = action.value;
          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).set(hearingEKID, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .setIn([hearingEKID, JUDGES], hearingJudge);
          const hearingNeighbors = hearingsNeighborsMap.get(hearingEKID);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS_DATA.SUBMITTED_HEARING, hearing)
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, hearingNeighbors)
            .set(HEARINGS_DATA.UPDATED_HEARING, hearing)
            .set(HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS, hearingNeighbors)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, REDUX.UPDATE_HEARING], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(HEARINGS_DATA.SUBMITTED_HEARING, Map())
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, Map())
            .set(HEARINGS_DATA.UPDATED_HEARING, Map())
            .set(HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.UPDATE_HEARING], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, action.id])
      });
    }

    default:
      return state;
  }
}
