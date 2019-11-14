/*
 * @flow
 */
import { RequestStates } from 'redux-reqseq';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { getOpenPSAs } from '../../utils/PSAUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { enrollVoice, getProfile } from '../enroll/EnrollActionFactory';
import { changePSAStatus, updateScoresAndRiskFactors } from '../review/ReviewActionFactory';
import { submitContact, updateContactsBulk } from '../contactinformation/ContactInfoActions';
import { deleteEntity } from '../../utils/data/DataActionFactory';
import { subscribe, unsubscribe } from '../subscription/SubscriptionActions';
import {
  refreshHearingAndNeighbors,
  submitExistingHearing,
  submitHearing,
  updateHearing
} from '../hearings/HearingsActions';
import {
  CLEAR_PERSON,
  getPeopleNeighbors,
  getPersonData,
  getStaffEKIDs,
  loadRequiresActionPeople,
} from './PeopleActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const {
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  HEARINGS,
  PSA_SCORES,
  SUBSCRIPTION
} = APP_TYPES;

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const INITIAL_STATE = fromJS({
  [REDUX.ACTIONS]: {
    [PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PEOPLE_ACTIONS.GET_PERSON_DATA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PEOPLE_ACTIONS.GET_PERSON_NEIGHBORS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PEOPLE_ACTIONS.GET_STAFF_EKIDS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS]: Map(),
    [PEOPLE_ACTIONS.GET_PERSON_DATA]: Map(),
    [PEOPLE_ACTIONS.GET_PERSON_NEIGHBORS]: Map(),
    [PEOPLE_ACTIONS.GET_STAFF_EKIDS]: Map(),
    [PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE]: Map()
  },
  [PEOPLE_DATA.MULTIPLE_PSA_PEOPLE]: Set(),
  [PEOPLE_DATA.NO_HEARINGS_PEOPLE]: Set(),
  [PEOPLE_DATA.NO_HEARINGS_PSA_SCORES]: Set(),
  [PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE]: Set(),
  [PEOPLE_DATA.NO_PENDING_CHARGES_PSA_SCORES]: Set(),
  [PEOPLE_DATA.PEOPLE_BY_ID]: Map(),
  [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: Map(),
  [PEOPLE_DATA.PERSON_DATA]: Map(),
  [PEOPLE_DATA.VOICE_ENROLLMENT_PROGRESS]: 0,
  [PEOPLE_DATA.REQUIRES_ACTION_NEIGHBORS]: Map(),
  [PEOPLE_DATA.REQUIRES_ACTION_PEOPLE]: Map(),
  [PEOPLE_DATA.REQUIRES_ACTION_SCORES]: Map(),
  [PEOPLE_DATA.RECENT_FTA_PEOPLE]: Set(),
  [PEOPLE_DATA.RECENT_FTA_PSA_SCORES]: Set(),
  [PEOPLE_DATA.STAFF_IDS_TO_EKIDS]: Map(),
});

export default function peopleReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_PERSON: {
      return state.set(PEOPLE_DATA.PERSON_DATA, Map());
    }

    case getPeopleNeighbors.case(action.type): {
      return getPeopleNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { peopleNeighborsById } = action.value;

          const currentPeopleNeighborsById = state.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map());
          const nextPeopleNeighborsById = currentPeopleNeighborsById.merge(peopleNeighborsById);

          return state
            .set(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, nextPeopleNeighborsById)
            .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS], error)
            .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS, action.id])
      });
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          const { id, entity, personEKID } = action.value;
          const personPSAScores = state.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, PSA_SCORES], Map());
          const nextNeighbors = personPSAScores.map((psa) => {
            const { [ENTITY_KEY_ID]: psaEKID } = getEntityProperties(psa, [ENTITY_KEY_ID]);
            if (psaEKID === id) {
              const newObject = psa.set(PSA_NEIGHBOR.DETAILS, fromJS(entity));
              return newObject;
            }
            return psa;
          });

          const openPSASForPerson = getOpenPSAs(personPSAScores);

          const requiresActionPeople = state.get(PEOPLE_DATA.REQUIRES_ACTION_PEOPLE, Map());
          let peopleWithMultiplePSAs = state.get(PEOPLE_DATA.MULTIPLE_PSA_PEOPLE, Set());
          let peopleWithRecentFTAs = state.get(PEOPLE_DATA.RECENT_FTA_PEOPLE, Set());
          let psaScoresWithRecentFTAs = state.get(PEOPLE_DATA.RECENT_FTA_PSA_SCORES, Set());
          let peopleWithNoPendingCharges = state.get(PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE, Set());
          let psaScoresWithNoPendingCharges = state.get(PEOPLE_DATA.NO_PENDING_CHARGES_PSA_SCORES, Set());
          if (requiresActionPeople.size) {
            if (openPSASForPerson.size < 2) {
              peopleWithMultiplePSAs = peopleWithMultiplePSAs.delete(personEKID);
            }
            if (!openPSASForPerson.size) {
              peopleWithRecentFTAs = peopleWithRecentFTAs.delete(personEKID);
              psaScoresWithRecentFTAs = psaScoresWithRecentFTAs.delete(id);
              peopleWithNoPendingCharges = peopleWithNoPendingCharges.delete(personEKID);
              psaScoresWithNoPendingCharges = psaScoresWithNoPendingCharges.delete(id);
            }
          }
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, PSA_SCORES], nextNeighbors)
            .set(PEOPLE_DATA.MULTIPLE_PSA_PEOPLE, peopleWithMultiplePSAs)
            .set(PEOPLE_DATA.RECENT_FTA_PEOPLE, peopleWithRecentFTAs)
            .set(PEOPLE_DATA.RECENT_FTA_PSA_SCORES, psaScoresWithRecentFTAs)
            .set(PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE, peopleWithNoPendingCharges)
            .set(PEOPLE_DATA.NO_PENDING_CHARGES_PSA_SCORES, psaScoresWithNoPendingCharges);
        }
      });
    }

    case enrollVoice.case(action.type): {
      return enrollVoice.reducer(state, action, {
        SUCCESS: () => {
          const { numSubmissions } = action.value;
          return state.set(PEOPLE_DATA.VOICE_ENROLLMENT_PROGRESS, numSubmissions);
        }
      });
    }

    case getStaffEKIDs.case(action.type): {
      return getStaffEKIDs.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_STAFF_EKIDS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_STAFF_EKIDS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .set(PEOPLE_DATA.STAFF_IDS_TO_EKIDS, fromJS(action.value))
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_STAFF_EKIDS, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state
              .setIn([REDUX.ERRORS, PEOPLE_ACTIONS.GET_PERSON_DATA], 'Invalid return value')
              .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_STAFF_EKIDS, REDUX.REQUEST_STATE], FAILURE);
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, PEOPLE_ACTIONS.GET_STAFF_EKIDS], error)
            .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_STAFF_EKIDS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_STAFF_EKIDS, action.id])
      });
    }

    case getPersonData.case(action.type): {
      return getPersonData.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PERSON_DATA, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PERSON_DATA, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .set(PEOPLE_DATA.PERSON_DATA, fromJS(action.value.person))
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PERSON_DATA, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state
              .setIn([REDUX.ERRORS, PEOPLE_ACTIONS.GET_PERSON_DATA], 'Invalid return value')
              .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PERSON_DATA, REDUX.REQUEST_STATE], FAILURE);
          }
          const { error } = action.value;
          return state
            .set(PEOPLE_DATA.PERSON_DATA, Map())
            .setIn([REDUX.ERRORS, PEOPLE_ACTIONS.GET_PERSON_DATA], error)
            .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PERSON_DATA, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PEOPLE_ACTIONS.GET_PERSON_DATA, action.id])
      });
    }

    case getProfile.case(action.type): {
      return getProfile.reducer(state, action, {
        SUCCESS: () => {
          const { numSubmissions } = action.value;
          return state.set(PEOPLE_DATA.VOICE_ENROLLMENT_PROGRESS, numSubmissions);
        }
      });
    }

    case loadRequiresActionPeople.case(action.type): {
      return loadRequiresActionPeople.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            peopleNeighborsById,
            peopleWithMultipleOpenPSAs,
            peopleWithRecentFTAs,
            peopleWithNoPendingCharges,
            peopleWithPSAsWithNoHearings,
            peopleMap,
            psaScoreMap,
            psaScoresWithNoPendingCharges,
            psaScoresWithNoHearings,
            psaScoresWithRecentFTAs
          } = action.value;
          const nextPeopleNeighborsById = state.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map())
            .merge(peopleNeighborsById);
          const nextPeopleById = state.get(PEOPLE_DATA.PEOPLE_BY_ID, Map()).merge(peopleMap);
          return (
            state
              .set(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, nextPeopleNeighborsById)
              .set(PEOPLE_DATA.PEOPLE_BY_ID, nextPeopleById)
              .set(PEOPLE_DATA.REQUIRES_ACTION_PEOPLE, peopleMap)
              .set(PEOPLE_DATA.REQUIRES_ACTION_SCORES, psaScoreMap)
              .set(PEOPLE_DATA.NO_PENDING_CHARGES_PSA_SCORES, psaScoresWithNoPendingCharges)
              .set(PEOPLE_DATA.RECENT_FTA_PSA_SCORES, psaScoresWithRecentFTAs)
              .set(PEOPLE_DATA.REQUIRES_ACTION_NEIGHBORS, peopleNeighborsById)
              .set(PEOPLE_DATA.MULTIPLE_PSA_PEOPLE, peopleWithMultipleOpenPSAs)
              .set(PEOPLE_DATA.RECENT_FTA_PEOPLE, peopleWithRecentFTAs)
              .set(PEOPLE_DATA.NO_PENDING_CHARGES_PEOPLE, peopleWithNoPendingCharges)
              .set(PEOPLE_DATA.NO_HEARINGS_PEOPLE, peopleWithPSAsWithNoHearings)
              .set(PEOPLE_DATA.NO_HEARINGS_PSA_SCORES, psaScoresWithNoHearings)
              .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE, REDUX.REQUEST_STATE], SUCCESS)
          );
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE], error)
            .setIn([REDUX.ACTIONS, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PEOPLE_ACTIONS.LOAD_REQUIRES_ACTION_PEOPLE, action.id])
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, hearingNeighborsByAppTypeFqn, hearingEntityKeyId } = action.value;
          /*
           * Get personId and Neighbors
           */
          const personEntity = hearingNeighborsByAppTypeFqn.get(PEOPLE_FQN, Map());
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(personEntity, [ENTITY_KEY_ID]);
          let personNeighbors = state.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], Map());
          /*
          * Replace the hearing in the person's neighbors.
          */
          const personHearings = personNeighbors.get(HEARINGS, List());
          const nextPersonHearings = personHearings.map((personHearing) => {
            const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(personHearing, [ENTITY_KEY_ID]);
            if (entityKeyId === hearingEntityKeyId) return hearing;
            return personHearing;
          });
          personNeighbors = personNeighbors.set(HEARINGS, nextPersonHearings);
          /*
          * Grab the checkins associated to the person and the updated hearing.
          */
          const hearingCheckInAppointments = hearingNeighborsByAppTypeFqn.get(CHECKIN_APPOINTMENTS, List());
          const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, List());
          /*
           * Add all checkin apointments to one set for person neighbors
           */
          let nextCheckInAppointmentsById = Map();
          hearingCheckInAppointments.concat(personCheckInAppointments)
            .forEach((checkInAppointment) => {
              const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID]);
              nextCheckInAppointmentsById = nextCheckInAppointmentsById.set(entityKeyId, checkInAppointment);
            });
          personNeighbors = personNeighbors.set(CHECKIN_APPOINTMENTS, nextCheckInAppointmentsById.valueSeq());
          return state.setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], personNeighbors);
        }
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          const { newScoreEntity } = action.value;
          const psaScores = fromJS(newScoreEntity);
          const selectedPerson = state.get(PEOPLE_DATA.PERSON_DATA, Map());
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(selectedPerson, [ENTITY_KEY_ID]);
          const { [ENTITY_KEY_ID]: psaEKID } = getEntityProperties(psaScores, [ENTITY_KEY_ID]);
          const newPSAs = state.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, PSA_SCORES], Map())
            .map((psa) => {
              const { [ENTITY_KEY_ID]: psaNeighborEKID } = getEntityProperties(psa, [ENTITY_KEY_ID]);
              if (psaNeighborEKID === psaEKID) {
                return psa.set(PSA_NEIGHBOR.DETAILS, psaScores);
              }
              return psa;
            });
          const newState = state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, PSA_SCORES], newPSAs);
          return newState;
        }
      });
    }

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        SUCCESS: () => {
          const { personEKID, contactInfo } = action.value;
          const updatedContactInfo = state
            .getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, CONTACT_INFORMATION], List()).push(contactInfo);
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, CONTACT_INFORMATION], updatedContactInfo);
        }
      });
    }

    case updateContactsBulk.case(action.type): {
      return updateContactsBulk.reducer(state, action, {
        SUCCESS: () => {
          const { personEKID, contactInformation } = action.value;
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, CONTACT_INFORMATION], contactInformation);
        }
      });
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, personEKID } = action.value;
          const personHearings = state
            .getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, HEARINGS], List()).push(hearing);
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, HEARINGS], personHearings);
        }
      });
    }

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, personEKID } = action.value;
          const personHearings = state
            .getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, HEARINGS], List()).push(hearing);
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, HEARINGS], personHearings);
        }
      });
    }

    case subscribe.case(action.type): {
      return subscribe.reducer(state, action, {
        SUCCESS: () => {
          const { subscription } = action.value;
          const personDetails = state.get(PEOPLE_DATA.PERSON_DATA, Map());
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(personDetails, [ENTITY_KEY_ID]);
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], subscription);
        },
      });
    }

    case unsubscribe.case(action.type): {
      return unsubscribe.reducer(state, action, {
        SUCCESS: () => {
          const { subscription } = action.value;
          const personDetails = state.get(PEOPLE_DATA.PERSON_DATA, Map());
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(personDetails, [ENTITY_KEY_ID]);
          return state
            .setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], subscription);
        },
      });
    }


    case deleteEntity.case(action.type): {
      return deleteEntity.reducer(state, action, {
        SUCCESS: () => {
          const { entityKeyId } = action.value;
          const personDetails = state.get(PEOPLE_DATA.PERSON_DATA, Map());
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(personDetails, [ENTITY_KEY_ID]);
          let personNeighbors = state.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], Map());

          const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, List())
            .filter((checkInAppointment) => {
              const {
                [ENTITY_KEY_ID]: checkInAppoiontmentsEntityKeyId
              } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID]);
              return entityKeyId !== checkInAppoiontmentsEntityKeyId;
            });
          const personHearings = personNeighbors.get(HEARINGS, List())
            .filter((hearing) => {
              const {
                [ENTITY_KEY_ID]: hearingEntityKeyId
              } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
              return entityKeyId !== hearingEntityKeyId;
            });
          personNeighbors = personNeighbors
            .set(HEARINGS, personHearings)
            .set(CHECKIN_APPOINTMENTS, personCheckInAppointments);

          return state.setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], personNeighbors);
        }
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing } = action.value;
          const personDetails = state.get(PEOPLE_DATA.PERSON_DATA, Map());
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(personDetails, [ENTITY_KEY_ID]);
          const { [ENTITY_KEY_ID]: updatedHearingEKID } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          let personHearings = state.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, HEARINGS], List());
          if (hearingIsCancelled(hearing)) {
            personHearings = personHearings.filter((existingHearing) => {
              const { [ENTITY_KEY_ID]: hearingEKID } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
              return hearingEKID !== updatedHearingEKID;
            });
          }
          else {
            personHearings = personHearings.push(hearing);
          }
          return state.setIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID, HEARINGS], personHearings);
        }
      });
    }

    default:
      return state;
  }
}
