import Immutable from 'immutable';
import {
  getPeople,
  getPersonData
} from './PeopleActionFactory';

const INITIAL_STATE = Immutable.fromJS({
  peopleResults: Immutable.List(),
  selectedPersonData: Immutable.Map(),
  isFetchingPeople: false,
  isFetchingPersonData: false
});

export default function peopleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {

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
        SUCCESS: () => state.set('selectedPersonData', Immutable.fromJS(action.value)),
        FAILURE: () => state.set('selectedPersonData', Immutable.Map()),
        FINALLY: () => state.set('isFetchingPersonData', false)
      });
    }
    default:
      return state;
  }
}
