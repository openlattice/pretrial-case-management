/*
 * @flow
 */

import Immutable, { Map, Set, List } from 'immutable';
import { Constants } from 'lattice';

import { sortByDate } from '../../utils/PSAUtils';
import {
  CHANGE_HEARING_FILTERS,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate,
  loadHearingNeighbors,
  refreshHearingNeighbors,
  loadJudges
} from './CourtActionFactory';
import { COURT, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';

const { OPENLATTICE_ID_FQN } = Constants;

const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  // Hearings
  [COURT.LOADING_HEARINGS]: false,
  [COURT.HEARINGS_TODAY]: Immutable.List(),
  [COURT.HEARINGS_BY_TIME]: Immutable.Map(),
  [COURT.LOADING_ERROR]: false,

  // Hearings Neighbors
  [COURT.LOADING_HEARING_NEIGHBORS]: false,
  [COURT.HEARINGS_NEIGHBORS_BY_ID]: Immutable.Map(),
  [COURT.HEARING_IDS_REFRESHING]: false,
  [COURT.LOADING_HEARINGS_ERROR]: false,

  // People
  [COURT.PEOPLE_WITH_OPEN_PSAS]: Immutable.Set(),
  [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: Immutable.Map(),

  // Open PSAs + Neighbors
  [COURT.LOADING_PSAS]: false,
  [COURT.OPEN_PSAS]: Immutable.Map(),
  [COURT.OPEN_PSA_IDS]: Immutable.Set(),
  [COURT.OPEN_PSA_NEIGHBORS]: Immutable.Map(),

  // JUDGES
  [COURT.ALL_JUDGES]: Immutable.Map(),
  [COURT.LOADING_JUDGES]: false,
  [COURT.LOADING_JUDGES_ERROR]: false,

  [COURT.COUNTY]: '',
  [COURT.COURTROOM]: ''
});

export default function courtReducer(state :Immutable.Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case filterPeopleIdsWithOpenPSAs.case(action.type): {
      return filterPeopleIdsWithOpenPSAs.reducer(state, action, {
        REQUEST: () => state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Immutable.Set())
          .set(COURT.OPEN_PSA_NEIGHBORS, Immutable.Map())
          .set(COURT.LOADING_PSAS, true),
        SUCCESS: () => {
          const { filteredPersonIds, neighborsForOpenPSAs } = action.value;
          let openPSAIds = Immutable.Set();
          let personIdsToPSAIds = Immutable.Map();
          let sortedNeighborsForOpenPSAs = Immutable.Map();
          filteredPersonIds.forEach((id) => {
            let neighborsByEntitySet = Immutable.Map();
            const allNeighbors = neighborsForOpenPSAs.get(id, Immutable.List());
            allNeighbors.forEach((neighbor) => {
              const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
              if (entitySetName === ENTITY_SETS.PSA_SCORES) {
                const status = Immutable.fromJS(neighbor).getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0], '');
                if (status === PSA_STATUSES.OPEN) {
                  if (neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0])) {
                    openPSAIds = openPSAIds.add(neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]));
                  }

                  neighborsByEntitySet = neighborsByEntitySet.set(
                    entitySetName,
                    neighborsByEntitySet.get(entitySetName, Immutable.List())
                      .push(Immutable.fromJS(neighbor)).sort((neighbor1, neighbor2) => sortByDate(
                        [1, neighbor1],
                        [2, neighbor2]
                      ))
                  );
                  personIdsToPSAIds = personIdsToPSAIds.set(id,
                    neighborsByEntitySet.getIn([entitySetName, 0, PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]));
                }
              }
            });
            sortedNeighborsForOpenPSAs = sortedNeighborsForOpenPSAs.set(id, Immutable.fromJS(neighborsByEntitySet));

          });
          return state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Immutable.fromJS(action.value.filteredPersonIds))
            .set(COURT.OPEN_PSA_NEIGHBORS, sortedNeighborsForOpenPSAs)
            .set(COURT.OPEN_PSA_IDS, openPSAIds)
            .set(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS, personIdsToPSAIds);
        },
        FAILURE: () => state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Immutable.Set())
          .set(COURT.OPEN_PSA_NEIGHBORS, Immutable.Map()),
        FINALLY: () => state.set(COURT.LOADING_PSAS, false)
      });
    }

    case loadHearingsForDate.case(action.type): {
      return loadHearingsForDate.reducer(state, action, {
        REQUEST: () => state
          .set(COURT.HEARINGS_TODAY, Immutable.List())
          .set(COURT.HEARINGS_BY_TIME, Immutable.Map())
          .set(COURT.LOADING_HEARINGS, true)
          .set(COURT.LOADING_ERROR, false),
        SUCCESS: () => state
          .set(COURT.HEARINGS_TODAY, action.value.hearingsToday)
          .set(COURT.HEARINGS_BY_TIME, action.value.hearingsByTime)
          .set(COURT.LOADING_ERROR, false),
        FAILURE: () => state
          .set(COURT.HEARINGS_TODAY, Immutable.List())
          .set(COURT.HEARINGS_BY_TIME, Immutable.Map())
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

    case loadHearingNeighbors.case(action.type): {
      return loadHearingNeighbors.reducer(state, action, {
        REQUEST: () => state
          .set(COURT.LOADING_HEARING_NEIGHBORS, true)
          .set(COURT.LOADING_HEARINGS_ERROR, false),
        SUCCESS: () => {
          const currentState = state.get(COURT.HEARINGS_NEIGHBORS_BY_ID);
          const newState = currentState.merge(action.value.hearingNeighborsById);
          return (
            state
              .set(COURT.HEARINGS_NEIGHBORS_BY_ID, newState)
              .set(COURT.LOADING_HEARINGS_ERROR, false)
          );
        },
        FAILURE: () => state
          .set(COURT.HEARINGS_NEIGHBORS_BY_ID, Immutable.Map())
          .set(COURT.LOADING_HEARINGS_ERROR, false),
        FINALLY: () => state.set(COURT.LOADING_HEARING_NEIGHBORS, false)
      });
    }

    case refreshHearingNeighbors.case(action.type): {
      return refreshHearingNeighbors.reducer(state, action, {
        REQUEST: () => state.set(COURT.HEARING_IDS_REFRESHING, true),
        SUCCESS: () => {
          let hearingNeighborsById = state.get(COURT.HEARINGS_NEIGHBORS_BY_ID);

          hearingNeighborsById = hearingNeighborsById.set(action.value.id, action.value.neighbors);

          return state.set(COURT.HEARINGS_NEIGHBORS_BY_ID, hearingNeighborsById);
        },
        FINALLY: () => state.set(COURT.HEARING_IDS_REFRESHING, false),
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
          .set(COURT.ALL_JUDGES, Immutable.Map())
          .set(COURT.LOADING_JUDGES_ERROR, action.error),
        FINALLY: () => state.set(COURT.LOADING_JUDGES, false)
      });
    }

    default:
      return state;
  }
}
