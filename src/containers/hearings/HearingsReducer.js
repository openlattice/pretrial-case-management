/*
 * @flow
 */
import moment from 'moment';
import { Map, fromJS } from 'immutable';

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
  submitHearing
} from './HearingsActionFactory';

import { HEARINGS } from '../../utils/consts/FrontEndStateConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [HEARINGS.DATE]: moment().format('MM/DD/YYYY'),
  [HEARINGS.COURTROOM]: '',
  [HEARINGS.JUDGE]: '',
  [HEARINGS.REFRESHING_HEARING_AND_NEIGHBORS]: false,
  [HEARINGS.SETTINGS_MODAL_OPEN]: false,
  [HEARINGS.TIME]: '',
  [HEARINGS.UPDATED_HEARING]: Map(),
  [HEARINGS.UPDATED_HEARING_NEIGHBORS]: Map(),
  [HEARINGS.HEARINGS_BY_ID]: Map(),
  [HEARINGS.HEARING_NEIGHBORS_BY_ID]: Map(),
  [HEARINGS.SUBMITTED_HEARING]: Map(),
  [HEARINGS.SUBMITTED_HEARING_NEIGHBORS]: Map(),
  [HEARINGS.SUBMITTING_HEARING]: false,
  [HEARINGS.SUBMISSION_ERROR]: false,
});

export default function hearingsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_HEARING_SETTINGS: return state
      .set(HEARINGS.DATE, moment().format('MM/DD/YYYY'))
      .set(HEARINGS.COURTROOM, '')
      .set(HEARINGS.JUDGE, '')
      .set(HEARINGS.TIME, '');

    case CLEAR_SUBMITTED_HEARING: return state
      .set(HEARINGS.SUBMITTED_HEARING, Map())
      .set(HEARINGS.SUBMITTED_HEARING_NEIGHBORS, Map());

    case CLOSE_HEARING_SETTINGS_MODAL: return state.set(HEARINGS.SETTINGS_MODAL_OPEN, false);

    case OPEN_HEARING_SETTINGS_MODAL: return state.set(HEARINGS.SETTINGS_MODAL_OPEN, true);

    case filterPeopleIdsWithOpenPSAs.case(action.type): {
      return filterPeopleIdsWithOpenPSAs.reducer(state, action, {
        SUCCESS: () => {
          const { hearingNeighborsById } = action.value;
          const currentHearingNeighborsState = state.get(HEARINGS.HEARING_NEIGHBORS_BY_ID);
          const newHearingNeighborsState = currentHearingNeighborsState.merge(hearingNeighborsById);
          return state.set(HEARINGS.HEARING_NEIGHBORS_BY_ID, newHearingNeighborsState);
        }
      });
    }

    case loadHearingNeighbors.case(action.type): {
      return loadHearingNeighbors.reducer(state, action, {
        REQUEST: () => state.set(HEARINGS.LOADING_HEARING_NEIGHBORS, true),
        SUCCESS: () => {
          const { hearingNeighborsById } = action.value;
          const currentState = state.get(HEARINGS.HEARING_NEIGHBORS_BY_ID);
          const newState = currentState.merge(hearingNeighborsById);
          return state.set(HEARINGS.HEARING_NEIGHBORS_BY_ID, newState);
        },
        FAILURE: () => state.set(HEARINGS.HEARING_NEIGHBORS_BY_ID, Map()),
        FINALLY: () => state.set(HEARINGS.LOADING_HEARING_NEIGHBORS, false)
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        REQUEST: () => state.set(HEARINGS.REFRESHING_HEARING_AND_NEIGHBORS, true),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const { [ENTITY_KEY_ID]: hearingEntityKeyId } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          return state
            .setIn([HEARINGS.HEARINGS_BY_ID, hearingEntityKeyId], hearing)
            .setIn([HEARINGS.HEARING_NEIGHBORS_BY_ID, hearingEntityKeyId], hearingNeighborsByAppTypeFqn)
            .set(HEARINGS.UPDATED_HEARING, hearing)
            .set(HEARINGS.UPDATED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(HEARINGS.REFRESHING_HEARING_AND_NEIGHBORS, false),
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
        .set(HEARINGS.DATE, date)
        .set(HEARINGS.TIME, time)
        .set(HEARINGS.COURTROOM, courtroom)
        .set(HEARINGS.JUDGE, judge);
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        REQUEST: () => state.set(HEARINGS.SUBMITTING_HEARING, true),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const { [ENTITY_KEY_ID]: hearingEntityKeyId } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          const hearingsMap = state.get(HEARINGS.HEARINGS_BY_ID, Map()).set(hearingEntityKeyId, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS.HEARING_NEIGHBORS_BY_ID, Map())
            .set(hearingEntityKeyId, hearingNeighborsByAppTypeFqn);

          return state
            .set(HEARINGS.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS.SUBMITTED_HEARING, hearing)
            .set(HEARINGS.SUBMITTED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        },
        FAILURE: () => state.set(HEARINGS.SUBMISSION_ERROR, action.value),
        FINALLY: () => state.set(HEARINGS.SUBMITTING_HEARING, false),
      });
    }

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        REQUEST: () => state.set(HEARINGS.SUBMITTING_HEARING, true),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const { [ENTITY_KEY_ID]: hearingEntityKeyId } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          const hearingsMap = state.get(HEARINGS.HEARINGS_BY_ID, Map()).set(hearingEntityKeyId, hearing);
          const hearingsNeighborsMap = state.get(HEARINGS.HEARING_NEIGHBORS_BY_ID, Map())
            .set(hearingEntityKeyId, hearingNeighborsByAppTypeFqn);

          return state
            .set(HEARINGS.HEARINGS_BY_ID, hearingsMap)
            .set(HEARINGS.HEARING_NEIGHBORS_BY_ID, hearingsNeighborsMap)
            .set(HEARINGS.SUBMITTED_HEARING, hearing)
            .set(HEARINGS.SUBMITTED_HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        },
        FAILURE: () => state.set(HEARINGS.SUBMISSION_ERROR, action.value),
        FINALLY: () => state.set(HEARINGS.SUBMITTING_HEARING, false),
      });
    }

    default:
      return state;
  }
}
