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
        REQUEST: () => {
          return state.set('isFetchingPeople', true);
        },
        SUCCESS: () => {
          return state.set('peopleResults', Immutable.fromJS(action.value));
        },
        FAILURE: () => {
          return state.set('peopleResults', Immutable.List());
        },
        FINALLY: () => {
          return state.set('isFetchingPeople', false);
        }
      });
    }
    case getPersonData.case(action.type): {
      return getPersonData.reducer(state, action, {
        REQUEST: () => {
          return state.set('isFetchingPersonData', true);
        },
        SUCCESS: () => {
          return state.set('selectedPersonData', Immutable.fromJS(action.value));
        },
        FAILURE: () => {
          return state.set('selectedPersonData', Immutable.Map());
        },
        FINALLY: () => {
          return state.set('isFetchingPersonData', false);
        }
      });
    }
    default:
      return state;
  }
}
