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

import { filterPeopleIdsWithOpenPSAs } from '../court/CourtActionFactory';
import {
  CLEAR_HEARING_SETTINGS,
  CLEAR_SUBMITTED_HEARING,
  CLOSE_HEARING_SETTINGS_MODAL,
  loadHearingsForDate,
  loadHearingNeighbors,
  OPEN_HEARING_SETTINGS_MODAL,
  refreshHearingAndNeighbors,
  SET_COURT_DATE,
  SET_COURTROOM_FILTER,
  SET_COUNTY_FILTER,
  SET_HEARING_SETTINGS,
  SET_MANAGE_HEARINGS_DATE,
  submitExistingHearing,
  submitHearing,
  UPDATE_BULK_HEARINGS,
  updateBulkHearings,
  updateHearing
} from './HearingsActions';

import { TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

const { JUDGES } = APP_TYPES;
const {
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID
} = PROPERTY_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
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
    },
    [UPDATE_BULK_HEARINGS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE]: Map(),
    [HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS]: Map(),
    [HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS]: Map(),
    [HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING]: Map(),
    [HEARINGS_ACTIONS.SUBMIT_HEARING]: Map(),
    [UPDATE_BULK_HEARINGS]: Map(),
    [HEARINGS_ACTIONS.UPDATE_HEARING]: Map()
  },
  [HEARINGS_DATA.COURT_DATE]: DateTime.local(),
  [HEARINGS_DATA.MANAGE_HEARINGS_DATE]: DateTime.local(),
  [HEARINGS_DATA.COURTROOM]: '',
  [HEARINGS_DATA.COURTROOM_FILTER]: '',
  [HEARINGS_DATA.COUNTY_FILTER]: '',
  [HEARINGS_DATA.COURTROOMS_BY_COUNTY]: Map(),
  [HEARINGS_DATA.COURTROOM_OPTIONS]: Set(),
  [HEARINGS_DATA.DATE_TIME]: DateTime.local().toISO(),
  [HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME]: Map(),
  [HEARINGS_DATA.HEARINGS_BY_COUNTY]: Map(),
  [HEARINGS_DATA.HEARINGS_BY_COURTROOM]: Map(),
  [HEARINGS_DATA.HEARINGS_BY_ID]: Map(),
  [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: Map(),
  [HEARINGS_DATA.JUDGE]: '',
  [HEARINGS_DATA.SETTINGS_MODAL_OPEN]: false,
  [HEARINGS_DATA.SUBMITTED_HEARING]: Map(),
  [HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS]: Map(),
  [HEARINGS_DATA.TIME]: '',
  [HEARINGS_DATA.UPDATED_HEARING]: Map(),
  [HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS]: Map()
});

