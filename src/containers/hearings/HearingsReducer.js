/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import {
  CLEAR_HEARING_SETTINGS,
  CLOSE_HEARING_SETTINGS_MODAL,
  OPEN_HEARING_SETTINGS_MODAL,
  SET_HEARING_SETTINGS
} from './HearingsActionFactory';

import { HEARINGS } from '../../utils/consts/FrontEndStateConsts';


const INITIAL_STATE :Map<*, *> = fromJS({
  [HEARINGS.SETTINGS_MODAL_OPEN]: false,
  [HEARINGS.DATE]: '',
  [HEARINGS.TIME]: '',
  [HEARINGS.COURTROOM]: '',
  [HEARINGS.JUDGE]: ''
});
export default function subscriptionsReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case CLEAR_HEARING_SETTINGS: return INITIAL_STATE;

    case CLOSE_HEARING_SETTINGS_MODAL: return state.set(HEARINGS.SETTINGS_MODAL_OPEN, false);

    case OPEN_HEARING_SETTINGS_MODAL: return state.set(HEARINGS.SETTINGS_MODAL_OPEN, true);

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
