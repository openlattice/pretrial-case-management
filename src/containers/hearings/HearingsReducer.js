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
  loadJudges,
  OPEN_HEARING_SETTINGS_MODAL,
  refreshHearingAndNeighbors,
  SET_COURT_DATE,
  SET_HEARING_SETTINGS,
  submitExistingHearing,
  submitHearing,
  updateHearing
} from './HearingsActions';

import { DATE_FORMAT, TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';


import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

const { JUDGES } = APP_TYPES;
const { COURTROOM, DATE_TIME, ENTITY_KEY_ID } = PROPERTY_TYPES;

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
    [HEARINGS_ACTIONS.LOAD_JUDGES]: {
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
    [HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE]: Map(),
    [HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS]: Map(),
    [HEARINGS_ACTIONS.LOAD_JUDGES]: Map(),
    [HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS]: Map(),
    [HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING]: Map(),
    [HEARINGS_ACTIONS.SUBMIT_HEARING]: Map(),
    [HEARINGS_ACTIONS.UPDATE_HEARING]: Map()
  },
  [HEARINGS_DATA.ALL_JUDGES]: Map(),
  [HEARINGS_DATA.COURT_DATE]: DateTime.local(),
  [HEARINGS_DATA.COURTROOM]: '',
  [HEARINGS_DATA.COURTROOMS_BY_DATE]: Map(),
  [HEARINGS_DATA.DATE]: DateTime.local().toFormat(DATE_FORMAT),
  [HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME]: Map(),
  [HEARINGS_DATA.HEARINGS_BY_COUNTY]: Map(),
  [HEARINGS_DATA.HEARINGS_BY_ID]: Map(),
  [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: Map(),
  [HEARINGS_DATA.JUDGE]: '',
  [HEARINGS_DATA.JUDGES_BY_ID]: Map(),
  [HEARINGS_DATA.JUDGES_BY_COUNTY]: Map(),
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
      .set(HEARINGS_DATA.DATE, DateTime.local().toISODate())
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

    case loadHearingsForDate.case(action.type): {
      return loadHearingsForDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            courtrooms,
            hearingsById,
            hearingsByTime,
            hearingDateTime,
          } = action.value;
          const currentHearingsById = state.get(HEARINGS_DATA.HEARINGS_BY_ID, Map());
          const nextHearingsById = currentHearingsById.merge(hearingsById);

          const hearingDate = hearingDateTime.toISODate();
          const currentHearingsByTime = state.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], Map());
          const nextHearingsByTime = currentHearingsByTime.merge(hearingsByTime);

          return state
            .set(HEARINGS_DATA.HEARINGS_BY_ID, nextHearingsById)
            .setIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingDate], courtrooms)
            .setIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], nextHearingsByTime)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
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
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { hearingNeighborsById, hearingIdsByCounty } = action.value;
          const currentState = state.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID);
          const newState = currentState.merge(hearingNeighborsById);
          return state
            .set(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID, newState)
            .set(HEARINGS_DATA.HEARINGS_BY_COUNTY, hearingIdsByCounty)
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

    case loadJudges.case(action.type): {
      return loadJudges.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_JUDGES, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_JUDGES, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            allJudges,
            judgesByCounty,
            judgesById
          } = action.value;
          return state
            .set(HEARINGS_DATA.ALL_JUDGES, allJudges)
            .set(HEARINGS_DATA.JUDGES_BY_COUNTY, judgesByCounty)
            .set(HEARINGS_DATA.JUDGES_BY_ID, judgesById)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_JUDGES, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(HEARINGS_DATA.ALL_JUDGES, Map())
            .set(HEARINGS_DATA.JUDGES_BY_COUNTY, Map())
            .set(HEARINGS_DATA.JUDGES_BY_ID, Map())
            .setIn([REDUX.ERRORS, HEARINGS_ACTIONS.LOAD_JUDGES], error)
            .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_JUDGES, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, HEARINGS_ACTIONS.LOAD_JUDGES, action.id])
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

    case SET_COURT_DATE: {
      const { courtDate } = action.value;
      return state.set(HEARINGS_DATA.COURT_DATE, courtDate);
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, HEARINGS_ACTIONS.UPDATE_HEARING, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            hearingEKID,
            hearing,
            hearingJudge,
            oldHearingDateTime
          } = action.value;
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

          const oldHearingDT = DateTime.fromISO(oldHearingDateTime);
          const oldHearingTime = oldHearingDT.toFormat(TIME_FORMAT);
          const oldHearingDate = oldHearingDT.toISODate();

          let nextHearingsByDateAndTime = state.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, Map());
          const hearingsByDateAndTime = state.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, Map());
          if (updatedHearingDT.isValid) {
            hearingsByDateAndTime.entrySeq().forEach(([date, hearingsByTime]) => {
              let nextHearingsByTime = Map();
              const isOldHearingDate = date === oldHearingDate;
              const isNewHearingDate = date === updatedHearingDate;
              if (isNewHearingDate) {
                const nextHearingsAtNewTime = hearingsByTime.get(updatedHearingTime, List()).push(hearing);
                nextHearingsByTime = nextHearingsByTime.set(updatedHearingTime, nextHearingsAtNewTime);
              }
              if (isOldHearingDate) {
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

          const nextCourtroomsForDate = state
            .getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, updatedHearingDate], Set())
            .add(updatedHearingCourtroom);

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