export default function hearingsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_HEARING_SETTINGS: return state
      .set(HEARINGS_DATA.DATE_TIME, DateTime.local().toISO())
      .set(HEARINGS_DATA.COURTROOM, '')
      .set(HEARINGS_DATA.JUDGE, '');

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

    case loadHearingsForDate.case(action.type): {
      return loadHearingsForDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, action.id], action)
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            courtrooms,
            hearingsById,
            hearingsByTime,
            hearingIdsByCourtroom,
            hearingDateTime,
          } = action.value;
          const currentHearingsById = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map());
          const nextHearingsById = currentHearingsById.merge(hearingsById);

          const hearingDate = hearingDateTime.toISODate();
          const currentHearingsByTime = state.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], Map());
          const nextHearingsByTime = currentHearingsByTime.merge(hearingsByTime);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, nextHearingsById)
            .set(HEARINGS_DATA.HEARINGS_BY_COURTROOM, hearingIdsByCourtroom)
            .setIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingDate], courtrooms)
            .setIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], nextHearingsByTime)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, action.id])
      });
    }

    case loadHearingNeighbors.case(action.type): {
      return loadHearingNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, action.id], action)
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            courtroomsByCounty,
            hearingDateTime,
            hearingNeighborsById,
            hearingIdsByCounty
          } = action.value;
          let newState = state;
          const currentHearingNeighborsById = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID);
          const nextHearingNeighborsById = currentHearingNeighborsById.merge(hearingNeighborsById);
          const countyFilter = state.get(HEARINGS_DATA.COUNTY_FILTER);
          const courtroomOptions = countyFilter
            ? courtroomsByCounty.get(countyFilter, Set())
            : courtroomsByCounty.valueSeq().flatten();
          if (hearingDateTime) {
            newState = newState
              .set(HEARINGS_DATA.COURTROOMS_BY_COUNTY, courtroomsByCounty)
              .set(HEARINGS_DATA.COURTROOM_OPTIONS, courtroomOptions)
              .set(HEARINGS_DATA.HEARINGS_BY_COUNTY, hearingIdsByCounty);
          }
          return newState
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, nextHearingNeighborsById)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
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
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS, action.id], action)
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
        dateTime,
        courtroom,
        judge
      } = action.value;
      return state
        .set(HEARINGS_DATA.DATE_TIME, dateTime)
        .set(HEARINGS_DATA.COURTROOM, courtroom)
        .set(HEARINGS_DATA.JUDGE, judge);
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, action.id], action)
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const {
            [COURTROOM]: hearingCourtroom,
            [DATE_TIME]: hearingDateTime,
            [ENTITY_KEY_ID]: hearingEntityKeyId
          } = getEntityProperties(hearing, [COURTROOM, DATE_TIME, ENTITY_KEY_ID]);

          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).set(hearingEntityKeyId, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .set(hearingEntityKeyId, hearingNeighborsByAppTypeFqn);

          const hearingISODate = DateTime.fromISO(hearingDateTime).toISODate();
          let hearingsByTime = state.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingISODate], Map());
          const hearingDateTimeDT = DateTime.fromISO(hearingDateTime);
          if (hearingDateTimeDT.isValid) {
            const time = hearingDateTimeDT.toFormat(TIME_FORMAT);
            hearingsByTime = hearingsByTime.set(
              time,
              hearingsByTime.get(time, List()).map((existingHearing) => {
                const existingHearingEKID = getEntityKeyId(existingHearing);
                if (existingHearingEKID === hearingEntityKeyId) return hearing;
                return existingHearing;
              })
            );
          }

          const nextCourtroomsForDate = state
            .getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingISODate], Set())
            .add(hearingCourtroom);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS_DATA.SUBMITTED_HEARING, hearing)
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingISODate], nextCourtroomsForDate)
            .setIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingISODate], hearingsByTime)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
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
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, action.id], action)
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const {
            [COURTROOM]: hearingCourtroom,
            [DATE_TIME]: hearingDateTime,
            [ENTITY_KEY_ID]: hearingEntityKeyId
          } = getEntityProperties(hearing, [COURTROOM, DATE_TIME, ENTITY_KEY_ID]);

          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).set(hearingEntityKeyId, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .set(hearingEntityKeyId, hearingNeighborsByAppTypeFqn);

          const hearingISODate = DateTime.fromISO(hearingDateTime).toISODate();
          let hearingsByTime = state.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingISODate], Map());
          const hearingDateTimeDT = DateTime.fromISO(hearingDateTime);
          if (hearingDateTimeDT.isValid) {
            const time = hearingDateTimeDT.toFormat(TIME_FORMAT);
            hearingsByTime = hearingsByTime.set(time, hearingsByTime.get(time, List()).push(hearing));
          }

          const nextCourtroomsForDate = state
            .getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingISODate], Set())
            .add(hearingCourtroom);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS_DATA.SUBMITTED_HEARING, hearing)
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingISODate], nextCourtroomsForDate)
            .setIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingISODate], hearingsByTime)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.SUBMIT_HEARING, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
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

    case SET_COURT_DATE: {
      const { courtDate } = action.value;
      return state.set(HEARINGS_DATA.COURT_DATE, courtDate);
    }

    case SET_COURTROOM_FILTER: {
      const { value } = action.value;
      return state.set(HEARINGS_DATA.COURTROOM_FILTER, value);
    }

    case SET_COUNTY_FILTER: {
      const { value } = action.value;
      const courtroomsByCounty = state.get(HEARINGS_DATA.COURTROOMS_BY_COUNTY);
      const courtroomOptions = value && courtroomsByCounty.size
        ? courtroomsByCounty.get(value, Set())
        : courtroomsByCounty.valueSeq().flatten();
      return state
        .set(HEARINGS_DATA.COURTROOM_OPTIONS, courtroomOptions)
        .set(HEARINGS_DATA.COUNTY_FILTER, value);
    }

    case SET_MANAGE_HEARINGS_DATE: {
      const { date } = action.value;
      return state.set(HEARINGS_DATA.MANAGE_HEARINGS_DATE, date);
    }

    case updateBulkHearings.case(action.type): {
      return updateBulkHearings.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, UPDATE_BULK_HEARINGS, action.id], action)
          .setIn([REDUX.ACTIONS, UPDATE_BULK_HEARINGS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            hearingEKIDs,
            newHearingData
          } = action.value;
          const newHearing = fromJS(newHearingData);
          const {
            [COURTROOM]: updatedHearingCourtroom,
            [DATE_TIME]: updatedHearingDateTime
          } = getEntityProperties(newHearing, [COURTROOM, DATE_TIME]);
          const updatedHearingDT = DateTime.fromISO(updatedHearingDateTime);
          const updatedHearingTime = updatedHearingDT.toFormat(TIME_FORMAT);
          const updatedHearingDate = updatedHearingDT.toISODate();
          const hearingsByDateAndTime = state.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, Map());
          const courtroomsByDate = state.get(HEARINGS_DATA.COURTROOMS_BY_DATE, Map());
          let nextHearingsByDateAndTime = hearingsByDateAndTime;
          let nextCourtroomsForDate = courtroomsByDate.get(updatedHearingDate, Set());
          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).withMutations((mutableHearingsMap) => {
            hearingEKIDs.forEach((hearingEKID) => {
              const oldHearing = mutableHearingsMap.get(hearingEKID, Map());
              const updatedHearing = oldHearing.merge(newHearing);
              mutableHearingsMap.set(hearingEKID, updatedHearing);

              const { [DATE_TIME]: oldHearingDateTime } = getEntityProperties(oldHearing, [COURTROOM, DATE_TIME]);

              const oldHearingDT = DateTime.fromISO(oldHearingDateTime);
              const oldHearingTime = oldHearingDT.toFormat(TIME_FORMAT);
              const oldHearingDate = oldHearingDT.toISODate();

              hearingsByDateAndTime.keySeq().forEach((date) => {
                let nextHearingsByTime = nextHearingsByDateAndTime.get(date, Map());
                const isOldHearingDate = date === oldHearingDate;
                const isNewHearingDate = date === updatedHearingDate;
                if (oldHearingDate !== updatedHearingDate || oldHearingDT !== updatedHearingTime) {
                  if (isNewHearingDate) {
                    const nextHearingsAtNewTime = nextHearingsByTime
                      .get(updatedHearingTime, List()).push(updatedHearing);
                    nextHearingsByTime = nextHearingsByTime.set(updatedHearingTime, nextHearingsAtNewTime);
                  }
                  if (isOldHearingDate) {
                    const nextHearingsAtOldTime = nextHearingsByDateAndTime
                      .get(oldHearingTime, List()).filter((existingHearing) => {
                        const {
                          [ENTITY_KEY_ID]: existingHearingEntityKeyId
                        } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
                        return (existingHearingEntityKeyId !== hearingEKID);
                      });
                    if (!nextHearingsAtOldTime.size) {
                      nextHearingsByTime = nextHearingsByTime.delete(oldHearingTime);
                    }
                    else {
                      nextHearingsByTime = nextHearingsByTime.set(oldHearingTime, nextHearingsAtOldTime);
                    }
                  }
                  nextHearingsByDateAndTime = nextHearingsByDateAndTime.set(date, nextHearingsByTime);
                }
              });
              nextCourtroomsForDate = nextCourtroomsForDate.add(updatedHearingCourtroom);
            });
          });

          const nextState = state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .setIn([HEARINGS_DATA.COURTROOMS_BY_DATE, updatedHearingDate], nextCourtroomsForDate)
            .setIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME], nextHearingsByDateAndTime)
            .setIn([REDUX.ACTIONS, UPDATE_BULK_HEARINGS, REDUX.REQUEST_STATE], SUCCESS);
          return nextState;
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, UPDATE_BULK_HEARINGS], error)
            .setIn([REDUX.ACTIONS, UPDATE_BULK_HEARINGS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, UPDATE_BULK_HEARINGS, action.id])
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, action.id], action)
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            hearingEKID,
            hearing,
            hearingJudge,
            oldHearingDateTime
          } = action.value;
          const hearingIsInactive = hearingIsCancelled(hearing);
          const hearingsMap = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map()).set(hearingEKID, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, Map())
            .setIn([hearingEKID, JUDGES], hearingJudge);
          const hearingNeighbors = hearingsNeighborsMap.get(hearingEKID);

          const {
            [COURTROOM]: updatedHearingCourtroom,
            [DATE_TIME]: updatedHearingDateTime
          } = getEntityProperties(hearing, [COURTROOM, DATE_TIME]);
          const updatedHearingDT = DateTime.fromISO(updatedHearingDateTime);
          const updatedHearingTime = updatedHearingDT.toFormat(TIME_FORMAT);
          const updatedHearingDate = updatedHearingDT.toISODate();
          let nextCourtroomsForDate = state
            .getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, updatedHearingDate], Set());

          const oldHearingDT = DateTime.fromISO(oldHearingDateTime);
          const oldHearingTime = oldHearingDT.toFormat(TIME_FORMAT);
          const oldHearingDate = oldHearingDT.toISODate();

          let nextHearingsByDateAndTime = state.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, Map());
          const hearingsByDateAndTime = state.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, Map());
          if (updatedHearingDT.isValid) {
            hearingsByDateAndTime.entrySeq().forEach(([date, hearingsByTime]) => {
              let nextHearingsByTime = hearingsByTime;
              const isOldHearingDate = date === oldHearingDate;
              const isNewHearingDate = date === updatedHearingDate;
              if (isNewHearingDate) {
                const nextHearingsAtNewTime = hearingsByTime.get(updatedHearingTime, List()).push(hearing);
                nextHearingsByTime = nextHearingsByTime.set(updatedHearingTime, nextHearingsAtNewTime);
              }
              if (isOldHearingDate || hearingIsInactive) {
                const nextHearingsAtOldTime = hearingsByTime.get(oldHearingTime, List()).filter((existingHearing) => {
                  const {
                    [ENTITY_KEY_ID]: existingHearingEntityKeyId
                  } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
                  return existingHearingEntityKeyId !== hearingEKID;
                });
                if (!nextHearingsAtOldTime.size) {
                  nextHearingsByTime = nextHearingsByTime.delete(oldHearingTime);
                }
                else {
                  nextHearingsByTime = nextHearingsByTime.set(oldHearingTime, nextHearingsAtOldTime);
                }
              }
              nextHearingsByDateAndTime = nextHearingsByDateAndTime.set(date, nextHearingsByTime);
            });
          }
          if (hearingIsInactive) {
            nextCourtroomsForDate = nextCourtroomsForDate.delete(updatedHearingCourtroom);
          }
          else {
            nextCourtroomsForDate = nextCourtroomsForDate.add(updatedHearingCourtroom);
          }

          const nextState = state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS_DATA.SUBMITTED_HEARING, hearing)
            .set(HEARINGS_DATA.SUBMITTED_HEARING_NEIGHBORS, hearingNeighbors)
            .set(HEARINGS_DATA.UPDATED_HEARING, hearing)
            .set(HEARINGS_DATA.UPDATED_HEARING_NEIGHBORS, hearingNeighbors)
            .setIn([HEARINGS_DATA.COURTROOMS_BY_DATE, updatedHearingDate], nextCourtroomsForDate)
            .setIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME], nextHearingsByDateAndTime)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, REDUX.REQUEST_STATE], SUCCESS);
          return nextState;
        },
        FAILURE: () => {
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
