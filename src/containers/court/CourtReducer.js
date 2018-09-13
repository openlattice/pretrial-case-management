/*
 * @flow
 */

import Immutable from 'immutable';

import {
  CHANGE_HEARING_FILTERS,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate
} from './CourtActionFactory';
import { COURT, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [COURT.HEARINGS_TODAY]: Immutable.List(),
  [COURT.HEARINGS_BY_TIME]: Immutable.Map(),
  [COURT.HEARINGS_NEIGHBORS_BY_ID]: Immutable.Map(),
  [COURT.PEOPLE_WITH_OPEN_PSAS]: Immutable.Set(),
  [COURT.OPEN_PSAS]: Immutable.Map(),
  [COURT.OPEN_PSA_NEIGHBORS]: Immutable.Map(),
  [COURT.LOADING_HEARINGS]: false,
  [COURT.LOADING_ERROR]: false,
  [COURT.COUNTY]: '',
  [COURT.COURTROOM]: ''
});

export default function courtReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case filterPeopleIdsWithOpenPSAs.case(action.type): {
      return filterPeopleIdsWithOpenPSAs.reducer(state, action, {
        REQUEST: () => state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Immutable.Set())
          .set(COURT.OPEN_PSA_NEIGHBORS, Immutable.Map()),
        SUCCESS: () => {
          const { filteredPersonIds, neighborsForOpenPSAs } = action.value;
          let sortedNeighborsForOpenPSAs = Immutable.Map();
          filteredPersonIds.forEach((id) => {
            let neighborsByEntitySet = Immutable.Map();
            const allNeighbors = neighborsForOpenPSAs.get(id, Immutable.List());
            allNeighbors.forEach((neighbor) => {
              const entitySetName = Immutable.fromJS(neighbor).getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
              neighborsByEntitySet = neighborsByEntitySet.set(
                entitySetName,
                neighborsByEntitySet.get(entitySetName, Immutable.List()).push(neighbor)
              );
            });
            sortedNeighborsForOpenPSAs = sortedNeighborsForOpenPSAs.set(id, neighborsByEntitySet);
          });
          return state.set(COURT.PEOPLE_WITH_OPEN_PSAS, action.value.filteredPersonIds)
            .set(COURT.OPEN_PSA_NEIGHBORS, sortedNeighborsForOpenPSAs)
        },
        FAILURE: () => state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Immutable.Set())
      });
    }

    case loadHearingsForDate.case(action.type): {
      return loadHearingsForDate.reducer(state, action, {
        REQUEST: () => state
          .set(COURT.HEARINGS_TODAY, Immutable.List())
          .set(COURT.HEARINGS_BY_TIME, Immutable.Map())
          .set(COURT.HEARINGS_NEIGHBORS_BY_ID, Immutable.Map())
          .set(COURT.LOADING_HEARINGS, true)
          .set(COURT.LOADING_ERROR, false),
        SUCCESS: () => state
          .set(COURT.HEARINGS_TODAY, action.value.hearingsToday)
          .set(COURT.HEARINGS_BY_TIME, action.value.hearingsByTime)
          .set(COURT.HEARINGS_NEIGHBORS_BY_ID, action.value.hearingNeighborsById)
          .set(COURT.LOADING_ERROR, false),
        FAILURE: () => state
          .set(COURT.HEARINGS_TODAY, Immutable.List())
          .set(COURT.HEARINGS_BY_TIME, Immutable.Map())
          .set(COURT.HEARINGS_NEIGHBORS_BY_ID, Immutable.Map())
          .set(COURT.LOADING_ERROR, false),
        FINALLY: () => state.set(COURT.LOADING_HEARINGS, false)
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

    default:
      return state;
  }
}
