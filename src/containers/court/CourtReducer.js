/*
 * @flow
 */

import Immutable from 'immutable';

import { CHANGE_HEARING_FILTERS, filterPeopleIdsWithOpenPSAs, loadHearingsForDate } from './CourtActionFactory';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  hearingsToday: Immutable.List(),
  hearingsByTime: Immutable.Map(),
  hearingNeighborsById: Immutable.Map(),
  peopleWithOpenPsas: Immutable.Set(),
  isLoadingHearings: false,
  loadingError: false,
  county: '',
  courtroom: ''
});

export default function reviewReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case filterPeopleIdsWithOpenPSAs.case(action.type): {
      return filterPeopleIdsWithOpenPSAs.reducer(state, action, {
        REQUEST: () => state.set('peopleWithOpenPsas', Immutable.Set()),
        SUCCESS: () => state.set('peopleWithOpenPsas', action.value),
        FAILURE: () => state.set('peopleWithOpenPsas', Immutable.Set())
      });
    }

    case loadHearingsForDate.case(action.type): {
      return loadHearingsForDate.reducer(state, action, {
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
