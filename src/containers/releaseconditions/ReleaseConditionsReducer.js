/*
 * @flow
 */
import { Map, fromJS } from 'immutable';

import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RELEASE_COND } from '../../utils/consts/FrontEndStateConsts';
import { refreshHearingNeighbors } from '../court/CourtActionFactory';
import {
  CLEAR_RELEASE_CONDITIONS,
  loadReleaseConditions,
  updateOutcomesAndReleaseCondtions
} from './ReleaseConditionsActionFactory';

let { OUTCOMES, DMF_RESULTS } = APP_TYPES_FQNS;

OUTCOMES = OUTCOMES.toString();
DMF_RESULTS = DMF_RESULTS.toString();

const INITIAL_STATE :Map<*, *> = fromJS({
  [RELEASE_COND.SELECTED_HEARING]: Map(),
  [RELEASE_COND.HAS_OUTCOME]: false,
  [RELEASE_COND.HEARING_NEIGHBORS]: Map(),
  [RELEASE_COND.PERSON_NEIGHBORS]: Map(),
  [RELEASE_COND.PSA_NEIGHBORS]: Map(),
  [RELEASE_COND.LOADING_RELEASE_CONDITIONS]: false,
  [RELEASE_COND.REFRESHING_RELEASE_CONDITIONS]: false
});

export default function releaseConditionsReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

    case CLEAR_RELEASE_CONDITIONS:
      return INITIAL_STATE;

    case loadReleaseConditions.case(action.type): {
      return loadReleaseConditions.reducer(state, action, {
        REQUEST: () => state.set(RELEASE_COND.LOADING_RELEASE_CONDITIONS, true),
        SUCCESS: () => {
          const {
            hearing,
            hearingNeighborsByAppTypeFqn,
            personNeighborsByAppTypeFqn,
            psaNeighborsByAppTypeFqn,
          } = action.value;
          const dmfEntity = psaNeighborsByAppTypeFqn.get(DMF_RESULTS, Map());
          const outcomeEntity = hearingNeighborsByAppTypeFqn.get(OUTCOMES, Map());

          const oldOutcome = dmfEntity.getIn([PROPERTY_TYPES.OUTCOME, 0]);

          const hasOutcome = !!(oldOutcome || outcomeEntity.size);

          return state
            .set(RELEASE_COND.SELECTED_HEARING, hearing)
            .set(RELEASE_COND.HAS_OUTCOME, hasOutcome)
            .set(RELEASE_COND.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .set(RELEASE_COND.PERSON_NEIGHBORS, personNeighborsByAppTypeFqn)
            .set(RELEASE_COND.PSA_NEIGHBORS, psaNeighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(RELEASE_COND.LOADING_RELEASE_CONDITIONS, false),
      });
    }

    case updateOutcomesAndReleaseCondtions.case(action.type): {
      return updateOutcomesAndReleaseCondtions.reducer(state, action, {
        REQUEST: () => state.set(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS, true),
        SUCCESS: () => {
          const { hearingNeighborsByAppTypeFqn } = action.value;

          return state.set(RELEASE_COND.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS, false),
      });
    }

    case refreshHearingNeighbors.case(action.type): {
      return refreshHearingNeighbors.reducer(state, action, {
        REQUEST: () => state.set(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS, true),
        SUCCESS: () => {
          const { neighbors } = action.value;
          const outcomeEntity = neighbors.get(OUTCOMES, Map());

          return state
            .set(RELEASE_COND.HAS_OUTCOME, !!outcomeEntity.size)
            .set(RELEASE_COND.HEARING_NEIGHBORS, neighbors);
        },
        FINALLY: () => state.set(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS, false),
      });
    }


    default:
      return state;
  }
}
