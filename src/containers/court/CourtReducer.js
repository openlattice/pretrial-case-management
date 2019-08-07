/*
 * @flow
 */

import { DateTime } from 'luxon';
import {
  Map,
  Set,
  List,
  fromJS
} from 'immutable';

import {
  CHANGE_HEARING_FILTERS,
  filterPeopleIdsWithOpenPSAs,
  loadJudges,
  SET_COURT_DATE
} from './CourtActionFactory';
import {
  loadHearingsForDate,
  refreshHearingAndNeighbors,
  submitExistingHearing,
  submitHearing,
  updateHearing
} from '../hearings/HearingsActions';
import { changePSAStatus } from '../review/ReviewActionFactory';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { COURT } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { getEntityProperties } from '../../utils/DataUtils';
import { TIME_FORMAT } from '../../utils/consts/DateTimeConsts';

const { DATE_TIME, ENTITY_KEY_ID } = PROPERTY_TYPES;


const INITIAL_STATE :Map<*, *> = fromJS({
  [COURT.COURT_DATE]: DateTime.local(),
  [COURT.COUNTY]: '',
  [COURT.COURTROOM]: '',

  // People
  [COURT.PEOPLE_WITH_OPEN_PSAS]: Set(),
  [COURT.PEOPLE_RECEIVING_REMINDERS]: Set(),
  [COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS]: Set(),
  [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: Map(),

  // Open PSAs + Neighbors
  [COURT.LOADING_PSAS]: false,
  [COURT.OPEN_PSAS]: Map(),
  [COURT.PSA_EDIT_DATES]: Map(),
  [COURT.OPEN_PSA_IDS]: Set(),
  [COURT.SCORES_AS_MAP]: Map(),

  // JUDGES
  [COURT.ALL_JUDGES]: Map(),
  [COURT.LOADING_JUDGES]: false,
  [COURT.LOADING_JUDGES_ERROR]: false,

  // Hearings
  [COURT.COURTROOMS]: Set()
});

export default function courtReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          let peopleWithOpenPSAs = state.get(COURT.PEOPLE_WITH_OPEN_PSAS);
          const { entity } = action.value;
          const status = entity[PROPERTY_TYPES.STATUS][0];
          const psaIsClosed = status !== PSA_STATUSES.OPEN;
          state.get(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS).entrySeq().forEach(([personId, psaId]) => {
            if (psaIsClosed && psaId === action.value.id) peopleWithOpenPSAs = peopleWithOpenPSAs.delete(personId);
          });
          return state
            .set(COURT.SCORES_AS_MAP, state.get(COURT.SCORES_AS_MAP).set(action.value.id, fromJS(action.value.entity)))
            .set(COURT.PEOPLE_WITH_OPEN_PSAS, peopleWithOpenPSAs);
        }
      });
    }

    case filterPeopleIdsWithOpenPSAs.case(action.type): {
      return filterPeopleIdsWithOpenPSAs.reducer(state, action, {
        REQUEST: () => state
          .set(COURT.PEOPLE_WITH_OPEN_PSAS, Set())
          .set(COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS, Set())
          .set(COURT.SCORES_AS_MAP, Map())
          .set(COURT.LOADING_PSAS, true),
        SUCCESS: () => {
          const {
            filteredPersonIds,
            scoresAsMap,
            personIdsToOpenPSAIds,
            personIdsWhoAreSubscribed,
            openPSAIds,
            peopleWithMultiplePSAs,
            psaIdToMostRecentEditDate
          } = action.value;
          return state
            .set(COURT.PEOPLE_WITH_OPEN_PSAS, fromJS(filteredPersonIds))
            .set(COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS, peopleWithMultiplePSAs)
            .set(COURT.PEOPLE_RECEIVING_REMINDERS, personIdsWhoAreSubscribed)
            .set(COURT.PSA_EDIT_DATES, fromJS(psaIdToMostRecentEditDate))
            .set(COURT.SCORES_AS_MAP, scoresAsMap)
            .set(COURT.OPEN_PSA_IDS, openPSAIds)
            .set(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS, personIdsToOpenPSAIds);
        },
        FAILURE: () => state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Set())
          .set(COURT.SCORES_AS_MAP, Map()),
        FINALLY: () => state.set(COURT.LOADING_PSAS, false)
      });
    }

    case loadHearingsForDate.case(action.type): {
      return loadHearingsForDate.reducer(state, action, {
        REQUEST: () => state.set(COURT.COURTROOMS, Set()),
        SUCCESS: () => state.set(COURT.COURTROOMS, action.value.courtrooms),
        FAILURE: () => state.set(COURT.COURTROOMS, Set())
      });
    }

    case CHANGE_HEARING_FILTERS: {
      const { county, courtroom } = action.value;
      let newState = state;
      if (county || county === '') {
        newState = newState.set(COURT.COUNTY, county);
      }
      if (courtroom || courtroom === '') {
        newState = newState.set(COURT.COURTROOM, courtroom);
      }
      return newState;
    }

    case SET_COURT_DATE: {
      const { courtDate } = action.value;
      return state.set(COURT.COURT_DATE, courtDate);
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingEntityKeyId } = action.value;
          const {
            [DATE_TIME]: updatedHearingDateTime,
          } = getEntityProperties(hearing, [DATE_TIME]);
          const updateHearingDateTimeDT = DateTime.fromISO(updatedHearingDateTime);
          const hearingTime = updateHearingDateTimeDT.toFormat(TIME_FORMAT);
          const courtDate = state.get(COURT.COURT_DATE);
          let hearingsByTime = state.get(COURT.HEARINGS_BY_TIME, Map());
          hearingsByTime.entrySeq().forEach(([time, hearings]) => {
            const filteredHearings = hearings.filter((existingHearing) => {
              const {
                [ENTITY_KEY_ID]: existingHearingEntityKeyId,
                [DATE_TIME]: hearingDateTime,
              } = getEntityProperties(existingHearing, [ENTITY_KEY_ID, DATE_TIME]);
              const hearingDT = DateTime.fromISO(hearingDateTime);
              const refreshedHearing = (existingHearingEntityKeyId === hearingEntityKeyId) ? hearing : null;
              if (refreshedHearing) {
                return courtDate.hasSame(hearingDT, 'day') && updateHearingDateTimeDT.hasSame(hearingDT, 'minute');
              }
              return true;
            });
            if (!filteredHearings.size) {
              hearingsByTime = hearingsByTime.delete(time);
            }
            else {
              hearingsByTime = hearingsByTime.set(time, filteredHearings);
            }
          });
          const hearingsAtTimeOfRefreshedHearing = hearingsByTime.get(hearingTime, List());
          const hearingIsInCorrectTime = hearingsAtTimeOfRefreshedHearing.some((existingHearing) => {
            const {
              [ENTITY_KEY_ID]: existingHearingEntityKeyId
            } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
            return existingHearingEntityKeyId === hearingEntityKeyId;
          });
          if (!hearingIsInCorrectTime) {
            hearingsByTime = hearingsByTime.set(
              hearingTime,
              hearingsAtTimeOfRefreshedHearing.push(hearing)
            );
          }
          return state
            .set(COURT.HEARINGS_BY_TIME, hearingsByTime);
        },
      });
    }

    case loadJudges.case(action.type): {
      return loadJudges.reducer(state, action, {
        REQUEST: () => state.set(COURT.LOADING_JUDGES, true),
        SUCCESS: () => {
          const { allJudges } = action.value;
          return state.set(COURT.ALL_JUDGES, allJudges);
        },
        FAILURE: () => state
          .set(COURT.ALL_JUDGES, Map())
          .set(COURT.LOADING_JUDGES_ERROR, action.error),
        FINALLY: () => state.set(COURT.LOADING_JUDGES, false)
      });
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing } = action.value;
          const courtDate = state.get(COURT.COURT_DATE);
          let hearingsByTime = state.get(COURT.HEARINGS_BY_TIME, Map());
          const { [DATE_TIME]: hearingDateTime } = getEntityProperties(hearing, [DATE_TIME]);
          const hearingDateTimeMoment = DateTime.fromISO(hearingDateTime);
          if (hearingDateTimeMoment.hasSame(courtDate, 'day')) {
            const time = hearingDateTimeMoment.format(TIME_FORMAT);
            hearingsByTime = hearingsByTime.set(time, hearingsByTime.get(time, List()).push(hearing));
          }
          return state.set(COURT.HEARINGS_BY_TIME, hearingsByTime);
        }
      });
    }

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing } = action.value;
          const courtDate = state.get(COURT.COURT_DATE);
          let hearingsByTime = state.get(COURT.HEARINGS_BY_TIME, Map());
          const { [DATE_TIME]: hearingDateTime } = getEntityProperties(hearing, [DATE_TIME]);
          const hearingDateTimeMoment = DateTime.fromISO(hearingDateTime);
          if (hearingDateTimeMoment.hasSame(courtDate, 'day')) {
            const time = hearingDateTimeMoment.format(TIME_FORMAT);
            hearingsByTime = hearingsByTime.set(time, hearingsByTime.get(time, List()).push(hearing));
          }
          return state.set(COURT.HEARINGS_BY_TIME, hearingsByTime);
        }
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingEKID } = action.value;
          const courtDate = state.get(COURT.COURT_DATE);
          const { [DATE_TIME]: updatedHearingDateTime } = getEntityProperties(hearing, [DATE_TIME]);
          const updatedHearingDT = DateTime.fromISO(updatedHearingDateTime);
          const hearingTime = updatedHearingDT.toFormat(TIME_FORMAT);

          let hearingsByTime = state.get(COURT.HEARINGS_BY_TIME, Map());
          if (updatedHearingDT.hasSame(courtDate, 'day')) {
            hearingsByTime.entrySeq().forEach(([time, hearings]) => {
              const filteredHearings = hearings.filter((existingHearing) => {
                const {
                  [ENTITY_KEY_ID]: existingHearingEntityKeyId,
                  [DATE_TIME]: existingHearingDateTime,
                } = getEntityProperties(existingHearing, [ENTITY_KEY_ID, DATE_TIME]);
                const hearingDT = DateTime.fromISO(existingHearingDateTime);
                const refreshedHearing = (existingHearingEntityKeyId === hearingEKID) ? hearing : null;
                if (refreshedHearing) {
                  return courtDate.hasSame(hearingDT, 'day') && updatedHearingDT.hasSame(hearingDT, 'minute');
                }
                return true;
              });
              if (!filteredHearings.size) {
                hearingsByTime = hearingsByTime.delete(time);
              }
              else {
                hearingsByTime = hearingsByTime.set(time, filteredHearings);
              }
            });
            const hearingsAtTimeOfRefreshedHearing = hearingsByTime.get(hearingTime, List());
            const hearingIsInCorrectTime = hearingsAtTimeOfRefreshedHearing.some((existingHearing) => {
              const {
                [ENTITY_KEY_ID]: existingHearingEntityKeyId
              } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
              return existingHearingEntityKeyId === hearingEKID;
            });
            if (!hearingIsInCorrectTime) {
              hearingsByTime = hearingsByTime.set(
                hearingTime,
                hearingsAtTimeOfRefreshedHearing.push(hearing)
              );
            }
          }
          return state
            .set(COURT.HEARINGS_BY_TIME, hearingsByTime);
        }
      });
    }

    case SWITCH_ORGANIZATION: {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}
