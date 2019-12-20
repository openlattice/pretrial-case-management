/*
 * @flow
 */

import {
  Map,
  Set,
  fromJS
} from 'immutable';

import {
  CHANGE_HEARING_FILTERS,
  filterPeopleIdsWithOpenPSAs
} from './CourtActionFactory';
import { changePSAStatus } from '../review/ReviewActions';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { COURT } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';


const INITIAL_STATE :Map<*, *> = fromJS({
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

    case SWITCH_ORGANIZATION: {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}
