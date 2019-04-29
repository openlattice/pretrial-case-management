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
import { changePSAStatus, updateScoresAndRiskFactors, loadPSAData } from '../review/ReviewActionFactory';
import { deleteEntity } from '../../utils/data/DataActionFactory';
import { refreshHearingNeighbors } from '../court/CourtActionFactory';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import {
  CLEAR_PERSON,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  loadRequiresActionPeople,
  refreshPersonNeighbors,
  updateContactInfo
} from './PeopleActionFactory';

const {
  CHECKIN_APPOINTMENTS,
  CONTACT_INFORMATION,
  DMF_RESULTS,
  HEARINGS,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS
} = APP_TYPES;

const {
  PERSON_ID
} = PROPERTY_TYPES;

const PEOPLE_FQN = APP_TYPES.PEOPLE;

const { OPENLATTICE_ID_FQN } = Constants;
const INITIAL_STATE = fromJS({
  [PEOPLE.SCORES_ENTITY_SET_ID]: '',
  [PEOPLE.RESULTS]: List(),
  [PEOPLE.PERSON_DATA]: Map(),
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
  [PEOPLE.REQUIRES_ACTION_LOADING]: false
});

export default function peopleReducer(state = INITIAL_STATE, action) {
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
    case getPeople.case(action.type): {
      return getPeople.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.FETCHING_PEOPLE, true),
        SUCCESS: () => state.set(PEOPLE.RESULTS, fromJS(action.value)),
        FAILURE: () => state.set(PEOPLE.RESULTS, List()),
        FINALLY: () => state.set(PEOPLE.FETCHING_PEOPLE, false)
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
            peopleMap,
            psaScoreMap,
            psaNeighborsById,
            psaScoresWithNoPendingCharges,
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
          );
        },
        FAILURE: () => state
          .set(PEOPLE.FETCHING_PEOPLE, false),
        FINALLY: () => state.set(PEOPLE.REQUIRES_ACTION_LOADING, false)
      });
    }

    case refreshPersonNeighbors.case(action.type): {
      return refreshPersonNeighbors.reducer(state, action, {
        REQUEST: () => state
          .setIn([PEOPLE.NEIGHBORS, action.personId], Map())
          .set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, true),
        SUCCESS: () => {
          const {
            personId,
            mostRecentPSA,
            mostRecentPSANeighborsByAppTypeFqn,
            neighbors,
            scoresEntitySetId
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
          .set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false),
        FINALLY: () => state.set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false)
      });
    }

    case refreshHearingNeighbors.case(action.type): {
      return refreshHearingNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { neighbors } = action.value;
          const personEntity = neighbors.get(PEOPLE_FQN, Map());
          const { [PERSON_ID]: personId } = getEntityProperties(personEntity, [PERSON_ID]);
          let personNeighbors = state.getIn([PEOPLE.NEIGHBORS, personId], Map());
          const hearingCheckInAppointments = neighbors.get(CHECKIN_APPOINTMENTS, List());
          const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, List());
          let nextCheckInAppointments = Set();
          hearingCheckInAppointments.concat(personCheckInAppointments)
            .forEach((checkInAppointment) => {
              nextCheckInAppointments = nextCheckInAppointments.add(checkInAppointment);
            });
          const nextNeighbors = state.get(PEOPLE.MOST_RECENT_PSA_NEIGHBORS).merge(neighbors);
          personNeighbors = personNeighbors.set(CHECKIN_APPOINTMENTS, nextCheckInAppointments);
          const nextState = state
            .set(PEOPLE.MOST_RECENT_PSA_NEIGHBORS, nextNeighbors)
            .setIn([PEOPLE.NEIGHBORS, personId], personNeighbors);
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

    case updateContactInfo.case(action.type): {
      return updateContactInfo.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, true),
        SUCCESS: () => {
          const { personId, contactInformation } = action.value;
          return state.setIn([PEOPLE.NEIGHBORS, personId, CONTACT_INFORMATION], contactInformation);
        },
        FINALLY: () => state.set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false)
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

    default:
      return state;
  }
}
