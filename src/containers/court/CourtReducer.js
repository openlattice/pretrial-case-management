/*
 * @flow
 */

import Immutable from 'immutable';

import { CHANGE_HEARING_FILTERS, loadHearingsToday } from './CourtActionFactory';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  hearingsToday: Immutable.List(),
  hearingsByTime: Immutable.Map(),
  hearingNeighborsById: Immutable.Map(),
  isLoadingHearings: false,
  loadingError: false,
  county: '',
  courtroom: ''
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case loadHearingsToday.case(action.type): {
      return loadHearingsToday.reducer(state, action, {
        REQUEST: () => state
          .set('hearingsToday', Immutable.List())
          .set('hearingsByTime', Immutable.Map())
          .set('hearingNeighborsById', Immutable.Map())
          .set('isLoadingHearings', true)
          .set('loadingError', false),
        SUCCESS: () => state
          .set('hearingsToday', action.value.hearingsToday)
          .set('hearingsByTime', action.value.hearingsByTime)
          .set('hearingNeighborsById', action.value.hearingNeighborsById)
          .set('loadingError', false),
        FAILURE: () => state
          .set('hearingsToday', Immutable.List())
          .set('hearingsByTime', Immutable.Map())
          .set('hearingNeighborsById', Immutable.Map())
          .set('loadingError', false),
        FINALLY: () => state.set('isLoadingHearings', false)
      });
    }

    case CHANGE_HEARING_FILTERS: {
      const { county, courtroom } = action.value;
      let newState = state;
      if (county || county === '') {
        newState = newState.set('county', county);
      }
      if (courtroom || courtroom === '') {
        newState = newState.set('courtroom', courtroom);
      }
      return newState;
    }

    default:
      return state;
  }
}
