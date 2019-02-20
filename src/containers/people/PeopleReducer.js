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

import { getEntityKeyId } from '../../utils/DataUtils';
import { changePSAStatus, updateScoresAndRiskFactors, loadPSAData } from '../review/ReviewActionFactory';
import { refreshHearingNeighbors } from '../court/CourtActionFactory';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  CLEAR_PERSON,
  getPeople,
  getPersonData,
  getPersonNeighbors,
  loadRequiresActionPeople,
  refreshPersonNeighbors,
  updateContactInfo
} from './PeopleActionFactory';

let {
  CONTACT_INFORMATION,
  DMF_RESULTS,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
DMF_RESULTS = DMF_RESULTS.toString();
PSA_SCORES = PSA_SCORES.toString();
RELEASE_RECOMMENDATIONS = RELEASE_RECOMMENDATIONS.toString();
const peopleFqn = APP_TYPES_FQNS.PEOPLE.toString();

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
          if (requiresActionPeople.size) {
            const requiresActionPersonId = state.getIn([
              PEOPLE.PSA_NEIGHBORS_BY_ID,
              id,
              peopleFqn,
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
          }
          return state
            .setIn([PEOPLE.NEIGHBORS, personId, PSA_SCORES], nextNeighbors)
            .set(PEOPLE.REQUIRES_ACTION_NEIGHBORS, requiresActionPeopleNeighbors)
            .set(PEOPLE.MULTIPLE_PSA_PEOPLE, peopleWithMultiplePSAs)
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
            psaScoresWithNoPendingCharges
          } = action.value;
          return (
            state
              .set(PEOPLE.REQUIRES_ACTION_PEOPLE, peopleMap)
              .set(PEOPLE.REQUIRES_ACTION_SCORES, psaScoreMap)
              .set(PEOPLE.PSA_NEIGHBORS_BY_ID, psaNeighborsById)
              .set(PEOPLE.NO_PENDING_CHARGES_PSA_SCORES, psaScoresWithNoPendingCharges)
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
          const nextNeighbors = state.get(PEOPLE.MOST_RECENT_PSA_NEIGHBORS).merge(neighbors);
          return state.set(PEOPLE.MOST_RECENT_PSA_NEIGHBORS, nextNeighbors);
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

    default:
      return state;
  }
}
