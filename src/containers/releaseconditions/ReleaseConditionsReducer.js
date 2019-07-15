/*
 * @flow
 */
import { List, Map, fromJS } from 'immutable';
import { Constants } from 'lattice';

import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RELEASE_COND } from '../../utils/consts/FrontEndStateConsts';
import { deleteEntity } from '../../utils/data/DataActionFactory';
import { updateHearing, refreshHearingAndNeighbors, submitHearing } from '../hearings/HearingsActionFactory';
import { refreshPSANeighbors } from '../review/ReviewActionFactory';
import {
  CLEAR_RELEASE_CONDITIONS,
  loadReleaseConditions,
  submitReleaseConditions,
  updateOutcomesAndReleaseCondtions
} from './ReleaseConditionsActionFactory';

const {
  HEARINGS,
  JUDGES,
  OUTCOMES,
  DMF_RESULTS,
  CHECKIN_APPOINTMENTS
} = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const INITIAL_STATE :Map<*, *> = fromJS({
  [RELEASE_COND.SELECTED_HEARING]: Map(),
  [RELEASE_COND.HAS_OUTCOME]: false,
  [RELEASE_COND.HEARING_NEIGHBORS]: Map(),
  [RELEASE_COND.PERSON_NEIGHBORS]: Map(),
  [RELEASE_COND.PSA_NEIGHBORS]: Map(),
  [RELEASE_COND.LOADING_RELEASE_CONDITIONS]: false,
  [RELEASE_COND.REFRESHING_RELEASE_CONDITIONS]: false,
  [RELEASE_COND.REFRESHING_SELECTED_HEARING]: false,
  [RELEASE_COND.SUBMITTING_RELEASE_CONDITIONS]: false,
});

export default function releaseConditionsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
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

    case submitReleaseConditions.case(action.type): {
      return submitReleaseConditions.reducer(state, action, {
        REQUEST: () => state.set(RELEASE_COND.SUBMITTING_RELEASE_CONDITIONS, true),
        SUCCESS: () => {
          const {
            hearing,
            hearingNeighborsByAppTypeFqn
          } = action.value;
          const outcomeEntity = hearingNeighborsByAppTypeFqn.get(OUTCOMES, Map());

          const hasOutcome = !!(outcomeEntity.size);

          return state
            .set(RELEASE_COND.SELECTED_HEARING, hearing)
            .set(RELEASE_COND.HAS_OUTCOME, hasOutcome)
            .set(RELEASE_COND.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(RELEASE_COND.SUBMITTING_RELEASE_CONDITIONS, false),
      });
    }

    case deleteEntity.case(action.type): {
      return deleteEntity.reducer(state, action, {
        SUCCESS: () => {
          const { entityKeyId } = action.value;

          const hearingCheckInAppointments = state.getIn([RELEASE_COND.HEARING_NEIGHBORS, CHECKIN_APPOINTMENTS], List())
            .filter((checkInAppointment) => {
              const {
                [PROPERTY_TYPES.ENTITY_KEY_ID]: checkInAppoiontmentsEntityKeyId
              } = getEntityProperties(checkInAppointment, [PROPERTY_TYPES.ENTITY_KEY_ID]);
              return entityKeyId !== checkInAppoiontmentsEntityKeyId;
            });
          const personCheckInAppointments = state.getIn([RELEASE_COND.PERSON_NEIGHBORS, CHECKIN_APPOINTMENTS], List())
            .filter((checkInAppointment) => {
              const {
                [PROPERTY_TYPES.ENTITY_KEY_ID]: checkInAppoiontmentsEntityKeyId
              } = getEntityProperties(checkInAppointment, [PROPERTY_TYPES.ENTITY_KEY_ID]);
              return entityKeyId !== checkInAppoiontmentsEntityKeyId;
            });

          return state
            .setIn([RELEASE_COND.HEARING_NEIGHBORS, CHECKIN_APPOINTMENTS], hearingCheckInAppointments)
            .setIn([RELEASE_COND.PERSON_NEIGHBORS, CHECKIN_APPOINTMENTS], personCheckInAppointments);
        }
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        REQUEST: () => state.set(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS, true),
        SUCCESS: () => {
          const {
            hearing,
            hearingNeighborsByAppTypeFqn
          } = action.value;
          const outcomeEntity = hearingNeighborsByAppTypeFqn.get(OUTCOMES, Map());

          return state
            .set(RELEASE_COND.SELECTED_HEARING, hearing)
            .set(RELEASE_COND.HAS_OUTCOME, !!outcomeEntity.size)
            .set(RELEASE_COND.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        },
        FINALLY: () => state.set(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS, false),
      });
    }

    case refreshPSANeighbors.case(action.type): {
      return refreshPSANeighbors.reducer(state, action, {
        REQUEST: () => state.set(RELEASE_COND.REFRESHING_SELECTED_HEARING, true),
        SUCCESS: () => {
          const { neighbors } = action.value;

          let selectedHearing = state.get(RELEASE_COND.SELECTED_HEARING, Map());
          const selectedHearingEntityKeyId = selectedHearing.getIn([OPENLATTICE_ID_FQN, 0], '');
          neighbors.get(HEARINGS).forEach((hearing) => {
            const hearingEntityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
            if (hearingEntityKeyId === selectedHearingEntityKeyId) {
              selectedHearing = hearing;
            }
          });

          return state.set(RELEASE_COND.SELECTED_HEARING, selectedHearing);
        },
        FINALLY: () => state.set(RELEASE_COND.REFRESHING_SELECTED_HEARING, false),
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

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const selectedHearingNeighbors = state.set(RELEASE_COND.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);

          return state
            .set(RELEASE_COND.SELECTED_HEARING, hearing)
            .set(RELEASE_COND.HEARING_NEIGHBORS, selectedHearingNeighbors);
        },
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingJudge } = action.value;
          const selectedHearingNeighbors = state.get(RELEASE_COND.HEARING_NEIGHBORS, Map())
            .set(JUDGES, hearingJudge);

          return state
            .set(RELEASE_COND.SELECTED_HEARING, hearing)
            .set(RELEASE_COND.HEARING_NEIGHBORS, selectedHearingNeighbors);
        },
      });
    }


    default:
      return state;
  }
}
