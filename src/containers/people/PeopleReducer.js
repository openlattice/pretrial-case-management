/*
 * @flow
 */
import moment from 'moment';
import { Constants } from 'lattice';
import {
  Map,
  List,
  fromJS
} from 'immutable';

import { getEntityKeyId } from '../../utils/DataUtils';
import { changePSAStatus, updateScoresAndRiskFactors, loadPSAData } from '../review/ReviewActionFactory';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  getPeople,
  getPersonData,
  getPersonNeighbors,
  refreshPersonNeighbors
} from './PeopleActionFactory';

let { PSA_SCORES } = APP_TYPES_FQNS;

PSA_SCORES = PSA_SCORES.toString();

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
  [PEOPLE.MOST_RECENT_PSA]: Map()
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
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
          return state
            .setIn([PEOPLE.NEIGHBORS, personId, PSA_SCORES], nextNeighbors)
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
            mostRecentPSA
          } = action.value;
          return (
            state.setIn([PEOPLE.NEIGHBORS, personId], neighbors)
              .set(PEOPLE.SCORES_ENTITY_SET_ID, scoresEntitySetId)
              .set(PEOPLE.MOST_RECENT_PSA, mostRecentPSA)
          );
        },
        FAILURE: () => state
          .setIn([PEOPLE.NEIGHBORS, action.personId], Map())
          .set(PEOPLE.FETCHING_PEOPLE, false),
        FINALLY: () => state.set(PEOPLE.FETCHING_PERSON_DATA, false)
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
            neighbors,
            scoresEntitySetId
          } = action.value;
          return (
            state.setIn([PEOPLE.NEIGHBORS, personId], neighbors)
              .set(PEOPLE.SCORES_ENTITY_SET_ID, scoresEntitySetId)
              .set(PEOPLE.MOST_RECENT_PSA, mostRecentPSA)
          );
        },
        FAILURE: () => state
          .setIn([PEOPLE.NEIGHBORS, action.personId], Map())
          .set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false),
        FINALLY: () => state.set(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false)
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          let mostRecentPSA = state.get(PEOPLE.MOST_RECENT_PSA, Map());
          const mostRecentPSAEntityKeyId = getEntityKeyId(mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map()));
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          const { newScoreEntity } = action.value;
          const olID = newScoreEntity[OPENLATTICE_ID_FQN][0];
          if (olID === mostRecentPSAEntityKeyId) {
            mostRecentPSA = mostRecentPSA.set(PSA_NEIGHBOR.DETAILS, fromJS(newScoreEntity));
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
            .set(PEOPLE.MOST_RECENT_PSA, mostRecentPSA);
          return newState;
        }
      });
    }

    default:
      return state;
  }
}
