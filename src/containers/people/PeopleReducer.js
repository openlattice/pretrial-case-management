/*
 * @flow
 */
import { Constants } from 'lattice';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { editPSA } from '../psa/FormActionFactory';
import { enrollVoice, getProfile } from '../enroll/EnrollActionFactory';
import { changePSAStatus, updateScoresAndRiskFactors, loadPSAData } from '../review/ReviewActionFactory';
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
  getPeople,
  getPersonData,
  getPersonNeighbors,
  getStaffEKIDs,
  loadRequiresActionPeople,
} from './PeopleActions';

const {
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  DMF_RESULTS,
  HEARINGS,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES;

const {
  ENTITY_KEY_ID,
  PERSON_ID
} = PROPERTY_TYPES;

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const { OPENLATTICE_ID_FQN } = Constants;
const INITIAL_STATE = fromJS({
  [PEOPLE.SCORES_ENTITY_SET_ID]: '',
  [PEOPLE.RESULTS]: List(),
  [PEOPLE.PERSON_DATA]: Map(),
  [PEOPLE.VOICE_ENROLLMENT_PROGRESS]: 0,
  [PEOPLE.PERSON_ENTITY_KEY_ID]: '',
  [PEOPLE.FETCHING_PEOPLE]: false,
  [PEOPLE.FETCHING_PERSON_DATA]: false,
  [PEOPLE.NEIGHBORS]: Map(),
  [PEOPLE.REFRESHING_PERSON_NEIGHBORS]: false,
  [PEOPLE.MOST_RECENT_PSA]: Map(),
  [PEOPLE.MOST_RECENT_PSA_NEIGHBORS]: Map(),
  [PEOPLE.REQUIRES_ACTION_PEOPLE]: Map(),
  [PEOPLE.REQUIRES_ACTION_SCORES]: Map(),
  [PEOPLE.PSA_NEIGHBORS_BY_ID]: Map(),
  [PEOPLE.NO_PENDING_CHARGES_PSA_SCORES]: Set(),
  [PEOPLE.RECENT_FTA_PSA_SCORES]: Set(),
  [PEOPLE.REQUIRES_ACTION_NEIGHBORS]: Map(),
  [PEOPLE.MULTIPLE_PSA_PEOPLE]: Set(),
  [PEOPLE.RECENT_FTA_PEOPLE]: Set(),
  [PEOPLE.NO_PENDING_CHARGES_PEOPLE]: Set(),
  [PEOPLE.REQUIRES_ACTION_LOADING]: false,
  [PEOPLE.NO_HEARINGS_PEOPLE]: Set(),
  [PEOPLE.NO_HEARINGS_PSA_SCORES]: Set(),
});

export default function peopleReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case CLEAR_PERSON: {
      return INITIAL_STATE;
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          const { id, entity } = action.value;
          let mostRecentPSA = state.get(PEOPLE.MOST_RECENT_PSA, Map());
          const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
          if (id === mostRecentPSAEntityKeyId) {
            mostRecentPSA = mostRecentPSA.set(PSA_NEIGHBOR.DETAILS, fromJS(entity));
          }
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          const neighbors = state.getIn([PEOPLE.NEIGHBORS, personId, PSA_SCORES], Map());
          const nextNeighbors = fromJS(neighbors).map((neighborObj) => {
            const neighborId = neighborObj.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
            if (neighborId === id) {
              const newObject = neighborObj.set(PSA_NEIGHBOR.DETAILS, fromJS(entity));
              return newObject;
            }
            return neighborObj;
          });

          const requiresActionPeople = state.get(PEOPLE.REQUIRES_ACTION_PEOPLE, Map());
          let requiresActionPeopleNeighbors = state.get(PEOPLE.REQUIRES_ACTION_NEIGHBORS, Map());
          let peopleWithMultiplePSAs = state.get(PEOPLE.MULTIPLE_PSA_PEOPLE, Set());
          let peopleWithRecentFTAs = state.get(PEOPLE.RECENT_FTA_PEOPLE, Set());
          let psaScoresWithRecentFTAs = state.get(PEOPLE.RECENT_FTA_PSA_SCORES, Set());
          let peopleWithNoPendingCharges = state.get(PEOPLE.NO_PENDING_CHARGES_PEOPLE, Set());
          let psaScoresWithNoPendingCharges = state.get(PEOPLE.NO_PENDING_CHARGES_PSA_SCORES, Set());
          if (requiresActionPeople.size) {
            const requiresActionPersonId = state.getIn([
              PEOPLE.PSA_NEIGHBORS_BY_ID,
              id,
              PEOPLE_FQN,
              PSA_NEIGHBOR.DETAILS,
              OPENLATTICE_ID_FQN,
              0
            ], '');
            const personPSAs = state.getIn([
              PEOPLE.REQUIRES_ACTION_NEIGHBORS,
              requiresActionPersonId,
              PSA_SCORES
            ], List()).filter((psa) => {
              const psaId = psa.getIn([OPENLATTICE_ID_FQN, 0], '');
              return psaId !== id;
            });
            requiresActionPeopleNeighbors = requiresActionPeopleNeighbors.setIn([
              requiresActionPersonId,
              PSA_SCORES,
              personPSAs
            ]);
            if (personPSAs.size < 2) {
              peopleWithMultiplePSAs = peopleWithMultiplePSAs.delete(requiresActionPersonId);
            }
            if (entity[PROPERTY_TYPES.STATUS][0] !== PSA_STATUSES.OPEN) {
              peopleWithRecentFTAs = peopleWithRecentFTAs.delete(requiresActionPeople);
              psaScoresWithRecentFTAs = psaScoresWithRecentFTAs.delete(id);
              peopleWithNoPendingCharges = peopleWithNoPendingCharges.delete(requiresActionPersonId);
              psaScoresWithNoPendingCharges = psaScoresWithNoPendingCharges.delete(id);
            }
          }
          return state
            .setIn([PEOPLE.NEIGHBORS, personId, PSA_SCORES], nextNeighbors)
            .set(PEOPLE.REQUIRES_ACTION_NEIGHBORS, requiresActionPeopleNeighbors)
            .set(PEOPLE.MULTIPLE_PSA_PEOPLE, peopleWithMultiplePSAs)
            .set(PEOPLE.RECENT_FTA_PEOPLE, peopleWithRecentFTAs)
            .set(PEOPLE.RECENT_FTA_PSA_SCORES, psaScoresWithRecentFTAs)
            .set(PEOPLE.NO_PENDING_CHARGES_PEOPLE, peopleWithNoPendingCharges)
            .set(PEOPLE.NO_PENDING_CHARGES_PSA_SCORES, psaScoresWithNoPendingCharges)
            .set(PEOPLE.MOST_RECENT_PSA, mostRecentPSA);
        }
      });
    }

    case editPSA.case(action.type): {
      return editPSA.reducer(state, action, {
        SUCCESS: () => {
          const { psaEKID, staffNeighbors } = action.value;
          let psaNeighbors = state.get(PEOPLE.PSA_NEIGHBORS_BY_ID, Map());
          psaNeighbors = psaNeighbors.setIn([psaEKID, STAFF], staffNeighbors);
          return state.set(PEOPLE.PSA_NEIGHBORS, psaNeighbors);
        }
      });
    }

    case enrollVoice.case(action.type): {
      return enrollVoice.reducer(state, action, {
        SUCCESS: () => {
          const { numSubmissions } = action.value;
          return state.set(PEOPLE.VOICE_ENROLLMENT_PROGRESS, numSubmissions);
        }
      });
    }

    case getPeople.case(action.type): {
      return getPeople.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.FETCHING_PEOPLE, true),
        SUCCESS: () => state.set(PEOPLE.RESULTS, fromJS(action.value)),
        FAILURE: () => state.set(PEOPLE.RESULTS, List()),
        FINALLY: () => state.set(PEOPLE.FETCHING_PEOPLE, false)
      });
    }

    case getStaffEKIDs.case(action.type): {
      return getStaffEKIDs.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.LOADING_STAFF, true),
        SUCCESS: () => state.set(PEOPLE.STAFF_IDS_TO_EKIDS, fromJS(action.value)),
        FAILURE: () => state.set(PEOPLE.ERROR, action.value),
        FINALLY: () => state.set(PEOPLE.LOADING_STAFF, false)
      });
    }

    case getPersonData.case(action.type): {
      return getPersonData.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.FETCHING_PERSON_DATA, true),
        SUCCESS: () => state
          .set(PEOPLE.PERSON_DATA, fromJS(action.value.person)
            .set(PEOPLE.PERSON_ENTITY_KEY_ID, action.value.entityKeyId)),
        FAILURE: () => state.set(PEOPLE.PERSON_DATA, Map())
      });
    }

    case getProfile.case(action.type): {
      return getProfile.reducer(state, action, {
        SUCCESS: () => {
          const { numSubmissions } = action.value;
          return state.set(PEOPLE.VOICE_ENROLLMENT_PROGRESS, numSubmissions);
        }
      });
    }

    case loadPSAData.case(action.type): {
      return loadPSAData.reducer(state, action, {
        FINALLY: () => state.set(PEOPLE.FETCHING_PERSON_DATA, false)
      });
    }

    case getPersonNeighbors.case(action.type): {
      return getPersonNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([PEOPLE.NEIGHBORS, action.personId], Map())
          .set(PEOPLE.FETCHING_PEOPLE, true),
        SUCCESS: () => {
          const {
            personId,
            neighbors,
            scoresEntitySetId,
            mostRecentPSA,
            mostRecentPSANeighborsByAppTypeFqn
          } = action.value;
          return (
            state.setIn([PEOPLE.NEIGHBORS, personId], neighbors)
              .set(PEOPLE.SCORES_ENTITY_SET_ID, scoresEntitySetId)
              .set(PEOPLE.MOST_RECENT_PSA, mostRecentPSA)
              .set(PEOPLE.MOST_RECENT_PSA_NEIGHBORS, mostRecentPSANeighborsByAppTypeFqn)
          );
        },
        FAILURE: () => state
          .setIn([PEOPLE.NEIGHBORS, action.personId], Map())
          .set(PEOPLE.FETCHING_PEOPLE, false),
        FINALLY: () => state.set(PEOPLE.FETCHING_PERSON_DATA, false)
      });
    }

    case loadRequiresActionPeople.case(action.type): {
      return loadRequiresActionPeople.reducer(state, action, {
        REQUEST: () => state
          .set(PEOPLE.REQUIRES_ACTION_LOADING, true)
          .set(PEOPLE.REQUIRES_ACTION_PEOPLE, Map())
          .set(PEOPLE.REQUIRES_ACTION_SCORES, Map())
          .set(PEOPLE.REQUIRES_ACTION_NEIGHBORS, Map()),
        SUCCESS: () => {
          const {
            peopleNeighborsById,
            peopleWithMultipleOpenPSAs,
            peopleWithRecentFTAs,
            peopleWithNoPendingCharges,
            peopleWithPSAsWithNoHearings,
            peopleMap,
            psaScoreMap,
            psaNeighborsById,
            psaScoresWithNoPendingCharges,
            psaScoresWithNoHearings,
            psaScoresWithRecentFTAs
          } = action.value;
          return (
            state
              .set(PEOPLE.REQUIRES_ACTION_PEOPLE, peopleMap)
              .set(PEOPLE.REQUIRES_ACTION_SCORES, psaScoreMap)
              .set(PEOPLE.PSA_NEIGHBORS_BY_ID, psaNeighborsById)
              .set(PEOPLE.NO_PENDING_CHARGES_PSA_SCORES, psaScoresWithNoPendingCharges)
              .set(PEOPLE.RECENT_FTA_PSA_SCORES, psaScoresWithRecentFTAs)
              .set(PEOPLE.REQUIRES_ACTION_NEIGHBORS, peopleNeighborsById)
              .set(PEOPLE.MULTIPLE_PSA_PEOPLE, peopleWithMultipleOpenPSAs)
              .set(PEOPLE.RECENT_FTA_PEOPLE, peopleWithRecentFTAs)
              .set(PEOPLE.NO_PENDING_CHARGES_PEOPLE, peopleWithNoPendingCharges)
              .set(PEOPLE.NO_HEARINGS_PEOPLE, peopleWithPSAsWithNoHearings)
              .set(PEOPLE.NO_HEARINGS_PSA_SCORES, psaScoresWithNoHearings)
          );
        },
        FAILURE: () => state
          .set(PEOPLE.FETCHING_PEOPLE, false),
        FINALLY: () => state.set(PEOPLE.REQUIRES_ACTION_LOADING, false)
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        SUCCESS: () => {
          let nextState = state;
          const { hearing, hearingNeighborsByAppTypeFqn, hearingEntityKeyId } = action.value;
          /*
           * Get personId and Neighbors
           */
          const personEntity = hearingNeighborsByAppTypeFqn.get(PEOPLE_FQN, Map());
          const { [PERSON_ID]: personId } = getEntityProperties(personEntity, [PERSON_ID]);
          let personNeighbors = state.getIn([PEOPLE.NEIGHBORS, personId], Map());
          /*
          * Replace the hearing in the person's neighbors.
          */
          const personHearings = personNeighbors.get(HEARINGS, List());
          const nextPersonHearings = personHearings.map((personHearing) => {
            const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(personHearing, [ENTITY_KEY_ID]);
            if (entityKeyId === hearingEntityKeyId) return hearing;
            return personHearing;
          });
          /*
          * Grab the checkins associated to the person and the updated hearing.
          */
          const hearingCheckInAppointments = hearingNeighborsByAppTypeFqn.get(CHECKIN_APPOINTMENTS, List());
          const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, List());
          /*
           * Get most recent PSA's neighbors and determine whether the hearing being updated is associated with it,
           * and if so, replace check-in appointments and hearings with updated lists.
           */
          const mostRecentPSANeighbors = state.get(PEOPLE.MOST_RECENT_PSA_NEIGHBORS);
          const isAssociatedWithMostRecentPSA = mostRecentPSANeighbors.get(HEARINGS, List()).some((psaHearing) => {
            const { [ENTITY_KEY_ID]: recentHearingEntityKeyId } = getEntityProperties(psaHearing, [ENTITY_KEY_ID]);
            return recentHearingEntityKeyId === hearingEntityKeyId;
          });
          if (isAssociatedWithMostRecentPSA) {
            const mostRecentPSAHearings = mostRecentPSANeighbors.get(HEARINGS, List());
            let mostRecentCheckInAppointments = Set.of(mostRecentPSANeighbors.get(CHECKIN_APPOINTMENTS, List()));
            hearingCheckInAppointments.forEach((checkInAppointment) => {
              mostRecentCheckInAppointments = mostRecentCheckInAppointments.add(checkInAppointment);
            });
            const nextRecentPSAHearings = mostRecentPSAHearings.map((psaHearing) => {
              const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(psaHearing, [ENTITY_KEY_ID]);
              if (entityKeyId === hearingEntityKeyId) return hearing;
              return psaHearing;
            });
            personNeighbors = personNeighbors.set(HEARINGS, nextPersonHearings);
            nextState = nextState
              .setIn(
                [PEOPLE.MOST_RECENT_PSA_NEIGHBORS, CHECKIN_APPOINTMENTS],
                mostRecentCheckInAppointments
              )
              .setIn(
                [PEOPLE.MOST_RECENT_PSA_NEIGHBORS, HEARINGS],
                nextRecentPSAHearings
              );
          }
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
          nextState = nextState.setIn([PEOPLE.NEIGHBORS, personId], personNeighbors);
          return nextState;
        }
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          const {
            newScoreEntity,
            newDMFEntity,
            newNotesEntity
          } = action.value;
          let mostRecentPSA = state.get(PEOPLE.MOST_RECENT_PSA, Map());
          let mostRecentPSANeighbors = state.get(PEOPLE.MOST_RECENT_PSA_NEIGHBORS, Map());
          const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          const olID = newScoreEntity[OPENLATTICE_ID_FQN][0];
          if (olID === mostRecentPSAEntityKeyId) {
            mostRecentPSA = mostRecentPSA.set(PSA_NEIGHBOR.DETAILS, fromJS(newScoreEntity));
            mostRecentPSANeighbors = mostRecentPSANeighbors
              .setIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], fromJS(newDMFEntity))
              .setIn([RELEASE_RECOMMENDATIONS, PSA_NEIGHBOR.DETAILS], fromJS(newNotesEntity));
          }

          const newPSAs = state.getIn([PEOPLE.NEIGHBORS, personId, PSA_SCORES], Map())
            .map((psa) => {
              const psaNeighborID = psa.get(PSA_NEIGHBOR.ID);
              if (psaNeighborID === olID) {
                return psa.set(PSA_NEIGHBOR.DETAILS, fromJS(newScoreEntity));
              }
              return psa;
            });
          const newState = state
            .setIn([PEOPLE.NEIGHBORS, personId, PSA_SCORES], newPSAs)
            .set(PEOPLE.MOST_RECENT_PSA, mostRecentPSA)
            .set(PEOPLE.MOST_RECENT_PSA_NEIGHBORS, mostRecentPSANeighbors);
          return newState;
        }
      });
    }

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        SUCCESS: () => {
          const { personEKID, contactInfo } = action.value;
          const updatedContactInfo = state
            .getIn([PEOPLE.NEIGHBORS, personEKID, CONTACT_INFORMATION], List()).push(contactInfo);
          return state.setIn([PEOPLE.NEIGHBORS, personEKID, CONTACT_INFORMATION], updatedContactInfo);
        }
      });
    }

    case updateContactsBulk.case(action.type): {
      return updateContactsBulk.reducer(state, action, {
        SUCCESS: () => {
          const { personEKID, contactInformation } = action.value;
          return state.setIn([PEOPLE.NEIGHBORS, personEKID, CONTACT_INFORMATION], contactInformation);
        }
      });
    }

    case submitExistingHearing.case(action.type): {
      return submitExistingHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, personEKID } = action.value;
          const personHearings = state.getIn([PEOPLE.NEIGHBORS, personEKID, HEARINGS], List()).push(hearing);
          return state.setIn([PEOPLE.NEIGHBORS, personEKID, HEARINGS], personHearings);
        }
      });
    }

    case submitHearing.case(action.type): {
      return submitHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing, personEKID } = action.value;
          const personHearings = state.getIn([PEOPLE.NEIGHBORS, personEKID, HEARINGS], List()).push(hearing);
          return state.setIn([PEOPLE.NEIGHBORS, personEKID, HEARINGS], personHearings);
        }
      });
    }

    case subscribe.case(action.type): {
      return subscribe.reducer(state, action, {
        SUCCESS: () => {
          const { subscription } = action.value;
          const personDetails = state.get(PEOPLE.PERSON_DATA, Map());
          const { [PERSON_ID]: personID } = getEntityProperties(personDetails, [PERSON_ID]);
          return state.setIn([PEOPLE.NEIGHBORS, personID, SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], subscription);
        },
      });
    }

    case unsubscribe.case(action.type): {
      return unsubscribe.reducer(state, action, {
        SUCCESS: () => {
          const { subscription } = action.value;
          const personDetails = state.get(PEOPLE.PERSON_DATA, Map());
          const { [PERSON_ID]: personID } = getEntityProperties(personDetails, [PERSON_ID]);
          return state.setIn([PEOPLE.NEIGHBORS, personID, SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], subscription);
        },
      });
    }


    case deleteEntity.case(action.type): {
      return deleteEntity.reducer(state, action, {
        SUCCESS: () => {
          const { entityKeyId } = action.value;
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          let personNeighbors = state.getIn([PEOPLE.NEIGHBORS, personId], Map());

          const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, List())
            .filter((checkInAppointment) => {
              const {
                [PROPERTY_TYPES.ENTITY_KEY_ID]: checkInAppoiontmentsEntityKeyId
              } = getEntityProperties(checkInAppointment, [PROPERTY_TYPES.ENTITY_KEY_ID]);
              return entityKeyId !== checkInAppoiontmentsEntityKeyId;
            });
          const personHearings = personNeighbors.get(HEARINGS, List())
            .filter((hearing) => {
              const {
                [PROPERTY_TYPES.ENTITY_KEY_ID]: hearingEntityKeyId
              } = getEntityProperties(hearing, [PROPERTY_TYPES.ENTITY_KEY_ID]);
              return entityKeyId !== hearingEntityKeyId;
            });
          personNeighbors = personNeighbors
            .set(HEARINGS, personHearings)
            .set(CHECKIN_APPOINTMENTS, personCheckInAppointments);

          return state.setIn([PEOPLE.NEIGHBORS, personId], personNeighbors);
        }
      });
    }

    case updateHearing.case(action.type): {
      return updateHearing.reducer(state, action, {
        SUCCESS: () => {
          const { hearing } = action.value;
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          const { [ENTITY_KEY_ID]: updatedHearingEKID } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
          let personHearings = state.getIn([PEOPLE.NEIGHBORS, personId, HEARINGS], List());
          if (hearingIsCancelled(hearing)) {
            personHearings = personHearings.filter((existingHearing) => {
              const { [ENTITY_KEY_ID]: hearingEKID } = getEntityProperties(existingHearing, [ENTITY_KEY_ID]);
              return hearingEKID !== updatedHearingEKID;
            });
          }
          else {
            personHearings = personHearings.push(hearing);
          }
          return state.setIn([PEOPLE.NEIGHBORS, personId, HEARINGS], personHearings);
        }
      });
    }

    default:
      return state;
  }
}
