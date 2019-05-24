/*
 * @flow
 */
import moment from 'moment';
import { Map, fromJS } from 'immutable';

import {
  CLEAR_HEARING_SETTINGS,
  CLOSE_HEARING_SETTINGS_MODAL,
  OPEN_HEARING_SETTINGS_MODAL,
  refreshHearingAndNeighbors,
  SET_HEARING_SETTINGS
} from './HearingsActionFactory';

import { HEARINGS } from '../../utils/consts/FrontEndStateConsts';


const INITIAL_STATE :Map<*, *> = fromJS({
  [HEARINGS.DATE]: moment().format('MM/DD/YYYY'),
  [HEARINGS.COURTROOM]: '',
  [HEARINGS.JUDGE]: '',
  [HEARINGS.REFRESHING_HEARING_AND_NEIGHBORS]: false,
  [HEARINGS.SETTINGS_MODAL_OPEN]: false,
  [HEARINGS.TIME]: '',
  [HEARINGS.UPDATED_HEARING]: Map(),
  [HEARINGS.UPDATED_HEARING_NEIGHBORS]: Map()
});

export default function hearingsReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case CLEAR_HEARING_SETTINGS: return INITIAL_STATE;

    case CLOSE_HEARING_SETTINGS_MODAL: return state.set(HEARINGS.SETTINGS_MODAL_OPEN, false);

    case OPEN_HEARING_SETTINGS_MODAL: return state.set(HEARINGS.SETTINGS_MODAL_OPEN, true);

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        REQUEST: () => state.set(HEARINGS.REFRESHING_HEARING_AND_NEIGHBORS, true),
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          return state
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

    default:
      return state;
  }
}
