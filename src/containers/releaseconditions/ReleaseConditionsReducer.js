/*
 * @flow
 */
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { deleteEntity } from '../../utils/data/DataActionFactory';
import {
  updateHearing,
  refreshHearingAndNeighbors,
  submitExistingHearing,
  submitHearing
} from '../hearings/HearingsActions';
import {
  CLEAR_RELEASE_CONDITIONS,
  loadReleaseConditions,
  submitReleaseConditions,
  updateOutcomesAndReleaseCondtions
} from './ReleaseConditionsActionFactory';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { RELEASE_COND_ACTIONS, RELEASE_COND_DATA } from '../../utils/consts/redux/ReleaseConditionsConsts';

const {
  CHECKIN_APPOINTMENTS,
  DMF_RESULTS,
  HEARINGS,
  JUDGES,
  OUTCOMES
} = APP_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS]: Map(),
    [RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS]: Map(),
    [RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS]: Map()
  },
  [RELEASE_COND_DATA.HAS_OUTCOME]: false,
  [RELEASE_COND_DATA.HEARING_NEIGHBORS]: Map(),
  [RELEASE_COND_DATA.PERSON_NEIGHBORS]: Map(),
  [RELEASE_COND_DATA.PSA_NEIGHBORS]: Map(),
  [RELEASE_COND_DATA.SELECTED_HEARING]: Map()
});

export default function releaseConditionsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_RELEASE_CONDITIONS:
      return INITIAL_STATE;

    case loadReleaseConditions.case(action.type): {
      return loadReleaseConditions.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], PENDING),
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
            .set(RELEASE_COND_DATA.SELECTED_HEARING, hearing)
            .set(RELEASE_COND_DATA.HAS_OUTCOME, hasOutcome)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .set(RELEASE_COND_DATA.PERSON_NEIGHBORS, personNeighborsByAppTypeFqn)
            .set(RELEASE_COND_DATA.PSA_NEIGHBORS, psaNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, Map())
            .set(RELEASE_COND_DATA.HAS_OUTCOME, false)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, Map())
            .set(RELEASE_COND_DATA.PERSON_NEIGHBORS, Map())
            .set(RELEASE_COND_DATA.PSA_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS], error)
            .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS, action.id])
      });
    }

    case submitReleaseConditions.case(action.type): {
      return submitReleaseConditions.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            hearing,
            hearingNeighborsByAppTypeFqn
          } = action.value;
          const outcomeEntity = hearingNeighborsByAppTypeFqn.get(OUTCOMES, Map());

          const hasOutcome = !!(outcomeEntity.size);

          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, hearing)
            .set(RELEASE_COND_DATA.HAS_OUTCOME, hasOutcome)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, Map())
            .set(RELEASE_COND_DATA.HAS_OUTCOME, false)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, Map())
            .setIn([REDUX.ERRORS, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS], error)
            .setIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS, action.id])
      });
    }

    case deleteEntity.case(action.type): {
      return deleteEntity.reducer(state, action, {
        SUCCESS: () => {
          const { entityKeyId } = action.value;

          const hearingCheckInAppointments = state.getIn(
            [RELEASE_COND_DATA.HEARING_NEIGHBORS, CHECKIN_APPOINTMENTS], List()
          )
            .filter((checkInAppointment) => {
              const {
                [ENTITY_KEY_ID]: checkInAppoiontmentsEntityKeyId
              } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID]);
              return entityKeyId !== checkInAppoiontmentsEntityKeyId;
            });
          const personCheckInAppointments = state.getIn(
            [RELEASE_COND_DATA.PERSON_NEIGHBORS, CHECKIN_APPOINTMENTS], List()
          )
            .filter((checkInAppointment) => {
              const {
                [ENTITY_KEY_ID]: checkInAppoiontmentsEntityKeyId
              } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID]);
              return entityKeyId !== checkInAppoiontmentsEntityKeyId;
            });

          return state
            .setIn([RELEASE_COND_DATA.HEARING_NEIGHBORS, CHECKIN_APPOINTMENTS], hearingCheckInAppointments)
            .setIn([RELEASE_COND_DATA.PERSON_NEIGHBORS, CHECKIN_APPOINTMENTS], personCheckInAppointments);
        }
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const {
            hearing,
            hearingNeighborsByAppTypeFqn
          } = action.value;
          const outcomeEntity = hearingNeighborsByAppTypeFqn.get(OUTCOMES, Map());

          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, hearing)
            .set(RELEASE_COND_DATA.HAS_OUTCOME, !!outcomeEntity.size)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);
        }
      });
    }

    case updateOutcomesAndReleaseCondtions.case(action.type): {
      return updateOutcomesAndReleaseCondtions.reducer(state, action, {
        REQUEST: () => state
          .setIn(
            [REDUX.ACTIONS, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS, action.id], fromJS(action)
          )
          .setIn(
            [REDUX.ACTIONS, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], PENDING
          ),
        SUCCESS: () => {
          const { hearingNeighborsByAppTypeFqn } = action.value;

          return state.set(RELEASE_COND_DATA.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .setIn(
              [REDUX.ACTIONS, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], SUCCESS
            );
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS], error)
            .setIn(
              [REDUX.ACTIONS, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS, REDUX.REQUEST_STATE], FAILURE
            );
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS, action.id])
      });
    }

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const selectedHearingNeighbors = state.set(RELEASE_COND_DATA.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn);

          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, hearing)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, selectedHearingNeighbors);
        },
      });
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn } = action.value;
          const psaNeighbors = state.get(RELEASE_COND_DATA.PSA_NEIGHBORS, Map());
          const nextPSANeighbors = psaNeighbors.set(HEARINGS, psaNeighbors.get(HEARINGS, List()).push(hearing));

          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, hearing)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, hearingNeighborsByAppTypeFqn)
            .set(RELEASE_COND_DATA.PSA_NEIGHBORS, nextPSANeighbors);
        }
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingJudge } = action.value;
          const selectedHearingNeighbors = state.get(RELEASE_COND_DATA.HEARING_NEIGHBORS, Map())
            .set(JUDGES, hearingJudge);

          return state
            .set(RELEASE_COND_DATA.SELECTED_HEARING, hearing)
            .set(RELEASE_COND_DATA.HEARING_NEIGHBORS, selectedHearingNeighbors);
        },
      });
    }


    default:
      return state;
  }
}
