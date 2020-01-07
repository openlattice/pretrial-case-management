/*
 * @flow
 */

import { DateTime } from 'luxon';
import { fromJS, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { getEntityKeyId } from '../../utils/DataUtils';
import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { CHECKINS_ACTIONS, CHECKINS_DATA } from '../../utils/consts/redux/CheckInConsts';

import {
  createCheckinAppointments,
  createManualCheckIn,
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors,
  RESET_CHECK_IN_ACTION,
  SET_CHECK_IN_DATE
} from './CheckInActions';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS]: Map(),
    [CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN]: Map(),
    [CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE]: Map(),
    [CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS]: Map()
  },
  [CHECKINS_DATA.CHECK_INS_DATE]: DateTime.local(),
  [CHECKINS_DATA.CHECK_IN_NEIGHBORS_BY_ID]: Map(),
  [CHECKINS_DATA.CHECK_INS_BY_DATE]: Map(),
  [CHECKINS_DATA.CHECK_INS_BY_ID]: Map()
});

export default function CheckInsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case createCheckinAppointments.case(action.type): {
      return createCheckinAppointments.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS, action.id], action)
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { submittedCheckins } = action.value;
          const nextCheckInsById = state.get(CHECKINS_DATA.CHECK_INS_BY_ID, Map()).withMutations((mutableMap) => {
            submittedCheckins.forEach((checkIn) => {
              const checkInEKID = getEntityKeyId(checkIn);
              mutableMap.set(checkInEKID, checkIn);
            });
          });
          return state
            .set(CHECKINS_DATA.CHECK_INS_BY_ID, nextCheckInsById)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS], error)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS, action.id])
      });
    }

    case createManualCheckIn.case(action.type): {
      return createManualCheckIn.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN, action.id], action)
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN], error)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN, action.id])
      });
    }

    case loadCheckInAppointmentsForDate.case(action.type): {
      return loadCheckInAppointmentsForDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE, action.id], action)
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { checkInAppointmentMap, isoDate } = action.value;
          const checkInsByDate = state.get(CHECKINS_DATA.CHECK_INS_BY_DATE, Map());
          const nextCheckInsById = state.get(CHECKINS_DATA.CHECK_INS_BY_ID, Map()).merge(checkInAppointmentMap);
          const nextCheckinsByDate = checkInsByDate
            .set(isoDate, checkInsByDate.get(isoDate, Map()).merge(checkInAppointmentMap));
          return state
            .set(CHECKINS_DATA.CHECK_INS_BY_DATE, nextCheckinsByDate)
            .set(CHECKINS_DATA.CHECK_INS_BY_ID, nextCheckInsById)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE], error)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE, action.id])
      });
    }

    case loadCheckInNeighbors.case(action.type): {
      return loadCheckInNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS, action.id], action)
          .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { checkInNeighborsById } = action.value;
          const nextCheckInNeighborsById = state.get(CHECKINS_DATA.CHECK_IN_NEIGHBORS_BY_ID, Map())
            .merge(checkInNeighborsById);
          return state
            .set(CHECKINS_DATA.CHECK_IN_NEIGHBORS_BY_ID, nextCheckInNeighborsById)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS, action.id])
      });
    }

    case RESET_CHECK_IN_ACTION: {
      const { actionType } = action.value;
      return state
        .setIn([REDUX.ACTIONS, actionType, REDUX.REQUEST_STATE], STANDBY)
        .setIn([REDUX.ERRORS, actionType], Map());
    }

    case SET_CHECK_IN_DATE: return state
      .set(CHECKINS_DATA.CHECK_INS_DATE, action.value.date);

    default:
      return state;
  }
}
