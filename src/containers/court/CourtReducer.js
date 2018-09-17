/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import { sortByDate } from '../../utils/PSAUtils';
import {
  CHANGE_HEARING_FILTERS,
  filterPeopleIdsWithOpenPSAs,
  loadHearingsForDate
} from './CourtActionFactory';
import { COURT, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';


const INITIAL_STATE :Immutable.Map<*, *> = Immutable.fromJS({
  [COURT.HEARINGS_TODAY]: Immutable.List(),
  [COURT.HEARINGS_BY_TIME]: Immutable.Map(),
  [COURT.HEARINGS_NEIGHBORS_BY_ID]: Immutable.Map(),
  [COURT.PEOPLE_WITH_OPEN_PSAS]: Immutable.Set(),
  [COURT.OPEN_PSAS]: Immutable.Map(),
  [COURT.OPEN_PSA_NEIGHBORS]: Immutable.Map(),
  [COURT.LOADING_HEARINGS]: false,
  [COURT.LOADING_PSAS]: false,
  [COURT.LOADING_ERROR]: false,
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
          let sortedNeighborsForOpenPSAs = Immutable.Map();
          filteredPersonIds.forEach((id) => {
            let neighborsByEntitySet = Immutable.Map();
            let latestCaseDate;
            let latestHearingDate;
            const allNeighbors = neighborsForOpenPSAs.get(id, Immutable.List());
            allNeighbors.forEach((neighbor) => {
              const entitySetName = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
              if (entitySetName === ENTITY_SETS.PSA_SCORES) {
                const status = Immutable.fromJS(neighbor).getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0], '');
                if (status === PSA_STATUSES.OPEN) {
                  neighborsByEntitySet = neighborsByEntitySet.set(
                    entitySetName,
                    neighborsByEntitySet.get(entitySetName, Immutable.List())
                      .push(Immutable.fromJS(neighbor)).sort((neighbor1, neighbor2) => sortByDate(
                        [1, neighbor1],
                        [2, neighbor2]
                      ))
                  );
                }
              }
              else if (entitySetName === ENTITY_SETS.MANUAL_PRETRIAL_CASES) {
                const caseDate =
                  neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0]) ||
                  neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.FILE_DATE, 0]);
                if (!latestCaseDate || moment(caseDate).isAfter(moment(latestCaseDate))) {
                  neighborsByEntitySet = neighborsByEntitySet.set(entitySetName, Immutable.fromJS(neighbor));
                  latestCaseDate = caseDate;
                }
              }
              else if (entitySetName === ENTITY_SETS.HEARINGS) {
                const hearingDate =
                  neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], '');
                if (!latestCaseDate || moment(hearingDate).isAfter(moment(latestHearingDate))) {
                  neighborsByEntitySet = neighborsByEntitySet.set(entitySetName, Immutable.fromJS(neighbor));
                  latestHearingDate = hearingDate;
                }
              }
              else {
                neighborsByEntitySet = neighborsByEntitySet.set(
                  entitySetName,
                  neighborsByEntitySet.get(entitySetName, Immutable.fromJS(neighbor))
                );
              }
            });
            sortedNeighborsForOpenPSAs = sortedNeighborsForOpenPSAs.set(id, Immutable.fromJS(neighborsByEntitySet));

          });
          return state.set(COURT.PEOPLE_WITH_OPEN_PSAS, Immutable.fromJS(action.value.filteredPersonIds))
            .set(COURT.OPEN_PSA_NEIGHBORS, sortedNeighborsForOpenPSAs);
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
