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
import { changePSAStatus } from '../review/ReviewActionFactory';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;
const INITIAL_STATE = Immutable.fromJS({
  peopleResults: Immutable.List(),
  selectedPersonData: Immutable.Map(),
  selectedPersonEntityKeyId: '',
  isFetchingPeople: false,
  isFetchingPersonData: false,
  peopleNeighbors: Immutable.Map()
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          const personId = state.getIn(['selectedPersonData', 'nc.SubjectIdentification', 0], '');
          const neighbors = state.getIn(['peopleNeighbors', personId, ENTITY_SETS.PSA_SCORES], Immutable.Map());
          const nextNeighbors = Immutable.fromJS(neighbors).map((neighborObj) => {
            const neighborId = neighborObj.getIn(['neighborDetails', OPENLATTICE_ID_FQN, 0]);
            if (neighborId === action.value.id) {
              const newObject = neighborObj.set('neighborDetails', Immutable.fromJS(action.value.entity));
              return newObject;
            }
            return neighborObj;
          });
          console.log(nextNeighbors);
          return state.setIn(['peopleNeighbors', personId, ENTITY_SETS.PSA_SCORES], nextNeighbors);
        }
      });
    }
    case getPeople.case(action.type): {
      return getPeople.reducer(state, action, {
        REQUEST: () => state.set('isFetchingPeople', true),
        SUCCESS: () => state.set('peopleResults', Immutable.fromJS(action.value)),
        FAILURE: () => state.set('peopleResults', Immutable.List()),
        FINALLY: () => state.set('isFetchingPeople', false)
      });
    }
    case getPersonData.case(action.type): {
      return getPersonData.reducer(state, action, {
        REQUEST: () => state.set('isFetchingPersonData', true),
        SUCCESS: () => state
          .set('selectedPersonData', Immutable.fromJS(action.value.person)
            .set('selectedPersonEntityKeyId', action.value.entityKeyId)),
        FAILURE: () => state.set('selectedPersonData', Immutable.Map()),
        FINALLY: () => state.set('isFetchingPersonData', false)
      });
    }

    case getPersonNeighbors.case(action.type): {
      return getPersonNeighbors.reducer(state, action, {
        REQUEST: () => state.setIn(['peopleNeighbors', action.personId], Immutable.Map()),
        FAILURE: () => state.setIn(['peopleNeighbors', action.personId], Immutable.Map()),
        SUCCESS: () => {
          const { personId, neighbors } = action.value;
          let neighborsByEntitySet = Immutable.Map();
          Immutable.fromJS(neighbors).forEach((neighborObj) => {
            const entitySetName = neighborObj.getIn(['neighborEntitySet', 'name'], '');
            neighborsByEntitySet = neighborsByEntitySet.set(
              entitySetName,
              neighborsByEntitySet.get(entitySetName, Immutable.List()).push(neighborObj)
            );
          });
          return state.setIn(['peopleNeighbors', personId], neighborsByEntitySet);
        }
      });
    }

    default:
      return state;
  }
}
