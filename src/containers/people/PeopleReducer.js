/*
 * @flow
 */
import { Constants } from 'lattice';
import Immutable from 'immutable';

import {
  getPeople,
  getPersonData,
  getPersonNeighbors
} from './PeopleActionFactory';
import { changePSAStatus, updateScoresAndRiskFactors } from '../review/ReviewActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const { OPENLATTICE_ID_FQN } = Constants;
const INITIAL_STATE = Immutable.fromJS({
  [PEOPLE.SCORES_ENTITY_SET_ID]: '',
  [PEOPLE.RESULTS]: Immutable.List(),
  [PEOPLE.PERSON_DATA]: Immutable.Map(),
  [PEOPLE.PERSON_ENTITY_KEY_ID]: '',
  [PEOPLE.FETCHING_PEOPLE]: false,
  [PEOPLE.FETCHING_PERSON_DATA]: false,
  [PEOPLE.NEIGHBORS]: Immutable.Map()
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          const neighbors = state.getIn([PEOPLE.NEIGHBORS, personId, ENTITY_SETS.PSA_SCORES], Immutable.Map());
          const nextNeighbors = Immutable.fromJS(neighbors).map((neighborObj) => {
            const neighborId = neighborObj.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]);
            if (neighborId === action.value.id) {
              const newObject = neighborObj.set(PSA_NEIGHBOR.DETAILS, Immutable.fromJS(action.value.entity));
              return newObject;
            }
            return neighborObj;
          });
          return state.setIn([PEOPLE.NEIGHBORS, personId, ENTITY_SETS.PSA_SCORES], nextNeighbors);
        }
      });
    }
    case getPeople.case(action.type): {
      return getPeople.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.FETCHING_PEOPLE, true),
        SUCCESS: () => state.set(PEOPLE.RESULTS, Immutable.fromJS(action.value)),
        FAILURE: () => state.set(PEOPLE.RESULTS, Immutable.List()),
        FINALLY: () => state.set(PEOPLE.FETCHING_PEOPLE, false)
      });
    }
    case getPersonData.case(action.type): {
      return getPersonData.reducer(state, action, {
        REQUEST: () => state.set(PEOPLE.FETCHING_PERSON_DATA, true),
        SUCCESS: () => state
          .set(PEOPLE.PERSON_DATA, Immutable.fromJS(action.value.person)
            .set(PEOPLE.PERSON_ENTITY_KEY_ID, action.value.entityKeyId)),
        FAILURE: () => state.set(PEOPLE.PERSON_DATA, Immutable.Map()),
        FINALLY: () => state.set(PEOPLE.FETCHING_PERSON_DATA, false)
      });
    }

    case getPersonNeighbors.case(action.type): {
      return getPersonNeighbors.reducer(state, action, {
        REQUEST: () => state.setIn([PEOPLE.NEIGHBORS, action.personId], Immutable.Map()),
        FAILURE: () => state.setIn([PEOPLE.NEIGHBORS, action.personId], Immutable.Map()),
        SUCCESS: () => {
          let caseNums = Immutable.Set();
          const { personId, neighbors } = action.value;
          let neighborsByEntitySet = Immutable.Map();
          Immutable.fromJS(neighbors).forEach((neighborObj) => {
            const entitySetName = neighborObj.getIn([PSA_NEIGHBOR.ENTITY_SET, 'name'], '');
            neighborsByEntitySet = neighborsByEntitySet.set(
              entitySetName,
              neighborsByEntitySet.get(entitySetName, Immutable.List()).push(neighborObj)
            );
          });

          const uniqNeighborsByEntitySet = neighborsByEntitySet.set(ENTITY_SETS.PRETRIAL_CASES,
            neighborsByEntitySet.get(ENTITY_SETS.PRETRIAL_CASES, Immutable.List())
              .filter((neighbor) => {
                const caseNum = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0]);
                if (!caseNums.has(caseNum)) {
                  caseNums = caseNums.add(caseNum);
                  return true;
                }
                return false;
              }), neighborsByEntitySet);
          const scoresEntitySetId = uniqNeighborsByEntitySet.getIn(
            [ENTITY_SETS.PSA_SCORES, 0, PSA_NEIGHBOR.ENTITY_SET, 'id'],
            ''
          );
          return (
            state.setIn([PEOPLE.NEIGHBORS, personId], uniqNeighborsByEntitySet)
              .set(PEOPLE.SCORES_ENTITY_SET_ID, scoresEntitySetId)
          );
        }
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          const personId = state.getIn([PEOPLE.PERSON_DATA, PROPERTY_TYPES.PERSON_ID, 0], '');
          const { newScoreEntity } = action.value;
          const olID = newScoreEntity[OPENLATTICE_ID_FQN][0];
          const newPSAs = state.getIn([PEOPLE.NEIGHBORS, personId, ENTITY_SETS.PSA_SCORES], Immutable.Map())
            .map((psa) => {
              const psaNeighborID = psa.get(PSA_NEIGHBOR.ID);
              if (psaNeighborID === olID) {
                return psa.set(PSA_NEIGHBOR.DETAILS, Immutable.fromJS(newScoreEntity));
              }
              return psa;
            });
          const newState = state.setIn([PEOPLE.NEIGHBORS, personId, ENTITY_SETS.PSA_SCORES], newPSAs);
          return newState;
        }
      });
    }

    default:
      return state;
  }
}
